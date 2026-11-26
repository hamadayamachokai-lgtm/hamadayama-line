/* 日本旅すごろく(quiz.js から呼ばれます)
   都道府県を相棒と渡り歩き、マスで クイズ・人生イベント。コンピューター対戦は最下位に「1本ハゲのおじさん」が乗ります。
   ※ 遊び方のアイデアは「すごろく型ボードゲーム」から。キャラクターや絵は すべてオリジナルです。 */
(function () {
  'use strict';
  var A, D, G, TRIPCSS = '#qz .tbd{height:380px;overflow:auto;border:2px solid #e4ddcf;border-radius:16px;background:#fbf8ef;margin:0 0 12px}#qz .tbd svg{display:block;width:820px;max-width:none;height:auto}' +
    '#qz .tdice{font-size:2.4em;display:inline-block;min-width:1.3em;text-align:center}@keyframes tdr{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}#qz .tdice.roll{animation:tdr .35s linear infinite}' +
    '#qz .tlog{font-size:.88em;color:#4a5160;min-height:2.6em}#qz .trk{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}#qz .trk span{padding:2px 10px;border-radius:99px;background:#fff;border:2px solid var(--pc);font-weight:700;font-size:.85em}' +
    '#qz .tev{text-align:center}#qz .tev .big{font-size:4em;line-height:1.2}@keyframes tbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}#qz .tbob{animation:tbob 1s ease-in-out infinite}' +
    '#qz .pcard{background:#d8392f;border-radius:18px;padding:10px 10px 12px;margin:0 0 12px;box-shadow:0 2px 6px rgba(0,0,0,.18)}#qz .pcard h2{color:#fff;text-align:center;margin:2px 0 8px;font-size:1.7em;letter-spacing:.08em}#qz .pcard .pin{background:#fff;border-radius:12px;padding:12px}#qz .pcard .pill{display:inline-block;background:#d8392f;color:#fff;border-radius:6px;padding:1px 8px;font-size:.8em;font-weight:700;margin-right:8px}#qz .pcard .pill.g{background:#3f9a3a}#qz .pcard .pill.b{background:#2f86d0}#qz .pcard .prow{margin:0 0 9px;line-height:1.6}#qz .pcard .pil{text-align:center;font-size:2.6em;line-height:1.3;letter-spacing:.15em;background:#fff8e1;border-radius:10px;margin:0 0 10px}#qz .ttok{transition:transform .22s ease-out}@media (prefers-reduced-motion:reduce){#qz .tdice.roll,#qz .tbob{animation:none}#qz .ttok{transition:none}}';
  var N = 47, GOAL = 47, TOTAL = 25;
  var KINDS = ['goto', 'quiz', 'event', 'goto', 'quiz', 'goto', 'event', 'quiz', 'goto', 'event', 'quiz', 'goto'];
  var KCOL = { goto: '#f6c85f', quiz: '#7fb8e8', event: '#ee8fb0' };
  var KICON = { goto: '🍴', quiz: '❓', event: '🎁' };
  var CPU = [{ name: 'モコ', c: '#f2a65a', p: .55 }, { name: 'ピポ', c: '#7aa7e8', p: .65 }, { name: 'ガブ', c: '#c98ad8', p: .45 }];
  var ME_COL = '#4fb7a1', VW = 576, VH = 752;
  // 県庁所在地のだいたいの経度・緯度(地図の上の位置)
  var LL = [[141.35, 43.06], [140.74, 40.82], [141.15, 39.7], [140.87, 38.27], [140.1, 39.72], [140.36, 38.24], [140.47, 37.75], [140.45, 36.34], [139.88, 36.57], [139.06, 36.39], [139.65, 35.86], [140.12, 35.61], [139.69, 35.69], [139.64, 35.45], [139.02, 37.9], [137.21, 36.7], [136.63, 36.59], [136.22, 36.07], [138.57, 35.66], [138.18, 36.65], [136.72, 35.39], [138.38, 34.98], [136.91, 35.18], [136.51, 34.73], [135.87, 35.0], [135.76, 35.02], [135.52, 34.69], [135.18, 34.69], [135.83, 34.69], [135.17, 34.23], [134.24, 35.5], [133.05, 35.47], [133.93, 34.66], [132.46, 34.4], [131.47, 34.19], [134.56, 34.07], [134.04, 34.34], [132.77, 33.84], [133.53, 33.56], [130.42, 33.61], [130.3, 33.25], [129.87, 32.74], [130.74, 32.79], [131.61, 33.24], [131.42, 31.91], [130.56, 31.56]];
  var ISL = [ // 日本列島のおおまかな形(経度,緯度)
    [[140.0, 41.5], [140.1, 42.5], [140.4, 43.2], [141.4, 43.3], [141.7, 45.4], [142.2, 45.4], [143.8, 44.2], [145.3, 43.5], [145.8, 43.3], [144.0, 42.9], [143.2, 42.0], [141.6, 42.5], [141.0, 41.7]],
    [[140.9, 41.4], [141.5, 40.5], [141.9, 39.5], [141.9, 38.3], [141.0, 37.0], [140.9, 36.0], [140.9, 35.7], [139.9, 35.1], [139.8, 35.0], [139.3, 35.2], [138.8, 34.65], [138.2, 34.6], [137.0, 34.6], [136.9, 34.3], [136.3, 33.6], [135.8, 33.45], [135.2, 33.6], [135.0, 34.2], [135.3, 34.7], [134.0, 34.7], [132.6, 34.2], [131.0, 33.95], [130.9, 34.4], [131.7, 34.7], [132.9, 35.4], [133.5, 35.5], [134.6, 35.65], [135.3, 35.7], [136.1, 36.0], [136.7, 37.4], [137.0, 37.5], [137.5, 36.9], [138.5, 37.4], [139.3, 38.2], [140.0, 39.6], [140.0, 40.6], [140.4, 41.2]],
    [[132.0, 33.4], [132.5, 34.0], [133.5, 34.3], [134.5, 34.3], [134.7, 34.0], [134.2, 33.8], [133.6, 33.3], [133.0, 32.9]],
    [[130.0, 33.6], [130.9, 33.95], [131.8, 33.7], [131.9, 32.8], [131.4, 31.4], [130.6, 31.0], [130.2, 31.4], [130.1, 32.5], [129.7, 32.8], [129.6, 33.3]]];
  function proj(lon, lat) { return [(lon - 129.2) / 17.2 * (VW - 30) + 10, (45.8 - lat) / 15.2 * (VH - 80) + 14]; }
  function K(a, b) { return A.K(a, b); }
  function kindOf(i) { return KINDS[i % 12]; }
  function ageOf(pos) { return Math.round(Math.min(pos, 46) / 46 * 65); }
  function phaseOf(age) { return age < 6 ? 0 : age < 13 ? 1 : age < 19 ? 2 : age < 25 ? 3 : age < 46 ? 4 : 5; }
  function pxy(i) { if (i >= 46) return i === 46 ? [64, VH - 36] : [104, VH - 36]; return proj(LL[i][0], LL[i][1]); }   // 沖縄(46)は左下の小さな枠、47はゴール

  /* ===== 絵 ===== */
  function ojiSVG(size) {   // 1本ハゲのおじさん(オリジナル)
    return '<svg viewBox="0 0 80 84" width="' + size + '" height="' + size * 84 / 80 + '" role="img" aria-label="1本ハゲのおじさん"><rect x="12" y="58" width="56" height="26" rx="10" fill="#5b6b8a"/><path d="M40 60l-6 22h12z" fill="#e8e8f0"/><path d="M40 62l-3 5l3 12l3 -12z" fill="#c0392b"/><circle cx="40" cy="34" r="22" fill="#f2c9a0" stroke="#c99a6e" stroke-width="1.5"/><path d="M40 12q-2 -8 4 -10" stroke="#3b2a1d" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M27 29l8 -2M53 29l-8 -2" stroke="#6b4a32" stroke-width="2.2" stroke-linecap="round"/><circle cx="32" cy="34" r="2.4" fill="#222"/><circle cx="48" cy="34" r="2.4" fill="#222"/><circle cx="40" cy="41" r="4" fill="#e9a98a"/><path d="M30 47q10 -5 20 0q-4 4 -10 3q-6 1 -10 -3z" fill="#7a5a3a"/><path d="M34 52q6 4 12 0" stroke="#7a3b2a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 30q-2 6 0 8M60 30q2 6 0 8" stroke="#c99a6e" stroke-width="2" fill="none"/></svg>';
  }
  function tokenG(p, id) {
    var eye = '<circle cx="-4.5" cy="-1" r="1.8" fill="#222"/><circle cx="4.5" cy="-1" r="1.8" fill="#222"/>';
    var body = '<ellipse cx="0" cy="2" rx="11" ry="10" fill="' + p.c + '" stroke="#fff" stroke-width="2"/>' + eye + '<path d="M-3 5q3 3 6 0" stroke="#222" stroke-width="1.5" fill="none"/>';
    var extra = p.me ? '<path d="M0 -8q-5 -1 -7 -5q6 -1 7 5zM0 -8q5 -1 7 -5q-6 -1 -7 5z" fill="#4fae5a"/>' : '<circle cx="-8" cy="-7" r="3" fill="' + p.c + '"/><circle cx="8" cy="-7" r="3" fill="' + p.c + '"/>';
    return '<g class="ttok" id="tk' + id + '"><g class="tbob" style="transform-box:fill-box">' + body + extra + '</g><g id="oj' + id + '" style="display:none" transform="translate(-13,-30) scale(.34)">' + ojiInner() + '</g><text y="21" font-size="9" text-anchor="middle" fill="#3b2a1d" font-weight="700" style="paint-order:stroke;stroke:#f6ecd2;stroke-width:3px">' + A.esc(p.name) + '</text></g>';
  }
  function ojiInner() { return ojiSVG(80).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, ''); }
  function prefLabels() {   // 47都道府県の名前。ほかの名前や点と かさならない位置をさがす
    var FS = 8, placed = [], dots = [], out = [], i, p;
    for (i = 0; i <= GOAL; i++) { p = pxy(i); dots.push([p[0] - 7, p[1] - 7, p[0] + 7, p[1] + 7]); }
    function hit(a, b) { return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]; }
    function cost(b, self) { var c = 0; placed.forEach(function (q) { if (hit(b, q)) c += 3; }); dots.forEach(function (q, k) { if (k !== self && hit(b, q)) c += 2; }); if (b[0] < 1 || b[2] > VW - 1) c += 5; return c; }
    for (i = 0; i < 47; i++) {
      p = pxy(i); var n = D.prefs[i].n, w = n.length * FS + 3, h = FS + 2, best = null;
      [[8, 0, 'start'], [-8, 0, 'end'], [0, -9, 'middle'], [0, 14, 'middle'], [8, -8, 'start'], [-8, -8, 'end'], [8, 11, 'start'], [-8, 11, 'end'], [14, 0, 'start'], [-14, 0, 'end'], [0, -17, 'middle'], [0, 22, 'middle']].some(function (c) {
        var x = p[0] + c[0], y = p[1] + c[1] + 3, bx = c[2] === 'start' ? x : c[2] === 'end' ? x - w : x - w / 2, b = [bx, y - h + 1, bx + w, y + 2], k = cost(b, i);
        if (!best || k < best.k) best = { k: k, x: x, y: y, a: c[2], b: b };
        return k === 0;
      });
      placed.push(best.b);
      out.push('<text x="' + best.x.toFixed(1) + '" y="' + best.y.toFixed(1) + '" font-size="' + FS + '" text-anchor="' + best.a + '" font-weight="700" fill="#3b2a1d" stroke="#fffbea" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round">' + A.esc(n) + '</text>');
    }
    return out.join('');
  }
  function boardSVG() {
    var o = [], pts = [];
    o.push('<rect width="' + VW + '" height="' + VH + '" fill="#9cc7d9"/><rect width="' + VW + '" height="' + VH + '" fill="url(#qgrid)" opacity=".25"/>');
    o.push('<defs><pattern id="qgrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M0 12q6 -5 12 0t12 0" stroke="#fff" fill="none" stroke-width="1"/></pattern></defs>');
    ISL.forEach(function (poly) { o.push('<polygon points="' + poly.map(function (q) { return proj(q[0], q[1]).map(function (v) { return v.toFixed(1); }).join(','); }).join(' ') + '" fill="#efe2b8" stroke="#a88a4e" stroke-width="2" stroke-linejoin="round"/>'); });
    o.push('<rect x="22" y="' + (VH - 72) + '" width="120" height="58" rx="10" fill="#efe2b8" stroke="#a88a4e" stroke-width="2" stroke-dasharray="5 3"/><text x="82" y="' + (VH - 60) + '" font-size="9" text-anchor="middle" fill="#7a5a2a">沖縄(べつの枠)</text>');
    for (var i = 0; i <= GOAL; i++) pts.push(pxy(i).join(','));
    o.push('<polyline points="' + pts.join(' ') + '" fill="none" stroke="#b5533c" stroke-width="2.4" stroke-dasharray="1 5" stroke-linecap="round"/>');
    o.push(prefLabels());
    for (i = 0; i <= GOAL; i++) { var p = pxy(i), k = i >= GOAL ? 'goal' : kindOf(i); o.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i === GOAL ? 9 : 5.5) + '" fill="' + (k === 'goal' ? '#e8453c' : KCOL[k]) + '" stroke="#5b3b1e" stroke-width="1.4"/>' + (i === GOAL ? '<text x="' + p[0] + '" y="' + (p[1] + 4) + '" font-size="11" text-anchor="middle">🏁</text>' : '')); }
    o.push('<g id="tlab"></g>');
    G.players.forEach(function (pl, j) { o.push(tokenG(pl, j)); });
    return '<svg viewBox="0 0 ' + VW + ' ' + VH + '" role="img" aria-label="日本地図の すごろく">' + o.join('') + '</svg>';
  }
  function labels() {}

  /* ===== 状態 ===== */
  function me() { return G.players[G.my || 0]; }
  function rankKey(p) { return (p.goalRound != null ? 1000 - p.goalRound : 0) * 100000 + p.pos * 1000 + p.money; }
  function ranks() { return G.players.map(function (p, i) { return i; }).sort(function (a, b) { return rankKey(G.players[b]) - rankKey(G.players[a]); }); }
  function lastIdx() { var r = ranks(); return r[r.length - 1]; }
  function setTok(j) {
    var p = G.players[j], el = A.root().querySelector('#tk' + j); if (!el) return;
    var xy = pxy(p.pos), same = G.players.filter(function (q, k) { return k < j && q.pos === p.pos; }).length;
    el.style.transform = 'translate(' + (xy[0] + (same ? (same % 2 ? 11 : -11) : 0)) + 'px,' + (xy[1] - 6 + (same > 1 ? 9 : 0)) + 'px)';
    if (j === (G.focus != null ? G.focus : (G.my || 0))) {
      var bd = A.root().querySelector('.tbd'), sv = bd && bd.querySelector('svg'); if (bd && sv) { var k2 = sv.clientWidth / VW; bd.scrollTo({ left: Math.max(0, xy[0] * k2 - bd.clientWidth / 2), top: Math.max(0, xy[1] * k2 - bd.clientHeight / 2) }); }
      labels();
    }
  }
  function showOji() {
    var li = (G.round >= 3 || G.over) ? lastIdx() : -1;
    G.players.forEach(function (p, j) { var o = A.root().querySelector('#oj' + j); if (o) o.style.display = (G.mode !== 'solo' && j === li) ? '' : 'none'; });
  }
  function statusHtml() {
    var m = me();
    return '<div class="qc" style="padding:10px 14px"><div class="qhead" style="margin:0"><b>🗾 ' + K('第', 'だい') + (G.round + 1) + K('ターン', 'ターン') + ' ・ ' + ageOf(m.pos) + K('歳', 'さい') + '</b><b>' + (m.pos >= GOAL ? '🏁 ゴール!' : '📍 ' + A.esc(D.prefs[Math.min(m.pos, 46)].n)) + ' ・ 💰' + m.money + '</b></div></div>';
  }
  function rankHtml() {
    return '<div class="trk">' + ranks().map(function (i, k) { var p = G.players[i]; return '<span style="--pc:' + p.c + '">' + (k + 1) + '位 ' + A.esc(p.name) + ' ' + (p.pos >= GOAL ? '🏁' : p.pos + '/' + GOAL) + '</span>'; }).join('') + '</div>';
  }
  function logHtml() { return G.log.slice(-3).map(function (l) { return '<div>' + A.esc(l) + '</div>'; }).join(''); }

  /* ===== はじまり ===== */
  function start(api) {
    A = api; D = A.data;
    if (!document.getElementById('qztripcss')) { var s = document.createElement('style'); s.id = 'qztripcss'; s.textContent = TRIPCSS; document.head.appendChild(s); }
    A.draw('<div class="qc tev"><h2>' + K('日本一周すごろく', 'にほん いっしゅう すごろく') + '</h2><p style="margin:0">' + K('北海道から沖縄まで、日本地図の上を旅しよう。止まったマスで 1問 解きます。まちがえたら、もとの マスに もどります。', 'ほっかいどうから おきなわまで たびを しよう。とまった マスで 1もん とくよ。まちがえたら もとの マスに もどるよ。') + '</p></div>' +
      '<button class="qb pri" data-m="battle">' + K('コンピュータと対戦', 'コンピュータと たいせん') + '</button>' +
      '<button class="qb" data-m="net">' + K('べつのスマホと(4けたの番号)', 'べつの スマホと(4けたの ばんごう)') + '</button><button class="qb sm" id="tback">' + K('もどる', 'もどる') + '</button>');
    A.bind('[data-m]', function (b) { if (b.dataset.m === 'net') return netStart(); init(b.dataset.m); });
    A.root().querySelector('#tback').onclick = function () { if (A.hub) A.hub(); else A.home(); };
  }
  function init(mode) {
    var st = A.st(), r = A.rng(Date.now());
    G = { mode: mode, round: 0, over: false, log: [], used: {}, usedEv: {}, r: r, qUsed: [], start0: 0,
      players: [{ name: st.name || 'あなた', c: ME_COL, money: 100, pos: 0, me: true, goalRound: null }] };
    if (mode === 'battle') CPU.forEach(function (c) { G.players.push({ name: c.name, c: c.c, money: 100, pos: 0, p: c.p, goalRound: null }); });
    birth();
  }
  /* ===== べつのスマホと(へや) ===== */
  var PAL = ['#4fb7a1', '#f2a65a', '#7aa7e8', '#c98ad8', '#e8c040', '#e8453c'];
  function netStart() {
    A.withRoom(function (RM) {
      RM.lobby(A, { game: 'trip', title: '日本一周すごろく', cfg: {}, min: 2, max: 4, cfgText: '2〜4人で あそびます', back: function () { start(A); },
        init: function (R) { return { phase: 'play', turn: 0, round: 0, over: false, msg: '', p: R.players.map(function () { return { pos: 0, money: 120, gr: null }; }) }; },
        onStart: function (R) { netInit(R); } });
    });
  }
  function netInit(R) {
    var S = R.state;
    G = { mode: 'net', R: R, my: R.my, token: 'tr' + Date.now(), round: S.round || 0, over: false, log: [], used: {}, usedEv: {}, r: A.rng(Date.now() + R.my), qUsed: [], start0: 0, seen: R.ver, turnNow: S.turn || 0, focus: S.turn || 0,
      players: R.players.map(function (nm, i) { return { name: nm, c: PAL[i % PAL.length], money: S.p[i].money, pos: S.p[i].pos, me: i === R.my, goalRound: S.p[i].gr }; }) };
    var g = G; G.log.push('みんなで すごろく スタート!');
    function alive() { return G === g && document.body.contains(A.root()); }
    function skipDead() {
      var S2 = JSON.parse(JSON.stringify(R.state)); if (S2.over) return; S2.turn = (S2.turn + 1) % S2.p.length; if (S2.turn === 0) { S2.round++; if (S2.p.some(function (q) { return q.gr != null; }) || S2.round >= TOTAL) S2.over = true; }
      S2.msg = R.players[R.state.turn] + ' は おやすみ(じかんぎれ)'; R.set(S2);
    }
    R.watch(function (r, err) {
      if (!alive()) { r.stop(); return; }
      if (err) { r.stop(); A.toast('へやが きえました'); G = null; return start(A); }
      var S2 = r.state; if (r.ver === g.seen) return; g.seen = r.ver;
      S2.p.forEach(function (q, i) { if (i === g.my && g.turnNow === g.my && !S2.over && S2.turn === g.my) return; var pl = g.players[i]; pl.pos = q.pos; pl.money = q.money; pl.goalRound = q.gr; });
      if (S2.over) { r.stop(); g.round = S2.round; return finish(); }
      if (S2.turn === g.my && g.turnNow === g.my) return;   // いま じぶんの番の さいちゅう
      g.round = S2.round; g.turnNow = S2.turn; g.focus = S2.turn; board(S2.msg);
    });
    g.iv = setInterval(function () { if (!alive() || G.over) { clearInterval(g.iv); return; } if (g.turnNow !== g.my && Date.now() - R._lastChange > 150000) { R._lastChange = Date.now(); skipDead(); } }, 5000);
    board();
  }
  function netEnd() {
    var R = G.R, m = me(), S = JSON.parse(JSON.stringify(R.state)), delta = m.money - (G.m0 || m.money), g = G;
    S.p[G.my] = { pos: m.pos, money: m.money, gr: m.goalRound };
    S.msg = m.name + ': ' + (m.pos >= GOAL ? 'ゴール!' : D.prefs[Math.min(m.pos, 46)].n) + ' ' + (delta >= 0 ? '+' : '') + delta + '万円';
    S.turn = (S.turn + 1) % S.p.length;
    if (S.turn === 0) { S.round++; if (S.p.some(function (q) { return q.gr != null; }) || S.round >= TOTAL) S.over = true; }
    R.set(S).then(function (ok) {
      if (G !== g) return;
      var T = ok ? S : R.state;
      T.p.forEach(function (q, i) { var pl = g.players[i]; pl.pos = q.pos; pl.money = q.money; pl.goalRound = q.gr; });
      g.seen = R.ver; g.round = T.round; g.turnNow = T.turn; g.focus = T.turn;
      if (T.over) { R.stop(); return finish(); }
      board(T.msg);
    }, function (e) { A.toast(e.message || 'つうしんできませんでした'); });
  }
  function birth() {
    var ev = D.events.filter(function (e) { return e.n === '誕生'; })[0];
    A.draw('<div class="qc tev"><div class="big">' + ev.i + '</div><h2>' + A.esc(ev.n) + '</h2><p>' + A.T(ev.t) + '</p><div class="qfb ok">' + A.esc(ev.good) + ' +' + ev.gp + K('万円', 'まんえん') + '</div></div><button class="qb pri" id="tgo">' + K('旅に 出発!', 'たびに しゅっぱつ!') + '</button>');
    me().money += ev.gp; G.log.push('👶 誕生! お祝い +' + ev.gp);
    A.root().querySelector('#tgo').onclick = function () { board(); };
  }

  /* ===== ボード画面 ===== */
  function board(msg) {
    if (typeof msg === 'string') G.log.push(msg);
    A.draw(statusHtml() + '<div class="qc" style="text-align:center;padding:10px"><div class="tdice" id="tdice">🎲</div><br><button class="qb pri" id="troll" style="margin:6px 0 0">' + K('サイコロを ふる', 'サイコロを ふる') + '</button>' + rankHtml() + '<div class="tlog" id="tlog">' + logHtml() + '</div></div><div class="tbd">' + boardSVG() + '</div>');
    G.players.forEach(function (p, j) { setTok(j); });
    showOji();
    A.root().querySelector('#troll').onclick = function () { rollMe(); };
    if (G.mode === 'net') {
      A.root().setAttribute('data-rm', G.token);
      var bt = A.root().querySelector('#troll');
      if (G.turnNow !== G.my) { bt.disabled = true; bt.textContent = G.R.players[G.turnNow] + K(' の番を まっています…', ' の ばんを まっています…'); }
    }
  }
  function setLog(t) { G.log.push(t); var el = A.root().querySelector('#tlog'); if (el) el.innerHTML = logHtml(); }
  function rollDice(cb) {
    var el = A.root().querySelector('#tdice'), faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'], n = 0, v = 1 + Math.floor(G.r() * 6);
    if (el) el.classList.add('roll');
    var iv = setInterval(function () { n++; if (el) el.textContent = faces[Math.floor(Math.random() * 6)]; if (n >= 7) { clearInterval(iv); if (el) { el.classList.remove('roll'); el.textContent = faces[v - 1]; } setTimeout(function () { cb(v); }, 250); } }, 70);
  }
  function hop(j, steps, cb, back) {   // back=true: もどる(はやめに)
    var p = G.players[j];
    (function one(i) {
      if (i >= steps || (!back && p.pos >= GOAL)) return setTimeout(cb, 150);
      p.pos += back ? -1 : 1; setTok(j); setTimeout(function () { one(i + 1); }, back ? 140 : 230);
    })(0);
  }
  function rollMe() {
    var b = A.root().querySelector('#troll'); if (b) b.disabled = true;
    G.start0 = me().pos;
    G.m0 = me().money; rollDice(function (v) { hop(G.my || 0, v, function () { landMe(); }); });
  }
  /** まちがえたとき: サイコロを ふる前の マスに もどる */
  function backMe(after) {
    var n = me().pos - G.start0; if (n <= 0) return after();
    A.draw(statusHtml() + '<div class="qc tev"><div class="big">↩️</div><h2>' + K('もとの マスに もどる…', 'もとの マスに もどる…') + '</h2></div><div class="tbd">' + boardSVG() + '</div>');
    G.players.forEach(function (p, j) { setTok(j); }); showOji();
    setTimeout(function () { hop(G.my || 0, n, function () { after(); }, true); }, 500);
  }

  /* ===== マスの結果(毎回1問) ===== */
  function pickQuestion(genre, i) {
    var st = A.st();
    if (genre === 'ご当地') { var pn = D.prefs[Math.min(i, 46)].n, q = D.questions.filter(function (x) { return x.g === 'ご当地' && x.a === pn; })[0]; if (q) return q; }
    var pool = A.poolFor(st.level, genre && genre !== 'ご当地' ? [genre] : [], 10).filter(function (x) { return x.g !== 'ご当地' && G.qUsed.indexOf(x.id) < 0; });
    if (!pool.length) { G.qUsed = []; pool = A.poolFor(st.level, [], 10).filter(function (x) { return x.g !== 'ご当地'; }); }
    return A.shuffle(pool, G.r)[0];
  }
  function ask(q, head, ok, ng, after) {
    G.qUsed.push(q.id); var wrong = false;
    A.ask(q, { r: A.rng(Date.now() + q.id), sec: A.LV_SEC[A.st().level], head: statusHtml() + head, nextLabel: K('次へ', 'つぎへ'),
      onAnswer: function (good) {
        var gain = good ? ok.v : ng.v; me().money += gain; wrong = !good;
        if (good) A.giveCard(q, A.rng(Date.now() + q.id));
        A.addXp(good ? 3 : 1); A.Store.save();
        var fb = A.root().querySelector('#qfb'); if (fb) fb.insertAdjacentHTML('afterbegin', '<div class="qfb ' + (good ? 'ok' : 'ng') + '"><b>' + (good ? ok.msg : ng.msg) + '</b> ' + (gain >= 0 ? '+' : '') + gain + K('万円', 'まんえん') + (good ? '' : '<br>↩️ ' + K('まちがえたので、もとの マスに もどります', 'まちがえたので もどるよ')) + '</div>');
      }, next: function () { if (wrong) backMe(after); else after(); } });
  }
  function fullName(n) { return n === '北海道' ? n : n === '東京' ? '東京都' : n === '大阪' || n === '京都' ? n + '府' : n + '県'; }
  function prefCard(pr) {
    var li = function (a) { return (a || []).map(A.esc).join('・'); };
    return '<div class="pcard"><h2>' + A.esc(fullName(pr.n)) + '</h2><div class="pin"><div class="pil" aria-hidden="true">' + (pr.i || pr.e) + '</div>' +
      '<div class="prow"><span class="pill">' + K('県庁所在地', 'けんちょうしょざいち') + '</span>' + A.esc(pr.c || '') + '</div>' +
      '<div class="prow"><span class="pill g">' + K('めいぶつ', 'めいぶつ') + '</span>' + li(pr.t) + '</div>' +
      '<div class="prow" style="margin:0"><span class="pill b">' + K('川・湖・山など', 'かわ・みずうみ・やま') + '</span>' + li(pr.w) + '</div></div></div>';
  }
  function landMe() {
    var i = me().pos; if (i >= GOAL) { me().goalRound = G.round; return cpuTurns(); }
    A.draw(statusHtml() + prefCard(D.prefs[i]) + '<button class="qb pri" id="pnext">' + K('つぎへ', 'つぎへ') + '</button>');
    A.root().querySelector('#pnext').onclick = landMe2;
  }
  function landMe2() {
    var i = me().pos; if (i >= GOAL) { me().goalRound = G.round; return cpuTurns(); }
    var k = kindOf(i), pr = D.prefs[i], head = '<div class="qc" style="padding:10px 14px"><b>' + pr.e + ' ' + A.esc(pr.n) + '</b> <span class="qm">' + K('名物:', 'めいぶつ:') + A.esc(pr.s) + '</span></div>';
    var done = function () { if (me().pos >= GOAL && me().goalRound == null) me().goalRound = G.round; cpuTurns(); };
    if (k === 'goto') ask(pickQuestion('ご当地', i), head, { v: 30, msg: 'ご当地クイズ 正解!' }, { v: 0, msg: 'おしい! 名物を おぼえよう' }, done);
    else if (k === 'quiz') ask(pickQuestion(null, i), head, { v: 20, msg: 'ナイス!' }, { v: -10, msg: 'ざんねん…' }, done);
    else eventMe(head, done);
  }
  function pickEvent(pos) {
    var ph = phaseOf(ageOf(pos)), pool = D.events.filter(function (e) { return e.n !== '誕生' && e.ph.indexOf(ph) >= 0; });
    var fresh = pool.filter(function (e) { return !G.usedEv[e.n]; }); if (fresh.length) pool = fresh;
    var e = A.shuffle(pool, G.r)[0]; G.usedEv[e.n] = 1; return e;
  }
  function eventMe(head, after) {
    var ev = pickEvent(me().pos);
    A.draw(statusHtml() + '<div class="qc tev"><span class="qtag">' + K('人生イベント', 'じんせい イベント') + ' ・ ' + ageOf(me().pos) + K('歳', 'さい') + '</span><div class="big tbob">' + ev.i + '</div><h2>' + A.esc(ev.n) + '</h2><p>' + A.T(ev.t) + '</p><div class="qm">' + K('クイズに 正解すると いい 結果に!(まちがえると もどる)', 'せいかいすると いい けっかに!') + '</div></div><button class="qb pri" id="tch">' + K('チャレンジ!', 'チャレンジ!') + '</button>');
    A.root().querySelector('#tch').onclick = function () {
      ask(pickQuestion(ev.g, me().pos), '<div class="qc" style="padding:10px 14px"><b>' + ev.i + ' ' + A.esc(ev.n) + '</b></div>', { v: ev.gp, msg: '🎉 ' + ev.good }, { v: ev.bp, msg: '💦 ' + ev.bad }, after);
    };
  }

  /* ===== コンピューターの番 ===== */
  function cpuTurns() {
    if (G.mode === 'net') return netEnd();
    if (G.mode !== 'battle') return endRound();
    board(); var bt = A.root().querySelector('#troll'); if (bt) { bt.disabled = true; bt.textContent = K('みんなの 番…', 'みんなの ばん…'); } var j = 1;
    (function nextCpu() {
      if (j >= G.players.length) return setTimeout(endRound, 400);
      var jj = j++, p = G.players[jj];
      if (p.pos >= GOAL) return nextCpu();
      rollDice(function (v) { var s0 = p.pos; hop(jj, v, function () {
        var i = Math.min(p.pos, 46), k = p.pos >= GOAL ? 'goal' : kindOf(i), pr = D.prefs[i], ok = G.r() < p.p, g = 0, t = '';
        if (k === 'goal') { p.goalRound = G.round; t = '🏁 ゴール!'; }
        else if (k === 'goto') { g = ok ? 30 : 0; t = pr.n + ' ご当地' + (ok ? '正解' : 'おしい'); }
        else if (k === 'quiz') { g = ok ? 20 : -10; t = pr.n + ' クイズ' + (ok ? '正解' : 'ざんねん'); }
        else { var ev = pickEvent(p.pos); g = ok ? ev.gp : ev.bp; t = ev.i + ev.n + (ok ? ' うまくいった' : ' たいへん'); }
        p.money += g; setLog(p.name + ': ' + t + ' ' + (g ? (g > 0 ? '+' : '') + g : '') + (k !== 'goal' && !ok ? ' ↩️もどる' : ''));
        var after = function () { var rk = A.root().querySelector('.trk'); if (rk) rk.outerHTML = rankHtml(); showOji(); setTimeout(nextCpu, 600); };
        if (k !== 'goal' && !ok) setTimeout(function () { hop(jj, p.pos - s0, after, true); }, 500); else after();
      }); });
    })();
  }
  function endRound() {
    var someoneGoal = G.players.some(function (p) { return p.goalRound != null; });
    G.round++;
    if (someoneGoal || G.round >= TOTAL) return finish();
    board();
  }

  /* ===== おしまい ===== */
  function finish() {
    if (G.over) return;
    G.over = true;
    var st = A.st(), m = me(), r = ranks(), myRank = r.indexOf(G.my || 0) + 1, li = r[r.length - 1], vs = G.mode !== 'solo';
    var reached = m.goalRound != null;
    var oji = vs ? li : (reached ? -1 : 0);
    var xp = 15 + (vs && myRank === 1 ? 10 : 0) + (G.mode === 'solo' && reached ? 10 : 0);
    var evo = A.addXp(xp); st.trip = st.trip || { played: 0, best: 0 }; st.trip.played++; st.trip.best = Math.max(st.trip.best, m.money); A.Store.save();
    var rows = r.map(function (i, k) { var p = G.players[i]; return '<div class="qhead" style="margin:0 0 6px"><b>' + (k + 1) + '位 ' + A.esc(p.name) + (i === oji ? ' 👴' : '') + '</b><span>' + (p.pos >= GOAL ? '🏁ゴール ' : A.esc(D.prefs[Math.min(p.pos, 46)].n) + ' ') + '💰' + p.money + '</span></div>'; }).join('');
    var tail = vs ? (oji === (G.my || 0) ? K('あなたが 最下位…。1本ハゲの おじさんが 乗っかりました!', 'さいかい…。はげの おじさんが のっかった!') : A.esc(G.players[oji].name) + K(' が 最下位。おじさんが 乗っかりました!', ' に おじさんが のっかった!'))
      : (reached ? K('日本一周 達成! おじさんは 来ませんでした', 'ゴール! おじさんは こなかったよ') : K('ゴールに とどかず、おじさんが 乗っかりました…', 'ゴールに とどかず おじさんが のっかった…'));
    A.draw('<div class="qc tev"><h2>' + K('旅の けっか', 'たびの けっか') + '</h2><div style="font-size:1.4em;font-weight:700">' + (vs ? myRank + K('位', 'い') : (reached ? K('日本一周!', 'ゴール!') : A.esc(D.prefs[Math.min(m.pos, 46)].n) + 'まで')) + '</div>' +
      (oji >= 0 ? '<div class="tbob" style="display:inline-block;margin:8px">' + ojiSVG(110) + '</div>' : '<div style="font-size:3em">🎉</div>') + '<div class="qbub">' + tail + '</div></div><div class="qc">' + rows + '</div>' +
      '<div class="qfb ok"><b>+' + xp + ' ' + K('経験値', 'けいけんち') + '</b>' + (evo ? '<br>🎊 あいぼうが しんかした!' : '') + '</div><button class="qb pri" id="tagain">' + K('もういちど あそぶ', 'もういちど') + '</button><button class="qb" id="thome">' + K('GAMEへ もどる', 'GAMEへ もどる') + '</button>');
    var leaveNet = function () { if (G && G.R) { G.R.leave(); } G = null; };
    A.root().querySelector('#tagain').onclick = function () { leaveNet(); start(A); }; A.root().querySelector('#thome').onclick = function () { leaveNet(); if (A.hub) A.hub(); else A.home(); };
  }

  window.HmtQuizTrip = { start: start };
})();
