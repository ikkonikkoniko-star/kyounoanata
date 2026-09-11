/* 画面の組み立てと操作
 * 3Ver（個人／ビジネス／キッズ）で共通のPOPな見た目をここで作り、
 * 差分は versions.js の設定から流し込む。
 * 文章はすべて固定なので、外に問い合わせるものはなく、押した瞬間に結果が出る。
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
  'きょうのいろ'.split('').forEach(function (ch, i) {
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
    b.addEventListener('click', function () { show(chip.label, chip.color); });
    chips.appendChild(b);
  });
  chipWrap.appendChild(chips);
  panel.appendChild(chipWrap);

  var result = el('div', 'ki-result');
  result.hidden = true;
  panel.appendChild(result);

  main.appendChild(panel);
  root.appendChild(main);

  /* --- 動作 --- */

  function show(feeling, color) {
    var data = KI.resultFor(version, color);
    figure.innerHTML = KI.renderCharacter(color, versionId);
    chipWrap.hidden = true;
    result.hidden = false;
    result.innerHTML = '';
    document.documentElement.style.setProperty('--ki-accent', color.hex);

    var head = el('div', 'ki-color-head');
    var swatch = el('div', 'ki-swatch');
    swatch.style.background = KI.cssPaint(color, 0);
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
    stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};
