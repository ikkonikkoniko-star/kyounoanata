/* Claude API 呼び出し
 *
 * ブラウザから api.anthropic.com へ直接 fetch する。
 * そのため anthropic-dangerous-direct-browser-access ヘッダが必須で、
 * APIキーはページを開いた人から見える点に注意（README を参照）。
 * 呼び出しに失敗したときは呼び出し元が colors.js のローカル辞書へフォールバックする。
 */
window.KI = window.KI || {};

/* モデルを変えたいときはここだけ書き換える。 */
KI.MODEL = 'claude-sonnet-4-6';

KI.API_URL = 'https://api.anthropic.com/v1/messages';
KI.API_VERSION = '2023-06-01';

/* 構造化出力（output_config.format）に対応しているモデル。
 * claude-sonnet-4-6 は非対応なので、その場合はプロンプトでJSONを指示して自前で取り出す。 */
var STRUCTURED_OUTPUT_MODELS = [
  'claude-fable-5-1', 'claude-fable-5', 'claude-mythos-5-1', 'claude-mythos-5',
  'claude-opus-5', 'claude-opus-4-8', 'claude-sonnet-5', 'claude-haiku-4-5'
];

/* 色も、色の意味も、締めの一文もこちらで決まっている。
 * モデルに書かせるのは「服と小物への取り入れ方」の前半だけ。 */
var RESPONSE_SCHEMA = {
  type: 'object',
  properties: { suggestion: { type: 'string' } },
  required: ['suggestion'],
  additionalProperties: false
};

KI.getApiKey = function () {
  try { return localStorage.getItem('ki-api-key') || ''; } catch (e) { return ''; }
};

KI.setApiKey = function (key) {
  try {
    if (key) localStorage.setItem('ki-api-key', key);
    else localStorage.removeItem('ki-api-key');
  } catch (e) { /* プライベートモード等では保存できない。無視して続行する。 */ }
};

/* 一言は色名から組み立てる決まり文句。モデルには作らせない。 */
KI.messageFor = function (color) {
  return 'きょうは' + color.name + 'のちからをかりてみましょう。';
};

function buildPrompt(version, feeling, color) {
  return [
    'あなたは色彩心理にくわしいスタイリストです。',
    '今日の色は決まっています。その色を身のまわりにどう取り入れるかの提案だけを書いてください。',
    '',
    '【今日の気持ち】' + feeling,
    '【今日の色】' + color.name,
    '',
    '【口調】' + version.tone,
    '',
    '【取り入れ方で想定するもの】' + version.scope,
    '',
    '【出力】次のキーだけを持つJSONオブジェクトをそのまま返してください。前後に説明文やコードブロックは付けないこと。',
    '{ "suggestion": "取り入れ方の提案。2文、70〜90字程度。" }',
    '',
    'suggestion は箇条書きにせず、ひとつづきの文章にして、次の2文で書いてください。',
    '1. 着る服に' + color.name + 'を取り入れる提案',
    '2. ハンカチなどの小物に' + color.name + 'を取り入れる提案',
    '',
    'このあとに「' + color.name + 'は' + color.meaning + '」という文が続くので、',
    '色の意味の説明はせず、取り入れ方だけを書いて、そのまま次の文につながるように終えてください。',
    'こまかい着こなし指南にはせず、気軽に試せる範囲にとどめること。',
    '色名は「' + color.name + '」とだけ書き、ほかの色を持ち出さないでください。'
  ].join('\n');
}

/* モデルが前後に文章を付けてきても JSON を取り出せるようにする */
function extractJson(text) {
  var t = String(text || '').trim();
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(t); } catch (e) { /* 下でブレース抽出を試す */ }
  var start = t.indexOf('{');
  var end = t.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(t.slice(start, end + 1)); } catch (e2) { /* 取り出せず */ }
  }
  return null;
}

/* 気持ちの文から色と提案を作る。失敗時は例外を投げるので呼び出し元でフォールバックする。 */
KI.askClaude = function (version, feeling, color) {
  var apiKey = KI.getApiKey();
  if (!apiKey) return Promise.reject(new Error('no-api-key'));

  var body = {
    model: KI.MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: buildPrompt(version, feeling, color) }]
  };

  if (STRUCTURED_OUTPUT_MODELS.indexOf(KI.MODEL) !== -1) {
    body.output_config = { format: { type: 'json_schema', schema: RESPONSE_SCHEMA } };
  }

  return fetch(KI.API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': KI.API_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(body)
  }).then(function (res) {
    return res.text().then(function (raw) {
      if (!res.ok) {
        var detail = '';
        try { detail = JSON.parse(raw).error.message; } catch (e) { detail = raw.slice(0, 200); }
        throw new Error('API ' + res.status + ': ' + detail);
      }
      return JSON.parse(raw);
    });
  }).then(function (data) {
    if (data.stop_reason === 'refusal') throw new Error('refusal');

    var text = (data.content || [])
      .filter(function (b) { return b.type === 'text'; })
      .map(function (b) { return b.text; })
      .join('');

    var parsed = extractJson(text);
    if (!parsed) throw new Error('JSONを読み取れませんでした');

    if (!parsed.suggestion) throw new Error('提案の文章が空でした');

    return {
      source: 'api',
      color: color,
      message: KI.messageFor(color),
      howto: KI.composeHowto(parsed.suggestion, color)
    };
  });
};

/* API を使わずローカル辞書だけで結果を作る */
KI.askLocal = function (version, feeling, color) {
  return {
    source: 'local',
    color: color,
    message: KI.messageFor(color),
    howto: KI.composeHowto(version.fallback(color), color)
  };
};
