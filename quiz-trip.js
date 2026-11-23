/* 日本旅すごろく(quiz.js から呼ばれます)
   都道府県を相棒と渡り歩き、マスで クイズ・人生イベント。バトルは最下位に「1本ハゲのおじさん」が乗ります。
   ※ 遊び方のアイデアは「すごろく型ボードゲーム」から。キャラクターや絵は すべてオリジナルです。 */
(function () {
  'use strict';
  var A, D, G, TRIPCSS = '#qz .tbd{height:330px;overflow-y:auto;border:2px solid #e4ddcf;border-radius:16px;background:#fbf8ef;margin:0 0 12px}#qz .tbd svg{display:block;width:100%;height:auto}' +
    '#qz .tdice{font-size:2.4em;display:inline-block;min-width:1.3em;text-align:center}@keyframes tdr{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}#qz .tdice.roll{animation:tdr .35s linear infinite}' +
    '#qz .tlog{font-size:.88em;color:#4a5160;min-height:2.6em}#qz .trk{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}#qz .trk span{padding:2px 10px;border-radius:99px;background:#fff;border:2px solid var(--pc);font-weight:700;font-size:.85em}' +
    '#qz .tev{text-align:center}#qz .tev .big{font-size:4em;line-height:1.2}@keyframes tbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}#qz .tbob{animation:tbob 1s ease-in-out infinite}' +
    '#qz .ttok{transition:transform .22s ease-out}@media (prefers-reduced-motion:reduce){#qz .tdice.roll,#qz .tbob{animation:none}#qz .ttok{transition:none}}';
  var N = 47, COLS = 6, CW = 56, RH = 62;
  var KINDS = ['goto', 'quiz', 'event', 'goto', 'quiz', 'lucky', 'event', 'goto', 'quiz', 'trouble', 'goto', 'event'];
  var KCOL = { goto: '#ffe9a8', quiz: '#cfe8ff', event: '#ffd0e0', lucky: '#d4f5d4', trouble: '#e0d4f5' };
  var KICON = { quiz: '❓', event: '🎁', lucky: '⭐', trouble: '⚡' };
  var CPU = [{ name: 'モコ', c: '#f2a65a', p: .55 }, { name: 'ピポ', c: '#7aa7e8', p: .65 }, { name: 'ガブ', c: '#c98ad8', p: .45 }];
  var TOTAL = 12, ME_COL = '#4fb7a1';

  function K(a, b) { return A.K(a, b); }
  function kindOf(i) { return KINDS[i % 12]; }
  function ageOf(t) { return Math.round(t / (TOTAL - 1) * 65); }
  function phaseOf(age) { return age < 6 ? 0 : age < 13 ? 1 : age < 19 ? 2 : age < 25 ? 3 : age < 46 ? 4 : 5; }
  function pxy(i) { var r = Math.floor(i / COLS), c = i % COLS; if (r % 2) c = COLS - 1 - c; return [12 + c * CW + CW / 2 - 3, 10 + r * RH + 23]; }

  /* ===== 絵 ===== */
  function ojiSVG(size) {   // 1本ハゲのおじさん(オリジナル)
    return '<svg viewBox="0 0 80 84" width="' + size + '" height="' + size * 84 / 80 + '" role="img" aria-label="1本ハゲのおじさん"><rect x="12" y="58" width="56" height="26" rx="10" fill="#5b6b8a"/><path d="M40 60l-6 22h12z" fill="#e8e8f0"/><path d="M40 62l-3 5l3 12l3 -12z" fill="#c0392b"/><circle cx="40" cy="34" r="22" fill="#f2c9a0" stroke="#c99a6e" stroke-width="1.5"/><path d="M40 12q-2 -8 4 -10" stroke="#3b2a1d" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M27 29l8 -2M53 29l-8 -2" stroke="#6b4a32" stroke-width="2.2" stroke-linecap="round"/><circle cx="32" cy="34" r="2.4" fill="#222"/><circle cx="48" cy="34" r="2.4" fill="#222"/><circle cx="40" cy="41" r="4" fill="#e9a98a"/><path d="M30 47q10 -5 20 0q-4 4 -10 3q-6 1 -10 -3z" fill="#7a5a3a"/><path d="M34 52q6 4 12 0" stroke="#7a3b2a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 30q-2 6 0 8M60 30q2 6 0 8" stroke="#c99a6e" stroke-width="2" fill="none"/></svg>';
  }
  function tokenG(p, id) {
    var eye = '<circle cx="-4.5" cy="-1" r="1.8" fill="#222"/><circle cx="4.5" cy="-1" r="1.8" fill="#222"/>';
    var body = '<ellipse cx="0" cy="2" rx="12" ry="11" fill="' + p.c + '" stroke="#fff" stroke-width="2"/>' + eye + '<path d="M-3 5q3 3 6 0" stroke="#222" stroke-width="1.5" fill="none"/>';
    var extra = p.me ? '<path d="M0 -9q-5 -1 -7 -5q6 -1 7 5zM0 -9q5 -1 7 -5q-6 -1 -7 5z" fill="#4fae5a"/>' : '<circle cx="-8" cy="-8" r="3" fill="' + p.c + '"/><circle cx="8" cy="-8" r="3" fill="' + p.c + '"/>';
    return '<g class="ttok" id="tk' + id + '"><g class="tbob" style="transform-box:fill-box">' + body + extra + '</g><g id="oj' + id + '" style="display:none" transform="translate(-13,-30) scale(.34)">' + ojiInner() + '</g><text y="22" font-size="8" text-anchor="middle" fill="#333" font-weight="700">' + A.esc(p.name) + '</text></g>';
  }
  function ojiInner() { return ojiSVG(80).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, ''); }
  function boardSVG() {
    var H = 8 * RH + 14, o = [], pts = [];
    for (var i = 0; i < N; i++) pts.push(pxy(i).join(','));
    o.push('<polyline points="' + pts.join(' ') + '" fill="none" stroke="#d9cfb8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>');
    for (i = 0; i < N; i++) {
      var p = pxy(i), k = kindOf(i), pr = D.prefs[i];
      o.push('<g><rect x="' + (p[0] - 25) + '" y="' + (p[1] - 23) + '" width="50" height="46" rx="9" fill="' + KCOL[k] + '" stroke="#b8ac8f" stroke-width="1.5"/><text x="' + (p[0] - 20) + '" y="' + (p[1] - 10) + '" font-size="11">' + (k === 'goto' ? pr.e : KICON[k]) + '</text><text x="' + p[0] + '" y="' + (p[1] + 18) + '" font-size="12" text-anchor="middle" font-weight="700" fill="#2b2f3a">' + A.esc(pr.n) + '</text>' + (i === 0 ? '<text x="' + (p[0] + 12) + '" y="' + (p[1] - 10) + '" font-size="10">🏁</text>' : '') + '</g>');
    }
    G.players.forEach(function (pl, j) { o.push(tokenG(pl, j)); });
    return '<svg viewBox="0 0 360 ' + H + '" role="img" aria-label="日本の すごろく ばん">' + o.join('') + '</svg>';
  }

  /* ===== 状態 ===== */
  function me() { return G.players[0]; }
  function ranks() { return G.players.map(function (p, i) { return i; }).sort(function (a, b) { return G.players[b].money - G.players[a].money; }); }
  function lastIdx() { var r = ranks(); return r[r.length - 1]; }
  function setTok(j) {
    var p = G.players[j], el = A.root().querySelector('#tk' + j); if (!el) return;
    var xy = pxy(p.pos), off = j * 0;   // 同じマスでも ずらす
    var same = G.players.filter(function (q, k) { return k < j && q.pos === p.pos; }).length;
    el.style.transform = 'translate(' + (xy[0] + (same % 2 ? 9 : -9) * (same ? 1 : 0)) + 'px,' + (xy[1] - 2 + (same > 1 ? 8 : 0)) + 'px)';
    if (j === 0) { var bd = A.root().querySelector('.tbd'); if (bd) { var t = xy[1] * (bd.scrollHeight / (8 * RH + 14)) - bd.clientHeight / 2; bd.scrollTop = Math.max(0, t); } }
  }
  function showOji() {
    var li = (G.round >= 2 || G.over) ? lastIdx() : -1;
    G.players.forEach(function (p, j) { var o = A.root().querySelector('#oj' + j); if (o) o.style.display = (G.mode === 'battle' && j === li) ? '' : 'none'; });
  }
  function statusHtml() {
    var m = me(), age = ageOf(G.round);
    return '<div class="qc" style="padding:10px 14px"><div class="qhead" style="margin:0"><b>🗾 ' + K('第', 'だい') + (G.round + 1) + K('章', 'しょう') + ' / ' + TOTAL + ' ・ ' + age + K('歳', 'さい') + '</b><b>💰 ' + m.money + K('万円', 'まんえん') + '</b></div></div>';
  }
  function rankHtml() {
    return '<div class="trk">' + ranks().map(function (i, k) { var p = G.players[i]; return '<span style="--pc:' + p.c + '">' + (k + 1) + '位 ' + A.esc(p.name) + ' ' + p.money + '</span>'; }).join('') + '</div>';
  }
  function logHtml() { return G.log.slice(-3).map(function (l) { return '<div>' + A.esc(l) + '</div>'; }).join(''); }

  /* ===== はじまり ===== */
  function start(api) {
    A = api; D = A.data;
    if (!document.getElementById('qztripcss')) { var s = document.createElement('style'); s.id = 'qztripcss'; s.textContent = TRIPCSS; document.head.appendChild(s); }
    var s0 = A.st();
    A.draw('<div class="qc tev"><div class="big">🗾</div><h2>' + K('日本旅すごろく', 'にほん たび すごろく') + '</h2><p style="margin:0">' + K('あいぼうと 北海道から 沖縄まで 都道府県を 渡り歩こう! マスに 止まると クイズや 人生イベントが 起きるよ。', 'あいぼうと ほっかいどうから おきなわまで たびを しよう! マスで クイズや できごとが おきるよ。') + '</p></div>' +
      '<button class="qb pri" data-m="battle">⚔️ ' + K('バトルモード(コンピューター3人と)', 'バトル(3にんと たたかう)') + '</button><div class="qm" style="margin:-4px 0 12px">' + K('最下位には 1本ハゲの おじさんが 乗っかります…!', 'いちばん したの ひとに はげの おじさんが のっかるよ…!') + '</div>' +
      '<button class="qb" data-m="solo">🚶 ' + K('ひとり旅(目標 300万円)', 'ひとりたび(もくひょう 300まんえん)') + '</button><button class="qb sm" id="tback">' + K('もどる', 'もどる') + '</button>');
    A.bind('[data-m]', function (b) { init(b.dataset.m); });
    A.root().querySelector('#tback').onclick = A.home;
  }
  function init(mode) {
    var st = A.st(), r = A.rng(Date.now());
    G = { mode: mode, round: 0, over: false, log: [], used: {}, usedEv: {}, r: r, qUsed: [],
      players: [{ name: st.name || 'あなた', c: ME_COL, money: 100, pos: 0, me: true }] };
    if (mode === 'battle') CPU.forEach(function (c) { G.players.push({ name: c.name, c: c.c, money: 100, pos: 0, p: c.p }); });
    birth();
  }
  function birth() {   // 最初のイベント「誕生」
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
  }
  function setLog(t) { G.log.push(t); var el = A.root().querySelector('#tlog'); if (el) el.innerHTML = logHtml(); }
  function rollDice(cb) {
    var el = A.root().querySelector('#tdice'), faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'], n = 0, v = 1 + Math.floor(G.r() * 6);
    if (el) el.classList.add('roll');
    var iv = setInterval(function () { n++; if (el) el.textContent = faces[Math.floor(Math.random() * 6)]; if (n >= 7) { clearInterval(iv); if (el) { el.classList.remove('roll'); el.textContent = faces[v - 1]; } setTimeout(function () { cb(v); }, 250); } }, 70);
  }
  function hop(j, steps, cb) {
    var p = G.players[j];
    (function one(i) {
      if (i >= steps) return setTimeout(cb, 150);
      p.pos = (p.pos + 1) % N;
      if (p.pos === 0) { p.money += 10; setLog('🏁 ' + p.name + ' スタートを 通過 +10'); }
      setTok(j); setTimeout(function () { one(i + 1); }, 230);
    })(0);
  }
  function rollMe() {
    var b = A.root().querySelector('#troll'); if (b) b.disabled = true;
    rollDice(function (v) { hop(0, v, function () { landMe(); }); });
  }

  /* ===== マスの結果 ===== */
  function pickQuestion(genre, i) {
    var st = A.st();
    if (genre === 'ご当地') { var pn = D.prefs[i].n, q = D.questions.filter(function (x) { return x.g === 'ご当地' && x.a === pn; })[0]; if (q) return q; }
    var pool = A.poolFor(st.level, genre && genre !== 'ご当地' ? [genre] : [], 10).filter(function (x) { return x.g !== 'ご当地' && G.qUsed.indexOf(x.id) < 0; });
    if (!pool.length) { G.qUsed = []; pool = A.poolFor(st.level, [], 10).filter(function (x) { return x.g !== 'ご当地'; }); }
    return A.shuffle(pool, G.r)[0];
  }
  function ask(q, head, ok, ng, after) {
    G.qUsed.push(q.id);
    A.ask(q, { r: A.rng(Date.now() + q.id), sec: A.LV_SEC[A.st().level], head: statusHtml() + head, nextLabel: K('次へ', 'つぎへ'),
      onAnswer: function (good) {
        var gain = good ? ok : ng; me().money += gain;
        if (good) A.giveCard(q, A.rng(Date.now() + q.id));
        A.addXp(good ? 3 : 1); A.Store.save();
        var fb = A.root().querySelector('#qfb'); if (fb) fb.insertAdjacentHTML('afterbegin', '<div class="qfb ' + (gain >= 0 ? 'ok' : 'ng') + '"><b>' + (good ? ok.msg : ng.msg) + '</b> ' + (gain >= 0 ? '+' : '') + gain + K('万円', 'まんえん') + '</div>');
      }, next: after });
  }
  function landMe() {
    var i = me().pos, k = kindOf(i), pr = D.prefs[i], head = '<div class="qc" style="padding:10px 14px"><b>' + pr.e + ' ' + A.esc(pr.n) + '</b> <span class="qm">' + K('名物:', 'めいぶつ:') + A.esc(pr.s) + '</span></div>';
    var done = function () { cpuTurns(); };
    function wrap(good, bad) { return function (ok) { }; }
    if (k === 'goto') { var q = pickQuestion('ご当地', i); askGain(q, head, 30, 0, 'ご当地クイズ 正解!', 'おしい! 名物を おぼえよう', done); }
    else if (k === 'quiz') { var q2 = pickQuestion(null, i); askGain(q2, head, 20, -10, 'ナイス!', 'ざんねん…', done); }
    else if (k === 'event') eventMe(head, done);
    else if (k === 'lucky') info('⭐', K('ラッキー!', 'ラッキー!'), pr.n + ' で 名産品を おまけして もらった!', 20, done);
    else info('⚡', K('ハプニング', 'ハプニング'), pr.n + ' で ゲリラ豪雨に あって 傘を 買った…', -10, done);
  }
  function askGain(q, head, g, b, gm, bm, after) { ask(q, head, { valueOf: function () { return g; }, msg: gm }, { valueOf: function () { return b; }, msg: bm }, after); }
  function info(icon, title, text, gain, after) {
    me().money += gain; A.draw(statusHtml() + '<div class="qc tev"><div class="big">' + icon + '</div><h2>' + title + '</h2><p>' + A.esc(text) + '</p><div class="qfb ' + (gain >= 0 ? 'ok' : 'ng') + '"><b>' + (gain >= 0 ? '+' : '') + gain + K('万円', 'まんえん') + '</b></div></div><button class="qb pri" id="tnx">' + K('次へ', 'つぎへ') + '</button>');
    A.root().querySelector('#tnx').onclick = after;
  }
  function pickEvent(age) {
    var ph = phaseOf(age), pool = D.events.filter(function (e) { return e.n !== '誕生' && e.ph.indexOf(ph) >= 0; });
    var fresh = pool.filter(function (e) { return !G.usedEv[e.n]; }); if (fresh.length) pool = fresh;
    var e = A.shuffle(pool, G.r)[0]; G.usedEv[e.n] = 1; return e;
  }
  function eventMe(head, after) {
    var ev = pickEvent(ageOf(G.round));
    A.draw(statusHtml() + '<div class="qc tev"><span class="qtag">' + K('人生イベント', 'じんせい イベント') + ' ・ ' + ageOf(G.round) + K('歳', 'さい') + '</span><div class="big tbob">' + ev.i + '</div><h2>' + A.esc(ev.n) + '</h2><p>' + A.T(ev.t) + '</p><div class="qm">' + K('クイズに 正解すると いい 結果に!', 'せいかいすると いい けっかに!') + '</div></div><button class="qb pri" id="tch">' + K('チャレンジ!', 'チャレンジ!') + '</button>');
    A.root().querySelector('#tch').onclick = function () {
      var q = pickQuestion(ev.g, me().pos);
      ask(q, '<div class="qc" style="padding:10px 14px"><b>' + ev.i + ' ' + A.esc(ev.n) + '</b></div>', { valueOf: function () { return ev.gp; }, msg: '🎉 ' + ev.good }, { valueOf: function () { return ev.bp; }, msg: '💦 ' + ev.bad }, after);
    };
  }

  /* ===== コンピューターの番 ===== */
  function cpuTurns() {
    if (G.mode !== 'battle') return endRound();
    board(); var bt = A.root().querySelector('#troll'); if (bt) { bt.disabled = true; bt.textContent = K('みんなの 番…', 'みんなの ばん…'); } var j = 1;
    (function nextCpu() {
      if (j >= G.players.length) return setTimeout(endRound, 400);
      var jj = j++, p = G.players[jj];
      rollDice(function (v) { hop(jj, v, function () {
        var i = p.pos, k = kindOf(i), pr = D.prefs[i], ok = G.r() < p.p, g = 0, t = '';
        if (k === 'goto') { g = ok ? 30 : 0; t = pr.n + ' ご当地クイズ' + (ok ? '正解' : 'おしい'); }
        else if (k === 'quiz') { g = ok ? 20 : -10; t = pr.n + ' クイズ' + (ok ? '正解' : 'ざんねん'); }
        else if (k === 'event') { var ev = pickEvent(ageOf(G.round)); g = ok ? ev.gp : ev.bp; t = ev.i + ev.n + (ok ? ' うまくいった' : ' たいへん'); }
        else if (k === 'lucky') { g = 20; t = pr.n + ' ラッキー'; } else { g = -10; t = pr.n + ' ハプニング'; }
        p.money += g; setLog(p.name + ': ' + t + ' ' + (g >= 0 ? '+' : '') + g);
        var rk = A.root().querySelector('.trk'); if (rk) rk.outerHTML = rankHtml(); showOji(); setTimeout(nextCpu, 600);
      }); });
    })();
  }
  function endRound() {
    G.round++;
    if (G.round >= TOTAL) return finish();
    board();
  }

  /* ===== おしまい ===== */
  function finish() {
    if (G.over) return;
    G.over = true;
    var st = A.st(), m = me(), r = ranks(), myRank = r.indexOf(0) + 1, li = r[r.length - 1];
    var oji = G.mode === 'battle' ? li : (m.money < 300 ? 0 : -1);
    var xp = 15 + (G.mode === 'battle' && myRank === 1 ? 10 : 0) + (G.mode === 'solo' && m.money >= 300 ? 10 : 0);
    var evo = A.addXp(xp); st.trip = st.trip || { played: 0, best: 0 }; st.trip.played++; st.trip.best = Math.max(st.trip.best, m.money); A.Store.save();
    var rows = r.map(function (i, k) { var p = G.players[i]; return '<div class="qhead" style="margin:0 0 6px"><b>' + (k + 1) + '位 ' + A.esc(p.name) + (i === oji ? ' 👴' : '') + '</b><span>' + p.money + K('万円', 'まんえん') + '</span></div>'; }).join('');
    var tail = G.mode === 'battle' ? (oji === 0 ? K('あなたが 最下位…。1本ハゲの おじさんが 乗っかりました!', 'さいかい…。はげの おじさんが のっかった!') : A.esc(G.players[oji].name) + K(' が 最下位。おじさんが 乗っかりました!', ' に おじさんが のっかった!'))
      : (oji === 0 ? K('目標 300万円に 届かず、おじさんが 乗っかりました…', 'もくひょうに とどかず おじさんが のっかった…') : K('目標 300万円 達成! おじさんは 来ませんでした', 'もくひょう たっせい! おじさんは こなかったよ'));
    A.draw('<div class="qc tev"><h2>' + K('旅の けっか', 'たびの けっか') + '</h2><div style="font-size:1.4em;font-weight:700">' + (G.mode === 'battle' ? myRank + K('位', 'い') : m.money + K('万円', 'まんえん')) + '</div>' +
      (oji >= 0 ? '<div class="tbob" style="display:inline-block;margin:8px">' + ojiSVG(110) + '</div>' : '<div style="font-size:3em">🎉</div>') + '<div class="qbub">' + tail + '</div></div><div class="qc">' + rows + '</div>' +
      '<div class="qfb ok"><b>+' + xp + ' ' + K('経験値', 'けいけんち') + '</b>' + (evo ? '<br>🎊 あいぼうが しんかした!' : '') + '</div><button class="qb pri" id="tagain">' + K('もういちど あそぶ', 'もういちど') + '</button><button class="qb" id="thome">' + K('ホームへ', 'ホームへ') + '</button>');
    A.root().querySelector('#tagain').onclick = function () { start(A); }; A.root().querySelector('#thome').onclick = A.home;
  }

  window.HmtQuizTrip = { start: start };
})();
