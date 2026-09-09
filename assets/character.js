/* キャラクター描画とカラーユーティリティ
 * 丸顔でにこっと笑った、輪郭だけのシンプルな似顔絵。人物は身につけるのは
 * トップスだけで、アクセサリーもバッグも身につけない。
 * 小物は人物の横に単体のイラストとして置く（左にハンカチ、右にバッグ）。
 * 選ばれた色の濃淡を トップス／バッグ／ハンカチ の3か所に割り当てる。
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
  /* 人物・ハンカチ・バッグのどれとも重ならない外周のスロット */
  var slots = [
    [26, 38], [88, 20], [252, 20], [314, 38], [20, 96],
    [320, 96], [30, 244], [108, 276], [232, 276], [312, 244]
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

/* hex が null のときは無色（輪郭だけ）の状態を描く。
 * viewBox は 340x300。人物は translate(50,0) で中央に寄せ、
 * 左右の空きにハンカチとバッグを単体で置く。 */
KI.renderCharacter = function (hex) {
  var colored = !!hex;
  var tops = colored ? hex : BLANK;
  var bag = colored ? KI.shade(hex, -0.28) : BLANK;
  var hanky = colored ? KI.shade(hex, 0.45) : BLANK;
  var topsLine = colored ? outlineFor(tops) : LINE;
  var bagLine = colored ? outlineFor(bag) : LINE;
  var hankyLine = colored ? outlineFor(hanky) : LINE;

  return [
    '<svg class="ki-character" viewBox="0 0 340 300" role="img" aria-label="' +
      (colored ? 'えらばれた色のトップスを着たキャラクターと、同じ色のハンカチとバッグ'
               : 'まだ色のついていないキャラクターと、ハンカチとバッグ') + '">',
    decorations(colored ? hex : null),

    /* 左：ハンカチ（単体のイラスト） */
    '<g transform="rotate(-8 54 172)">',
    '<rect id="ki-hanky" x="22" y="140" width="64" height="64" rx="10" fill="' + hanky + '" stroke="' + hankyLine + '" stroke-width="3"/>',
    '<rect x="32" y="150" width="44" height="44" rx="6" fill="none" stroke="' + hankyLine + '" stroke-width="2" stroke-dasharray="5 5"/>',
    '</g>',

    /* 右：バッグ（単体のイラスト。人物には掛けない） */
    '<path d="M270 158c0-28 32-28 32 0" fill="none" stroke="' + bagLine + '" stroke-width="3.5" stroke-linecap="round" transform="translate(-4 0)"/>',
    '<rect id="ki-bag" x="254" y="156" width="64" height="54" rx="9" fill="' + bag + '" stroke="' + bagLine + '" stroke-width="3"/>',

    /* 中央：人物。トップス以外は身につけない */
    '<g transform="translate(50 0)">',

    '<rect x="102" y="204" width="14" height="52" rx="7" fill="#fff" stroke="' + LINE + '" stroke-width="3"/>',
    '<rect x="124" y="204" width="14" height="52" rx="7" fill="#fff" stroke="' + LINE + '" stroke-width="3"/>',
    '<path d="M99 256h20a4 4 0 0 1 4 4v4H99z" fill="' + LINE + '"/>',
    '<path d="M121 256h20a4 4 0 0 1 4 4v4h-24z" fill="' + LINE + '"/>',

    '<path id="ki-tops" d="M120 112c-16 0-30 5-38 12l-14 34a5 5 0 0 0 3 6l12 4 5-14v56a4 4 0 0 0 4 4h56a4 4 0 0 0 4-4v-56l5 14 12-4a5 5 0 0 0 3-6l-14-34c-8-7-22-12-38-12z" fill="' + tops + '" stroke="' + topsLine + '" stroke-width="3" stroke-linejoin="round"/>',

    '<path d="M110 100h20v14h-20z" fill="#fff" stroke="' + LINE + '" stroke-width="3"/>',

    '<circle cx="120" cy="66" r="42" fill="#fff" stroke="' + LINE + '" stroke-width="3"/>',
    '<path d="M84 44c8-16 44-20 60-6" fill="none" stroke="' + LINE + '" stroke-width="3" stroke-linecap="round"/>',
    '<circle cx="106" cy="64" r="3.4" fill="' + LINE + '"/>',
    '<circle cx="134" cy="64" r="3.4" fill="' + LINE + '"/>',
    '<path d="M110 79c4 5 16 5 20 0" fill="none" stroke="' + LINE + '" stroke-width="3" stroke-linecap="round"/>',

    '</g>',
    '</svg>'
  ].join('');
};
