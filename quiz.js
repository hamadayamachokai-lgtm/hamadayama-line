/* 町会クイズ(毎日3問 + 育成 + カードバトル)
   - 豆知識の画面から呼ばれます: HmtQuiz.mount(要素)
   - 問題は quiz-data.json(あとから追加できます)
   - 記録は Store にまとめてあります(今はこの端末の localStorage。あとで LINEログイン+サーバー保存に差し替え可) */
(function () {
  'use strict';

  /* ===== 記録の保存(ここだけ差し替えれば、サーバー保存にできる) ===== */
  var Store = {
    KEY: 'hmt_quiz_v1', mem: null,
    blank: function () { return { level: null, genres: [], name: '', xp: 0, streak: 0, best: 0, lastDone: '', today: null, cards: {}, battles: { win: 0, lose: 0 }, hatched: false, played: 0 }; },
    load: function () {
      if (this.mem) return this.mem;
      var d = null; try { d = JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch (e) {}
      this.mem = Object.assign(this.blank(), d || {}); return this.mem;
    },
    save: function () { try { localStorage.setItem(this.KEY, JSON.stringify(this.mem)); } catch (e) {} }
  };

  /* ===== 小さな道具 ===== */
  var LEVELS = ['幼児向け', '低学年', '中学年', '高学年', '中学生', '高校生', '大学生', '社会人', '主婦向け', '高齢者'];
  var LV_SEC = [0, 30, 30, 25, 20, 20, 20, 20, 30, 0];       // 制限時間(秒)。0 = なし
  var RUBY_MAX = 2;                                          // 幼児〜中学年は ふりがな
  var BIGTEXT = { 0: 1, 9: 1 };                              // 幼児・高齢者は さらに大きく
  var RAR = ['N', 'R', 'SR', 'LR'], RAR_POW = { N: 1, R: 2, SR: 3, LR: 5 };
  var RAR_COL = { N: '#8a94a6', R: '#2f7fd0', SR: '#9b4fd1', LR: '#e0a300' };
  var ENEMIES = {
    '火事': ['ボヤボヤン', '#e8693a'], '水害': ['ザブーン', '#3b8ed6'], '地震': ['ユラユラ', '#a77b4f'], '避難': ['ウロウロン', '#6aa86b'],
    '学問': ['ガリベンタ', '#6b6fd6'], '時事': ['ニュースピ', '#d6a23b'], '法律': ['ホーリー', '#7a8794'], '音楽': ['ガヤガヤ', '#d65fa0'],
    '生活': ['グダグダ', '#8fb04a'], '推理': ['モヤモヤン', '#6c5b9e'], '料理': ['コゲコゲ', '#c9743a'], 'マナー': ['ギスギス', '#b04a4a'],
    '道徳': ['イジワルン', '#4aa6a0'], '電話対応': ['ジリジリ', '#d6803b'], '物の名前': ['ナナシー', '#7fa2c9'], '流行': ['バズリン', '#e05fb0'], 'ご当地': ['ゴトーチン', '#c98f3a']
  };
  var DATA = null, root = null, timer = null, V = {};

  function $(s) { return root.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function st() { return Store.load(); }
  function ruby() { return st().level != null && st().level <= RUBY_MAX; }
  function T(s) {   // {漢字:よみ} を、ふりがな対応に
    var e = esc(s), on = ruby();
    return e.replace(/\{([^:{}]+):([^{}]+)\}/g, function (m, a, b) { return on ? '<ruby>' + a + '<rt>' + b + '</rt></ruby>' : a; });
  }
  function K(kanji, kana) { return ruby() ? kana : kanji; }   // 幼児〜中学年は かな多め
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function yesterdayKey() { var d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = typeof seed === 'number' ? seed : hash(String(seed)); return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function qById(id) { for (var i = 0; i < DATA.questions.length; i++) if (DATA.questions[i].id === id) return DATA.questions[i]; return null; }

  /* ===== 問題の選び方(同じ日は同じ3問) ===== */
  function poolFor(level, genres, minCount) {
    var all = DATA.questions, g = (genres && genres.length) ? all.filter(function (q) { return genres.indexOf(q.g) >= 0; }) : all;
    if (!g.length) g = all;
    var out = [];
    for (var d = 0; d <= 9 && out.length < minCount; d++) out = g.filter(function (q) { return Math.abs(q.lv - level) <= d; });
    return out.length ? out : g;
  }
  function pick(level, genres, n, r, exclude) {
    var pool = poolFor(level, genres, Math.max(n * 2, 6)).filter(function (q) { return !exclude || exclude.indexOf(q.id) < 0; });
    var res = shuffle(pool, r).slice(0, n);
    if (res.length < n) { var ids = res.map(function (q) { return q.id; }); res = res.concat(shuffle(DATA.questions.filter(function (q) { return ids.indexOf(q.id) < 0; }), r).slice(0, n - res.length)); }
    return res;
  }
  function choicesOf(q, r) { var c = [{ t: q.a, ok: true }].concat(q.w.map(function (x) { return { t: x, ok: false }; })); return shuffle(c, r); }

  /* ===== 育成 ===== */
  var STAGES = [{ n: '卵', min: 0 }, { n: 'ひよこ期', min: 20 }, { n: '成長期', min: 100 }, { n: '完成形', min: 250 }];
  function stageOf(xp) { var s = 0; STAGES.forEach(function (x, i) { if (xp >= x.min) s = i; }); return s; }
  var SAYS = [
    ['…コツ、コツ。', 'あったかい…', 'そろそろ うまれそう!'],
    ['ピョコ! きょうも たのしみ!', 'おなか すいた〜 クイズ たべたい!', 'おぼえると おおきく なるよ!'],
    ['いっしょに がんばろう!', 'まちを まもる ちからが ついてきた!', 'きのうの もんだい おぼえてる?'],
    ['ここまで そだったね。ありがとう!', 'ぼうさいも ばっちり!', 'みんなで たすけあおう!']
  ];
  function buddySVG(stage, size, wiggle) {
    var c = '#7fd6c2', c2 = '#4fb7a1', b = '#fff7e6', ink = '#33433f', s = size || 150, g = '';
    if (stage === 0) {
      g = '<ellipse cx="60" cy="68" rx="34" ry="42" fill="#fffaf0" stroke="#d9c9a5" stroke-width="3"/><circle cx="48" cy="56" r="6" fill="#f2b8a2"/><circle cx="70" cy="76" r="7" fill="#9ed8c8"/><circle cx="66" cy="50" r="4" fill="#f4d58a"/><path d="M52 98q8 5 16 0" stroke="#d9c9a5" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    } else if (stage === 1) {
      g = '<path d="M60 14q-10 -2 -14 -9q12 -2 14 9zM60 14q10 -2 14 -9q-12 -2 -14 9z" fill="#5fbf6a" transform="translate(0,6)"/><ellipse cx="60" cy="76" rx="36" ry="32" fill="' + c + '"/><ellipse cx="60" cy="88" rx="22" ry="16" fill="' + b + '"/><circle cx="47" cy="70" r="5" fill="' + ink + '"/><circle cx="73" cy="70" r="5" fill="' + ink + '"/><circle cx="45.5" cy="68.5" r="1.6" fill="#fff"/><circle cx="71.5" cy="68.5" r="1.6" fill="#fff"/><path d="M54 80q6 6 12 0" stroke="' + ink + '" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="38" cy="80" r="5" fill="#f6a99a" opacity=".7"/><circle cx="82" cy="80" r="5" fill="#f6a99a" opacity=".7"/>';
    } else if (stage === 2) {
      g = '<path d="M60 8q-12 -2 -17 -10q14 -3 17 10zM60 8q12 -2 17 -10q-14 -3 -17 10z" fill="#4fae5a" transform="translate(0,12)"/><ellipse cx="30" cy="84" rx="9" ry="14" fill="' + c2 + '" transform="rotate(20 30 84)"/><ellipse cx="90" cy="84" rx="9" ry="14" fill="' + c2 + '" transform="rotate(-20 90 84)"/><ellipse cx="60" cy="76" rx="38" ry="36" fill="' + c + '"/><ellipse cx="60" cy="90" rx="24" ry="18" fill="' + b + '"/><ellipse cx="46" cy="112" rx="11" ry="6" fill="' + c2 + '"/><ellipse cx="74" cy="112" rx="11" ry="6" fill="' + c2 + '"/><circle cx="46" cy="68" r="6" fill="' + ink + '"/><circle cx="74" cy="68" r="6" fill="' + ink + '"/><circle cx="44" cy="66" r="2" fill="#fff"/><circle cx="72" cy="66" r="2" fill="#fff"/><path d="M52 80q8 8 16 0" stroke="' + ink + '" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cx="35" cy="80" r="5.5" fill="#f6a99a" opacity=".7"/><circle cx="85" cy="80" r="5.5" fill="#f6a99a" opacity=".7"/>';
    } else {
      g = '<path d="M28 60q-22 -10 -20 -34q18 4 26 24z" fill="#bfeee3"/><path d="M92 60q22 -10 20 -34q-18 4 -26 24z" fill="#bfeee3"/><path d="M42 18l8 10l10 -14l10 14l8 -10l2 14h-40z" fill="#f4c542" stroke="#d99f1b" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="14" r="3.5" fill="#f08a8a"/><ellipse cx="60" cy="78" rx="40" ry="38" fill="' + c + '"/><ellipse cx="60" cy="92" rx="26" ry="19" fill="' + b + '"/><ellipse cx="44" cy="116" rx="12" ry="6" fill="' + c2 + '"/><ellipse cx="76" cy="116" rx="12" ry="6" fill="' + c2 + '"/><circle cx="45" cy="70" r="6.5" fill="' + ink + '"/><circle cx="75" cy="70" r="6.5" fill="' + ink + '"/><circle cx="43" cy="68" r="2.2" fill="#fff"/><circle cx="73" cy="68" r="2.2" fill="#fff"/><path d="M50 82q10 10 20 0" stroke="' + ink + '" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="33" cy="82" r="6" fill="#f6a99a" opacity=".7"/><circle cx="87" cy="82" r="6" fill="#f6a99a" opacity=".7"/><path d="M14 20l2 5l5 2l-5 2l-2 5l-2 -5l-5 -2l5 -2z M106 40l1.6 4l4 1.6l-4 1.6l-1.6 4l-1.6 -4l-4 -1.6l4 -1.6z" fill="#f4c542"/>';
    }
    return '<svg viewBox="0 0 120 124" width="' + s + '" height="' + (s * 124 / 120) + '" role="img" aria-label="相棒" class="' + (wiggle ? 'qz-wig' : '') + '">' + g + '</svg>';
  }
  function enemySVG(genre, size) {
    var e = ENEMIES[genre] || ['てき', '#999'], col = e[1], s = size || 120;
    return '<svg viewBox="0 0 120 110" width="' + s + '" height="' + (s * 110 / 120) + '" role="img" aria-label="' + esc(e[0]) + '"><path d="M14 80q-4 -50 46 -56q50 6 46 56q-6 18 -46 18q-40 0 -46 -18z" fill="' + col + '"/><path d="M30 28l-8 -16l18 10zM90 28l8 -16l-18 10z" fill="' + col + '"/><ellipse cx="44" cy="58" rx="11" ry="13" fill="#fff"/><ellipse cx="76" cy="58" rx="11" ry="13" fill="#fff"/><circle cx="46" cy="60" r="5.5" fill="#222"/><circle cx="74" cy="60" r="5.5" fill="#222"/><path d="M34 44l16 6M86 44l-16 6" stroke="#222" stroke-width="3.5" stroke-linecap="round"/><path d="M46 82q14 -10 28 0" stroke="#222" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>';
  }

  /* ===== 見た目(このクイズの中だけに効く) ===== */
  var CSS = '#qz{font-size:17px;line-height:1.7;color:#1b2438}#qz.big{font-size:19px}#qz *{box-sizing:border-box}' +
    '#qz .qb{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:56px;padding:12px 16px;margin:0 0 12px;border:2px solid #cfc7b4;border-radius:16px;background:#fff;color:#1b2438;font-size:1.06em;font-weight:700;text-align:left;cursor:pointer;font-family:inherit}' +
    '#qz .qb.pri{background:#6a4bd6;border-color:#6a4bd6;color:#fff;justify-content:center}#qz .qb.ch{justify-content:flex-start}#qz .qb:disabled{opacity:.6}#qz .qb.ok{background:#e3f3ea;border-color:#1f7a4d}#qz .qb.ng{background:#fbe5e2;border-color:#b3261e}#qz .qb.sel{border-color:#6a4bd6;background:#efeafc}#qz .qb.sm{min-height:44px;font-size:.95em;margin-bottom:8px}' +
    '#qz .qc{background:#fffdf8;border:1px solid #e4ddcf;border-radius:18px;padding:16px;margin:0 0 14px}#qz h2{font-size:1.15em;margin:0 0 8px}#qz .qm{color:#667085;font-size:.88em}' +
    '#qz .qhead{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px}#qz .qtag{display:inline-block;padding:2px 10px;border-radius:99px;background:#efeafc;color:#4c2fb0;font-size:.82em;font-weight:700}' +
    '#qz .qbar{height:10px;border-radius:99px;background:#ece8de;overflow:hidden}#qz .qbar i{display:block;height:100%;background:#6a4bd6;transition:width .3s}#qz .qbar.t i{background:#e0873a;transition:width 1s linear}' +
    '#qz .qbud{text-align:center;padding:6px 0 2px}#qz .qbub{display:inline-block;background:#fff;border:2px solid #e4ddcf;border-radius:16px;padding:6px 14px;margin:6px 0;font-weight:700}' +
    '#qz .qgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}#qz .qgrid.g3{grid-template-columns:repeat(3,1fr)}#qz .qgrid .qb{margin:0}' +
    '#qz .qcard{border:3px solid var(--rc,#8a94a6);border-radius:14px;background:#fff;padding:10px;text-align:left;min-height:110px;position:relative;cursor:pointer;font-family:inherit;font-size:.82em;line-height:1.45;color:#1b2438}#qz .qcard b{position:absolute;right:8px;top:6px;color:var(--rc);font-size:1.05em}#qz .qcard.no{border-style:dashed;color:#b0aa9a;background:#f6f3ea;text-align:center;cursor:default}' +
    '#qz .qfb{border-radius:14px;padding:12px 14px;margin:0 0 12px}#qz .qfb.ok{background:#e3f3ea;color:#14583a}#qz .qfb.ng{background:#fcefd3;color:#6e4100}#qz .qmn{background:#fffbe6;border-left:5px solid #f4c542;padding:8px 12px;border-radius:8px;margin-top:8px}' +
    '#qz .qhearts{font-size:1.4em;letter-spacing:2px}#qz .qbt{text-align:center}#qz ruby rt{font-size:.55em}#qz a{color:#4c2fb0}' +
    '@keyframes qzw{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg) translateY(-3px)}}#qz .qz-wig{animation:qzw 2.4s ease-in-out infinite}@keyframes qzh{0%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}100%{transform:translateX(0)}}#qz .qz-hit{animation:qzh .35s}' +
    '@media (prefers-reduced-motion:reduce){#qz .qz-wig,#qz .qz-hit{animation:none}}';

  /* ===== 画面の切り替え ===== */
  function draw(html) { stopTimer(); root.className = BIGTEXT[st().level] ? 'big' : ''; root.innerHTML = html; try { root.scrollIntoView({ block: 'start' }); } catch (e) {} }
  function bind(sel, fn) { Array.prototype.forEach.call(root.querySelectorAll(sel), function (b) { b.onclick = function () { fn(b); }; }); }
  function bottomNav(cur) {
    var items = [['home', 'ホーム'], ['dex', 'ずかん'], ['bsel', 'バトル'], ['set', 'せってい']];
    return '<div class="qgrid" style="grid-template-columns:repeat(4,1fr);margin-top:18px">' + items.map(function (x) { return '<button class="qb sm' + (cur === x[0] ? ' sel' : '') + '" style="justify-content:center;padding:6px" data-nav="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
  }
  function bindNav() { bind('[data-nav]', function (b) { go(b.dataset.nav); }); }
  function go(v, a) { ({ home: home, dex: dex, bsel: bsel, set: settings, setup: setup })[v](a); }

  /* --- はじめの設定 --- */
  function setup() {
    var s = st(); V.lv = s.level != null ? s.level : null; V.gs = s.genres.slice();
    var first = s.level == null;
    function page() {
      draw('<div class="qc"><h2>' + (first ? 'はじめまして!' : 'せってい') + '</h2><p style="margin:0">' + K('1日3問の町会クイズです。', 'まいにち 3もん の クイズです。') + '</p></div>' +
        '<div class="qc"><h2>① ' + K('レベルを選ぶ', 'レベルを えらぶ') + '</h2><div class="qgrid">' + LEVELS.map(function (n, i) { return '<button class="qb sm' + (V.lv === i ? ' sel' : '') + '" style="justify-content:center" data-lv="' + i + '">' + esc(n) + '</button>'; }).join('') + '</div><div class="qm">' + K('あとから変えられます', 'あとから かえられます') + '</div></div>' +
        '<div class="qc"><h2>② ' + K('ジャンルを選ぶ(いくつでも)', 'ジャンルを えらぶ') + '</h2><button class="qb sm' + (!V.gs.length ? ' sel' : '') + '" style="justify-content:center" data-g="*">おまかせ(ぜんぶ)</button><div class="qgrid g3">' + DATA.genres.map(function (g) { return '<button class="qb sm' + (V.gs.indexOf(g) >= 0 ? ' sel' : '') + '" style="justify-content:center;padding:4px;font-size:.85em" data-g="' + esc(g) + '">' + esc(g) + '</button>'; }).join('') + '</div></div>' +
        '<button class="qb pri" id="qgo"' + (V.lv == null ? ' disabled' : '') + '>' + (first ? 'はじめる' : 'きめる') + '</button>' + (first ? '' : '<button class="qb" id="qcancel">もどる</button>'));
      bind('[data-lv]', function (b) { V.lv = +b.dataset.lv; page(); });
      bind('[data-g]', function (b) { var g = b.dataset.g; if (g === '*') V.gs = []; else { var i = V.gs.indexOf(g); if (i >= 0) V.gs.splice(i, 1); else V.gs.push(g); } page(); });
      $('#qgo').onclick = function () {
        if (V.lv == null) return;
        var s = st(); s.level = V.lv; s.genres = V.gs.slice();
        if (s.today && s.today.date === dayKey() && !s.today.ans.length) s.today = null;   // まだ始めていなければ作り直す
        Store.save(); home();
      };
      var c = $('#qcancel'); if (c) c.onclick = home;
    }
    page();
  }

  /* --- ホーム --- */
  function ensureToday() {
    var s = st(), k = dayKey();
    if (!s.today || s.today.date !== k) {
      var r = rng(k + '|' + s.level + '|' + s.genres.join(','));
      var qs = pick(s.level, s.genres, 3, r);
      s.today = { date: k, ids: qs.map(function (q) { return q.id; }), ans: [], done: false };
      Store.save();
    }
    return s.today;
  }
  function xpBar(s) {
    var i = stageOf(s.xp), nx = STAGES[i + 1], pct = nx ? Math.round((s.xp - STAGES[i].min) / (nx.min - STAGES[i].min) * 100) : 100;
    return '<div class="qbar" aria-label="けいけんち"><i style="width:' + pct + '%"></i></div><div class="qm">' + (nx ? 'つぎの すがたまで あと ' + (nx.min - s.xp) : 'かんせい! これからも いっしょに') + '</div>';
  }
  function home() {
    var s = st(); if (s.level == null) return setup();
    var t = ensureToday(), stage = stageOf(s.xp), nm = s.name || (stage === 0 ? 'たまご' : 'あいぼう');
    var left = t.done ? 0 : 3 - t.ans.length;
    draw('<button class="qb sm" id="qhub" style="width:auto;display:inline-flex">← GAMEの メニュー</button><div class="qc qbud"><div class="qm">' + esc(LEVELS[s.level]) + ' ・ ' + (s.genres.length ? esc(s.genres.join('・')) : 'おまかせ') + '</div><button id="qbud" style="display:block;margin:0 auto;background:none;border:0;padding:0;cursor:pointer" aria-label="あいぼうを タップ">' + buddySVG(stage, 150, true) + '</button><div id="qsay" class="qbub">' + esc(SAYS[stage][0]) + '</div><div style="font-weight:700">' + esc(nm) + ' <span class="qm">(' + STAGES[stage].n + ')</span></div>' + xpBar(s) + '</div>' +
      '<div class="qc"><div class="qhead"><b>🔥 ' + K('れんぞく', 'れんぞく') + ' ' + s.streak + ' ' + K('日', 'にち') + '</b><span class="qm">' + K('さいこう', 'さいこう') + ' ' + s.best + ' ' + K('日', 'にち') + '</span></div>' +
      (t.done ? '<div class="qfb ok"><b>' + K('今日はもう おしまい。', 'きょうは もう おしまい。') + '</b><br>' + K('また明日 あいましょう!', 'また あした あおうね!') + '</div><button class="qb" id="qrev">' + K('今日の問題を ふりかえる', 'きょうの もんだいを みなおす') + '</button>'
        : '<button class="qb pri" id="qstart">' + (t.ans.length ? K('つづきから(あと' + left + '問)', 'つづきから(あと' + left + 'もん)') : K('今日の3問に ちょうせん', 'きょうの 3もんに ちょうせん')) + '</button>') + '</div>' +
      '<button class="qb" id="qtrip" style="background:#fff4d6;border-color:#e0a300">🗾 ' + K('日本旅すごろく', 'にほん たび すごろく') + '</button><div class="qm" style="text-align:center">' + K('カード ', 'カード ') + Object.keys(s.cards).length + '/' + DATA.questions.length + ' ' + K('まい', 'まい') + '</div>' + bottomNav('home'));
    bindNav();
    var said = 0; $('#qbud').onclick = function () { said = (said + 1) % SAYS[stage].length; $('#qsay').textContent = SAYS[stage][said]; };
    $('#qhub').onclick = hub; $('#qtrip').onclick = openTrip; var b1 = $('#qstart'); if (b1) b1.onclick = function () { daily(); };
    var b2 = $('#qrev'); if (b2) b2.onclick = function () { V.rev = true; daily(); };
  }

  /* --- 質問の共通部分 --- */
  function ask(q, o) {
    // o: {r, head, onAnswer(ok, timeout), sec}
    var ch = choicesOf(q, o.r), sec = o.sec, left = sec, done = false;
    draw(o.head + '<div class="qc"><span class="qtag">' + esc(q.g) + '</span><div style="font-size:1.12em;font-weight:700;margin:8px 0 4px">' + T(q.q) + '</div>' + (q.fig ? '<div class="qfig" style="text-align:center;margin:8px 0">' + q.fig + '</div>' : '') + (sec ? '<div class="qbar t" id="qtm"><i style="width:100%"></i></div>' : '') + '</div>' +
      '<div id="qch">' + ch.map(function (c, i) { return '<button class="qb ch" data-i="' + i + '">' + T(c.t) + '</button>'; }).join('') + '</div><div id="qfb"></div>');
    function fin(i, timeout) {
      if (done) return; done = true; stopTimer();
      var ok = i >= 0 && ch[i].ok;
      Array.prototype.forEach.call(root.querySelectorAll('#qch .qb'), function (b, j) { b.disabled = true; b.classList.add(ch[j].ok ? 'ok' : (j === i ? 'ng' : 'x')); });
      var src = q.src && DATA.sources[q.src];
      $('#qfb').innerHTML = '<div class="qfb ' + (ok ? 'ok' : 'ng') + '"><b>' + (ok ? K('せいかい! 🎉', 'せいかい! 🎉') : timeout ? K('時間ぎれ…', 'じかんぎれ…') : K('ざんねん…', 'ざんねん…')) + '</b>' + (ok ? '' : '<div>' + K('正解は', 'せいかいは') + '「' + T(q.a) + '」</div>') + '<div style="margin-top:6px">' + T(q.ex) + '</div><div class="qmn">💡 ' + K('覚え方', 'おぼえかた') + ':' + T(q.mn) + '</div>' +
        (src ? '<div class="qm" style="margin-top:6px">' + K('出典', 'でんてん') + ':<a href="' + esc(src.u) + '" target="_blank" rel="noopener">' + esc(src.t) + '</a>(' + esc(src.d) + ' 確認)</div>' : '') + (q.asof ? '<div class="qm">' + esc(q.asof.replace('-', '年') + '月') + 'ごろの 情報です</div>' : '') + '</div>' +
        '<button class="qb pri" id="qnext">' + esc(o.nextLabel || K('次へ', 'つぎへ')) + '</button>';
      $('#qnext').onclick = function () { o.next(ok); }; o.onAnswer(ok, timeout, q);
    }
    bind('#qch .qb', function (b) { fin(+b.dataset.i, false); });
    if (sec) timer = setInterval(function () { left--; var bar = $('#qtm i'); if (bar) bar.style.width = Math.max(0, left / sec * 100) + '%'; if (left <= 0) fin(-1, true); }, 1000);
  }
  function addXp(n) { var s = st(), before = stageOf(s.xp); s.xp += n; var after = stageOf(s.xp); return after > before ? after : 0; }
  function giveCard(q, r) {
    var s = st(), roll = r(), rar = roll < .6 ? 'N' : roll < .85 ? 'R' : roll < .97 ? 'SR' : 'LR', c = s.cards[q.id];
    if (!c) { s.cards[q.id] = { r: rar, n: 1 }; return { rar: rar, isNew: true }; }
    c.n++; if (RAR.indexOf(rar) > RAR.indexOf(c.r)) { c.r = rar; return { rar: rar, isNew: false, up: true }; }
    return { rar: c.r, isNew: false };
  }

  /* --- 毎日3問 --- */
  function daily() {
    var s = st(), t = ensureToday(), review = V.rev; V.rev = false;
    var ids = t.ids, start = review ? 0 : t.ans.length;
    V.gain = { xp: 0, cards: [], correct: 0, evo: 0 };
    function step(i) {
      if (i >= 3) return review ? home() : finish();
      var q = qById(ids[i]), r = rng(t.date + '|' + q.id);
      ask(q, {
        r: r, sec: review ? 0 : LV_SEC[s.level],
        head: '<div class="qhead"><b>' + (i + 1) + ' / 3 ' + K('問目', 'もんめ') + '</b><span class="qm">' + K('今日の3問', 'きょうの 3もん') + '</span></div><div class="qbar"><i style="width:' + (i / 3 * 100) + '%"></i></div><div style="height:10px"></div>',
        nextLabel: i === 2 ? K('けっかを見る', 'けっかを みる') : null,
        onAnswer: function (ok) {
          if (review) return;
          t.ans[i] = ok ? 1 : 0; V.gain.xp += ok ? 8 : 3; if (ok) { V.gain.correct++; var c = giveCard(q, rng(Date.now() + q.id)); V.gain.cards.push({ id: q.id, rar: c.rar, isNew: c.isNew, up: c.up }); }
          var e = addXp(ok ? 8 : 3); if (e) V.gain.evo = e; Store.save();
        },
        next: function () { step(i + 1); }
      });
    }
    step(start);
  }
  function finish() {
    var s = st(), t = s.today, k = dayKey();
    if (!t.done) {
      t.done = true; var e = addXp(10); if (e) V.gain.evo = e; V.gain.xp += 10;
      s.streak = s.lastDone === yesterdayKey() ? s.streak + 1 : (s.lastDone === k ? s.streak : 1); s.lastDone = k; s.best = Math.max(s.best, s.streak); s.played++;
      Store.save();
    }
    var stage = stageOf(s.xp), nm = s.name || (stage ? 'あいぼう' : 'たまご'), got = V.gain && V.gain.cards || [];
    draw('<div class="qc qbud"><h2>' + K('今日の けっか', 'きょうの けっか') + '</h2><div style="font-size:1.4em;font-weight:700">' + (V.gain ? V.gain.correct : t.ans.reduce(function (a, b) { return a + b; }, 0)) + ' / 3 ' + K('正解', 'せいかい') + '</div>' + buddySVG(stage, 140, true) +
      '<div class="qbub">' + (V.gain && V.gain.evo ? '🎊 ' + esc(nm) + 'が ' + STAGES[V.gain.evo].n + 'に しんかした!' : '+' + (V.gain ? V.gain.xp : 0) + ' けいけんち!') + '</div>' + xpBar(s) + '</div>' +
      (got.length ? '<div class="qc"><h2>' + K('もらったカード', 'もらった カード') + '</h2><div class="qgrid">' + got.map(function (c) { var q = qById(c.id); return '<div class="qcard" style="--rc:' + RAR_COL[c.rar] + '"><b>' + c.rar + '</b>' + (c.isNew ? '<span class="qtag">NEW</span><br>' : '') + T(q.q) + '</div>'; }).join('') + '</div></div>' : '') +
      '<div class="qfb ok"><b>🔥 ' + K('れんぞく', 'れんぞく') + ' ' + s.streak + ' ' + K('日!', 'にち!') + '</b><br>' + K('今日はもう おしまい。また明日!', 'きょうは もう おしまい。また あした!') + '</div><button class="qb pri" id="qhome">' + K('ホームへ', 'ホームへ') + '</button><button class="qb" id="qbat">' + K('バトルで あそぶ(なんどでも)', 'バトルで あそぶ') + '</button>');
    $('#qhome').onclick = home; $('#qbat').onclick = bsel;
  }

  /* --- ずかん --- */
  function dex(g) {
    var s = st(); V.dg = g === undefined ? V.dg : g;
    var all = DATA.questions, have = all.filter(function (q) { return s.cards[q.id]; }).length;
    var list = V.dg ? all.filter(function (q) { return q.g === V.dg; }) : all;
    draw('<div class="qc"><h2>' + K('カードずかん', 'カードずかん') + '</h2><div style="font-size:1.2em;font-weight:700">' + have + ' / ' + all.length + ' ' + K('まい', 'まい') + '</div><div class="qbar"><i style="width:' + Math.round(have / all.length * 100) + '%"></i></div></div>' +
      '<div class="qc"><h2>' + K('ジャンルごと', 'ジャンルごと') + '</h2><div class="qgrid g3"><button class="qb sm' + (!V.dg ? ' sel' : '') + '" style="justify-content:center;padding:4px" data-dg="">ぜんぶ</button>' + DATA.genres.map(function (x) {
        var tt = all.filter(function (q) { return q.g === x; }), hv = tt.filter(function (q) { return s.cards[q.id]; }).length;
        return '<button class="qb sm' + (V.dg === x ? ' sel' : '') + '" style="justify-content:center;padding:4px;font-size:.8em;flex-direction:column;gap:0;line-height:1.3" data-dg="' + esc(x) + '">' + esc(x) + '<span class="qm">' + hv + '/' + tt.length + (hv === tt.length ? ' ★' : '') + '</span></button>';
      }).join('') + '</div></div><div class="qgrid">' + list.map(function (q) {
        var c = s.cards[q.id];
        return c ? '<button class="qcard" style="--rc:' + RAR_COL[c.r] + '" data-c="' + q.id + '"><b>' + c.r + '</b><span class="qtag">' + esc(q.g) + '</span><br>' + T(q.q) + '</button>' : '<div class="qcard no">? ' + esc(q.g) + '</div>';
      }).join('') + '</div>' + bottomNav('dex'));
    bindNav(); bind('[data-dg]', function (b) { dex(b.dataset.dg); }); bind('[data-c]', function (b) { dexCard(b.dataset.c); });
  }
  function dexCard(id) {
    var q = qById(id), c = st().cards[id], src = q.src && DATA.sources[q.src];
    draw('<div class="qcard" style="--rc:' + RAR_COL[c.r] + ';min-height:0;font-size:1em;cursor:default;margin-bottom:14px"><b>' + c.r + '</b><span class="qtag">' + esc(q.g) + '</span><div style="font-weight:700;margin:6px 0">' + T(q.q) + '</div>' + (q.fig ? '<div style="text-align:center">' + q.fig + '</div>' : '') + '<div>' + K('こたえ', 'こたえ') + ':<b>' + T(q.a) + '</b></div><div style="margin-top:6px">' + T(q.ex) + '</div><div class="qmn">💡 ' + T(q.mn) + '</div>' +
      (src ? '<div class="qm" style="margin-top:6px">' + K('出典', 'でんてん') + ':<a href="' + esc(src.u) + '" target="_blank" rel="noopener">' + esc(src.t) + '</a></div>' : '') + '<div class="qm">' + c.n + ' かい ゲット</div></div><button class="qb" id="qb">' + K('もどる', 'もどる') + '</button>');
    $('#qb').onclick = function () { dex(); };
  }

  /* --- バトル --- */
  function bsel() {
    var s = st();
    draw('<div class="qc"><h2>' + K('カードバトル', 'カードバトル') + '</h2><p style="margin:0">' + K('てきを えらぼう。正解で こうげき! カードが 多いほど つよい。', 'てきを えらぼう。せいかいで こうげき!') + '</p><div class="qm">' + K('勝ち ', 'かち ') + s.battles.win + ' / ' + K('負け ', 'まけ ') + s.battles.lose + '</div></div><div class="qgrid">' + DATA.genres.map(function (g) {
      return '<button class="qb" style="flex-direction:column;gap:2px;padding:8px" data-e="' + esc(g) + '">' + enemySVG(g, 70) + '<span style="font-size:.9em">' + esc(ENEMIES[g][0]) + '</span><span class="qm">' + esc(g) + '</span></button>';
    }).join('') + '</div>' + bottomNav('bsel'));
    bindNav(); bind('[data-e]', function (b) { battle(b.dataset.e); });
  }
  function battle(genre) {
    var s = st(), cards = Object.keys(s.cards).reduce(function (a, id) { return a + RAR_POW[s.cards[id].r]; }, 0);
    var atk = 12 + Math.min(40, Math.floor(cards / 2));
    var B = { genre: genre, ehp: 100, hearts: 3, combo: 0, miss: [], n: 0, r: rng(Date.now()), q: [] };
    var pool = shuffle(poolFor(s.level, [genre], 12), B.r);
    B.q = pool.slice();
    function next() {
      if (B.ehp <= 0) return end(true);
      if (B.hearts <= 0) return end(false);
      if (!B.q.length) B.q = shuffle(poolFor(s.level, [genre], 12), B.r);
      var q = B.q.shift(); B.n++;
      ask(q, {
        r: B.r, sec: LV_SEC[s.level],
        head: '<div class="qc" style="text-align:center;padding:10px"><div id="qen">' + enemySVG(genre, 90) + '</div><b>' + esc(ENEMIES[genre][0]) + '</b><div class="qbar"><i style="width:' + Math.max(0, B.ehp) + '%;background:#d64545"></i></div><div class="qhearts">' + '❤️'.repeat(B.hearts) + '🖤'.repeat(3 - B.hearts) + '</div><div class="qm">' + (B.combo > 1 ? '🔥 ' + B.combo + ' コンボ!' : K('こうげきりょく ', 'こうげき ') + atk) + '</div></div>',
        nextLabel: null,
        onAnswer: function (ok) {
          if (ok) { B.combo++; var dmg = Math.round(atk * Math.min(3, 1 + (B.combo - 1) * .5)); B.ehp -= dmg; var c = giveCard(q, rng(Date.now() + q.id)); addXp(2); }
          else { B.combo = 0; B.hearts--; B.miss.push(q.id); }
          Store.save();
          var en = $('#qfb'); if (en) en.insertAdjacentHTML('afterbegin', '<div class="qfb ' + (ok ? 'ok' : 'ng') + '">' + (ok ? '⚔️ ' + Math.round(atk * Math.min(3, 1 + (B.combo - 1) * .5)) + ' ' + K('ダメージ!', 'ダメージ!') + (B.ehp <= 0 ? ' ' + K('たおした!', 'たおした!') : '') : '💥 ' + K('こうげきを うけた…', 'こうげきを うけた…')) + '</div>');
        },
        next: next
      });
    }
    function end(win) {
      var s = st(); if (win) { s.battles.win++; addXp(10); } else s.battles.lose++; Store.save();
      var miss = B.miss.map(qById).filter(Boolean);
      draw('<div class="qc qbud"><h2>' + (win ? K('かった! 🎉', 'かった! 🎉') : K('まけちゃった…', 'まけちゃった…')) + '</h2>' + enemySVG(genre, 110) + '<div class="qbub">' + (win ? '+10 けいけんち' : K('おぼえれば つぎは かてるよ!', 'おぼえれば つぎは かてるよ!')) + '</div></div>' +
        (miss.length ? '<div class="qc"><h2>' + K('この問題を 覚えよう', 'この もんだいを おぼえよう') + '</h2>' + miss.map(function (q) { return '<div style="margin-bottom:10px"><b>' + T(q.q) + '</b><div>' + K('正解', 'せいかい') + ':' + T(q.a) + '</div><div class="qmn">💡 ' + T(q.mn) + '</div></div>'; }).join('') + '</div>' : '') +
        '<button class="qb pri" id="qagain">' + K('もういちど', 'もういちど') + '</button><button class="qb" id="qsel">' + K('ほかの てきと たたかう', 'ほかの てき') + '</button><button class="qb" id="qhome">' + K('ホームへ', 'ホームへ') + '</button>');
      $('#qagain').onclick = function () { battle(genre); }; $('#qsel').onclick = bsel; $('#qhome').onclick = home;
    }
    next();
  }

  /* --- せってい --- */
  function settings() {
    var s = st();
    draw('<div class="qc"><h2>' + K('あいぼうの なまえ', 'あいぼうの なまえ') + '</h2><input id="qname" maxlength="8" value="' + esc(s.name) + '" placeholder="なまえ(8文字まで)" style="width:100%;min-height:52px;font-size:1em;padding:8px 12px;border:2px solid #cfc7b4;border-radius:12px;margin-bottom:10px" aria-label="あいぼうの なまえ"><button class="qb pri" id="qsn">' + K('なまえを つける', 'なまえを つける') + '</button></div>' +
      '<div class="qc"><h2>' + K('レベル・ジャンル', 'レベル・ジャンル') + '</h2><p style="margin:0 0 8px">' + esc(LEVELS[s.level]) + ' ・ ' + (s.genres.length ? esc(s.genres.join('・')) : 'おまかせ') + '</p><button class="qb" id="qchg">' + K('かえる', 'かえる') + '</button></div>' +
      '<div class="qc"><h2>きろく</h2><div class="qm">' + K('この端末に 保存されています(機種変更では 引きつげません)', 'この スマホに ほぞんされています') + '</div><button class="qb sm" id="qreset" style="margin-top:8px">' + K('ぜんぶ けして はじめから', 'ぜんぶ けす') + '</button></div>' + bottomNav('set'));
    bindNav();
    $('#qsn').onclick = function () { st().name = $('#qname').value.trim().slice(0, 8); Store.save(); home(); };
    $('#qchg').onclick = setup;
    $('#qreset').onclick = function () { if (confirm('きろくを ぜんぶ けします。よろしいですか?')) { Store.mem = Store.blank(); Store.save(); setup(); } };
  }

  /* --- GAME メニュー(助け合いの最初の画面と同じ作り) --- */
  function hub() {
    draw('<h2 class="hph">GAME</h2><div class="card hpq"><div class="hpl" style="margin-top:0">⭕❌ ○×ゲーム</div><button type="button" class="hmg wide" id="gox" style="margin:0">○×ゲームで あそぶ</button><p class="small" style="margin:8px 0 0">同じスマホを 貸し借りして 2人で対戦、またはコンピューターと対戦します。</p></div>' +
      '<div class="card hpq"><div class="hpl" style="margin-top:0">🎯 今日の3問</div><button type="button" class="hmg wide" id="gdaily" style="margin:0">今日の3問に挑戦</button><p class="small" style="margin:8px 0 0">答えると相棒が育ち、正解した問題がカードになります。</p></div>' +
      '<div class="card hpq"><div class="hpl" style="margin-top:0">🗾 日本一周スゴロク</div><button type="button" class="hmg wide" id="gtrip" style="margin:0">スゴロクで あそぶ</button><p class="small" style="margin:8px 0 0">日本地図の上を旅します。止まったマスで1問。まちがえたら戻ります。</p></div>');
    $('#gox').onclick = ox; $('#gdaily').onclick = home; $('#gtrip').onclick = openTrip;
  }

  /* --- ○×ゲーム(2人 または コンピューター) --- */
  var OXL = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  function oxWin(b) { for (var i = 0; i < OXL.length; i++) { var l = OXL[i]; if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { m: b[l[0]], l: l }; } return null; }
  function oxFull(b) { return b.every(function (x) { return x; }); }
  function oxMinimax(b, me, turn) {
    var w = oxWin(b); if (w) return w.m === me ? 10 : -10; if (oxFull(b)) return 0;
    var best = turn === me ? -99 : 99;
    for (var i = 0; i < 9; i++) if (!b[i]) { b[i] = turn; var v = oxMinimax(b, me, turn === 'O' ? 'X' : 'O'); b[i] = ''; best = turn === me ? Math.max(best, v) : Math.min(best, v); }
    return best;
  }
  function oxCpu(b, me, lv) {
    var em = []; for (var i = 0; i < 9; i++) if (!b[i]) em.push(i);
    var rnd = function (a) { return a[Math.floor(Math.random() * a.length)]; }, you = me === 'O' ? 'X' : 'O';
    if (lv === 0) return rnd(em);
    var tryWin = function (m) { for (var k = 0; k < em.length; k++) { b[em[k]] = m; var w = oxWin(b); b[em[k]] = ''; if (w) return em[k]; } return -1; };
    if (lv === 1) { var a = tryWin(me); if (a >= 0) return a; a = tryWin(you); if (a >= 0) return a; if (!b[4]) return 4; var c = em.filter(function (x) { return [0, 2, 6, 8].indexOf(x) >= 0; }); return c.length ? rnd(c) : rnd(em); }
    var best = -99, mv = [];
    em.forEach(function (i) { b[i] = me; var v = oxMinimax(b, me, you); b[i] = ''; if (v > best) { best = v; mv = [i]; } else if (v === best) mv.push(i); });
    return rnd(mv);
  }
  function ox() {
    draw('<h2 class="hph">○×ゲーム</h2><div class="card hpq"><div class="hpl" style="margin-top:0">だれと あそぶ?</div><button type="button" class="hmg wide" id="oxp" style="margin:0 0 10px">👥 2人で(スマホを貸し借り)</button><button type="button" class="hmg wide alt" id="oxc" style="margin:0">🤖 コンピューターと</button></div><button class="qb" id="oxb">← GAMEの メニュー</button>');
    $('#oxp').onclick = function () { oxStart({ mode: 'pvp', first: 'O' }); }; $('#oxc').onclick = oxLevel; $('#oxb').onclick = hub;
  }
  function oxLevel() {
    draw('<h2 class="hph">コンピューターの つよさ</h2><div class="card hpq"><button type="button" class="hmg wide" data-lv="0" style="margin:0 0 10px">😊 やさしい</button><button type="button" class="hmg wide" data-lv="1" style="margin:0 0 10px">🙂 ふつう</button><button type="button" class="hmg wide alt" data-lv="2" style="margin:0">😎 つよい(なかなか 勝てません)</button></div><button class="qb" id="oxb">← もどる</button>');
    bind('[data-lv]', function (b) { oxStart({ mode: 'cpu', lv: +b.dataset.lv, first: 'O' }); }); $('#oxb').onclick = ox;
  }
  function oxStart(o) {
    var g = { mode: o.mode, lv: o.lv, board: ['', '', '', '', '', '', '', '', ''], turn: o.first, first: o.first, me: 'O', done: false, win: null, score: o.score || { O: 0, X: 0, d: 0 } };
    function nm(m) { return g.mode === 'cpu' ? (m === g.me ? 'あなた(' + (m === 'O' ? '○' : '×') + ')' : 'コンピューター(' + (m === 'O' ? '○' : '×') + ')') : (m === 'O' ? '○ の人' : '× の人'); }
    function paint(last) {
      var w = g.win, st;
      if (g.done) st = w ? '🎉 ' + nm(w.m) + ' の勝ち!' : '🤝 引き分け'; else st = (g.mode === 'pvp' ? nm(g.turn) + ' の番です' : (g.turn === g.me ? 'あなたの 番です' : 'コンピューターが 考え中…'));
      draw('<h2 class="hph">○×ゲーム</h2><div class="card" style="text-align:center"><div style="font-size:1.15em;font-weight:700;min-height:1.7em" id="oxst">' + st + '</div>' + (g.mode === 'pvp' && !g.done ? '<div class="qm">打ったら、つぎの人に スマホを わたしてね</div>' : '') +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px auto;max-width:340px">' + g.board.map(function (v, i) {
          var on = w && w.l.indexOf(i) >= 0; return '<button type="button" class="oxc" data-i="' + i + '" aria-label="' + (v || 'あき') + '" style="aspect-ratio:1/1;min-height:90px;border:3px solid ' + (on ? '#e0a300' : '#cfc7b4') + ';border-radius:16px;background:' + (on ? '#fff4d6' : '#fff') + ';font-size:3.2em;font-weight:800;line-height:1;color:' + (v === 'O' ? '#d64545' : '#2f7fd0') + ';cursor:pointer;font-family:inherit' + (i === last ? ';animation:oxpop .25s' : '') + '">' + (v === 'O' ? '○' : v === 'X' ? '×' : '') + '</button>'; }).join('') + '</div>' +
        '<div class="qm">せんせき ○ ' + g.score.O + ' ・ × ' + g.score.X + ' ・ 引き分け ' + g.score.d + '</div></div>' +
        (g.done ? '<button class="qb pri" id="oxagain">もう一回(先に打つ人を かえる)</button>' : '') + '<button class="qb" id="oxb">← おわる</button><style>@keyframes oxpop{0%{transform:scale(.4)}100%{transform:scale(1)}}</style>');
      bind('.oxc', function (b) { move(+b.dataset.i); });
      $('#oxb').onclick = ox; var ag = $('#oxagain'); if (ag) ag.onclick = function () { oxStart({ mode: g.mode, lv: g.lv, first: g.first === 'O' ? 'X' : 'O', score: g.score }); };
    }
    function after(i) {
      var w = oxWin(g.board); if (w) { g.done = true; g.win = w; g.score[w.m]++; } else if (oxFull(g.board)) { g.done = true; g.score.d++; } else g.turn = g.turn === 'O' ? 'X' : 'O';
      paint(i);
      if (!g.done && g.mode === 'cpu' && g.turn !== g.me) setTimeout(function () { if (g.done) return; var c = oxCpu(g.board, g.turn, g.lv); g.board[c] = g.turn; after(c); }, 600);
    }
    function move(i) { if (g.done || g.board[i] || (g.mode === 'cpu' && g.turn !== g.me)) return; g.board[i] = g.turn; after(i); }
    paint(-1);
    if (g.mode === 'cpu' && g.turn !== g.me) setTimeout(function () { var c = oxCpu(g.board, g.turn, g.lv); g.board[c] = g.turn; after(c); }, 600);
  }

  /* --- 日本旅すごろく(quiz-trip.js を読みこむ) --- */
  function openTrip() {
    var run = function () { window.HmtQuizTrip.start(api()); };
    if (window.HmtQuizTrip) return run();
    var sc = document.createElement('script'); sc.src = 'quiz-trip.js?v=2'; sc.onload = run;
    sc.onerror = function () { toastMsg('すごろくを よみこめませんでした'); };
    document.head.appendChild(sc);
  }
  function toastMsg(t) { var d = document.createElement('div'); d.textContent = t; d.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#222;color:#fff;padding:10px 16px;border-radius:12px;z-index:99'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2500); }
  function api() {
    return { ask: ask, addXp: addXp, giveCard: giveCard, draw: draw, bind: bind, st: st, Store: Store, K: K, T: T, esc: esc, rng: rng, shuffle: shuffle, poolFor: poolFor, qById: qById, buddySVG: buddySVG, home: home, hub: hub, bsel: bsel, data: DATA, root: function () { return root; }, LV_SEC: LV_SEC, stageOf: stageOf, stopTimer: stopTimer };
  }

  /* ===== 起動 ===== */
  function mount(el, opts) {
    root = el; root.id = 'qz';
    if (!document.getElementById('qzcss')) { var sty = document.createElement('style'); sty.id = 'qzcss'; sty.textContent = CSS; document.head.appendChild(sty); }
    root.innerHTML = '<div class="qc">よみこみ中…</div>';
    var url = (opts && opts.dataUrl) || 'quiz-data.json';
    function load() {
      fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); }).then(function (d) {
        DATA = d; V = {}; hub();
      }).catch(function () {
        root.innerHTML = '<div class="qc"><h2>よみこめませんでした</h2><p>通信を 確かめて、もう一度 おためしください。</p><button class="qb pri" id="qretry">もう一度</button></div>';
        document.getElementById('qretry').onclick = load;
      });
    }
    load();
  }
  window.HmtQuiz = { mount: mount, _store: Store };
  if (typeof module !== 'undefined') module.exports = window.HmtQuiz;
})();
