/* 18色パレット
 *
 * この配列がツールの中身のほぼすべて。1行が1色で、
 *   feeling … その色になる気持ち（チップの文言になる）
 *   name    … 画面に出る色名
 *   hex     … 実際の色
 *   meaning … その色の意味。「○○は」に続く形で書く
 *   closing … 締めの一文。そのまま画面に出る
 * 気持ちと色の対応はここで固定していて、判定はしない。
 * meaning と closing は画面にそのまま出るので、直せばすぐ反映される。
 * Claude が書くのは「服と小物への取り入れ方」の部分だけ。
 *
 * 並びは色相の順（あか→…→むらさき）＋土色→金属色→無彩色。
 */
window.KI = window.KI || {};

KI.PALETTE = [
  { feeling: '積極的に動く', name: 'あか', hex: '#E60033',
    meaning: 'エネルギーと行動の色。気持ちを前に押し出したい日に。',
    closing: '一つ身に付けるだけで、今日は一歩前に出られる！' },

  { feeling: 'チームワークを大事にしたい', name: 'オレンジ', hex: '#F08300',
    meaning: '家族やコミュニティなど、身近な存在を大切にする色。',
    closing: '一つ身に付けるだけで、チームワークばっちり！' },

  { feeling: '楽しみたい', name: 'きいろ', hex: '#FFD900',
    meaning: '好奇心とひらめきを呼び込む、明るく軽やかな色。',
    closing: '一つ身に付けるだけで、今日も目一杯楽しめる！' },

  { feeling: '新しいことにチャレンジ', name: 'きみどり', hex: '#B8D200',
    meaning: 'フレッシュな、はじまりの色。新しいことに向かう日に。',
    closing: '一つ身に付けて、今日は新しい扉を開けてみて。' },

  { feeling: 'ゆっくり過ごす', name: 'みどり', hex: '#00A960',
    meaning: '体のバランスを整える、穏やかな調和の色。',
    closing: '今日はゆっくり休みましょう。' },

  { feeling: 'なるようになる', name: 'みずいろ', hex: '#7FCCE3',
    meaning: '力を抜いて、受け入れ、受け流す色。',
    closing: '一つ身に付けて、今日は流れに身を任せてみよう。' },

  { feeling: 'しっかり考えたい', name: 'あお', hex: '#0068B7',
    meaning: '集中と信頼の色。落ち着いて、誠実に向き合う日に。',
    closing: '一つ身に付けるだけで、頭の中がすっきり整います。' },

  { feeling: '一人になりたい', name: 'ラベンダー', hex: '#A59ACA',
    meaning: 'ゆれる気持ちをそっと包む、繊細な色。',
    closing: '一つ身に付けて、今日は一人時間を楽しんで。' },

  { feeling: '自分らしさ全開', name: 'むらさき', hex: '#884898',
    meaning: '感性と直感を開く、自分らしさの色。',
    closing: '今日は誰にも似ていない自分を、思いきり出してみて。' },

  { feeling: '共感してほしい', name: 'あかむらさき', hex: '#B44C97',
    meaning: '個性と華やぎを引き出す、印象に残る色。',
    closing: '今日は自分でも自分を認めてあげてくださいね。' },

  { feeling: '誰かを支えたい', name: 'ピンク', hex: '#EE87B4',
    meaning: '思いやりと優しさを伝える、柔らかい色。',
    closing: 'ピンクを身に付けたあなたに、人は甘えたくなるでしょう。' },

  { feeling: '目立たず', name: 'カーキ', hex: '#8A7B47',
    meaning: '迷彩色にも使われる、周りに溶け込む色。',
    closing: '今日は目立たず過ごしたいあなたにぴったり。' },

  { feeling: 'こつこつ努力', name: 'ちゃいろ', hex: '#954B36',
    meaning: '地に足をつけて、こつこつ積み上げる色。',
    closing: '今日の積み重ねは、ちゃんと明日につながります。' },

  { feeling: '結果を出す', name: 'ゴールド', hex: '#D4AF37',
    meaning: '自分の価値を認める、実りと成果の色。',
    closing: '一つ身に付けるだけで、今日は堂々と結果を取りに行ける！' },

  { feeling: '自分の満足度上げたい', name: 'シルバー', hex: '#C8CCD2',
    meaning: '洗練とクールさの色。',
    closing: '自分自身の満足度を上げたい時にぴったりの色です！' },

  { feeling: '自由に', name: 'しろ', hex: '#FFFFFF',
    meaning: 'いったんリセットして、まっさらに戻る色。',
    closing: '今日は何にもとらわれず、自由に過ごしてみて。' },

  { feeling: '上品に', name: 'グレイ', hex: '#949495',
    meaning: '主張をひかえて、静かに品を通す色。',
    closing: '一つ身に付けるだけで、立ち居振る舞いまで上品に見えます。' },

  { feeling: 'プロ意識をもって', name: 'くろ', hex: '#231815',
    meaning: '気持ちを引き締める、強さと存在感の色。',
    closing: '一つ身に付けて、今日はプロの顔で。' }
];

/* Verごとのチップ一覧。ラベルの文言だけ Ver で差し替えられるようにして、
 * どのラベルがどの色になるかはこのパレット側で固定する。 */
KI.chipsFor = function (version) {
  return KI.PALETTE.map(function (c) {
    return {
      label: (version.chipLabels && version.chipLabels[c.name]) || c.feeling,
      color: c
    };
  });
};

/* 取り入れ方の文章を組み立てる。
 * 前半（服と小物）だけが可変で、色の意味と締めはパレットの文言をそのまま使う。 */
KI.composeHowto = function (suggestion, color) {
  return suggestion + color.name + 'は' + color.meaning + color.closing;
};

KI.findColorByName = function (name) {
  if (!name) return null;
  var n = String(name).trim();
  for (var i = 0; i < KI.PALETTE.length; i++) {
    if (KI.PALETTE[i].name === n) return KI.PALETTE[i];
  }
  return null;
};
