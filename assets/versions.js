/* 個人Ver／ビジネスVer／キッズVer の差分定義
 *
 * チップは18色ぶん（1色につき1つ）。どの気持ちがどの色になるかは colors.js の
 * feeling で固定していて、キッズVerだけ chipLabels で言い回しを差し替える。
 * suggestion は結果の文章の1〜2文目。色名以外は変わらない固定文で、
 * このあとに colors.js の「○○は（意味）」＋（締めの一文）が続く。
 */
window.KI = window.KI || {};

KI.VERSIONS = {
  personal: {
    id: 'personal',
    label: '個人Ver',
    question: 'きょうは どんな自分でいたい？',
    howtoLabel: 'こんなふうに色を入れてみる',
    howtoIcon: '👕',
    suggestion: function (color) {
      return '着る服に' + color.name + 'を取り入れてみたり、ハンカチなどの小物に' +
        color.name + 'を足してみましょう。';
    }
  },

  business: {
    id: 'business',
    label: 'ビジネスVer',
    question: '今日は どんな自分で仕事に臨みますか？',
    howtoLabel: 'こんなふうに色を取り入れる',
    howtoIcon: '🧥',
    suggestion: function (color) {
      return '着るものに' + color.name + 'を取り入れてみたり、腕時計などの小物に' +
        color.name + 'を足してみましょう。';
    }
  },

  kids: {
    id: 'kids',
    label: 'キッズVer',
    question: 'きょうは どんな きぶん？',
    howtoLabel: 'こんなふうに いろを つかってみよう',
    howtoIcon: '🎨',
    /* キッズVerだけ、同じ色に対してひらがなの言い回しを当てる */
    chipLabels: {
      'あか': 'げんきに うごきたい',
      'オレンジ': 'みんなと なかよくしたい',
      'きいろ': 'たのしみたい',
      'きみどり': 'あたらしいこと やってみたい',
      'みどり': 'ゆっくり すごしたい',
      'みずいろ': 'なるように なる',
      'あお': 'しっかり かんがえたい',
      'ラベンダー': 'ひとりに なりたい',
      'むらさき': 'じぶんらしく いたい',
      'あかむらさき': 'わかって ほしい',
      'ピンク': 'だれかを たすけたい',
      'カーキ': 'めだたずに いたい',
      'ちゃいろ': 'こつこつ がんばる',
      'ゴールド': 'できるように なりたい',
      'シルバー': 'じぶんに まんぞくしたい',
      'しろ': 'じゆうに したい',
      'グレイ': 'きちんと したい',
      'くろ': 'ほんきで やりたい'
    },
    suggestion: function (color) {
      return 'きるふくに' + color.name + 'を つかってみたり、ハンカチなどの もちものに' +
        color.name + 'を たしてみよう。';
    }
  }
};

/* 結果の中身を組み立てる。すべて固定文なので、外に問い合わせるものは何もない。 */
KI.resultFor = function (version, color) {
  return {
    color: color,
    message: 'きょうは' + color.name + 'のちからをかりてみましょう。',
    howto: version.suggestion(color) + color.name + 'は' + color.meaning + color.closing
  };
};
