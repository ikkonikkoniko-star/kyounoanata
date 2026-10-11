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

KI.buildVoiceBar = function (src, label) { return buildVoice(src, label); };

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
/* プレゼントの箱。ふたと本体を分けてあり、
 * 開けるときに CSS でふただけを飛ばす。 */
var GIFT_SVG = [
  '<svg class="ki-gift-svg" viewBox="0 0 120 112" aria-hidden="true">',
  '<g class="ki-gift-base">',
  '<rect x="16" y="48" width="88" height="56" rx="7" fill="#F2B231"',
  ' stroke="#2b2b2b" stroke-width="3"/>',
  '<rect x="52" y="48" width="16" height="56" fill="#E60033"',
  ' stroke="#2b2b2b" stroke-width="3"/>',
  '</g>',
  '<g class="ki-gift-lid">',
  '<ellipse cx="45" cy="21" rx="14" ry="11" fill="#E60033"',
  ' stroke="#2b2b2b" stroke-width="3"/>',
  '<ellipse cx="75" cy="21" rx="14" ry="11" fill="#E60033"',
  ' stroke="#2b2b2b" stroke-width="3"/>',
  '<rect x="8" y="30" width="104" height="22" rx="6" fill="#F2B231"',
  ' stroke="#2b2b2b" stroke-width="3"/>',
  '<rect x="52" y="30" width="16" height="22" fill="#E60033"',
  ' stroke="#2b2b2b" stroke-width="3"/>',
  '<circle cx="60" cy="24" r="6" fill="#E60033" stroke="#2b2b2b" stroke-width="3"/>',
  '</g>',
  '</svg>'
].join('');

/* 紙吹雪。開けたときだけ、枠の中に降らせる。
 * 見た目だけのものなので、動きを減らす設定のときは出さない。 */
var CONFETTI_COLORS = ['#E60033', '#F2B231', '#FFD900', '#00A960',
                       '#0068B7', '#EE87B4', '#884898'];

function dropConfetti(into) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sheet = el('div', 'ki-confetti');
  sheet.setAttribute('aria-hidden', 'true');
  for (var i = 0; i < 26; i++) {
    var bit = el('i');
    bit.style.left = Math.round(Math.random() * 96) + '%';
    bit.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    bit.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's';
    bit.style.animationDuration = (1.3 + Math.random() * 0.9).toFixed(2) + 's';
    /* 幅と傾きをばらして、紙がひらひらしているように見せる */
    bit.style.width = (5 + Math.round(Math.random() * 4)) + 'px';
    bit.style.height = (9 + Math.round(Math.random() * 6)) + 'px';
    sheet.appendChild(bit);
  }
  into.appendChild(sheet);
  setTimeout(function () {
    if (sheet.parentNode) sheet.parentNode.removeChild(sheet);
  }, 2600);
}

/* ときどき出る「おまけ」。
 * まず箱だけが飛び出して、押すとふたが開き、中から顔が出る。
 * そのあと、声が鳴るか、言葉が大きく出るかは cheer の中身で決まる。 */
