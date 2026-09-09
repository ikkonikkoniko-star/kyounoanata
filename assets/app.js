/* 画面の組み立てと操作
 * 3Ver（個人／ビジネス／キッズ）で共通のPOPな見た目をここで作り、
 * 差分は versions.js の設定から流し込む。
 */
window.KI = window.KI || {};

var LOGO_COLORS = ['#E60033', '#F08300', '#F8B500', '#00A960', '#0068B7', '#884898'];
var LOGO_TILTS = [-8, 5, -4, 7, -6, 4];

function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function buildLogo() {
  var h1 = el('h1', 'ki-logo');
  var chars = 'きょうのいろ'.split('');
  chars.forEach(function (ch, i) {
    var span = el('span', 'ki-logo-char', ch);
    span.style.color = LOGO_COLORS[i % LOGO_COLORS.length];
    span.style.transform = 'rotate(' + LOGO_TILTS[i % LOGO_TILTS.length] + 'deg)';
    h1.appendChild(span);
  });
  return h1;
}

function buildNav(current) {
  var nav = el('nav', 'ki-nav');
  [
    { id: 'personal', href: 'personal.html' },
    { id: 'business', href: 'business.html' },
    { id: 'kids', href: 'kids.html' }
  ].forEach(function (v) {
    var a = el('a', 'ki-nav-link', KI.VERSIONS[v.id].label);
    a.href = v.href;
    if (v.id === current) {
      a.className += ' is-current';
      a.setAttribute('aria-current', 'page');
    }
    nav.appendChild(a);
  });
  return nav;
}

KI.init = function (versionId) {
  var version = KI.VERSIONS[versionId];
  var root = document.getElementById('app');
  document.body.classList.add('ki-ver-' + versionId);

  var header = el('header', 'ki-header');
  header.appendChild(buildNav(versionId));
  header.appendChild(buildLogo());
  header.appendChild(el('p', 'ki-tagline', 'きょうの気分を、色にしてみる。'));
  root.appendChild(header);

  var main = el('main', 'ki-main');

  /* --- 左：吹き出しとキャラクター（最初から常に見えている） --- */
  var stage = el('section', 'ki-stage');
  var bubble = el('div', 'ki-bubble', version.question);
  var figure = el('div', 'ki-figure');
  figure.innerHTML = KI.renderCharacter(null, versionId);
  stage.appendChild(bubble);
  stage.appendChild(figure);
  main.appendChild(stage);

  /* --- 右：チップと結果 --- */
  var panel = el('section', 'ki-panel');

  var chipWrap = el('div', 'ki-chip-area');
  chipWrap.appendChild(el('p', 'ki-chip-label', '気持ちにいちばん近いものを選んでください'));
  var chips = el('div', 'ki-chips');
  KI.chipsFor(version).forEach(function (chip) {
    var b = el('button', 'ki-chip', chip.label);
    b.type = 'button';
    b.addEventListener('click', function () { run(chip.label, chip.color); });
    chips.appendChild(b);
  });
  chipWrap.appendChild(chips);

  panel.appendChild(chipWrap);

  var result = el('div', 'ki-result');
  result.hidden = true;
  panel.appendChild(result);

  main.appendChild(panel);
  root.appendChild(main);
  root.appendChild(buildSettings());

  /* --- 動作 --- */

  function setLoading(on) {
    chipWrap.classList.toggle('is-busy', on);
    bubble.textContent = on ? '……いま考えています' : version.question;
    Array.prototype.forEach.call(chips.children, function (b) { b.disabled = on; });
  }

  function run(feeling, color) {
    setLoading(true);
    var done = function (data) {
      setLoading(false);
      show(feeling, data);
    };
    KI.askClaude(version, feeling, color)
      .then(done)
      .catch(function (err) {
        if (err && err.message !== 'no-api-key') {
          console.warn('Claude API を使えなかったため、決まった文章で表示します:', err.message);
        }
        done(KI.askLocal(version, feeling, color));
      });
  }

  function show(feeling, data) {
    var color = data.color;
    figure.innerHTML = KI.renderCharacter(color.hex, versionId);
    chipWrap.hidden = true;
    result.hidden = false;
    result.innerHTML = '';
    document.documentElement.style.setProperty('--ki-accent', color.hex);

    var head = el('div', 'ki-color-head');
    var swatch = el('div', 'ki-swatch');
    swatch.style.background = color.hex;
    head.appendChild(swatch);
    var names = el('div', 'ki-color-names');
    names.appendChild(el('p', 'ki-color-name', color.name));
    names.appendChild(el('p', 'ki-color-hex', color.hex.toUpperCase()));
    head.appendChild(names);
    result.appendChild(head);

    result.appendChild(el('p', 'ki-echo', '「' + feeling + '」の あなたへ'));
    result.appendChild(el('p', 'ki-message', data.message));

    var howto = el('div', 'ki-howto');
    var howtoHead = el('div', 'ki-howto-head');
    var icon = el('span', 'ki-howto-icon', version.howtoIcon);
    icon.setAttribute('aria-hidden', 'true');
    howtoHead.appendChild(icon);
    howtoHead.appendChild(el('h2', 'ki-howto-label', version.howtoLabel));
    howto.appendChild(howtoHead);
    howto.appendChild(el('p', 'ki-howto-body', data.howto));
    result.appendChild(howto);

    if (data.source === 'local') {
      result.appendChild(el('p', 'ki-badge', 'オフライン辞書で表示しています（APIキー未設定、または通信に失敗しました）'));
    }

    var again = el('button', 'ki-again', 'もう一度きく');
    again.type = 'button';
    again.addEventListener('click', reset);
    result.appendChild(again);

    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    result.hidden = true;
    result.innerHTML = '';
    chipWrap.hidden = false;
    figure.innerHTML = KI.renderCharacter(null, versionId);
    document.documentElement.style.removeProperty('--ki-accent');
    bubble.textContent = version.question;
    stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

/* APIキーの入力欄。キーはこの端末の localStorage にだけ保存する。 */
function buildSettings() {
  var box = el('details', 'ki-settings');
  var summary = el('summary', 'ki-settings-summary', 'APIキーの設定');
  box.appendChild(summary);

  var body = el('div', 'ki-settings-body');
  body.appendChild(el('p', 'ki-settings-note',
    'Claude API のキーを入れると、色と提案文を毎回 Claude が考えます。' +
    '未設定のままでも、' + KI.PALETTE.length + '色のローカル辞書で動きます。' +
    'キーはこの端末のブラウザにだけ保存されますが、ページを開いた人からは読み取れます。' +
    '公開サイトに置く場合は、キーをサーバー側で預かる構成に変えてください。'));

  var row = el('div', 'ki-settings-row');
  var input = el('input', 'ki-settings-input');
  input.type = 'password';
  input.placeholder = 'sk-ant-...';
  input.value = KI.getApiKey();
  input.setAttribute('aria-label', 'Claude API キー');
  var save = el('button', 'ki-settings-save', '保存');
  save.type = 'button';
  var status = el('span', 'ki-settings-status', KI.getApiKey() ? '設定済み' : '未設定');

  save.addEventListener('click', function () {
    KI.setApiKey(input.value.trim());
    status.textContent = input.value.trim() ? '保存しました' : '未設定';
  });

  row.appendChild(input);
  row.appendChild(save);
  row.appendChild(status);
  body.appendChild(row);
  body.appendChild(el('p', 'ki-settings-model', 'モデル: ' + KI.MODEL));
  box.appendChild(body);
  return box;
}
