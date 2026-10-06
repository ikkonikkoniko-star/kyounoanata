/* おまけの声
 *
 * 結果が出たとき、ときどき出る応援メッセージ。色の説明とは切り離してある。
 * 色ごとの読み上げではないので、どの色・どのVerでも同じものが使える。
 *
 * ■ 録音が届いたときの足しかた
 *   1. 音のファイルを assets/voice/ に入れる
 *   2. 下の CHEERS に 1行足す
 *        { file: 'cheer-motte.m4a', text: 'その色、持って行ってな' },
 *   3. ある色では出したくないときは skip を足す
 *        { file: '...', text: '...', skip: ['みどり', 'ラベンダー'] },
 * CHEERS が空のあいだは、おまけの枠そのものが出ない。
 */
window.KI = window.KI || {};

/* 出る割合。1 なら毎回、0.5 なら2回に1回くらい。
 * 「出たらラッキー」にしたいので、様子を見ながら下げていく。 */
KI.CHEER_RATE = 0.5;

/* 画面に出す署名 */
KI.CHEER_BY = 'KOKOIRO代表　播本なおこ より';

KI.CHEERS = [
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
