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

/* 出すものを1つ選ぶ。出さないときは null を返す。 */
KI.pickCheer = function (color) {
  if (!KI.CHEERS.length) return null;
  if (Math.random() >= KI.CHEER_RATE) return null;

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
