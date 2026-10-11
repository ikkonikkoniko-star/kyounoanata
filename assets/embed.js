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
  /* 親ページにいまどこまで動いてもらったかを覚えておく。
   * 次に動かすとき、そこからの道のりが分かるので、ゆっくり動かせる。 */
  var lastTop = null;
  var glide = null;

  function tellScroll(top) {
    lastTop = top;
    window.parent.postMessage({ kokoiro: 'scroll', top: top }, '*');
  }

  /* 親ページは「ここへ」と言われると自分で滑らかに動く。
   * その「ここへ」を少しずつずらして送ると、短い距離を何度も動くことになり、
   * 一気に飛ぶより落ち着いた動きになる。 */
  function glideTo(target, ms) {
    if (glide) { clearInterval(glide); glide = null; }
    if (lastTop === null || Math.abs(target - lastTop) < 40) { tellScroll(target); return; }
    var from = lastTop, dist = target - from, t0 = Date.now();
    glide = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / ms);
      /* 一定の速さで送る。親ページは少し遅れて追いかけてくるので、
       * 緩急をつけると、遅れを取り戻すときにガクッと動いてしまう。
       * 一定にしておくのがいちばん落ち着いて見える。 */
      tellScroll(Math.round(from + dist * k));
      if (k >= 1) { clearInterval(glide); glide = null; }
    }, 40);
  }

  /* gentle を付けると、ゆっくり動く。ふだんは今までどおり一度で動かす。 */
  KI.scrollToEl = function (el, gentle) {
    var doc = document.documentElement;
    /* 親ページが枠の高さを合わせてくれているときは、枠の中にスクロールが
     * 無いので、自分で動かしても画面は動かない。親に頼む。
     * 合わせてくれていないとき（貼り付けたコードの script が消された場合など）は
     * 枠の中にスクロールがあるので、自分で動かす。 */
    if (doc.scrollHeight <= window.innerHeight + 4) {
      var top = Math.max(0, Math.round(el.getBoundingClientRect().top + window.pageYOffset));
      if (gentle) glideTo(top, 1800);
      else tellScroll(top);
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };
})();
