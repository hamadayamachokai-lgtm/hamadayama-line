/* おえかきを完成させろ(quiz.js から呼ばれます)
   お題に沿って 1人 一筆ずつ描きつなぎ、最後の人が お題を当てる。一人モード(ロボットと)/対決モード(3回戦)/ギャラリー。
   絵・キャラクターはすべてオリジナルです。 */
(function () {
  'use strict';
  var A, root, tok = 0, S = null;
  var GKEY = 'hmt_draw_gal';
  var COLS = ['#e0523f', '#2f7fd1', '#2e9e6a', '#e39a1d', '#8e5bd0', '#d1569b', '#1fa0a8', '#6b7280', '#a0522d', '#4a5568'];
  var NAMES = ['モコ', 'ピポ', 'ガブ', 'ミミ', 'ポロ', 'ルル', 'ノノ', 'チョコ', 'ハチ'];
  var CSS = '#qz .drbk{position:relative;background:#fffdf5;border:2px solid #cfc7b2;border-radius:6px 6px 14px 14px;padding:26px 10px 10px;margin:0 0 10px;box-shadow:0 3px 8px rgba(0,0,0,.18)}' +
    '#qz .drbk:before{content:"";position:absolute;left:8px;right:8px;top:6px;height:14px;background:radial-gradient(circle at 10px 7px,#555 0 4px,transparent 5px) 0 0/22px 14px repeat-x}' +
    '#qz .drsv{display:block;width:100%;height:auto;touch-action:none;background:#fff;border:1px solid #e6dfca;border-radius:4px}' +
    '#qz .drbar{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 8px}#qz .drbar span{padding:2px 9px;border-radius:99px;border:2px solid #d9d2bf;background:#fff;font-size:.82em}' +
    '#qz .drbar span.on{background:#fff3c4;border-color:#e39a1d;font-weight:bold}#qz .drbar span.dn{opacity:.55}' +
    '#qz .drtheme{text-align:center;font-size:1.25em;font-weight:bold;background:#fff3c4;border:2px dashed #e39a1d;border-radius:12px;padding:6px;margin:0 0 8px}' +
    '#qz .drslot{text-align:center;font-size:2em;font-weight:bold;background:#222;color:#ffe27a;border-radius:14px;padding:14px;margin:10px 0;min-height:1.4em;letter-spacing:.05em}' +
    '#qz .drwall{background:#e9dfc8;border-radius:14px;padding:12px 8px;display:grid;grid-template-columns:1fr 1fr;gap:14px 10px}' +
    '#qz .drfr{position:relative;background:#fff;border:7px solid #b8862b;border-image:none;box-shadow:0 0 0 2px #7a5818,0 4px 8px rgba(0,0,0,.3);padding:6px;border-radius:2px}' +
    '#qz .drfr svg{display:block;width:100%;height:auto;background:#fffdf5}#qz .drpl{margin:8px auto 0;background:#f5efd8;border:1px solid #b8862b;border-radius:4px;padding:2px 6px;text-align:center;font-size:.8em;font-weight:bold}' +
    '#qz .drfr .drbg{position:absolute;right:-12px;bottom:-14px;width:46px;height:54px;background:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}#qz .drfr .drbg+.drbg{right:30px}#qz .drpal{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}#qz .drpal button{width:34px;height:34px;border-radius:50%;border:2px solid #cfc7b2;padding:0}#qz .drpal button.on{border:3px solid #222;transform:scale(1.12)}#qz .drpal input{width:40px;height:36px;padding:0;border:none;background:none}#qz .drrow{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}#qz .drrow .qb{width:auto;flex:1 1 0;min-width:0;padding:8px 2px;margin:0;font-size:.78em;white-space:nowrap}#qz .drst{display:flex;justify-content:center;gap:6px;margin-top:6px}#qz .drst button{font-size:1.3em;min-width:44px;min-height:40px;border-radius:12px;border:2px solid #d9d2bf;background:#fff;padding:0}#qz .drst button.on{background:#ffe9a8;border-color:#e39a1d}#qz .drwall3{background:#e9dfc8;border-radius:14px;padding:10px 6px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px 6px}#qz .drwall3 .drfr{border-width:4px;padding:3px}#qz .drwall3 .drpl{font-size:.7em;padding:1px 3px}#qz .drwall3 .drfr .drbg{width:28px;height:33px}#qz .drch{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}';
  function $(s) { return root.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function later(fn, ms) { var t = tok; setTimeout(function () { if (t === tok) fn(); }, ms); }

  /* ===== お題と ロボットの描き順(0〜100の座標) ===== */
  function circ(cx, cy, r, a0) { var p = [], s = a0 || 0; for (var i = 0; i <= 20; i++) { var a = s + i / 20 * Math.PI * 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
  function ell(cx, cy, rx, ry) { var p = []; for (var i = 0; i <= 20; i++) { var a = i / 20 * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
  var THEMES = [
    { n: 'たいよう', s: [circ(50, 50, 16), [[50, 12], [50, 26]], [[50, 74], [50, 88]], [[12, 50], [26, 50]], [[74, 50], [88, 50]], [[24, 24], [34, 34]], [[66, 66], [76, 76]]] },
    { n: 'いえ', s: [[[22, 85], [22, 48], [78, 48], [78, 85], [22, 85]], [[14, 50], [50, 18], [86, 50]], [[42, 85], [42, 62], [58, 62], [58, 85]], [[64, 54], [72, 54], [72, 62], [64, 62], [64, 54]]] },
    { n: 'さかな', s: [ell(46, 52, 28, 17), [[72, 52], [90, 36], [90, 68], [72, 52]], [[34, 46], [36, 48]], [[44, 36], [54, 28], [60, 38]], [[28, 56], [34, 60]]] },
    { n: 'ねこ', s: [circ(50, 55, 26), [[28, 40], [26, 16], [42, 30]], [[72, 40], [74, 16], [58, 30]], [[40, 52], [42, 54]], [[60, 52], [62, 54]], [[10, 60], [34, 62]], [[90, 60], [66, 62]]] },
    { n: 'ふじさん', s: [[[8, 82], [40, 26], [60, 26], [92, 82]], [[40, 26], [46, 36], [52, 30], [58, 38], [60, 26]], [[4, 82], [96, 82]], [[10, 20], [22, 14], [34, 20]]] },
    { n: 'くるま', s: [[[10, 66], [10, 50], [28, 50], [38, 32], [66, 32], [76, 50], [90, 50], [90, 66], [10, 66]], circ(28, 70, 9), circ(72, 70, 9), [[42, 36], [42, 50], [70, 50], [64, 36], [42, 36]]] },
    { n: 'はな', s: [circ(50, 36, 9), ell(50, 16, 8, 8), ell(30, 36, 8, 8), ell(70, 36, 8, 8), [[50, 46], [50, 88]], [[50, 70], [68, 60], [62, 76], [50, 70]]] },
    { n: 'りんご', s: [[[50, 30], [30, 26], [16, 44], [22, 72], [38, 86], [50, 80], [62, 86], [78, 72], [84, 44], [70, 26], [50, 30]], [[50, 30], [52, 14]], [[52, 18], [68, 8], [66, 22], [52, 18]]] },
    { n: 'ゆきだるま', s: [circ(50, 72, 22), circ(50, 36, 14), [[38, 24], [38, 14], [62, 14], [62, 24]], [[34, 24], [66, 24]], [[45, 34], [46, 35]], [[55, 34], [56, 35]], [[50, 38], [58, 42]]] },
    { n: 'ロケット', s: [[[50, 8], [64, 30], [64, 66], [36, 66], [36, 30], [50, 8]], circ(50, 40, 7), [[36, 56], [22, 74], [36, 70]], [[64, 56], [78, 74], [64, 70]], [[44, 70], [50, 90], [56, 70]]] },
    { n: 'ちょうちょ', s: [[[50, 30], [50, 74]], [[50, 46], [18, 18], [14, 48], [50, 54]], [[50, 46], [82, 18], [86, 48], [50, 54]], [[50, 56], [28, 84], [50, 64]], [[50, 56], [72, 84], [50, 64]], [[48, 30], [38, 16]], [[52, 30], [62, 16]]] },
    { n: 'とけい', s: [circ(50, 50, 34), [[50, 50], [50, 28]], [[50, 50], [66, 58]], [[50, 18], [50, 22]], [[82, 50], [78, 50]], [[50, 82], [50, 78]], [[18, 50], [22, 50]]] },
    { n: 'ヨット', s: [[[50, 14], [50, 70]], [[54, 18], [84, 62], [54, 62]], [[46, 26], [24, 62], [46, 62]], [[14, 70], [86, 70], [74, 84], [26, 84], [14, 70]]] },
    { n: 'ケーキ', s: [[[16, 86], [16, 56], [84, 56], [84, 86], [16, 86]], [[16, 70], [30, 64], [44, 70], [58, 64], [72, 70], [84, 64]], [[50, 56], [50, 34]], [[50, 26], [47, 32], [53, 32], [50, 26]], [[30, 56], [30, 44]], [[70, 56], [70, 44]]] }
  ];
  function jit(p) { return p.map(function (q) { return [q[0] + (Math.random() - .5) * 2.4, q[1] + (Math.random() - .5) * 2.4]; }); }

  /* ===== 絵の表示 ===== */
  function pathOf(pts) { return 'M' + pts.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L'); }
  function svgOf(strokes, id, extra) {
    return '<svg ' + (id ? 'id="' + id + '" ' : '') + 'class="drsv" viewBox="0 0 100 100">' + strokes.map(strokeSvg).join('') + (extra || '') + '</svg>';
  }
  /* 1本の線。じゆうがきでは 色(k)・太さ(w)・ブラシ(b)を使う */
  function strokeSvg(s) {
    var b = s.b || 'pen', w = +s.w || 1.9, col = b === 'eraser' ? '#fffdf5' : (s.k || COLS[s.c % COLS.length]);
    var a = { pen: [w, 1, ''], marker: [w * 2, .45, ''], crayon: [w * 1.4, .85, ' stroke-dasharray="' + (w * 2.2).toFixed(1) + ' ' + (w * .5).toFixed(1) + '"', 'butt'], pencil: [w * .5, .7, ''], eraser: [w * 3, 1, ''] }[b] || [w, 1, ''];
    return '<path d="' + pathOf(s.p) + '" fill="none" stroke="' + col + '" stroke-width="' + a[0].toFixed(1) + '" stroke-opacity="' + a[1] + '"' + a[2] + ' stroke-linecap="' + (a[3] || 'round') + '" stroke-linejoin="round"/>';
  }
  function bar(order, cur) {
    return '<div class="drbar">' + order.map(function (p, i) {
      return '<span class="' + (i === cur ? 'on' : i < cur ? 'dn' : '') + '" style="' + (i === cur ? '' : 'border-color:' + COLS[i % COLS.length]) + '">' + (i + 1) + ' ' + esc(p.name) + (i === order.length - 1 ? ' (こたえる)' : '') + '</span>';
    }).join('') + '</div>';
  }

  /* ===== バッジ(入賞) ===== */
  var BCOL = { '1位': ['#f2b705', '1'], '2位': ['#a9b0bd', '2'], '3位': ['#c8773a', '3'], '役員賞': ['#8e5bd0', '役'], '参加賞': ['#2e9e6a', '参'] };
  function badgeSvg(kind, cls) {
    var b = BCOL[kind] || BCOL['1位'];
    return '<svg class="' + (cls || 'drbg') + '" viewBox="0 0 60 70" aria-label="' + esc(kind) + '"><polygon points="16,38 6,68 18,62 24,70 30,44" fill="' + b[0] + '"/><polygon points="44,38 54,68 42,62 36,70 30,44" fill="' + b[0] + '"/><circle cx="30" cy="28" r="24" fill="' + b[0] + '" stroke="#fff" stroke-width="3"/><circle cx="30" cy="28" r="18.5" fill="none" stroke="#fff" stroke-width="1.5"/><text x="30" y="36" text-anchor="middle" font-size="24" font-weight="bold" fill="#fff" font-family="sans-serif">' + b[1] + '</text></svg>';
  }
  function frameHtml(strokes, kinds) { return '<div class="drfr">' + svgOf(strokes) + (kinds || []).map(function (k) { return badgeSvg(k); }).join('') + '</div>'; }

  /* ===== 賞状(チャットの「賞状を見る」から開く) ===== */
  var CERT_TXT = {
    '1位': ['第1位', 'もっともすぐれた作品として', '第1位に選ばれました。'],
    '2位': ['第2位', 'すばらしい作品として', '第2位に選ばれました。'],
    '3位': ['第3位', 'すばらしい作品として', '第3位に選ばれました。'],
    '役員賞': ['役員賞', '役員が心をうごかされた作品として', '役員賞に選ばれました。'],
    '参加賞': ['参加賞', 'ご参加いただきました。', 'そのがんばりをたたえ、']
  };
  function certSvg(c) {
    var t = CERT_TXT[c.kind] || CERT_TXT['参加賞'], y = c.year, lines = c.kind === '参加賞' ? ['右の作品で、', y + '年 おえかきコンクールに', t[1], t[2], 'ここに賞します。'] : ['右の作品は、', y + '年 おえかきコンクールで', t[1], t[2], 'よってここに賞します。'];
    var b = BCOL[c.kind] || BCOL['1位'], d = String(c.date || '').split('-'), ds = d.length === 3 ? d[0] + '年' + (+d[1]) + '月' + (+d[2]) + '日' : '';
    var paths = (c.s || []).map(strokeSvg).join('');
    var ff = 'font-family="\'Hiragino Mincho ProN\',\'Yu Mincho\',\'Noto Serif JP\',serif"';
    return '<svg viewBox="0 0 800 560" style="width:100%;height:auto;display:block;background:#fffaf0;border-radius:6px" ' + ff + '><rect x="14" y="14" width="772" height="532" fill="none" stroke="' + b[0] + '" stroke-width="8"/><rect x="30" y="30" width="740" height="500" fill="none" stroke="' + b[0] + '" stroke-width="2"/>' +
      '<text x="400" y="104" text-anchor="middle" font-size="54" font-weight="bold" fill="#5a3b0b" letter-spacing="14">' + (c.kind === '参加賞' ? '参加賞' : '賞状') + '</text>' +
      (c.kind === '参加賞' ? '' : '<text x="400" y="150" text-anchor="middle" font-size="30" font-weight="bold" fill="' + b[0] + '">' + esc(t[0]) + '</text>') +
      '<g transform="translate(60,176)"><rect x="-8" y="-8" width="296" height="296" fill="#fff" stroke="#b8862b" stroke-width="6"/><g transform="scale(2.8)">' + paths + '</g>' +
      '<g transform="translate(262,262) scale(1.3)"><polygon points="16,38 6,68 18,62 24,70 30,44" fill="' + b[0] + '"/><polygon points="44,38 54,68 42,62 36,70 30,44" fill="' + b[0] + '"/><circle cx="30" cy="28" r="24" fill="' + b[0] + '" stroke="#fff" stroke-width="3"/><circle cx="30" cy="28" r="18.5" fill="none" stroke="#fff" stroke-width="1.5"/><text x="30" y="36" text-anchor="middle" font-size="24" font-weight="bold" fill="#fff" font-family="sans-serif">' + b[1] + '</text></g></g>' +
      '<text x="400" y="214" font-size="26" fill="#333" font-weight="bold">' + esc(c.pen) + ' さん</text>' +
      '<text x="400" y="254" font-size="22" fill="#333">作品名 『' + esc(c.t) + '』</text>' +
      lines.map(function (l, i) { return '<text x="400" y="' + (292 + i * 32) + '" font-size="19" fill="#333">' + esc(l) + '</text>'; }).join('') +
      '<text x="400" y="458" font-size="18" fill="#555">' + esc(ds) + '</text><text x="400" y="488" font-size="22" fill="#333" font-weight="bold">浜田山町会</text><text x="400" y="512" font-size="16" fill="#555">おえかきコンクール事務局</text></svg>';
  }
  function cert(api, id) {
    var ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.6);overflow:auto;padding:14px';
    ov.innerHTML = '<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:12px"><div id="drcm" style="min-height:120px;text-align:center;padding:30px 0">よみこみ中…</div><p style="font-size:.85em;margin:8px 0;text-align:center">画面を スクリーンショットで 保存できます</p><button type="button" id="drcx" style="width:100%;min-height:48px;font-size:1em;border-radius:12px;border:2px solid #cfc7b4;background:#fff">とじる</button></div>';
    document.body.appendChild(ov); ov.querySelector('#drcx').onclick = function () { ov.remove(); };
    api.call('draw_cert', { id: id }).then(function (c) { ov.querySelector('#drcm').style.padding = '0'; ov.querySelector('#drcm').innerHTML = certSvg(c); }, function (e) { ov.querySelector('#drcm').textContent = (e && e.message) || '見られませんでした'; });
  }

  /* ===== ギャラリー ===== */
  function galLoad() { try { return JSON.parse(localStorage.getItem(GKEY) || '[]') || []; } catch (e) { return []; } }
  function galSave(w) {
    w.i = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); w.d = new Date().toISOString().slice(0, 10);
    var g = galLoad(); g.unshift(w); g = g.slice(0, 40);
    try { localStorage.setItem(GKEY, JSON.stringify(g)); } catch (e) { /* 保存できなくても遊べる */ }
  }
  function gallery() {
    tok++; var t = tok, g = galLoad(), awd = {}, posted = {}, selMode = false, pick = {}, ask = false;
    g.forEach(function (w) { if (!w.i) w.i = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }); try { localStorage.setItem(GKEY, JSON.stringify(g)); } catch (e) { /* 無視 */ }
    function paint() {
      var n = Object.keys(pick).length;
      var h = '<div class="qc"><h2>ギャラリー</h2><p style="margin:0 0 8px;font-size:.9em">いままで かいた さくひんが かざられます。(この スマホに さいだい40まい)' + (Object.keys(awd).length ? '<br>入賞した絵には バッジが つきます。バッジの下の ボタンで 賞状が 見られます。' : '') + '</p>';
      if (g.length) h += selMode ? '<div class="qgrid" style="grid-template-columns:1fr 1fr;margin:0 0 8px"><button class="qb" id="drsx">えらぶのを やめる</button><button class="qb pri" id="drsd"' + (n ? '' : ' disabled') + '>えらんだ ' + n + 'まいを けす</button></div>' + (ask ? '<div class="qfb" style="margin:0 0 8px;text-align:center"><b>' + n + 'まいを けします。もとに もどせません。</b><div class="qgrid" style="grid-template-columns:1fr 1fr;margin-top:6px"><button class="qb" id="drsn">やめる</button><button class="qb pri" id="drsy">けす</button></div></div>' : '') : '<button class="qb" id="drsm" style="margin:0 0 8px">えらんで けす</button>';
      h += g.length ? '<div class="drwall">' + g.map(function (w, k) {
        var a = awd[w.i] || [];
        return '<div' + (selMode ? ' data-p="' + k + '" style="cursor:pointer;' + (pick[k] ? 'outline:4px solid #e0523f;outline-offset:2px;border-radius:6px' : '') + '"' : '') + '>' + frameHtml(w.s, a.map(function (x) { return x.kind; })) + '<div class="drpl">' + (selMode ? (pick[k] ? '【えらんだ】 ' : '') : '') + '『' + esc(w.t) + '』' + (w.ok ? ' (せいかい)' : '') + '</div>' + (selMode ? '' : a.map(function (x) { return '<button class="qb sm" data-c="' + esc(x.id) + '" style="margin-top:4px">' + esc(x.kind) + 'の賞状</button>'; }).join('') + (posted[w.i] ? '<button class="qb sm" data-un="' + esc(posted[w.i]) + '" style="margin-top:4px">投稿を 下げる</button>' : '<button class="qb sm pri" data-po="' + k + '" style="margin-top:4px">投稿する</button>')) + '</div>';
      }).join('') + '</div>' : '<div class="drwall" style="display:block;text-align:center;padding:30px 10px">まだ さくひんが ありません。<br>1まい かいてみよう!</div>';
      h += '<button class="qb" id="drbk" style="margin-top:10px">もどる</button></div>';
      A.draw(h); $('#drbk').onclick = menu;
      A.bind('[data-c]', function (b) { cert(A, b.dataset.c); });
      A.bind('[data-po]', function (b) { postDialog(g[+b.dataset.po], gallery); });
      A.bind('[data-un]', function (b) { b.disabled = true; A.call('draw_unpost', { id: b.dataset.un }).then(function () { A.toast('下げました'); delete posted[Object.keys(posted).filter(function (k) { return posted[k] === b.dataset.un; })[0]]; paint(); }, function (e) { A.toast(e.message || 'できませんでした'); b.disabled = false; }); });
      var sm = $('#drsm'); if (sm) sm.onclick = function () { selMode = true; pick = {}; ask = false; paint(); };
      var sx = $('#drsx'); if (sx) sx.onclick = function () { selMode = false; pick = {}; ask = false; paint(); };
      var sd = $('#drsd'); if (sd) sd.onclick = function () { ask = true; paint(); };
      var sn = $('#drsn'); if (sn) sn.onclick = function () { ask = false; paint(); };
      var sy = $('#drsy'); if (sy) sy.onclick = function () {
        g = g.filter(function (w, k) { return !pick[k]; }); try { localStorage.setItem(GKEY, JSON.stringify(g)); } catch (e) { /* 保存できなくても進む */ }
        selMode = false; pick = {}; ask = false; A.toast('けしました'); paint();
      };
      A.bind('[data-p]', function (b) { var k = b.dataset.p; if (pick[k]) delete pick[k]; else pick[k] = 1; ask = false; var y = window.pageYOffset; paint(); try { window.scrollTo(0, y); } catch (e) { /* 無視 */ } });
    }
    paint();
    try { A.call('draw_posts').then(function (r) { if (t !== tok) return; (r.list || []).forEach(function (x) { if (x.mine && x.gi) posted[x.gi] = x.id; }); if (!selMode) paint(); }).catch(function () { /* 投稿ボタンのままでOK */ }); } catch (e) { /* 無視 */ }
    try { A.call('draw_awards').then(function (r) { if (t !== tok) return; (r.list || []).forEach(function (x) { if (x.gi) (awd[x.gi] = awd[x.gi] || []).push(x); }); if (Object.keys(awd).length && !selMode) paint(); }).catch(function () { /* バッジなしでOK */ }); } catch (e) { /* 無視 */ }
  }
  /* ===== コンクール(毎年12月) 出品 12/1〜12/14、投票 12/15〜12/25、結果 12/26〜 ===== */
  function contestPhase() {
    var d = new Date(), md = (d.getMonth() + 1) * 100 + d.getDate();
    return md >= 1201 && md <= 1214 ? 'submit' : md >= 1215 && md <= 1225 ? 'vote' : md >= 1226 ? 'result' : '';
  }
  /* コンクールの入口: 毎年12月の大会+イベントごとのおえかき展示 */
  var EVN = [['oshogatsu', 'お正月', 1], ['setsubun', '節分', 2], ['hinamatsuri', 'ひな祭り', 3], ['kodomo', 'こどもの日', 5], ['haha', '母の日', 5], ['chichi', '父の日', 6], ['keirou', '敬老の日', 9], ['sports', 'スポーツの日', 10], ['xmas', 'クリスマス', 12]];
  function stampsHtml(id, st) {
    return '<div class="drst">' + [['heart', '❤️'], ['smile', '😊'], ['thumb', '👍']].map(function (x) { return '<button type="button" data-sid="' + esc(id) + '" data-s="' + x[0] + '" class="' + ((st || []).indexOf(x[0]) >= 0 ? 'on' : '') + '" aria-label="スタンプ">' + x[1] + '</button>'; }).join('') + '</div>';
  }
  function bindStamps() {
    A.bind('[data-s]', function (b) { A.call('draw_stamp', { id: b.dataset.sid, k: b.dataset.s }).then(function (r) { b.classList.toggle('on', !!r.on); }, function (e) { A.toast(e.message || 'おせませんでした'); }); });
  }
  function evNow() {
    var mon = new Date().getMonth() + 1, ns = EVN.filter(function (x) { return x[2] === mon; }).map(function (x) { return x[1]; });
    return ns.length ? '<span style="display:block;background:#fff3c4;border:2px dashed #e39a1d;border-radius:10px;padding:6px 8px;margin:6px 0;font-weight:bold">ただいま、' + ns.join('・') + 'の絵を募集中だよ!<br>みんな投稿してね!投稿したものは みんなのコンクールボタンから 見れるよ</span>' : '';
  }
  function contest() {
    tok++; var t = tok, pc = contestPhase(), cnt = {}, mon = new Date().getMonth() + 1;
    function paint() {
      var h = '<div class="qc"><h2>みんなのコンクール</h2><p style="font-size:.88em;line-height:1.6;margin:0 0 8px">よくかけた! という絵を 投稿すると、みんなに 見てもらえます。気に入った絵には スタンプを おしてね。</p>' +
        '<button class="qb' + (pc ? ' pri' : '') + '" id="drye">大賞コンクール(毎年12月)' + (pc === 'submit' ? ' 出品受付中' : pc === 'vote' ? ' 投票受付中' : pc === 'result' ? ' 結果発表' : '') + '</button><p style="font-size:.78em;margin:2px 0 10px;opacity:.8">お題ゲームで かいた絵だけ。みんなで がんばったね、の賞です。</p>' +
        '<h3 style="margin:10px 0 4px">みんなの投稿(1週間 のります)</h3><div class="drch"><button class="qb" data-po="お題ゲーム">お題ゲーム部門</button><button class="qb" data-po="個人部門">個人部門<span style="display:block;font-size:.75em;font-weight:normal">自由に かいた絵</span></button></div>' +
        '<h3 style="margin:14px 0 4px">○○の日コンクール</h3><p style="font-size:.85em;line-height:1.6;margin:0 0 8px">イベントの月に 絵を かいて 出品すると、みんなの絵が ここに 貼られます。(受賞の お知らせは ありません)<br>貼られた絵は、1年たって 次の コンクールが おわると 新しい絵に 張りかわります。</p><div class="drch">';
      h += EVN.map(function (x) { return '<button class="qb' + (x[2] === mon ? ' pri' : '') + '" data-e="' + x[0] + '">' + esc(x[1]) + '<span style="display:block;font-size:.75em;font-weight:normal">' + x[2] + '月' + (x[2] === mon ? ' 募集中' : cnt[x[0]] ? ' ' + cnt[x[0]] + '点' : '') + '</span></button>'; }).join('');
      h += '</div><button class="qb" id="drbk" style="margin-top:10px">もどる</button></div>';
      A.draw(h); $('#drye').onclick = yearContest; $('#drbk').onclick = menu;
      A.bind('[data-e]', function (b) { evView(b.dataset.e); });
      A.bind('[data-po]', function (b) { postsView(b.dataset.po); });
    }
    paint();
    try { A.call('draw_ev_list').then(function (r) { if (t !== tok) return; (r.list || []).forEach(function (x) { cnt[x.k] = x.count; }); paint(); }).catch(function () { /* 件数なしでOK */ }); } catch (e) { /* 無視 */ }
  }
  /* みんなの投稿(お題ゲーム部門・個人部門) */
  function postsView(div) {
    tok++; var t = tok; A.draw('<div class="qc">よみこみ中…</div>');
    A.call('draw_posts').then(function (r) {
      if (t !== tok) return; var list = (r.list || []).filter(function (x) { return x.div === div; });
      var h = '<div class="qc"><h2>' + esc(div) + '</h2><p style="font-size:.85em;line-height:1.6;margin:0 0 8px">' + (div === '個人部門' ? '自由に かいた絵が のります。' : 'お題ゲームで かいた絵が のります。') + '投稿は 1週間 のります。(投稿は ギャラリーから できます)</p>';
      h += list.length ? '<div class="drwall">' + list.map(function (w, k) { return '<div>' + frameHtml(w.s) + '<div class="drpl">『' + esc(w.t) + '』<br><span style="font-weight:normal">' + esc(w.pen) + '</span></div>' + stampsHtml(w.id, w.st) + (w.mine ? '<button class="qb sm" data-un="' + k + '" style="margin-top:6px">投稿を 下げる</button>' : '') + '</div>'; }).join('') + '</div>' : '<div class="drwall" style="display:block;text-align:center;padding:26px 10px">いま 投稿された絵は ありません。<br>ギャラリーから 投稿してみよう!</div>';
      h += '<button class="qb" id="drbk" style="margin-top:10px">もどる</button></div>';
      A.draw(h); $('#drbk').onclick = contest; bindStamps();
      A.bind('[data-un]', function (b) { b.disabled = true; A.call('draw_unpost', { id: list[+b.dataset.un].id }).then(function () { A.toast('下げました'); postsView(div); }, function (e) { A.toast(e.message || 'できませんでした'); b.disabled = false; }); });
    }, function (e) { if (t !== tok) return; A.toast(e.message || '通信できませんでした'); contest(); });
  }
  /* ギャラリーの絵を投稿する */
  function postDialog(w, back) {
    var pen = ''; try { pen = localStorage.getItem('hmt_draw_pen') || ''; } catch (e) { /* 無視 */ }
    A.draw('<div class="qc"><h2>みんなのコンクールに 投稿</h2><div class="drbk">' + svgOf(w.s) + '</div><p style="text-align:center;font-weight:bold">『' + esc(w.t) + '』</p><p style="font-size:.85em;line-height:1.6;margin:0 0 8px">' + (w.f ? '個人部門' : 'お題ゲーム部門') + 'に 1週間 のります。いつでも 下げられます。</p><div class="qm">ペンネーム(10文字まで)</div><input id="drpn" maxlength="10" value="' + esc(pen) + '" style="width:100%;box-sizing:border-box;min-height:48px;font-size:1.1em;padding:8px;border:2px solid #cfc7b4;border-radius:12px;margin:4px 0 10px"><button class="qb pri" id="drpg">投稿する</button><button class="qb" id="drpx">やめる</button></div>');
    $('#drpx').onclick = back;
    $('#drpg').onclick = function () {
      var pn = ($('#drpn').value || '').trim(); if (!pn) return A.toast('ペンネームを いれてね');
      this.disabled = true; try { localStorage.setItem('hmt_draw_pen', pn); } catch (e) { /* 無視 */ }
      A.call('draw_post', { pen: pn, works: [{ t: w.t, s: w.s, g: w.i, f: w.f ? 1 : 0 }] }).then(function () { A.toast('投稿しました'); xp(1); back(); }, function (e) { A.toast(e.message || '投稿できませんでした'); $('#drpg').disabled = false; });
    };
  }
  function evView(k) {
    tok++; var t = tok; A.draw('<div class="qc">よみこみ中…</div>');
    A.call('draw_ev_get', { k: k }).then(function (r) {
      if (t !== tok) return;
      var h = '<div class="qc"><h2>' + esc(r.n) + ' のおえかき</h2>';
      if (r.open) {
        h += '<p style="font-size:.9em;line-height:1.6">' + r.m + '月は ' + esc(r.n) + ' の 出品月です。自由に絵を かいて、出品してね。(1つのイベントに 2点まで)</p><button class="qb pri" id="dregen">絵を かく(出品する)</button>';
        if (r.mine.length) h += '<div style="margin:8px 0"><b>出品ずみ</b>' + r.mine.map(function (w, i) { return '<div style="display:flex;gap:8px;align-items:center;margin:4px 0">『' + esc(w.t) + '』<button class="qb sm" data-w="' + i + '" style="margin-left:auto">取り下げる</button></div>'; }).join('') + '</div>';
      } else h += '<p style="font-size:.9em;line-height:1.6">出品できるのは ' + r.m + '月です。</p>';
      h += '<h3 style="margin:12px 0 6px">みんなの絵(' + r.works.length + '点)</h3>' + (r.works.length ? '<div class="drwall">' + r.works.map(function (w) { return '<div>' + frameHtml(w.s) + '<div class="drpl">『' + esc(w.t) + '』<br><span style="font-weight:normal">' + esc(w.pen) + '</span></div>' + stampsHtml(w.id, w.st) + '</div>'; }).join('') + '</div>' : '<div class="drwall" style="display:block;text-align:center;padding:26px 10px">まだ 絵が 貼られていません。</div>');
      h += '<button class="qb" id="drbk" style="margin-top:10px">もどる</button></div>';
      A.draw(h); $('#drbk').onclick = contest; bindStamps();
      var g = $('#dregen'); if (g) g.onclick = function () { freeDraw({ ev: k, name: r.n, pen: r.pen }); };
      A.bind('[data-w]', function (b) { b.disabled = true; A.call('draw_ev_withdraw', { id: r.mine[+b.dataset.w].id }).then(function () { A.toast('取り下げました'); evView(k); }, function (e) { A.toast(e.message || 'できませんでした'); b.disabled = false; }); });
    }, function (e) { if (t !== tok) return; A.toast(e.message || '通信できませんでした'); contest(); });
  }

  /* ===== ひとりでかくモード(じゆうがき): 色・太さ・ブラシを えらべる ===== */
  var PAL = ['#222222', '#e0523f', '#f08a3c', '#f7c843', '#62c46a', '#2e9e6a', '#3d7ff5', '#1b3f9a', '#a56bd8', '#d9669b', '#8b5a2b', '#ffffff'];
  var BRS = [['pen', 'ペン'], ['marker', 'マーカー'], ['crayon', 'クレヨン'], ['pencil', 'えんぴつ'], ['eraser', '消しゴム']];
  var WS = [['細い', 1], ['ふつう', 2], ['太い', 3.5], ['極太', 6]];
  function simp(pts, tol) {   // 線の点を へらす(Ramer-Douglas-Peucker)
    if (pts.length < 3) return pts;
    var keep = new Array(pts.length), st = [[0, pts.length - 1]]; keep[0] = keep[pts.length - 1] = 1;
    while (st.length) {
      var se = st.pop(), a = pts[se[0]], b = pts[se[1]], mx = 0, mi = -1, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy) || 1e-6;
      for (var i = se[0] + 1; i < se[1]; i++) { var d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / L; if (d > mx) { mx = d; mi = i; } }
      if (mx > tol && mi > 0) { keep[mi] = 1; st.push([se[0], mi], [mi, se[1]]); }
    }
    return pts.filter(function (p, i) { return keep[i]; });
  }
  function freeDraw(ctx) {
    ctx = ctx || {}; tok++;
    var strokes = [], brush = 'pen', color = PAL[0], wi = 1, cur = null, drawing = false;
    A.draw('<div class="qc"><h2>' + (ctx.ev ? esc(ctx.name) + ' の絵' : 'ひとりでかくモード') + '</h2><p style="font-size:.85em;margin:0 0 6px">' + (ctx.ev ? 'お題: ' + esc(ctx.name) + '。' : '') + '自由に かいてね。</p>' +
      '<div class="drbk"><svg id="drsv" class="drsv" viewBox="0 0 100 100"></svg></div>' +
      '<div class="drpal" id="drpal">' + PAL.map(function (c, i) { return '<button type="button" data-c="' + c + '" aria-label="色' + (i + 1) + '" style="background:' + c + '"></button>'; }).join('') + '<input type="color" id="drcc" value="#ff0000" aria-label="好きな色"></div>' +
      '<div class="drrow" id="drbr">' + BRS.map(function (b) { return '<button type="button" class="qb sm' + (b[0] === 'pen' ? ' pri' : '') + '" data-b="' + b[0] + '">' + b[1] + '</button>'; }).join('') + '</div>' +
      '<div class="drrow" id="drwd">' + WS.map(function (w, i) { return '<button type="button" class="qb sm' + (i === 1 ? ' pri' : '') + '" data-w="' + i + '">' + w[0] + '</button>'; }).join('') + '</div>' +
      '<div class="qgrid" style="grid-template-columns:1fr 1fr;margin-top:6px"><button class="qb" id="drun">ひとつ もどす</button><button class="qb" id="drall">ぜんぶ けす</button></div>' +
      '<div class="qm" style="margin-top:10px">題名</div><input id="drtt" maxlength="20" value="' + esc(ctx.ev ? ctx.name : 'じゆうがき') + '" style="width:100%;box-sizing:border-box;min-height:44px;font-size:1em;padding:6px 10px;border:2px solid #cfc7b4;border-radius:12px">' +
      (ctx.ev ? '<div class="qm" style="margin-top:8px">ペンネーム(10文字まで)</div><input id="drpn" maxlength="10" value="' + esc(ctx.pen || '') + '" style="width:100%;box-sizing:border-box;min-height:44px;font-size:1em;padding:6px 10px;border:2px solid #cfc7b4;border-radius:12px">' : '') +
      '<button class="qb pri" id="drsv2" style="margin-top:10px">ギャラリーに かざる</button>' + (ctx.ev ? '<button class="qb pri" id="drev">ギャラリーに かざって ' + esc(ctx.name) + ' に出品する</button>' : '') + '<button class="qb" id="drbk">もどる</button></div>');
    var sv = $('#drsv');
    function cs() { return { b: brush, k: color, w: WS[wi][1] }; }
    function paint() { sv.innerHTML = strokes.map(strokeSvg).join('') + (cur ? strokeSvg({ p: cur, c: 0, b: brush, k: color, w: WS[wi][1] }) : ''); }
    function xy(e) { var r = sv.getBoundingClientRect(); return [Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)), Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100))]; }
    sv.onpointerdown = function (e) { e.preventDefault(); drawing = true; cur = [xy(e)]; try { sv.setPointerCapture(e.pointerId); } catch (x) { /* 無視 */ } paint(); };
    sv.onpointermove = function (e) { if (!drawing) return; e.preventDefault(); cur.push(xy(e)); paint(); };
    sv.onpointerup = sv.onpointercancel = function () {
      if (!drawing) return; drawing = false;
      if (cur && cur.length) { var p = simp(cur, .25); if (p.length > 150) { var k = Math.ceil(p.length / 150); p = p.filter(function (q, i) { return i % k === 0 || i === p.length - 1; }); } var s = cs(); s.c = strokes.length; s.p = p.map(function (q) { return [Math.round(q[0] * 10) / 10, Math.round(q[1] * 10) / 10]; }); if (s.p.length === 1) s.p.push([s.p[0][0] + .1, s.p[0][1]]); strokes.push(s); }
      cur = null; paint();
    };
    function sel(box, attr, val) { Array.prototype.forEach.call($(box).querySelectorAll('[' + attr + ']'), function (x) { x.classList.toggle('pri', x.getAttribute(attr) === String(val)); }); }
    A.bind('#drpal [data-c]', function (b) { color = b.dataset.c; if (brush === 'eraser') { brush = 'pen'; sel('#drbr', 'data-b', 'pen'); } Array.prototype.forEach.call(root.querySelectorAll('#drpal [data-c]'), function (x) { x.classList.toggle('on', x === b); }); });
    $('#drcc').oninput = function () { color = this.value; if (brush === 'eraser') { brush = 'pen'; sel('#drbr', 'data-b', 'pen'); } };
    A.bind('#drbr [data-b]', function (b) { brush = b.dataset.b; sel('#drbr', 'data-b', brush); });
    A.bind('#drwd [data-w]', function (b) { wi = +b.dataset.w; sel('#drwd', 'data-w', wi); });
    $('#drun').onclick = function () { strokes.pop(); paint(); };
    $('#drall').onclick = function () { strokes = []; paint(); };
    $('#drbk').onclick = ctx.ev ? function () { evView(ctx.ev); } : menu;
    function keep() {
      if (!strokes.length) { A.toast('まだ なにも かいていません'); return null; }
      if (JSON.stringify(strokes).length > 36000) { A.toast('絵が こまかすぎます。すこし へらしてね'); return null; }
      return { t: ($('#drtt').value || '').trim() || 'じゆうがき', s: strokes };
    }
    $('#drsv2').onclick = function () { var w = keep(); if (!w) return; galSave({ t: w.t, ok: 0, f: 1, s: w.s }); A.toast('ギャラリーに かざりました'); xp(2); $('#drsv2').disabled = true; };
    var ev = $('#drev'); if (ev) ev.onclick = function () {
      var w = keep(), pn = ($('#drpn').value || '').trim(); if (!w) return; if (!pn) return A.toast('ペンネームを いれてね');
      ev.disabled = true; galSave({ t: w.t, ok: 0, f: 1, s: w.s });
      A.call('draw_ev_submit', { k: ctx.ev, pen: pn, works: [{ t: w.t, s: w.s }] }).then(function () { try { localStorage.setItem('hmt_draw_pen', pn); } catch (e) { /* 無視 */ } A.toast('出品しました'); xp(3); evView(ctx.ev); }, function (e) { A.toast(e.message || '出品できませんでした'); ev.disabled = false; });
    };
    paint();
  }

  function yearContest() {
    tok++; var t = tok;
    A.draw('<div class="qc">よみこみ中…</div>');
    A.call('draw_contest').then(function (r) { if (t !== tok) return; contestView(r); }, function (e) { if (t !== tok) return; A.toast(e.message || '通信できませんでした'); menu(); });
  }
  function cback(h) { return h + '<button class="qb" id="drbk" style="margin-top:10px">もどる</button>'; }
  function contestView(r) {
    var ph = r.phase, y = r.year || new Date().getFullYear();
    if (ph === 'none') {
      A.draw(cback('<div class="qc"><h2>大賞コンクール</h2><p style="line-height:1.7">毎年12月に開催します。(お題ゲームで かいた絵だけ。みんなで がんばったね、の賞です)<br>出品: 12月1日〜14日(ペンネームで出品)<br>投票: 12月15日〜25日<br>結果発表: 12月26日〜<br><br>それまで、お題ゲームで 絵を ためておいてね。</p></div>')); $('#drbk').onclick = contest; return;
    }
    if (ph === 'submit') return contestSubmit(r, y);
    var html = '<div class="qc"><h2>' + y + ' 大賞コンクール ' + (ph === 'vote' ? '投票' : '結果') + '</h2>' + (ph === 'vote' ? '<p style="font-size:.9em">いちばん 好きな 絵に 1票。ご自分の作品には 入れられません。(投票は 12月25日まで 変えられます)</p>' : r.fin ? '<p style="font-size:.9em">たくさんの ご参加 ありがとうございました!</p>' : '<p style="font-size:.9em">ただいま 結果を まとめています。しばらく おまちください。</p>');
    var cap = function (w) { return '<div class="drpl">『' + esc(w.t) + '』<br><span style="font-weight:normal">' + esc(w.pen) + (r.showV ? ' / ' + w.v + '票' : '') + '</span></div>'; };
    if (ph === 'result' && r.fin) {
      var has = function (w, k) { return w.aw.indexOf(k) >= 0; }, top = r.works.filter(function (w) { return has(w, '1位'); }), sec = r.works.filter(function (w) { return !has(w, '1位') && (has(w, '2位') || has(w, '3位')); }), rest = r.works.filter(function (w) { return top.indexOf(w) < 0 && sec.indexOf(w) < 0; });
      if (top.length) html += '<div style="text-align:center;font-weight:bold;font-size:1.1em;margin:4px 0">大賞</div>' + top.map(function (w) { return '<div style="max-width:300px;margin:0 auto 12px">' + frameHtml(w.s, w.aw) + cap(w) + '</div>'; }).join('');
      if (sec.length) html += '<div class="drwall">' + sec.map(function (w) { return '<div>' + frameHtml(w.s, w.aw) + cap(w) + '<div style="text-align:center;font-weight:bold">' + esc(w.aw.join('・')) + '</div></div>'; }).join('') + '</div>';
      if (rest.length) html += '<div style="margin:12px 0 4px;font-weight:bold">ほかの 作品</div><div class="drwall3">' + rest.map(function (w) { return '<div>' + frameHtml(w.s, w.aw) + cap(w) + '</div>'; }).join('') + '</div>';
      if (!r.works.length) html += '<div class="drwall" style="display:block;text-align:center;padding:30px 10px">出品された作品は ありませんでした。</div>';
    } else {
      html += r.works.length ? '<div class="drwall">' + r.works.map(function (w, k) {
        return '<div>' + frameHtml(w.s, w.aw) + cap(w) + (ph === 'vote' ? (w.mine ? '<div class="qm" style="text-align:center">あなたの作品</div>' : '<button class="qb' + (r.voted === w.id ? ' pri' : '') + ' sm" data-v="' + k + '" style="margin-top:6px">' + (r.voted === w.id ? '投票ずみ' : '投票する') + '</button>') : '') + '</div>';
      }).join('') + '</div>' : '<div class="drwall" style="display:block;text-align:center;padding:30px 10px">出品された作品は ありませんでした。</div>';
    }
    A.draw(cback(html + '</div>'));
    $('#drbk').onclick = contest;
    A.bind('[data-v]', function (b) {
      var w = r.works[+b.dataset.v]; b.disabled = true;
      A.call('draw_vote', { id: w.id }).then(function () { A.toast('投票しました'); yearContest(); }, function (e) { A.toast(e.message || '投票できませんでした'); b.disabled = false; });
    });
  }
  function contestSubmit(r, y) {
    var g = galLoad().filter(function (w) { return !w.f; }), room = 3 - r.mine.length, pen = r.pen || '', rep = '';
    try { pen = pen || localStorage.getItem('hmt_draw_pen') || ''; } catch (e) { /* 無視 */ }
    function paint() {
      var h = '<div class="qc"><h2>' + y + ' 大賞コンクール 出品</h2><p style="font-size:.9em;line-height:1.6">出品は 12月14日まで(1人3点まで)。投票は 12月15日から。名前は <b>ペンネーム</b>で 出ます。<br><b>大賞コンクールは、お題ゲームで かいた絵だけ です。みんなで がんばったね、の賞です。みんなでモード・オンラインモードで かいた絵も、出品した人の作品として あつかわれ、受賞も 出品した人のものに なります。</b><br><b>エントリーは 取り下げできません。出品期間中は、絵の 入れ替えが できます。</b></p>';
      h += '<div class="qm">ペンネーム(10文字まで)</div><input id="drpen" maxlength="10" value="' + esc(pen) + '" style="width:100%;box-sizing:border-box;min-height:48px;font-size:1.1em;padding:8px;border:2px solid #cfc7b4;border-radius:12px;margin:4px 0 12px">';
      if (r.mine.length) h += '<b>出品ずみ(' + r.mine.length + '点)</b><div class="drwall" style="margin:6px 0 12px">' + r.mine.map(function (w, k) { return '<div><div class="drfr">' + svgOf(w.s) + '</div><div class="drpl">『' + esc(w.t) + '』</div><button class="qb sm' + (rep === w.id ? ' pri' : '') + '" data-r="' + k + '" style="margin-top:6px">' + (rep === w.id ? '入れ替える絵を えらぶ' : '絵を 入れ替える') + '</button></div>'; }).join('') + '</div>';
      if (rep || room > 0) {
        h += '<b>' + (rep ? '入れ替える絵を 1つ えらぶ' : 'お題ゲームの絵から えらぶ(あと' + room + '点)') + '</b>' + (g.length ? '<div class="drwall" style="margin:6px 0 12px">' + g.map(function (w, k) { return '<label style="display:block"><div class="drfr">' + svgOf(w.s) + '</div><div class="drpl">『' + esc(w.t) + '』</div><div style="text-align:center;margin-top:4px"><input type="' + (rep ? 'radio' : 'checkbox') + '" name="drg" data-g="' + k + '" style="width:22px;height:22px"> えらぶ</div></label>'; }).join('') + '</div>' : '<p>お題ゲームで かいた絵が ありません。お題ゲームを あそぶと ギャラリーに たまります。</p>');
        h += '<button class="qb pri" id="drsub"' + (g.length ? '' : ' disabled') + '>' + (rep ? 'この絵に 入れ替える' : 'この絵を 出品する') + '</button>' + (rep ? '<button class="qb" id="drrx">入れ替えを やめる</button>' : '');
      } else h += '<p>3点 出品ずみです。</p>';
      A.draw(cback(h + '</div>')); $('#drbk').onclick = contest;
      A.bind('[data-r]', function (b) { pen = ($('#drpen').value || pen); rep = r.mine[+b.dataset.r].id; paint(); });
      var rx = $('#drrx'); if (rx) rx.onclick = function () { pen = ($('#drpen').value || pen); rep = ''; paint(); };
      var sb = $('#drsub'); if (sb) sb.onclick = function () {
        var pn = ($('#drpen').value || '').trim(), sel = Array.prototype.filter.call(root.querySelectorAll('[data-g]'), function (c) { return c.checked; }).map(function (c) { return g[+c.dataset.g]; });
        if (!pn) return A.toast('ペンネームを いれてね');
        if (!sel.length) return A.toast('出品する絵に チェックしてね');
        if (!rep && sel.length > room) return A.toast('あと' + room + '点まで えらべます');
        try { localStorage.setItem('hmt_draw_pen', pn); } catch (e) { /* 無視 */ }
        sb.disabled = true;
        var p = rep ? A.call('draw_replace', { id: rep, work: { t: sel[0].t, s: sel[0].s, g: sel[0].i || '', f: 0 } }) : A.call('draw_submit', { pen: pn, works: sel.map(function (w) { return { t: w.t, s: w.s, g: w.i || '', f: 0 }; }) });
        p.then(function () { A.toast(rep ? '入れ替えました' : '出品しました'); yearContest(); }, function (e) { A.toast(e.message || 'できませんでした'); sb.disabled = false; });
      };
    }
    paint();
  }

  /* 去年の1位の絵を、トップ画像のイーゼル(右の白い画用紙)の上に重ねる。位置はイーゼルの絵に合わせた割合(left/top/width/height %) */
  var EASEL = { l: 36.5, t: 49.5, w: 31.5, h: 37 };
  function topWin(w) {
    var box = root.querySelector('.drtop'); if (!box || box.querySelector('.drwin')) return;
    var img = box.querySelector('img'), has = img && img.style.display !== 'none' && img.getAttribute('src');
    var o = document.createElement('div'); o.className = 'drwin';
    if (has) { o.style.cssText = 'position:absolute;left:' + EASEL.l + '%;top:' + EASEL.t + '%;width:' + EASEL.w + '%;height:' + EASEL.h + '%;background:#fff'; o.innerHTML = svgOf(w.s).replace('class="drsv"', 'style="width:100%;height:100%;display:block;background:#fff"') + badgeSvg('1位').replace('class="drbg"', 'style="position:absolute;right:-6%;bottom:-6%;width:26%;height:auto"'); }
    else { o.style.cssText = 'padding:10px'; o.innerHTML = '<div class="drfr" style="margin:0 auto;max-width:240px">' + svgOf(w.s) + badgeSvg('1位') + '</div>'; }
    box.appendChild(o);
    var cap = document.createElement('div'); cap.style.cssText = 'text-align:center;font-size:.85em;margin:6px 0 0'; cap.innerHTML = esc(w.year) + '年コンクール 1位『' + esc(w.t) + '』 ' + esc(w.pen); box.parentNode.insertBefore(cap, box.nextSibling);
  }
  /* ===== メニュー ===== */
  function menu() {
    tok++;
    var pc = contestPhase();
    A.draw('<div class="qc"><div class="drtop" style="position:relative;margin:-4px -4px 8px"><img src="draw-top.jpg?v=1" alt="" style="display:none;width:100%;height:auto;border-radius:14px"></div>' +
      '<p style="font-size:.95em;line-height:1.7;margin:0 0 12px"><b>画伯のみんな!</b><br>' + evNow() + 'お題に沿って みんなで絵を完成させよう<br>ひとりで全部書いちゃうと次の人が困るから<br>よ〜く考えてね🤭<br><br>最後のひとはお題は何か答えるんだよ<br><br>描いた絵はあなた専用のギャラリーに飾られるよ<br>1年間で、お気に入りの絵は毎年12月に開催するコンクールに出してみよう!</p>' +
      '<button class="qb pri" id="drsolo">一人モード</button><button class="qb pri" id="drvs">みんなでモード</button><button class="qb pri" id="drnet">オンラインモード</button><button class="qb pri" id="drfree">ひとりでかくモード</button><button class="qb" id="drgal">🎨ギャラリー</button><button class="qb' + (pc ? ' pri' : '') + '" id="drcon">みんなのコンクール' + (pc === 'submit' ? '(出品受付中)' : pc === 'vote' ? '(投票受付中)' : pc === 'result' ? '(結果発表)' : '') + '</button><button class="qb" id="drhome">もどる</button></div>');
    try { var tt = tok; A.call('draw_top').then(function (r) { if (tt !== tok) return; var im = root.querySelector('img'), win = r && r.win && r.win.s ? r.win : null; if (r && r.url && im) { im.onerror = function () { this.style.display = 'none'; if (win && tt === tok) topWin(win); }; im.onload = function () { this.style.display = 'block'; if (win && tt === tok) topWin(win); }; im.src = r.url; } else if (win) topWin(win); }).catch(function () { /* 画像なしでOK */ }); } catch (e) { /* 無視 */ }
    $('#drsolo').onclick = soloSetup; $('#drvs').onclick = vsSetup; $('#drnet').onclick = netSetup; $('#drfree').onclick = function () { freeDraw(); }; $('#drgal').onclick = gallery; $('#drcon').onclick = contest; $('#drhome').onclick = function () { tok++; A.hub(); };
  }
  function opts(name, lo, hi, def, unit) {
    var h = '<div class="drch">';
    for (var i = lo; i <= hi; i++) h += '<button class="qb' + (i === def ? ' pri' : '') + '" data-n="' + i + '">' + i + unit + '</button>';
    return h + '</div>';
  }
  function soloSetup() {
    var n = 3;
    A.draw('<div class="qc"><h2>一人モード</h2><p>ロボットの 人数を えらんでね(3〜8)</p><div id="dro">' + opts('r', 3, 8, 3, '人') + '</div><button class="qb pri" id="drgo">はじめる</button><button class="qb" id="drbk">もどる</button></div>');
    A.bind('[data-n]', function (b) { n = +b.dataset.n; Array.prototype.forEach.call(root.querySelectorAll('[data-n]'), function (x) { x.classList.toggle('pri', x === b); }); });
    $('#drgo').onclick = function () { S = { mode: 'solo', n: n + 1 }; soloRound(); }; $('#drbk').onclick = menu;
  }
  function vsSetup() {
    var n = 3;
    A.draw('<div class="qc"><h2>みんなでモード</h2><p>1チームの 人数を えらんでね。あなたの チームと ロボットの チームで 3回戦です。人数が たりない ところは ロボットが はいります。</p><div id="dro">' + opts('t', 2, 5, 3, '').replace(/data-n="(\d)">\d/g, 'data-n="$1">$1 VS $1')+ '</div><button class="qb pri" id="drgo">はじめる</button><button class="qb" id="drbk">もどる</button></div>');
    A.bind('[data-n]', function (b) { n = +b.dataset.n; Array.prototype.forEach.call(root.querySelectorAll('[data-n]'), function (x) { x.classList.toggle('pri', x === b); }); });
    $('#drgo').onclick = function () { S = { mode: 'vs', n: n, round: 1, a: 0, b: 0, used: [] }; vsRound(); }; $('#drbk').onclick = menu;
  }

  /* ===== チームを つくる ===== */
  function mkTeam(n, withMe, names) {
    var nm = shuffle(names), t = [];
    for (var i = 0; i < n; i++) t.push(withMe && i === 0 ? { name: 'あなた', me: true } : { name: nm.pop(), me: false });
    return t;
  }
  function newTheme() {
    var left = THEMES.filter(function (t) { return !S.recent || S.recent.indexOf(t.n) < 0; });
    var t = pick(left.length ? left : THEMES); S.recent = (S.recent || []).concat(t.n).slice(-6); return t;
  }
  /* ルーレット(円盤): 1ばんめから じゅんに まわして きめる。fixed があれば その順に とまる */
  var WCOL = ['#e84560', '#f7c843', '#3d7ff5', '#62c46a', '#a56bd8', '#f08a3c', '#2cb5b0', '#d9669b', '#8aa0b5'];
  function wheelSvg(names) {
    var n = names.length, R = 100, seg = 360 / n, h = '<svg viewBox="-110 -125 220 235" style="width:100%;max-width:300px;display:block;margin:0 auto"><circle r="106" fill="#fff" filter="none" stroke="#e3e6ec" stroke-width="2"/><g id="drwg">';
    for (var k = 0; k < n; k++) {
      var a0 = (k * seg - 90) * Math.PI / 180, a1 = ((k + 1) * seg - 90) * Math.PI / 180, mid = (k + .5) * seg;
      h += '<path d="M0 0L' + (R * Math.cos(a0)).toFixed(2) + ' ' + (R * Math.sin(a0)).toFixed(2) + 'A' + R + ' ' + R + ' 0 ' + (seg > 180 ? 1 : 0) + ' 1 ' + (R * Math.cos(a1)).toFixed(2) + ' ' + (R * Math.sin(a1)).toFixed(2) + 'Z" fill="' + WCOL[k % WCOL.length] + '"/>' +
        '<text transform="rotate(' + (mid - 90) + ') translate(' + (n <= 2 ? 40 : 52) + ' 0)" fill="#fff" font-weight="bold" font-size="' + (n > 6 ? 10 : 13) + '" text-anchor="middle" dominant-baseline="middle">' + esc(names[k].length > 6 ? names[k].slice(0, 6) : names[k]) + '</text>';
    }
    return h + '</g><circle r="17" fill="#fff" stroke="#e3e6ec" stroke-width="2"/><circle r="8" fill="#e8e8ee"/><path d="M-9 -118L9 -118L0 -97Z" fill="#f0524f"/></svg>';
  }
  function roulette(team, done, fixed) {
    var order = fixed || shuffle(team), pool = order.slice(), left = order.map(function (p) { return p; }), k = 0, busy = false;
    function paintBase(msg) {
      A.draw('<div class="qc" style="text-align:center"><h2>じゅんばん ルーレット</h2><div id="drwh"></div><button class="qb pri" id="drsp" style="max-width:260px;margin:12px auto 4px">スタート</button><div class="qm" id="drst" style="min-height:1.4em">' + (msg || 'じゅんばんを きめます') + '</div><div id="drod" class="drbar" style="justify-content:center"></div></div>');
    }
    paintBase();
    function show() { $('#drwh').innerHTML = wheelSvg(left.map(function (p) { return p.name; })); }
    show();
    function spin() {
      if (busy) return; busy = true; var sp = $('#drsp'); if (sp) sp.style.visibility = 'hidden';
      var want = order[k], idx = left.indexOf(want), n = left.length, seg = 360 / n;
      var angle = 360 * 5 - (idx + .5) * seg + (Math.random() - .5) * seg * .6, g = $('#drwg');
      $('#drst').textContent = (k + 1) + 'ばんめは だれかな…';
      g.style.transition = 'none'; g.style.transform = 'rotate(0deg)'; g.getBoundingClientRect();
      g.style.transition = 'transform 3.4s cubic-bezier(.12,.6,.1,1)'; g.style.transform = 'rotate(' + angle + 'deg)';
      later(function () {
        $('#drst').textContent = (k + 1) + 'ばんめ: ' + want.name; $('#drod').innerHTML += '<span class="on">' + (k + 1) + ' ' + esc(want.name) + '</span>';
        left.splice(idx, 1); k++;
        later(function () {
          if (!left.length) { later(function () { done(order); }, 500); return; }
          if (left.length === 1) { $('#drst').textContent = (k + 1) + 'ばんめ: ' + left[0].name; $('#drod').innerHTML += '<span class="on">' + (k + 1) + ' ' + esc(left[0].name) + '</span>'; later(function () { done(order); }, 1100); return; }
          show(); busy = false; spin();
        }, 1100);
      }, 3600);
    }
    $('#drsp').onclick = spin;
  }

  /* ===== 1つの絵を 描きつなぐ ===== */
  // opt: {order, theme, interactive(bool), onDone(strokes, correct)}
  function playPicture(o) {
    var strokes = [], order = o.order, last = order.length - 1, ti = THEMES.indexOf(o.theme);
    function turn(i) {
      if (i === last) return guess();
      var p = order[i];
      if (p.me && o.interactive) return human(i);
      var tpl = o.theme.s[i % o.theme.s.length];
      if (o.interactive) {
        A.draw('<div class="qc">' + bar(order, i) + '<div class="drtheme">お題: ' + esc(o.theme.n) + '</div><div class="drbk">' + svgOf(strokes) + '</div><p style="text-align:center">' + esc(p.name) + ' が かいています…</p></div>');
      }
      later(function () { strokes.push({ p: jit(tpl), c: i }); if (o.interactive) A.draw('<div class="qc">' + bar(order, i + 1) + '<div class="drtheme">お題: ' + esc(o.theme.n) + '</div><div class="drbk">' + svgOf(strokes) + '</div></div>'); later(function () { turn(i + 1); }, o.interactive ? 700 : 150); }, o.interactive ? 900 : 100);
    }
    function human(i) {
      drawUI(bar(order, i) + '<div class="drtheme">お題: ' + esc(o.theme.n) + '</div>', strokes, i, function (st) {
        strokes.push({ p: st.map(function (q) { return [Math.round(q[0] * 10) / 10, Math.round(q[1] * 10) / 10]; }), c: i }); turn(i + 1);
      });
    }
    function pickList() {
      var others = shuffle(THEMES.filter(function (t) { return t !== o.theme; })).slice(0, 5);
      return shuffle(others.concat(o.theme));
    }
    function guess() {
      var p = order[last], list = pickList();
      function fin(ans) { o.onDone(strokes, ans === o.theme, ans); }
      if (p.me && o.interactive) {
        A.draw('<div class="qc">' + bar(order, last) + '<h3 style="margin:0 0 6px;text-align:center">お題は なんでしょう?</h3><div class="drbk">' + svgOf(strokes) + '</div><div class="drch">' +
          list.map(function (t, k) { return '<button class="qb" data-k="' + k + '">' + esc(t.n) + '</button>'; }).join('') + '</div></div>');
        A.bind('[data-k]', function (b) { fin(list[+b.dataset.k]); });
        return;
      }
      var pr = Math.min(.92, .3 + .11 * strokes.length), ok = Math.random() < pr, ans = ok ? o.theme : pick(list.filter(function (t) { return t !== o.theme; }));
      if (o.interactive) A.draw('<div class="qc">' + bar(order, last) + '<div class="drbk">' + svgOf(strokes) + '</div><p style="text-align:center">' + esc(p.name) + ' が かんがえています…</p></div>');
      later(function () { fin(ans); }, o.interactive ? 1500 : 100);
    }
    turn(0);
  }
  /* 自分の番: 指で一筆だけ かく画面。cb(点の列) */
  function drawUI(top, strokes, i, cb, pre) {
    var cur = null, drawing = false;
    A.draw('<div class="qc">' + (pre || '') + top + '<p style="margin:0 0 6px;text-align:center;font-weight:bold">あなたの ばんです。<br>お題に そって <b>一筆</b>(指を はなすまで)かいてね</p><div class="drbk">' + svgOf(strokes, 'drsv') + '</div>' +
      '<div class="qgrid" style="grid-template-columns:1fr 1fr"><button class="qb" id="drre">かきなおし</button><button class="qb pri" id="drok">これで OK</button></div></div>');
    var sv = $('#drsv'), pa = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pa.setAttribute('fill', 'none'); pa.setAttribute('stroke', COLS[i % COLS.length]); pa.setAttribute('stroke-width', '1.9'); pa.setAttribute('stroke-linecap', 'round'); pa.setAttribute('stroke-linejoin', 'round'); sv.appendChild(pa);
    function xy(e) { var r = sv.getBoundingClientRect(); return [Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)), Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100))]; }
    function paint() { pa.setAttribute('d', cur && cur.length ? pathOf(cur) : ''); }
    sv.onpointerdown = function (e) { e.preventDefault(); drawing = true; cur = [xy(e)]; try { sv.setPointerCapture(e.pointerId); } catch (x) { /* 無視 */ } paint(); };
    sv.onpointermove = function (e) { if (!drawing) return; e.preventDefault(); cur.push(xy(e)); paint(); };
    sv.onpointerup = sv.onpointercancel = function () { drawing = false; };
    $('#drre').onclick = function () { cur = null; paint(); };
    $('#drok').onclick = function () {
      if (!cur || cur.length < 3) { A.toast('一筆 かいてから おしてね'); return; }
      $('#drok').disabled = true; cb(cur);
    };
  }
  function save(theme, strokes, ok) {
    galSave({ t: theme.n, ok: ok ? 1 : 0, s: strokes.map(function (s) { return { p: thin(s.p), c: s.c }; }) });
  }
  function xp(n) { try { A.addXp(n); A.Store.save(); } catch (e) { /* 無視 */ } }

  /* ===== 一人モード ===== */
  function soloRound() {
    var team = mkTeam(S.n, true, NAMES), theme = newTheme();
    roulette(team, function (order) {
      playPicture({ order: order, theme: theme, interactive: true, onDone: function (strokes, ok, ans) {
        save(theme, strokes, ok); xp(ok ? 6 : 3);
        A.draw('<div class="qc" style="text-align:center"><div style="font-size:3em">' + (ok ? '正解' : '不正解') + '</div><b class="big">' + (ok ? 'せいかい!' : 'ざんねん…') + '</b><p>こたえ: 『' + esc(theme.n) + '』<br>' + esc(order[order.length - 1].name) + ' の こたえ: ' + esc(ans.n) + '</p><div class="drbk">' + svgOf(strokes) + '</div><p style="font-size:.85em">ギャラリーに かざりました。</p>' +
          '<button class="qb pri" id="drnx">もう1回</button><button class="qb" id="drgl">🎨ギャラリー</button><button class="qb" id="drmn">メニュー</button></div>');
        $('#drnx').onclick = soloRound; $('#drgl').onclick = gallery; $('#drmn').onclick = menu;
      } });
    });
  }

  /* ===== 対決モード ===== */
  function vsRound() {
    var ta = mkTeam(S.n, true, NAMES), tb = mkTeam(S.n, false, NAMES.map(function (x) { return x + 'B'; })), theme = newTheme();
    A.draw('<div class="qc" style="text-align:center"><h2>第' + S.round + '回戦</h2><p>あなたの チーム(' + S.n + '人) VS ロボットの チーム(' + S.n + '人)</p><div class="drtheme">お題は 両チーム おなじです</div><button class="qb pri" id="drgo">じゅんばんを きめる</button></div>');
    $('#drgo').onclick = function () {
      roulette(ta, function (oa) {
        playPicture({ order: oa, theme: theme, interactive: true, onDone: function (sa, oka, ansa) {
          save(theme, sa, oka);
          var ob = shuffle(tb);
          playPicture({ order: ob, theme: theme, interactive: false, onDone: function (sb, okb) {
            if (oka) S.a++; if (okb) S.b++; xp(oka ? 5 : 2);
            var last = S.round >= 3;
            A.draw('<div class="qc" style="text-align:center"><h2>第' + S.round + '回戦 けっか</h2><p>お題: 『' + esc(theme.n) + '』</p><div class="qgrid" style="grid-template-columns:1fr 1fr"><div><b>あなたの チーム</b><div class="drbk">' + svgOf(sa) + '</div>' + (oka ? 'せいかい' : 'ざんねん: ' + esc(ansa.n)) + '</div><div><b>ロボット チーム</b><div class="drbk">' + svgOf(sb) + '</div>' + (okb ? 'せいかい' : 'ざんねん: はずれ') + '</div></div>' +
              '<p style="font-size:1.1em"><b>' + S.a + ' - ' + S.b + '</b></p><button class="qb pri" id="drnx">' + (last ? 'けっかはっぴょう' : '次の 回戦へ') + '</button></div>');
            $('#drnx').onclick = function () { if (last) vsEnd(); else { S.round++; vsRound(); } };
          } });
        } });
      });
    };
  }
  function vsEnd() {
    var w = S.a > S.b ? 'あなたの チームの かち!' : S.a < S.b ? 'ロボット チームの かち…' : 'ひきぶん!';
    xp(S.a > S.b ? 10 : 4);
    A.draw('<div class="qc" style="text-align:center"><div style="font-size:3.2em">' + '' + '</div><h2>' + w + '</h2><p><b class="big">' + S.a + ' - ' + S.b + '</b><br>(3回戦)</p><button class="qb pri" id="drnx">もう一度</button><button class="qb" id="drgl">🎨ギャラリー</button><button class="qb" id="drmn">メニュー</button></div>');
    $('#drnx').onclick = vsSetup; $('#drgl').onclick = gallery; $('#drmn').onclick = menu;
  }


  /* ===== べつのスマホと 対決(へや) ===== */
  function netSetup() {
    var n = 3;
    A.draw('<div class="qc"><h2>オンラインモード</h2><p style="font-size:.92em">1チームの 人数を えらんで「へやを つくる」(ホスト)。ともだちは「番号を いれて はいる」で さんかします。<b>人数が たりない ところは ロボットが はいります。</b>(2人から あそべます)</p><div id="dro">' + opts('t', 2, 5, 3, '').replace(/data-n="(\d)">\d/g, 'data-n="$1">$1 VS $1') + '</div><button class="qb pri" id="drgo">つぎへ(へやに すすむ)</button><button class="qb" id="drbk">もどる</button></div>');
    A.bind('[data-n]', function (b) { n = +b.dataset.n; Array.prototype.forEach.call(root.querySelectorAll('[data-n]'), function (x) { x.classList.toggle('pri', x === b); }); });
    $('#drbk').onclick = menu;
    $('#drgo').onclick = function () {
      A.withRoom(function (RM) {
        RM.lobby(A, { game: 'draw', title: 'おえかき対決', cfg: { n: n }, min: 2, max: n * 2, cfgText: '1チーム ' + n + '人(たりない ところは ロボット)', cfgTextFor: function (c) { return '1チーム ' + (c && c.n || n) + '人(たりない ところは ロボット)'; }, back: menu,
          init: function (R) { return netInitState(R, R.cfg && R.cfg.n || n); }, onStart: function (R) { netPlay(R); } });
      });
    };
  }
  function netInitState(R, n) {
    var hs = shuffle(R.players.map(function (x, i) { return i; })), teams = [[], []], rn = shuffle(NAMES);
    hs.forEach(function (h, k) { var t = k % 2; if (teams[t].length < n) teams[t].push({ nm: R.players[h], h: h }); else teams[1 - t].push({ nm: R.players[h], h: h }); });
    teams.forEach(function (tm) { while (tm.length < n) tm.push({ nm: rn.pop() + 'ロボ', h: -1 }); });
    var S = { phase: 'play', stage: 'draw', n: n, round: 1, score: [0, 0], teams: teams };
    return netNewRound(S);
  }
  function netNewRound(S) {
    var th = pick(THEMES.map(function (t, i) { return i; }).filter(function (i) { return i !== S.th; }));
    S.th = th; S.stage = 'draw';
    S.ord = S.teams.map(function (tm) { return shuffle(tm.map(function (x, i) { return i; })); });
    S.p = S.teams.map(function () { return { s: [], g: null, ch: shuffle(shuffle(THEMES.map(function (t, i) { return i; }).filter(function (i) { return i !== th; })).slice(0, 5).concat(th)) }; });
    return S;
  }
  function thin(p) { var o = p; if (p.length > 28) { var k = Math.ceil(p.length / 28); o = p.filter(function (q, i) { return i % k === 0 || i === p.length - 1; }); } return o.map(function (q) { return [Math.round(q[0]), Math.round(q[1])]; }); }
  function netPlay(R) {
    var nt = tok, acting = '', seen = 0, anim = false, sched = {}, saved = {}, iv = null;
    function alive() { return nt === tok && document.body.contains(root); }
    function myTeam(S) { for (var t = 0; t < 2; t++) for (var k = 0; k < S.teams[t].length; k++) if (S.teams[t][k].h === R.my) return t; return 0; }
    function finalize(S2) {
      if (S2.p[0].g !== null && S2.p[1].g !== null) { S2.stage = 'result'; for (var t = 0; t < 2; t++) if (S2.p[t].g === S2.th) S2.score[t]++; }
    }
    function update(mut) {
      var S2 = JSON.parse(JSON.stringify(R.state)); if (!mut(S2)) return Promise.resolve(false);
      return R.set(S2).then(function (ok) { if (!ok) return update(mut); pump(); return true; });
    }
    function driver(S, t) { var d = -1; S.teams[t].forEach(function (x) { if (x.h >= 0 && (d < 0 || x.h < d)) d = x.h; }); return d; }
    function helper(S, skip) { var d = -1; S.teams.forEach(function (tm) { tm.forEach(function (x) { if (x.h >= 0 && x.h !== skip && (d < 0 || x.h < d)) d = x.h; }); }); return d; }
    function robotAct(S, t) {
      var pic = S.p[t], i = pic.s.length, rd = S.round, key = rd + ':' + t + ':' + i, last = S.n - 1;
      if (sched[key]) return; sched[key] = 1;
      later(function () {
        update(function (S2) {
          var q = S2.p[t]; if (S2.stage !== 'draw' || S2.round !== rd || q.g !== null || q.s.length !== i) return false;
          if (i < last) { q.s.push({ p: thin(jit(THEMES[S2.th].s[i % THEMES[S2.th].s.length])), c: i }); return true; }
          q.g = Math.random() < Math.min(.92, .3 + .11 * q.s.length) ? S2.th : pick(q.ch.filter(function (x) { return x !== S2.th; })); finalize(S2); return true;
        }).catch(function () { delete sched[key]; });
      }, 1200 + Math.random() * 800);
    }
    function head(S, t) {
      var o = S.p[1 - t];
      return '<div style="display:flex;justify-content:space-between;font-size:.9em;margin:0 0 6px"><b>第' + S.round + '回戦 / 3</b><span>あなたのチーム ' + S.score[t] + ' - ' + S.score[1 - t] + ' あいて</span></div><div style="font-size:.8em;opacity:.75;margin:0 0 6px">あいてチーム: ' + (o.g !== null ? 'こたえ ずみ' : Math.min(o.s.length + 1, S.n) + '人目') + '</div>';
    }
    function pump() {
      if (!alive()) { R.stop(); if (iv) clearInterval(iv); return; }
      var S = R.state; if (!S || S.phase !== 'play') return;
      if (S.stage === 'draw') {
        for (var tt = 0; tt < 2; tt++) {
          var pc = S.p[tt]; if (pc.g !== null) continue;
          var i0 = pc.s.length, pl = S.teams[tt][S.ord[tt][i0]];
          if (pl.h < 0) { if (driver(S, tt) === R.my) robotAct(S, tt); }
          else if (pl.h !== R.my && Date.now() - R._lastChange > 45000 && helper(S, pl.h) === R.my) robotAct(S, tt);
        }
        if (anim) return;
        if (seen !== S.round) { anim = true; var t0 = myTeam(S); roulette(null, function () { anim = false; seen = S.round; acting = ''; pump(); }, S.ord[t0].map(function (k) { return { name: S.teams[t0][k].nm, me: S.teams[t0][k].h === R.my }; })); return; }
        netBoard(S);
      } else if (S.stage === 'result') netResult(S); else netEnd(S);
    }
    function netBoard(S) {
      var t = myTeam(S), pic = S.p[t], tm = S.teams[t], ord = S.ord[t], i = pic.s.length, last = S.n - 1, th = THEMES[S.th];
      var op = ord.map(function (k) { return { name: tm[k].nm }; });
      if (pic.g !== null) { A.draw('<div class="qc">' + head(S, t) + bar(op, last) + '<div class="drbk">' + svgOf(pic.s) + '</div><p style="text-align:center">こたえました。あいてチームを まっています…</p></div>'); return; }
      var pl = tm[ord[i]], mine = pl.h === R.my, key = S.round + ':' + t + ':' + i;
      if (i < last) {
        if (mine) {
          if (acting === key) return; acting = key;
          drawUI(bar(op, i) + '<div class="drtheme">お題: ' + esc(th.n) + '</div>', pic.s, i, function (st) {
            update(function (S2) { var q = S2.p[t]; if (S2.stage !== 'draw' || S2.round !== S.round || q.g !== null || q.s.length !== i) return false; q.s.push({ p: thin(st), c: i }); return true; });
          }, head(S, t));
        } else A.draw('<div class="qc">' + head(S, t) + bar(op, i) + '<div class="drtheme">お題: ' + esc(th.n) + '</div><div class="drbk">' + svgOf(pic.s) + '</div><p style="text-align:center">' + esc(pl.nm) + ' が かいています…</p></div>');
      } else if (mine) {
        if (acting === key) return; acting = key;
        A.draw('<div class="qc">' + head(S, t) + bar(op, last) + '<h3 style="margin:0 0 6px;text-align:center">お題は なんでしょう?</h3><div class="drbk">' + svgOf(pic.s) + '</div><div class="drch">' + pic.ch.map(function (x, k) { return '<button class="qb" data-k="' + k + '">' + esc(THEMES[x].n) + '</button>'; }).join('') + '</div></div>');
        A.bind('[data-k]', function (b) { var ans = pic.ch[+b.dataset.k]; update(function (S2) { var q = S2.p[t]; if (S2.stage !== 'draw' || S2.round !== S.round || q.g !== null) return false; q.g = ans; finalize(S2); return true; }); });
      } else A.draw('<div class="qc">' + head(S, t) + bar(op, last) + '<div class="drbk">' + svgOf(pic.s) + '</div><p style="text-align:center">' + esc(pl.nm) + ' が お題を かんがえています…</p></div>');
    }
    function advance(S0) {
      update(function (S2) {
        if (S2.stage !== 'result' || S2.round !== S0.round) return false;
        if (S2.round >= 3) { S2.stage = 'end'; return true; }
        S2.round++; netNewRound(S2); return true;
      });
    }
    function netResult(S) {
      var t = myTeam(S), th = THEMES[S.th], mine = S.p[t], opp = S.p[1 - t], key = S.round;
      if (!saved[key]) { saved[key] = 1; save(th, mine.s, mine.g === S.th); xp(mine.g === S.th ? 5 : 2); }
      var host = R.my === 0, idle = Date.now() - R._lastChange > 40000, last = S.round >= 3;
      A.draw('<div class="qc" style="text-align:center"><h2>第' + S.round + '回戦 けっか</h2><p>お題: 『' + esc(th.n) + '』</p><div class="qgrid" style="grid-template-columns:1fr 1fr"><div><b>あなたの チーム</b><div class="drbk">' + svgOf(mine.s) + '</div>' + (mine.g === S.th ? 'せいかい' : 'ざんねん: ' + esc(THEMES[mine.g].n)) + '</div><div><b>あいての チーム</b><div class="drbk">' + svgOf(opp.s) + '</div>' + (opp.g === S.th ? 'せいかい' : 'ざんねん: ' + esc(THEMES[opp.g].n)) + '</div></div><p style="font-size:1.1em"><b>' + S.score[t] + ' - ' + S.score[1 - t] + '</b></p>' +
        (host || idle ? '<button class="qb pri" id="drnx">' + (last ? 'けっかはっぴょう' : '次の 回戦へ') + '</button>' : '<div class="qfb ok">ホストが すすめるのを まっています…</div>') + '</div>');
      var b = $('#drnx'); if (b) b.onclick = function () { b.disabled = true; advance(S); };
    }
    function netEnd(S) {
      var t = myTeam(S), a = S.score[t], b = S.score[1 - t];
      if (!saved.end) { saved.end = 1; xp(a > b ? 10 : 4); R.stop(); if (iv) clearInterval(iv); }
      A.draw('<div class="qc" style="text-align:center"><div style="font-size:3.2em">' + '' + '</div><h2>' + (a > b ? 'あなたの チームの かち!' : a < b ? 'あいての チームの かち…' : 'ひきわけ!') + '</h2><p><b class="big">' + a + ' - ' + b + '</b><br>(3回戦)</p><button class="qb pri" id="drgl">🎨ギャラリー</button><button class="qb" id="drmn">メニュー</button></div>');
      $('#drgl').onclick = gallery; $('#drmn').onclick = menu;
    }
    R.watch(function (r, err) { if (!alive()) { r.stop(); return; } if (err) { r.stop(); A.toast('へやが きえました'); return menu(); } pump(); });
    iv = setInterval(function () { if (!alive()) { clearInterval(iv); return; } var S = R.state; if (S && S.stage === 'result') pump(); }, 5000);
    pump();
  }

  function start(api) {
    A = api; root = A.root();
    if (!document.getElementById('drcss')) { var s = document.createElement('style'); s.id = 'drcss'; s.textContent = CSS; document.head.appendChild(s); }
    menu();
  }
  window.HmtDraw = { start: start, cert: cert, _t: { THEMES: THEMES } };
})();
