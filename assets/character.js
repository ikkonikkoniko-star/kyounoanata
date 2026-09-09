/* キャラクター描画とカラーユーティリティ
 *
 * Verごとに絵が違う。
 *   個人Ver     : 大人寄りの等身。Tシャツ＋デニム。色が変わるのはTシャツだけ。
 *                 左にハンカチ、右にバッグを単体のイラストとして置く。
 *   ビジネスVer : 個人Verと同じ等身。Tシャツ＋ジャケット。
 *                 ジャケットは濃いグレーで固定、色が変わるのは中のTシャツ。
 *                 左に腕時計、右にペン。
 *   キッズVer   : 頭の大きい丸い等身のまま。左にハンカチ、右にバッグ。
 *
 * 人物は小物を身につけない（掛けない・つけない）。小物はすべて横に置く。
 * 3つの周りには同じ色の濃淡違いの丸・四角・三角を散らして賑やかにする。
 */
window.KI = window.KI || {};

KI.hexToRgb = function (hex) {
  var h = String(hex).replace('#', '').trim();
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
};

KI.rgbToHex = function (r, g, b) {
  function p(v) {
    var s = Math.round(Math.max(0, Math.min(255, v))).toString(16);
    return s.length === 1 ? '0' + s : s;
  }
  return '#' + p(r) + p(g) + p(b);
};

/* amount > 0 で白に近づけ、< 0 で黒に近づける（-1 〜 1） */
KI.shade = function (hex, amount) {
  var c = KI.hexToRgb(hex);
  if (amount >= 0) {
    return KI.rgbToHex(
      c.r + (255 - c.r) * amount,
      c.g + (255 - c.g) * amount,
      c.b + (255 - c.b) * amount
    );
  }
  var k = 1 + amount;
  return KI.rgbToHex(c.r * k, c.g * k, c.b * k);
};

/* 背景に敷いたときに黒文字が読めるかどうか */
KI.isLight = function (hex) {
  var c = KI.hexToRgb(hex);
  return (c.r * 299 + c.g * 587 + c.b * 114) / 1000 > 165;
};

KI.textOn = function (hex) {
  return KI.isLight(hex) ? '#231815' : '#ffffff';
};

var LINE = '#2b2b2b';
var FACE = '#ffffff';
var BLANK = '#ECECEC';
var DENIM = '#4A6FA5';
var DENIM_LINE = '#31507C';
var SUIT = '#3C4048';
var SUIT_LINE = '#23262C';

/* しろ など明るすぎる色でも輪郭が消えないように少しだけ締める */
function outlineFor(hex) {
  return KI.isLight(hex) ? KI.shade(hex, -0.35) : LINE;
}

