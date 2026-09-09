/* キャラクター描画とカラーユーティリティ
 * 丸顔でにこっと笑った、輪郭だけのシンプルな似顔絵。
 * トップス／小物／アクセサリーの3か所に、選ばれた色の濃淡を割り当てる。
 * 人物の周りには同じ色の濃淡違いの丸・四角・三角を散らして賑やかにする。
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

/* しろ など明るすぎる色でも輪郭が消えないように少しだけ締める */
function outlineFor(hex) {
  return KI.isLight(hex) ? KI.shade(hex, -0.35) : '#2b2b2b';
}

/* 色ごとに安定した擬似乱数（同じ色なら毎回同じ配置になる） */
function seededRandom(seed) {
  var s = seed >>> 0 || 1;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function decorations(hex) {
  if (!hex) return '';
  var rnd = seededRandom(KI.hexToRgb(hex).r * 7919 + KI.hexToRgb(hex).g * 104729 + KI.hexToRgb(hex).b + 1);
  var tones = [KI.shade(hex, 0.62), KI.shade(hex, 0.38), KI.shade(hex, 0.12), KI.shade(hex, -0.22)];
  /* 人物と重ならない外周のスロット */
  var slots = [
    [26, 40], [206, 46], [16, 116], [222, 124], [30, 206],
    [212, 200], [60, 22], [176, 20], [22, 268], [216, 264]
  ];
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

var BLANK = '#ECECEC';
var LINE = '#2b2b2b';

/* hex が null のときは無色（輪郭だけ）の状態を描く */
KI.renderCharacter = function (hex) {
  var colored = !!hex;
  var tops = colored ? hex : BLANK;
  var item = colored ? KI.shade(hex, -0.28) : BLANK;
  var acc = colored ? KI.shade(hex, 0.45) : BLANK;
  var topsLine = colored ? outlineFor(tops) : LINE;
  var itemLine = colored ? outlineFor(item) : LINE;
  var accLine = colored ? outlineFor(acc) : LINE;

  return [
    '<svg class="ki-character" viewBox="0 0 240 300" role="img" aria-label="' +
      (colored ? 'えらばれた色を着たキャラクター' : 'まだ色のついていないキャラクター') + '">',
    decorations(colored ? hex : null),

    /* 脚と靴（色は割り当てない） */
    '<rect x="102" y="204" width="14" height="52" rx="7" fill="#fff" stroke="' + LINE + '" stroke-width="3"/>',
    '<rect x="124" y="204" width="14" height="52" rx="7" fill="#fff" stroke="' + LINE + '" stroke-width="3"/>',
    '<path d="M99 256h20a4 4 0 0 1 4 4v4H99z" fill="' + LINE + '"/>',
    '<path d="M121 256h20a4 4 0 0 1 4 4v4h-24z" fill="' + LINE + '"/>',

    /* トップス（本体の色） */
    '<path id="ki-tops" d="M120 112c-16 0-30 5-38 12l-14 34a5 5 0 0 0 3 6l12 4 5-14v56a4 4 0 0 0 4 4h56a4 4 0 0 0 4-4v-56l5 14 12-4a5 5 0 0 0 3-6l-14-34c-8-7-22-12-38-12z" fill="' + tops + '" stroke="' + topsLine + '" stroke-width="3" stroke-linejoin="round"/>',

    /* 首 */
    '<path d="M110 100h20v14h-20z" fill="#fff" stroke="' + LINE + '" stroke-width="3"/>',

    /* 小物：ショルダーバッグ */
    '<path id="ki-item-strap" d="M104 118c8 22 26 32 42 34" fill="none" stroke="' + itemLine + '" stroke-width="4" stroke-linecap="round"/>',
    '<rect id="ki-item" x="146" y="148" width="30" height="26" rx="6" fill="' + item + '" stroke="' + itemLine + '" stroke-width="3"/>',

    /* 顔 */
    '<circle cx="120" cy="66" r="42" fill="#fff" stroke="' + LINE + '" stroke-width="3"/>',
    '<path d="M84 44c8-16 44-20 60-6" fill="none" stroke="' + LINE + '" stroke-width="3" stroke-linecap="round"/>',
    '<circle cx="106" cy="64" r="3.4" fill="' + LINE + '"/>',
    '<circle cx="134" cy="64" r="3.4" fill="' + LINE + '"/>',
    '<path d="M110 79c4 5 16 5 20 0" fill="none" stroke="' + LINE + '" stroke-width="3" stroke-linecap="round"/>',

    /* アクセサリー：イヤリングとネックレス */
    '<circle id="ki-acc-l" cx="79" cy="72" r="6" fill="' + acc + '" stroke="' + accLine + '" stroke-width="2.5"/>',
    '<circle id="ki-acc-r" cx="161" cy="72" r="6" fill="' + acc + '" stroke="' + accLine + '" stroke-width="2.5"/>',
    '<path d="M108 114c5 7 19 7 24 0" fill="none" stroke="' + accLine + '" stroke-width="2.5" stroke-linecap="round"/>',
    '<circle id="ki-acc-c" cx="120" cy="120" r="5" fill="' + acc + '" stroke="' + accLine + '" stroke-width="2.5"/>',
    '</svg>'
  ].join('');
};
