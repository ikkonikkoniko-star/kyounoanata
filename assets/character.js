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

/* 塗り。sheen を持つ色（金属色）はグラデーションになる。
 * amount は shade() と同じで、濃淡をつけた状態のグラデーションを作る。 */
/* 明るい帯を中央に寄せると、のっぺりせず金属らしく光って見える。
 * sheen の色数ぶんの位置をここで決める。 */
function sheenOffsets(n) {
  if (n === 5) return [0, 33, 45, 58, 100];
  var out = [];
  for (var i = 0; i < n; i++) out.push(Math.round(i / (n - 1) * 100));
  return out;
}

KI.cssPaint = function (color, amount) {
  if (!color.sheen) return KI.shade(color.hex, amount || 0);
  var off = sheenOffsets(color.sheen.length);
  var stops = color.sheen.map(function (c, i) {
    return KI.shade(c, amount || 0) + ' ' + off[i] + '%';
  });
  return 'linear-gradient(135deg, ' + stops.join(', ') + ')';
};

/* SVG 用。定義（defs の中身）と、fill に入れる値を返す */
function svgPaint(color, amount, id) {
  if (!color || !color.sheen) {
    return { def: '', fill: color ? KI.shade(color.hex, amount || 0) : BLANK };
  }
  var off = sheenOffsets(color.sheen.length);
  var stops = color.sheen.map(function (c, i) {
    return '<stop offset="' + off[i] + '%" stop-color="' + KI.shade(c, amount || 0) + '"/>';
  }).join('');
  return {
    def: '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' + stops + '</linearGradient>',
    fill: 'url(#' + id + ')'
  };
}

var LINE = '#2b2b2b';
var FACE = '#ffffff';
var BLANK = '#ECECEC';
var DENIM = '#4A6FA5';
var DENIM_LINE = '#31507C';
var SUIT = '#3C4048';
var SUIT_LINE = '#23262C';
var HAIR = '#4A3F38';

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

/* ---------------- 横に置く小物 ----------------
 * どれも cx を中心に置けるように、基準の形を cx=54 で描いて平行移動する。 */

function at(cx, inner) {
  return '<g transform="translate(' + (cx - 54) + ' 0)">' + inner + '</g>';
}

/* ハンカチ。上向きの正方形＋破線はぞうきんに見えてしまうので、
 * ひし形に傾けて、内側にひと回り小さい縁取りを入れる。 */
function handkerchief(fill, line, cx) {
  return at(cx, '<g transform="rotate(42 54 172)">' +
    '<rect x="29" y="147" width="50" height="50" rx="7" fill="' + fill +
      '" stroke="' + line + '" stroke-width="3"/>' +
    '<rect x="38" y="156" width="32" height="32" rx="4" fill="none" stroke="' + line + '" stroke-width="1.8"/>' +
    '</g>');
}

/* 靴下。履き口の縦リブがないとブーツに見えるので、そこを描き分ける。 */
function sock(fill, line, cx) {
  return at(cx, '<g transform="rotate(-4 54 170)">' +
    '<path d="M42 130h26v52h18a12 12 0 0 1 0 24H42a12 12 0 0 1-12-12v-52a12 12 0 0 1 12-12z" fill="' + fill +
      '" stroke="' + line + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M31 152h37" fill="none" stroke="' + line + '" stroke-width="2.5"/>' +
    '<path d="M39 134v16M48 133v17M57 134v16" fill="none" stroke="' + line + '" stroke-width="2"/>' +
    '</g>');
}

/* バッグ */
function bag(fill, line, cx) {
  return at(cx, '<path d="M38 158c0-28 32-28 32 0" fill="none" stroke="' + line +
      '" stroke-width="3.5" stroke-linecap="round"/>' +
    '<rect x="22" y="156" width="64" height="54" rx="9" fill="' + fill +
      '" stroke="' + line + '" stroke-width="3"/>');
}

