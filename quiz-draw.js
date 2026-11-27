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
    '#qz .drfr{background:#fff;border:7px solid #b8862b;border-image:none;box-shadow:0 0 0 2px #7a5818,0 4px 8px rgba(0,0,0,.3);padding:6px;border-radius:2px}' +
    '#qz .drfr svg{display:block;width:100%;height:auto;background:#fffdf5}#qz .drpl{margin:8px auto 0;background:#f5efd8;border:1px solid #b8862b;border-radius:4px;padding:2px 6px;text-align:center;font-size:.8em;font-weight:bold}' +
    '#qz .drch{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}';
  function $(s) { return root.querySelector(s); }
  function esc(s) { return A.esc(s); }
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
    return '<svg ' + (id ? 'id="' + id + '" ' : '') + 'class="drsv" viewBox="0 0 100 100">' + strokes.map(function (s) {
      return '<path d="' + pathOf(s.p) + '" fill="none" stroke="' + COLS[s.c % COLS.length] + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>';
    }).join('') + (extra || '') + '</svg>';
  }
  function bar(order, cur) {
    return '<div class="drbar">' + order.map(function (p, i) {
      return '<span class="' + (i === cur ? 'on' : i < cur ? 'dn' : '') + '" style="' + (i === cur ? '' : 'border-color:' + COLS[i % COLS.length]) + '">' + (i + 1) + ' ' + esc(p.name) + (i === order.length - 1 ? ' ✏️→❓' : '') + '</span>';
    }).join('') + '</div>';
  }

  /* ===== ギャラリー ===== */
  function galLoad() { try { return JSON.parse(localStorage.getItem(GKEY) || '[]') || []; } catch (e) { return []; } }
  function galSave(w) {
    var g = galLoad(); g.unshift(w); g = g.slice(0, 40);
    try { localStorage.setItem(GKEY, JSON.stringify(g)); } catch (e) { /* 保存できなくても遊べる */ }
  }
  function gallery() {
    tok++; var g = galLoad();
    var h = '<div class="qc"><h2>🖼️ ギャラリー</h2><p style="margin:0 0 8px;font-size:.9em">いままで かいた さくひんが かざられます。(この スマホに さいだい40まい)</p>';
    h += g.length ? '<div class="drwall">' + g.map(function (w) {
      return '<div><div class="drfr">' + svgOf(w.s) + '</div><div class="drpl">『' + esc(w.t) + '』' + (w.ok ? ' ⭕' : '') + '</div></div>';
    }).join('') + '</div>' : '<div class="drwall" style="display:block;text-align:center;padding:30px 10px">まだ さくひんが ありません。<br>1まい かいてみよう!</div>';
    h += '<button class="qb" id="drbk" style="margin-top:10px">もどる</button></div>';
    A.draw(h); $('#drbk').onclick = menu;
  }

  /* ===== メニュー ===== */
  function menu() {
    tok++;
    A.draw('<div class="qc"><div style="margin:-4px -4px 8px"><img src="draw-top.jpg?v=1" alt="" style="display:none;width:100%;height:auto;border-radius:14px"></div><h2>🎨 おえかきを完成させろ</h2><p style="font-size:.92em">お題に そって 1人 <b>一筆(ひとふで)</b>ずつ かいて つないでいき、<b>最後の人</b>が 絵を見て お題を あてます。</p>' +
      '<button class="qb pri" id="drsolo">🙂 一人モード(ロボットと)</button><button class="qb pri" id="drvs">⚔️ 対決モード(3回戦)</button><button class="qb pri" id="drnet">🌐 べつのスマホと 対決(最大5 VS 5)</button><button class="qb" id="drgal">🖼️ ギャラリー</button><button class="qb" id="drhome">もどる</button></div>');
    try { var tt = tok; A.call('draw_top').then(function (r) { var im = r && r.url ? root.querySelector('img') : null; if (im && tt === tok) { im.onerror = function () { this.style.display = 'none'; }; im.onload = function () { this.style.display = 'block'; }; im.src = r.url; } }).catch(function () { /* 画像なしでOK */ }); } catch (e) { /* 無視 */ }
    $('#drsolo').onclick = soloSetup; $('#drvs').onclick = vsSetup; $('#drnet').onclick = netSetup; $('#drgal').onclick = gallery; $('#drhome').onclick = function () { tok++; A.hub(); };
  }
  function opts(name, lo, hi, def, unit) {
    var h = '<div class="drch">';
    for (var i = lo; i <= hi; i++) h += '<button class="qb' + (i === def ? ' pri' : '') + '" data-n="' + i + '">' + i + unit + '</button>';
    return h + '</div>';
  }
  function soloSetup() {
    var n = 3;
    A.draw('<div class="qc"><h2>🙂 一人モード</h2><p>ロボットの 人数を えらんでね(3〜8)</p><div id="dro">' + opts('r', 3, 8, 3, '人') + '</div><button class="qb pri" id="drgo">はじめる</button><button class="qb" id="drbk">もどる</button></div>');
    A.bind('[data-n]', function (b) { n = +b.dataset.n; Array.prototype.forEach.call(root.querySelectorAll('[data-n]'), function (x) { x.classList.toggle('pri', x === b); }); });
    $('#drgo').onclick = function () { S = { mode: 'solo', n: n + 1 }; soloRound(); }; $('#drbk').onclick = menu;
  }
  function vsSetup() {
    var n = 3;
    A.draw('<div class="qc"><h2>⚔️ 対決モード</h2><p>1チームの 人数を えらんでね。あなたの チームと ロボットの チームで 3回戦です。人数が たりない ところは ロボットが はいります。</p><div id="dro">' + opts('t', 2, 5, 3, '').replace(/data-n="(\d)">\d/g, 'data-n="$1">$1 VS $1')+ '</div><button class="qb pri" id="drgo">はじめる</button><button class="qb" id="drbk">もどる</button></div>');
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
  function roulette(team, done, fixed) {
    if (fixed) team = fixed;
    var order = fixed || shuffle(team), want = order.map(function (p) { return p; }), i = 0;
    var meIdx = order.findIndex(function (p) { return p.me; });
    A.draw('<div class="qc"><h2>🎰 じゅんばん ルーレット</h2><div class="drslot" id="drsl">…</div><div id="drod" class="drbar"></div></div>');
    function spinSlot() {
      if (i >= want.length) { later(function () { done(order); }, 900); return; }
      var k = 0, steps = 9 + i;
      (function tick() {
        if (k++ < steps) { $('#drsl').textContent = pick(team).name; later(tick, 60 + k * 14); return; }
        $('#drsl').textContent = (i + 1) + 'ばんめ: ' + want[i].name + (want[i].me ? ' 🎉' : '');
        $('#drod').innerHTML += '<span class="on">' + (i + 1) + ' ' + esc(want[i].name) + '</span>'; i++;
        later(spinSlot, 650);
      })();
    }
    later(spinSlot, 400);
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
        A.draw('<div class="qc">' + bar(order, i) + '<div class="drtheme">お題: ' + esc(o.theme.n) + '</div><div class="drbk">' + svgOf(strokes) + '</div><p style="text-align:center">🤖 ' + esc(p.name) + ' が かいています…</p></div>');
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
        A.draw('<div class="qc">' + bar(order, last) + '<h3 style="margin:0 0 6px;text-align:center">❓ お題は なんでしょう?</h3><div class="drbk">' + svgOf(strokes) + '</div><div class="drch">' +
          list.map(function (t, k) { return '<button class="qb" data-k="' + k + '">' + esc(t.n) + '</button>'; }).join('') + '</div></div>');
        A.bind('[data-k]', function (b) { fin(list[+b.dataset.k]); });
        return;
      }
      var pr = Math.min(.92, .3 + .11 * strokes.length), ok = Math.random() < pr, ans = ok ? o.theme : pick(list.filter(function (t) { return t !== o.theme; }));
      if (o.interactive) A.draw('<div class="qc">' + bar(order, last) + '<div class="drbk">' + svgOf(strokes) + '</div><p style="text-align:center">🤖 ' + esc(p.name) + ' が かんがえています…</p></div>');
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
    galSave({ t: theme.n, ok: ok ? 1 : 0, s: strokes.map(function (s) { return { p: s.p.map(function (q) { return [Math.round(q[0]), Math.round(q[1])]; }), c: s.c }; }) });
  }
  function xp(n) { try { A.addXp(n); A.Store.save(); } catch (e) { /* 無視 */ } }

  /* ===== 一人モード ===== */
  function soloRound() {
    var team = mkTeam(S.n, true, NAMES), theme = newTheme();
    roulette(team, function (order) {
      playPicture({ order: order, theme: theme, interactive: true, onDone: function (strokes, ok, ans) {
        save(theme, strokes, ok); xp(ok ? 6 : 3);
        A.draw('<div class="qc" style="text-align:center"><div style="font-size:3em">' + (ok ? '⭕' : '❌') + '</div><b class="big">' + (ok ? 'せいかい!' : 'ざんねん…') + '</b><p>こたえ: 『' + esc(theme.n) + '』<br>' + esc(order[order.length - 1].name) + ' の こたえ: ' + esc(ans.n) + '</p><div class="drbk">' + svgOf(strokes) + '</div><p style="font-size:.85em">ギャラリーに かざりました。</p>' +
          '<button class="qb pri" id="drnx">もう1回</button><button class="qb" id="drgl">🖼️ ギャラリー</button><button class="qb" id="drmn">メニュー</button></div>');
        $('#drnx').onclick = soloRound; $('#drgl').onclick = gallery; $('#drmn').onclick = menu;
      } });
    });
  }

  /* ===== 対決モード ===== */
  function vsRound() {
    var ta = mkTeam(S.n, true, NAMES), tb = mkTeam(S.n, false, NAMES.map(function (x) { return x + 'B'; })), theme = newTheme();
    A.draw('<div class="qc" style="text-align:center"><h2>⚔️ 第' + S.round + '回戦</h2><p>あなたの チーム(' + S.n + '人) VS ロボットの チーム(' + S.n + '人)</p><div class="drtheme">お題は 両チーム おなじです</div><button class="qb pri" id="drgo">じゅんばんを きめる</button></div>');
    $('#drgo').onclick = function () {
      roulette(ta, function (oa) {
        playPicture({ order: oa, theme: theme, interactive: true, onDone: function (sa, oka, ansa) {
          save(theme, sa, oka);
          var ob = shuffle(tb);
          playPicture({ order: ob, theme: theme, interactive: false, onDone: function (sb, okb) {
            if (oka) S.a++; if (okb) S.b++; xp(oka ? 5 : 2);
            var last = S.round >= 3;
            A.draw('<div class="qc" style="text-align:center"><h2>第' + S.round + '回戦 けっか</h2><p>お題: 『' + esc(theme.n) + '』</p><div class="qgrid" style="grid-template-columns:1fr 1fr"><div><b>あなたの チーム</b><div class="drbk">' + svgOf(sa) + '</div>' + (oka ? '⭕ せいかい' : '❌ ' + esc(ansa.n)) + '</div><div><b>ロボット チーム</b><div class="drbk">' + svgOf(sb) + '</div>' + (okb ? '⭕ せいかい' : '❌ はずれ') + '</div></div>' +
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
    A.draw('<div class="qc" style="text-align:center"><div style="font-size:3.2em">' + (S.a > S.b ? '🏆' : S.a < S.b ? '🤖' : '🤝') + '</div><h2>' + w + '</h2><p><b class="big">' + S.a + ' - ' + S.b + '</b><br>(3回戦)</p><button class="qb pri" id="drnx">もう一度</button><button class="qb" id="drgl">🖼️ ギャラリー</button><button class="qb" id="drmn">メニュー</button></div>');
    $('#drnx').onclick = vsSetup; $('#drgl').onclick = gallery; $('#drmn').onclick = menu;
  }


  /* ===== べつのスマホと 対決(へや) ===== */
  function netSetup() {
    var n = 3;
    A.draw('<div class="qc"><h2>🌐 べつのスマホと 対決</h2><p style="font-size:.92em">1チームの 人数を えらんで「へやを つくる」(ホスト)。ともだちは「番号を いれて はいる」で さんかします。<b>人数が たりない ところは ロボットが はいります。</b>(2人から あそべます)</p><div id="dro">' + opts('t', 2, 5, 3, '').replace(/data-n="(\d)">\d/g, 'data-n="$1">$1 VS $1') + '</div><button class="qb pri" id="drgo">つぎへ(へやに すすむ)</button><button class="qb" id="drbk">もどる</button></div>');
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
    teams.forEach(function (tm) { while (tm.length < n) tm.push({ nm: rn.pop() + '🤖', h: -1 }); });
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
        A.draw('<div class="qc">' + head(S, t) + bar(op, last) + '<h3 style="margin:0 0 6px;text-align:center">❓ お題は なんでしょう?</h3><div class="drbk">' + svgOf(pic.s) + '</div><div class="drch">' + pic.ch.map(function (x, k) { return '<button class="qb" data-k="' + k + '">' + esc(THEMES[x].n) + '</button>'; }).join('') + '</div></div>');
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
      A.draw('<div class="qc" style="text-align:center"><h2>第' + S.round + '回戦 けっか</h2><p>お題: 『' + esc(th.n) + '』</p><div class="qgrid" style="grid-template-columns:1fr 1fr"><div><b>あなたの チーム</b><div class="drbk">' + svgOf(mine.s) + '</div>' + (mine.g === S.th ? '⭕ せいかい' : '❌ ' + esc(THEMES[mine.g].n)) + '</div><div><b>あいての チーム</b><div class="drbk">' + svgOf(opp.s) + '</div>' + (opp.g === S.th ? '⭕ せいかい' : '❌ ' + esc(THEMES[opp.g].n)) + '</div></div><p style="font-size:1.1em"><b>' + S.score[t] + ' - ' + S.score[1 - t] + '</b></p>' +
        (host || idle ? '<button class="qb pri" id="drnx">' + (last ? 'けっかはっぴょう' : '次の 回戦へ') + '</button>' : '<div class="qfb ok">ホストが すすめるのを まっています…</div>') + '</div>');
      var b = $('#drnx'); if (b) b.onclick = function () { b.disabled = true; advance(S); };
    }
    function netEnd(S) {
      var t = myTeam(S), a = S.score[t], b = S.score[1 - t];
      if (!saved.end) { saved.end = 1; xp(a > b ? 10 : 4); R.stop(); if (iv) clearInterval(iv); }
      A.draw('<div class="qc" style="text-align:center"><div style="font-size:3.2em">' + (a > b ? '🏆' : a < b ? '😢' : '🤝') + '</div><h2>' + (a > b ? 'あなたの チームの かち!' : a < b ? 'あいての チームの かち…' : 'ひきわけ!') + '</h2><p><b class="big">' + a + ' - ' + b + '</b><br>(3回戦)</p><button class="qb pri" id="drgl">🖼️ ギャラリー</button><button class="qb" id="drmn">メニュー</button></div>');
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
  window.HmtDraw = { start: start, _t: { THEMES: THEMES } };
})();
