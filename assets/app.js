/* 画面の組み立てと操作
 * 3Ver（個人／ビジネス／キッズ）で共通のPOPな見た目をここで作り、
 * 差分は versions.js の設定から流し込む。
 * 文章はすべて固定なので、外に問い合わせるものはなく、押した瞬間に結果が出る。
 */
window.KI = window.KI || {};

/* 横長のときは左にイラスト・右に結果で並ぶが、スマホでは縦に積まれる。
 * 積まれているかどうかで、結果を出したあとのスクロール先を変える。 */
function isStacked() {
  return window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
}

/* ロゴのうち「KOKO」だけ見た目を変える。色づけは style.css 側。 */
var LOGO_TEXT = 'きょうのKOKOいろ';
var LOGO_MARK = [4, 5, 6, 7];

/* チップの並びは画面を開くたびに変える。
 * 並び順が固定だと、いつも上のほうにある同じ気持ちを押してしまい、
 * 毎日同じ色になってしまう。どの気持ちがどの色になるかは変えない。 */
function shuffled(list) {
  var a = list.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function buildLogo() {
  var h1 = el('h1', 'ki-logo');
  LOGO_TEXT.split('').forEach(function (ch, i) {
    var cls = 'ki-logo-char' + (LOGO_MARK.indexOf(i) !== -1 ? ' is-koko' : '');
    h1.appendChild(el('span', cls, ch));
  });
  return h1;
}

/* 締めの一文を読み上げる再生バー。
 * 吹き出しの中身は再生ボタンだけで、文章は本文のほうに残したまま。
 * 音が出せない場所で開く人がいるので、文字を消してしまわない。
 * 声のファイルが無い色では、そもそもこれを作らない（voices.js を見る）。 */
var VOICE_BARS = 26;
var VOICE_PLAY = '<svg viewBox="0 0 12 14" aria-hidden="true">' +
  '<path d="M1 1 L11 7 L1 13 Z" fill="#2b2b2b"/></svg>';
var VOICE_STOP = '<svg viewBox="0 0 12 14" aria-hidden="true">' +
  '<rect x="1.5" y="1.5" width="3.4" height="11" fill="#2b2b2b"/>' +
  '<rect x="7.1" y="1.5" width="3.4" height="11" fill="#2b2b2b"/></svg>';

function buildVoice(src, label) {
  var wrap = el('div', 'ki-say');

  var face = el('div', 'ki-say-face');
  var img = document.createElement('img');
  img.src = 'assets/face.png';
  img.alt = '';
  face.appendChild(img);
  wrap.appendChild(face);

  var bubble = el('div', 'ki-say-bubble');
  var btn = el('button', 'voice');
  btn.type = 'button';
  btn.setAttribute('aria-label', label + '　を声で聞く');

  var icon = el('span', 'voice-btn');
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = VOICE_PLAY;
  btn.appendChild(icon);

  /* 波形は見た目だけのもの。音の中身は見ていない。 */
  var wave = el('span', 'voice-wave');
  wave.setAttribute('aria-hidden', 'true');
  var bars = [];
  for (var i = 0; i < VOICE_BARS; i++) {
    var bar = document.createElement('i');
    bar.style.height = (28 + Math.round(Math.abs(Math.sin(i * 1.7)) * 52 + (i % 3) * 6)) + '%';
    wave.appendChild(bar);
    bars.push(bar);
  }
  btn.appendChild(wave);

  var time = el('span', 'voice-time', '0:00');
  btn.appendChild(time);
  bubble.appendChild(btn);
  wrap.appendChild(bubble);

  var audio = new Audio(src);
  audio.preload = 'metadata';

  function fmt(sec) {
    var s = Math.max(0, Math.round(sec || 0));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }
  function mark(ratio) {
    var on = Math.round(ratio * bars.length);
    for (var i = 0; i < bars.length; i++) {
      if (i < on) bars[i].className = 'is-on';
      else bars[i].className = '';
    }
  }
  function stop() {
    btn.className = 'voice';
    icon.innerHTML = VOICE_PLAY;
    mark(0);
    time.textContent = fmt(audio.duration);
  }

  audio.addEventListener('loadedmetadata', function () { time.textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    mark(audio.currentTime / audio.duration);
    time.textContent = fmt(audio.duration - audio.currentTime);
  });
  audio.addEventListener('ended', function () { audio.currentTime = 0; stop(); });

  btn.addEventListener('click', function () {
    if (!audio.paused) { audio.pause(); audio.currentTime = 0; stop(); return; }
    /* 鳴らせない端末もあるので、失敗しても画面が止まらないようにする */
    var p = audio.play();
    if (p && p['catch']) p['catch'](function () { stop(); });
    btn.className = 'voice is-playing';
    icon.innerHTML = VOICE_STOP;
  });

  mark(0);
  return wrap;
}

/* ときどき出る「おまけの声」の枠。
 * 色の説明とは切り離してあるので、どの色でも同じものが出る。 */
function buildOmake(cheer) {
  var box = el('div', 'ki-omake');
  box.appendChild(el('p', 'ki-omake-head', '🎁 今日はおまけつき'));
  box.appendChild(buildVoice(KI.VOICE_DIR + cheer.file, cheer.text || 'おまけの声'));
  box.appendChild(el('p', 'ki-omake-by', KI.CHEER_BY));
  return box;
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
  header.appendChild(el('p', 'ki-tagline', 'なりたい自分になる、色の力をかりよう！'));
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
  chipWrap.appendChild(el('p', 'ki-chip-label',
    version.chipHint || '気持ちにいちばん近いものを選んでください'));
  var chips = el('div', 'ki-chips');
  shuffled(KI.chipsFor(version)).forEach(function (chip) {
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
    /* 声が録れている色だけ、締めの一文の再生バーを出す */
    var voice = KI.voiceFor(versionId, color);
    if (voice) howto.appendChild(buildVoice(voice, KI.textFor(version, color).closing));
    result.appendChild(howto);

    /* ときどきだけ、おまけの声を出す */
    var cheer = KI.pickCheer(color);
    if (cheer) result.appendChild(buildOmake(cheer));

    var again = el('button', 'ki-again', 'もう一度きく');
    again.type = 'button';
    again.addEventListener('click', reset);
    result.appendChild(again);

    /* スマホでは結果に寄せるとイラストが画面の外に出てしまうので、
     * イラストの頭から見えるようにスクロールする。結果はその下に続く。 */
    if (isStacked()) {
      stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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