/* 腕時計。色が変わるのはベルトで、文字盤は白のまま */
function watch(fill, line, cx) {
  return at(cx, '<rect x="44" y="124" width="21" height="34" rx="5" fill="' + fill +
      '" stroke="' + line + '" stroke-width="3"/>' +
    '<rect x="44" y="184" width="21" height="34" rx="5" fill="' + fill +
      '" stroke="' + line + '" stroke-width="3"/>' +
    '<rect x="75" y="165" width="7" height="12" rx="2.5" fill="' + line + '"/>' +
    '<circle cx="54" cy="171" r="22" fill="' + FACE + '" stroke="' + line + '" stroke-width="3"/>' +
    '<path d="M54 171V158M54 171l9 6" fill="none" stroke="' + line + '" stroke-width="2.5" stroke-linecap="round"/>');
}

/* ペン */
function pen(fill, line, capFill, cx) {
  return at(cx, '<g transform="rotate(18 54 172)">' +
    '<rect x="45" y="128" width="19" height="78" rx="6" fill="' + fill + '" stroke="' + line + '" stroke-width="3"/>' +
    '<path d="M45 202h19l-9.5 20z" fill="' + fill + '" stroke="' + line + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<rect x="45" y="128" width="19" height="26" rx="6" fill="' + capFill + '" stroke="' + line + '" stroke-width="3"/>' +
    '<rect x="60" y="134" width="7" height="21" rx="3" fill="' + capFill + '" stroke="' + line + '" stroke-width="2.5"/>' +
    '</g>');
}

/* ---------------- 人物 ----------------
 * 男女どちらにも見えるように、髪は左右対称のまるい形、
 * 肩幅と胴はやや細めにしている。 */

/* Tシャツ。bodyLen で裾の高さ＝ウエスト位置を変えられる */
function adultTshirt(bodyLen) {
  return 'M120 84c-13 0-24 4-30 8l-11 26a4 4 0 0 0 2 5l10 3 4-11v' + bodyLen +
    'a3 3 0 0 0 3 3h44a3 3 0 0 0 3-3v-' + bodyLen + 'l4 11 10-3a4 4 0 0 0 2-5l-11-26c-6-4-17-8-30-8z';
}

/* 素肌の腕と手。袖から下に出す。
 * 手は腕より少し太くして、手首の位置で腕の輪郭が重なるようにする
 * （同じ太さだと1本の筒に見えてしまう）。 */
function bareArm(cx, handY, deg) {
  return '<g transform="rotate(' + deg + ' ' + cx + ' ' + (handY - 50) + ')">' +
    '<circle cx="' + cx + '" cy="' + handY + '" r="8.5" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>' +
    '<rect x="' + (cx - 7) + '" y="112" width="14" height="' + (handY - 116) + '" rx="7" fill="' + FACE +
      '" stroke="' + LINE + '" stroke-width="3"/>' +
    '</g>';
}

function adultLegs(legFill, legLine, d, bandY) {
  return '<path d="' + d + '" fill="' + legFill + '" stroke="' + legLine +
      '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M95 ' + bandY + 'h50" fill="none" stroke="' + legLine + '" stroke-width="2.5"/>' +
    '<rect x="96" y="248" width="23" height="11" rx="5.5" fill="' + LINE + '"/>' +
    '<rect x="121" y="248" width="23" height="11" rx="5.5" fill="' + LINE + '"/>' +
    '<rect x="113" y="60" width="14" height="28" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>';
}

/* 左右対称のまるい髪。頭のてっぺんを覆い、耳のあたりまで下りる。
 * 短すぎず長すぎない形にして、どちらの性別にも寄せない。 */
function neutralHair(d) {
  return '<path d="' + d + '" fill="' + HAIR + '" stroke="' + LINE + '" stroke-width="3" stroke-linejoin="round"/>';
}

function adultFace() {
  return '<circle cx="120" cy="48" r="25" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>' +
    neutralHair('M96 52C96 11 144 11 144 52Q139 42 120 42Q101 42 96 52Z') +
    '<circle cx="111" cy="50" r="2.6" fill="' + LINE + '"/>' +
    '<circle cx="129" cy="50" r="2.6" fill="' + LINE + '"/>' +
    '<path d="M114 59c3 4 9 4 12 0" fill="none" stroke="' + LINE + '" stroke-width="2.8" stroke-linecap="round"/>';
}

