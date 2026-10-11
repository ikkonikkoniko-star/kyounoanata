/* ホームページに埋めこんだときだけ働く部分
 *
 * KOKOIROのホームページの中に、このページを「枠（iframe）」として
 * 置いたときの面倒を見る。単独で開いたときは何もしない。
 *
 *   1. 中身の高さを親ページに知らせる  → 枠に中身が収まり、二重のスクロールが出ない
 *   2. 画面を動かしてほしいと頼む       → 枠の中では自分で画面を動かせないため
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
  var wantHeight = 0;     /* 親に頼んだ高さ */
  var parentListens = false;  /* 親が高さを合わせてくれているか */

  /* 中身そのものの高さを測る。
   * html のほうは枠いっぱいに広がってしまうので使えない。
   * 中身が縮んでも html は縮まず、枠がどんどん伸びていってしまう。 */
  function contentHeight() {
    var b = document.body;
    if (!b) return 0;
    return Math.ceil(b.getBoundingClientRect().height + (b.offsetTop || 0));
  }

  function tellHeight() {
    var h = contentHeight();
    /* 1pxの揺れで送り続けないよう、変わったときだけ知らせる */
    if (!h || Math.abs(h - lastHeight) < 3) return;
    lastHeight = h;
    wantHeight = h;
    window.parent.postMessage({ kokoiro: 'height', height: h }, '*');
  }

  /* 親が頼んだとおりの高さにしてくれたら、枠の内側の高さがその値になる。
   * それを見て「親はこちらの合図を聞いてくれている」と判断する。
   * 一度でも確認できれば、以後はその前提で動かしてよい。
   * この判断を毎回その場でやると、高さが変わった直後のわずかな時間に
   * 見まちがえて、枠の中だけを動かしてしまうことがある。 */
  function checkParent() {
    if (!parentListens && wantHeight &&
        Math.abs(window.innerHeight - wantHeight) <= 4) {
      parentListens = true;
    }
  }

  window.addEventListener('load', tellHeight);
  window.addEventListener('resize', function () { checkParent(); tellHeight(); });

  /* 気分を選んだ・結果が出た・おまけが出た、のどれでも高さが変わる。
   * 変わったことを自分で見張る。 */
  if (window.ResizeObserver) {
    new ResizeObserver(function () { checkParent(); tellHeight(); })
      .observe(document.documentElement);
  }
  /* 見張りが使えない古い端末のための保険 */
  setInterval(function () { checkParent(); tellHeight(); }, 500);
  tellHeight();
  checkParent();

  /* 親ページにいまどこまで動いてもらったかを覚えておく。
   * 次に動かすとき、そこからの道のりが分かるので、ゆっくり動かせる。 */
  var lastTop = null;
  var glide = null;

  function stopGlide() {
    if (glide) { clearInterval(glide); glide = null; }
  }

  function tellScroll(top) {
    lastTop = top;
    window.parent.postMessage({ kokoiro: 'scroll', top: top }, '*');
  }

  /* 親ページは「ここへ」と言われると自分で滑らかに動く。
   * その「ここへ」を少しずつずらして送ると、短い距離を何度も動くことになり、
   * 一気に飛ぶより落ち着いた動きになる。 */
  function glideTo(target, ms) {
    stopGlide();
    if (lastTop === null || Math.abs(target - lastTop) < 40) { tellScroll(target); return; }
    var from = lastTop, dist = target - from, t0 = Date.now();
    glide = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / ms);
      /* 一定の速さで送る。親ページは少し遅れて追いかけてくるので、
       * 緩急をつけると、遅れを取り戻すときにガクッと動いてしまう。
       * 一定にしておくのがいちばん落ち着いて見える。 */
      tellScroll(Math.round(from + dist * k));
      if (k >= 1) stopGlide();
    }, 40);
  }

  /* いま本当に画面に入っているかを見る。
   *
   * 枠の中からは、親ページの画面の大きさを知ることができない。
   * そのため「あと何px動かせば見えるか」を計算できず、これまでは
   * 相手を画面のいちばん上に持ってくるところまで動かしていた。
   * それが「行き過ぎる」の正体。
   *
   * IntersectionObserver は、枠ごしでも「本当に見えているか」を
   * 教えてくれる。動かしながらこれを見て、見えた時点で止める。 */
  function watcher(el) {
    var state = { ratio: 0, seen: false };
    if (!window.IntersectionObserver) { state.unknown = true; return state; }
    var io = new IntersectionObserver(function (es) {
      var e = es[es.length - 1];
      state.ratio = e.intersectionRatio;
      state.seen = true;
    }, { threshold: [0, 0.25, 0.5, 0.75, 0.9, 1] });
    io.observe(el);
    state.stop = function () { io.disconnect(); };
    return state;
  }

  /* 見えるまで、少しずつ動かす。見えたらそこで止める。 */
  function creepTo(el, target, ms) {
    stopGlide();
    var w = watcher(el);
    var from = (lastTop === null) ? target : lastTop;
    var dist = target - from;
    if (!dist) { if (w.stop) w.stop(); tellScroll(target); return; }
    var t0 = Date.now();
    glide = setInterval(function () {
      /* もう十分見えていれば、そこで打ち切る */
      if (w.seen && w.ratio >= 0.9) { stopGlide(); if (w.stop) w.stop(); return; }
      var k = Math.min(1, (Date.now() - t0) / ms);
      tellScroll(Math.round(from + dist * k));
      if (k >= 1) { stopGlide(); if (w.stop) w.stop(); }
    }, 40);
  }

  /* el が null のときは、埋めこみの先頭へ戻す。
   * gentle を付けると、見えるまでゆっくり動かす。 */
  /* 相手を画面のてっぺんに持っていくと、ホームページ側のメニューが
   * 上に貼りついている場合、その下に潜りこんで読めなくなる。
   * メニューの高さは枠の中からは分からないので、よくある高さぶんの
   * 余白をとっておく。メニューが無いページでも、少し余裕が空くだけで害はない。 */
  var HEAD_ROOM = 100;

  KI.scrollToEl = function (el, gentle) {
    stopGlide();

    if (!parentListens) {
      /* 親が高さを合わせてくれていないとき（貼り付けたコードの script が
       * 消された場合など）は、枠の中にスクロールがある。自分で動かす。 */
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!el) { tellScroll(-HEAD_ROOM); return; }

    var top = Math.max(0,
      Math.round(el.getBoundingClientRect().top + window.pageYOffset) - HEAD_ROOM);

    /* もう画面に入っているなら、動かさない。
     * 見えているのに動かすと、画面が意味もなく揺れる。 */
    var w = watcher(el);
    setTimeout(function () {
      if (w.seen && w.ratio >= 0.9) { if (w.stop) w.stop(); return; }
      if (w.stop) w.stop();
      if (gentle) creepTo(el, top, 1800);
      else tellScroll(top);
    }, 120);
  };

})();
