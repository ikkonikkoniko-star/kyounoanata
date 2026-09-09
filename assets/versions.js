/* 個人Ver／ビジネスVer／キッズVer の差分定義
 * チップの文言、提案の対象になるアイテム、言葉遣いのトーン、
 * API が使えないときのフォールバック提案文をここにまとめる。
 * 見た目（POPなキャラクター・吹き出し・カラフル図形）は3Ver共通。
 */
window.KI = window.KI || {};

/* 色ごとに安定してアイテムを選ぶ（同じ色なら毎回同じ提案になる） */
function pick(list, hex, offset) {
  var c = KI.hexToRgb(hex);
  var seed = c.r * 3 + c.g * 5 + c.b * 7 + offset * 11;
  return list[seed % list.length];
}

KI.VERSIONS = {
  personal: {
    id: 'personal',
    label: '個人Ver',
    question: 'きょうは どんな自分でいたい？',
    tone: '親しみやすい「です・ます」まじりのカジュアルな話し言葉。友だちが背中を押してくれるような温度感で。',
    chips: ['積極的に動く', 'ゆっくり過ごす', '誰かを支えたい', '眠たい'],
    howtoLabel: 'こんなふうに色を入れてみる',
    howtoIcon: '👕',
    /* API に「どんなアイテムを想定して書くか」を伝えるための語彙 */
    scope: 'Tシャツ・ニット・シャツなどのトップスと、バッグ・ハンカチ・ストール・靴下・ピアス・ヘアゴムなどの小物',
    fallback: function (color) {
      var tops = pick(['Tシャツ', 'ニット', 'カットソー', 'シャツ', 'カーディガン'], color.hex, 0);
      var small = pick(['ハンカチ', 'トートバッグ', 'ストール', '靴下', 'ヘアゴム'], color.hex, 1);
      return tops + 'など着る服に' + color.name + 'を取り入れてみたり、' + small + 'などの小物に' +
        color.name + 'を足してみましょう。' + color.name + 'は' + color.meaning +
        'ひとつ身につけるだけで、今日もきっとうまくいく！';
    }
  },

  business: {
    id: 'business',
    label: 'ビジネスVer',
    question: '今日は どんな自分で仕事に臨みますか？',
    tone: '落ち着いた敬体。相手に与える印象や場の空気に触れる、ビジネスシーンを想定した言葉づかいで。',
    chips: ['会議で意見を通したい', '落ち着いて商談したい', 'チームをまとめたい', '初対面で好印象を持たれたい'],
    howtoLabel: 'こんなふうに色を取り入れる',
    howtoIcon: '🧥',
    scope: 'ジャケットの下に着るシャツ・インナー・ニットなどのトップスと、ネクタイ・ポケットチーフ・名刺入れ・ノートカバー・ペン・腕時計のベルトなどのビジネス小物',
    fallback: function (color) {
      var tops = pick(['シャツ', 'ブラウス', 'インナー', 'ニット', 'ベスト'], color.hex, 0);
      var small = pick(['ハンカチ', 'ネクタイ', 'ポケットチーフ', '名刺入れ', 'ペン'], color.hex, 1);
      return 'ジャケットの下の' + tops + 'など着るものに' + color.name + 'を取り入れてみたり、' + small +
        'などの小物に' + color.name + 'を足してみましょう。' + color.name + 'は' + color.meaning +
        '小さな面積でも、その色はきちんと相手に届きます。今日もきっとうまくいく。';
    }
  },

  kids: {
    id: 'kids',
    label: 'キッズVer',
    question: 'きょうは どんな きぶん？',
    tone: '小学校低学年にもわかる、やさしいひらがな中心の話し言葉。むずかしい漢字と熟語は使わない。',
    chips: ['げんきに あそびたい', 'のんびり したい', 'ともだちと なかよくしたい', 'ちょっと どきどき'],
    howtoLabel: 'こんなふうに いろを つかってみよう',
    howtoIcon: '🎨',
    scope: 'Tシャツ・トレーナー・パーカーなどのふくと、ぼうし・すいとう・ハンカチ・くつした・ヘアゴム・バッジなどの もちもの',
    fallback: function (color) {
      var tops = pick(['Tシャツ', 'トレーナー', 'パーカー', 'シャツ'], color.hex, 0);
      var small = pick(['ハンカチ', 'くつした', 'ぼうし', 'すいとう', 'ヘアゴム'], color.hex, 1);
      return tops + 'など きるふくに' + color.name + 'を つかってみたり、' + small + 'などの もちものに' +
        color.name + 'を たしてみよう。' + color.name + 'は' + color.meaning +
        'ひとつ もっているだけで、きょうも きっと うまくいく！';
    }
  }
};
