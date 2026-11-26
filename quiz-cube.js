/* ルービックキューブ(quiz.js の GAME メニューから呼ばれます: HmtCube.start(api))
   レベル1〜5(2×2×2 〜 6×6×6)。ボタンで面をまわし、展開図(6めんを ひろげた図)で見ます。
   ・特訓 … ひとりで れんしゅう(この端末に ベスト記録)
   ・対戦 … ロボットと おなじ並びから よーいドン(先に そろえたら勝ち)
   ・大会 … 町会みんなで 今週の おなじ並びに挑戦。ニックネームで 町会内ランキング(サーバー: cube_info / cube_submit / cube_nick) */
(function () {
  'use strict';
  var A, S = { mode: 'train', level: 1 }, tick = null, KEY = 'hmt_cube_v2';
  var LV = [null,
    { n: 2, mv: 8, t: '(2×2×2)', d: 'いちばん 小さい キューブ。8回かきまぜた形' },
    { n: 3, mv: 12, t: '(3×3×3)', d: 'ふつうの ルービックキューブ。12回かきまぜた形' },
    { n: 4, mv: 16, t: '(4×4×4)', d: '内側の段も まわります。16回かきまぜた形' },
    { n: 5, mv: 20, t: '(5×5×5)', d: '大きい キューブ。20回かきまぜた形' },
    { n: 6, mv: 24, t: '(6×6×6)', d: 'いちばん 大きい キューブ。24回かきまぜた形' }];
  var COL = ['#f4f4f0', '#f7d21e', '#2e9d4a', '#2563c9', '#d93a2b', '#f08a1c'], CN = ['白', '黄', '緑', '青', '赤', '橙'];   // 0=上 1=下 2=前 3=後 4=右 5=左
  var FACE = { U: { a: 1, s: 1, nm: '上' }, D: { a: 1, s: -1, nm: '下' }, F: { a: 2, s: 1, nm: '前' }, B: { a: 2, s: -1, nm: '後' }, R: { a: 0, s: 1, nm: '右' }, L: { a: 0, s: -1, nm: '左' } };
  var NORM = { U: [0, 1, 0, 0], D: [0, -1, 0, 1], F: [0, 0, 1, 2], B: [0, 0, -1, 3], R: [1, 0, 0, 4], L: [-1, 0, 0, 5] };
  var FK = ['U', 'D', 'F', 'B', 'R', 'L'];

  /* ---------- キューブの中身(だれが見ても同じ結果になる、ただの計算) ---------- */
  function coords(N) { var o = []; for (var i = 0; i < N; i++) o.push(2 * i - (N - 1)); return o; }   // 段の位置: 2×2 は -1,1 / 3×3 は -2,0,2 / 6×6 は -5,-3,-1,1,3,5
  function make(N) {
    var st = [], cs = coords(N), M = N - 1;
    FK.forEach(function (k) {
      var nv = NORM[k];
      cs.forEach(function (i) { cs.forEach(function (j) {
        var p;
        if (nv[1] !== 0) p = [i, nv[1] * M, j]; else if (nv[2] !== 0) p = [i, j, nv[2] * M]; else p = [nv[0] * M, i, j];
        st.push({ p: p, n: [nv[0], nv[1], nv[2]], c: nv[3] });
      }); });
    });
    return { N: N, st: st };
  }
  function rot(v, a, q) {   // 軸aのまわりに 90度×q (q=+1 / -1)
    var x = v[0], y = v[1], z = v[2];
    if (a === 0) return q > 0 ? [x, -z, y] : [x, z, -y];
    if (a === 1) return q > 0 ? [z, y, -x] : [-z, y, x];
    return q > 0 ? [-y, x, z] : [y, -x, z];
  }
  function turn(cube, k, dir) {   // dir: +1 = 右まわり(時計) / -1 = 左まわり。その面を そとから見て
    var f = FACE[k], q = -f.s * dir, M = cube.N - 1;
    cube.st.forEach(function (t) { if (t.p[f.a] === f.s * M) { t.p = rot(t.p, f.a, q); t.n = rot(t.n, f.a, q); } });
  }
  function solved(cube) {
    var m = {}, ok = true;
    cube.st.forEach(function (t) { var key = t.n.join(','); if (m[key] === undefined) m[key] = t.c; else if (m[key] !== t.c) ok = false; });
    return ok;
  }
  function progress(cube) {   // 0〜1(そろい具合)。ロボットとの競争の ものさし
    var by = {}, N2 = cube.N * cube.N;
    cube.st.forEach(function (t) { var key = t.n.join(','); (by[key] = by[key] || [0, 0, 0, 0, 0, 0])[t.c]++; });
    var sum = 0; Object.keys(by).forEach(function (k) { sum += Math.max.apply(null, by[k]); });
    return Math.max(0, Math.min(1, (sum / (6 * N2) - 0.34) / 0.66));
  }
  function rng(seed) {
    var h = 1779033703 ^ seed.length, i;
    for (i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    var a = h >>> 0;
    return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function scrambleMoves(seed, n, N) {   // [軸, 段の位置, 向き] を n 個(内側の段も まぜます)
    var r = rng(seed), out = [], cs = coords(N || 3), la = -1, lc = 0;
    while (out.length < n) {
      var a = Math.floor(r() * 3), c = cs[Math.floor(r() * cs.length)], q = r() < 0.5 ? 1 : -1;
      if (a === la && c === lc) continue; la = a; lc = c; out.push([a, c, q]);
    }
    return out;
  }
  function scrambled(level, seed) {
    var L = LV[level], c, tries = 0, mv;
    do { c = make(L.n); mv = scrambleMoves(seed + '#' + tries, L.mv, L.n); mv.forEach(function (m) { turnLayer(c, m[0], m[1], m[2]); }); tries++; } while (solved(c) && tries < 20);
    c.scr = mv;   // かきまぜた手。攻略補助が、これを 逆にもどす
    return c;
  }
  /* 展開図の位置: 上U / 左L 前F 右R 後B / 下D */
  function idx(N, c) { return (c + N - 1) / 2; }
  function cell(N, t) {
    var x = t.p[0], y = t.p[1], z = t.p[2], k = t.n.join(',');
    var rc = { '0,1,0': [idx(N, z), idx(N, x)], '0,0,1': [idx(N, -y), idx(N, x)], '1,0,0': [idx(N, -y), idx(N, -z)], '0,0,-1': [idx(N, -y), idx(N, -x)], '-1,0,0': [idx(N, -y), idx(N, z)], '0,-1,0': [idx(N, -z), idx(N, x)] }[k];
    var off = { '0,1,0': [0, 1], '-1,0,0': [1, 0], '0,0,1': [1, 1], '1,0,0': [1, 2], '0,0,-1': [1, 3], '0,-1,0': [2, 1] }[k];
    return { r: off[0] * N + rc[0], c: off[1] * N + rc[1] };
  }
  function netSvg(cube, letters, w) {
    var N = cube.N, cs = Math.floor(w / (4 * N)), g = 2, W = cs * 4 * N, H = cs * 3 * N, h = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="キューブの展開図" style="display:block;max-width:' + W + 'px;margin:0 auto">';
    cube.st.forEach(function (t) {
      var q = cell(N, t);
      h += '<rect x="' + (q.c * cs + g / 2) + '" y="' + (q.r * cs + g / 2) + '" width="' + (cs - g) + '" height="' + (cs - g) + '" rx="4" fill="' + COL[t.c] + '" stroke="#1b2438" stroke-width="1.2"/>';
      if (letters) h += '<text x="' + (q.c * cs + cs / 2) + '" y="' + (q.r * cs + cs / 2 + cs * 0.16) + '" text-anchor="middle" font-size="' + Math.round(cs * 0.5) + '" font-weight="800" fill="' + (t.c === 1 || t.c === 0 ? '#1b2438' : '#fff') + '">' + CN[t.c] + '</text>';
    });
    [['上', 0, 0], ['下', 0, 2]].forEach(function (f) { h += '<text x="' + (N * cs / 2) + '" y="' + (f[2] * N * cs + N * cs / 2 + 8) + '" text-anchor="middle" font-size="15" font-weight="800" fill="#9aa3b2">' + f[0] + 'の面</text>'; });
    h += '<text x="' + (W - 6) + '" y="' + (H - 8) + '" text-anchor="end" font-size="11" font-weight="700" fill="#9aa3b2">中段: 左・前・右・後ろ</text>';
    return h + '</svg>';
  }

  /* ---------- きろく(この端末) ---------- */
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || { best: {} }; } catch (e) { return { best: {} }; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function fmt(ms) { var s = Math.floor(ms / 1000), m = Math.floor(s / 60); return m + ':' + ('0' + (s % 60)).slice(-2) + (ms < 60000 ? '.' + Math.floor((ms % 1000) / 100) : ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function stop() { if (tick) { clearInterval(tick); tick = null; } }

  var CSS = '#qz .cbm{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 10px}#qz .cbm button{min-height:64px;margin:0;font-size:1.05em;line-height:1.3}#qz .cbm button{flex-direction:column;gap:2px;padding:8px 4px}#qz .cbm button small{display:block;font-weight:500;font-size:.72em;opacity:.8;text-align:center}#qz .cbl button>span:first-child{text-align:left}' +
    '#qz .cbl{display:flex;flex-direction:column;gap:8px;margin:0 0 12px}#qz .cbl button{display:flex;justify-content:space-between;align-items:center;text-align:left;margin:0;min-height:56px}#qz .cbl button small{display:block;font-weight:500;opacity:.75}' +
    '#qz .cbs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}#qz .cbs button{min-height:60px;margin:0;font-size:1.15em;padding:6px 2px}' +
    '#qz .cblk{position:absolute;right:4px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10px;font-weight:800;color:#6b5a3a;background:rgba(255,255,255,.85);border:1px solid #cfc7b4;border-radius:12px;padding:6px 4px;cursor:pointer;touch-action:manipulation;z-index:2}#qz .cblk input{position:absolute;opacity:0;width:100%;height:100%;left:0;top:0;margin:0;cursor:pointer}#qz .cblk i{display:block;width:22px;height:44px;border-radius:12px;background:#cfc7b4;position:relative;transition:background .15s}#qz .cblk i::after{content:"";position:absolute;left:2px;top:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.4);transition:top .15s}#qz .cblk input:checked+i{background:#e11d48}#qz .cblk input:checked+i::after{top:24px}' +
    '#qz .cbi{display:flex;justify-content:space-between;align-items:center;font-weight:800;margin:0 0 8px;font-size:1.1em}#qz .cbp{height:14px;border-radius:7px;background:#e8e2d2;overflow:hidden;margin:4px 0 8px}#qz .cbp i{display:block;height:100%;background:#2e9d4a;transition:width .4s}#qz .cbp.rb i{background:#d93a2b}' +
    '#qz .cbr{width:100%;border-collapse:collapse}#qz .cbr td{padding:8px 6px;border-bottom:1px solid #e8e2d2}#qz .cbr tr.me td{background:#fff3c8;font-weight:800}#qz .cbbig{font-size:2em;font-weight:800;text-align:center;margin:6px 0}';

  /* ---------- 画面 ---------- */
  function home() {
    stop(); var d = load(), L = LV[S.level];
    A.draw('<h2 class="hph">ルービックキューブ</h2>' +
      '<div class="qc"><div style="font-weight:800;margin:0 0 8px">あそびかた</div><div class="cbm">' +
      [['train', '特訓', 'ひとりで れんしゅう'], ['battle', '対戦', 'ロボットと きょうそう'], ['cup', '大会', '町会で ランキング']].map(function (m) { return '<button type="button" class="qb' + (S.mode === m[0] ? ' pri' : '') + '" data-md="' + m[0] + '">' + m[1] + '<small>' + m[2] + '</small></button>'; }).join('') + '</div>' +
      '<div style="font-weight:800;margin:6px 0 8px">レベル</div><div class="cbl">' +
      [1, 2, 3, 4, 5].map(function (i) { var b = d.best[i]; return '<button type="button" class="qb' + (S.level === i ? ' pri' : '') + '" data-lv="' + i + '"><span>レベル' + i + ' ' + LV[i].t + '<small>' + LV[i].d + '</small></span><span>' + (b ? 'ベスト ' + fmt(b.ms) : '') + '</span></button>'; }).join('') + '</div>' +
      '<button type="button" class="qb pri" id="cbgo">' + (S.mode === 'cup' ? '今週の大会を見る' : S.mode === 'battle' ? 'ロボットと対戦する' : '特訓をはじめる') + '</button></div>' +
      '<div class="qc"><div class="qm" style="line-height:1.7">キューブの 6つの面を、ひろげた図で 見ます。下の ボタンで 面を まわして、<b>6つの面が それぞれ 同じ色</b>に なったら 完成です。<br>「↻」は 右まわり、「↺」は 左まわり(その面を 外から見て)。</div></div>' +
      '<button type="button" class="qb" id="cbback">GAME にもどる</button>');
    A.bind('[data-md]', function (b) { S.mode = b.dataset.md; home(); });
    A.bind('[data-lv]', function (b) { S.level = +b.dataset.lv; home(); });
    document.getElementById('cbgo').onclick = function () { S.mode === 'cup' ? cupHome() : play(null); };
    document.getElementById('cbback').onclick = function () { A.hub(); };
    L = null;
  }

  function cupHome(info) {
    var lv = S.level;
    if (!info) {
      A.draw('<div class="qc">よみこみ中…</div>');
      return A.call('cube_info', { level: lv }).then(function (r) { cupHome(r); }, function (e) { A.toast(e.message || 'つながりませんでした'); home(); });
    }
    var h = '<h2 class="hph">大会 ・ レベル' + lv + '</h2><div class="qc"><div style="font-weight:800">' + LV[lv].t + '</div><div class="qm">今週(' + esc(info.weekLabel) + ')の おなじ並びに、みんなで 挑戦。いちばん早い記録が 順位に のります。</div></div>';
    h += '<div class="qc"><div style="font-weight:800;margin:0 0 6px">今週のランキング</div>' + rankHtml(info) + '</div>';
    if (info.needNick) h += '<div class="qc"><div style="font-weight:800;margin:0 0 6px">ニックネームを きめてください(ランキングに のります)</div><input id="cbnick" maxlength="12" placeholder="ニックネーム(12文字まで)" style="width:100%;min-height:52px;font-size:1em;padding:8px 12px;border:2px solid #cfc7b4;border-radius:12px;margin-bottom:10px" aria-label="ニックネーム"><button type="button" class="qb pri" id="cbnk">これで きめる</button></div>';
    else h += '<div class="qc"><div class="qm">ニックネーム: <b>' + esc(info.nick) + '</b></div><button type="button" class="qb pri" id="cbplay">挑戦する(スタート)</button></div>';
    h += '<button type="button" class="qb" id="cbhome">もどる</button>';
    A.draw(h);
    var go = document.getElementById('cbplay'); if (go) go.onclick = function () { play(info); };
    var nk = document.getElementById('cbnk'); if (nk) nk.onclick = function () { var v = document.getElementById('cbnick').value.trim(); if (!v) return A.toast('ニックネームを いれてください'); nk.disabled = true; A.call('cube_nick', { nick: v }).then(function () { cupHome(null); }, function (e) { nk.disabled = false; A.toast(e.message || 'うまく いきませんでした'); }); };
    document.getElementById('cbhome').onclick = home;
  }
  function rankHtml(info) {
    if (!info.rank || !info.rank.length) return '<div class="qm">まだ だれも 挑戦していません。いちばん乗りを めざしましょう!</div>';
    return '<table class="cbr">' + info.rank.map(function (r) { return '<tr class="' + (r.me ? 'me' : '') + '"><td>' + r.rank + '位</td><td>' + esc(r.name) + (r.me ? '(あなた)' : '') + '</td><td style="text-align:right">' + fmt(r.ms) + '</td><td style="text-align:right;color:#6b7280">' + r.moves + '手</td></tr>'; }).join('') + '</table>' +
      (info.mine && info.mine.rank > 10 ? '<div class="qm" style="margin-top:6px">あなたは ' + info.mine.rank + '位(' + fmt(info.mine.ms) + ')です。</div>' : '');
  }

  /* ---------- 立体表示(canvas) ---------- */
  function rotW(v, a, th) {   // 軸aのまわりに th ラジアン(右ねじ)
    var c = Math.cos(th), s = Math.sin(th), x = v[0], y = v[1], z = v[2];
    if (a === 0) return [x, y * c - z * s, y * s + z * c];
    if (a === 1) return [x * c + z * s, y, -x * s + z * c];
    return [x * c - y * s, x * s + y * c, z];
  }
  function viewV(v, V) { var r = rotW(v, 1, V.yaw); return rotW(r, 0, V.pitch); }
  function proj(v, V) { var k = V.F / (V.D - v[2]); return [V.cx + v[0] * k, V.cy - v[1] * k, v[2]]; }
  function cellW(N) { return 3 / N; }
  function worldOf(N, t) {
    var sc = 1.5 / N, w = [t.p[0] * sc, t.p[1] * sc, t.p[2] * sc];
    for (var i = 0; i < 3; i++) if (t.n[i] !== 0) w[i] = t.n[i] * 1.5;
    return w;
  }
  function quad(N, t, h) {   // ワールドの4すみ(その面の中)
    var w = worldOf(N, t), an = t.n[0] ? 0 : t.n[1] ? 1 : 2, b = (an + 1) % 3, c = (an + 2) % 3, out = [];
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) { var v = w.slice(); v[b] += q[0] * h; v[c] += q[1] * h; out.push(v); });
    return out;
  }
  function layerQuadList(cube, V, anim) {   // 画面に出す板のリスト(奥から手前の順)
    var N = cube.N, cw = cellW(N), out = [], D = V.D;
    cube.st.forEach(function (t) {
      var inl = anim && t.p[anim.a] === anim.c, th = inl ? anim.th : 0;
      var nrm = t.n.map(function (x) { return x; }), w = worldOf(N, t);
      if (inl) { nrm = rotW(nrm, anim.a, th); }
      var nv = viewV(nrm, V), cwv = viewV(inl ? rotW(w, anim.a, th) : w, V);
      if (nv[0] * (0 - cwv[0]) + nv[1] * (0 - cwv[1]) + nv[2] * (D - cwv[2]) <= 0.02) return;   // うら向きは 描かない
      var mk = function (h) { return quad(N, t, h).map(function (v) { if (inl) v = rotW(v, anim.a, th); return proj(viewV(v, V), V); }); };
      out.push({ t: t, body: mk(cw * 0.5), face: mk(cw * 0.43), z: cwv[2] });
    });
    out.sort(function (a, b) { return a.z - b.z; });
    return out;
  }
  function inPoly(pt, poly) {
    var neg = false, pos = false;
    for (var i = 0; i < poly.length; i++) { var a = poly[i], b = poly[(i + 1) % poly.length], cr = (b[0] - a[0]) * (pt[1] - a[1]) - (b[1] - a[1]) * (pt[0] - a[0]); if (cr < 0) neg = true; if (cr > 0) pos = true; }
    return !(neg && pos);
  }
  /* ドラッグの向きから、どの段を どちらへ回すか決める(ぬった面を 指でなぞった方向に動く回し方を えらぶ) */
  function decide(cube, V, t, dx, dy) {
    var N = cube.N, w = worldOf(N, t), an = t.n[0] ? 0 : t.n[1] ? 1 : 2, s1 = proj(viewV(w, V), V), best = null, bs = -1e9;
    [0, 1, 2].forEach(function (a) {
      if (a === an) return;
      [1, -1].forEach(function (q) {
        var s2 = proj(viewV(rotW(w, a, q * 0.3), V), V), vx = s2[0] - s1[0], vy = s2[1] - s1[1], L = Math.sqrt(vx * vx + vy * vy) || 1, sc = (vx * dx + vy * dy) / L;
        if (sc > bs) { bs = sc; best = { a: a, c: t.p[a], q: q }; }
      });
    });
    return best;
  }
  function turnLayer(cube, a, c, q) { cube.st.forEach(function (t) { if (t.p[a] === c) { t.p = rot(t.p, a, q); t.n = rot(t.n, a, q); } }); }
  function drawCube(cv, cube, V, anim, letters) {
    var ctx = cv.getContext('2d'), W = cv.width, list = layerQuadList(cube, V, anim);
    ctx.clearRect(0, 0, W, cv.height); ctx.lineJoin = 'round';
    list.forEach(function (o) {
      ctx.beginPath(); o.body.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fillStyle = '#15181f'; ctx.fill(); ctx.strokeStyle = '#15181f'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); o.face.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fillStyle = COL[o.t.c]; ctx.fill();
      if (letters) {
        var cx = 0, cy = 0; o.face.forEach(function (p) { cx += p[0] / 4; cy += p[1] / 4; });
        var sz = Math.abs(o.face[1][0] - o.face[0][0]) + Math.abs(o.face[1][1] - o.face[0][1]);
        ctx.font = '800 ' + Math.max(12, Math.round(sz * 0.5)) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = (o.t.c === 0 || o.t.c === 1) ? '#1b2438' : '#fff'; ctx.fillText(CN[o.t.c], cx, cy);
      }
    });
    if (V.hint && !anim) drawHint(ctx, cube, V, list, W);
    return list;
  }
  /* 攻略補助: つぎに まわす段を ふちどりして、まわす向きの矢印を 描く */
  var AXN = [['左', '右'], ['下', '上'], ['後ろ', '前']];
  function layerName(N, a, c) {   // 近いほうの はしから かぞえた 名前(例: 左から2番目の段)
    var i = (c + N - 1) / 2, lo = i <= (N - 1) / 2, k = lo ? i : N - 1 - i, side = AXN[a][lo ? 0 : 1];
    if (N % 2 === 1 && i === (N - 1) / 2) return ['左右', '上下', '前後'][a] + 'の まんなかの段';
    return k === 0 ? 'いちばん' + side + 'の段' : side + 'から' + (k + 1) + '番目の段';
  }
  function drawHint(ctx, cube, V, list, W) {
    var h = V.hint, a = h[0], c = h[1], q = h[2], N = cube.N, lay = list.filter(function (o) { return o.t.p[a] === c; });
    ctx.save(); ctx.lineJoin = 'round';
    lay.forEach(function (o) { ctx.beginPath(); o.body.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.strokeStyle = '#e11d48'; ctx.lineWidth = Math.max(3, W / 110); ctx.stroke(); });
    var side = lay.filter(function (o) { return o.t.n[a] === 0; }), by = {};
    side.forEach(function (o) { var k = o.t.n.join(','); (by[k] = by[k] || []).push(o); });
    var bk = null, bz = -1e9;   // いちばん 手前を向いている 面
    Object.keys(by).forEach(function (k) { var o = by[k][0], nv = viewV(o.t.n, V); if (nv[2] > bz) { bz = nv[2]; bk = k; } });
    if (bk) {
      var items = by[bk].map(function (o) {
        var w = worldOf(N, o.t), s1 = proj(viewV(w, V), V), s2 = proj(viewV(rotW(w, a, q * 0.3), V), V), cx = 0, cy = 0;
        o.face.forEach(function (p) { cx += p[0] / 4; cy += p[1] / 4; });
        return { cx: cx, cy: cy, dx: s2[0] - s1[0], dy: s2[1] - s1[1] };
      });
      var tx = 0, ty = 0; items.forEach(function (m) { tx += m.dx; ty += m.dy; }); var tl = Math.sqrt(tx * tx + ty * ty) || 1; tx /= tl; ty /= tl;
      items.sort(function (m, n) { return (m.cx * tx + m.cy * ty) - (n.cx * tx + n.cy * ty); });
      var f = items[0], l = items[items.length - 1], sz = Math.max(10, Math.abs(l.cx - f.cx) + Math.abs(l.cy - f.cy));
      var ext = (items.length > 1 ? sz / (items.length - 1) : W / 8) * 0.55, x1 = f.cx - tx * ext * 0.4, y1 = f.cy - ty * ext * 0.4, x2 = l.cx + tx * ext, y2 = l.cy + ty * ext, ah = Math.max(14, W / 24), ang = Math.atan2(y2 - y1, x2 - x1);
      ctx.lineCap = 'round';
      [['#ffffff', Math.max(10, W / 40)], ['#e11d48', Math.max(6, W / 64)]].forEach(function (z) {
        ctx.strokeStyle = z[0]; ctx.fillStyle = z[0]; ctx.lineWidth = z[1];
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(ang) * ah * 0.6, y2 - Math.sin(ang) * ah * 0.6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - Math.cos(ang - 0.5) * ah, y2 - Math.sin(ang - 0.5) * ah); ctx.lineTo(x2 - Math.cos(ang + 0.5) * ah, y2 - Math.sin(ang + 0.5) * ah); ctx.closePath(); ctx.fill();
        if (z[0] === '#ffffff') { ctx.lineWidth = z[1]; ctx.stroke(); }
      });
    }
    ctx.restore();
  }

  function play(cup) {
    stop();
    var lv = S.level, L = LV[lv], seed = cup ? cup.seed : 'free-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
    var cube = scrambled(lv, seed), start = null, moves = 0, hist = [], letters = false, ref = false, done = false, hint = false, anim = null, todo = (cube.scr || []).slice().reverse().map(function (m) { return [m[0], m[1], -m[2]]; }), canHint = !cup && S.mode !== 'battle';
    var best = load().best[lv], robotMs = 0, battle = S.mode === 'battle', V = { yaw: -0.62, pitch: 0.5, D: 9, F: 0, cx: 0, cy: 0 }, last = [];
    if (battle) { var base = [0, 25000, 90000, 240000, 480000, 900000][lv], r = Math.random(); robotMs = best ? Math.round(best.ms * (0.9 + r * 0.5)) : Math.round(base * (0.8 + r * 0.6)); }
    var title = cup ? '大会' : battle ? '対戦' : '特訓';
    var h = '<div class="qc"><div class="cbi"><span>' + title + ' ・ レベル' + lv + '</span><span id="cbt">0:00</span></div>' +
      '<div class="qm" style="margin:0 0 6px">手数: <b id="cbmv">0</b> <span id="cbhint">・ 色の ところを なぞると、その段が まわります</span></div>';
    if (battle) h += '<div class="qm">あなた</div><div class="cbp"><i id="cbme" style="width:0%"></i></div><div class="qm">ロボット</div><div class="cbp rb"><i id="cbrb" style="width:0%"></i></div>';
    h += '<div style="position:relative"><canvas id="cbcv" style="width:100%;aspect-ratio:1/1;touch-action:none;display:block;background:radial-gradient(#fffdf4,#efe9d6);border-radius:16px" aria-label="ルービックキューブ(なぞって まわします)"></canvas><label class="cblk" title="ロック"><span>Lock</span><input type="checkbox" id="cblock" role="switch" aria-label="キューブの向きを ロック"><i></i></label></div></div>' +
      '<div class="qgrid"><button type="button" class="qb sm" id="cbundo">ひとつ もどす</button><button type="button" class="qb sm" id="cbhelp">' + (canHint ? '🤖攻略補助' : '🤖攻略補助(特訓のみ)') + '</button><button type="button" class="qb sm" id="cbref">展開図・みほん</button><button type="button" class="qb sm" id="cbltr">色を 文字でも</button></div>' +
      '<div id="cbhelpbox"></div><div id="cbrefbox"></div><details class="qc" style="margin-top:10px"><summary style="font-weight:800">ボタンで まわす</summary><div class="cbs">' +
      ['U', 'D', 'L', 'R', 'F', 'B'].map(function (k) { return '<button type="button" class="qb" data-mv="' + k + '" data-d="1">' + FACE[k].nm + ' ↻</button><button type="button" class="qb" data-mv="' + k + '" data-d="-1">' + FACE[k].nm + ' ↺</button>'; }).join('') + '</div><div class="qm">「↻」右まわり、「↺」左まわり(その面を 外から見て)</div></details>' +
      '<button type="button" class="qb" id="cbquit" style="margin-top:10px">やめる</button>';
    A.draw(h);
    var cv = document.getElementById('cbcv'), dpr = Math.min(2, window.devicePixelRatio || 1), cssW = cv.clientWidth || 340;
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssW * dpr); V.cx = cv.width / 2; V.cy = cv.height / 2; V.F = cv.width * 1.15;
    function render() { if (!document.getElementById('cbcv')) return; last = drawCube(cv, cube, V, anim, letters); }
    function setStat() { var m = document.getElementById('cbmv'); if (m) m.textContent = moves; var me = document.getElementById('cbme'); if (me) me.style.width = Math.round(progress(cube) * 100) + '%'; }
    function arm() {
      stop();
      tick = setInterval(function () {
        var t = document.getElementById('cbt'); if (!t) return stop();
        var ms = Date.now() - start; t.textContent = fmt(ms);
        if (battle && !done) { var rb = document.getElementById('cbrb'); if (rb) rb.style.width = Math.min(100, Math.round(ms / robotMs * 100)) + '%'; if (ms >= robotMs) finish(false, true); }
      }, 200);
    }
    function doTurn(a, c, q, rec) {
      if (done || anim) return;
      if (!start) { start = Date.now(); arm(); var hn = document.getElementById('cbhint'); if (hn) hn.textContent = ''; }
      var t0 = Date.now(), dur = 200; anim = { a: a, c: c, q: q, th: 0 };
      (function step() {
        var k = Math.min(1, (Date.now() - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        anim.th = q * e * Math.PI / 2; render();
        if (k < 1) return requestAnimationFrame(step);
        anim = null; turnLayer(cube, a, c, q); moves++; if (rec) hist.push([a, c, q]); noteMove(a, c, q); setStat(); render();
        if (solved(cube)) finish(true);
      })();
    }
    /* 攻略補助: 「やること」の一覧(todo)。自分で回したら、その手を 打ち消す手を 足す(おなじ手なら 1つ へる) */
    function noteMove(a, c, q) { var n = todo[0]; if (n && n[0] === a && n[1] === c && n[2] === q) todo.shift(); else todo.unshift([a, c, -q]); helpRefresh(); }
    function helpRefresh() {
      var bx = document.getElementById('cbhelpbox'); if (!bx) return;
      if (!hint || done) { V.hint = null; bx.innerHTML = ''; return render(); }
      if (!todo.length || solved(cube)) { V.hint = null; bx.innerHTML = '<div class="qc" style="margin-top:10px"><b>そろっています!</b></div>'; return render(); }
      V.hint = todo[0]; window.HmtCube._cur = V.hint; var m = todo[0], nm = layerName(cube.N, m[0], m[1]);
      bx.innerHTML = '<div class="qc" style="margin-top:10px"><div style="font-weight:800">🤖 つぎは <span style="color:#e11d48">' + nm + '</span> を、赤い矢印の向きに まわします</div><div class="qm">のこり ' + todo.length + '手 ・ 赤いふちの段が まわす段です。矢印が見えないときは、キューブを すこし ななめに 回してください。</div></div>'; render();
    }
    var drag = null, lockOn = false;
    try { lockOn = localStorage.getItem('hmt_cube_lock') === '1'; } catch (e) {}
    var lk = document.getElementById('cblock'); lk.checked = lockOn;
    lk.onchange = function () { lockOn = lk.checked; drag = null; try { localStorage.setItem('hmt_cube_lock', lockOn ? '1' : '0'); } catch (e) {} A.toast(lockOn ? 'ロック: キューブの向きは 動きません' : 'ロックを はずしました'); };
    function pos(ev) { var r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) * cv.width / r.width, (ev.clientY - r.top) * cv.height / r.height]; }
    cv.onpointerdown = function (ev) {
      ev.preventDefault(); try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
      var p = pos(ev), hit = null;
      for (var i = last.length - 1; i >= 0; i--) { if (inPoly(p, last[i].body)) { hit = last[i].t; break; } }
      drag = { x: p[0], y: p[1], t: hit, mode: hit ? 'layer' : (lockOn ? 'none' : 'view'), ox: p[0], oy: p[1] };
    };
    cv.onpointermove = function (ev) {
      if (!drag) return; ev.preventDefault(); var p = pos(ev), dx = p[0] - drag.x, dy = p[1] - drag.y;
      if (drag.mode === 'view') { V.yaw += dx * 0.011 / dpr; V.pitch = Math.max(-1.45, Math.min(1.45, V.pitch + dy * 0.011 / dpr)); drag.x = p[0]; drag.y = p[1]; render(); }
      else if (drag.mode === 'layer' && Math.sqrt(dx * dx + dy * dy) > 14 * dpr) { var d = decide(cube, V, drag.t, dx, dy); drag.mode = 'done'; if (d) doTurn(d.a, d.c, d.q, true); }
    };
    cv.onpointerup = cv.onpointercancel = function () { drag = null; };
    A.bind('[data-mv]', function (b) { var f = FACE[b.dataset.mv], d = +b.dataset.d; doTurn(f.a, f.s * (cube.N - 1), -f.s * d, true); });
    document.getElementById('cbundo').onclick = function () { var m = hist.pop(); if (m) doTurn(m[0], m[1], -m[2], false); };
    document.getElementById('cbhelp').onclick = function () { if (!canHint) return A.toast('攻略補助は、特訓だけで 使えます'); hint = !hint; this.classList.toggle('pri', hint); helpRefresh(); };
    document.getElementById('cbref').onclick = function () { ref = !ref; var bx = document.getElementById('cbrefbox'); bx.innerHTML = ref ? '<div class="qc" style="margin-top:10px"><div class="qm" style="margin:0 0 6px">いまの 6つの面(ひろげた図)</div>' + netSvg(cube, letters, 300) + '<div class="qm" style="margin:8px 0 6px">完成すると、6つの面が それぞれ 1色に なります。</div></div>' : ''; this.textContent = ref ? '展開図を 閉じる' : '展開図・みほん'; };
    document.getElementById('cbltr').onclick = function () { letters = !letters; this.textContent = letters ? '文字を 消す' : '色を 文字でも'; render(); };
    document.getElementById('cbquit').onclick = function () { if (!start || confirm('やめて もどりますか?')) { stop(); cup ? cupHome(null) : home(); } };
    render(); setStat();
    function finish(ok, robotWin) {
      if (done) return; done = true; stop();
      var ms = Date.now() - start, d = load(), nb = false;
      if (ok) { if (!d.best[lv] || ms < d.best[lv].ms) { d.best[lv] = { ms: ms, moves: moves }; nb = true; save(d); } }
      var hh = '<h2 class="hph">' + title + ' ・ レベル' + lv + '</h2><div class="qc"><div class="qm" style="text-align:center">' + (ok ? '完成!' : 'ざんねん…') + '</div>';
      if (ok) hh += '<div class="cbbig">' + fmt(ms) + '</div><div class="qm" style="text-align:center">' + moves + '手' + (nb ? ' ・ じぶんの ベスト記録!' : '') + '</div>';
      if (battle) hh += '<div class="cbbig" style="font-size:1.4em">' + (ok ? (ms < robotMs ? 'ロボットに 勝ちました!' : '惜しい!ロボットが 先でした') : 'ロボットが 先に そろえました') + '</div>';
      hh += netSvg(cube, false, 260) + '</div><div id="cbres"></div>';
      hh += '<button type="button" class="qb pri" id="cbagain">' + (cup ? 'ランキングを見る' : 'もう1回') + '</button><button type="button" class="qb" id="cbhome2">メニューに もどる</button>';
      A.draw(hh);
      document.getElementById('cbagain').onclick = function () { cup ? cupHome(null) : play(null); };
      document.getElementById('cbhome2').onclick = home;
      if (cup && ok) {
        var box = document.getElementById('cbres'); box.innerHTML = '<div class="qc"><div class="qm">記録を おくっています…</div></div>';
        A.call('cube_submit', { level: lv, ms: ms, moves: moves, seed: cup.seed }).then(function (r) {
          box.innerHTML = '<div class="qc"><div style="font-weight:800;margin:0 0 6px">今週のランキング(レベル' + lv + ')</div>' + rankHtml(r) + '</div>';
        }, function (e) { box.innerHTML = '<div class="qc"><div class="qm">記録を おくれませんでした: ' + esc(e.message || '') + '</div></div>'; });
      }
    }
  }

  function start(api) {
    A = api;
    if (!document.getElementById('qcbcss')) { var st = document.createElement('style'); st.id = 'qcbcss'; st.textContent = CSS; document.head.appendChild(st); }
    home();
  }
  window.HmtCube = { start: start, _t: { layerName: layerName, decide: decide, turnLayer: turnLayer, worldOf: worldOf, layerQuadList: layerQuadList, rotW: rotW, viewV: viewV, proj: proj, make: make, turn: turn, solved: solved, scrambled: scrambled, scrambleMoves: scrambleMoves, cell: cell, progress: progress, drawHint: drawHint, LV: LV, FK: FK } };
})();
