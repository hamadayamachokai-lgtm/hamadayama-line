/* トランプ(quiz.js の GAME メニューから呼ばれます: HmtCards.start(api))
   ババ抜き / 7並べ / ポーカー / 神経衰弱 … ひとり(ロボット対戦) ・ 1台で2〜5人 ・ 友達と対戦(へや。ホストが はじめる)
   ソリティア … ひとりだけ
   ゲームの中身は「状態(state)をうけとって、新しい状態を返す」だけの計算にしてあります(通信の へやでも おなじ計算)。 */
(function () {
  'use strict';
  var A, tm = null;
  var SU = ['♠', '♥', '♦', '♣'], RN = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  function esc(s) { return A.esc(s); }
  function $(s) { return A.root().querySelector(s); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function shuf(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function stopT() { if (tm) { clearTimeout(tm); tm = null; } }
  function rk(c) { return c % 13; }
  function su(c) { return Math.floor(c / 13); }
  function red(c) { return c < 52 && (su(c) === 1 || su(c) === 2); }

  var CSS = '@keyframes cjump{0%,100%{transform:translateY(0)}40%{transform:translateY(-26px)}60%{transform:translateY(-26px)}}@keyframes cshake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px) rotate(-6deg)}40%{transform:translateX(10px) rotate(6deg)}60%{transform:translateX(-8px) rotate(-4deg)}80%{transform:translateX(8px) rotate(4deg)}}' +
    '#qz .cres{text-align:center;padding:18px 10px}#qz .cresc{height:84px;display:flex;justify-content:center;align-items:flex-end}#qz .cresb{font-size:3.4em;font-weight:900;letter-spacing:.08em;line-height:1.2;margin-top:8px}#qz .cres.win .pc{animation:cjump .9s ease-in-out infinite}#qz .cres.lose .pc{animation:cshake .7s ease-in-out infinite}' +
    '#qz .pc{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:44px;height:62px;border-radius:7px;background:#fff;border:2px solid #cfc7b4;font-weight:800;font-size:17px;line-height:1.05;box-sizing:border-box;vertical-align:top;margin:0 2px 4px;padding:0;font-family:inherit;cursor:default;color:#1b2438;position:relative}' +
    '#qz .pc.r{color:#d0312d}#qz .pc.jk{color:#7a2fd0;font-size:11px}#qz .pc.bk{background:repeating-linear-gradient(45deg,#6a4bd6 0 6px,#8f78ec 6px 12px);border-color:#4a3399;color:transparent}' +
    '#qz .pc.md{width:36px;height:50px;font-size:14px}#qz .pc.big{width:60px;height:84px;font-size:22px}#qz .pc.sm{width:28px;height:38px;font-size:11px;margin:0 1px 2px;border-width:1.5px}' +
    '#qz button.pc{cursor:pointer}#qz .pc.sel{transform:translateY(-8px);border-color:#e0a300;box-shadow:0 0 0 2px #e0a300}#qz .pc.dim{opacity:.35}#qz .pc.ok{border-color:#1f7a4d;box-shadow:0 0 0 2px #1f7a4d}#qz .pc.tk{opacity:.18}' +
    '#qz .pcw{margin:0 0 10px}#qz .pcrow{display:flex;align-items:center;gap:6px;margin:0 0 6px;flex-wrap:wrap}#qz .pcn{font-weight:800;min-width:5em}#qz .pcn.turn{color:#6a4bd6}#qz .pcs{background:#f4f1ff;border:2px solid #cfc7f0;border-radius:12px;padding:8px 10px;margin:0 0 10px;font-weight:800;line-height:1.5}' +
    '#qz .pcb{display:grid;grid-template-columns:18px repeat(13,1fr);gap:2px;margin:0 0 4px;align-items:center}#qz .pcb i{font-style:normal;font-weight:800;text-align:center}#qz .pcb b{display:block;text-align:center;font-size:11px;font-weight:800;border-radius:4px;height:26px;line-height:24px;border:1.5px dashed #d8d1bd;color:transparent}#qz .pcb b.on{background:#fff;border:1.5px solid #8a8472;color:#1b2438}#qz .pcb b.on.r{color:#d0312d}' +
    '#qz .pcg{display:grid;gap:5px;margin:8px 0}#qz .pcg .pc{width:100%;height:auto;aspect-ratio:5/7;margin:0}' +
    '#qz .pcsol{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin:0 0 6px}#qz .pcsol .pc{width:100%;height:60px;margin:0;font-size:14px}#qz .pccol{position:relative;min-height:60px}#qz .pccol .pc{position:absolute;left:0;right:0}#qz .pc.ph{background:transparent;border:2px dashed #cfc7b4;color:#b5ad98}' +
    '#qz .pcmode{display:grid;gap:8px;margin:8px 0}#qz .pcmode button{min-height:58px;margin:0;text-align:left;display:block}#qz .pcmode small{display:block;font-weight:500;opacity:.8}#qz .pcin{width:100%;box-sizing:border-box;font-size:1.1em;padding:10px;border:2px solid #cfc7b4;border-radius:12px;margin:0 0 6px;font-family:inherit}' +
    '#qz .pcch{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}#qz .pcch button{margin:0;min-width:48px;min-height:44px}';

  /* ===================== ババ抜き ===================== */
  function dropPairs(h) {
    var by = {}, out = [];
    h.forEach(function (c) { if (c >= 52) return out.push(c); (by[rk(c)] = by[rk(c)] || []).push(c); });
    Object.keys(by).forEach(function (k) { var l = by[k]; if (l.length % 2 === 1) out.push(l[l.length - 1]); });
    return shuf(out);
  }
  function nextAct(S, i) { for (var k = 1; k <= S.n; k++) { var p = (i + k) % S.n; if (S.out.indexOf(p) < 0) return p; } return i; }
  var BABA = {
    id: 'baba', title: 'ババ抜き', hidden: true, min: 2, max: 12, bots: [1, 4],
    init: function (n, names) {
      var d = []; for (var i = 0; i < 53; i++) d.push(i); shuf(d);
      var hand = []; for (i = 0; i < n; i++) hand.push([]); d.forEach(function (c, i) { hand[i % n].push(c); });
      var S = { g: 'baba', phase: 'play', n: n, nm: names, hand: hand.map(dropPairs), out: [], turn: 0, msg: 'ババ(ジョーカー)を さいごまで もっていたら まけ!', over: false };
      S.hand.forEach(function (h, p) { if (!h.length) S.out.push(p); });
      S.turn = S.out.indexOf(0) < 0 ? 0 : nextAct(S, 0); BABA.fin(S); return S;
    },
    fin: function (S) { if (S.n - S.out.length <= 1) { S.over = true; for (var p = 0; p < S.n; p++) if (S.out.indexOf(p) < 0) S.loser = p; } },
    turnOf: function (S) { return S.over ? -1 : S.turn; },
    apply: function (S0, m) {
      var S = clone(S0), i = S.turn, j = nextAct(S, i); if (j === i || S.over) return null;
      var h = S.hand[j]; if (m.k < 0 || m.k >= h.length) return null;
      var c = h.splice(m.k, 1)[0]; S.hand[i].push(c); S.hand[i] = dropPairs(S.hand[i]);
      S.msg = S.nm[i] + 'さんが ' + S.nm[j] + 'さんから 1まい ひきました';
      [j, i].forEach(function (p) { if (!S.hand[p].length && S.out.indexOf(p) < 0) { S.out.push(p); S.msg += ' / ' + S.nm[p] + 'さん あがり!'; } });
      S.turn = nextAct(S, i); BABA.fin(S); return S;
    },
    bot: function (S) { var j = nextAct(S, S.turn); return { k: Math.floor(Math.random() * S.hand[j].length) }; },
    html: function (S, v) {
      var h = '<div class="pcs">' + esc(S.msg) + '</div>', tgt = v >= 0 && S.turn === v && !S.over ? nextAct(S, v) : -1;
      for (var p = 0; p < S.n; p++) {
        if (p === v) continue; var done = S.out.indexOf(p) >= 0;
        h += '<div class="pcrow"><span class="pcn' + (S.turn === p && !S.over ? ' turn' : '') + '">' + esc(S.nm[p]) + (done ? '(あがり)' : '') + '</span><span class="qm">' + S.hand[p].length + 'まい</span></div>';
        if (p === tgt) h += '<div class="pcw">' + S.hand[p].map(function (c, k) { return '<button type="button" class="pc bk" data-k="' + k + '" aria-label="' + (k + 1) + 'まいめを ひく">●</button>'; }).join('') + '</div>';
      }
      if (v >= 0) h += '<div class="pcrow"><span class="pcn' + (S.turn === v && !S.over ? ' turn' : '') + '">' + esc(S.nm[v]) + (v === 0 && S.nm[v] === 'あなた' ? '' : '') + (S.out.indexOf(v) >= 0 ? '(あがり)' : '') + '</span></div><div class="pcw">' + S.hand[v].slice().sort(function (a, b) { return a - b; }).map(function (c) { return cardH(c); }).join('') + '</div>';
      if (!S.over && v >= 0 && S.turn === v) h += '<div class="qm">' + esc(S.nm[tgt]) + 'さんの カードを 1まい えらんで タップ(ひきます)</div>';
      else if (!S.over) h += '<div class="qm">' + esc(S.nm[S.turn]) + 'さんの ばんです…</div>';
      if (S.over) { var lz = v >= 0 && S.loser !== v; h += v >= 0 ? resH(lz ? 'win' : 'lose', lz ? '勝ち' : '負け', 'ババは ' + esc(S.nm[S.loser]) + 'さんでした') : resH('lose', esc(S.nm[S.loser]) + 'さんの 負け', 'ババは ' + esc(S.nm[S.loser]) + 'さんでした'); }
      return h;
    },
    bind: function (S, v, act) { A.bind('[data-k]', function (b) { act({ k: +b.dataset.k }); }); }
  };


  /* しゅうりょう画面: 「勝ち」「負け」だけ大きく。勝ちは カードが ジャンプ、負けは カードが 横ゆれ */
  function resH(kind, big, small) {
    var cs = kind === 'lose' ? [52, 13 * 3 + 1, 13 + 2] : [0 + 13, 12, 24 + 11], col = kind === 'win' ? '#1f7a4d' : kind === 'lose' ? '#c0392b' : '#6a4bd6';
    return '<div class="qc cres ' + kind + '"><div class="cresc">' + cs.map(function (c, i) { return cardH(c, 'md').replace('class="pc', 'style="animation-delay:' + (i * 0.15) + 's" class="pc'); }).join('') + '</div><div class="cresb" style="color:' + col + '">' + big + '</div>' + (small ? '<div class="qm" style="margin-top:6px">' + small + '</div>' : '') + '</div>';
  }
  function cardH(c, cls) {
    if (c >= 52) return '<span class="pc jk ' + (cls || '') + '">JOKER</span>';
    return '<span class="pc ' + (red(c) ? 'r ' : '') + (cls || '') + '">' + RN[rk(c)] + '<span>' + SU[su(c)] + '</span></span>';
  }
  function cardB(c, cls, attrs) {
    if (c >= 52) return '<button type="button" class="pc jk ' + (cls || '') + '" ' + (attrs || '') + '>JOKER</button>';
    return '<button type="button" class="pc ' + (red(c) ? 'r ' : '') + (cls || '') + '" ' + (attrs || '') + '>' + RN[rk(c)] + '<span>' + SU[su(c)] + '</span></button>';
  }

  /* ===================== 7並べ ===================== */
  function playable(S, c) {
    var s = su(c), r = rk(c); if (S.board[s][r]) return false;
    return (r < 6 && S.board[s][r + 1]) || (r > 6 && S.board[s][r - 1]);
  }
  var SEV = {
    id: 'sev', title: '7並べ', hidden: true, min: 2, max: 8, bots: [1, 3],
    init: function (n, names) {
      var d = []; for (var i = 0; i < 52; i++) d.push(i); shuf(d);
      var hand = []; for (i = 0; i < n; i++) hand.push([]); d.forEach(function (c, i) { hand[i % n].push(c); });
      var board = [[], [], [], []]; for (var s = 0; s < 4; s++) for (var r = 0; r < 13; r++) board[s].push(r === 6);
      var turn = 0; hand.forEach(function (h, p) { if (h.indexOf(2 * 13 + 6) >= 0) turn = p; });
      hand = hand.map(function (h) { return h.filter(function (c) { return rk(c) !== 6; }).sort(function (a, b) { return a - b; }); });
      return { g: 'sev', phase: 'play', n: n, nm: names, hand: hand, board: board, turn: turn, pass: names.map(function () { return 0; }), msg: '7から ならべていこう。出せる カードが なければ パス', over: false, win: -1 };
    },
    turnOf: function (S) { return S.over ? -1 : S.turn; },
    apply: function (S0, m) {
      var S = clone(S0), p = S.turn, h = S.hand[p];
      if (m.pass) { if (h.some(function (c) { return playable(S, c); })) return null; S.pass[p]++; S.msg = S.nm[p] + 'さんは パスしました(' + S.pass[p] + '回)'; }
      else {
        var k = h.indexOf(m.play); if (k < 0 || !playable(S, m.play)) return null;
        h.splice(k, 1); S.board[su(m.play)][rk(m.play)] = true; S.msg = S.nm[p] + 'さんが ' + SU[su(m.play)] + RN[rk(m.play)] + ' を だしました';
        if (!h.length) { S.over = true; S.win = p; S.msg = S.nm[p] + 'さんが 先に 出しきりました!'; return S; }
      }
      S.turn = (p + 1) % S.n; return S;
    },
    bot: function (S) {
      var h = S.hand[S.turn].filter(function (c) { return playable(S, c); }); if (!h.length) return { pass: 1 };
      h.sort(function (a, b) { return Math.abs(rk(b) - 6) - Math.abs(rk(a) - 6); }); return { play: Math.random() < .25 ? h[Math.floor(Math.random() * h.length)] : h[0] };
    },
    html: function (S, v) {
      var h = '<div class="pcs">' + esc(S.msg) + '</div>';
      for (var s = 0; s < 4; s++) { h += '<div class="pcb"><i style="color:' + (s === 1 || s === 2 ? '#d0312d' : '#1b2438') + '">' + SU[s] + '</i>'; for (var r = 0; r < 13; r++) h += '<b class="' + (S.board[s][r] ? 'on' : '') + (s === 1 || s === 2 ? ' r' : '') + '">' + RN[r] + '</b>'; h += '</div>'; }
      h += '<div style="margin:8px 0">';
      for (var p = 0; p < S.n; p++) if (p !== v) h += '<div class="pcrow"><span class="pcn' + (S.turn === p && !S.over ? ' turn' : '') + '">' + esc(S.nm[p]) + '</span><span class="qm">のこり ' + S.hand[p].length + 'まい ・ パス ' + S.pass[p] + '回</span></div>';
      h += '</div>';
      if (v >= 0) {
        var my = S.turn === v && !S.over, can = S.hand[v].some(function (c) { return playable(S, c); });
        h += '<div class="pcrow"><span class="pcn' + (my ? ' turn' : '') + '">' + esc(S.nm[v]) + '</span><span class="qm">のこり ' + S.hand[v].length + 'まい ・ パス ' + S.pass[v] + '回</span></div><div class="pcw">' + S.hand[v].map(function (c) { return my && playable(S, c) ? cardB(c, 'md ok', 'data-p="' + c + '"') : cardH(c, 'md' + (my ? ' dim' : '')); }).join('') + '</div>';
        if (my) h += can ? '<div class="qm">ひかっている カードを タップして だします</div>' : '<button type="button" class="qb pri" id="cpass">出せる カードが ない → パスする</button>';
        else if (!S.over) h += '<div class="qm">' + esc(S.nm[S.turn]) + 'さんの ばんです…</div>';
      }
      if (S.over) h += v >= 0 ? resH(S.win === v ? 'win' : 'lose', S.win === v ? '勝ち' : '負け', esc(S.nm[S.win]) + 'さんが 先に 出しきりました') : resH('win', esc(S.nm[S.win]) + 'さんの 勝ち', '');
      return h;
    },
    bind: function (S, v, act) { A.bind('[data-p]', function (b) { act({ play: +b.dataset.p }); }); var b = $('#cpass'); if (b) b.onclick = function () { act({ pass: 1 }); }; }
  };

  /* ===================== 神経衰弱 ===================== */
  var MEMN = { 12: 4, 20: 5, 30: 6 };
  var MEM = {
    id: 'mem', title: '神経衰弱', hidden: false, min: 2, max: 12, bots: [1, 3],
    init: function (n, names, o) {
      var m = (o && o.size) || 20, all = [];
      for (var r = 0; r < 13; r++) { all.push([r, 0]); all.push([r, 1]); }   // おなじ数字・おなじ色(黒 / 赤)で ペア
      shuf(all); var cards = [];
      all.slice(0, m / 2).forEach(function (pr) { var a = pr[1] === 0 ? [r0(pr[0], 0), r0(pr[0], 3)] : [r0(pr[0], 1), r0(pr[0], 2)]; cards.push(a[0], a[1]); });
      shuf(cards);
      return { g: 'mem', phase: 'play', n: n, nm: names, cards: cards, st: cards.map(function () { return 0; }), own: cards.map(function () { return -1; }), f: [], seen: [], turn: 0, score: names.map(function () { return 0; }), pend: '', msg: 'おなじ 数字・おなじ色(黒どうし/赤どうし)を そろえよう', over: false, size: m };
    },
    turnOf: function (S) { return S.over ? -1 : S.turn; },
    apply: function (S0, m) {
      var S = clone(S0), i = m.flip; if (S.pend || S.st[i] !== 0 || S.f.length >= 2) return null;
      S.st[i] = 1; S.f.push(i); if (S.seen.indexOf(i) < 0) S.seen.push(i);
      if (S.f.length === 2) { var a = S.cards[S.f[0]], b = S.cards[S.f[1]]; S.pend = rk(a) === rk(b) && red(a) === red(b) ? 'hit' : 'miss'; S.msg = S.pend === 'hit' ? '👏 そろった!' : 'ざんねん…'; }
      return S;
    },
    resolve: function (S0) {
      var S = clone(S0), p = S.turn; if (!S.pend) return null;
      if (S.pend === 'hit') { S.f.forEach(function (i) { S.st[i] = 2; S.own[i] = p; }); S.score[p]++; S.msg = S.nm[p] + 'さん もういちど!'; if (S.st.every(function (x) { return x === 2; })) { S.over = true; S.msg = 'おしまい!'; } }
      else { S.f.forEach(function (i) { S.st[i] = 0; }); S.turn = (p + 1) % S.n; S.msg = S.nm[S.turn] + 'さんの ばん'; }
      S.f = []; S.pend = ''; return S;
    },
    bot: function (S, lvl) {
      var free = []; S.st.forEach(function (x, i) { if (x === 0) free.push(i); });
      var known = S.seen.filter(function (i) { return S.st[i] === 0 && Math.random() < (lvl || 0.75); });
      function mate(i) { var c = S.cards[i]; for (var k = 0; k < known.length; k++) { var j = known[k]; if (j !== i && S.st[j] === 0 && rk(S.cards[j]) === rk(c) && red(S.cards[j]) === red(c)) return j; } return -1; }
      if (S.f.length === 0) {
        for (var q = 0; q < known.length; q++) { var j = mate(known[q]); if (j >= 0) return { flip: known[q] }; }
        var un = free.filter(function (i) { return S.seen.indexOf(i) < 0; }); var pool = un.length ? un : free; return { flip: pool[Math.floor(Math.random() * pool.length)] };
      }
      var m = mate(S.f[0]); if (m >= 0) return { flip: m };
      var un2 = free.filter(function (i) { return S.seen.indexOf(i) < 0 && i !== S.f[0]; }); var pool2 = un2.length ? un2 : free.filter(function (i) { return i !== S.f[0]; });
      return { flip: pool2[Math.floor(Math.random() * pool2.length)] };
    },
    html: function (S, v) {
      var cols = MEMN[S.size] || 5, my = v >= 0 && S.turn === v && !S.over && !S.pend;
      var h = '<div class="pcs">' + esc(S.msg) + '</div><div class="pcrow">' + S.nm.map(function (n, p) { return '<span class="pcn' + (S.turn === p && !S.over ? ' turn' : '') + '">' + esc(n) + ' ' + S.score[p] + '組</span>'; }).join('') + '</div>';
      h += '<div class="pcg" style="grid-template-columns:repeat(' + cols + ',1fr)">' + S.cards.map(function (c, i) {
        if (S.st[i] === 2) return cardH(c, 'tk');
        if (S.st[i] === 1) return cardH(c, 'sel');
        return my ? '<button type="button" class="pc bk" data-f="' + i + '" aria-label="カードを めくる">●</button>' : '<span class="pc bk">●</span>';
      }).join('') + '</div>';
      if (S.over) { var mx = Math.max.apply(null, S.score), w = []; S.nm.forEach(function (n, p) { if (S.score[p] === mx) w.push(p); }); var sm = S.nm.map(function (n, p) { return esc(n) + ' ' + S.score[p] + '組'; }).join(' ・ '); h += v >= 0 ? (w.length > 1 && w.indexOf(v) >= 0 ? resH('draw', 'ひきわけ', sm) : resH(w.indexOf(v) >= 0 ? 'win' : 'lose', w.indexOf(v) >= 0 ? '勝ち' : '負け', sm)) : resH(w.length > 1 ? 'draw' : 'win', w.length > 1 ? 'ひきわけ' : esc(S.nm[w[0]]) + 'さんの 勝ち', sm); }
      else if (my) h += '<div class="qm">めくる カードを タップ(2まい)</div>';
      return h;
    },
    bind: function (S, v, act) { A.bind('[data-f]', function (b) { act({ flip: +b.dataset.f }); }); }
  };
  function r0(r, s) { return s * 13 + r; }

  /* ===================== ポーカー(5まい・こうかん1回) ===================== */
  var HN = ['ブタ(役なし)', 'ワンペア', 'ツーペア', 'スリーカード', 'ストレート', 'フラッシュ', 'フルハウス', 'フォーカード', 'ストレートフラッシュ'];
  function evalH(h) {
    var v = h.map(function (c) { return rk(c) === 0 ? 14 : rk(c) + 1; }).sort(function (a, b) { return b - a; }), fl = h.every(function (c) { return su(c) === su(h[0]); }), cnt = {};
    v.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; });
    var g = Object.keys(cnt).map(function (k) { return [cnt[k], +k]; }).sort(function (a, b) { return b[0] - a[0] || b[1] - a[1]; }), tb = g.map(function (x) { return x[1]; });
    var st = false, hi = 0; if (g.length === 5) { if (v[0] - v[4] === 4) { st = true; hi = v[0]; } else if (v.join() === '14,5,4,3,2') { st = true; hi = 5; } }
    var cat = 0; if (st && fl) cat = 8; else if (g[0][0] === 4) cat = 7; else if (g[0][0] === 3 && g[1] && g[1][0] === 2) cat = 6; else if (fl) cat = 5; else if (st) cat = 4; else if (g[0][0] === 3) cat = 3; else if (g[0][0] === 2 && g[1] && g[1][0] === 2) cat = 2; else if (g[0][0] === 2) cat = 1;
    return [cat].concat(st ? [hi] : tb);
  }
  function cmpH(a, b) { for (var i = 0; i < Math.max(a.length, b.length); i++) { var d = (a[i] || 0) - (b[i] || 0); if (d) return d; } return 0; }
  var PK = {
    id: 'pk', title: 'ポーカー', hidden: true, min: 2, max: 5, bots: [1, 4],
    init: function (n, names) {
      var d = []; for (var i = 0; i < 52; i++) d.push(i); shuf(d); var hand = []; for (i = 0; i < n; i++) hand.push(d.splice(0, 5));
      return { g: 'pk', phase: 'play', n: n, nm: names, hand: hand, deck: d, done: names.map(function () { return false; }), turn: 0, msg: '要らない カードを えらんで こうかん(1回だけ)。いい役を つくろう', over: false };
    },
    turnOf: function (S) { return S.over ? -1 : S.turn; },
    apply: function (S0, m) {
      var S = clone(S0), p = S.turn, sel = (m.draw || []).filter(function (k, i, a) { return k >= 0 && k < 5 && a.indexOf(k) === i; });
      sel.forEach(function (k) { S.hand[p][k] = S.deck.pop(); }); S.done[p] = true; S.msg = S.nm[p] + 'さんは ' + (sel.length ? sel.length + 'まい こうかんしました' : 'このまま にしました');
      if (p + 1 >= S.n) {
        S.over = true; S.ev = S.hand.map(evalH); var best = S.ev.reduce(function (b, e) { return cmpH(e, b) > 0 ? e : b; }, S.ev[0]); S.win = []; S.ev.forEach(function (e, i) { if (cmpH(e, best) === 0) S.win.push(i); }); S.msg = 'しょうぶ!';
      } else S.turn = p + 1;
      return S;
    },
    bot: function (S) {
      var h = S.hand[S.turn], e = evalH(h), keep = []; if (e[0] >= 4) return { draw: [] };
      var cnt = {}; h.forEach(function (c) { cnt[rk(c)] = (cnt[rk(c)] || 0) + 1; });
      h.forEach(function (c, i) { if (cnt[rk(c)] >= 2) keep.push(i); });
      if (!keep.length) { var s = h.map(function (c, i) { return i; }).sort(function (a, b) { var ra = rk(h[a]) || 13, rb = rk(h[b]) || 13; return rb - ra; }); keep = s.slice(0, 2); }
      var dr = []; for (var i = 0; i < 5; i++) if (keep.indexOf(i) < 0) dr.push(i); return { draw: dr };
    },
    html: function (S, v, sel) {
      var h = '<div class="pcs">' + esc(S.msg) + '</div>';
      for (var p = 0; p < S.n; p++) {
        if (p === v && !S.over) continue;
        h += '<div class="pcrow"><span class="pcn' + (S.turn === p && !S.over ? ' turn' : '') + '">' + (S.over && S.win.indexOf(p) >= 0 ? '👑' : '') + esc(S.nm[p]) + '</span><span class="qm">' + (S.over ? HN[S.ev[p][0]] : (S.done[p] ? 'きまりました' : 'まだ')) + '</span></div>' + (S.over ? '<div class="pcw">' + S.hand[p].map(function (c) { return cardH(c, 'md'); }).join('') + '</div>' : '');
      }
      if (!S.over && v >= 0) {
        var my = S.turn === v;
        h += '<div class="pcrow"><span class="pcn' + (my ? ' turn' : '') + '">' + esc(S.nm[v]) + '</span><span class="qm">いまの 役: ' + HN[evalH(S.hand[v])[0]] + '</span></div><div class="pcw">' + S.hand[v].map(function (c, k) { return my ? cardB(c, (sel.indexOf(k) >= 0 ? 'sel' : ''), 'data-x="' + k + '"') : cardH(c); }).join('') + '</div>';
        h += my ? '<div class="qm">かえたい カードを タップ(上に あがります)</div><button type="button" class="qb pri" id="cpk">' + (sel.length ? sel.length + 'まい こうかんする' : 'このまま きめる') + '</button>' : '<div class="qm">' + esc(S.nm[S.turn]) + 'さんの ばんです…</div>';
      }
      if (S.over) { var pw = S.win.indexOf(v) >= 0, hn = HN[S.ev[S.win[0]][0]]; h += v >= 0 ? (S.win.length > 1 && pw ? resH('draw', 'ひきわけ', hn) : resH(pw ? 'win' : 'lose', pw ? '勝ち' : '負け', esc(S.nm[S.win[0]]) + 'さんの ' + hn)) : resH('win', S.win.map(function (p) { return esc(S.nm[p]); }).join('・') + 'さんの 勝ち', hn); }
      return h;
    },
    bind: function (S, v, act, ui) { A.bind('[data-x]', function (b) { var k = +b.dataset.x, i = ui.sel.indexOf(k); if (i >= 0) ui.sel.splice(i, 1); else ui.sel.push(k); ui.repaint(); }); var b = $('#cpk'); if (b) b.onclick = function () { var d = ui.sel.slice(); ui.sel.length = 0; act({ draw: d }); }; }
  };


  /* ===================== スピード(2人。じゅんばんは なし。はやく 手札を なくした人の かち) ===================== */
  function adj(a, b) { var d = (rk(a) - rk(b) + 13) % 13; return d === 1 || d === 12; }
  function spdLegal(S, c) { var r = []; for (var i = 0; i < 2; i++) if (adj(c, S.ctr[i][S.ctr[i].length - 1])) r.push(i); return r; }
  function spdStuck(S) { for (var p = 0; p < 2; p++) for (var k = 0; k < S.hand[p].length; k++) if (spdLegal(S, S.hand[p][k]).length) return false; return true; }
  var SPD = {
    id: 'spd', title: 'スピード', hidden: false, rt: true, min: 2, max: 2, bots: [1, 1],
    init: function (n, names) {
      var d = []; for (var i = 0; i < 52; i++) d.push(i); shuf(d);
      var S = { g: 'spd', phase: 'play', n: 2, nm: names.slice(0, 2), hand: [d.splice(0, 4), d.splice(0, 4)], draw: [d.splice(0, 21), d.splice(0, 21)], ctr: [[d.pop()], [d.pop()]], msg: 'どちらの 山にも、数字が ±1(A と K も つながる)の カードを はやく 出そう!', over: false, win: -1 };
      return S;
    },
    turnOf: function (S) { return S.over ? -1 : 0; },
    apply: function (S0, m) {
      var S = clone(S0); if (S.over) return null;
      if (m.flip) {
        if (!spdStuck(S)) return null;
        if (!S.draw[0].length && !S.draw[1].length) {   // どちらも 山札が ない: のこりが すくない ほうの かち
          var a = S.hand[0].length, b = S.hand[1].length; S.over = true; S.win = a === b ? -2 : (a < b ? 0 : 1); S.msg = 'どちらも 出せません。のこりの まいすうで きまり!'; return S;
        }
        for (var p = 0; p < 2; p++) if (S.draw[p].length) S.ctr[p].push(S.draw[p].pop());
        S.msg = 'つまったので、山札を 1まい めくりました'; return S;
      }
      var p = m.p, c = S.hand[p][m.play]; if (c === undefined) return null;
      var piles = spdLegal(S, c); if (!piles.length) return null;
      var pile = m.pile !== undefined && piles.indexOf(m.pile) >= 0 ? m.pile : piles[0];
      S.ctr[pile].push(c); S.hand[p].splice(m.play, 1); if (S.draw[p].length) S.hand[p].push(S.draw[p].pop());
      if (!S.hand[p].length) { S.over = true; S.win = p; S.msg = S.nm[p] + 'さんが 手札を なくしました!'; }
      else S.msg = S.nm[p] + 'さんが 出しました';
      return S;
    },
    bot: function (S) {
      var opts = []; S.hand[1].forEach(function (c, k) { var l = spdLegal(S, c); if (l.length) opts.push({ p: 1, play: k, pile: l[Math.floor(Math.random() * l.length)] }); });
      if (opts.length) return opts[Math.floor(Math.random() * opts.length)];
      return spdStuck(S) ? { flip: 1 } : null;
    },
    html: function (S, v) {
      var both = v < 0, me = both ? 0 : v, op = 1 - me, h = '<div class="pcs">' + esc(S.msg) + '</div>';
      function row(p, flipped) {
        var cards = S.hand[p].map(function (c, k) { return S.over ? cardH(c, 'md') : (both || p === me ? cardB(c, 'md' + (spdLegal(S, c).length ? ' ok' : ''), 'data-s="' + p + '|' + k + '"') : '<span class="pc md bk">●</span>'); }).join('');
        return '<div' + (flipped ? ' style="transform:rotate(180deg)"' : '') + '><div class="pcrow"><span class="pcn">' + esc(S.nm[p]) + '</span><span class="qm">山札 ' + S.draw[p].length + 'まい</span></div><div class="pcw" style="text-align:center">' + cards + '</div></div>';
      }
      h += row(op, both);
      h += '<div class="pcrow" style="justify-content:center;gap:14px;margin:8px 0">' + S.ctr.map(function (pl) { return '<div>' + cardH(pl[pl.length - 1], 'big') + '</div>'; }).join('') + '</div>';
      if (!S.over) h += '<button type="button" class="qb' + (spdStuck(S) ? ' pri' : '') + '" id="spf"' + (spdStuck(S) ? '' : ' disabled') + '>' + (spdStuck(S) ? 'つまった! 山札を めくる' : 'どちらも 出せない ときに めくります') + '</button>';
      h += row(me, false);
      if (S.over) h += S.win === -2 ? resH('draw', 'ひきわけ', '') : (v >= 0 ? resH(S.win === v ? 'win' : 'lose', S.win === v ? '勝ち' : '負け', '') : resH('win', esc(S.nm[S.win]) + 'さんの 勝ち', ''));
      return h;
    },
    bind: function (S, v, act) {
      A.bind('[data-s]', function (b) { var p = b.dataset.s.split('|'); act({ p: +p[0], play: +p[1] }); });
      var f = $('#spf'); if (f) f.onclick = function () { act({ flip: 1 }); };
    }
  };

  var GAMES = { baba: BABA, sev: SEV, mem: MEM, pk: PK, spd: SPD };

  /* ===================== 対戦の 進行役(ひとり / 1台 / へや 共通) ===================== */
  function run(G, cfg) {
    stopT();
    var mode = cfg.mode, R = cfg.R || null, S = mode === 'net' ? R.state : G.init(cfg.names.length, cfg.names, cfg.opts), ready = -1, ui = { sel: [], repaint: null }, lastTurn = -2, pendVer = -1, token = 'cg' + Date.now(), over = false;
    function alive() { return A.root() && A.root().getAttribute('data-cg') === token && document.body.contains(A.root()); }
    function isBot(p) { return mode === 'solo' && p > 0; }
    function viewer() { if (mode === 'net') return R.my; if (mode === 'solo') return 0; return G.rt ? -1 : (S.over ? -1 : G.turnOf(S)); }
    function commit(n) {
      if (!n) return;
      if (mode === 'net') { n.phase = 'play'; R.set(n).then(function (ok) { S = R.state; paint(); }, function (e) { A.toast(e.message || 'つうしんできませんでした'); }); }
      else { S = n; paint(); }
    }
    function act(m) { var n = G.apply(S, m); if (n) commit(n); else if (!G.rt) A.toast('そこには だせません'); else paint(); }
    function paint() {
      if (!alive() && over) return; stopT();
      var t = G.turnOf(S), v = viewer(), me = mode === 'net' ? R.my : t;
      if (mode === 'pass' && G.hidden && t >= 0 && ready !== t) {   // 1台: 手番が かわったら、わたして もらってから 見せる
        A.draw('<h2 class="hph">' + esc(G.title) + '</h2><div class="qc" style="text-align:center"><div style="font-size:1.3em;font-weight:800;margin:6px 0">' + esc(S.nm[t]) + 'さんの ばんです</div><div class="qm">スマホを ' + esc(S.nm[t]) + 'さんに わたしてください。ほかの人は 見ないでね。</div><button type="button" class="qb pri" id="cgok" style="margin-top:12px">' + esc(S.nm[t]) + 'です。見る</button></div><button type="button" class="qb" id="cgq">やめる</button>');
        A.root().setAttribute('data-cg', token); $('#cgok').onclick = function () { ready = t; paint(); }; $('#cgq').onclick = quit; return;
      }
      if (t !== lastTurn) { ui.sel.length = 0; lastTurn = t; }
      var canAct = t >= 0 && (G.rt ? true : (mode === 'net' ? t === R.my : (mode === 'solo' ? t === 0 : true)));
      ui.repaint = paint;
      A.draw('<h2 class="hph">' + esc(G.title) + (mode === 'net' ? ' ・ へや' + esc(R.code) : '') + '</h2><div class="pcw">' + G.html(S, v, ui.sel) + '</div>' +
        (S.over ? '<button type="button" class="qb pri" id="cgagain">' + (mode === 'net' ? 'おわる' : 'もう1回') + '</button><button type="button" class="qb" id="cgq">メニューに もどる</button>' : '<button type="button" class="qb" id="cgq">やめる</button>'));
      A.root().setAttribute('data-cg', token);
      $('#cgq').onclick = quit; var ag = $('#cgagain'); if (ag) ag.onclick = function () { if (mode === 'net') quit(); else { cfg.again(); } };
      if (S.over) { over = true; return; }
      if (canAct && !S.pend) G.bind(S, v, act, ui);
      // 神経衰弱の「判定」: めくった2まいを 見せてから、手番の人(ロボットなら この端末)が すすめる
      if (S.pend && G.resolve && (mode !== 'net' || S.turn === R.my) && pendVer !== (mode === 'net' ? R.ver : -2)) {
        pendVer = mode === 'net' ? R.ver : -2; tm = setTimeout(function () { if (alive()) { pendVer = -1; commit(G.resolve(S)); } }, 1400); return;
      }
      if (G.rt && mode === 'solo') { tm = setTimeout(function () { if (!alive() || S.over) return; var m = G.bot(S); var n = m ? G.apply(S, m) : null; if (n) commit(n); else paint(); }, 1000 + Math.random() * 900); return; }
      if (isBot(t) && !S.pend) tm = setTimeout(function () { if (alive()) commit(G.apply(S, G.bot(S, cfg.lvl))); }, 900 + Math.random() * 500);
    }
    function quit() { stopT(); over = true; if (mode === 'net') { R.stop(); R.leave(); } A.root().removeAttribute('data-cg'); cfg.back(); }
    if (mode === 'net') { if (G.rt) R.every = 800; R.watch(function (r, err) { if (err) { R.stop(); A.toast('へやが きえました'); return cfg.back(); } S = R.state; if (alive()) paint(); }); }
    paint();
  }

  /* ===================== メニュー ===================== */
  function hub() {
    stopT();
    A.draw('<h2 class="hph">トランプ</h2><div class="card hpq"><div class="pcmode">' +
      '<button type="button" class="hmg wide" data-g="baba">🃏 ババ抜き<small>ジョーカーを 持っていたら まけ</small></button>' +
      '<button type="button" class="hmg wide" data-g="sev">7️⃣ 7並べ<small>7から つなげて 先に 出しきろう</small></button>' +
      '<button type="button" class="hmg wide" data-g="pk">♠ ポーカー<small>5まい。1回 こうかんして 役で しょうぶ</small></button>' +
      '<button type="button" class="hmg wide" data-g="mem">🎴 神経衰弱<small>おなじ 数字・色の ペアを めくろう</small></button>' +
      '<button type="button" class="hmg wide" data-g="spd">⚡ スピード<small>2人で はやい者勝ち(ロボット・1台・ともだち)</small></button>' +
      '<button type="button" class="hmg wide" data-g="sol">🂡 ソリティア<small>ひとりで あそぶ(クロンダイク)</small></button></div></div><button type="button" class="qb" id="cgback">GAMEに もどる</button>');
    A.bind('[data-g]', function (b) { b.dataset.g === 'sol' ? solitaire() : modes(b.dataset.g); });
    $('#cgback').onclick = function () { stopT(); A.hub(); };
  }
  function modes(id) {
    var G = GAMES[id];
    A.draw('<h2 class="hph">' + esc(G.title) + '</h2><div class="card hpq"><div class="pcmode">' +
      '<button type="button" class="hmg wide" id="m1">🤖 ひとりで あそぶ<small>ロボットと たいせん</small></button>' +
      '<button type="button" class="hmg wide alt" id="m2">📱 1台で あそぶ(2〜5人)<small>スマホを まわして あそびます</small></button>' +
      '<button type="button" class="hmg wide alt" id="m3">👥 ともだちと たいせん<small>へやを つくる(べつのスマホと。人数は ' + G.min + '〜' + G.max + '人)</small></button></div></div><button type="button" class="qb" id="mback">もどる</button>');
    $('#mback').onclick = hub; $('#m1').onclick = function () { setup(id, 'solo'); }; $('#m2').onclick = function () { setup(id, 'pass'); }; $('#m3').onclick = function () { setup(id, 'net'); };
  }
  function setup(id, mode) {
    var G = GAMES[id], n = mode === 'solo' ? 2 : 3, size = 20, lvl = 0.75;
    function paint() {
      var h = '<h2 class="hph">' + esc(G.title) + '</h2><div class="card hpq">';
      if (mode === 'solo') h += '<div style="font-weight:800">ロボットの 人数</div><div class="pcch">' + [1, 2, 3, 4].filter(function (x) { return x >= G.bots[0] && x <= G.bots[1]; }).map(function (x) { return '<button type="button" class="qb' + (n === x + 1 ? ' pri' : '') + '" data-n="' + (x + 1) + '">' + x + '人</button>'; }).join('') + '</div>';
      if (mode === 'pass') { h += '<div style="font-weight:800">あそぶ 人数</div><div class="pcch">' + [2, 3, 4, 5].filter(function (x) { return x <= G.max; }).map(function (x) { return '<button type="button" class="qb' + (n === x ? ' pri' : '') + '" data-n="' + x + '">' + x + '人</button>'; }).join('') + '</div>'; for (var i = 0; i < n; i++) h += '<input class="pcin" id="pn' + i + '" maxlength="6" placeholder="プレイヤー' + (i + 1) + ' の なまえ" value="' + esc((window.__pcn || [])[i] || '') + '">'; }
      if (id === 'mem') h += '<div style="font-weight:800;margin-top:6px">カードの まいすう</div><div class="pcch">' + [[12, 'すくない(12)'], [20, 'ふつう(20)'], [30, 'おおい(30)']].map(function (x) { return '<button type="button" class="qb' + (size === x[0] ? ' pri' : '') + '" data-sz="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' + (mode === 'solo' ? '<div style="font-weight:800;margin-top:6px">ロボットの きおく</div><div class="pcch">' + [[0.5, 'わすれっぽい'], [0.75, 'ふつう'], [0.95, 'よく おぼえる']].map(function (x) { return '<button type="button" class="qb' + (lvl === x[0] ? ' pri' : '') + '" data-lv="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' : '');
      h += '<button type="button" class="qb pri" id="go" style="margin-top:10px">' + (mode === 'net' ? 'へやを つくる / はいる' : 'はじめる') + '</button></div><button type="button" class="qb" id="sback">もどる</button>';
      A.draw(h);
      A.bind('[data-n]', function (b) { keep(); n = +b.dataset.n; paint(); }); A.bind('[data-sz]', function (b) { size = +b.dataset.sz; paint(); }); A.bind('[data-lv]', function (b) { lvl = +b.dataset.lv; paint(); });
      $('#sback').onclick = function () { modes(id); }; $('#go').onclick = go;
    }
    function keep() { if (mode !== 'pass') return; window.__pcn = []; for (var i = 0; i < 5; i++) { var e = $('#pn' + i); if (e) window.__pcn[i] = e.value; } }
    function go() {
      var opts = id === 'mem' ? { size: size } : {};
      if (mode === 'net') return net(id, opts);
      var names = [];
      if (mode === 'solo') { names.push('あなた'); for (var i = 1; i < n; i++) names.push('ロボ' + 'ABCD'.charAt(i - 1)); }
      else { keep(); for (i = 0; i < n; i++) names.push((window.__pcn[i] || '').trim() || 'プレイヤー' + (i + 1)); }
      var again = function () { run(G, { mode: mode, names: names, opts: opts, lvl: lvl, back: function () { modes(id); }, again: again }); };
      again();
    }
    paint();
  }
  function net(id, opts) {
    var G = GAMES[id]; A.withRoom(function (RM) {
      RM.lobby(A, { game: 'cards-' + id, title: G.title, cfg: opts, min: G.min, max: G.max, cfgText: G.title + '(' + G.min + '〜' + G.max + '人)', back: function () { modes(id); },
        init: function (R) { var s = G.init(R.players.length, R.players.slice(), R.cfg || {}); s.phase = 'play'; return s; },
        onStart: function (R) { run(G, { mode: 'net', R: R, back: function () { modes(id); } }); } });
    });
  }

  /* ===================== ソリティア(クロンダイク) ===================== */
  function solitaire() {
    stopT();
    var T, sel = null, hist = [], won = false;
    function deal() {
      var d = []; for (var i = 0; i < 52; i++) d.push(i); shuf(d); var tab = [];
      for (i = 0; i < 7; i++) { var col = []; for (var k = 0; k <= i; k++) col.push({ c: d.pop(), u: k === i }); tab.push(col); }
      T = { tab: tab, stock: d, waste: [], fnd: [[], [], [], []] }; sel = null; hist = []; won = false;
    }
    function snap() { hist.push(JSON.stringify(T)); if (hist.length > 300) hist.shift(); }
    function flipTop() { T.tab.forEach(function (col) { if (col.length && !col[col.length - 1].u) col[col.length - 1].u = true; }); }
    function canTab(c, col) { var t = T.tab[col]; if (!t.length) return rk(c) === 12; var x = t[t.length - 1]; return x.u && red(x.c) !== red(c) && rk(x.c) === rk(c) + 1; }
    function canFnd(c) { return T.fnd[su(c)].length === rk(c); }
    function cardsOf(s) { if (s.t === 'w') return [T.waste[T.waste.length - 1]]; return T.tab[s.col].slice(s.idx).map(function (x) { return x.c; }); }
    function take(s) { if (s.t === 'w') T.waste.pop(); else T.tab[s.col].splice(s.idx); }
    function moveTab(col) { if (!sel) return false; var cs = cardsOf(sel); if (!cs.length || (sel.t === 'c' && sel.col === col) || !canTab(cs[0], col)) return false; snap(); take(sel); cs.forEach(function (c) { T.tab[col].push({ c: c, u: true }); }); flipTop(); sel = null; return true; }
    function moveFnd(s) { var cs = cardsOf(s); if (cs.length !== 1 || !canFnd(cs[0])) return false; snap(); take(s); T.fnd[su(cs[0])].push(cs[0]); flipTop(); sel = null; return true; }
    function auto() {
      var moved = true, n = 0; while (moved) { moved = false;
        if (T.waste.length && T.fnd[su(T.waste[T.waste.length - 1])].length === rk(T.waste[T.waste.length - 1])) { if (moveFnd({ t: 'w' })) { moved = true; n++; continue; } }
        for (var c = 0; c < 7; c++) { var col = T.tab[c]; if (col.length && col[col.length - 1].u && canFnd(col[col.length - 1].c)) { if (moveFnd({ t: 'c', col: c, idx: col.length - 1 })) { moved = true; n++; break; } } } }
      return n;
    }
    function paint() {
      var h = '<h2 class="hph">ソリティア</h2><div class="pcsol">' +
        (T.stock.length ? '<button type="button" class="pc bk" id="sst" aria-label="山札を めくる">●</button>' : '<button type="button" class="pc ph" id="sst" aria-label="めくった札を 山札に もどす">↺</button>') +
        (T.waste.length ? cardB(T.waste[T.waste.length - 1], sel && sel.t === 'w' ? 'sel' : '', 'id="sw"') : '<span class="pc ph"></span>') + '<span></span>' +
        T.fnd.map(function (f, s) { return f.length ? cardB(f[f.length - 1], '', 'data-fs="' + s + '"') : '<button type="button" class="pc ph" data-fs="' + s + '">' + SU[s] + '</button>'; }).join('') + '</div><div class="pcsol" style="align-items:start">' +
        T.tab.map(function (col, ci) {
          var top = 0, inner = col.map(function (x, k) {
            var st = 'top:' + top + 'px', on = sel && sel.t === 'c' && sel.col === ci && k >= sel.idx; top += x.u ? 24 : 10;
            return x.u ? cardB(x.c, on ? 'sel' : '', 'data-c="' + ci + '|' + k + '" style="' + st + '"') : '<button type="button" class="pc bk" data-c="' + ci + '|' + k + '" style="' + st + '">●</button>';
          }).join('');
          return '<div class="pccol" data-col="' + ci + '" style="height:' + (Math.max(60, top + 40)) + 'px">' + (col.length ? '' : '<button type="button" class="pc ph" data-e="' + ci + '">K</button>') + inner + '</div>';
        }).join('') + '</div>';
      if (won) h += '<div class="qc" style="text-align:center"><div style="font-size:1.4em;font-weight:800">🎉 クリア! おめでとう!</div></div>';
      else h += '<div class="qm" style="margin:6px 0">' + (sel ? 'おきたい ところを タップ(もう1回 タップで 上の 4つの山へ)' : 'うごかしたい カードを タップ。左上の 山札で めくります') + '</div>';
      h += '<div class="qgrid"><button type="button" class="qb sm" id="sun"' + (hist.length ? '' : ' disabled') + '>ひとつ もどす</button><button type="button" class="qb sm" id="sau">おまかせ(上の山へ)</button><button type="button" class="qb sm" id="sne">あたらしい ゲーム</button><button type="button" class="qb sm" id="sqt">やめる</button></div>';
      A.draw(h);
      $('#sst').onclick = function () { snap(); if (T.stock.length) T.waste.push(T.stock.pop()); else { T.stock = T.waste.reverse(); T.waste = []; } sel = null; paint(); };
      var sw = $('#sw'); if (sw) sw.onclick = function () { if (sel && sel.t === 'w') { if (!moveFnd(sel)) { for (var c = 0; c < 7; c++) if (moveTab.call(null, c)) break; sel = null; } } else sel = { t: 'w' }; check(); };
      A.bind('[data-fs]', function (b) { if (sel) moveFnd(sel) || A.toast('そこには おけません'); check(); });
      A.bind('[data-e]', function (b) { if (sel && !moveTab(+b.dataset.e)) A.toast('そこには おけません'); check(); });
      A.bind('[data-c]', function (b) {
        var p = b.dataset.c.split('|'), ci = +p[0], k = +p[1], x = T.tab[ci][k];
        if (!x.u) { if (k === T.tab[ci].length - 1) { snap(); x.u = true; sel = null; } return paint(); }
        if (sel && !(sel.t === 'c' && sel.col === ci)) { if (!moveTab(ci)) { A.toast('そこには おけません'); sel = null; } return check(); }
        if (sel && sel.t === 'c' && sel.col === ci && sel.idx === k) { if (k === T.tab[ci].length - 1 && moveFnd(sel)) return check(); sel = null; return paint(); }
        sel = { t: 'c', col: ci, idx: k }; paint();
      });
      $('#sun').onclick = function () { if (hist.length) { T = JSON.parse(hist.pop()); sel = null; won = false; paint(); } };
      $('#sau').onclick = function () { var n = auto(); if (!n) A.toast('上の山に 送れる カードは ありません'); check(); };
      $('#sne').onclick = function () { deal(); paint(); }; $('#sqt').onclick = hub;
    }
    function check() { won = T.fnd.every(function (f) { return f.length === 13; }); paint(); }
    deal(); paint();
  }

  function start(api) {
    A = api;
    if (!document.getElementById('qcardcss')) { var st = document.createElement('style'); st.id = 'qcardcss'; st.textContent = CSS; document.head.appendChild(st); }
    hub();
  }
  window.HmtCards = { start: start, _t: { SPD: SPD, BABA: BABA, SEV: SEV, MEM: MEM, PK: PK, evalH: evalH, cmpH: cmpH, dropPairs: dropPairs } };
})();
