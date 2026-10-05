/* 播本さんの声
 *
 * 結果の「取り入れ方」の下に、締めの一文を読み上げる再生ボタンを出す。
 * 音のファイルは assets/voice/ に置く。外には何も問い合わせない。
 *
 * ■ 録音が届いたときの足しかた
 *   1. 音のファイルを assets/voice/ に入れる
 *   2. 下の VOICES に 1行足す（例： 'personal-aka': 'personal-aka.m4a',）
 * ここに名前が無い色は、再生ボタンそのものを出さない。
 * だから、届いた色から順に足していける。
 */
window.KI = window.KI || {};

KI.VOICE_DIR = 'assets/voice/';

/* 色名をファイル名に使える形にする。録音リストのファイル名と同じ並び。 */
KI.ROMA = {
  'あか': 'aka',
  'オレンジ': 'orange',
  'きいろ': 'kiiro',
  'きみどり': 'kimidori',
  'みどり': 'midori',
  'みずいろ': 'mizuiro',
  'あお': 'ao',
  'ラベンダー': 'lavender',
  'むらさき': 'murasaki',
  'あかむらさき': 'akamurasaki',
  'ピンク': 'pink',
  'カーキ': 'khaki',
  'ちゃいろ': 'chairo',
  'ゴールド': 'gold',
  'シルバー': 'silver',
  'しろ': 'shiro',
  'くろ': 'kuro'
};

/* 届いた録音をここに足す。いまは1本も無いので、どのページにも再生ボタンは出ない。 */
KI.VOICES = {
  /* 'personal-aka': 'personal-aka.m4a', */
};

/* その色の声があればファイルの場所を、無ければ null を返す。 */
KI.voiceFor = function (versionId, color) {
  var roma = KI.ROMA[color.name];
  if (!roma) return null;
  var file = KI.VOICES[versionId + '-' + roma];
  return file ? KI.VOICE_DIR + file : null;
};