/* 髪は頭の輪郭がはみ出さない大きさにする（いちばん幅の広いところで接する） */
function kidsFace() {
  return '<circle cx="120" cy="66" r="42" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>' +
    neutralHair('M78 66C78 6 162 6 162 66Q152 48 120 48Q88 48 78 66Z') +
    '<circle cx="106" cy="66" r="3.4" fill="' + LINE + '"/>' +
    '<circle cx="134" cy="66" r="3.4" fill="' + LINE + '"/>' +
    '<path d="M110 81c4 5 16 5 20 0" fill="none" stroke="' + LINE + '" stroke-width="3" stroke-linecap="round"/>';
}

/* Tシャツ＋クロップドパンツ（キッズVer）。頭の大きい丸い等身のまま。
 * ワンピースに見えないよう、トップスは腰までで切ってパンツを見せる。 */
function kidsFigure(tops, topsLine) {
  return [
    /* 素足とくつ */
    '<rect x="95" y="220" width="16" height="32" rx="8" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>',
    '<rect x="129" y="220" width="16" height="32" rx="8" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>',
    '<rect x="92" y="246" width="23" height="11" rx="5.5" fill="' + LINE + '"/>',
    '<rect x="125" y="246" width="23" height="11" rx="5.5" fill="' + LINE + '"/>',
    /* クロップドパンツ */
    '<path d="M88 176h64v18l-5 36h-20l-7-32-7 32H93l-5-36z" fill="' + DENIM +
      '" stroke="' + DENIM_LINE + '" stroke-width="3" stroke-linejoin="round"/>',
    '<path d="M88 188h64" fill="none" stroke="' + DENIM_LINE + '" stroke-width="2.5"/>',
    /* 首とTシャツ */
    '<path d="M110 100h20v14h-20z" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>',
    /* 腕と手（Tシャツの下に描いて、袖で肩側を隠す） */
    '<g transform="rotate(-3 76 175)">' +
      '<circle cx="76" cy="200" r="9.5" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>' +
      '<rect x="68" y="150" width="16" height="46" rx="8" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>' +
      '</g>',
    '<g transform="rotate(3 164 175)">' +
      '<circle cx="164" cy="200" r="9.5" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>' +
      '<rect x="156" y="150" width="16" height="46" rx="8" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>' +
      '</g>',
    '<path id="ki-tops" d="M120 112c-16 0-30 5-38 12l-14 34a5 5 0 0 0 3 6l12 4 5-14v22a4 4 0 0 0 4 4h56a4 4 0 0 0 4-4v-22l5 14 12-4a5 5 0 0 0 3-6l-14-34c-8-7-22-12-38-12z" fill="' + tops +
      '" stroke="' + topsLine + '" stroke-width="3" stroke-linejoin="round"/>',
    kidsFace()
  ].join('');
}

/* Tシャツ＋デニム（個人Ver）。ウエストは高めにとる */
function personalFigure(tops, topsLine) {
  return adultLegs(DENIM, DENIM_LINE, 'M95 147h50v38l-4 68h-17l-4-56-4 56h-17l-4-68z', 160) +
    bareArm(86, 178, -3) +
    bareArm(154, 178, 3) +
    '<path id="ki-tops" d="' + adultTshirt(32) + '" fill="' + tops +
      '" stroke="' + topsLine + '" stroke-width="3" stroke-linejoin="round"/>' +
    adultFace();
}

/* ジャケットの前腕。手は袖口から少しだけ出す */
function jacketSleeve(d, handX) {
  return '<circle cx="' + handX + '" cy="176" r="8.5" fill="' + FACE + '" stroke="' + LINE + '" stroke-width="3"/>' +
    '<path d="' + d + '" fill="' + SUIT + '" stroke="' + SUIT_LINE + '" stroke-width="3" stroke-linejoin="round"/>';
}

