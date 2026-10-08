/* おまけの声
 *
 * 結果が出たとき、ときどき出る応援メッセージ。色の説明とは切り離してある。
 * 色ごとの読み上げではないので、どの色・どのVerでも同じものが使える。
 *
 * ■ 録音が届いたときの足しかた
 *   1. 音のファイルを assets/voice/ に入れる
 *   2. 下の CHEERS に 1行足す
 *        { file: 'cheer7.m4a' },
 *   3. ある色では出したくないときは skip を足す
 *        { file: '...', skip: KI.WARM },            暖色系では出さない
 *        { file: '...', skip: ['みどり', 'あお'] },  色を名ざしで指定
 * CHEERS が空のあいだは、おまけの枠そのものが出ない。
 */
window.KI = window.KI || {};

/* 出る割合。1 なら毎回、0.33 なら3回に1回くらい。 */
KI.CHEER_RATE = 1 / 3;

/* 結果が出てから、プレゼントが飛び出すまでの待ち時間（ミリ秒）。
 * 文章を読み終わったころに出したいので、少し置く。 */
KI.CHEER_DELAY = 5000;

/* 暖色系。寝るメッセージは、この色では出さない。 */
KI.WARM = ['あか', 'オレンジ', 'きいろ', 'ピンク', 'あかむらさき', 'ちゃいろ', 'ゴールド'];

/* 画面に出す署名 */
KI.CHEER_BY = 'KOKOIRO代表　播本なおこ より';

/* 声を出さないVer。箱もイラストもそのままで、声の場所に言葉を大きく出す。 */
KI.CHEER_NO_VOICE = ['kids'];
/* 最後のピースだけ絵文字。U+FE0F を付けて、白黒の記号ではなく
 * 色つきの絵文字として出るようにしている。 */
KI.CHEER_WORDS = ['あたり！', '大当たり！', 'やったね！', 'いいね！', '✌️'];

KI.CHEERS = [
  { file: 'cheer1.m4a' },
  { file: 'cheer2.m4a' },
  { file: 'cheer3.m4a' },
  /* 寝るメッセージ。朝に使う暖色系では出さない。 */
  { file: 'cheer4-neru.m4a', skip: KI.WARM },
  { file: 'cheer5.m4a' },
  { file: 'cheer6.m4a' }
];

/* 直前に出たものを覚えておいて、続けて同じものが出ないようにする */
var lastCheer = null;
var lastWord = null;

/* 言葉を1つ選ぶ。直前と同じものは避ける。 */
function pickWord() {
  var ok = KI.CHEER_WORDS;
  if (!ok.length) return null;
  if (ok.length > 1) {
    var fresh = ok.filter(function (w) { return w !== lastWord; });
    if (fresh.length) ok = fresh;
  }
  var w = ok[Math.floor(Math.random() * ok.length)];
  lastWord = w;
  return w;
}

/* 出すものを1つ選ぶ。出さないときは null を返す。
 * 声を出さないVerでは { word: '...' } を、ほかでは { file: '...' } を返す。 */
KI.pickCheer = function (color, versionId) {
  if (Math.random() >= KI.CHEER_RATE) return null;

  if (KI.CHEER_NO_VOICE.indexOf(versionId) !== -1) {
    var w = pickWord();
    return w ? { word: w } : null;
  }

  if (!KI.CHEERS.length) return null;

  var ok = KI.CHEERS.filter(function (c) {
    return !(c.skip && c.skip.indexOf(color.name) !== -1);
  });
  if (!ok.length) return null;

  /* 候補が2つ以上あるときだけ、直前のものを外す */
  if (ok.length > 1) {
    var fresh = ok.filter(function (c) { return c.file !== lastCheer; });
    if (fresh.length) ok = fresh;
  }

  var pick = ok[Math.floor(Math.random() * ok.length)];
  lastCheer = pick.file;
  return pick;
};
