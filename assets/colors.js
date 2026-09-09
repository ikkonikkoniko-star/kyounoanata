/* 18色パレット
 *
 * この配列がツールの中身のほぼすべて。1行が1色で、
 *   feeling … その色になる気持ち（チップの文言になる）
 *   name    … 画面に出る色名
 *   hex     … 実際の色
 *   meaning … その色の意味。結果の文章を書くときの下敷きになる
 * 気持ちと色の対応はここで固定していて、判定はしない。
 * 色を足す・減らす・言い回しを変えるときは、このファイルだけ直せば足りる。
 *
 * 並びは色相の順（あか→…→むらさき）＋土色→金属色→無彩色。
 * 色名は身近で、そのまま口に出せる名前だけ。表記はひらがな中心で、
 * カタカナでしか通じない色だけカタカナのままにしている。
 */
window.KI = window.KI || {};

KI.PALETTE = [
  { feeling: '積極的に動く',           name: 'あか',         hex: '#E60033',
    meaning: 'エネルギーと行動の色。気持ちを前に押し出したい日に。' },
  { feeling: 'チームワークを大事にしたい', name: 'オレンジ',   hex: '#F08300',
    meaning: '人との距離を縮める、あたたかく開かれた色。' },
  { feeling: '楽しみたい',             name: 'きいろ',       hex: '#FFD900',
    meaning: '好奇心とひらめきを呼び込む、明るく軽やかな色。' },
  { feeling: '新しいことにチャレンジ',   name: 'きみどり',     hex: '#B8D200',
    meaning: 'はじまりとフレッシュさの色。新しいことに向かう日に。' },
  { feeling: 'ゆっくり過ごす',          name: 'みどり',       hex: '#00A960',
    meaning: '心のバランスを整える、穏やかな調和の色。' },
  { feeling: 'なるようになる',          name: 'みずいろ',     hex: '#7FCCE3',
    meaning: '力を抜いて呼吸を深くする、やわらかな色。' },
  { feeling: 'しっかり考えたい',        name: 'あお',         hex: '#0068B7',
    meaning: '集中と信頼の色。落ち着いて、誠実に向き合う日に。' },
  { feeling: '一人になりたい',          name: 'ラベンダー',   hex: '#A59ACA',
    meaning: 'ゆれる気持ちをそっと包む、繊細な色。' },
  { feeling: '自分らしさ全開',          name: 'むらさき',     hex: '#884898',
    meaning: '感性と直感を開く、自分らしさの色。' },
  { feeling: '共感してほしい',          name: 'あかむらさき', hex: '#B44C97',
    meaning: '個性と華やぎを引き出す、印象に残る色。' },
  { feeling: '誰かを支えたい',          name: 'ピンク',       hex: '#EE87B4',
    meaning: '思いやりと親しみを伝える、やわらかい色。' },
  { feeling: '目立たず',               name: 'カーキ',       hex: '#8A7B47',
    meaning: '肩の力を抜いた、大人の余裕と自然体の色。' },
  { feeling: 'こつこつ努力',            name: 'ちゃいろ',     hex: '#954B36',
    meaning: '地に足をつけて、こつこつ積み上げる色。' },
  { feeling: '結果を出す',              name: 'ゴールド',     hex: '#D4AF37',
    meaning: '自分の価値を認める、実りと成果の色。' },
  { feeling: '自分の満足度上げたい',     name: 'シルバー',     hex: '#C8CCD2',
    meaning: '洗練とクールさの色。自分の基準で満たされたい日に。' },
  { feeling: '自由に',                 name: 'しろ',         hex: '#FFFFFF',
    meaning: 'いったんリセットして、まっさらに戻る色。' },
  { feeling: '上品に',                 name: 'グレイ',       hex: '#949495',
    meaning: '主張をひかえて、静かに品を通す色。' },
  { feeling: 'プロ意識をもって',        name: 'くろ',         hex: '#231815',
    meaning: '気持ちを引き締める、強さと存在感の色。' }
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

KI.findColorByName = function (name) {
  if (!name) return null;
  var n = String(name).trim();
  for (var i = 0; i < KI.PALETTE.length; i++) {
    if (KI.PALETTE[i].name === n) return KI.PALETTE[i];
  }
  return null;
};