/* Tシャツ＋ジャケット（ビジネスVer）。ジャケットは前を開けて中のTシャツを見せる */
function businessFigure(tops, topsLine) {
  return adultLegs(SUIT, SUIT_LINE, 'M95 159h50v32l-4 62h-17l-4-52-4 52h-17l-4-62z', 172) +
    '<path id="ki-tops" d="' + adultTshirt(44) + '" fill="' + tops +
      '" stroke="' + topsLine + '" stroke-width="3" stroke-linejoin="round"/>' +
    jacketSleeve('M94 91 L77 122 L79 168 Q87 174 95 168 L98 122 L101 92 Z', 87) +
    jacketSleeve('M146 91 L163 122 L161 168 Q153 174 145 168 L142 122 L139 92 Z', 153) +
    '<path d="M103 86 L91 90 L97 120 L97 162 L113 162 L113 111 Z" fill="' + SUIT +
      '" stroke="' + SUIT_LINE + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M137 86 L149 90 L143 120 L143 162 L127 162 L127 111 Z" fill="' + SUIT +
      '" stroke="' + SUIT_LINE + '" stroke-width="3" stroke-linejoin="round"/>' +
    adultFace();
}

/* 人物と小物のどれとも重ならない外周のスロット */
var DECO_SLOTS = [
  [30, 40], [95, 20], [245, 20], [312, 40], [26, 88],
  [316, 88], [34, 248], [110, 284], [232, 284], [310, 252]
];

/* hex が null のときは無色（Tシャツがまだ塗られていない）状態を描く。
 * viewBox は 340x300。人物は translate(50,0) で中央に寄せ、
 * 左右の空きに小物を単体で置く。 */
KI.renderCharacter = function (color, versionId) {
  var colored = !!color;
  var hex = colored ? color.hex : null;

  /* 金属色はグラデーションで塗るので、定義と fill を分けて受け取る */
  var pTops = svgPaint(colored ? color : null, 0, 'ki-sheen-tops');
  var pRight = svgPaint(colored ? color : null, -0.28, 'ki-sheen-right');
  var pLeft = svgPaint(colored ? color : null, 0.45, 'ki-sheen-left');
  var tops = pTops.fill, right = pRight.fill, left = pLeft.fill;

  /* 輪郭は元の色から決める（グラデーションからは決められないため） */
  var topsLine = colored ? outlineFor(hex) : LINE;
  var rightLine = colored ? outlineFor(KI.shade(hex, -0.28)) : LINE;
  var leftLine = colored ? outlineFor(KI.shade(hex, 0.45)) : LINE;

  var isKids = versionId === 'kids';
  var isBusiness = versionId === 'business';

  var items = isBusiness ? '左に腕時計、右にペン'
            : isKids ? '左に靴下、右にハンカチ'
            : '左にハンカチ、右にバッグ';
  var label = colored
    ? '選ばれた色のTシャツを着たキャラクターと、同じ色の小物（' + items + '）'
    : 'まだ色のついていないキャラクターと小物';

  var figure = isKids ? kidsFigure(tops, topsLine)
             : isBusiness ? businessFigure(tops, topsLine)
             : personalFigure(tops, topsLine);

  var leftItem = isBusiness ? watch(left, leftLine, 54)
               : isKids ? sock(left, leftLine, 54)
               : handkerchief(left, leftLine, 54);
  var rightItem = isBusiness ? pen(right, rightLine, colored ? KI.shade(hex, -0.5) : BLANK, 286)
                : isKids ? handkerchief(right, rightLine, 286)
                : bag(right, rightLine, 286);

  return [
    '<svg class="ki-character" viewBox="0 0 340 300" role="img" aria-label="' + label + '">',
    '<defs>' + pTops.def + pRight.def + pLeft.def + '</defs>',
    decorations(colored ? hex : null, DECO_SLOTS),
    leftItem,
    rightItem,
    '<g transform="translate(50 0)">',
    figure,
    '</g>',
    '</svg>'
  ].join('');
};
