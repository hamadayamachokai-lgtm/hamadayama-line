/* 100万円を死守しろ!(quiz.js の GAME メニューから呼ばれます: HmtHundred.start(api))
   架空の100万円から、まちがえる(失敗する)たびに −10万円。体感・視覚・聴覚・記憶の ミニチャレンジ 10問。
   ひとりで あそびます。きろく(さいこう)は この端末の localStorage。 */
(function () {
  'use strict';
  var A, root, tok = '', X = { t: [], iv: [], raf: 0, ac: null }, KEY = 'hmt_hundred_v1', G = null;
  var CSS = '@keyframes hdsk{0%,100%{transform:translateX(0)}20%{transform:translateX(-9px)}40%{transform:translateX(9px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}@keyframes hdup{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}' +
    '#qz .hdh{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 8px;padding:10px 14px;border-radius:16px;background:linear-gradient(135deg,#1d3a2a,#2d6a45);color:#fff}#qz .hdm{font-size:1.5em;font-weight:900;letter-spacing:.02em}#qz .hdm.hit{animation:hdsk .5s;color:#ffb3a8}#qz .hdq{font-weight:800;font-size:.95em;text-align:right;line-height:1.3}' +
    '#qz .hdbar{height:8px;border-radius:99px;background:#d6e6dc;overflow:hidden;margin:0 0 10px}#qz .hdbar i{display:block;height:100%;background:#2d9a5f;transition:width .4s}#qz .hdcat{display:inline-block;padding:2px 12px;border-radius:99px;background:#6a4bd6;color:#fff;font-weight:800;font-size:.85em;margin-right:6px}' +
    '#qz .hdt{font-size:1.15em;font-weight:800;line-height:1.5;margin:6px 0 10px}#qz .hdbig{font-size:3.6em;font-weight:900;text-align:center;font-variant-numeric:tabular-nums;letter-spacing:.04em;margin:10px 0}#qz .hdres{text-align:center;padding:16px 10px;animation:hdup .45s}#qz .hdres b.big{display:block;font-size:2.2em;font-weight:900;margin:4px 0}' +
    '#qz .hdopt{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}#qz .hdopt button{margin:0;min-height:56px;font-size:1.2em}#qz .hdkp{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:8px 0}#qz .hdkp button{margin:0;min-height:52px;font-size:1.3em;padding:0}' +
    '#qz .hdcv{display:block;width:100%;aspect-ratio:1/1;touch-action:none;background:#fffdf4;border:3px solid #cfc7b4;border-radius:16px}#qz .hdrul{position:relative;height:64px;margin:16px 0 10px;background:linear-gradient(#f3e3a9,#e8d58a);border:2px solid #b69a45;border-radius:6px;touch-action:manipulation;cursor:crosshair}' +
    '#qz .hdrul i{position:absolute;top:-2px;bottom:-2px;width:3px;background:#e11d48;transform:translateX(-50%)}#qz .hdrul i.g{background:#1f7a4d}#qz .hdgrid{display:grid;gap:4px;margin:8px 0}#qz .hdgrid button{all:unset;box-sizing:border-box;aspect-ratio:1/1;border-radius:8px;cursor:pointer}' +
    '#qz .hd9{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}#qz .hd9 button{all:unset;box-sizing:border-box;aspect-ratio:1/1;border-radius:14px;background:#e4ddcf;cursor:pointer;transition:background .15s}#qz .hd9 button.on{background:#f2b705;box-shadow:0 0 14px #f2b705}#qz .hd9 button.ok{background:#8fd19e}' +
    '#qz .hdcol{display:flex;justify-content:center;gap:10px;margin:12px 0;flex-wrap:wrap}#qz .hdcol i{width:54px;height:54px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);display:block}#qz .hdcol button{all:unset;cursor:pointer;width:54px;height:54px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)}' +
    '#qz .hdnote{font-size:.85em;color:#667085;text-align:center;margin:6px 0}#qz .hdln{height:12px;border-radius:6px;background:#2a3f66;margin:12px 0 4px}#qz .hdkey{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}#qz .hdkey button{margin:0;min-height:76px;border:none;border-radius:14px;font-size:1.3em;font-weight:900;color:#fff;cursor:pointer}';

  function $(s) { return root.querySelector(s); }
  function esc(s) { return A.esc(s); }
  function alive() { return root && root.getAttribute('data-hd') === tok && document.body.contains(root); }
  function dbg(k, v) { try { window.HmtHundred._t[k] = v; } catch (e) { /* テスト用 */ } }
  function T(fn, ms) { var id = setTimeout(function () { if (alive()) fn(); }, ms); X.t.push(id); return id; }
  function IV(fn, ms) { var id = setInterval(function () { if (!alive()) return clearAll(); fn(); }, ms); X.iv.push(id); return id; }
  function clearAll() { X.t.forEach(clearTimeout); X.iv.forEach(clearInterval); X.t = []; X.iv = []; if (X.raf) cancelAnimationFrame(X.raf); X.raf = 0; }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[rnd(a.length)]; }
  function shuf(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* 保存できなくても続ける */ } }

  /* ===== 音(WebAudio) ===== */
  function ac() { if (!X.ac) { try { var C = window.AudioContext || window.webkitAudioContext; X.ac = C ? new C() : null; } catch (e) { X.ac = null; } } if (X.ac && X.ac.state === 'suspended') { try { X.ac.resume(); } catch (e) { /* 無視 */ } } return X.ac; }
  function tone(freq, at, dur, vol) {
    var c = ac(); if (!c) return false;
    var o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + (at || 0);
    o.type = 'sine'; o.frequency.value = freq; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol || 0.25, t0 + 0.02); g.gain.setValueAtTime(vol || 0.25, t0 + dur - 0.04); g.gain.linearRampToValueAtTime(0, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02); return true;
  }

  /* ===== 画面のぶひん ===== */
  function head() {
    return '<div class="hdh"><div class="hdm" id="hdmon">💴 ' + G.money + '万円</div><div class="hdq">第' + (G.n + 1) + '問 / ' + G.total + '<br><span style="font-weight:600;font-size:.9em">まちがえると −10万円</span></div></div><div class="hdbar"><i style="width:' + G.money + '%"></i></div>';
  }
  function frame(tp, title, bodyHtml) {
    clearAll();
    A.draw(head() + '<div class="qc"><span class="hdcat">' + tp.cat + '</span><span class="hdnote" style="margin:0">' + esc(tp.name) + '</span><div class="hdt">' + title + '</div><div id="hdc">' + bodyHtml + '</div></div><button type="button" class="qb sm" id="hdquit">やめる</button>');
    root.setAttribute('data-hd', tok);
    $('#hdquit').onclick = function () { clearAll(); tok = ''; A.hub(); };
  }
  function done(ok, msg, extra) {   // ok: true / false / 'skip'
    clearAll();
    var tp = G.list[G.n], cost = ok === false ? 10 : 0;
    G.money = Math.max(0, G.money - cost); if (ok === true) G.right++;
    G.n++;
    var last = G.n >= G.total || G.money <= 0;
    var h = head().replace('第' + (G.n + 1) + '問', '第' + G.n + '問');
    h = h.replace('class="hdm"', ok === false ? 'class="hdm hit"' : 'class="hdm"');
    A.draw(h + '<div class="qc hdres"><div style="font-size:3em">' + (ok === true ? '⭕' : ok === false ? '💸' : '🔇') + '</div><b class="big" style="color:' + (ok === true ? '#1f7a4d' : ok === false ? '#c0392b' : '#667085') + '">' + (ok === true ? 'せいかい!' : ok === false ? '−10万円' : 'ノーカウント') + '</b><div style="line-height:1.7">' + (msg || '') + '</div>' + (extra || '') + '</div><button type="button" class="qb pri" id="hdnext">' + (last ? '結果を見る' : 'つぎの もんだい') + '</button>');
    root.setAttribute('data-hd', tok);
    $('#hdnext').onclick = function () { if (last) finish(); else next(); };
  }
  function choices(opts, cb) {   // opts: [[label,value]...]
    var h = '<div class="hdopt">' + opts.map(function (o, i) { return '<button type="button" class="qb" data-o="' + i + '">' + o[0] + '</button>'; }).join('') + '</div>';
    return { html: h, bind: function () { A.bind('[data-o]', function (b) { cb(opts[+b.dataset.o][1]); }); } };
  }

  /* ===== チャレンジ ===== */
  var TYPES = [];
  // 体感: 10秒ぴったり
  TYPES.push({ id: 'stop10', cat: '体感', name: '10秒ぴったり', run: function (tp) {
    frame(tp, '<b>10秒ぴったり</b>で STOP! はじめの3秒だけ 時間が 見えます。そのあとは 体で 数えてね。', '<div class="hdbig" id="hds">0.00</div><button type="button" class="qb pri" id="hdgo" style="min-height:70px;font-size:1.4em">スタート</button><p class="hdnote">±0.4秒いないで 合格</p>');
    var t0 = 0, run = false;
    $('#hdgo').onclick = function () {
      if (!run) { run = true; t0 = performance.now(); this.textContent = 'STOP!'; var tick = function () { if (!alive() || !run) return; var t = (performance.now() - t0) / 1000; var el = $('#hds'); if (el) el.textContent = t < 3 ? t.toFixed(2) : '？？？'; X.raf = requestAnimationFrame(tick); }; tick(); return; }
      run = false; var t = (performance.now() - t0) / 1000; done(Math.abs(t - 10) <= 0.4, 'あなたの 時間: <b>' + t.toFixed(2) + '秒</b>(ぴったりは 10秒)');
    };
  } });
  // 体感: 5秒を目をとじて
  TYPES.push({ id: 'stop5', cat: '体感', name: '体内時計', run: function (tp) {
    frame(tp, 'スタートを押したら、<b>5秒たった</b>と思ったら STOP。数字は 出ません(目を とじても OK)。', '<div class="hdbig" id="hds" style="font-size:2.6em">？？？</div><button type="button" class="qb pri" id="hdgo" style="min-height:70px;font-size:1.4em">スタート</button><p class="hdnote">±0.5秒いないで 合格</p>');
    var t0 = 0, run = false;
    $('#hdgo').onclick = function () { if (!run) { run = true; t0 = performance.now(); this.textContent = 'STOP!'; return; } var t = (performance.now() - t0) / 1000; done(Math.abs(t - 5) <= 0.5, 'あなたの 時間: <b>' + t.toFixed(2) + '秒</b>(ぴったりは 5秒)'); };
  } });
  // 体感/視覚: 目盛りのない定規
  TYPES.push({ id: 'ruler', cat: '体感', name: '目盛りのない定規', run: function (tp) {
    var len = 15, tg = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
    dbg('tg', tg); frame(tp, 'この 定規は <b>' + len + 'cm</b> の長さです(目盛りは ありません)。左はしが 0。<br><b>' + tg + 'cm</b> の ところを タップ!', '<div class="hdrul" id="hdr"></div><p class="hdnote">±0.4cmいないで 合格</p>');
    var bar = $('#hdr'), fin = false;
    bar.onclick = function (ev) {
      if (fin) return; fin = true; var r = bar.getBoundingClientRect(), x = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)), cm = x * len;
      bar.insertAdjacentHTML('beforeend', '<i style="left:' + (x * 100) + '%"></i><i class="g" style="left:' + (tg / len * 100) + '%"></i>');
      T(function () { done(Math.abs(cm - tg) <= 0.4, 'あなたは <b>' + cm.toFixed(1) + 'cm</b> の ところ(正解は 緑の線: ' + tg + 'cm)'); }, 1200);
    };
  } });
  // 視覚: 立体図をなぞる
  var SHAPES = {
    cube: { name: '立方体', seg: [[160, 40, 260, 95], [260, 95, 260, 215], [260, 215, 160, 270], [160, 270, 60, 215], [60, 215, 60, 95], [60, 95, 160, 40], [160, 150, 60, 95], [160, 150, 260, 95], [160, 150, 160, 270]] },
    box: { name: '直方体', seg: [[40, 120, 190, 80], [190, 80, 270, 110], [270, 110, 270, 230], [270, 230, 120, 270], [120, 270, 40, 235], [40, 235, 40, 120], [120, 150, 40, 120], [120, 150, 270, 110], [120, 150, 120, 270]] },
    prism: { name: '三角柱', seg: [[40, 230, 150, 110], [150, 110, 260, 230], [260, 230, 40, 230], [40, 230, 80, 270], [80, 270, 260, 270], [260, 270, 260, 230], [150, 110, 190, 150], [190, 150, 260, 230]] }
  };
  TYPES.push({ id: 'trace', cat: '視覚', name: '立体図をなぞる', run: function (tp) {
    var key = pick(Object.keys(SHAPES)), sh = SHAPES[key], W = 320; dbg('shape', key);
    frame(tp, '点線の <b>' + sh.name + '</b> の ふち(線)を、指で ぜんぶ なぞってね。', '<canvas id="hdcv" class="hdcv" width="' + W * 2 + '" height="' + W * 2 + '"></canvas><div class="qgrid" style="margin-top:8px"><button type="button" class="qb sm" id="hdclr">やりなおし</button><button type="button" class="qb pri sm" id="hdok">できた!(判定)</button></div><p class="hdnote">線の 8わり いじょうを なぞれたら 合格</p>');
    var cv = $('#hdcv'), c = cv.getContext('2d'), pts = [], drawing = false, S2 = 2;
    function paint() {
      c.clearRect(0, 0, cv.width, cv.height); c.lineCap = 'round'; c.lineJoin = 'round';
      c.setLineDash([10, 8]); c.strokeStyle = '#8a97b2'; c.lineWidth = 5; c.beginPath(); sh.seg.forEach(function (s) { c.moveTo(s[0] * S2, s[1] * S2); c.lineTo(s[2] * S2, s[3] * S2); }); c.stroke();
      c.setLineDash([]); c.strokeStyle = '#e11d48'; c.lineWidth = 9; c.beginPath(); var pen = false; pts.forEach(function (p) { if (p === null) { pen = false; return; } if (!pen) { c.moveTo(p[0] * S2, p[1] * S2); pen = true; } else c.lineTo(p[0] * S2, p[1] * S2); }); c.stroke();
    }
    function xy(ev) { var r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * W]; }
    cv.onpointerdown = function (ev) { ev.preventDefault(); try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* 無視 */ } drawing = true; pts.push(xy(ev)); paint(); };
    cv.onpointermove = function (ev) { if (!drawing) return; ev.preventDefault(); pts.push(xy(ev)); paint(); };
    cv.onpointerup = cv.onpointercancel = function () { drawing = false; pts.push(null); };
    $('#hdclr').onclick = function () { pts = []; paint(); };
    $('#hdok').onclick = function () {
      var dense = []; var prev = null; pts.forEach(function (p) { if (!p) { prev = null; return; } if (prev) { var n = Math.ceil(Math.hypot(p[0] - prev[0], p[1] - prev[1]) / 4); for (var i = 1; i <= n; i++) dense.push([prev[0] + (p[0] - prev[0]) * i / n, prev[1] + (p[1] - prev[1]) * i / n]); } else dense.push(p); prev = p; });
      var segPts = []; sh.seg.forEach(function (s) { var n = Math.ceil(Math.hypot(s[2] - s[0], s[3] - s[1]) / 6); for (var i = 0; i <= n; i++) segPts.push([s[0] + (s[2] - s[0]) * i / n, s[1] + (s[3] - s[1]) * i / n]); });
      var cov = 0; segPts.forEach(function (q) { for (var i = 0; i < dense.length; i++) if (Math.hypot(dense[i][0] - q[0], dense[i][1] - q[1]) <= 18) { cov++; break; } });
      var near = 0; dense.forEach(function (p) { for (var i = 0; i < segPts.length; i++) if (Math.hypot(segPts[i][0] - p[0], segPts[i][1] - p[1]) <= 24) { near++; break; } });
      var cr = segPts.length ? cov / segPts.length : 0, ar = dense.length ? near / dense.length : 0;
      done(cr >= 0.8 && ar >= 0.8, 'なぞれた 線: <b>' + Math.round(cr * 100) + '%</b> ・ 線の 上: <b>' + Math.round(ar * 100) + '%</b>');
    };
    paint();
  } });
  // 視覚: ちがう色
  TYPES.push({ id: 'odd', cat: '視覚', name: 'ちがう色を さがせ', run: function (tp) {
    var n = 5, hue = rnd(360), odd = rnd(n * n), d = 7, cells = ''; dbg('odd', odd);
    frame(tp, '1つだけ <b>ちがう色</b>の マスを タップ!(8秒)', '<div class="hdgrid" id="hdg" style="grid-template-columns:repeat(' + n + ',1fr)"></div><div class="hdbar"><i id="hdtm" style="width:100%;background:#e0a300"></i></div>');
    var g = $('#hdg'); for (var i = 0; i < n * n; i++) cells += '<button type="button" data-c="' + i + '" style="background:hsl(' + hue + ',60%,' + (i === odd ? 55 + d : 55) + '%)" aria-label="マス"></button>';
    g.innerHTML = cells; var t0 = performance.now(), fin = false;
    A.bind('[data-c]', function (b) { if (fin) return; fin = true; var ok = +b.dataset.c === odd; done(ok, ok ? 'よく 見つけました!' : 'ちがう マスでした'); });
    IV(function () { var p = 1 - (performance.now() - t0) / 8000; var el = $('#hdtm'); if (el) el.style.width = Math.max(0, p * 100) + '%'; if (p <= 0 && !fin) { fin = true; done(false, 'じかんぎれ…'); } }, 100);
  } });
  // 視覚: ドットを数える
  TYPES.push({ id: 'dots', cat: '視覚', name: 'チラ見で かぞえる', run: function (tp) {
    var n = 8 + rnd(8);
    frame(tp, '点が 一瞬だけ 出ます。<b>いくつ</b> あったかな?', '<canvas id="hdcv" class="hdcv" width="640" height="640"></canvas><button type="button" class="qb pri" id="hdgo">見る(1.5秒)</button>');
    var cv = $('#hdcv'), c = cv.getContext('2d');
    c.fillStyle = '#fffdf4'; c.fillRect(0, 0, 640, 640);
    $('#hdgo').onclick = function () {
      this.disabled = true; var ps = [], k = 0;
      while (ps.length < n && k++ < 500) { var p = [50 + rnd(540), 50 + rnd(540)]; if (ps.every(function (q) { return Math.hypot(p[0] - q[0], p[1] - q[1]) > 70; })) ps.push(p); }
      n = ps.length; c.fillStyle = '#2a3f66'; ps.forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 22, 0, 6.3); c.fill(); });
      T(function () {
        c.fillStyle = '#fffdf4'; c.fillRect(0, 0, 640, 640);
        var set = shuf([n, n - 1, n + 1, n + 2 - rnd(2) * 3]).filter(function (v, i, a) { return v > 0 && a.indexOf(v) === i; }); while (set.length < 4) set.push(n + 3 + set.length);
        var ch = choices(set.slice(0, 4).sort(function (a, b) { return a - b; }).map(function (v) { return [v + ' こ', v]; }), function (v) { done(v === n, '正解は <b>' + n + 'こ</b> でした'); });
        $('#hdc').insertAdjacentHTML('beforeend', ch.html); ch.bind(); $('#hdgo').style.display = 'none';
      }, 1500);
    };
  } });
  // 視覚: 長い線
  TYPES.push({ id: 'line', cat: '視覚', name: 'どちらが 長い?', run: function (tp) {
    var base = 60 + rnd(15), diff = 6 + rnd(6), aLong = Math.random() < 0.5, _d = dbg('aLong', null), la = aLong ? base + diff : base, lb = aLong ? base : base + diff;
    frame(tp, '<b>Aと B</b>、どちらの線が 長い?', '<div style="margin:18px 0"><div style="font-weight:800">A</div><div class="hdln" style="width:' + la + '%"></div><div style="font-weight:800;margin-top:20px">B</div><div class="hdln" style="width:' + lb + '%;margin-left:' + (rnd(2) ? 0 : (100 - lb) * 0.8) + '%"></div></div><div id="hdch"></div>');
    var ch = choices([['A', 'A'], ['B', 'B']], function (v) { done(v === (aLong ? 'A' : 'B'), '長かったのは <b>' + (aLong ? 'A' : 'B') + '</b>(' + Math.max(la, lb) + ' と ' + Math.min(la, lb) + ')'); });
    $('#hdch').innerHTML = ch.html; ch.bind();
  } });
  // 聴覚: 高い音・低い音
  TYPES.push({ id: 'pitch', cat: '聴覚', name: '音の高さ', run: function (tp) {
    var f1 = 330 + rnd(300), semi = (2 + rnd(3)) * (Math.random() < 0.5 ? 1 : -1), f2 = f1 * Math.pow(2, semi / 12), plays = 0;
    frame(tp, '音が 2つ 鳴ります。<b>あとの音</b>は 前より 高い? 低い?', '<button type="button" class="qb pri" id="hdplay">🔊 きく</button><div id="hdch"></div><button type="button" class="qb sm" id="hdskip">音が 聞こえない(ノーカウント)</button><p class="hdnote">スマホの 音を 出してください(マナーモードも かくにん)</p>');
    var ch = choices([['⬆ 高い', 'up'], ['⬇ 低い', 'down']], function (v) { done(v === (semi > 0 ? 'up' : 'down'), 'あとの音は <b>' + (semi > 0 ? '高い' : '低い') + '</b> でした'); });
    $('#hdch').innerHTML = ch.html; ch.bind();
    $('#hdplay').onclick = function () { if (plays >= 2) return A.toast('2回までです'); plays++; if (!tone(f1, 0, 0.7)) return A.toast('この端末では 音が 出せません'); tone(f2, 0.9, 0.7); if (plays >= 2) this.textContent = '🔊 (もう きけません)'; };
    $('#hdskip').onclick = function () { done('skip', '音が 出ない ときは ノーカウントです'); };
  } });
  // 聴覚: ピッピッ…の回数
  TYPES.push({ id: 'beeps', cat: '聴覚', name: '音の回数', run: function (tp) {
    var n = 3 + rnd(5), played = false; dbg('beeps', n);
    frame(tp, '「ピッ」が 何回 鳴るか 数えてね。(1回だけ)', '<button type="button" class="qb pri" id="hdplay">🔊 きく(1回だけ)</button><div id="hdch"></div><button type="button" class="qb sm" id="hdskip">音が 聞こえない(ノーカウント)</button>');
    var set = [n]; while (set.length < 4) { var v = n - 2 + rnd(5); if (v > 0 && set.indexOf(v) < 0) set.push(v); }
    var ch = choices(set.sort(function (a, b) { return a - b; }).map(function (v) { return [v + ' 回', v]; }), function (v) { done(v === n, '正解は <b>' + n + '回</b> でした'); });
    $('#hdch').innerHTML = ch.html; ch.bind();
    $('#hdplay').onclick = function () { if (played) return; played = true; this.disabled = true; this.textContent = '…'; for (var i = 0; i < n; i++) tone(880, i * (0.45 + (i % 2) * 0.15), 0.18); };
    $('#hdskip').onclick = function () { done('skip', '音が 出ない ときは ノーカウントです'); };
  } });
  // 聴覚+記憶: メロディをくりかえす
  var KEYS = [['ド', 523.25, '#d0312d'], ['レ', 587.33, '#e08a00'], ['ミ', 659.25, '#2d9a5f'], ['ソ', 783.99, '#2f6fd0']];
  TYPES.push({ id: 'melody', cat: '聴覚', name: '音の順番', run: function (tp) {
    var seq = []; for (var i = 0; i < 4; i++) seq.push(rnd(4)); dbg('seq', seq);
    var pos = 0, plays = 0, ready = false;
    frame(tp, '4つの 音を 聞いて、<b>同じ順番</b>に タップ!', '<button type="button" class="qb pri" id="hdplay">🔊 きく(2回まで)</button><div class="hdkey" id="hdk">' + KEYS.map(function (k, i) { return '<button type="button" data-k="' + i + '" style="background:' + k[2] + '">' + k[0] + '</button>'; }).join('') + '</div><button type="button" class="qb sm" id="hdskip">音が 聞こえない(ノーカウント)</button>');
    $('#hdplay').onclick = function () { if (plays >= 2) return A.toast('2回までです'); plays++; ready = true; pos = 0; seq.forEach(function (k, i) { tone(KEYS[k][1], i * 0.6, 0.45); }); if (plays >= 2) this.textContent = '🔊 (もう きけません)'; };
    A.bind('[data-k]', function (b) {
      var k = +b.dataset.k; tone(KEYS[k][1], 0, 0.3); if (!ready) return A.toast('まず「きく」を おしてね');
      if (k !== seq[pos]) return done(false, '正解の順番は <b>' + seq.map(function (x) { return KEYS[x][0]; }).join(' → ') + '</b> でした');
      pos++; if (pos >= seq.length) done(true, 'ぜんぶ 合っていました!(' + seq.map(function (x) { return KEYS[x][0]; }).join(' → ') + ')');
    });
    $('#hdskip').onclick = function () { done('skip', '音が 出ない ときは ノーカウントです'); };
  } });
  // 記憶: 数字
  TYPES.push({ id: 'digits', cat: '記憶', name: '数字の記憶', run: function (tp) {
    var n = 5, s = ''; for (var i = 0; i < n; i++) s += rnd(10); dbg('digits', s);
    frame(tp, '数字を <b>3秒</b> 見せます。おぼえて、あとで 入力!', '<div class="hdbig" id="hdd">' + s + '</div><div class="hdbar"><i id="hdtm" style="width:100%;background:#e0a300"></i></div>');
    var t0 = performance.now();
    IV(function () { var p = 1 - (performance.now() - t0) / 3000; var el = $('#hdtm'); if (el) el.style.width = Math.max(0, p * 100) + '%'; }, 80);
    T(function () {
      var cur = '';
      $('#hdc').innerHTML = '<div class="hdbig" id="hdd">' + '・'.repeat(n) + '</div><div class="hdkp">' + '1234567890'.split('').map(function (d) { return '<button type="button" class="qb" data-d="' + d + '">' + d + '</button>'; }).join('') + '</div><div class="qgrid"><button type="button" class="qb sm" id="hdback">1つ けす</button><button type="button" class="qb pri sm" id="hdok">これで 決定</button></div>';
      var show = function () { $('#hdd').textContent = (cur + '・'.repeat(Math.max(0, n - cur.length))).slice(0, Math.max(n, cur.length)); };
      A.bind('[data-d]', function (b) { if (cur.length < n) cur += b.dataset.d; show(); }); $('#hdback').onclick = function () { cur = cur.slice(0, -1); show(); };
      $('#hdok').onclick = function () { done(cur === s, '正解は <b>' + s + '</b>(あなた: ' + (cur || '—') + ')'); };
    }, 3000);
  } });
  // 記憶: 光る順番
  TYPES.push({ id: 'grid9', cat: '記憶', name: '光る順番', run: function (tp) {
    var seq = [], n = 4; while (seq.length < n) { var v = rnd(9); if (seq[seq.length - 1] !== v) seq.push(v); } dbg('seq', seq);
    frame(tp, '光る 順番を おぼえて、同じ順に タップ!', '<div class="hd9" id="hd9">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { return '<button type="button" data-g="' + i + '" aria-label="マス"></button>'; }).join('') + '</div><p class="hdnote" id="hdmsg">よく 見てね…</p>');
    var cells = root.querySelectorAll('[data-g]'), accept = false, pos = 0;
    seq.forEach(function (v, i) { T(function () { cells[v].classList.add('on'); }, 800 + i * 800); T(function () { cells[v].classList.remove('on'); }, 800 + i * 800 + 500); });
    T(function () { accept = true; $('#hdmsg').textContent = 'さあ、タップ!'; }, 800 + n * 800);
    A.bind('[data-g]', function (b) {
      if (!accept) return; var g = +b.dataset.g;
      if (g !== seq[pos]) { accept = false; return done(false, '正解は <b>' + seq.map(function (x) { return x + 1; }).join(' → ') + '</b> の順(左上が 1)'); }
      b.classList.add('ok'); pos++; if (pos >= n) { accept = false; T(function () { done(true, 'ぜんぶ 合っていました!'); }, 300); }
    });
  } });
  // 記憶: 色の順番
  var COLS = ['#d0312d', '#e08a00', '#e8c040', '#2d9a5f', '#2f6fd0', '#8a4bd0'];
  TYPES.push({ id: 'colors', cat: '記憶', name: '色の順番', run: function (tp) {
    var seq = shuf([0, 1, 2, 3, 4, 5]).slice(0, 4); dbg('seq', seq);
    frame(tp, '4つの 色の <b>順番</b>を 3秒 見せます。おぼえてね!', '<div class="hdcol" id="hdcl">' + seq.map(function (i) { return '<i style="background:' + COLS[i] + '"></i>'; }).join('') + '</div>');
    T(function () {
      var pos = 0, fin = false;
      $('#hdc').innerHTML = '<p class="hdnote">同じ順に、色を タップ</p><div class="hdcol" id="hdsel"><span style="display:flex;gap:6px" id="hdgot"></span></div><div class="hdcol">' + shuf([0, 1, 2, 3, 4, 5]).map(function (i) { return '<button type="button" data-cl="' + i + '" style="background:' + COLS[i] + '" aria-label="色"></button>'; }).join('') + '</div>';
      A.bind('[data-cl]', function (b) {
        if (fin) return; var k = +b.dataset.cl; $('#hdgot').insertAdjacentHTML('beforeend', '<i style="width:30px;height:30px;border-radius:50%;background:' + COLS[k] + ';display:block;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></i>');
        if (k !== seq[pos]) { fin = true; return T(function () { done(false, '正解の順番は ↓<div class="hdcol">' + seq.map(function (i) { return '<i style="background:' + COLS[i] + '"></i>'; }).join('') + '</div>'); }, 500); }
        pos++; if (pos >= seq.length) { fin = true; T(function () { done(true, 'ぜんぶ 合っていました!'); }, 400); }
      });
    }, 3000);
  } });

  /* ===== しんこう ===== */
  function next() {
    var tp = G.list[G.n]; tp.run(tp);
  }
  function rankOf(m) { return m >= 100 ? ['🏆', '完全死守! 1円も 失いませんでした!'] : m >= 70 ? ['🥇', 'おみごと! 大部分を 守りました'] : m >= 40 ? ['🥈', 'ギリギリ 守りきりました'] : m > 0 ? ['🥉', 'ざんねん…。かなり 失いました'] : ['😱', '100万円を ぜんぶ 失いました…'] };
  function finish() {
    clearAll(); var d = load(), r = rankOf(G.money), newBest = !d.best || G.money > d.best;
    d.best = Math.max(d.best || 0, G.money); d.played = (d.played || 0) + 1; save(d);
    var xp = 5 + Math.round(G.money / 20), evo = 0; try { evo = A.addXp(xp); A.Store.save(); } catch (e) { /* 無視 */ }
    A.draw('<div class="hdh"><div class="hdm">💴 ' + G.money + '万円</div><div class="hdq">おしまい</div></div><div class="qc hdres"><div style="font-size:3.4em">' + r[0] + '</div><b class="big">のこり ' + G.money + '万円</b><div style="line-height:1.7">' + r[1] + '<br>せいかい ' + G.right + ' / ' + G.total + '問' + (newBest ? '<br><b style="color:#e0a300">★ じこベスト こうしん!</b>' : '<br>じこベスト ' + d.best + '万円') + '</div></div><div class="qfb ok"><b>+' + xp + ' 経験値</b>' + (evo ? '<br>🎊 あいぼうが しんかした!' : '') + '</div><button type="button" class="qb pri" id="hdagain">もういちど あそぶ</button><button type="button" class="qb" id="hdhome">GAMEへ もどる</button>');
    root.setAttribute('data-hd', tok);
    $('#hdagain').onclick = begin; $('#hdhome').onclick = function () { tok = ''; A.hub(); };
  }
  function begin() {
    tok = 'hd' + Date.now(); clearAll();
    // 体感・視覚・聴覚・記憶が、かたよらないように
    var cats = ['体感', '視覚', '聴覚', '記憶'], list = [];
    cats.forEach(function (c) { var l = shuf(TYPES.filter(function (t) { return t.cat === c; })); list.push(l[0]); });
    var rest = shuf(TYPES.filter(function (t) { return list.indexOf(t) < 0; })); while (list.length < 10 && rest.length) list.push(rest.shift());
    G = { n: 0, total: Math.min(10, list.length), money: 100, right: 0, list: shuf(list) };
    next();
  }
  function start(api) {
    A = api; root = A.root();
    if (!document.getElementById('qhdcss')) { var s = document.createElement('style'); s.id = 'qhdcss'; s.textContent = CSS; document.head.appendChild(s); }
    var d = load();
    tok = 'hd' + Date.now();
    A.draw('<div class="hdh"><div class="hdm">💴 100万円</div><div class="hdq">死守せよ!</div></div><div class="qc"><h2>100万円を 死守しろ!</h2><p style="line-height:1.8;margin:0">あなたは 架空の <b>100万円</b> を もっています。<br>10この チャレンジで <b>まちがえると −10万円</b>。<br>どれだけ 守りきれるかな?</p><div style="margin:10px 0;line-height:1.9"><span class="hdcat">体感</span>10秒ぴったり・定規の1cm<br><span class="hdcat">視覚</span>立体図をなぞる・色さがし・かぞえる<br><span class="hdcat">聴覚</span>音の高さ・回数・順番<br><span class="hdcat">記憶</span>数字・光る順番・色の順番</div>' + (d.best ? '<div class="qm">じこベスト: ' + d.best + '万円(' + (d.played || 0) + '回)</div>' : '') + '</div><button type="button" class="qb pri" id="hdstart">はじめる</button><button type="button" class="qb" id="hdback">もどる</button>');
    root.setAttribute('data-hd', tok);
    $('#hdstart').onclick = begin; $('#hdback').onclick = function () { tok = ''; A.hub(); };
  }
  function only(id) { tok = 'hd' + Date.now(); clearAll(); var tp = TYPES.filter(function (t) { return t.id === id; })[0]; G = { n: 0, total: 2, money: 100, right: 0, list: [tp, tp] }; next(); }
  window.HmtHundred = { start: start, _t: { TYPES: TYPES, rankOf: rankOf, only: only, SHAPES: SHAPES, KEYS: KEYS } };
})();
