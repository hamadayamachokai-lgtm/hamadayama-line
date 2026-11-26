/* カードゲーム(quiz.js の GAME メニューから呼ばれます: HmtCards.start(api))
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


  /* ===================== カルタ(ことわざ。読み札の つづきの 取り札を はやく とる) ===================== */
  var KP = [['犬も歩けば', '棒にあたる'], ['論より', '証拠'], ['花より', 'だんご'], ['骨折り損の', 'くたびれもうけ'], ['二階から', '目薬'], ['年寄りの', '冷や水'], ['寝耳に', '水'], ['可愛い子には', '旅をさせよ'], ['石の上にも', '三年'], ['猿も木から', '落ちる'], ['急がば', 'まわれ'], ['七転び', '八起き'], ['塵も積もれば', '山となる'], ['笑う門には', '福来たる'], ['縁の下の', '力持ち'], ['鬼に', '金棒'], ['猫に', '小判'], ['河童の', '川流れ'], ['案ずるより', '産むが易し'], ['立つ鳥', '跡を濁さず'], ['身から出た', 'さび'], ['医者の', '不養生'], ['蛙の子は', '蛙'], ['雨降って', '地固まる'], ['灯台', '下暗し'], ['良薬は', '口に苦し'], ['住めば', '都'], ['豚に', '真珠'], ['負けるが', '勝ち'], ['果報は', '寝て待て'], ['千里の道も', '一歩から'], ['馬の耳に', '念仏'], ['三人寄れば', '文殊の知恵'], ['月とスッポン', 'ほど ちがう'], ['短気は', '損気'], ['類は', '友を呼ぶ'], ['備えあれば', '憂いなし']];
  var KI = [['何かを しようとすると、思わぬ 災難や 幸運に 出会う', '犬も歩けば棒にあたる'], ['話し合うより、証拠を 見せるほうが たしか', '論より証拠'], ['見た目より、実際の 得を とる', '花より団子'], ['急ぐ ときほど、安全な 遠回りの ほうが 結局 早い', '急がば回れ'], ['何度 失敗しても くじけず 立ち上がる', '七転び八起き'], ['小さな ことも つみ重ねれば 大きくなる', '塵も積もれば山となる'], ['いつも 明るく 笑う 家には 幸せが 来る', '笑う門には福来たる'], ['名人でも ときには 失敗する', '猿も木から落ちる'], ['しんぼう強く 続ければ、いつか 成功する', '石の上にも三年'], ['価値の わからない 人に 大切な物を あげても むだ', '猫に小判'], ['いくら 言っても 聞き流して きき目がない', '馬の耳に念仏'], ['強い 者が さらに 強くなる', '鬼に金棒'], ['もめごとの あとは、かえって 前より よくなる', '雨降って地固まる'], ['身近な ことほど、かえって 気づきにくい', '灯台下暗し'], ['ためになる 忠告は、聞くのが つらい', '良薬は口に苦し'], ['住みなれれば、どんな ところも よく思える', '住めば都'], ['あらそわず ゆずった ほうが、結局 得をする', '負けるが勝ち'], ['幸運は、あせらず 待っていれば やって来る', '果報は寝て待て'], ['大きな ことも、小さな 一歩から はじまる', '千里の道も一歩から'], ['みんなで 考えれば、いい 知恵が 出る', '三人寄れば文殊の知恵'], ['目立たない ところで、人を 支える 人', '縁の下の力持ち'], ['心配するより、やってみれば 案外 かんたん', '案ずるより産むが易し'], ['去る ときは、きれいに あとしまつを する', '立つ鳥跡を濁さず'], ['自分の 行いが 原因で、自分が 苦しむ', '身から出たさび'], ['りっぱな ことを 言う 人が、自分では 実行しない', '医者の不養生'], ['子は 親に 似る', '蛙の子は蛙'], ['じゅんびを しておけば、心配ない', '備えあれば憂いなし'], ['似た 者どうしは、自然と 集まる', '類は友を呼ぶ'], ['短気を 起こすと、かえって 損をする', '短気は損気'], ['まわりくどくて、きき目が ない', '二階から目薬'], ['とつぜんの 出来事に おどろく', '寝耳に水'], ['年に 合わない 無理を する', '年寄りの冷や水'], ['苦労した だけで、得る ものが ない', '骨折り損のくたびれもうけ'], ['二つの ものが、くらべ ものに ならない ほど ちがう', '月とスッポン']];
  var KR = [['日本の 初代の 天皇と される人', '神武天皇'], ['十七条の 憲法を 作った人', '聖徳太子'], ['大化の改新を 中大兄皇子と 進めた人', '中臣鎌足'], ['奈良に 大仏を つくらせた 天皇', '聖武天皇'], ['平安京に 都を うつした 天皇', '桓武天皇'], ['「源氏物語」を 書いた人', '紫式部'], ['「枕草子」を 書いた人', '清少納言'], ['鎌倉幕府を 開いた人', '源頼朝'], ['元との 戦い(元寇)の ときの 鎌倉幕府の 執権', '北条時宗'], ['室町幕府を 開いた人', '足利尊氏'], ['京都に 金閣を 建てた 将軍', '足利義満'], ['京都に 銀閣を 建てた 将軍', '足利義政'], ['1543年、種子島に 伝わった 武器', '鉄砲'], ['桶狭間の戦いで 今川義元を やぶった人', '織田信長'], ['太閤検地や 刀狩を 行った人', '豊臣秀吉'], ['関ヶ原の戦いに 勝ち、江戸幕府を 開いた人', '徳川家康'], ['江戸時代、外国との 交流を 制限した 政策', '鎖国'], ['1853年、黒船で 浦賀に 来た アメリカの 使者', 'ペリー'], ['1854年、ペリーと むすんだ 条約', '日米和親条約'], ['政権を 朝廷に 返した、最後の 江戸幕府の 将軍', '徳川慶喜'], ['明治政府が 藩を やめて 県を おいた 改革', '廃藩置県'], ['国が 進めた 産業の 近代化(富岡製糸場など)', '殖産興業'], ['日露戦争の 講和条約', 'ポーツマス条約'], ['1923年、関東地方を おそった 大地震', '関東大震災'], ['1945年8月、日本が 受け入れた 宣言', 'ポツダム宣言'], ['1964年、アジアで はじめて 東京で 開かれた 大会', '東京オリンピック'], ['日本国憲法の 三原則の ひとつ「国民主権」「基本的人権の尊重」と もう1つ', '平和主義'], ['3世紀、邪馬台国の 女王', '卑弥呼'], ['稲作が 広まった 時代', '弥生時代'], ['大きな 前方後円墳が つくられた 時代', '古墳時代'], ['なわ目の もようが ある、古い 土器', '縄文土器'], ['遣唐使の 停止を 提案した 学者・政治家', '菅原道真'], ['唐から 日本に 来て、唐招提寺を ひらいた 僧', '鑑真'], ['大名を 1年おきに 江戸に 住まわせた 江戸幕府の 制度', '参勤交代'], ['「天下の台所」と 呼ばれた、江戸時代の 商業都市', '大阪'], ['瀬戸内海に ある、平清盛が あつく 信仰した 世界遺産の 神社', '厳島神社']];
  var KE = [['受け入れる', 'accept'], ['達成する', 'achieve'], ['利点・強み', 'advantage'], ['(〜する)余裕がある', 'afford'], ['古代の', 'ancient'], ['議論する・言い争う', 'argue'], ['手配する・整える', 'arrange'], ['出席する', 'attend'], ['さける', 'avoid'], ['利益・恩恵', 'benefit'], ['借りる', 'borrow'], ['世紀(100年)', 'century'], ['挑戦・難題', 'challenge'], ['意思を 伝えあう', 'communicate'], ['くらべる', 'compare'], ['よく考える', 'consider'], ['配達する', 'deliver'], ['(様子を)言葉で 描く', 'describe'], ['発展させる', 'develop'], ['発見する', 'discover'], ['努力', 'effort'], ['緊急事態', 'emergency'], ['勇気づける', 'encourage'], ['環境', 'environment'], ['交換する', 'exchange'], ['経験', 'experience'], ['よく 知っている', 'familiar'], ['外国の', 'foreign'], ['家具', 'furniture'], ['政府', 'government'], ['推測する', 'guess'], ['習慣', 'habit'], ['役に立つ', 'helpful'], ['想像する', 'imagine'], ['改善する', 'improve'], ['ふくむ', 'include'], ['増える', 'increase'], ['独立した', 'independent'], ['招待する', 'invite'], ['知識', 'knowledge'], ['言語', 'language'], ['地元の', 'local'], ['なんとか やりとげる・管理する', 'manage'], ['意見', 'opinion'], ['礼儀正しい', 'polite'], ['人気のある', 'popular'], ['準備する', 'prepare'], ['守る・保護する', 'protect'], ['再利用する', 'recycle'], ['ことわる', 'refuse'], ['くつろぐ', 'relax'], ['修理する', 'repair'], ['返事をする', 'reply'], ['尊敬する', 'respect'], ['責任のある', 'responsible'], ['科学', 'science'], ['分ける・はなす', 'separate'], ['さけぶ', 'shout'], ['社会', 'society'], ['成功した', 'successful'], ['提案する', 'suggest'], ['支える・支持する', 'support'], ['おどろき', 'surprise'], ['翻訳する', 'translate'], ['めずらしい', 'unusual'], ['価値の高い', 'valuable'], ['種類・多様性', 'variety'], ['ボランティア・自分から 進んで する', 'volunteer'], ['ふしぎに 思う', 'wonder'], ['しかしながら', 'however'], ['〜だけれども', 'although'], ['たぶん', 'perhaps'], ['さいきん', 'recently'], ['とくに', 'especially'], ['危険な', 'dangerous'], ['薬', 'medicine'], ['博物館', 'museum'], ['汚染', 'pollution'], ['気温・温度', 'temperature'], ['伝統的な', 'traditional'], ['観光客', 'tourist']];
  var KG = { koto: { label: 'ことわざ(前半→後半)', d: KP, q: 'よみふだ', hint: 'つづきの とりふだを タップ!' }, imi: { label: 'ことわざ(意味から えらぶ)', d: KI, q: 'いみ', hint: 'この 意味の ことわざを タップ!' }, rek: { label: '歴史', d: KR, q: 'せつめい', hint: '答えの 人物・ことがらを タップ!' }, eigo: { label: '英単語(英検2級まで)', d: KE, q: 'いみ', hint: 'この 意味の 英単語を タップ!' } };
  function kSay(t) { try { if (window.speechSynthesis) { window.speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'ja-JP'; u.rate = 0.85; window.speechSynthesis.speak(u); } } catch (e) { } }
  var KAR = {
    id: 'kar', title: 'カルタ', hidden: false, rt: true, min: 2, max: 6, bots: [1, 3],
    init: function (n, names, opts) {
      var gn = opts && KG[opts.genre] ? opts.genre : 'koto', D = KG[gn].d;
      var ix = []; for (var i = 0; i < D.length; i++) ix.push(i); shuf(ix); var cards = ix.slice(0, 8), q = []; for (i = 0; i < 8; i++) q.push(i); shuf(q);
      var sc = []; for (i = 0; i < n; i++) sc.push(0);
      return { g: 'kar', gn: gn, phase: 'play', n: n, nm: names.slice(0, n), cards: cards, own: [-1, -1, -1, -1, -1, -1, -1, -1], q: q, qi: 0, sc: sc, msg: KG[gn].q + 'を 見て、' + KG[gn].hint, over: false, win: [] };
    },
    turnOf: function (S) { return S.over ? -1 : 0; },
    apply: function (S0, m) {
      var S = clone(S0); if (S.over) return null; var p = m.p, k = m.take; if (S.own[k] !== -1 || p === undefined || p < 0 || p >= S.n) return null;
      if (k === S.q[S.qi]) {
        S.own[k] = p; S.sc[p]++; S.qi++; S.msg = S.nm[p] + 'さんが とりました!';
        if (S.qi >= S.q.length) { var mx = Math.max.apply(null, S.sc); S.win = []; S.sc.forEach(function (x, i) { if (x === mx) S.win.push(i); }); S.over = true; S.msg = 'おしまい!'; }
      } else { S.sc[p] = Math.max(0, S.sc[p] - 1); S.msg = S.nm[p] + 'さん おてつき(-1てん)'; }
      return S;
    },
    botMs: function () { return 2200 + Math.random() * 2600; },
    bot: function (S) {
      var p = 1 + Math.floor(Math.random() * (S.n - 1)), left = []; S.own.forEach(function (o, k) { if (o === -1) left.push(k); });
      if (Math.random() < 0.3) return null;
      return { p: p, take: Math.random() < 0.88 ? S.q[S.qi] : left[Math.floor(Math.random() * left.length)] };
    },
    html: function (S, v, sel) {
      var gn = S.gn || 'koto', D = KG[gn].d, both = v < 0, who = both ? (sel[0] || 0) : v, h = '<div class="pcs">' + esc(S.msg) + '</div>';
      if (!S.over) { var r = D[S.cards[S.q[S.qi]]]; h += '<div class="qc" style="text-align:center"><div class="qm">' + KG[gn].label + ' ・ ' + KG[gn].q + '(' + (S.qi + 1) + '/' + S.q.length + ')</div><div style="font-size:' + (gn === 'koto' ? '1.5em' : '1.2em') + ';font-weight:800;margin:6px 0">' + esc(r[0]) + (gn === 'koto' ? ' …' : '') + '</div><button type="button" class="qb sm" id="ksay">🔊 よみあげ</button></div>'; }
      if (both && !S.over) h += '<div class="qm">だれが とる?</div><div class="pcch">' + S.nm.map(function (n, i) { return '<button type="button" class="qb sm' + (i === who ? ' pri' : '') + '" data-w="' + i + '">' + esc(n) + '</button>'; }).join('') + '</div>';
      h += '<div class="pcsol" style="flex-wrap:wrap;gap:6px;justify-content:center">' + S.cards.map(function (c, k) { var o = S.own[k]; return o === -1 ? '<button type="button" class="qb" style="min-width:42%;margin:0" data-k="' + k + '">' + esc(D[c][1]) + '</button>' : '<div class="qb" style="min-width:42%;margin:0;opacity:.55;text-align:center">' + (gn === 'koto' ? esc(D[c][0]) : '') + esc(D[c][1]) + '<br><small>' + esc(S.nm[o]) + '</small></div>'; }).join('') + '</div>';
      h += '<div class="qm" style="margin-top:6px">' + S.nm.map(function (n, i) { return esc(n) + ' ' + S.sc[i] + 'まい'; }).join(' / ') + '</div>';
      if (S.over) { var pw = S.win.indexOf(v) >= 0, sm = S.nm.map(function (n, i) { return esc(n) + ' ' + S.sc[i]; }).join(' / '); h += v >= 0 ? (S.win.length > 1 && pw ? resH('draw', 'ひきわけ', sm) : resH(pw ? 'win' : 'lose', pw ? '勝ち' : '負け', sm)) : resH('win', S.win.map(function (p) { return esc(S.nm[p]); }).join('・') + 'さんの 勝ち', sm); }
      return h;
    },
    bind: function (S, v, act, ui) {
      var sy = $('#ksay'); if (sy) sy.onclick = function () { kSay(KG[S.gn || 'koto'].d[S.cards[S.q[S.qi]]][0].replace(/\s+/g, '')); };
      A.bind('[data-w]', function (b) { ui.sel[0] = +b.dataset.w; ui.repaint(); });
      A.bind('[data-k]', function (b) { act({ p: v < 0 ? (ui.sel[0] || 0) : v, take: +b.dataset.k }); });
    }
  };

  var GAMES = { baba: BABA, sev: SEV, mem: MEM, pk: PK, kar: KAR };

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
      if (G.rt && mode === 'solo') { tm = setTimeout(function () { if (!alive() || S.over) return; var m = G.bot(S); var n = m ? G.apply(S, m) : null; if (n) commit(n); else paint(); }, G.botMs ? G.botMs(S) : 1000 + Math.random() * 900); return; }
      if (isBot(t) && !S.pend) tm = setTimeout(function () { if (alive()) commit(G.apply(S, G.bot(S, cfg.lvl))); }, 900 + Math.random() * 500);
    }
    function quit() { stopT(); over = true; if (mode === 'net') { R.stop(); R.leave(); } A.root().removeAttribute('data-cg'); cfg.back(); }
    if (mode === 'net') { if (G.rt) R.every = 800; R.watch(function (r, err) { if (err) { R.stop(); A.toast('へやが きえました'); return cfg.back(); } S = R.state; if (alive()) paint(); }); }
    paint();
  }

  /* ===================== メニュー ===================== */
  function hub() {
    stopT();
    A.draw('<h2 class="hph">カードゲーム</h2><div class="card hpq"><div class="pcmode">' +
      '<button type="button" class="hmg wide" data-g="baba">🃏 ババ抜き<small>ジョーカーを 持っていたら まけ</small></button>' +
      '<button type="button" class="hmg wide" data-g="sev">7️⃣ 7並べ<small>7から つなげて 先に 出しきろう</small></button>' +
      '<button type="button" class="hmg wide" data-g="pk">♠ ポーカー<small>5まい。1回 こうかんして 役で しょうぶ</small></button>' +
      '<button type="button" class="hmg wide" data-g="mem">🎴 神経衰弱<small>おなじ 数字・色の ペアを めくろう</small></button>' +
      '<button type="button" class="hmg wide" data-g="kar">🎴 カルタ<small>ことわざ・歴史・英単語を はやい者勝ちで とろう</small></button>' +
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
    var G = GAMES[id], n = mode === 'solo' ? 2 : 3, size = 20, lvl = 0.75, genre = 'koto';
    function paint() {
      var h = '<h2 class="hph">' + esc(G.title) + '</h2><div class="card hpq">';
      if (mode === 'solo') h += '<div style="font-weight:800">ロボットの 人数</div><div class="pcch">' + [1, 2, 3, 4].filter(function (x) { return x >= G.bots[0] && x <= G.bots[1]; }).map(function (x) { return '<button type="button" class="qb' + (n === x + 1 ? ' pri' : '') + '" data-n="' + (x + 1) + '">' + x + '人</button>'; }).join('') + '</div>';
      if (mode === 'pass') { h += '<div style="font-weight:800">あそぶ 人数</div><div class="pcch">' + [2, 3, 4, 5].filter(function (x) { return x <= G.max; }).map(function (x) { return '<button type="button" class="qb' + (n === x ? ' pri' : '') + '" data-n="' + x + '">' + x + '人</button>'; }).join('') + '</div>'; for (var i = 0; i < n; i++) h += '<input class="pcin" id="pn' + i + '" maxlength="6" placeholder="プレイヤー' + (i + 1) + ' の なまえ" value="' + esc((window.__pcn || [])[i] || '') + '">'; }
      if (id === 'kar') h += '<div style="font-weight:800;margin-top:6px">ジャンル</div><div class="pcch" style="flex-wrap:wrap">' + Object.keys(KG).map(function (k) { return '<button type="button" class="qb' + (genre === k ? ' pri' : '') + '" data-gn="' + k + '">' + KG[k].label + '</button>'; }).join('') + '</div>';
      if (id === 'mem') h += '<div style="font-weight:800;margin-top:6px">カードの まいすう</div><div class="pcch">' + [[12, 'すくない(12)'], [20, 'ふつう(20)'], [30, 'おおい(30)']].map(function (x) { return '<button type="button" class="qb' + (size === x[0] ? ' pri' : '') + '" data-sz="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' + (mode === 'solo' ? '<div style="font-weight:800;margin-top:6px">ロボットの きおく</div><div class="pcch">' + [[0.5, 'わすれっぽい'], [0.75, 'ふつう'], [0.95, 'よく おぼえる']].map(function (x) { return '<button type="button" class="qb' + (lvl === x[0] ? ' pri' : '') + '" data-lv="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' : '');
      h += '<button type="button" class="qb pri" id="go" style="margin-top:10px">' + (mode === 'net' ? 'へやを つくる / はいる' : 'はじめる') + '</button></div><button type="button" class="qb" id="sback">もどる</button>';
      A.draw(h);
      A.bind('[data-n]', function (b) { keep(); n = +b.dataset.n; paint(); }); A.bind('[data-sz]', function (b) { size = +b.dataset.sz; paint(); }); A.bind('[data-lv]', function (b) { lvl = +b.dataset.lv; paint(); }); A.bind('[data-gn]', function (b) { keep(); genre = b.dataset.gn; paint(); });
      $('#sback').onclick = function () { modes(id); }; $('#go').onclick = go;
    }
    function keep() { if (mode !== 'pass') return; window.__pcn = []; for (var i = 0; i < 5; i++) { var e = $('#pn' + i); if (e) window.__pcn[i] = e.value; } }
    function go() {
      var opts = id === 'mem' ? { size: size } : id === 'kar' ? { genre: genre } : {};
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
      RM.lobby(A, { game: 'cards-' + id, title: G.title, cfg: opts, min: G.min, max: G.max, cfgText: G.title + (opts && opts.genre ? ' ・ ' + KG[opts.genre].label : '') + '(' + G.min + '〜' + G.max + '人)', back: function () { modes(id); },
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
  window.HmtCards = { start: start, _t: { KAR: KAR, KP: KP, KG: KG, BABA: BABA, SEV: SEV, MEM: MEM, PK: PK, evalH: evalH, cmpH: cmpH, dropPairs: dropPairs } };
})();