function buildOmake(cheer) {
  var wrap = el('div', 'ki-omake');
  wrap.hidden = true;

  var head = el('p', 'ki-omake-head');
  head.appendChild(el('span', 'ki-omake-spark', '✨'));
  head.appendChild(document.createTextNode('今日はラッキーな日！'));
  wrap.appendChild(head);

  var stage = el('div', 'ki-gift-stage');
  var btn = el('button', 'ki-gift');
  btn.type = 'button';
  btn.setAttribute('aria-label', cheer.word
    ? 'プレゼントをあけてみる'
    : 'プレゼントをあけて、代表からのメッセージを聞く');

  var face = el('span', 'ki-gift-face');
  var img = document.createElement('img');
  img.src = 'assets/face.png';
  img.alt = '';
  face.appendChild(img);
  btn.appendChild(face);

  var art = el('span', 'ki-gift-art');
  art.innerHTML = GIFT_SVG;
  btn.appendChild(art);

  /* 開けたときに散る光。見た目だけのもの。 */
  ['✦', '✧', '✦'].forEach(function (mark, i) {
    btn.appendChild(el('span', 'ki-gift-star s' + (i + 1), mark));
  });

  stage.appendChild(btn);
  wrap.appendChild(stage);

  var hint = el('p', 'ki-gift-hint', 'タップしてあけてみて');
  wrap.appendChild(hint);

  var opened = el('div', 'ki-omake-open');
  opened.hidden = true;
  /* 声のあるVerは再生バー、無いVerは言葉を大きく。置き場所は同じ。 */
  var voice = null;
  if (cheer.word) {
    opened.appendChild(el('p', 'ki-omake-word', cheer.word));
  } else {
    voice = buildVoice(KI.VOICE_DIR + cheer.file, '代表からのメッセージ');
    opened.appendChild(voice);
  }
  opened.appendChild(el('p', 'ki-omake-by', KI.CHEER_BY));
  wrap.appendChild(opened);

  btn.addEventListener('click', function () {
    if (wrap.className.indexOf('is-open') !== -1) return;
    wrap.className = 'ki-omake is-in is-open';
    opened.hidden = false;
    btn.disabled = true;
    dropConfetti(wrap);
    if (voice) {
      hint.textContent = '代表からのメッセージ';
      /* 押した操作の中でそのまま鳴らす。あとから鳴らそうとすると、
       * スマホでは止められてしまうため。 */
      var play = voice.querySelector('.voice');
      if (play) play.click();
    } else {
      /* 言葉そのものが合図になるので、案内の行は消す */
      hint.hidden = true;
    }
  });

  return wrap;
}

/* 画面を動かす。ホームページに埋めこまれているときは、
 * 枠の中で動かしても見えないので、親ページに頼む（embed.js 側）。 */
function scrollTo_(el, block) {
  if (KI.scrollToEl) KI.scrollToEl(el);
  else el.scrollIntoView({ behavior: 'smooth', block: block });
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

  /* 箱が飛び出すのを待っているあいだの合図。戻るときに取り消す。 */
  var omakeTimer = null;

  function show(feeling, color) {
    clearTimeout(omakeTimer);
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

    /* ときどきだけ、おまけを出す。
     * 文章を読み終わったころに、箱が飛び出してくる。 */
    var cheer = KI.pickCheer(color, versionId);
    if (cheer) {
      var omake = buildOmake(cheer);
      result.appendChild(omake);
      omakeTimer = setTimeout(function () {
        omake.hidden = false;
        /* 次の描画で動きだすようにする */
        setTimeout(function () {
          omake.className = 'ki-omake is-in';
          /* 箱は文章の下に出るので、そのままだと画面の外にいることが多い。
           * 出たのに気づいてもらえないので、見える位置まで動かす。
           *
           * ホームページに埋めこまれているときは、枠が中身の高さぴったりに
           * なっているため、枠の中では何もかも「見えている」ことになる。
           * ここで自分で判定すると、いつも「見えている」と誤って判断して
           * 動かさなくなる。だから埋めこみのときは判定せず、親ページに任せる。 */
          var r = omake.getBoundingClientRect();
          if (KI.scrollToEl || r.bottom > window.innerHeight - 24) {
            scrollTo_(omake, 'nearest');
          }
        }, 20);
      }, KI.CHEER_DELAY);
    }

    var again = el('button', 'ki-again', version.againLabel || 'もう一度えらぶ');
    again.type = 'button';
    again.addEventListener('click', reset);
    result.appendChild(again);

    /* スマホでは結果に寄せるとイラストが画面の外に出てしまうので、
     * イラストの頭から見えるようにスクロールする。結果はその下に続く。 */
    scrollTo_(isStacked() ? stage : result, isStacked() ? 'start' : 'nearest');
  }

  function reset() {
    clearTimeout(omakeTimer);
    result.hidden = true;
    result.innerHTML = '';
    chipWrap.hidden = false;
    figure.innerHTML = KI.renderCharacter(null, versionId);
    document.documentElement.style.removeProperty('--ki-accent');
    scrollTo_(stage, 'nearest');
  }
};
