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
    '#qz .hdcv{display:block;width:100%;aspect-ratio:1/1;touch-action:none;background:#fffdf4;border:3px solid #cfc7b4;border-radius:16px}#qz .hdrul{position:relative;height:64px;margin:16px 0 10px;background:linear-gradient(#f3e3a9,#e8d58a);border:2px solid #b69a45;border-radius:6px;touch-action:none;cursor:ew-resize;user-select:none;-webkit-user-select:none;overflow:visible}#qz .hdrul b.hdfill{position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(225,29,72,.35);border-right:3px solid #e11d48;border-radius:4px 0 0 4px;pointer-events:none}' +
    '#qz .hdrul i{position:absolute;top:-2px;bottom:-2px;width:3px;background:#e11d48;transform:translateX(-50%)}#qz .hdrul i.g{background:#1f7a4d}#qz .hdgrid{display:grid;gap:4px;margin:8px 0}#qz .hdgrid button{all:unset;box-sizing:border-box;aspect-ratio:1/1;border-radius:8px;cursor:pointer}' +
    '#qz .hd9{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}#qz .hd9 button{all:unset;box-sizing:border-box;aspect-ratio:1/1;border-radius:14px;background:#e4ddcf;cursor:pointer;transition:background .15s}#qz .hd9 button.on{background:#f2b705;box-shadow:0 0 14px #f2b705}#qz .hd9 button.ok{background:#8fd19e}' +
    '#qz .hdcol{display:flex;justify-content:center;gap:10px;margin:12px 0;flex-wrap:wrap}#qz .hdcol i{width:54px;height:54px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);display:block}#qz .hdcol button{all:unset;cursor:pointer;width:54px;height:54px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)}' +
    '#qz .hdbkw{display:flex;gap:10px;justify-content:center;margin:10px 0}#qz .hdbk{width:48%;max-width:190px;background:#f6f9fc;border-radius:12px}#qz .hdfl{position:relative;height:190px;margin:8px 0;border-radius:14px;overflow:hidden;background:#eaf4ff}#qz .hdfw{position:absolute;left:0;right:0;bottom:0;height:96px;background:linear-gradient(#7cc4f2,#3b8fd0);opacity:.9}#qz .hdfi{position:absolute;left:50%;top:6px;margin-left:-.6em;font-size:3.2em;line-height:1;transition:top 1.2s ease-in,transform 1.2s;z-index:2}#qz .hdfi.up{top:64px;transform:rotate(8deg)}#qz .hdfi.dn{top:132px;transform:rotate(-20deg)}' +
    '#qz .hdbl{position:relative;height:300px;overflow:hidden;border-radius:14px;background:linear-gradient(#dff1ff,#f6fbff);touch-action:manipulation}@keyframes hdfly{from{bottom:-60px}to{bottom:310px}}#qz .hdb{all:unset;position:absolute;bottom:-60px;width:46px;height:58px;border-radius:50% 50% 48% 48%;cursor:pointer;animation:hdfly 3s linear forwards;box-shadow:inset -6px -6px 0 rgba(0,0,0,.12),inset 5px 5px 0 rgba(255,255,255,.35);text-align:center;font-size:30px;line-height:58px}' +
    '#qz .hdbody{display:block;width:100%;max-width:300px;margin:8px auto;touch-action:manipulation}#qz .hdorg{cursor:pointer}#qz .hdorg:active{opacity:.7}' +
    '#qz .hdeye{display:flex;align-items:center;justify-content:center;height:140px;margin:8px 0;background:#fff;border:2px solid #e4ddcf;border-radius:14px}#qz .hdsc{display:block;width:100%;border-radius:12px;margin:8px 0}#qz .hdopt.one{grid-template-columns:1fr}#qz .hdz{cursor:pointer}' +
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
    if (!G || G.busy) return; G.busy = true;   // 同じ問題の二重のかいとう(連打など)は 数えない
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
    if (G.n === 1) hold('after1', { next: function () { if (last) finish(); else next(); } });   // ガイド(チュートリアル)用: 1問目が終わったところで止める
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
    dbg('tg', tg); frame(tp, 'この 定規は <b>' + len + 'cm</b> の長さです(目盛りは ありません)。左はしが 0。<br><b>' + tg + 'cm</b> の ところまで、<b>指を 左から 右へ スライド</b>して、はなしてね', '<div class="hdrul" id="hdr"><b class="hdfill" id="hdfill"></b></div><p class="hdnote">指を はなした ところが こたえ(±0.4cmいないで 合格)。はなす前なら 何度でも 動かせます</p>');
    var bar = $('#hdr'), fill = $('#hdfill'), fin = false, drag = false, xx = 0;
    function posOf(ev) { var r = bar.getBoundingClientRect(); return Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)); }
    function show(x) { xx = x; fill.style.width = (x * 100) + '%'; }
    bar.onpointerdown = function (ev) { if (fin) return; ev.preventDefault(); drag = true; try { bar.setPointerCapture(ev.pointerId); } catch (e) { /* 無視 */ } show(posOf(ev)); };
    bar.onpointermove = function (ev) { if (drag && !fin) { ev.preventDefault(); show(posOf(ev)); } };
    function release(ev) {
      if (!drag || fin) return; drag = false; if (ev && ev.type === 'pointerup') show(posOf(ev)); fin = true;
      var cm = xx * len; bar.insertAdjacentHTML('beforeend', '<i class="g" style="left:' + (tg / len * 100) + '%"></i>');
      T(function () { done(Math.abs(cm - tg) <= 0.4, 'あなたは <b>' + cm.toFixed(1) + 'cm</b> の ところ(正解は 緑の線: ' + tg + 'cm)'); }, 1200);
    }
    bar.onpointerup = release; bar.onpointercancel = release;
  } });
  // 視覚: 立体図をなぞる
  var SHAPES = {
    cube: { name: '立方体', seg: [[160, 40, 260, 95], [260, 95, 260, 215], [260, 215, 160, 270], [160, 270, 60, 215], [60, 215, 60, 95], [60, 95, 160, 40], [160, 150, 60, 95], [160, 150, 260, 95], [160, 150, 160, 270]] },
    box: { name: '直方体', seg: [[40, 120, 190, 80], [190, 80, 270, 110], [270, 110, 270, 230], [270, 230, 120, 270], [120, 270, 40, 235], [40, 235, 40, 120], [120, 150, 40, 120], [120, 150, 270, 110], [120, 150, 120, 270]] },
    prism: { name: '三角柱', seg: [[40, 230, 150, 110], [150, 110, 260, 230], [260, 230, 40, 230], [40, 230, 80, 270], [80, 270, 260, 270], [260, 270, 260, 230], [150, 110, 190, 150], [190, 150, 260, 230]] }
  };
  TYPES.push({ id: 'trace', cat: '視覚', name: '立体図をなぞる', run: function (tp) {
    var key = pick(Object.keys(SHAPES)), sh = SHAPES[key], W = 320; dbg('shape', key);
    frame(tp, '点線の <b>' + sh.name + '</b> の ふち(線)を、指で ぜんぶ なぞってね。', '<canvas id="hdcv" class="hdcv" width="' + W * 2 + '" height="' + W * 2 + '"></canvas><div class="qgrid" style="margin-top:8px"><button type="button" class="qb sm" id="hdund">ひとつ もどす</button><button type="button" class="qb sm" id="hdclr">ぜんぶ やりなおし</button></div><div class="qgrid" style="margin-top:8px"><button type="button" class="qb pri sm" id="hdok" style="grid-column:1/-1">できた!(判定)</button></div><p class="hdnote">線の 8わり いじょうを なぞれたら 合格</p>');
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
    $('#hdund').onclick = function () { while (pts.length && pts[pts.length - 1] === null) pts.pop(); while (pts.length && pts[pts.length - 1] !== null) pts.pop(); paint(); };   // 最後の1本(ひと筆)だけ消す
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

  // 視覚: ビーカーの水、どっちが 多い?
  TYPES.push({ id: 'beaker', cat: '視覚', name: 'どっちが 多い?', run: function (tp) {
    // 太さ(w)と水の高さ(h)がちがう2つ。体積は w×w×h(円柱)。見た目の高さと 量が ちがうこともある
    var A1, B1, k = 0;
    do { A1 = { w: 50 + rnd(60), h: 40 + rnd(90) }; B1 = { w: 50 + rnd(60), h: 40 + rnd(90) }; k++; var va = A1.w * A1.w * A1.h, vb = B1.w * B1.w * B1.h, r = Math.max(va, vb) / Math.min(va, vb); }
    while ((r < 1.25 || r > 2.2 || Math.abs(A1.h - B1.h) < 12) && k < 400);
    var aMore = A1.w * A1.w * A1.h > B1.w * B1.w * B1.h; dbg('aMore', aMore);
    function bk(o, lab) {
      var x0 = 90 - o.w / 2, top = 190 - 170, wt = 190 - o.h;
      return '<svg viewBox="0 0 180 210" class="hdbk"><rect x="' + x0 + '" y="' + wt + '" width="' + o.w + '" height="' + o.h + '" fill="#6ab7ff" opacity=".85"/><rect x="' + x0 + '" y="' + wt + '" width="' + o.w + '" height="3" fill="#bfe1ff"/><path d="M' + x0 + ' 20V190H' + (x0 + o.w) + 'V20" fill="none" stroke="#475569" stroke-width="4" stroke-linejoin="round"/><text x="90" y="206" font-size="16" font-weight="900" text-anchor="middle" fill="#2a3f66">' + lab + '</text></svg>';
    }
    frame(tp, 'ビーカーに 入った 水。<b>どっちが 多い?</b>', '<div class="hdbkw">' + bk(A1, 'A') + bk(B1, 'B') + '</div><div id="hdch"></div>');
    var ch = choices([['A', 'A'], ['B', 'B']], function (v) { done(v === (aMore ? 'A' : 'B'), '多かったのは <b>' + (aMore ? 'A' : 'B') + '</b>。<br>水の高さだけでなく、ビーカーの 太さも 大事です'); });
    $('#hdch').innerHTML = ch.html; ch.bind();
  } });
  // 常識: 浮く? 沈む?
  var FLT = [['🍉', 'スイカ', 1], ['🍎', 'りんご', 1], ['🍊', 'みかん(皮つき)', 1], ['🍋', 'レモン', 1], ['🧊', '氷', 1], ['🦆', 'ゴムの アヒル', 1], ['🪵', '木の 積み木', 1], ['🍾', 'からの ペットボトル', 1], ['🥚', '生たまご', 0], ['🍇', 'ぶどう', 0], ['🥔', 'じゃがいも', 0], ['🥕', 'にんじん', 0], ['🪙', '10円玉', 0], ['🥄', '鉄の スプーン', 0], ['🪨', '石', 0], ['🔑', 'かぎ', 0], ['🔩', 'くぎ', 0]];
  TYPES.push({ id: 'float', cat: '常識', name: '浮く? 沈む?', run: function (tp) {
    var it = pick(FLT); dbg('float', it);
    frame(tp, '今から <b>' + it[1] + '</b> を 水に 入れるよ。<b>浮く? 沈む?</b>', '<div class="hdfl" id="hdfl"><div class="hdfi" id="hdfi">' + it[0] + '</div><div class="hdfw"></div></div><div id="hdch"></div>');
    var ch = choices([['🛟 浮く', 1], ['⚓ 沈む', 0]], function (v) {
      var ok = v === it[2], el = $('#hdfi'); $('#hdch').innerHTML = '';
      if (el) el.className = 'hdfi ' + (it[2] ? 'up' : 'dn');
      T(function () { done(ok, '<b>' + esc(it[1]) + '</b> は ' + (it[2] ? '<b>浮きます</b>' : '<b>沈みます</b>')); }, 1500);
    });
    $('#hdch').innerHTML = ch.html; ch.bind();
  } });
  // 体感: 風船を 割りまくれ
  TYPES.push({ id: 'balloon', cat: '体感', name: '風船を 割りまくれ', run: function (tp) {
    var cnt = 0, over = false, cols = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a'];
    frame(tp, '風船を <b>できるだけ たくさん 割ろう!</b>(10秒)', '<div class="hdbl" id="hdbl"></div><div class="hdbar"><i id="hdtm" style="width:100%;background:#e0a300"></i></div>');
    var box = $('#hdbl'), t0 = performance.now();
    function spawn() {
      if (over) return; var b = document.createElement('button'); b.type = 'button'; b.className = 'hdb'; b.setAttribute('aria-label', '風船');
      b.style.left = (4 + Math.random() * 78) + '%'; b.style.background = cols[rnd(cols.length)]; b.style.animationDuration = (2.2 + Math.random() * 1.2) + 's';
      b.onclick = function () { if (over || b.dataset.p) return; b.dataset.p = 1; cnt++; b.textContent = '💥'; b.style.background = 'transparent'; setTimeout(function () { b.remove(); }, 160); };
      b.addEventListener('animationend', function () { b.remove(); }); box.appendChild(b);
    }
    spawn(); IV(function () { if (!over) { spawn(); if (Math.random() < .5) spawn(); } }, 480);
    IV(function () {
      var p = 1 - (performance.now() - t0) / 10000; var el = $('#hdtm'); if (el) el.style.width = Math.max(0, p * 100) + '%';
      if (p <= 0 && !over) {
        over = true; dbg('balloon', cnt); clearAll(); box.innerHTML = '';
        var set = [cnt]; [-3, -2, -1, 1, 2, 3].sort(function () { return Math.random() - .5; }).forEach(function (d) { if (set.length < 4 && cnt + d >= 0) set.push(cnt + d); });
        var ch = choices(set.sort(function (a, b) { return a - b; }).map(function (v) { return [v + ' こ', v]; }), function (v) { done(v === cnt, '割った 風船は <b>' + cnt + 'こ</b> でした'); });
        $('#hdc').insertAdjacentHTML('beforeend', '<div class="hdt" style="margin-top:12px">何こ 割ったかな?</div>' + ch.html); ch.bind();
      }
    }, 100);
  } });
  // 記憶: 鏡に映った僕(ロボ)
  var RC = [['赤', '#e53935'], ['青', '#1e88e5'], ['黄', '#fdd835'], ['緑', '#43a047'], ['紫', '#8e24aa'], ['ピンク', '#ec407a']];
  function roboSvg(list) {
    var W = 300, step = W / list.length, o = '<svg viewBox="0 0 300 150" style="width:100%;display:block"><rect width="300" height="150" fill="#eaf6ff"/><rect x="0" y="128" width="300" height="22" fill="#cfd8dc"/>';
    list.forEach(function (c, i) {
      var cx = step * i + step / 2, k = Math.min(1, step / 74);
      o += '<g transform="translate(' + cx + ' 0) scale(' + k + ') translate(-30 0)"><line x1="30" y1="14" x2="30" y2="30" stroke="#455a64" stroke-width="3"/><circle cx="30" cy="12" r="5" fill="#455a64"/><rect x="8" y="30" width="44" height="34" rx="8" fill="' + c[1] + '" stroke="#37474f" stroke-width="3"/><circle cx="21" cy="46" r="5" fill="#fff" stroke="#37474f" stroke-width="2"/><circle cx="39" cy="46" r="5" fill="#fff" stroke="#37474f" stroke-width="2"/><circle cx="21" cy="46" r="2" fill="#263238"/><circle cx="39" cy="46" r="2" fill="#263238"/><rect x="12" y="66" width="36" height="42" rx="6" fill="' + c[1] + '" stroke="#37474f" stroke-width="3"/><rect x="0" y="70" width="10" height="26" rx="4" fill="' + c[1] + '" stroke="#37474f" stroke-width="2"/><rect x="50" y="70" width="10" height="26" rx="4" fill="' + c[1] + '" stroke="#37474f" stroke-width="2"/><rect x="16" y="108" width="10" height="20" fill="#455a64"/><rect x="34" y="108" width="10" height="20" fill="#455a64"/></g>';
    });
    return o + '</svg>';
  }
  TYPES.push({ id: 'robo', cat: '記憶', name: '鏡に映った ロボ', run: function (tp) {
    var n = 2 + rnd(4), cs = shuf(RC).slice(0, n), kind = ['count', 'right', 'left'][rnd(3)];
    dbg('robo', { n: n, cs: cs.map(function (c) { return c[0]; }), kind: kind });
    frame(tp, '鏡に映った 僕(ロボ)。<br>今から <b>3秒間</b> 映像を 映します。<br>よ〜く 見ていてね', '<div style="border:6px solid #b0bec5;border-radius:14px;overflow:hidden;box-shadow:inset 0 0 0 3px #eceff1">' + roboSvg(cs) + '</div><div class="hdbar"><i id="hdtm" style="width:100%;background:#e0a300"></i></div>');
    var t0 = performance.now();
    IV(function () { var p = 1 - (performance.now() - t0) / 3000; var el = $('#hdtm'); if (el) el.style.width = Math.max(0, p * 100) + '%'; }, 80);
    T(function () {
      var q, ans, opts;
      if (kind === 'count') { q = 'ロボは <b>何体</b> いましたか?'; ans = n; var set = [n]; [-2, -1, 1, 2].sort(function () { return Math.random() - .5; }).forEach(function (d) { if (set.length < 4 && n + d >= 1 && n + d <= 6) set.push(n + d); }); opts = set.sort(function (a, b) { return a - b; }).map(function (v) { return [v + ' 体', v]; }); }
      else { var c = kind === 'right' ? cs[n - 1][0] : cs[0][0]; q = (kind === 'right' ? '<b>右がわ</b>' : '<b>左がわ') + 'の ロボは、<b>何色</b> でしたか?'; if (kind === 'left') q = '<b>左がわ</b>の ロボは、<b>何色</b> でしたか?'; ans = c; var o = [c]; shuf(RC.map(function (x) { return x[0]; })).forEach(function (x) { if (o.length < 4 && o.indexOf(x) < 0) o.push(x); }); opts = shuf(o).map(function (v) { return [v, v]; }); }
      var ch = choices(opts, function (v) { done(v === ans, '正解は <b>' + (kind === 'count' ? ans + '体' : ans) + '</b> でした'); });
      $('#hdc').innerHTML = '<div class="hdt">' + q + '</div>' + ch.html; ch.bind();
    }, 3000);
  } });
  // 聴覚: 言葉を よく聞いて
  var WF = ['すいか', 'メロン', 'いちご', 'さくらんぼ', 'りんご', 'ぶどう', 'バナナ', 'キウイ', 'もも', 'レモン'], WO = [['みかん', ['みかん', '蜜柑']], ['オレンジ', ['オレンジ']], ['かき', ['かき', '柿']]];
  function kana(x) { return String(x || '').replace(/[\s　]/g, '').replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 96); }); }
  function speakSeq(words, onEnd) {
    var ss = window.speechSynthesis; if (!ss || typeof SpeechSynthesisUtterance === 'undefined') return false;
    try { ss.cancel(); } catch (e) { /* 無視 */ }
    var i = 0; (function one() { if (i >= words.length) return onEnd && onEnd(); var u = new SpeechSynthesisUtterance(words[i++]); u.lang = 'ja-JP'; u.rate = 0.85; u.onend = function () { setTimeout(one, 450); }; u.onerror = function () { setTimeout(one, 450); }; try { ss.speak(u); } catch (e) { setTimeout(one, 450); } })();
    return true;
  }
  TYPES.push({ id: 'words', cat: '聴覚', name: '言葉を よく聞いて', run: function (tp) {
    var kind = rnd(2) ? 'dup' : 'orange', list, ans, accept, q;
    if (kind === 'dup') { var f = shuf(WF).slice(0, 5); var d = f[rnd(5)]; list = shuf(f.concat([d])); while (list.some(function (x, i) { return i && list[i - 1] === x; })) list = shuf(f.concat([d])); ans = d; accept = [d]; q = '<b>2回</b> 言った 言葉は、何でしょうか?'; }
    else { var o = WO[rnd(WO.length)]; list = shuf(shuf(WF).slice(0, 5).concat([o[0]])); ans = o[0]; accept = o[1]; q = '<b>オレンジ色</b>の くだものは、何でしたか?'; }
    dbg('words', { list: list, ans: ans, kind: kind });
    frame(tp, '今から 言う言葉を <b>よく聞いてね</b>。(1回だけ)', '<button type="button" class="qb pri" id="hdplay">🔊 きく(1回だけ)</button><div id="hdch"></div><button type="button" class="qb sm" id="hdskip">音が 聞こえない(ノーカウント)</button><p class="hdnote">スマホの 音を 出してね</p>');
    $('#hdskip').onclick = function () { done('skip', '音が 出ない ときは ノーカウントです'); };
    var played = false;
    $('#hdplay').onclick = function () {
      if (played) return; played = true; this.disabled = true; this.textContent = '聞いています…';
      var ok = speakSeq(list, function () {
        if (!alive()) return;
        $('#hdc').innerHTML = '<div class="hdt">' + q + '</div><div class="hdt" style="font-size:.85em;font-weight:600">ひらがな・カタカナ どちらでも OK</div><input id="hdtx" class="pcin" maxlength="12" autocomplete="off" placeholder="こたえ" style="width:100%;box-sizing:border-box;min-height:52px;font-size:1.3em;text-align:center"><button type="button" class="qb pri" id="hdok" style="margin-top:10px">これで 決定</button>';
        $('#hdok').onclick = function () { var v = kana($('#hdtx').value); if (!v) return A.toast('こたえを いれてね'); done(accept.some(function (a) { return kana(a) === v; }), '正解は <b>' + ans + '</b> でした(' + list.join('・') + ')'); };
      });
      if (!ok) { A.toast('この端末では 声が 出せません'); done('skip', '声が 出ない ときは ノーカウントです'); }
    };
  } });
  // 常識: 人体模型 → その 内ぞうを タップ
  var ORG = [['brain', '脳'], ['lung', '肺'], ['heart', '心臓'], ['liver', '肝臓'], ['stomach', '胃'], ['kidney', '腎臓'], ['sint', '小腸'], ['lint', '大腸'], ['bladder', 'ぼうこう']];
  function bodySVG() {
    var o = '<svg viewBox="0 0 200 330" class="hdbody" id="hdbody"><path d="M100 8c-22 0-34 16-34 36 0 14 6 24 14 30v10c-30 6-52 18-54 40l-6 70h22l4-60 8 150h40l4-86 4 86h40l8-150 4 60h22l-6-70c-2-22-24-34-54-40V74c8-6 14-16 14-30 0-20-12-36-34-36z" fill="#ffe8d2" stroke="#b08968" stroke-width="3" stroke-linejoin="round"/>';
    var S = {
      brain: '<ellipse cx="100" cy="38" rx="22" ry="20" fill="#f4a6c0"/>',
      lung: '<path d="M62 100c-10 6-14 30-10 48 8 4 24 0 30-6V104c-6-8-14-10-20-4z" fill="#f08a8a"/><path d="M138 100c10 6 14 30 10 48-8 4-24 0-30-6V104c6-8 14-10 20-4z" fill="#f08a8a"/>',
      heart: '<path d="M100 150c-14-10-16-24-8-30 6-4 12 0 14 4 2-4 10-8 14-2 8 8 0 24-20 28z" fill="#d32f2f"/>',
      liver: '<path d="M64 162c14-4 34-2 42 4l-6 24c-16 4-34 0-40-10z" fill="#8d4b2f"/>',
      stomach: '<path d="M114 160c14-4 26 4 24 18-2 12-14 16-22 10-6-4-2-10 4-10 6 0 6-8-6-10z" fill="#f2a65a"/>',
      kidney: '<ellipse cx="76" cy="150" rx="7" ry="11" fill="#a1522a" transform="rotate(-12 76 150)"/><ellipse cx="124" cy="150" rx="7" ry="11" fill="#a1522a" transform="rotate(12 124 150)"/>',
      sint: '<path d="M80 200c10-8 20 4 30-2 10-6 14 6 6 12-10 8-22-2-32 4-8 6-14-8-4-14z M84 222c10-6 20 6 32 0 8 6-4 14-14 10-10 6-24-2-18-10z" fill="#ffd166" stroke="#d99a00" stroke-width="1.5"/>',
      lint: '<path d="M68 196v50h64v-50" fill="none" stroke="#9c6b4e" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>',
      bladder: '<ellipse cx="100" cy="262" rx="13" ry="11" fill="#7cc4e6"/>'
    };
    ORG.forEach(function (g) { o += '<g class="hdorg" data-og="' + g[0] + '" tabindex="0" role="button" aria-label="' + g[1] + '">' + S[g[0]] + '</g>'; });
    return o + '</svg>';
  }
  TYPES.push({ id: 'body', cat: '常識', name: '人体模型', run: function (tp) {
    var g = pick(ORG), fin = false; dbg('body', g[0]);
    frame(tp, '<b>' + g[1] + '</b> を タップ!(12秒)', bodySVG() + '<div class="hdbar"><i id="hdtm" style="width:100%;background:#e0a300"></i></div>');
    var t0 = performance.now();
    root.querySelectorAll('.hdorg').forEach(function (n) { n.onclick = function () { if (fin) return; fin = true; var ok = n.getAttribute('data-og') === g[0]; done(ok, ok ? '<b>' + g[1] + '</b> です!' : 'そこは ' + esc(n.getAttribute('aria-label')) + ' でした。<b>' + g[1] + '</b> は 別の 場所です'); }; });
    IV(function () { var p = 1 - (performance.now() - t0) / 12000; var el = $('#hdtm'); if (el) el.style.width = Math.max(0, p * 100) + '%'; if (p <= 0 && !fin) { fin = true; done(false, 'じかんぎれ…'); } }, 100);
  } });

  // 聴覚: この音は なに?
  var SND = {
    kyukyu: ['救急車', function () { for (var i = 0; i < 4; i++) tone(i % 2 ? 770 : 960, i * 0.5, 0.48, 0.25); }],
    fumikiri: ['踏切', function () { for (var i = 0; i < 10; i++) tone(i % 2 ? 640 : 800, i * 0.3, 0.12, 0.3); }],
    pinpon: ['玄関の チャイム', function () { tone(1046, 0, 0.55, 0.25); tone(784, 0.6, 0.9, 0.25); }],
    mezamashi: ['目ざまし時計', function () { for (var r = 0; r < 3; r++) for (var i = 0; i < 4; i++) tone(2000, r * 0.9 + i * 0.12, 0.06, 0.18); }],
    range: ['電子レンジ', function () { for (var i = 0; i < 3; i++) tone(2400, i * 0.7, 0.5, 0.18); }],
    denwa: ['電話の 着信音', function () { for (var r = 0; r < 2; r++) for (var i = 0; i < 16; i++) tone(i % 2 ? 1300 : 1000, r * 1.2 + i * 0.045, 0.045, 0.2); }]
  };
  // 視覚: 視力検査(ランドルト環)
  TYPES.push({ id: 'eye', cat: '視覚', name: '視力けんさ', run: function (tp) {
    var dirs = [['右', 0], ['下', 90], ['左', 180], ['上', 270]], d = pick(dirs), sz = 16 + rnd(14); dbg('eye', d[0]);
    frame(tp, '<b>うでを のばして</b> スマホを もちましょう。<br>「見る」を おすと <b>1秒だけ</b> 輪が 出ます。<b>すき間は どっち?</b>', '<div class="hdeye" id="hdeye"></div><button type="button" class="qb pri" id="hdgo">見る(1秒)</button><div id="hdch"></div>');
    $('#hdgo').onclick = function () {
      this.style.display = 'none';
      $('#hdeye').innerHTML = '<svg viewBox="-20 -20 40 40" width="' + sz + '" height="' + sz + '"><circle r="14" fill="none" stroke="#111" stroke-width="7" stroke-dasharray="' + (2 * Math.PI * 14 * 0.8).toFixed(1) + ' ' + (2 * Math.PI * 14).toFixed(1) + '" stroke-dashoffset="' + (-(2 * Math.PI * 14 * 0.1)).toFixed(1) + '" transform="rotate(' + (d[1]) + ')"/></svg>';
      T(function () {
        $('#hdeye').innerHTML = '<div style="color:#98a2b3;font-weight:800">?</div>';
        var ch = choices([['⬆️ 上', '上'], ['⬇️ 下', '下'], ['⬅️ 左', '左'], ['➡️ 右', '右']], function (v) { done(v === d[0], 'すき間は <b>' + d[0] + '</b> でした'); });
        $('#hdch').innerHTML = ch.html; ch.bind();
      }, 1000);
    };
  } });
  // 常識(イラスト): 自転車ルール
  function roadSVG(kind) {
    var road = '<rect width="300" height="160" fill="#8bc34a"/><rect y="22" width="300" height="116" fill="#6b7280"/><path d="M0 80H300" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/>';
    if (kind === 'car') return '<svg viewBox="0 0 300 160" class="hdsc">' + road + '<text x="170" y="64" font-size="40">🚗</text><text x="40" y="120" font-size="36">🚴</text><path d="M4 128l-3-3 3-3" stroke="#fff" fill="none"/><text x="150" y="152" font-size="11" fill="#fff" text-anchor="middle">あなた(左がわ)を 後ろから 車が ちかづく</text></svg>';
    if (kind === 'night') return '<svg viewBox="0 0 300 160" class="hdsc"><rect width="300" height="160" fill="#14213d"/><rect y="100" width="300" height="60" fill="#374151"/><text x="230" y="40" font-size="30">🌙</text><text x="110" y="132" font-size="40">🚲</text><text x="12" y="30" font-size="12" fill="#cbd5e1">くらい 夜みち。まわりが よく見えない</text></svg>';
    return '<svg viewBox="0 0 300 160" class="hdsc"><rect width="300" height="160" fill="#8bc34a"/><rect x="120" width="60" height="160" fill="#6b7280"/><rect y="50" width="300" height="60" fill="#6b7280"/><text x="30" y="90" font-size="36">🚴</text><text x="222" y="48" font-size="32">🛑</text><text x="205" y="105" font-size="28">🚙</text></svg>';
  }
  var BIKE = [
    { s: 'car', q: 'あなたは <b>左がわ</b>を 自転車で 走っています。<br>車が そばに ちかづいてきました。さあ どうする?', a: ['左はしに 寄って、ふらつかず 車を 先に行かせる', '右に よけて 車の 前を 横切る', '急に その場で 止まって ふり返る', '車に 負けないよう スピードを 上げる'], n: '自転車は 車道の <b>左がわ</b>。車が ちかづいたら あわてず 左に 寄り、ふらつかないのが 安全です' },
    { s: 'night', q: '夜、自転車に 乗ります。出発の前に <b>まず なにを する?</b>', a: ['ライトを つける', 'スピードを 出して 早く 着く', 'イヤホンで 音楽を きく', '傘を さして 片手で 走る'], n: '夜は <b>ライト</b>を つけます(つけないと 見えず、見られません)。イヤホンや 傘さしは 危険で 禁止されています' },
    { s: 'stop', q: '「止まれ」の ひょうしきが ある 交差点です。<b>どうする?</b>', a: ['一時停止して、左右を 確認する', 'そのまま 通りぬける', 'ベルを 鳴らして 進む', '左だけ 見て 進む'], n: '「止まれ」では <b>かならず 一時停止</b>し、左右を しっかり 確認します' }
  ];
  TYPES.push({ id: 'bike', cat: '常識', name: '自転車ルール', run: function (tp) {
    var b = pick(BIKE), idx = shuf([0, 1, 2, 3]); dbg('bike', b);
    frame(tp, b.q, roadSVG(b.s) + '<div id="hdch"></div>');
    var ch = choices(idx.map(function (i) { return [b.a[i], i]; }), function (v) { done(v === 0, b.n); });
    $('#hdch').innerHTML = ch.html.replace('class="hdopt"', 'class="hdopt one"'); ch.bind();
  } });
  // 視覚: 火災 どこの 空気を 吸う?
  TYPES.push({ id: 'fire', cat: '視覚', name: '火災です', run: function (tp) {
    var fin = false;
    frame(tp, '<b>火災です!</b> 部屋に 煙が 広がっています。<br><b>どこの 空気を 吸いますか?</b>(絵を タップ)',
      '<svg viewBox="0 0 300 220" class="hdsc" id="hdfire"><defs><linearGradient id="hsm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2b2b" stop-opacity=".95"/><stop offset="1" stop-color="#9aa0a6" stop-opacity=".25"/></linearGradient></defs>' +
      '<rect width="300" height="220" fill="#fff4e0"/><rect y="200" width="300" height="20" fill="#b08968"/><rect width="300" height="130" fill="url(#hsm)"/><text x="232" y="196" font-size="44">🔥</text><text x="40" y="190" font-size="36">🛋️</text><text x="130" y="196" font-size="30">🙇</text>' +
      '<g class="hdz" data-z="top"><rect x="0" y="0" width="300" height="70" fill="transparent"/><text x="150" y="40" font-size="14" text-anchor="middle" fill="#fff" font-weight="800">A 天井の ちかく</text></g>' +
      '<g class="hdz" data-z="mid"><rect x="0" y="70" width="300" height="70" fill="transparent"/><text x="150" y="110" font-size="14" text-anchor="middle" fill="#222" font-weight="800">B 立った ままの 高さ</text></g>' +
      '<g class="hdz" data-z="low"><rect x="0" y="140" width="300" height="60" fill="transparent"/><text x="150" y="130" font-size="0"></text><text x="150" y="160" font-size="14" text-anchor="middle" fill="#222" font-weight="800">C 床の ちかく</text></g>' +
      '<path d="M0 70H300M0 140H300" stroke="#fff" stroke-width="2" stroke-dasharray="6 4" opacity=".8"/></svg>');
    root.querySelectorAll('.hdz').forEach(function (g) { g.onclick = function () { if (fin) return; fin = true; var z = g.getAttribute('data-z'); dbg('fire', z); done(z === 'low', z === 'low' ? '煙は 上に たまります。<b>低い姿勢</b>で、ハンカチなどで 口を おおって にげます' : '煙は 上に たまります。<b>床の ちかく</b>の 空気を 吸います。低い姿勢で、ハンカチで 口を おおって にげましょう'); }; });
  } });

  /* ===== 追加のチャレンジ(頭脳・風船文字・射撃・折り紙順・フラッシュカード・救助) ===== */
  CSS += '#qz .hdex{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0}#qz .hdex button{margin:0;min-width:48px;min-height:48px;font-size:1.25em;font-weight:900;border-radius:12px;border:2px solid #cfc7b4;background:#fff;cursor:pointer}#qz .hdex button:disabled{opacity:.3}#qz .hdexp{min-height:2.2em;text-align:center;font-size:1.6em;font-weight:900;letter-spacing:.06em;background:#fffdf4;border:2px dashed #cfc7b4;border-radius:12px;padding:8px;margin:8px 0;word-break:break-all}' +
    '#qz .hdwd{display:flex;gap:6px;justify-content:center;margin:12px 0}#qz .hdwd span{position:relative;width:48px;height:60px;border-radius:10px;background:#fff;border:2px solid #cfc7b4;display:flex;align-items:center;justify-content:center;font-size:1.7em;font-weight:900}#qz .hdwd button{position:absolute;inset:-6px;border:none;border-radius:50% 50% 46% 46%;font-size:1.3em;cursor:pointer;color:#fff;font-weight:900}' +
    '#qz .hdst{display:flex;flex-direction:column;gap:8px;margin:10px 0}#qz .hdst button{margin:0;text-align:left;padding:10px 12px;border-radius:12px;border:2px solid #cfc7b4;background:#fff;font-size:1em;line-height:1.5;cursor:pointer}#qz .hdst button.on{background:#d9efe0;border-color:#2d9a5f}#qz .hdst button.bad{background:#fde3e0;border-color:#c0392b}' +
    '#qz .hdfc{font-size:5em;text-align:center;height:1.4em;line-height:1.4em;position:relative}#qz .hdfc i{position:absolute;right:20%;top:0;font-size:.3em;font-style:normal;background:#6a4bd6;color:#fff;border-radius:99px;padding:0 .5em;line-height:1.7}';
  function solve10(nums) {
    function go(a) {
      if (a.length === 1) return Math.abs(a[0].v - 10) < 1e-9 ? a[0].e : null;
      for (var i = 0; i < a.length; i++) for (var j = 0; j < a.length; j++) {
        if (i === j) continue; var x = a[i], y = a[j], rest = a.filter(function (_, k) { return k !== i && k !== j; }), c = [{ v: x.v + y.v, e: '(' + x.e + '+' + y.e + ')' }, { v: x.v - y.v, e: '(' + x.e + '-' + y.e + ')' }, { v: x.v * y.v, e: '(' + x.e + '×' + y.e + ')' }];
        if (Math.abs(y.v) > 1e-9) c.push({ v: x.v / y.v, e: '(' + x.e + '÷' + y.e + ')' });
        for (var k = 0; k < c.length; k++) { var r = go(rest.concat([c[k]])); if (r) return r; }
      }
      return null;
    }
    return go(nums.map(function (n) { return { v: n, e: String(n) }; }));
  }
  function evalTok(toks) {   // 数字と + - × ÷ ( ) の列を計算する(失敗は例外)
    var p = 0;
    function peek() { return toks[p]; }
    function factor() { var t = peek(); if (!t) throw 0; if (t.t === 'n') { p++; return t.v; } if (t.v === '(') { p++; var v = expr(); if (!peek() || peek().v !== ')') throw 0; p++; return v; } throw 0; }
    function term() { var v = factor(); while (peek() && (peek().v === '×' || peek().v === '÷')) { var o = toks[p++].v, w = factor(); if (o === '÷') { if (Math.abs(w) < 1e-9) throw 0; v = v / w; } else v = v * w; } return v; }
    function expr() { var v = term(); while (peek() && (peek().v === '+' || peek().v === '-')) { var o = toks[p++].v, w = term(); v = o === '+' ? v + w : v - w; } return v; }
    var r = expr(); if (p !== toks.length) throw 0; return r;
  }
  TYPES.push({ id: 'ten', cat: '頭脳', name: '10に しよう', run: function (tp) {
    var nums, ans, toks = [], used = {}, tries = 0, fin = false;
    do { nums = [1, 2, 3, 4].map(function () { return 1 + rnd(9); }); ans = solve10(nums); } while (!ans);
    dbg('ten', { nums: nums, ans: ans });
    var keys = ['+', '-', '×', '÷', '(', ')'];
    frame(tp, '<b>' + nums.join(' ') + '</b> を ぜんぶ 1回ずつ つかって <b>10</b> に してください<br><span class="hdnote">たす ひく かける わる ( ) が つかえます(3回まで ちょうせん)</span>',
      '<div class="hdexp" id="hdexp">&nbsp;</div><div class="hdex" id="hdnk">' + nums.map(function (n, i) { return '<button type="button" data-n="' + i + '">' + n + '</button>'; }).join('') + '</div><div class="hdex">' + keys.map(function (k) { return '<button type="button" data-k="' + k + '">' + (k === '-' ? '−' : k) + '</button>'; }).join('') + '</div>' +
      '<div class="hdex"><button type="button" id="hdbk" style="min-width:90px;font-size:1em">1つ もどす</button><button type="button" id="hdcl" style="min-width:90px;font-size:1em">ぜんぶ 消す</button></div><div class="hdex"><button type="button" id="hdok" style="min-width:130px;font-size:1.05em;background:#2d9a5f;color:#fff;border-color:#2d9a5f">これで 10!</button><button type="button" id="hdgv" style="min-width:110px;font-size:1em">わからない</button></div><div class="hdnote" id="hdmsg"></div>');
    function draw() { $('#hdexp').textContent = toks.map(function (t) { return t.t === 'n' ? t.v : t.v === '-' ? '−' : t.v; }).join(' ') || ' '; root.querySelectorAll('[data-n]').forEach(function (b) { b.disabled = !!used[b.dataset.n]; }); }
    root.querySelectorAll('[data-n]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.n; if (used[i] || fin) return; used[i] = 1; toks.push({ t: 'n', v: nums[i], i: i }); draw(); }; });
    root.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { if (fin) return; toks.push({ t: 'o', v: b.dataset.k }); draw(); }; });
    $('#hdbk').onclick = function () { var t = toks.pop(); if (t && t.t === 'n') delete used[t.i]; draw(); };
    $('#hdcl').onclick = function () { toks = []; used = {}; draw(); };
    $('#hdgv').onclick = function () { if (fin) return; fin = true; done(false, 'こたえの れい: <b>' + ans.replace(/-/g, '−') + ' = 10</b>'); };
    $('#hdok').onclick = function () {
      if (fin) return; var m = $('#hdmsg');
      if (Object.keys(used).length < 4) { m.textContent = '4つの数字を ぜんぶ つかってください'; return; }
      var v; try { v = evalTok(toks); } catch (e) { m.textContent = '式が おかしいです。( ) や 記号を 見なおしてください'; return; }
      if (Math.abs(v - 10) < 1e-9) { fin = true; done(true, '10に なりました!'); return; }
      tries++; if (tries >= 3) { fin = true; done(false, '3回 まちがえました。こたえの れい: <b>' + ans.replace(/-/g, '−') + ' = 10</b>'); return; }
      m.textContent = (Math.round(v * 100) / 100) + ' になりました。10では ありません(あと ' + (3 - tries) + '回)';
    };
  } });
  var BWORDS = ['さいれい', 'えんげい', 'ぼうさい', 'はまだやま', 'ひなんじょ', 'おみこし', 'もちつき', 'ぼんおどり', 'やたい', 'おまつり', 'ふうりん', 'かいらんばん', 'ちょうないかい', 'はなびたいかい', 'きんぎょすくい', 'ぎんなんひろい', 'しょうがつ', 'せんべい'];
  TYPES.push({ id: 'bword', cat: '体感', name: '風船を うって 文字を 見やぶれ', run: function (tp) {
    var w = pick(BWORDS), ch = w.split(''), cols = ['#e53935', '#fb8c00', '#43a047', '#1e88e5', '#8e24aa', '#ec407a', '#00acc1'], shots = 0, fin = false, t0 = performance.now(), LIM = 25000;
    dbg('bword', w);
    var same = shuf(BWORDS.filter(function (x) { return x !== w && x.length === w.length; })), other = shuf(BWORDS.filter(function (x) { return x !== w && x.length !== w.length; })), ds = same.concat(other).slice(0, 3);
    frame(tp, '風船の 下に 文字が かくれています。<b>風船を うって</b>(タップ) 言葉を 見やぶれ!<br><span class="hdnote">25秒いないに 正しい言葉を えらべばOK(うつ数は 少なくても おおくても かまいません)</span>',
      '<div class="hdwd" id="hdwd">' + ch.map(function (c, i) { return '<span>' + c + '<button type="button" data-b="' + i + '" style="background:' + cols[i % cols.length] + '" aria-label="風船">🎈</button></span>'; }).join('') + '</div><div class="hdbar"><i id="hdtm" style="width:100%;background:#e0a300"></i></div><div class="hdnote" id="hdsh">うった 数: 0</div><div id="hdch"></div>');
    root.querySelectorAll('[data-b]').forEach(function (b) { b.onclick = function () { if (fin || b.dataset.p) return; b.dataset.p = 1; shots++; b.textContent = '💥'; b.style.background = 'transparent'; T(function () { b.remove(); }, 250); $('#hdsh').textContent = 'うった 数: ' + shots; }; });
    var c = choices(shuf([w].concat(ds)).map(function (x) { return [x, x]; }), function (v) {
      if (fin) return; fin = true; var ms = performance.now() - t0, sec = Math.round(ms / 100) / 10;
      if (ms > LIM) done(false, '時間オーバーでした(' + sec + '秒)。こたえは <b>' + w + '</b>'); else done(v === w, v === w ? '<b>' + w + '</b>!  ' + sec + '秒・風船 ' + shots + 'こ で 見やぶりました' : 'ざんねん。こたえは <b>' + w + '</b>');
    });
    $('#hdch').innerHTML = c.html; c.bind();
    IV(function () { if (fin) return; var p = 1 - (performance.now() - t0) / LIM, el = $('#hdtm'); if (el) el.style.width = Math.max(0, p * 100) + '%'; if (p <= 0) { fin = true; root.querySelectorAll('[data-o]').forEach(function (b) { b.disabled = true; }); done(false, '時間オーバーでした。こたえは <b>' + w + '</b>'); } }, 100);
  } });
  TYPES.push({ id: 'shoot', cat: '体感', name: '射撃', run: function (tp) {
    var shots = 0, pts = 0, fin = false, N = 5, NEED = 25, tg = [{ x: 60, y: 45, r: 30, vx: 55, ph: 0 }, { x: 150, y: 110, r: 26, vx: -80, ph: 0 }, { x: 240, y: 60, r: 22, vx: 105, ph: 0 }];
    dbg('shoot', tg);
    frame(tp, '動く まとを <b>' + N + '発</b> で うて! 合計 <b>' + NEED + '点</b>いじょうで OK<br><span class="hdnote">まん中ほど 高得点(10・6・3点)</span>',
      '<svg viewBox="0 0 300 170" class="hdsc" id="hdsvg" style="background:#dff0ff;touch-action:manipulation;cursor:crosshair"></svg><div class="hdnote" id="hdsc2">のこり ' + N + '発 ・ 0点</div>');
    var svg = $('#hdsvg'), last = performance.now(), marks = [];
    function render() { svg.innerHTML = '<rect y="150" width="300" height="20" fill="#9bc27a"/>' + tg.map(function (t) { return '<g><circle cx="' + t.x + '" cy="' + t.y + '" r="' + t.r + '" fill="#fff" stroke="#c62828" stroke-width="2"/><circle cx="' + t.x + '" cy="' + t.y + '" r="' + (t.r * .55) + '" fill="#e53935"/><circle cx="' + t.x + '" cy="' + t.y + '" r="' + (t.r * .25) + '" fill="#fff"/></g>'; }).join('') + marks.map(function (m) { return '<text x="' + m.x + '" y="' + m.y + '" font-size="12" text-anchor="middle" fill="#222" font-weight="900">' + m.s + '</text><circle cx="' + m.x + '" cy="' + m.y + '" r="2.5" fill="#222"/>'; }).join(''); }
    IV(function () { var n = performance.now(), dt = Math.min(.1, (n - last) / 1000); last = n; tg.forEach(function (t) { t.x += t.vx * dt; if (t.x < t.r) { t.x = t.r; t.vx = Math.abs(t.vx); } if (t.x > 300 - t.r) { t.x = 300 - t.r; t.vx = -Math.abs(t.vx); } }); render(); }, 33);
    function shot(ev) {
      if (fin) return; var rc = svg.getBoundingClientRect(), pt = ev.touches ? ev.touches[0] : ev, x = (pt.clientX - rc.left) / rc.width * 300, y = (pt.clientY - rc.top) / rc.height * 170, best = 0;
      tg.forEach(function (t) { var d = Math.sqrt((x - t.x) * (x - t.x) + (y - t.y) * (y - t.y)), s = d <= t.r * .25 ? 10 : d <= t.r * .55 ? 6 : d <= t.r ? 3 : 0; if (s > best) best = s; });
      shots++; pts += best; marks.push({ x: x, y: y, s: best }); $('#hdsc2').textContent = 'のこり ' + (N - shots) + '発 ・ ' + pts + '点'; dbg('shootpts', pts);
      if (shots >= N) { fin = true; clearAll(); render(); T(function () { done(pts >= NEED, pts + '点 でした(' + NEED + '点いじょうで OK)'); }, 700); }
    }
    svg.addEventListener('click', shot);
  } });
  var FOLDS = [
    { id: 'plane', name: '紙ヒコーキを 折ろう', q: '紙ヒコーキを 折ります。<b>正しい 順番</b>に タップしてください', steps: ['たてに 半分に 折って、すじを つけて ひらく', '上の 2つの 角を、まん中の すじに 合わせて 折る', '斜めになった 辺を、もう一度 まん中の すじに 合わせて 折る', 'まん中の すじで、うしろへ 半分に 折る', '左右の 羽を 折り下げて、ひろげる'] },
    { id: 'crane', name: '鶴を 折ってみよう', q: '折り鶴を 折ります。<b>正しい 順番</b>に タップしてください', steps: ['色の ついた 面を 上にして、三角に 半分に 折って すじを つけ ひらく(両方の 向き)', '四角に 半分に 折って すじを つけ、ひらく', 'すじを つかって 小さな 四角(ざぶとん)の 形に たたむ', '上の 1まいを、左右の 辺を まん中に 合わせて 折る(うらも 同じ)', '下の 角を 折り上げ、細長く たたむ(両がわ)', '先を 折って 頭と しっぽに し、羽を ひろげる'] }];
  FOLDS.forEach(function (f) {
    TYPES.push({ id: f.id, cat: '常識', name: f.name, run: function (tp) {
      var order = shuf(f.steps.map(function (_, i) { return i; })), nxt = 0, bad = 0, fin = false; dbg(f.id, order);
      frame(tp, f.q + '<br><span class="hdnote">まちがえて タップすると ミスです(2回で 失敗)</span>', '<div class="hdst" id="hdst">' + order.map(function (i) { return '<button type="button" data-s="' + i + '">' + esc(f.steps[i]) + '</button>'; }).join('') + '</div><div class="hdnote" id="hdmsg">1番目は どれ?</div>');
      root.querySelectorAll('[data-s]').forEach(function (b) { b.onclick = function () {
        if (fin || b.classList.contains('on')) return; var i = +b.dataset.s;
        if (i === nxt) { b.classList.add('on'); b.insertAdjacentHTML('afterbegin', '<b>' + (nxt + 1) + '. </b>'); nxt++; if (nxt >= f.steps.length) { fin = true; done(bad < 2, bad < 2 ? 'じょうずに 折れました!' : 'まちがいが おおかったです'); } else $('#hdmsg').textContent = (nxt + 1) + '番目は どれ?'; }
        else { bad++; b.classList.add('bad'); T(function () { b.classList.remove('bad'); }, 500); if (bad >= 2) { fin = true; done(false, '正しい 順番は:<br>' + f.steps.map(function (s, k) { return (k + 1) + '. ' + esc(s); }).join('<br>')); } else $('#hdmsg').textContent = 'ちがいます。もういちど(' + (nxt + 1) + '番目)'; }
      }; });
    } });
  });
  TYPES.push({ id: 'flash', cat: '記憶', name: 'フラッシュカード', run: function (tp) {
    var POOL = ['🐶', '🐱', '🍎', '🚗', '🌸', '🐟', '🍙', '⚽', '🐘', '🍌'], K = 5, cards = [], k, i, kid;
    var pics = shuf(POOL).slice(0, K); kid = rnd(K); pics[kid] = pick(['👧', '👦']);
    for (i = 0; i < K; i++) cards.push({ p: pics[i], n: 1 + rnd(9) });
    var sum = cards.reduce(function (a, c) { return a + c.n; }, 0), qtype = rnd(2); dbg('flash', { cards: cards, kid: kid, sum: sum });
    frame(tp, 'カードが <b>1まいずつ</b> 出ます。<b>絵</b>と <b>数字</b>を おぼえてください', '<div class="hdfc" id="hdfc">🃏</div><div class="hdnote" id="hdmsg">じゅんびは いいですか?</div><div class="hdex"><button type="button" id="hdgo" style="min-width:140px;font-size:1.05em;background:#2d9a5f;color:#fff;border-color:#2d9a5f">スタート</button></div>');
    $('#hdgo').onclick = function () {
      $('#hdgo').parentNode.style.display = 'none'; k = 0;
      function showCard() { if (k >= K) { $('#hdfc').innerHTML = '🃏'; T(ask1, 300); return; } var c = cards[k]; $('#hdfc').innerHTML = c.p + '<i>' + c.n + '</i>'; $('#hdmsg').textContent = (k + 1) + ' / ' + K; k++; T(function () { $('#hdfc').innerHTML = ''; T(showCard, 250); }, 1300); }
      showCard();
    };
    function ask1() {
      var pos = qtype === 0 ? rnd(K) : kid, q, opts, right;
      if (qtype === 0) { q = '<b>' + (pos + 1) + '枚目</b>の 絵は 何でしたか?'; right = cards[pos].p; opts = shuf([right].concat(shuf(POOL.concat(['👧', '👦']).filter(function (x) { return pics.indexOf(x) < 0; })).slice(0, 3))); }
      else { q = '<b>' + (kid + 1) + '枚目</b>の 絵は 女の子? 男の子?'; right = cards[kid].p; opts = ['👧', '👦']; }
      $('#hdfc').innerHTML = ''; $('#hdmsg').textContent = '';
      var c = choices(opts.map(function (x) { return [qtype === 1 ? (x === '👧' ? '👧 女の子' : '👦 男の子') : x, x]; }), function (v) { if (v !== right) { done(false, 'こたえは <b>' + right + '</b> でした'); return; } ask2(); });
      $('#hdc').innerHTML = '<div class="hdt">' + q + '</div>' + c.html; c.bind();
    }
    function ask2() {
      var set = [sum]; [-3, -2, -1, 1, 2, 3, 4].sort(function () { return Math.random() - .5; }).forEach(function (d) { if (set.length < 4 && sum + d > 0) set.push(sum + d); });
      var c = choices(set.sort(function (a, b) { return a - b; }).map(function (v) { return [String(v), v]; }), function (v) { done(v === sum, '数字は ' + cards.map(function (x) { return x.n; }).join(' + ') + ' = <b>' + sum + '</b>'); });
      $('#hdc').innerHTML = '<div class="hdt">1問 せいかい! つぎは、出てきた <b>全部の 数字を たすと</b> いくつ?</div>' + c.html; c.bind();
    }
  } });
  function djSvg(label) {   // ヘッドホンのDJのイラスト(絵文字なし)
    return '<svg viewBox="0 0 320 150" class="hdsc" role="img" aria-label="DJのイラスト"><rect width="320" height="150" fill="#2b1d4d"/><circle cx="40" cy="30" r="2" fill="#fff"/><circle cx="280" cy="22" r="2" fill="#ffd54f"/><circle cx="250" cy="52" r="1.6" fill="#fff"/>' +
      '<g transform="translate(160 56)"><circle r="22" fill="#f2c9a0"/><path d="M-22 0 A22 22 0 0 1 22 0" fill="none" stroke="#111" stroke-width="6"/><rect x="-28" y="-6" width="10" height="20" rx="5" fill="#e11d48"/><rect x="18" y="-6" width="10" height="20" rx="5" fill="#e11d48"/><rect x="-14" y="-4" width="28" height="7" rx="3" fill="#111"/><path d="M-8 10 Q0 15 8 10" fill="none" stroke="#7a4a2a" stroke-width="2"/><rect x="-26" y="24" width="52" height="30" rx="8" fill="#6a4bd6"/></g>' +
      '<rect x="40" y="96" width="92" height="40" rx="6" fill="#3a2d63"/><circle cx="86" cy="116" r="15" fill="#111"/><circle cx="86" cy="116" r="5" fill="#e11d48"/><rect x="188" y="96" width="92" height="40" rx="6" fill="#3a2d63"/><circle cx="234" cy="116" r="15" fill="#111"/><circle cx="234" cy="116" r="5" fill="#ffd54f"/>' +
      [0, 1, 2, 3, 4, 5].map(function (i) { return '<rect x="' + (14 + i * 7) + '" y="60" width="5" height="30" fill="#ffd54f"><animate attributeName="height" values="8;30;12;26;8" dur="' + (0.8 + i * 0.13) + 's" repeatCount="indefinite"/><animate attributeName="y" values="90;60;86;64;90" dur="' + (0.8 + i * 0.13) + 's" repeatCount="indefinite"/></rect>'; }).join('') +
      '<text x="160" y="143" font-size="13" text-anchor="middle" fill="#fff" font-weight="800">' + label + '</text></svg>';
  }
  function hearTest(cb) {
    A.draw('<div class="qc" style="text-align:center"><div class="hdt">はじめに、音が 聞こえるか テストします</div>' + djSvg('音声 ながしてますよ〜') + '<div class="hdnote">音量を ほどよく あげて「音を鳴らす」を おしてください</div><button type="button" class="qb" id="hdpl">音を 鳴らす</button><div class="hdopt"><button type="button" class="qb pri" id="hdyes">聞こえる</button><button type="button" class="qb" id="hdno">聞こえない</button></div></div>');
    root.setAttribute('data-hd', tok);
    $('#hdpl').onclick = function () { tone(660, 0, 0.5, 0.3); tone(880, 0.55, 0.5, 0.3); };
    $('#hdyes').onclick = function () { cb(true); }; $('#hdno').onclick = function () { cb(false); };
  }
  TYPES.push({ id: 'djhear', cat: '聴覚', name: '音が 聞こえたら タップ', run: function (tp) {
    var fin = false, onset = 0, t0 = 0, started = false;
    frame(tp, '今から 音を ながします。<br><b>音が 少しでも 聞こえたら タップ!</b>', djSvg('音声 ながしてますよ〜') + '<button type="button" class="qb pri" id="hdst0">はじめる</button><button type="button" class="qb" id="hdtap" style="display:none;min-height:84px;font-size:1.5em">聞こえた! タップ</button><div class="hdnote" id="hdmsg">「はじめる」を おすと、しずかな 時間のあと 小さな音が 少しずつ 大きくなります</div>');
    $('#hdst0').onclick = function () {
      var c = ac(); if (!c) { done('skip', 'この端末では 音が ならせません'); return; }
      started = true; this.style.display = 'none'; $('#hdtap').style.display = ''; $('#hdmsg').textContent = '耳を すませて…';
      var wait = 1800 + rnd(2200), RAMP = 6000; t0 = performance.now(); dbg('djhear', wait);
      T(function () {
        onset = performance.now(); var o = c.createOscillator(), g = c.createGain(), now = c.currentTime;
        o.type = 'sine'; o.frequency.value = 520; g.gain.setValueAtTime(0.0008, now); g.gain.exponentialRampToValueAtTime(0.25, now + RAMP / 1000); o.connect(g); g.connect(c.destination); o.start(now); o.stop(now + RAMP / 1000 + 0.3); X.dj = { o: o, g: g };
        T(function () { if (fin) return; fin = true; done(false, '音が ながれていましたが、タップが ありませんでした'); }, RAMP + 600);
      }, wait);
    };
    $('#hdtap').onclick = function () {
      if (fin || !started) return; fin = true; try { X.dj && X.dj.o.stop(); } catch (e) { /* 無視 */ }
      if (!onset) { done(false, 'まだ 音は ながれていません(早すぎ)'); return; }
      var s = Math.round((performance.now() - onset) / 100) / 10; done(true, '音が ながれて ' + s + '秒で 聞こえました');
    };
  } });
  function rescueScene(extra) {   // 倒れている人のイラスト(絵文字なし)
    return '<svg viewBox="0 0 320 150" class="hdsc" role="img" aria-label="道に人が倒れている絵"><rect width="320" height="150" fill="#e6f3ff"/><rect y="104" width="320" height="46" fill="#8d8d93"/><path d="M0 128H320" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/>' + (extra || '') +
      '<g transform="translate(150 96)"><circle cx="0" cy="0" r="11" fill="#f2c9a0"/><path d="M-9-4 Q0-14 9-4" fill="#3b2f2f"/><rect x="12" y="-8" width="46" height="17" rx="8" fill="#3f7fbf"/><rect x="54" y="-6" width="30" height="7" rx="3" fill="#2d3f5c"/><rect x="54" y="2" width="30" height="7" rx="3" fill="#2d3f5c" transform="rotate(8 54 2)"/><rect x="14" y="8" width="26" height="6" rx="3" fill="#f2c9a0" transform="rotate(20 14 8)"/></g>' +
      '<circle cx="150" cy="56" r="15" fill="#e11d48"/><text x="150" y="64" font-size="22" text-anchor="middle" fill="#fff" font-weight="900">!</text></svg>';
  }
  TYPES.push({ id: 'rescue', cat: '常識', name: '救助問題', run: function (tp) {
    var bad = 0, found = {}, nf = 0, fin = false;
    frame(tp, '<b>人が 倒れている!</b>', rescueScene() + '<div id="hdst2"></div><div class="hdnote" id="hdmsg"></div>');
    function mis(msg) { bad++; $('#hdmsg').innerHTML = '<span style="color:#c0392b;font-weight:800">' + msg + '</span>'; if (bad >= 2 && !fin) { fin = true; done(false, '2回 まちがえました。<br>声をかける → 119番 → 場所を 伝える、の順です'); return true; } return false; }
    function stage(q, opts, why, nextFn) {   // opts[0] が正解
      var idx = shuf(opts.map(function (_, i) { return i; }));
      $('#hdst2').innerHTML = '<div class="hdt">' + q + '</div><div class="hdopt one">' + idx.map(function (i) { return '<button type="button" class="qb" data-r="' + i + '">' + opts[i] + '</button>'; }).join('') + '</div>';
      root.querySelectorAll('[data-r]').forEach(function (b) { b.onclick = function () { if (fin) return; if (+b.dataset.r === 0) { fin2 = true; $('#hdmsg').innerHTML = '<span style="color:#1f7a4d;font-weight:800">正解。' + why + '</span>'; root.querySelectorAll('[data-r]').forEach(function (x) { x.disabled = true; }); nextFn(); } else { if (mis('ちがいます')) return; b.disabled = true; } }; });
    }
    var fin2 = false;
    function s1() { stage('まず どうする?', ['声をかけて 反応を見る', 'ゆすって 起こす', 'その場を 離れる', '水を かける'], '声かけと 反応の確認が 最初です', function () { T(s2, 1100); }); }
    function s2() { $('#hdmsg').textContent = ''; stage('反応が ない。どこに 電話する?', ['119番(救急)', '110番だけ', '町会長', '様子を 見る'], '救急は 119番です', function () { T(s2b, 1100); }); }
    function s2b() { $('#hdmsg').textContent = ''; stage('119番で「事件ですか? 事故ですか?」と 聞かれた', ['わかる 範囲で 答える', '答えずに 切る', 'ウソを 言う', '何も 言わない'], 'わからない ことは「わかりません」で OK', function () { T(s3, 1100); }); }
    function s3() {
      $('#hdmsg').textContent = '';
      $('#hdst2').innerHTML = '<div class="hdt">「場所は どこ?」…住所が わからない!<br><b>場所を 伝える 手がかりを 5つ タップ</b></div>' +
        '<svg viewBox="0 0 320 200" class="hdsc" id="hdrs"><rect width="320" height="200" fill="#e6f3ff"/><rect y="150" width="320" height="50" fill="#8d8d93"/><path d="M0 175H320" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/>' +
        '<g data-h="1" data-n="お店の看板"><rect x="6" y="40" width="96" height="110" fill="#f5deb3"/><rect x="12" y="46" width="84" height="22" fill="#b71c1c"/><text x="54" y="62" font-size="12" text-anchor="middle" fill="#fff" font-weight="800">はまだ食堂</text><rect x="6" y="40" width="96" height="110" fill="transparent"/></g>' +
        '<g data-h="1" data-n="電柱の住所表示"><rect x="120" y="30" width="9" height="125" fill="#8d6e63"/><rect x="108" y="48" width="34" height="24" fill="#fff" stroke="#1565c0" stroke-width="2"/><text x="125" y="58" font-size="6.5" text-anchor="middle" fill="#1565c0" font-weight="800">杉並区</text><text x="125" y="67" font-size="6.5" text-anchor="middle" fill="#1565c0" font-weight="800">浜田山3</text><rect x="104" y="40" width="42" height="36" fill="transparent"/></g>' +
        '<g data-h="1" data-n="塀の住所表示"><rect x="150" y="105" width="52" height="46" fill="#cfd8dc"/><rect x="156" y="112" width="40" height="22" fill="#fff" stroke="#2e7d32" stroke-width="2"/><text x="176" y="127" font-size="10" text-anchor="middle" fill="#2e7d32" font-weight="900">3-1-8</text><rect x="150" y="105" width="52" height="46" fill="transparent"/></g>' +
        '<g data-h="1" data-n="交差点の名前"><rect x="224" y="20" width="6" height="132" fill="#607d8b"/><rect x="196" y="22" width="62" height="18" fill="#1565c0"/><text x="227" y="35" font-size="9" text-anchor="middle" fill="#fff" font-weight="800">浜田山駅前</text><rect x="194" y="18" width="66" height="26" fill="transparent"/></g>' +
        '<g data-h="1" data-n="バス停の名前"><rect x="286" y="70" width="5" height="82" fill="#455a64"/><circle cx="288" cy="64" r="16" fill="#fff" stroke="#e65100" stroke-width="3"/><text x="288" y="68" font-size="9" text-anchor="middle" fill="#e65100" font-weight="900">バス</text><circle cx="288" cy="64" r="20" fill="transparent"/></g>' +
        '<g data-h="0" data-n="木"><rect x="166" y="80" width="6" height="26" fill="#6d4c41"/><circle cx="169" cy="72" r="18" fill="#43a047"/><circle cx="169" cy="72" r="22" fill="transparent"/></g>' +
        '<g data-h="0" data-n="雲"><ellipse cx="40" cy="22" rx="22" ry="9" fill="#fff"/><ellipse cx="54" cy="16" rx="14" ry="8" fill="#fff"/><rect x="16" y="6" width="50" height="28" fill="transparent"/></g>' +
        '<g data-h="0" data-n="車"><rect x="226" y="132" width="44" height="14" rx="4" fill="#c62828"/><rect x="236" y="122" width="24" height="12" rx="3" fill="#ef9a9a"/><circle cx="236" cy="148" r="5" fill="#222"/><circle cx="260" cy="148" r="5" fill="#222"/><rect x="222" y="118" width="52" height="34" fill="transparent"/></g>' +
        '<g transform="translate(60 182) scale(.55)"><circle cx="0" cy="0" r="11" fill="#f2c9a0"/><rect x="12" y="-8" width="46" height="17" rx="8" fill="#3f7fbf"/><rect x="54" y="-6" width="30" height="7" rx="3" fill="#2d3f5c"/></g></svg><div class="hdnote" id="hdfd">見つけた数: 0 / 5</div>';
      var done5 = false;
      root.querySelectorAll('#hdrs g[data-h]').forEach(function (g) { g.style.cursor = 'pointer'; g.onclick = function () {
        if (fin || done5) return; var nm = g.getAttribute('data-n');
        if (g.getAttribute('data-h') === '1') { if (found[nm]) return; found[nm] = 1; nf++; g.style.filter = 'drop-shadow(0 0 4px #f2b705)'; $('#hdfd').textContent = '見つけた数: ' + nf + ' / 5(' + Object.keys(found).join('・') + ')'; dbg('rescue', nf);
          if (nf >= 5) { done5 = true; fin = true; done(bad < 2, '電柱・塀・交差点・バス停・お店の看板が 手がかりです。<br>「○○の前です」と 伝えられます'); } }
        else { if (mis(nm + 'は ちがいます。名前や 住所が 書いてある ものを')) return; }
      }; });
    }
    s1();
  } });

  /* ===== しんこう ===== */
  function hold(stage, ctl) { var h = window.HmtHundred && window.HmtHundred.hold; try { return typeof h === 'function' ? !!h(stage, ctl) : false; } catch (e) { return false; } }
  function next() {
    G.busy = false; var tp = G.list[G.n]; if (!tp) { finish(); return; } tp.run(tp);
  }
  function rankOf(m) { return m >= 100 ? ['🏆', '泥棒から 100万円を 完全に 死守しました!<br>1円も 失いませんでした'] : m >= 70 ? ['🥇', '泥棒から ほとんど 死守しました!'] : m >= 40 ? ['🥈', 'ギリギリ 死守しました…'] : m > 0 ? ['🥉', '泥棒に かなり 持っていかれました…'] : ['😱', '泥棒に 100万円を ぜんぶ 持っていかれました…'] };
  function finish() {
    try { finish2(); } catch (e) {
      var m = G ? G.money : 0; clearAll();
      A.draw('<div class="hdh"><div class="hdm">' + m + '万円</div><div class="hdq">おしまい</div></div><div class="qc hdres"><b class="big">のこり ' + m + '万円</b><div style="line-height:1.7">' + (m >= 70 ? '100万円を ほとんど 守りきりました!' : m >= 40 ? 'なんとか 守りました' : '多くを うばわれました') + '</div></div><button type="button" class="qb pri" id="hdagain">もういちど あそぶ</button><button type="button" class="qb" id="hdhome">GAMEへ もどる</button>');
      root.setAttribute('data-hd', tok); $('#hdagain').onclick = begin; $('#hdhome').onclick = function () { tok = ''; A.hub(); };
    }
  }
  function finish2() {
    clearAll(); var d = load(), r = rankOf(G.money), newBest = !d.best || G.money > d.best;
    d.best = Math.max(d.best || 0, G.money); d.played = (d.played || 0) + 1; save(d);
    var xp = 5 + Math.round(G.money / 20), evo = 0; try { evo = A.addXp(xp); A.Store.save(); } catch (e) { /* 無視 */ }
    A.draw('<div class="hdh"><div class="hdm">💴 ' + G.money + '万円</div><div class="hdq">おしまい</div></div><div class="qc hdres"><div style="font-size:3.4em">' + r[0] + '</div><b class="big">のこり ' + G.money + '万円</b><div style="line-height:1.7">' + r[1] + '<br>せいかい ' + G.right + ' / ' + G.total + '問' + (newBest ? '<br><b style="color:#e0a300">★ じこベスト こうしん!</b>' : '<br>じこベスト ' + d.best + '万円') + '</div></div><div class="qfb ok"><b>+' + xp + ' 経験値</b>' + (evo ? '<br>🎊 あいぼうが しんかした!' : '') + '</div><button type="button" class="qb pri" id="hdagain">もういちど あそぶ</button><button type="button" class="qb" id="hdhome">GAMEへ もどる</button>');
    root.setAttribute('data-hd', tok);
    $('#hdagain').onclick = begin; $('#hdhome').onclick = function () { tok = ''; A.hub(); };
  }
  function begin() {
    tok = 'hd' + Date.now(); clearAll();
    var guided = false; try { guided = typeof window.HmtHundred.hold === 'function'; } catch (e) { guided = false; }   // ガイド中は、音のテストをとばす
    if (guided) return build(true);
    hearTest(function (ok) { build(ok); });
  }
  function build(hear) {
    var pool = TYPES.filter(function (t) { return hear || t.cat !== '聴覚'; });
    // 体感・視覚・聴覚・記憶が、かたよらないように
    var cats = ['体感', '視覚', '聴覚', '記憶', '常識', '頭脳'], list = [];
    cats.forEach(function (c) { var l = shuf(pool.filter(function (t) { return t.cat === c; })); if (l[0]) list.push(l[0]); });
    var rest = shuf(pool.filter(function (t) { return list.indexOf(t) < 0; })); while (list.length < 10 && rest.length) list.push(rest.shift());
    G = { n: 0, total: Math.min(10, list.length), money: 100, right: 0, list: shuf(list), hear: hear };
    if (hold('first', { go: next, hub: function () { tok = ''; A.hub(); } })) return;   // ガイド用: 1問目の前で止める
    next();
  }
  function start(api) {
    A = api; root = A.root();
    if (!document.getElementById('qhdcss')) { var s = document.createElement('style'); s.id = 'qhdcss'; s.textContent = CSS; document.head.appendChild(s); }
    var d = load();
    tok = 'hd' + Date.now();
    A.draw('<div class="qc" style="padding:0;overflow:hidden;border-radius:16px"><img src="hundred-top.jpg?v=1" alt="100万円を死守しろ!" style="display:block;width:100%;height:auto" onerror="this.style.display=\'none\'"></div><div class="qc" style="text-align:center;line-height:1.9"><div style="font-weight:800">あなたが持つ100万円</div><div>クイズに不正解だと<br><b>10万ずつ</b>泥棒に盗まれます</div><div>さあ、最後に残るお金はいくらかな?</div><div style="font-size:1.25em;font-weight:900;color:#c0392b;margin-top:6px">100万円を死守しろ!</div>' + (d.best ? '<div class="qm" style="margin-top:8px">じこベスト: ' + d.best + '万円(' + (d.played || 0) + '回)</div>' : '') + '</div><button type="button" class="qb pri" id="hdstart">スタート</button><button type="button" class="qb" id="hdback">もどる</button>');
    root.setAttribute('data-hd', tok);
    try { A.call('hundred_top').then(function (r) { var im = r && r.url ? root.querySelector('img') : null; if (im && alive()) { im.style.display = 'block'; im.onerror = function () { this.style.display = 'none'; }; im.src = r.url; } }, function () { /* 管理画面の画像が取れなくても、そのまま遊べます */ }); } catch (e) { /* 無視 */ }
    $('#hdstart').onclick = begin; $('#hdback').onclick = function () { tok = ''; A.hub(); };
  }
  function only(id) { tok = 'hd' + Date.now(); clearAll(); var tp = TYPES.filter(function (t) { return t.id === id; })[0]; G = { n: 0, total: 2, money: 100, right: 0, list: [tp, tp] }; next(); }
  window.HmtHundred = { start: start, _t: { TYPES: TYPES, rankOf: rankOf, only: only, SHAPES: SHAPES, KEYS: KEYS } };
})();