/* 色ごとに安定した擬似乱数（同じ色なら毎回同じ配置になる） */
function seededRandom(seed) {
  var s = seed >>> 0 || 1;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function decorations(hex, slots) {
  if (!hex) return '';
  var c = KI.hexToRgb(hex);
  var rnd = seededRandom(c.r * 7919 + c.g * 104729 + c.b + 1);
  var tones = [KI.shade(hex, 0.62), KI.shade(hex, 0.38), KI.shade(hex, 0.12), KI.shade(hex, -0.22)];
  var out = '';
  for (var i = 0; i < slots.length; i++) {
    var x = slots[i][0] + (rnd() * 16 - 8);
    var y = slots[i][1] + (rnd() * 16 - 8);
    var size = 8 + rnd() * 12;
    var fill = tones[Math.floor(rnd() * tones.length)];
    var kind = Math.floor(rnd() * 3);
    var rot = Math.floor(rnd() * 360);
    if (kind === 0) {
      out += '<circle class="ki-deco" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) +
             '" r="' + (size / 2).toFixed(1) + '" fill="' + fill + '"/>';
    } else if (kind === 1) {
      out += '<rect class="ki-deco" x="' + (x - size / 2).toFixed(1) + '" y="' + (y - size / 2).toFixed(1) +
             '" width="' + size.toFixed(1) + '" height="' + size.toFixed(1) + '" rx="2.5" fill="' + fill +
             '" transform="rotate(' + rot + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
    } else {
      var h = size * 0.9;
      var pts = [
        x + ',' + (y - h / 2),
        (x - size / 2) + ',' + (y + h / 2),
        (x + size / 2) + ',' + (y + h / 2)
      ].join(' ');
      out += '<polygon class="ki-deco" points="' + pts + '" fill="' + fill +
             '" transform="rotate(' + rot + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
    }
  }
  return out;
}

/* ---------------- 横に置く小物 ---------------- */

/* 左：ハンカチ（個人Ver・キッズVer） */
function handkerchief(fill, line) {
  return '<g transform="rotate(-8 54 172)">' +
    '<rect x="22" y="140" width="64" height="64" rx="10" fill="' + fill + '" stroke="' + line + '" stroke-width="3"/>' +
    '<rect x="32" y="150" width="44" height="44" rx="6" fill="none" stroke="' + line + '" stroke-width="2" stroke-dasharray="5 5"/>' +
    '</g>';
}

/* 右：バッグ（個人Ver・キッズVer） */
function bag(fill, line) {
  return '<path d="M266 158c0-28 32-28 32 0" fill="none" stroke="' + line + '" stroke-width="3.5" stroke-linecap="round"/>' +
    '<rect x="254" y="156" width="64" height="54" rx="9" fill="' + fill + '" stroke="' + line + '" stroke-width="3"/>';
}

/* 左：腕時計（ビジネスVer）。色が変わるのはベルト、文字盤は白のまま */
function watch(fill, line) {
  return '<rect x="44" y="124" width="21" height="34" rx="5" fill="' + fill + '" stroke="' + line + '" stroke-width="3"/>' +
    '<rect x="44" y="184" width="21" height="34" rx="5" fill="' + fill + '" stroke="' + line + '" stroke-width="3"/>' +
    '<rect x="75" y="165" width="7" height="12" rx="2.5" fill="' + line + '"/>' +
    '<circle cx="54" cy="171" r="22" fill="' + FACE + '" stroke="' + line + '" stroke-width="3"/>' +
    '<path d="M54 171V158M54 171l9 6" fill="none" stroke="' + line + '" stroke-width="2.5" stroke-linecap="round"/>';
}

/* 右：ペン（ビジネスVer） */
function pen(fill, line, capFill) {
  return '<g transform="rotate(18 286 172)">' +
    '<rect x="277" y="128" width="19" height="78" rx="6" fill="' + fill + '" stroke="' + line + '" stroke-width="3"/>' +
    '<path d="M277 202h19l-9.5 20z" fill="' + fill + '" stroke="' + line + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<rect x="277" y="128" width="19" height="26" rx="6" fill="' + capFill + '" stroke="' + line + '" stroke-width="3"/>' +
    '<rect x="292" y="134" width="7" height="21" rx="3" fill="' + capFill + '" stroke="' + line + '" stroke-width="2.5"/>' +
    '</g>';
}

/* ---------------- 人物 ---------------- */

/* 大人寄りの等身の、顔・首・脚。個人Verとビジネスverで共通 */
function adultHeadAndLegs(legFill, legLine) {
  return [
    /* 脚 */
    '<path d="M91 160h58v34l-5 66h-19l-5-56-5 56h-19l-5-66z" fill="' + legFill +
      '" stroke="' + legLine + '" stroke-width="3" stroke-linejoin="round"/>',
    '<path d="M91 173h58" fill="none" stroke="' + legLine + '" stroke-width="2.5"/>',
    /* 靴 */
    '<rect x="90" y="255" width="27" height="11" rx="5.5" fill="' + LINE + '"/>',
    '<rect x="123" y="255" width="27" height="11" rx="5.5" fill="' + LINE + '"/>',
    /* 首 */
    '<rect x="113" y="60" width="14" height="28" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>'
  ].join('');
}

function adultFace() {
  return [
    '<circle cx="120" cy="48" r="25" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>',
    '<path d="M102 43c6-13 30-15 36-5" fill="none" stroke="' + LINE + '" stroke-width="3" stroke-linecap="round"/>',
    '<circle cx="111" cy="49" r="2.6" fill="' + LINE + '"/>',
    '<circle cx="129" cy="49" r="2.6" fill="' + LINE + '"/>',
    '<path d="M114 58c3 4 9 4 12 0" fill="none" stroke="' + LINE + '" stroke-width="2.8" stroke-linecap="round"/>'
  ].join('');
}

var ADULT_TSHIRT = 'M120 83c-15 0-27 4-34 9l-12 27a4 4 0 0 0 2 5l11 3 4-11v44a3 3 0 0 0 3 3h52a3 3 0 0 0 3-3v-44l4 11 11-3a4 4 0 0 0 2-5l-12-27c-7-5-19-9-34-9z';

/* 頭の大きい丸い等身（キッズVer） */
function kidsFigure(tops, topsLine) {
  return [
    '<rect x="102" y="204" width="14" height="52" rx="7" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>',
    '<rect x="124" y="204" width="14" height="52" rx="7" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>',
    '<path d="M99 256h20a4 4 0 0 1 4 4v4H99z" fill="' + LINE + '"/>',
    '<path d="M121 256h20a4 4 0 0 1 4 4v4h-24z" fill="' + LINE + '"/>',
    '<path id="ki-tops" d="M120 112c-16 0-30 5-38 12l-14 34a5 5 0 0 0 3 6l12 4 5-14v56a4 4 0 0 0 4 4h56a4 4 0 0 0 4-4v-56l5 14 12-4a5 5 0 0 0 3-6l-14-34c-8-7-22-12-38-12z" fill="' + tops +
      '" stroke="' + topsLine + '" stroke-width="3" stroke-linejoin="round"/>',
    '<path d="M110 100h20v14h-20z" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>',
    '<circle cx="120" cy="66" r="42" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>',
    '<path d="M84 44c8-16 44-20 60-6" fill="none" stroke="' + LINE + '" stroke-width="3" stroke-linecap="round"/>',
    '<circle cx="106" cy="64" r="3.4" fill="' + LINE + '"/>',
    '<circle cx="134" cy="64" r="3.4" fill="' + LINE + '"/>',
    '<path d="M110 79c4 5 16 5 20 0" fill="none" stroke="' + LINE + '" stroke-width="3" stroke-linecap="round"/>'
  ].join('');
}

/* Tシャツ＋デニム（個人Ver） */
function personalFigure(tops, topsLine) {
  return adultHeadAndLegs(DENIM, DENIM_LINE) +
    '<path id="ki-tops" d="' + ADULT_TSHIRT + '" fill="' + tops +
      '" stroke="' + topsLine + '" stroke-width="3" stroke-linejoin="round"/>' +
    adultFace();
}

/* ジャケットの前腕。肩から袖口までを Tシャツと同じ肩線のまま長袖に見せる。
 * 手は袖口から少しだけ出す。 */
function jacketArm(x, cx, deg) {
  return '<g transform="rotate(' + deg + ' ' + cx + ' 138)">' +
    '<circle cx="' + cx + '" cy="160" r="7.5" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>' +
    '<rect x="' + x + '" y="112" width="17" height="46" rx="8" fill="' + SUIT +
      '" stroke="' + SUIT_LINE + '" stroke-width="3"/>' +
    '</g>';
}

/* Tシャツ＋ジャケット（ビジネスVer）。ジャケットは前を開けて中のTシャツを見せる */
function businessFigure(tops, topsLine) {
  return adultHeadAndLegs(SUIT, SUIT_LINE) +
    '<path id="ki-tops" d="' + ADULT_TSHIRT + '" fill="' + tops +
      '" stroke="' + topsLine + '" stroke-width="3" stroke-linejoin="round"/>' +
    jacketArm(74, 82.5, -4) +
    jacketArm(149, 157.5, 4) +
    '<path d="M102 85 L88 91 L74 119 L76 124 L87 127 L91 116 L91 163 L112 163 L112 112 Z" fill="' + SUIT +
      '" stroke="' + SUIT_LINE + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M138 85 L152 91 L166 119 L164 124 L153 127 L149 116 L149 163 L128 163 L128 112 Z" fill="' + SUIT +
      '" stroke="' + SUIT_LINE + '" stroke-width="3" stroke-linejoin="round"/>' +
    adultFace();
}

/* 装飾を置ける場所は絵の構成で変わる */
var DECO_SLOTS = {
  adult: [[30, 40], [95, 20], [245, 20], [312, 40], [26, 88],
          [316, 88], [34, 248], [110, 284], [232, 284], [310, 252]],
  kids:  [[26, 38], [88, 20], [252, 20], [314, 38], [20, 96],
          [320, 96], [30, 244], [108, 276], [232, 276], [312, 244]]
};

/* hex が null のときは無色（Tシャツがまだ塗られていない）状態を描く。
 * viewBox は 340x300。人物は translate(50,0) で中央に寄せ、
 * 左右の空きに小物を単体で置く。 */
KI.renderCharacter = function (hex, versionId) {
  var colored = !!hex;
  var tops = colored ? hex : BLANK;
  var right = colored ? KI.shade(hex, -0.28) : BLANK;
  var left = colored ? KI.shade(hex, 0.45) : BLANK;
  var topsLine = colored ? outlineFor(tops) : LINE;
  var rightLine = colored ? outlineFor(right) : LINE;
  var leftLine = colored ? outlineFor(left) : LINE;

  var isKids = versionId === 'kids';
  var isBusiness = versionId === 'business';

  var label = colored
    ? (isBusiness ? '選ばれた色のTシャツを着たキャラクターと、同じ色の腕時計とペン'
                  : '選ばれた色のTシャツを着たキャラクターと、同じ色のハンカチとバッグ')
    : 'まだ色のついていないキャラクターと小物';

  var figure = isKids ? kidsFigure(tops, topsLine)
             : isBusiness ? businessFigure(tops, topsLine)
             : personalFigure(tops, topsLine);

  var leftItem = isBusiness ? watch(left, leftLine) : handkerchief(left, leftLine);
  var rightItem = isBusiness ? pen(right, rightLine, colored ? KI.shade(hex, -0.5) : BLANK)
                             : bag(right, rightLine);

  return [
    '<svg class="ki-character" viewBox="0 0 340 300" role="img" aria-label="' + label + '">',
    decorations(colored ? hex : null, isKids ? DECO_SLOTS.kids : DECO_SLOTS.adult),
    leftItem,
    rightItem,
    '<g transform="translate(50 0)">',
    figure,
    '</g>',
    '</svg>'
  ].join('');
};
