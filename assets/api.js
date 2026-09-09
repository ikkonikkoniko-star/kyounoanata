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

var RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    color_name: { type: 'string', enum: [] },   /* 起動時に24色で埋める */
    message: { type: 'string' },
    tops: { type: 'string' },
    item: { type: 'string' },
    accessory: { type: 'string' },
    meaning: { type: 'string' }
  },
  required: ['color_name', 'message', 'tops', 'item', 'accessory', 'meaning'],
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

function buildPrompt(version, feeling) {
  var names = KI.PALETTE.map(function (c) { return c.name; }).join('、');
  var slots = version.slots;
  return [
    'あなたは色彩心理にくわしいスタイリストです。',
    '「今日はどんな自分でいたいか」という気持ちに対して、そう見せてくれる色を1つだけ提案します。',
    '',
    '【今日の気持ち】' + feeling,
    '',
    '【色の選択肢】次の24色からちょうど1つを選び、色名は一字一句このまま使ってください。',
    names,
    '',
    '【口調】' + version.tone,
    '',
    '【出力】次のキーだけを持つJSONオブジェクトをそのまま返してください。前後に説明文やコードブロックは付けないこと。',
    '{',
    '  "color_name": "24色から選んだ色名",',
    '  "message": "気持ちに寄り添う一言。40〜60字程度。",',
    '  "meaning": "その色が心理的に持つ意味。40〜70字程度。",',
    '  "tops": "' + slots[0].label + 'にその色を取り入れる具体案。60〜90字程度。",',
    '  "item": "' + slots[1].label + 'にその色を取り入れる具体案。60〜90字程度。",',
    '  "accessory": "' + slots[2].label + 'にその色を取り入れる具体案。60〜90字程度。"',
    '}',
    '',
    '提案は「何を・どこに・どのくらいの面積で」が想像できる具体的なものにしてください。',
    '色名そのものを言い換えたり、24色にない色を持ち出したりしないでください。'
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
KI.askClaude = function (version, feeling) {
  var apiKey = KI.getApiKey();
  if (!apiKey) return Promise.reject(new Error('no-api-key'));

  var body = {
    model: KI.MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: buildPrompt(version, feeling) }]
  };

  if (STRUCTURED_OUTPUT_MODELS.indexOf(KI.MODEL) !== -1) {
    var schema = JSON.parse(JSON.stringify(RESPONSE_SCHEMA));
    schema.properties.color_name.enum = KI.PALETTE.map(function (c) { return c.name; });
    body.output_config = { format: { type: 'json_schema', schema: schema } };
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

    /* 色名はローカルパレットで引き直し、hex は必ずパレット側の値を使う */
    var color = KI.findColorByName(parsed.color_name) || KI.matchColor(feeling);

    return {
      source: 'api',
      color: color,
      message: parsed.message || '',
      meaning: parsed.meaning || color.meaning,
      tops: parsed.tops || '',
      item: parsed.item || '',
      accessory: parsed.accessory || ''
    };
  });
};

/* API を使わずローカル辞書だけで結果を作る */
KI.askLocal = function (version, feeling) {
  var color = KI.matchColor(feeling);
  var f = version.fallback(color);
  return {
    source: 'local',
    color: color,
    message: f.message,
    meaning: color.meaning,
    tops: f.tops,
    item: f.item,
    accessory: f.accessory
  };
};
