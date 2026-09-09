/* 個人Ver／ビジネスVer／キッズVer の差分定義
 * チップの文言、スロット（トップス／小物／アクセサリー）の呼び名、
 * 言葉遣いのトーン、API が使えないときのフォールバック提案文をここにまとめる。
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
    slots: [
      { key: 'tops', label: 'トップス', icon: '👕' },
      { key: 'item', label: '小物', icon: '👜' },
      { key: 'accessory', label: 'アクセサリー', icon: '💍' }
    ],
    fallback: function (color) {
      var tops = ['ニット', 'カットソー', 'シャツ', 'カーディガン', 'ブラウス'];
      var items = ['トートバッグ', 'ストール', 'キャップ', '靴下', 'ハンカチ'];
      var accs = ['ピアス', 'ネックレス', 'ヘアゴム', 'ブレスレット', '腕時計のベルト'];
      return {
        message: 'きょうは' + color.name + 'の力を、少しだけ借りてみましょう。',
        tops: color.name + 'の' + pick(tops, color.hex, 0) + 'を主役に。顔まわりに来る面積が大きいほど、気分もその色に寄っていきます。',
        item: pick(items, color.hex, 1) + 'を' + color.name + 'に。服はいつも通りでも、持ちものだけで印象は十分変わります。',
        accessory: color.name + 'の' + pick(accs, color.hex, 2) + 'をひとつ。小さくても視線が集まる場所なので、効きめは大きいです。'
      };
    }
  },

  business: {
    id: 'business',
    label: 'ビジネスVer',
    question: '今日は どんな自分で仕事に臨みますか？',
    tone: '落ち着いた敬体。相手に与える印象や場の空気に触れる、ビジネスシーンを想定した言葉づかいで。',
    chips: ['会議で意見を通したい', '落ち着いて商談したい', 'チームをまとめたい', '初対面で好印象を持たれたい'],
    slots: [
      { key: 'tops', label: 'ジャケット・トップス', icon: '🧥' },
      { key: 'item', label: 'ビジネス小物', icon: '💼' },
      { key: 'accessory', label: 'アクセサリー', icon: '⌚' }
    ],
    fallback: function (color) {
      var tops = ['シャツ', 'ブラウス', 'インナー', 'ニット', 'ベスト'];
      var items = ['ネクタイ', 'ポケットチーフ', '名刺入れ', 'ノートカバー', 'ペン'];
      var accs = ['腕時計のベルト', 'カフス', 'ピアス', 'ネックレス', 'メガネのフレーム'];
      return {
        message: color.name + 'を身につけて、今日の場に臨んでみてください。',
        tops: color.name + 'の' + pick(tops, color.hex, 0) + 'を選びます。上半身は相手の視線が最も長くとどまる場所です。',
        item: pick(items, color.hex, 1) + 'に' + color.name + 'を。スーツの色を変えなくても、印象の方向づけはできます。',
        accessory: color.name + 'の' + pick(accs, color.hex, 2) + 'をひとつだけ。控えめな面積のほうが、かえって記憶に残ります。'
      };
    }
  },

  kids: {
    id: 'kids',
    label: 'キッズVer',
    question: 'きょうは どんな きぶん？',
    tone: '小学校低学年にもわかる、やさしいひらがな中心の話し言葉。むずかしい漢字と熟語は使わない。',
    chips: ['げんきに あそびたい', 'のんびり したい', 'ともだちと なかよくしたい', 'ちょっと どきどき'],
    slots: [
      { key: 'tops', label: 'ふく', icon: '👕' },
      { key: 'item', label: 'もちもの', icon: '🎒' },
      { key: 'accessory', label: 'かざり', icon: '⭐' }
    ],
    fallback: function (color) {
      var tops = ['Tシャツ', 'トレーナー', 'パーカー', 'シャツ'];
      var items = ['ぼうし', 'すいとう', 'ハンカチ', 'くつした', 'リュックのキーホルダー'];
      var accs = ['ヘアゴム', 'バッジ', 'シール', 'わゴム', 'ミサンガ'];
      return {
        message: 'きょうは ' + color.name + ' が あなたの みかたです。',
        tops: color.name + 'の' + pick(tops, color.hex, 0) + 'を きてみよう。おおきく みえる ところだから いちばん つよい みかたに なるよ。',
        item: pick(items, color.hex, 1) + 'を ' + color.name + ' に してみよう。もちものなら まいにち かえられるね。',
        accessory: color.name + 'の' + pick(accs, color.hex, 2) + 'を ひとつ つけてみよう。ちいさくても ちゃんと きこえる おまじないだよ。'
      };
    }
  }
};
