/* 町会クイズ:へや(4けたの番号でべつのスマホとあそぶ)と「あたまおしり」 */
(function () {
  'use strict';
  var A = null, WORDS = null;
  function $(s) { return A.root().querySelector(s); }
  function esc(s) { return A.esc(s); }

  /* ===================== へや(通信) ===================== */
  function makeRoom(view) {
    var R = { code: '', my: 0, players: [], cfg: {}, ver: 0, state: {}, max: 2, game: '', _t: null, _cb: null, _busy: false, _lastChange: Date.now() };
    R.apply = function (v) {
      R.code = v.code; R.my = v.my; R.cfg = v.cfg || {}; R.ver = v.ver; R.state = v.state || {}; R.max = v.max; R.game = v.game;
      R.players = (v.players || []).map(function (p) { return p.name; }); R._lastChange = Date.now();
    };
    R.set = function (state) {
      return A.call('room_set', { code: R.code, expect: R.ver, state: state }).then(function (r) {
        if (r && r.conflict) { R.apply(r); if (R._cb) R._cb(R); return false; }
        R.ver = r.ver; R.state = state; R._lastChange = Date.now(); return true;
      });
    };
    R.watch = function (cb) {
      R.stop(); R._cb = cb;
      R._t = setInterval(function () {
        if (R._busy) return; R._busy = true;
        A.call('room_get', { code: R.code, ver: R.ver }).then(function (v) {
          R._busy = false; if (!R._cb) return;
          if (v && v.same) return;
          R.apply(v); R._cb(R);
        }, function (e) { R._busy = false; if (R._cb && e && /へや|メンバー/.test(e.message || '')) R._cb(R, e); });
      }, 2000);
    };
    R.stop = function () { if (R._t) { clearInterval(R._t); R._t = null; } R._cb = null; };
    R.leave = function () { R.stop(); A.call('room_leave', { code: R.code }).catch(function () {}); };
    R.apply(view); return R;
  }

  function lobby(a, spec) {
    A = a;
    function entry() {
      A.draw('<h2 class="hph">べつのスマホと あそぶ</h2><div class="card hpq"><div class="hpl" style="margin-top:0">へやを つくる</div><button type="button" class="hmg wide" id="rmk" style="margin:0">へやを つくる</button><p class="small" style="margin:8px 0 0">4けたの番号が できます。ともだちに 番号を おしえてね。(' + esc(spec.cfgText || '') + ')</p></div>' +
        '<div class="card hpq"><div class="hpl" style="margin-top:0">番号を いれて はいる</div><input id="rcode" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="1234" aria-label="へやの番号(4けた)" style="width:100%;box-sizing:border-box;min-height:56px;font-size:1.8em;text-align:center;letter-spacing:.3em;padding:8px;border:2px solid #cfc7b4;border-radius:12px;margin-bottom:10px"><button type="button" class="hmg wide alt" id="rjoin" style="margin:0">はいる</button></div>' +
        '<button class="qb" id="rback">← もどる</button>');
      $('#rback').onclick = spec.back;
      $('#rmk').onclick = function () {
        this.disabled = true;
        A.call('room_create', { game: spec.game, max: spec.max, cfg: spec.cfg }).then(function (v) { show(makeRoom(v)); }, function (e) { A.toast(e.message || 'つくれませんでした'); entry(); });
      };
      $('#rjoin').onclick = function () {
        var c = ($('#rcode').value || '').replace(/\D/g, '');
        if (c.length !== 4) return A.toast('4けたの番号を いれてね');
        this.disabled = true;
        A.call('room_join', { code: c }).then(function (v) {
          if (v.game !== spec.game) { A.toast('べつの ゲームの へやです'); A.call('room_leave', { code: c }); return entry(); }
          show(makeRoom(v));
        }, function (e) { A.toast(e.message || 'はいれませんでした'); entry(); });
      };
    }
    function show(R) {
      var token = 'lb' + Date.now(), started = false;
      function alive() { return A.root() && A.root().getAttribute('data-rm') === token && document.body.contains(A.root()); }
      function paint() {
        var host = R.my === 0, st = R.state || {};
        if (st.phase === 'play' && !started) { started = true; R.stop(); return spec.onStart(R); }
        var n = R.players.length, can = host && n >= spec.min;
        A.draw('<h2 class="hph">' + esc(spec.title) + ' ・ へや</h2><div class="card" style="text-align:center"><div class="qm">この番号を ともだちに おしえてね</div><div style="font-size:3.4em;font-weight:800;letter-spacing:.18em;margin:4px 0">' + esc(R.code) + '</div><div class="qm">' + esc(R.cfg && spec.cfgTextFor ? spec.cfgTextFor(R.cfg) : (spec.cfgText || '')) + '</div></div>' +
          '<div class="card"><b>はいっている人(' + n + '/' + R.max + ')</b>' + R.players.map(function (p, i) { return '<div style="padding:6px 0;border-bottom:1px solid #eee">' + (i + 1) + '. ' + esc(p) + (i === R.my ? '(あなた)' : '') + (i === 0 ? ' ・ ホスト' : '') + '</div>'; }).join('') + '</div>' +
          (host ? '<button class="qb pri" id="rstart"' + (can ? '' : ' disabled') + '>' + (can ? 'はじめる' : 'ともだちを まっています…') + '</button>' : '<div class="qfb ok">ホストが はじめるのを まっています…</div>') +
          '<button class="qb" id="rleave">やめる</button>');
        A.root().setAttribute('data-rm', token);
        $('#rleave').onclick = function () { R.leave(); started = true; spec.back(); };
        var b = $('#rstart'); if (b) b.onclick = function () {
          b.disabled = true; var s0 = spec.init(R);
          R.set(s0).then(function (ok) { if (ok) { started = true; R.stop(); spec.onStart(R); } else paint(); }, function (e) { A.toast(e.message || 'はじめられませんでした'); paint(); });
        };
      }
      paint();
      R.watch(function (r, err) {
        if (!alive() || started) return;
        if (err) { R.stop(); A.toast('へやが きえました'); return spec.back(); }
        paint();
      });
    }
    entry();
  }

  /* ===================== あたまおしり ===================== */
  // レベル1〜5: 制限時間・お題の数・文字数
  var ALV = [
    { sec: 30, themes: ['どうぶつ', 'たべもの'], min: 2, giveup: .3, hard: 0 },
    { sec: 25, themes: ['どうぶつ', 'たべもの', 'のりもの'], min: 2, giveup: .2, hard: .2 },
    { sec: 20, themes: ['どうぶつ', 'たべもの', 'のりもの', 'くらしのどうぐ'], min: 2, giveup: .12, hard: .4 },
    { sec: 15, themes: ['どうぶつ', 'たべもの', 'のりもの', 'くらしのどうぐ', 'しぜん'], min: 3, giveup: .06, hard: .7 },
    { sec: 10, themes: ['どうぶつ', 'たべもの', 'のりもの', 'くらしのどうぐ', 'しぜん', 'ばしょ'], min: 3, giveup: .02, hard: .95 }
  ];
  function hira(s) { return String(s || '').replace(/\s+/g, '').replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); }); }
  var SMALL = { 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お', 'っ': 'つ', 'ゎ': 'わ' };
  function lastCh(w) { w = hira(w).replace(/ー+$/, ''); var c = w.charAt(w.length - 1); return SMALL[c] || c; }
  function firstCh(w) { return hira(w).charAt(0); }
  function base(c) { return String(c || '').normalize('NFD').charAt(0); }   // 「は・ば・ぱ」は おなじ あつかい
  function same(a, b) { return base(a) === base(b); }
  function themeOf(k) { for (var i = 0; i < WORDS.themes.length; i++) if (WORDS.themes[i].k === k) return WORDS.themes[i]; return null; }
  function themeName(k) { var t = themeOf(k); return t ? t.n : k; }
  function loadWords(cb) {
    if (WORDS) return cb();
    fetch('quiz-words.json?v=1', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) { WORDS = d; cb(); }, function () { A.toast('ことばを よみこめませんでした'); A.hub(); });
  }
  function pickTheme(lv) { var l = ALV[lv].themes; return l[Math.floor(Math.random() * l.length)]; }
  function wordsOf(theme) { var t = themeOf(theme); return t ? t.w : []; }
  function startWord(theme, lv) {
    var all = wordsOf(theme), cnt = {}; all.forEach(function (w) { var c = base(firstCh(w)); cnt[c] = (cnt[c] || 0) + 1; });
    var c = all.filter(function (w) { return lastCh(w) !== 'ん' && w.length >= ALV[lv].min && (cnt[base(lastCh(w))] || 0) >= 3; });
    return c[Math.floor(Math.random() * c.length)];
  }
  function whichTheme(w) { for (var i = 0; i < WORDS.themes.length; i++) if (WORDS.themes[i].w.indexOf(w) >= 0) return WORDS.themes[i].k; return ''; }
  // ひとことの チェック。fatal=true なら そのまま まけ
  function checkWord(raw, S) {
    var w = hira(raw);
    if (!w) return { err: 'ことばを いれてね' };
    if (!/^[ぁ-んー]+$/.test(w)) return { err: 'ひらがなで いれてね' };
    if (w.length < ALV[S.lv].min) return { err: ALV[S.lv].min + '文字いじょうの ことばに してね' };
    if (S.need && !same(firstCh(w), S.need)) return { err: '「' + S.need + '」から はじまる ことばに してね' };
    if (S.used.indexOf(w) >= 0) return { err: 'それは もう つかったよ' };
    var th = whichTheme(w); if (th && th !== S.theme && wordsOf(S.theme).indexOf(w) < 0) return { err: 'おだい「' + themeName(S.theme) + '」の ことばに してね' };
    if (lastCh(w) === 'ん') return { w: w, fatal: '「ん」で おわったので まけ!' };
    return { w: w };
  }
  function cpuPick(S) {
    var L = ALV[S.lv], list = wordsOf(S.theme).filter(function (w) { return S.used.indexOf(w) < 0 && same(firstCh(w), S.need) && lastCh(w) !== 'ん' && w.length >= L.min; });
    if (!list.length) return '';
    if (Math.random() < L.giveup) return '';
    // 上のレベルほど、つぎの人が こまる(その字から はじまる ことばが すくない)ことばを えらぶ
    var cnt = {}; wordsOf(S.theme).forEach(function (w) { var c = base(firstCh(w)); cnt[c] = (cnt[c] || 0) + 1; });
    if (Math.random() < L.hard) { list.sort(function (a, b) { return (cnt[base(lastCh(a))] || 0) - (cnt[base(lastCh(b))] || 0); }); return list[Math.floor(Math.random() * Math.min(3, list.length))]; }
    return list[Math.floor(Math.random() * list.length)];
  }
  function newState(names, types, lv, first) {
    var th = pickTheme(lv), w = startWord(th, lv);
    return { phase: 'play', lv: lv, theme: th, names: names, types: types, turn: first || 0, chain: [[-1, w]], used: [w], need: lastCh(w), over: false, loser: -1, why: '', n: 0 };
  }

  function atamaMenu(a) {
    A = a;
    A.draw('<h2 class="hph">あたまおしり</h2><div class="card hpq"><div class="hpl" style="margin-top:0">あそびかた</div><p class="small" style="margin:0">おだいの ことばを、まえの ことばの <b>おしり</b>の 字から はじめて つなぎます。(りんご → ごりら → らっぱ …)<br>「ん」で おわると まけ。おなじ ことばは つかえません。じかんぎれも まけ。(は・ば・ぱ は おなじ あつかい)</p></div>' +
      '<div class="card hpq"><div class="hpl" style="margin-top:0">だれと あそぶ?</div><button type="button" class="hmg wide" id="asolo" style="margin:0 0 10px">ひとりプレイ</button><button type="button" class="hmg wide alt" id="amany" style="margin:0">2人以上プレイ</button></div><button class="qb" id="aback">← GAMEの メニュー</button>');
    $('#asolo').onclick = function () { level('cpu'); }; $('#amany').onclick = where; $('#aback').onclick = A.hub;
  }
  function where() {
    A.draw('<h2 class="hph">2人以上プレイ</h2><div class="card hpq"><button type="button" class="hmg wide" id="asame" style="margin:0 0 10px">同じスマホで(貸し借り)</button><button type="button" class="hmg wide alt" id="anet" style="margin:0">べつのスマホと(4けたの番号)</button></div><button class="qb" id="aback">← もどる</button>');
    $('#asame').onclick = function () { people(); }; $('#anet').onclick = function () { level('net'); }; $('#aback').onclick = function () { atamaMenu(A); };
  }
  function people() {
    A.draw('<h2 class="hph">なん人で あそぶ?</h2><div class="card hpq">' + [2, 3, 4].map(function (n) { return '<button type="button" class="hmg wide" data-n="' + n + '" style="margin:0 0 10px">' + n + '人</button>'; }).join('') + '</div><button class="qb" id="aback">← もどる</button>');
    A.bind('[data-n]', function (b) { level('local', +b.dataset.n); }); $('#aback').onclick = where;
  }
  function alvLabel(i) { var L = ALV[i]; return 'レベル' + (i + 1) + ' ・ ' + L.sec + '秒 ・ おだい' + L.themes.length + 'しゅるい' + (L.min > 2 ? ' ・ ' + L.min + '文字いじょう' : ''); }
  function intro(lv, mode, n) {
    var L = ALV[lv];
    A.draw('<h2 class="hph">レベル' + (lv + 1) + '</h2><div class="card"><p style="margin:0;line-height:1.9">このレベルは、1回 <b>' + L.sec + '秒</b>です。<br>おだいは <b>' + L.themes.length + 'しゅるい</b>' + (L.min > 2 ? '。<b>' + L.min + '文字いじょう</b>の ことば' : '') + 'です。</p></div><button class="qb pri" id="ago2">' + (mode === 'net' ? 'つぎへ' : 'はじめる') + '</button><button class="qb" id="aback">← もどる</button>');
    $('#aback').onclick = function () { level(mode, n); };
    $('#ago2').onclick = function () {
      if (mode === 'net') return lobby(A, netSpec(lv));
      if (mode === 'cpu') return run({ mode: 'cpu', S: newState(['あなた', 'コンピューター'], ['h', 'c'], lv, 0) });
      var names = []; for (var k = 0; k < n; k++) names.push((k + 1) + '人目');
      run({ mode: 'local', S: newState(names, names.map(function () { return 'h'; }), lv, 0) });
    };
  }
  function netSpec(lv) {
    return { game: 'atama', title: 'あたまおしり', cfg: { lv: lv }, min: 2, max: 6, cfgText: alvLabel(lv), cfgTextFor: function (c) { return alvLabel(c.lv || 0); }, back: function () { level('net'); },
      init: function (R) { var lv2 = R.cfg.lv || 0; return newState(R.players.slice(), R.players.map(function () { return 'h'; }), lv2, 0); },
      onStart: function (R) { run({ mode: 'net', R: R }); } };
  }
  function level(mode, n) {
    A.draw('<h2 class="hph">レベルを えらぶ</h2><div class="card hpq">' + ALV.map(function (L, i) { return '<button type="button" class="hmg wide' + (i >= 3 ? ' alt' : '') + '" data-lv="' + i + '" style="margin:0 0 10px">レベル' + (i + 1) + '</button>'; }).join('') + '</div>' + (mode === 'net' ? '<button class="qb" id="ajoin">ともだちの へやに はいる(番号を いれる)</button>' : '') + '<button class="qb" id="aback">← もどる</button>');
    var aj = $('#ajoin'); if (aj) aj.onclick = function () { lobby(A, netSpec(0)); };
    A.bind('[data-lv]', function (b) { intro(+b.dataset.lv, mode, n); });
    $('#aback').onclick = mode === 'cpu' ? function () { atamaMenu(A); } : (mode === 'net' ? where : people);
  }

  function run(o) {
    var R = o.R, S = R ? R.state : o.S, token = 'at' + Date.now(), tm = null, t0 = Date.now(), msg = '', seenVer = R ? R.ver : -1, nowTurn = -1;
    function alive() { return A.root() && A.root().getAttribute('data-rm') === token && document.body.contains(A.root()); }
    function stopAll() { if (tm) { clearInterval(tm); tm = null; } if (R) R.stop(); }
    function mineTurn() { return o.mode === 'net' ? S.turn === R.my : S.types[S.turn] === 'h'; }
    function who(i) { return o.mode === 'net' && i === R.my ? S.names[i] + '(あなた)' : S.names[i]; }
    function paint(keep) {
      var cur = S.names[S.turn], L = ALV[S.lv];
      var hist = S.chain.slice(-6).map(function (c) { return '<span style="display:inline-block;margin:3px 2px;padding:4px 10px;border-radius:99px;background:' + (c[0] < 0 ? '#e8e2d4' : '#fff') + ';border:2px solid #cfc7b4;font-weight:700">' + esc(c[1]) + (c[0] >= 0 ? '<small style="font-weight:400;color:#6b7280"> ' + esc(S.names[c[0]]) + '</small>' : '') + '</span>'; }).join(' → ');
      var body;
      if (S.over) {
        body = '<div class="qc tev"><h2>' + esc(S.names[S.loser]) + ' の まけ!</h2><p style="margin:0">' + esc(S.why) + '</p><div class="qm">つなげた ことば: ' + (S.chain.length - 1) + 'こ</div></div>' +
          '<button class="qb pri" id="aagain">もう一回</button>';
      } else {
        var m = mineTurn();
        body = '<div class="card" style="text-align:center"><div style="font-size:1.1em;font-weight:700">' + (o.mode === 'local' ? esc(cur) + ' の番' : (m ? 'あなたの 番' : esc(cur) + ' の番を まっています…')) + '</div>' +
          '<div style="margin:8px 0">つぎは 「<b style="font-size:1.6em;color:#d64545">' + esc(S.need) + '</b>」 から はじまる ことば</div>' +
          '<div style="height:8px;border-radius:99px;background:#ece6d8;overflow:hidden"><i id="atb" style="display:block;height:100%;width:0;background:#e0a300"></i></div>' +
          (m ? '<input id="aw" type="text" autocomplete="off" autocapitalize="off" placeholder="ひらがなで いれてね" aria-label="ことば" style="width:100%;box-sizing:border-box;min-height:56px;font-size:1.3em;padding:8px 12px;border:2px solid #cfc7b4;border-radius:12px;margin:12px 0 8px"><button class="qb pri" id="ago" style="margin:0">これで きまり</button><div id="amsg" style="color:#b04a4a;min-height:1.6em;margin-top:6px">' + esc(msg) + '</div>' : '<div class="qm" style="margin-top:10px">' + (S.types[S.turn] === 'c' ? 'コンピューターが 考え中…' : 'まっています…') + '</div>') + '</div>';
      }
      A.draw('<h2 class="hph">あたまおしり ・ レベル' + (S.lv + 1) + '</h2><div class="card" style="text-align:center"><div class="qm">おだい</div><div style="font-size:1.5em;font-weight:800">' + esc(themeName(S.theme)) + '</div><div class="qm">' + L.sec + '秒 ・ ' + L.min + '文字いじょう' + (o.mode === 'net' ? ' ・ へや ' + esc(R.code) : '') + '</div></div><div class="card" style="line-height:2">' + hist + '</div>' + body + '<button class="qb" id="aend">← おわる</button>');
      A.root().setAttribute('data-rm', token);
      $('#aend').onclick = function () { stopAll(); if (R) R.leave(); atamaMenu(A); };
      var ag = $('#aagain'); if (ag) ag.onclick = again;
      var go = $('#ago'); if (go) { go.onclick = submit; $('#aw').onkeydown = function (e) { if (e.key === 'Enter') submit(); }; if (!keep) { try { $('#aw').focus(); } catch (e) {} } }
    }
    function push() { if (o.mode !== 'net') return Promise.resolve(true); return R.set(S).then(function (ok) { if (!ok) { S = R.state; paint(); arm(); } return ok; }); }
    function lose(i, why) { S.over = true; S.loser = i; S.why = why; push().then(function (ok) { if (ok === false) return; stopTimer(); paint(); }); }
    function stopTimer() { if (tm) { clearInterval(tm); tm = null; } }
    function submit() {
      if (S.over || !mineTurn()) return;
      var inp = $('#aw'); if (!inp) return;
      var r = checkWord(inp.value, S);
      if (r.err) { msg = r.err; var mm = $('#amsg'); if (mm) mm.textContent = msg; return; }
      msg = ''; S.chain.push([S.turn, r.w]); S.used.push(r.w); S.need = lastCh(r.w); S.n++;
      if (r.fatal) return lose(S.turn, r.fatal);
      S.turn = (S.turn + 1) % S.names.length; stepDone();
    }
    function stepDone() {
      push().then(function (ok) { if (ok === false) return; paint(); arm(); cpuMaybe(); });
    }
    function cpuMaybe() {
      if (S.over || S.types[S.turn] !== 'c') return;
      setTimeout(function () {
        if (!alive() || S.over) return;
        var w = cpuPick(S); if (!w) return lose(S.turn, 'ことばが でませんでした');
        S.chain.push([S.turn, w]); S.used.push(w); S.need = lastCh(w); S.n++; S.turn = (S.turn + 1) % S.names.length; paint(); arm();
      }, 900 + Math.random() * 900);
    }
    function arm() {
      stopTimer(); t0 = Date.now(); nowTurn = S.turn; if (S.over) return;
      var sec = ALV[S.lv].sec;
      tm = setInterval(function () {
        if (!alive()) { stopAll(); return; }
        var el = (Date.now() - t0) / 1000, bar = $('#atb'), cpu = S.types[S.turn] === 'c';
        if (!cpu && bar) bar.style.width = Math.min(100, el / sec * 100) + '%';
        if (cpu) return;
        if (mineTurn()) { if (el >= sec) lose(S.turn, 'じかんぎれ'); }
        else if (o.mode === 'net' && el > sec + 8) lose(S.turn, 'じかんぎれ');
      }, 250);
    }
    function again() {
      var n = S.names.length, first = (S.loser + 1) % n;
      S = newState(S.names, S.types, S.lv, o.mode === 'cpu' ? 0 : first); msg = '';
      if (o.mode === 'net') { R.set(S).then(function (ok) { if (!ok) S = R.state; paint(); arm(); }); } else { paint(); arm(); cpuMaybe(); }
    }
    if (R) R.watch(function (r, err) {
      if (!alive()) return; if (err) { stopAll(); A.toast('へやが きえました'); return atamaMenu(A); }
      if (r.ver !== seenVer) { seenVer = r.ver; var turnChanged = r.state.turn !== S.turn || r.state.over !== S.over || r.state.n !== S.n; S = r.state; if (turnChanged || true) { paint(true); arm(); } }
    });
    paint(); arm(); cpuMaybe();
  }

  window.HmtQuizRoom = {
    lobby: lobby,
    atama: function (a) { A = a; loadWords(function () { atamaMenu(a); }); }
  };
})();
