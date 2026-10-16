/* どの色が選ばれているかを数えるところ
 *
 * ここだけが、外に通信をする唯一の場所。ほかのファイルは何も送らない。
 * 送り先（STATS_URL）が空のあいだは、通信は一切起きない。
 *
 * 送るのは次の6つだけ。名前も、連絡先も、IPも、端末そのものの番号も扱わない。
 *
 *   e      … できごと（open＝ページが開かれた／choose＝色が決まった）
 *   ver    … どのVerか（top／personal／business／kids）
 *   color  … 決まった色の名前（choose のときだけ）
 *   id     … このブラウザに振った通し番号。誰かは分からない。
 *            履歴を消されたら別の番号になるし、携帯とパソコンでは別々になる。
 *   line   … LINEの中から開かれたか
 *   embed  … ホームページに埋めこまれた状態か、直接開かれたか
 *
 * 日時は送らない。送り先の側で記録する。端末の時計はずれていることがあるため。
 *
 * 記録は「送りっぱなし」にしている。返事を待たないので、送れなくても
 * アプリは止まらない。通信が遮断されている場所でも、色はふつうに出る。
 */
window.KI = window.KI || {};

/* 送り先。Googleスプレッドシート側で作ったURLをここに入れる。
 * 空のままなら、このファイルは何もしない。 */
KI.STATS_URL = '';

(function () {

  /* 数えないページ。動作確認用なので、本番の数字に混ぜない。 */
  var SKIP = ['omake', 'kakunin'];

  function pageVer() {
    var p = String(location.pathname || '').toLowerCase();
    if (p.indexOf('personal') !== -1) return 'personal';
    if (p.indexOf('business') !== -1) return 'business';
    if (p.indexOf('kids') !== -1) return 'kids';
    if (p.indexOf('omake') !== -1) return 'omake';
    if (p.indexOf('kakunin') !== -1) return 'kakunin';
    return 'top';
  }

  /* このブラウザの通し番号。
   * 保存できない設定（シークレットウィンドウなど）のときは空のまま。
   * そのときは「のべ回数」だけが数えられ、人数は数えられない。 */
  function visitorId() {
    try {
      var v = localStorage.getItem('ki-id');
      if (!v) {
        v = (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
        localStorage.setItem('ki-id', v);
      }
      return v;
    } catch (e) {
      return '';
    }
  }

  /* LINEのアプリの中のブラウザで開かれたかどうか。
   * LINEのブラウザは、自分の名前を名乗るので、それで分かる。
   * 「外部ブラウザで開く」を選ばれた場合は分からなくなる。 */
  function fromLine() {
    return /\bLine\//i.test(navigator.userAgent || '') ? 1 : 0;
  }

  var id = visitorId();
  var line = fromLine();
  var embed = (window.parent !== window) ? 1 : 0;

  /* 画像を1枚読みこむ形で送る。
   * この形はどのブラウザでも同じように動いて、返事も待たない。 */
  function send(params) {
    if (!KI.STATS_URL) return;
    try {
      var q = [];
      for (var k in params) {
        if (!params.hasOwnProperty(k)) continue;
        if (params[k] === '' || params[k] === null || params[k] === undefined) continue;
        q.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
      }
      var sep = KI.STATS_URL.indexOf('?') === -1 ? '?' : '&';
      new Image().src = KI.STATS_URL + sep + q.join('&');
    } catch (e) {
      /* 送れなくても、何事もなかったように続ける */
    }
  }

  /* 外から呼ぶのはこれだけ。app.js が色の決まったときに呼ぶ。 */
  KI.note = function (event, color) {
    var ver = pageVer();
    if (SKIP.indexOf(ver) !== -1) return;
    send({ e: event, ver: ver, color: color || '', id: id, line: line, embed: embed });
  };

  /* ページが開かれたことを、その場で1回だけ記録する。
   * 色を選ばずに帰った人も、ここで数えられる。 */
  KI.note('open');

})();
