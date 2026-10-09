/* ホームページに埋めこんだときだけ働く部分
 *
 * KOKOIROのホームページの中に、このページを「枠（iframe）」として
 * 置いたときの面倒を見る。単独で開いたときは何もしない。
 *
 *   1. 中身の高さを親ページに知らせる  → 枠に中身が収まり、二重のスクロールが出ない
 *   2. 結果まで画面を動かしてほしいと頼む → 枠の中では自分でスクロールできないため
 *
 * 外には何も送らない。送り先は、このページを置いている親ページだけ。
 * 送る中身も「高さ」と「ここまで動かして」という数字だけ。
 */
window.KI = window.KI || {};

(function () {
  /* 単独で開いているときは、ふつうの動きのままにする */
  if (window.parent === window) return;

  document.documentElement.className += ' ki-embed';

  var lastHeight = 0;

  function tellHeight() {
    var h = Math.ceil(document.documentElement.getBoundingClientRect().height);
    /* 1pxの揺れで送り続けないよう、変わったときだけ知らせる */
    if (!h || Math.abs(h - lastHeight) < 3) return;
    lastHeight = h;
    window.parent.postMessage({ kokoiro: 'height', height: h }, '*');
  }

  window.addEventListener('load', tellHeight);
  window.addEventListener('resize', tellHeight);

  /* 気分を選んだ・結果が出た・おまけが出た、のどれでも高さが変わる。
   * 変わったことを自分で見張る。 */
  if (window.ResizeObserver) {
    new ResizeObserver(tellHeight).observe(document.documentElement);
  }
  /* 見張りが使えない古い端末のための保険 */
  setInterval(tellHeight, 500);
  tellHeight();

  /* 枠の中では、ページ自身をスクロールしても画面は動かない。
   * 「枠の上から数えてここまで動かして」と親ページに頼む。 */
  KI.scrollToEl = function (el) {
    var top = Math.max(0, Math.round(el.getBoundingClientRect().top + window.pageYOffset));
    window.parent.postMessage({ kokoiro: 'scroll', top: top }, '*');
  };
})();
