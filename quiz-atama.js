/* あたまおしり(quiz.js から呼ばれます: HmtAtama.start(api))
   おだい = 「さいしょの もじ」と「さいごの もじ」。その2つで ことばを つくり、いちばん ながい ひとが ポイント。
   ポイントは どうぶつが パクッと たべて おおきくなる。いっぱいに なったら ずかんに のって、つぎは ひとつ うえの レベル(プレミア)。
   ことばは quiz-atama.json(あとから ふやせます)。きろくは この たんまつの localStorage。 */
(function () {
  'use strict';
  var WORDS0 = ["あいさつ","あいす","あいすくりーむ","あいち","あお","あおぞら","あおむし","あおもり","あか","あかちゃん","あかとんぼ","あかり","あきかぜ","あきた","あきち","あきまつり","あくしゅ","あげもち","あご","あさ","あさがお","あさがや","あさくさ","あさごはん","あさって","あさつゆ","あさひ","あさやけ","あさり","あざらし","あし","あしあと","あしおと","あした","あしたば","あじ","あじさい","あずかりしょ","あずき","あぜみち","あそびば","あたたかい","あたま","あつい","あつりょく","あなぐま","あなご","あひる","あぶ","あぶら","あぶらあげ","あぷり","あまがさ","あまやどり","あみど","あめ","あめだま","あめんぼ","あやとり","あらいぐま","あらし","あられ","あり","ありくい","ありじごく","ありんこ","あるかり","あるぱか","あわだてき","あわび","あんず","あんない","あんぱん","いいわけ","いえ","いえじ","いか","いかだ","いきもの","いけ","いけぶくろ","いし","いしかわ","いしがき","いしころ","いしだん","いしゃ","いす","いずみ","いたずら","いただきます","いたち","いち","いちご","いちごがり","いちじく","いちば","いちょう","いちょうなみき","いってきます","いってらっしゃい","いっぽんみち","いっりんしゃ","いつつ","いとこ","いなか","いなずま","いなりずし","いぬ","いのかしらこうえん","いのかしらせん","いのしし","いのち","いばらき","いぶくろ","いもうと","いもむし","いもり","いりたまご","いるか","いろえんぴつ","いわ","いわし","いわて","いわやま","いんげん","いんこ","いんしょく","いんたーねっと","いんりょく","うぇぶさいと","うえの","うきぐも","うきわ","うぐいす","うさぎ","うし","うず","うずら","うた","うちあげはなび","うちゅう","うちゅうせん","うちわ","うで","うでどけい","うどん","うなぎ","うなぎどん","うに","うま","うみ","うみがめ","うめ","うめぼし","うらみち","うれしい","うわさ","うんてんしゅ","うんどう","うんどうかい","うんどうじょう","えあこん","えいが","えいがかん","えいふくちょう","えがお","えき","えきたい","えくぼ","えころじー","えさ","えすかれーたー","えぞしか","えぞりす","えだ","えだまめ","えど","えのき","えのぐ","えひめ","えび","えびふらい","えほん","えれべーたー","えん","えんそう","えんそく","えんにち","えんぴつ","おいしい","おいしゃさん","おうぎがた","おうだんほどう","おうむ","おおあめ","おおいた","おおかぜ","おおかみ","おおきい","おおさか","おおそうじ","おおなみ","おおみそか","おおみや","おおゆき","おか","おかあさん","おかえり","おかき","おかし","おかね","おかやま","おかゆ","おきなわ","おきゃくさま","おぎくぼ","おく","おくじょう","おけ","おけはざま","おこのみやき","おさら","おしいれ","おしごと","おしどり","おしょうがつ","おしらせ","おしるこ","おしろ","おじいさん","おじさん","おせちりょうり","おせわ","おそい","おたま","おたまじゃくし","おだのぶなが","おだんご","おちば","おちゃ","おちゃづけ","おっとせい","おてがみ","おてだま","おてら","おでこ","おでん","おでんや","おと","おとうさん","おとうと","おとしだま","おとしもの","おととい","おとなり","おなか","おにいさん","おにぎり","おにごっこ","おねえさん","おはぎ","おはなし","おはなみ","おはやし","おはよう","おばあさん","おばさん","おひさま","おべんとう","おぼん","おまつり","おまわりさん","おみこし","おみやげ","おむすび","おむらいす","おめでとう","おもいで","おもしろい","おもちゃ","おやこ","おやこどん","おやすみ","おやま","おらんうーたん","おりがみ","おりひめ","おりーぶおいる","おるごーる","おわん","おんがく","おんがくかい","おんせん","おんど","おーとばい","おーぷんかー","かいおうせい","かいけい","かいしゃいん","かいすいよく","かいすいよくじょう","かいだん","かいちゅうでんとう","かいちょう","かいもの","かいらん","かいらんばん","かいろ","かいわ","かえる","かお","かかと","かがく","かがくはくぶつかん","かがみ","かがみもち","かがわ","かき","かきごおり","かぎ","かぎあな","かくれが","かくれんぼ","かけざん","かげ","かごしま","かさ","かざり","かし","かしや","かしわもち","かじ","かすみ","かせい","かぜ","かぜぐすり","かた","かたかな","かたぐるま","かたち","かたつむり","かたな","かつお","かつおぶし","かつどう","かつどん","かどまつ","かなあみ","かながわ","かなしい","かなづち","かなりあ","かに","かぬー","かね","かば","かばん","かぴばら","かぶと","かぶとむし","かべ","かべがみ","かぼちゃ","かまきり","かまくら","かまぼこ","かみ","かみしばい","かみなり","かみのけ","かめ","かもめ","からあげ","からかさ","からし","からす","からだ","かりふらわー","かりもの","かりんとう","かるた","かれい","かれんだー","かれー","かれーらいす","かわ","かわうそ","かわら","かんかく","かんがるー","かんきょうもんだい","かんごし","かんじ","かんなないどおり","かんばん","かーてん","かーと","かーぺっと","がくしゃ","がちょう","がっこう","がむ","がんもどき","きいろ","きうい","きおく","きかい","きかんしゃ","きく","きげん","きしゃ","きじ","きせつ","きた","きたい","きたかぜ","きたぐに","きちじょうじ","きって","きっぷ","きつつき","きつね","きつねうどん","きなこ","きのう","きみどり","きむち","きもだめし","きもち","きもの","きゃたぴらー","きゃべつ","きゃんぷ","きゃんぷじょう","きゅう","きゅうきゅうしゃ","きゅうしょく","きゅうす","きゅうり","きょう","きょうかしょ","きょうしつ","きょうと","きょねん","きり","きりん","きんいろ","きんかん","きんぎょ","きんぎょすくい","きんこ","きんじょ","きんせい","きんにく","きんぴら","ぎたー","ぎふ","ぎゅうどん","ぎゅうにく","ぎゅうにゅう","ぎょうざ","ぎんいろ","ぎんが","ぎんこう","ぎんこういん","くうき","くうこう","くうこうばす","くがやま","くぎ","くさ","くさぶえ","くさもち","くし","くじゃく","くじら","くすり","くすりや","くずもち","くだもの","くち","くちぶえ","くちょう","くっきー","くつ","くつした","くつや","くび","くま","くまもと","くも","くらげ","くらし","くり","くりごはん","くりすます","くりーむ","くりーむぱん","くるま","くるまいす","くれよん","くれーんしゃ","くろ","くろねこ","くわがた","ぐれーぷふるーつ","ぐんま","けいかく","けいかん","けいけん","けいさつしゃ","けいさつしょ","けいじどうしゃ","けいたい","けいたいでんわ","けしき","けしごむ","けしょうひん","けちゃっぷ","けむし","けむり","けやき","けんか","けんこう","けんだま","けんちん","けんちんじる","けんばんはーもにか","けーき","けーぶるかー","げた","げっしょく","げんかん","げんごろう","げんし","げーむき","こあら","こい","こいのぼり","こうえん","こうえんじ","こうさてん","こうさん","こうしゃ","こうしんりょう","こうそくばす","こうち","こうちゃ","こうつう","こうとうがっこう","こうはい","こうばん","こうべ","こうもり","こえ","こおり","こおりみず","こおろぎ","こがらし","こくばん","こくまろう","こけ","ここのつ","こころ","こし","こしょう","こすもす","こたい","こたえ","こたつ","こっく","こっぷ","こづつみ","ことし","ことば","ことり","こども","こどもかい","こどものくに","こどものひ","こどもべや","こぴーき","こまつな","こままわし","こめ","こめつぶ","こめぬか","こもりうた","こもれび","ころっけ","こんいろ","こんせんと","こんだて","こんてなせん","こんにちは","こんにゃく","こんばんは","こんぱす","こんびに","こんぶ","こんぺいとう","こーと","こーひー","こーら","ごご","ごぜん","ごちそうさま","ごはん","ごぼう","ごまあぶら","ごみしゅうしゅうしゃ","ごみばこ","ごみぶんべつ","ごめんなさい","ごりら","ごるふじょう","ごーや","さい","さいくりんぐ","さいせいかのうえねるぎー","さいせいしげん","さいたま","さいだー","さいふ","さかな","さかなや","さかなやき","さかみち","さかもとりょうま","さかや","さが","さくぶん","さくら","さくらふぶき","さくらもち","さくらんぼ","さくらんぼがり","さけ","さこく","さざえ","さざんか","さしみ","さじ","さそり","さっぽろ","さつまいも","さといも","さとう","さなぎ","さば","さばく","さびしい","さむい","さむらい","さめ","さようなら","さら","さる","さるすべり","さん","さんかく","さんかくおにぎり","さんぎょう","さんしょううお","さんせい","さんどいっち","さんぽ","さんぽみち","さんま","さんりんしゃ","ざくろ","ざる","しあわせ","しいたけ","しいたけがり","しお","しおかぜ","しか","しかく","しが","しぐれ","しごと","しじみ","しずおか","しずく","しそ","した","したぎ","しだ","しちごさん","しっぽ","しながわ","しなもの","しのび","しぶや","しま","しまうま","しまね","しめかざり","しめじ","しも","しもばしら","しゃかいふくし","しゃしん","しゃしんかん","しゃち","しゃつ","しゃとるばす","しゃぶしゃぶ","しゃぼんだま","しゃも","しゃもじ","しゃんぷー","しやくしょ","しゅうかく","しゅうがくりょこう","しゅうじ","しゅうまい","しゅうまつ","しゅくだい","しゅみ","しょうが","しょうがっこう","しょうがつ","しょうすう","しょうてんがい","しょうぼうし","しょうぼうしゃ","しょうぼうしょ","しょうゆ","しょうゆさし","しょうわ","しょき","しょくぱん","しょくぶつえん","しょべるかー","しらかば","しらせ","しらたき","しらたま","しりとり","しるこ","しろ","しろくま","しんかんせん","しんごう","しんごうき","しんしつ","しんじゅく","しんせき","しんぞう","しんばる","しんぶん","しーそー","じかん","じこ","じしゃく","じしん","じちかい","じてんしゃ","じどううんてん","じどうしゃ","じどうはんばいき","じびき","じゃがいも","じゃむ","じゃんぐるじむ","じゅう","じゅうたん","じゅうにし","じゅーす","じょうぎ","じょうもん","じりょく","じんこうちのう","じんじゃ","すいか","すいせい","すいせいがん","すいせん","すいぞくかん","すいっち","すいとう","すいとん","すいはんき","すいへいせん","すうじ","すかーと","すきま","すきやき","すきーじょう","すぎ","すぎなみ","すぎなみく","すくーたー","すくーるばす","すけーとじょう","すごろく","すし","すすき","すずかけ","すずしい","すずなり","すずむし","すずめ","すずり","すっぽん","すてき","すな","すなどけい","すなはま","すなば","すね","すのーもーびる","すぱげってぃ","すぱな","すぷーん","すべりだい","すまい","すまーとふぉん","すみ","すみません","すみれ","すーぱー","ずぼん","せいうち","せいかつ","せいねんだん","せいほうけい","せいろ","せかい","せきがはら","せせらぎ","せだん","せっけん","せっけんばこ","せつぶん","せなか","せみ","せり","せん","せんげつ","せんごく","せんざい","せんしゅ","せんしゅう","せんす","せんせい","せんたくき","せんだい","せんぱい","せんぷうき","せんべい","せんろ","せーたー","ぜりー","ぜんざい","ぜんぷくじ","ぜんぷくじがわ","ぜんまい","そうじき","そうだん","そうめん","そつぎょう","そとあそび","そば","そばがき","そばちょこ","そよかぜ","そら","そらまめ","そり","そーす","そーせーじ","ぞう","ぞうきん","ぞうに","ぞうり","たい","たいいくかん","たいけい","たいけん","たいこ","たいしょう","たいそう","たいふう","たいやき","たいよう","たいようけい","たいようこうはつでん","たおる","たか","たかい","たからばこ","たがめ","たき","たくあん","たくしー","たくはいびん","たけ","たけのこ","たこ","たこあげ","たこあし","たこやき","たしざん","たたみ","たたみや","ただいま","たつ","たつのおとしご","たてもの","たなぐま","たなばた","たなばたかざり","たに","たにし","たぬき","たね","たのしい","たのしみ","たび","たびじ","たびびと","たぶれっと","たまご","たまごやき","たましい","たまねぎ","たらこ","たわし","たんくろーりー","たんす","たんちょう","たんでむ","たんばりん","たんぼ","たんぽぽ","だいがくいん","だいく","だいこん","だいず","だいだいいろ","だいどころ","だし","だちょう","だるまさんがころんだ","だんけつ","だんご","だんごむし","だんぷかー","だんぼーるばこ","だんらん","だんろ","ちいき","ちいきぐるみ","ちいさい","ちえ","ちかてつ","ちから","ちきゅう","ちきゅうおんだんか","ちくわ","ちず","ちば","ちまき","ちゃいろ","ちゃっく","ちゃのみ","ちゃるめら","ちゃわん","ちゃわんむし","ちゃーはん","ちゅうがっこう","ちゅうしゃじょう","ちゅうしょく","ちゅうせいし","ちゅうりんじょう","ちゅーりっぷ","ちょう","ちょうかい","ちょうかいちょう","ちょうかいひ","ちょうせん","ちょうちょ","ちょうちょう","ちょうちん","ちょうつがい","ちょうないかい","ちょうほうけい","ちょうめん","ちょこれーと","ちょーく","ちらしずし","ちりがみ","ちりとり","ちんぱんじー","ちーず","ちーたー","ついたて","つうがく","つうちひょう","つき","つきみ","つくえ","つくし","つくだに","つけもの","つち","つなひき","つばき","つばめ","つぼみ","つまさ","つみき","つむじかぜ","つめ","つめきり","つゆ","つゆくさ","つよい","つらら","つり","つりぶね","つる","てぃっしゅ","ていれび","てがみ","てじな","てすり","てっぽう","てつどう","てつぼう","てながざる","てにすこーと","てぶくろ","てまきずし","てるてるぼうず","てれび","てれびげーむ","てんき","てんしゅかく","てんじょう","てんとうむし","てんどん","てんのうせい","てんのがわ","てんぷら","でじたるかめら","でぱーと","でんき","でんきじどうしゃ","でんきゅう","でんし","でんしめーる","でんしゃ","でんしゃみち","でんしれんじ","でんじしゃく","でんち","でんわ","といれ","とうかく","とうきょう","とうげ","とうふ","とうもろこし","とうろう","とお","とかげ","とくがわいえやす","とくしま","とけい","とけいや","ところてん","とざん","としょかん","とちぎ","とっとり","とびら","とまと","ともしび","ともだち","とやま","とよとみひでよし","とら","とらくたー","とらっく","とらんぷ","とり","とりにく","とろっこ","とんかつ","とんねる","とんび","とんぼ","どうぶつ","どうぶつえん","どうろ","どくしょ","どじょう","どせい","どらいばー","どらやき","どろぼう","どろーん","どんぐり","ないふ","なかま","ながい","ながぐつ","ながさき","ながの","ながれぼし","なごや","なし","なす","なずな","なぞなぞ","なだれ","なっとう","なつ","なつみかん","なつやすみ","なな","ななくさがゆ","ななつ","なにわぶし","なは","なべ","なまえ","なまけもの","なまこ","なまず","なみ","なめくじ","なめこ","なら","ならづけ","なんばんぼうえき","にいがた","にいがたけん","にぎりずし","にぎりめし","にく","にくや","にし","にしえいふく","にじ","にじいろ","にじます","にっしょく","にっぽん","にほんかもしか","にぼし","にもつ","にら","にりんしゃ","にわ","にわとり","にんぎょう","にんじゃ","にんじん","にんにく","ぬいぐるみ","ぬくもり","ぬたあえ","ぬりえ","ぬー","ねがい","ねぎ","ねぎま","ねくたい","ねこ","ねじ","ねじまわし","ねずみ","ねだん","ねつ","ねんがじょう","ねんど","のうぎょう","のきした","のこぎり","のど","のどあめ","のはら","のやま","のり","のりあいばす","のりば","のりまき","のろし","のろじか","のんびり","のーと","はいいろ","はいきんぐ","はいぞう","はいたつ","はえ","はがき","はくさい","はくしゅ","はくちょう","はくぶつかん","はさみ","はし","はしけ","はしご","はたけ","はち","はちまき","はちみつ","はちみつれもん","はっさく","はっぴ","はつもうで","はと","はな","はなたば","はなび","はなふぶき","はなみち","はなや","はねつき","ははおやくらぶ","はぶらし","はま","はまぐり","はまだやま","はまだやまえき","はみがき","はむすたー","はやい","はやし","はやぶさ","はりねずみ","はる","はるいちばん","はるさめ","はるまき","はるやすみ","はれ","はんかち","はんこ","はんし","はんちょう","はんてん","はんばーがー","はんばーぐ","はーもにか","ばいおりん","ばいく","ばぎー","ばけつ","ばす","ばたー","ばち","ばった","ばなな","ばら","ばーべきゅー","ばーる","ぱいなっぷる","ぱいろっと","ぱじゃま","ぱそこん","ぱとかー","ぱとろーる","ぱぱいや","ぱん","ぱんだ","ぱんや","ぱんやさん","ひかり","ひがし","ひがんばな","ひきざん","ひきだし","ひきにく","ひくい","ひぐま","ひげ","ひげそり","ひこうき","ひこうじょう","ひざ","ひしがた","ひじ","ひじき","ひじょうぐち","ひじょうよう","ひだまり","ひつじ","ひとつ","ひとで","ひなあられ","ひなた","ひなたぼっこ","ひなまつり","ひなんくんれん","ひなんじょ","ひのき","ひのよーじん","ひばち","ひばり","ひまわり","ひまわりばたけ","ひみつ","ひゃく","ひやむぎ","ひややっこ","ひょう","ひょうご","ひよこ","ひらめ","ひりこぷたー","ひる","ひるやすみ","ひろしま","ひろば","びじゅつかん","びょういん","びわ","ぴあの","ぴくにっく","ぴーまん","ふぁんひーたー","ふうけい","ふうしゃ","ふうせん","ふうとう","ふうりょくはつでん","ふうりん","ふぇりー","ふえ","ふぉーく","ふぉーくりふと","ふき","ふきのとう","ふきん","ふく","ふくい","ふくおか","ふくかいちょう","ふくしま","ふくびき","ふくろう","ふくろてなが","ふくろねずみ","ふぐ","ふしぎ","ふじさん","ふじんかい","ふたつ","ふで","ふでばこ","ふとん","ふね","ふぶき","ふゆ","ふゆげしき","ふゆやすみ","ふらいぱん","ふらみんご","ふりかけ","ふるーと","ふれあいさろん","ふろば","ふろや","ぶしどう","ぶた","ぶたじる","ぶたにく","ぶどう","ぶな","ぶらんこ","ぶるーべりー","ぶろっこりー","ぶんし","ぶんすう","ぶんぼうぐ","ぷらぐ","ぷりずむ","ぷりん","ぷりんたー","ぷーる","へいあん","へいじつ","へいせい","へいほう","へいわ","へちま","へび","へや","へやぎ","へら","へりこぷたー","べびーかー","べらんだ","べると","べんきょう","べーこん","ぺん","ぺんぎん","ぺんち","ほいくえん","ほうき","ほうじちゃ","ほうちょう","ほうほう","ほうれんそう","ほおずき","ほくろ","ほこら","ほし","ほしぞら","ほしぞらかんそく","ほたて","ほたる","ほたるがり","ほたるぶくろ","ほっかいどう","ほっきょくぐま","ほっちきす","ほっとどっぐ","ほね","ほのお","ほばーくらふと","ほほ","ほや","ほりばた","ほろほろちょう","ほんだな","ほんのうじ","ほんもの","ほんや","ほーむへるぱー","ぼうかさつ","ぼうさい","ぼうさいくんれん","ぼうさいずきん","ぼうし","ぼうはん","ぼうる","ぼたもち","ぼたん","ぼんおどり","ぼんおどりたいかい","ぼーと","ぼーりんぐ","ぼーるぺん","ぽっぷこーん","ぽてと","ぽてとちっぷす","ぽんかん","まいくろばす","まいたけ","まいにち","まくら","まぐろ","まじっく","ます","まちあわせ","まっち","まっちゃ","まつ","まつげ","まつぼっくり","まど","まどぎわ","まないた","まなざし","まふらー","まむし","まめ","まゆげ","まよねーず","まらかす","まる","まん","まんげつ","まんごー","まんじゅう","まんなか","まんぼう","みえ","みかづき","みかん","みかんがり","みさき","みじかい","みずあそび","みずいろ","みずすまし","みずたま","みずな","みそ","みそしる","みたらしだんご","みち","みちしるべ","みっつ","みつばち","みどり","みなと","みなみ","みにかー","みにばす","みのむし","みまもりたい","みみ","みみかき","みみず","みやぎ","みやこ","みやざき","みょうが","みらー","みるくてぃー","みーあきゃっと","むかしばなし","むかで","むぎちゃ","むぎばたけ","むぎわら","むささび","むし","むしかご","むっつ","むね","むらさき","むろまち","めいし","めいじ","めいだいまえ","めいろ","めがね","めざましどけい","めじるし","めじろ","めだか","めだまやき","めぶき","めろん","めろんぱん","めんこ","めんたいこ","めんぼう","もうふ","もくせい","もぐら","もじ","もず","もち","もちつき","ものがたり","ものさし","ものれーる","もみじ","もみじがり","もも","ももいろ","もやし","もり","もりのくまさん","もるもっと","もんじゃやき","もーたーぼーと","やおや","やかん","やきいも","やきがし","やきざかな","やきそば","やきとり","やきにく","やきゅうじょう","やぎ","やぎゅう","やくそく","やさい","やさしい","やっつ","やなぎ","やなぎごおり","やね","やま","やまがた","やまぐち","やまなし","やまねこ","やもり","やよい","やり","ゆうえんち","ゆうがた","ゆうき","ゆうそうしゃ","ゆうだち","ゆうひ","ゆうびん","ゆうびんきょく","ゆうびんやさん","ゆうやけ","ゆうらんせん","ゆか","ゆかた","ゆき","ゆきうさぎ","ゆきがっせん","ゆきだるま","ゆげ","ゆず","ゆたんぽ","ゆでたまご","ゆのみ","ゆび","ゆみや","ゆめ","ゆり","ゆりかもめ","よあけ","ようかん","ようぐると","ようじ","ようちえん","ようふく","よこちょう","よこはま","よしきり","よぞら","よたか","よっつ","よっと","よてい","よる","よろい","よろしく","よわい","よん","よーぐると","らいう","らいおん","らいげつ","らいしゅう","らいたー","らいち","らいちょう","らいとれーる","らいねん","らくがき","らくだ","らじお","らずべりー","らっきょう","らっこ","らん","らんどせる","らんぷ","らーめん","りくがめ","りこーだー","りさいくる","りす","りびんぐ","りぼん","りむじん","りもこん","りゃま","りゅうひょう","りょうり","りょこう","りんご","りんどう","れいぞうこ","れいわ","れきし","れっさーぱんだ","れもん","れんげ","れんこん","れんらくちょう","れーん","ろうか","ろうじんくらぶ","ろうそく","ろく","ろけっと","ろば","ろぼっと","ろめんでんしゃ","ろーぷ","ろーぷうぇい","ろーぷうぇー","ろーらー","ろーるけーき","わかさぎ","わかば","わかめ","わかやま","わくせい","わくせいだん","わごむ","わごん","わさび","わし","わすれもの","わたあめ","わたぐも","わだい","わに","わらいごえ","わらび","わらびもち","わりざん","わんぴーす"];
  var A, DICT = null, IDX = null, SET = null, KEY = 'hmt_atama_v1', timer = null, recent = [];
  var CSS = '#qz .apet{position:relative;height:250px;display:flex;align-items:flex-end;justify-content:center;border-radius:20px;background:linear-gradient(#e9f6ff,#f6fbf0 70%,#e7dfc4 71%);overflow:hidden;margin:0 0 10px}' +
    '#qz .apet.pm{background:linear-gradient(#fff4c9,#fff9e4 70%,#ecd9a0 71%)}' +
    '#qz .apet svg{width:200px;height:200px;transform-origin:50% 100%;transform:scale(var(--s,.5));transition:transform .7s cubic-bezier(.3,1.6,.5,1);overflow:visible;margin-bottom:8px}' +
    '#qz svg .mo{display:none}#qz svg.op .mc{display:none}#qz svg.op .mo{display:inline}' +
    '@keyframes abl{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}#qz .apet svg .ey{transform-box:fill-box;transform-origin:center;animation:abl 4s infinite}' +
    '@keyframes abob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}#qz .apet.bob svg{animation:abob 1.6s ease-in-out infinite}' +
    '#qz .atok{position:absolute;min-width:30px;height:30px;padding:0 2px;box-sizing:border-box;border-radius:8px;background:#fff;border:2px solid #6a4bd6;box-shadow:0 2px 4px rgba(0,0,0,.2);z-index:3;font-size:19px;font-weight:800;color:#3a2a8a;text-align:center;line-height:26px}' +
    '#qz .abub{position:relative;background:#fffbe6;border:2px solid #e0a300;border-radius:16px;padding:10px 12px;margin:0 0 10px;font-weight:800;line-height:1.6;color:#5a3b00}#qz .abub:before{content:"";position:absolute;left:24px;top:-10px;border:8px solid transparent;border-bottom-color:#e0a300;border-top:0}' +
    '#qz .abad{display:inline-block;padding:2px 12px;border-radius:99px;background:#6a4bd6;color:#fff;font-weight:800;font-size:.9em;margin-right:6px}#qz .abad.pm{background:linear-gradient(90deg,#e0a300,#f6d365);color:#5a3b00}' +
    '#qz .aq{display:flex;align-items:center;justify-content:center;gap:10px;margin:6px 0 10px}#qz .aq b{display:flex;align-items:center;justify-content:center;width:84px;height:84px;border-radius:20px;background:#fff;border:3px solid #6a4bd6;font-size:46px;color:#3a2a8a;box-shadow:0 3px 0 #cfc7f0}#qz .aq span{font-size:1.4em;color:#667085;font-weight:800}' +
    '#qz .ain{width:100%;font-size:1.3em;padding:12px 14px;border:3px solid #cfc7b4;border-radius:14px;background:#fff;color:#1b2438;font-family:inherit}#qz .ain:focus{outline:none;border-color:#6a4bd6}' +
    '#qz .aw{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}#qz .aw span{padding:3px 12px;border-radius:99px;background:#fff;border:2px solid #cfc7b4;font-weight:700}#qz .aw span.best{background:#e3f3ea;border-color:#1f7a4d}#qz .aw span.unk{border-style:dashed}' +
    '#qz .arow{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:#fff;border:2px solid #e4ddcf;margin:0 0 6px}#qz .arow.me{border-color:#6a4bd6;background:#f4f1ff}#qz .arow .rk{font-size:1.4em;width:1.6em;text-align:center}#qz .arow .nm{flex:1;font-weight:700}#qz .arow .ln{font-weight:800;color:#3a2a8a}' +
    '#qz .apick{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}#qz .apick button{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;border:3px solid #e4ddcf;border-radius:16px;background:#fff;padding:4px 2px 8px;font-weight:800;font-size:.9em}#qz .apick button.on{border-color:#6a4bd6;background:#f4f1ff}#qz .apick svg{width:78px;height:78px;display:block;margin:0 auto}' +
    '#qz .adf{display:flex;gap:6px;margin:6px 0 10px}#qz .adf button{all:unset;box-sizing:border-box;cursor:pointer;flex:1;text-align:center;padding:9px 4px;border-radius:12px;border:2px solid #cfc7b4;background:#fff;font-weight:800}#qz .adf button.on{background:#6a4bd6;border-color:#6a4bd6;color:#fff}' +
    '#qz .adex{display:flex;flex-wrap:wrap;gap:6px}#qz .adex span{padding:3px 10px;border-radius:10px;background:#fff8e8;border:1px solid #d9b44a;font-size:.92em}#qz .adex small{color:#8a6a10}' +
    '@keyframes asp{0%{transform:scale(.3);opacity:0}30%{opacity:1}100%{transform:translateY(-70px) scale(1.2);opacity:0}}#qz .asp{position:absolute;font-size:26px;animation:asp 1.2s ease-out forwards;z-index:4}' +
    '#qz .agr{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}#qz .agr div{flex:0 0 auto;text-align:center;font-size:.8em;font-weight:700;border-radius:14px;padding:4px 6px;background:#fff;border:2px solid #e4ddcf}#qz .agr div.pm{border-color:#e0a300;background:#fff9e4}#qz .agr svg{width:64px;height:64px;display:block}';

  /* ===== どうぶつ ===== */
  var PETS = [['hiyoko', 'ひよこ'], ['neko', 'ねこ'], ['tora', 'とら'], ['rakko', 'らっこ'], ['hamu', 'はむすたー'], ['risu', 'りす'], ['inu', 'いぬ']];
  function petName(k) { for (var i = 0; i < PETS.length; i++) if (PETS[i][0] === k) return PETS[i][1]; return ''; }
  var MC = '<path d="M91 121 Q100 130 109 121" stroke="#5a3a2a" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
  var MO = '<ellipse cx="100" cy="125" rx="14" ry="12" fill="#7a2a2a"/><ellipse cx="100" cy="132" rx="8" ry="4.5" fill="#ef7f8a"/>';
  function eyes(y, dx) { dx = dx || 20; return '<g class="ey"><circle cx="' + (100 - dx) + '" cy="' + y + '" r="6" fill="#222"/><circle cx="' + (100 + dx) + '" cy="' + y + '" r="6" fill="#222"/><circle cx="' + (102 - dx) + '" cy="' + (y - 2) + '" r="2" fill="#fff"/><circle cx="' + (102 + dx) + '" cy="' + (y - 2) + '" r="2" fill="#fff"/></g>'; }
  function animalBody(k) {
    var s = '';
    if (k === 'hiyoko') {
      s = '<ellipse cx="100" cy="186" rx="26" ry="5" fill="rgba(0,0,0,.08)"/><path d="M82 178 l-6 8 M82 178 l0 9 M82 178 l6 8 M118 178 l-6 8 M118 178 l0 9 M118 178 l6 8" stroke="#f08a1c" stroke-width="4" stroke-linecap="round"/>' +
        '<circle cx="100" cy="112" r="62" fill="#ffd84a"/><ellipse cx="48" cy="130" rx="14" ry="22" fill="#f6c126" transform="rotate(18 48 130)"/><ellipse cx="152" cy="130" rx="14" ry="22" fill="#f6c126" transform="rotate(-18 152 130)"/>' +
        '<path d="M92 52 q-4 -16 4 -20 M100 50 q0 -18 8 -20 M108 52 q6 -12 14 -12" stroke="#f6c126" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="68" cy="116" r="9" fill="#ffb09a" opacity=".7"/><circle cx="132" cy="116" r="9" fill="#ffb09a" opacity=".7"/>' + eyes(98, 24) +
        '<g class="mc"><polygon points="90,110 110,110 100,124" fill="#f08a1c"/></g><g class="mo"><polygon points="90,108 110,108 100,118" fill="#f08a1c"/><ellipse cx="100" cy="124" rx="11" ry="9" fill="#7a2a2a"/><polygon points="91,130 109,130 100,140" fill="#f08a1c"/></g>';
    } else if (k === 'neko') {
      s = '<ellipse cx="100" cy="186" rx="40" ry="5" fill="rgba(0,0,0,.08)"/><path d="M142 168 q36 -4 24 -44" stroke="#f0953a" stroke-width="12" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="158" rx="46" ry="30" fill="#f4a65a"/><ellipse cx="100" cy="166" rx="26" ry="20" fill="#fff0d9"/>' +
        '<polygon points="54,76 56,26 96,56" fill="#f4a65a"/><polygon points="146,76 144,26 104,56" fill="#f4a65a"/><polygon points="62,66 63,38 86,56" fill="#f7b6b0"/><polygon points="138,66 137,38 114,56" fill="#f7b6b0"/>' +
        '<circle cx="100" cy="100" r="52" fill="#f4a65a"/><path d="M92 54 v14 M100 52 v16 M108 54 v14" stroke="#d27b2c" stroke-width="4" stroke-linecap="round"/>' + eyes(98) +
        '<polygon points="94,108 106,108 100,115" fill="#e8707a"/><path d="M66 112 l-26 -4 M66 120 l-26 6 M134 112 l26 -4 M134 120 l26 6" stroke="#8a5a2a" stroke-width="2" stroke-linecap="round"/><g class="mc">' + MC + '</g><g class="mo">' + MO + '</g>';
    } else if (k === 'tora') {
      s = '<ellipse cx="100" cy="186" rx="42" ry="5" fill="rgba(0,0,0,.08)"/><ellipse cx="100" cy="158" rx="48" ry="30" fill="#f6a21e"/><path d="M70 140 v18 M88 136 v22 M112 136 v22 M130 140 v18" stroke="#2b1c0e" stroke-width="6" stroke-linecap="round"/><ellipse cx="100" cy="168" rx="26" ry="18" fill="#fff4dc"/>' +
        '<circle cx="58" cy="60" r="17" fill="#f6a21e"/><circle cx="142" cy="60" r="17" fill="#f6a21e"/><circle cx="58" cy="62" r="9" fill="#fff4dc"/><circle cx="142" cy="62" r="9" fill="#fff4dc"/>' +
        '<circle cx="100" cy="100" r="52" fill="#f6a21e"/><path d="M100 50 v16 M86 54 l4 14 M114 54 l-4 14 M52 92 l14 4 M52 108 l14 -2 M148 92 l-14 4 M148 108 l-14 -2" stroke="#2b1c0e" stroke-width="5" stroke-linecap="round"/>' + eyes(96, 22) +
        '<ellipse cx="100" cy="120" rx="30" ry="22" fill="#fff4dc"/><ellipse cx="100" cy="109" rx="8" ry="6" fill="#2b1c0e"/><g class="mc"><path d="M90 119 Q100 128 110 119" stroke="#2b1c0e" stroke-width="3.2" fill="none" stroke-linecap="round"/></g><g class="mo">' + MO + '</g>';
    } else if (k === 'rakko') {
      s = '<ellipse cx="100" cy="186" rx="44" ry="5" fill="rgba(0,0,0,.08)"/><ellipse cx="100" cy="158" rx="46" ry="30" fill="#8a5a3a"/><ellipse cx="100" cy="162" rx="30" ry="20" fill="#c9a37a"/><circle cx="76" cy="150" r="9" fill="#7a4d2e"/><circle cx="124" cy="150" r="9" fill="#7a4d2e"/><path d="M92 158 q8 -10 16 0 q-8 10 -16 0" fill="#e9d6b8" stroke="#8a6a44" stroke-width="2"/>' +
        '<circle cx="64" cy="66" r="12" fill="#8a5a3a"/><circle cx="136" cy="66" r="12" fill="#8a5a3a"/><circle cx="100" cy="100" r="52" fill="#8a5a3a"/><ellipse cx="100" cy="112" rx="40" ry="34" fill="#e8d3b5"/>' + eyes(98, 20) +
        '<ellipse cx="100" cy="109" rx="9" ry="6" fill="#3a2418"/><g fill="#a07a50"><circle cx="78" cy="118" r="2"/><circle cx="84" cy="123" r="2"/><circle cx="122" cy="118" r="2"/><circle cx="116" cy="123" r="2"/></g><g class="mc">' + MC + '</g><g class="mo">' + MO + '</g>';
    } else if (k === 'hamu') {
      s = '<ellipse cx="100" cy="186" rx="46" ry="5" fill="rgba(0,0,0,.08)"/><circle cx="100" cy="116" r="62" fill="#f2c27b"/><ellipse cx="100" cy="150" rx="40" ry="30" fill="#fff6e4"/>' +
        '<circle cx="62" cy="58" r="15" fill="#f2c27b"/><circle cx="138" cy="58" r="15" fill="#f2c27b"/><circle cx="62" cy="60" r="8" fill="#f7b6b0"/><circle cx="138" cy="60" r="8" fill="#f7b6b0"/>' +
        '<path d="M70 70 q30 -26 60 0" stroke="#d99b4a" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/><ellipse cx="62" cy="122" rx="22" ry="18" fill="#fff6e4"/><ellipse cx="138" cy="122" rx="22" ry="18" fill="#fff6e4"/><circle cx="66" cy="124" r="8" fill="#ffb09a" opacity=".7"/><circle cx="134" cy="124" r="8" fill="#ffb09a" opacity=".7"/>' + eyes(100, 22) +
        '<ellipse cx="100" cy="112" rx="6" ry="4.5" fill="#e8707a"/><g class="mc"><path d="M92 120 Q100 128 108 120" stroke="#5a3a2a" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="96" y="124" width="8" height="8" rx="2" fill="#fff" stroke="#c9a37a" stroke-width="1.5"/></g><g class="mo">' + MO + '</g>';
    } else if (k === 'risu') {
      s = '<ellipse cx="100" cy="186" rx="44" ry="5" fill="rgba(0,0,0,.08)"/><path d="M142 176 q52 -10 36 -70 q-8 -26 -34 -20 q22 8 14 38 q-6 22 -40 20z" fill="#8f4f27"/><path d="M146 168 q38 -10 28 -52" stroke="#c98a55" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="100" cy="158" rx="42" ry="30" fill="#b06a3b"/><ellipse cx="100" cy="166" rx="24" ry="19" fill="#f6e3c2"/><polygon points="62,70 62,34 90,56" fill="#b06a3b"/><polygon points="138,70 138,34 110,56" fill="#b06a3b"/><path d="M62 36 l-4 -10 M138 36 l4 -10" stroke="#8f4f27" stroke-width="4" stroke-linecap="round"/>' +
        '<circle cx="100" cy="102" r="48" fill="#b06a3b"/><ellipse cx="100" cy="118" rx="32" ry="26" fill="#f6e3c2"/>' + eyes(98, 20) + '<ellipse cx="100" cy="108" rx="6" ry="4.5" fill="#3a2418"/><g class="mc"><path d="M92 120 Q100 128 108 120" stroke="#5a3a2a" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="96" y="123" width="8" height="8" rx="2" fill="#fff" stroke="#c9a37a" stroke-width="1.5"/></g><g class="mo">' + MO + '</g>';
    } else {   // inu
      s = '<ellipse cx="100" cy="186" rx="44" ry="5" fill="rgba(0,0,0,.08)"/><path d="M142 170 q26 -6 20 -36" stroke="#e3b77c" stroke-width="11" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="158" rx="46" ry="30" fill="#e3b77c"/><ellipse cx="100" cy="166" rx="26" ry="19" fill="#fff4dc"/>' +
        '<ellipse cx="52" cy="98" rx="17" ry="38" fill="#9a6a3a" transform="rotate(14 52 98)"/><ellipse cx="148" cy="98" rx="17" ry="38" fill="#9a6a3a" transform="rotate(-14 148 98)"/><circle cx="100" cy="100" r="50" fill="#e3b77c"/><ellipse cx="124" cy="92" rx="15" ry="14" fill="#9a6a3a" opacity=".85"/>' + eyes(94, 20) +
        '<ellipse cx="100" cy="120" rx="30" ry="22" fill="#fff4dc"/><ellipse cx="100" cy="108" rx="10" ry="7" fill="#2b1c0e"/><g class="mc"><path d="M100 114 v6 M100 120 Q92 128 86 122 M100 120 Q108 128 114 122" stroke="#2b1c0e" stroke-width="3" fill="none" stroke-linecap="round"/></g><g class="mo"><ellipse cx="100" cy="127" rx="14" ry="12" fill="#7a2a2a"/><ellipse cx="100" cy="134" rx="8" ry="6" fill="#ef7f8a"/></g>';
    }
    return s;
  }
  function stars(lv) { var n = Math.min(Math.max(lv - 1, 0), 5), o = ''; for (var i = 0; i < n; i++) { var x = 100 + (i - (n - 1) / 2) * 22; o += '<text x="' + x + '" y="20" font-size="20" text-anchor="middle">⭐</text>'; } return o; }
  function petSVG(k, lv, cls) { return '<svg viewBox="0 0 200 200" class="' + (cls || '') + '" xmlns="http://www.w3.org/2000/svg">' + (lv > 1 ? '<circle cx="100" cy="110" r="88" fill="#ffe27a" opacity=".28"/>' : '') + animalBody(k) + stars(lv) + '</svg>'; }

  /* ===== きろく ===== */
  function blank() { return { pet: null, pts: 0, lv: 1, grads: [], diff: 1, played: 0, wins: 0 }; }
  function load() { var d = null; try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {} return Object.assign(blank(), d || {}); }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function need(lv) { return 30 + 15 * (lv - 1); }
  function sizeOf(s, pts) { return 0.42 + 0.58 * Math.min(1, pts / need(s.lv)); }

  /* ===== ことば ===== */
  var SMALL = { 'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お', 'っ': 'つ', 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'ゎ': 'わ' };
  function hira(s) { return String(s || '').normalize('NFKC').replace(/[\s　]/g, '').replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); }); }
  function firstCh(w) { var c = w.charAt(0); return SMALL[c] || c; }
  function lastCh(w) { var t = w.replace(/ー+$/, ''), c = t.charAt(t.length - 1); return SMALL[c] || c; }
  function build() {
    IDX = {}; SET = {}; var ok = {};
    DICT.forEach(function (w) { SET[w] = 1; var f = firstCh(w), l = lastCh(w); if (/[んをー]/.test(f) || /[んをー]/.test(l)) return; var k = f + l; (IDX[k] = IDX[k] || []).push(w); });
    Object.keys(IDX).forEach(function (k) { IDX[k].sort(function (a, b) { return a.length - b.length; }); });
    return ok;
  }
  function pairs() { var a = Object.keys(IDX).filter(function (k) { return IDX[k].length >= 3; }); return a.length >= 20 ? a : Object.keys(IDX).filter(function (k) { return IDX[k].length >= 2; }); }
  function pickPair() {
    var all = pairs(), c = all.filter(function (k) { return recent.indexOf(k) < 0; }); if (!c.length) c = all;
    var k = c[Math.floor(Math.random() * c.length)]; recent.push(k); if (recent.length > 8) recent.shift(); return k;
  }
  function validate(w, f, l) {   // → { ok, msg, known }
    if (!w) return { ok: false, msg: 'ことばを いれてね' };
    if (!/^[ぁ-ゖー]+$/.test(w)) return { ok: false, msg: 'ひらがなで かいてね' };
    if (w.length < 2) return { ok: false, msg: '2もじ いじょうで おねがい' };
    if (w.length > 14) return { ok: false, msg: 'ながすぎるよ(14もじまで)' };
    if (firstCh(w) !== f) return { ok: false, msg: '「' + f + '」から はじめてね' };
    if (lastCh(w) !== l) return { ok: false, msg: '「' + l + '」で おわってね' };
    if (/(.)\1{3,}/.test(w)) return { ok: false, msg: 'おなじ もじが つづきすぎだよ' };
    return { ok: true, known: !!SET[w] };
  }
  function scoreOf(w, known) { return known ? w.length * 2 : w.length; }   // 僕が知っている言葉は 2倍。知らない言葉は 文字数ぶん
  var DIFF = [{ n: 'やさしい', sec: 90, lo: 0, hi: .45, pass: .25 }, { n: 'ふつう', sec: 60, lo: .2, hi: .75, pass: .12 }, { n: 'むずかしい', sec: 45, lo: .55, hi: 1, pass: .03 }];
  var RIVALS = [['モコ', '#f2a65a'], ['ピポ', '#7aa7e8'], ['ガブ', '#c98ad8']];
  function rivalWord(list, d) {   // list は ながさ順
    if (Math.random() < d.pass) return '';
    var n = list.length, lo = Math.floor(d.lo * (n - 1)), hi = Math.max(lo, Math.round(d.hi * (n - 1)));
    return list[lo + Math.floor(Math.random() * (hi - lo + 1))];
  }

  /* ===== がめん ===== */
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function $(s) { return A.root().querySelector(s); }
  function esc(s) { return A.esc(s); }
  function badge(lv) { return '<span class="abad' + (lv > 1 ? ' pm' : '') + '">Lv.' + lv + (lv > 1 ? ' ⭐プレミア' : '') + '</span>'; }
  function petBox(s, id) { return '<div class="apet bob' + (s.lv > 1 ? ' pm' : '') + '" id="' + (id || 'apet') + '" style="--s:' + sizeOf(s, s.pts).toFixed(3) + '">' + petSVG(s.pet, s.lv) + '</div>'; }
  function bar(s) { var n = need(s.lv), p = Math.min(100, Math.round(s.pts / n * 100)); return '<div class="qbar"><i style="width:' + p + '%"></i></div><div class="qm" style="margin-top:4px">ポイント ' + s.pts + ' / ' + n + '(いっぱいに なるまで あと ' + Math.max(0, n - s.pts) + ')</div>'; }

  function home() {
    stop(); var s = load();
    if (!s.pet) return choose(s, false);
    A.draw('<h2>あたまおしり</h2><div class="abub">僕は 知らない言葉が いっぱい!<br>みんなと 一緒に 覚えるよ!<br>僕が 知っていると ポイント<b style="color:#d9381e">2倍</b>!<br>知らない言葉だと <b style="color:#d9381e">文字数ぶん</b>が ポイントに なるよ</div><div class="qc">' + petBox(s) + '<div>' + badge(s.lv) + '<b>' + esc(petName(s.pet)) + '</b></div>' + bar(s) +
      '<p class="qm" style="margin:10px 0 6px">むずかしさ</p><div class="adf">' + DIFF.map(function (d, i) { return '<button type="button" data-d="' + i + '" class="' + (s.diff === i ? 'on' : '') + '">' + d.n + '</button>'; }).join('') + '</div>' +
      '<button class="qb pri" id="aplay">あそぶ</button><button class="qb" id="achg">どうぶつを えらびなおす</button><button class="qb" id="adex">ずかん(そだてた どうぶつ ' + s.grads.length + ')</button><button class="qb" id="aback">GAMEに もどる</button></div>' +
      '<div class="qc"><b>あそびかた</b><p class="qm" style="margin:6px 0 0">おだいは「さいしょの もじ」と「さいごの もじ」。その もじで はじまって おわる ことばを つくろう。いちばん ポイントが おおきい ひとが かち。ポイントは どうぶつが パクッと たべて おおきくなるよ。いっぱいに なると ずかんに のって、つぎは ひとつ うえの レベルに!</p></div>');
    A.bind('[data-d]', function (b) { s.diff = +b.dataset.d; save(s); home(); });
    $('#aplay').onclick = round; $('#achg').onclick = function () { choose(s, true); }; $('#adex').onclick = dex; $('#aback').onclick = function () { stop(); A.hub(); };
  }
  function choose(s, keep) {
    var first = !keep && !s.grads.length;
    A.draw('<h2>' + (keep ? 'どうぶつを えらびなおす' : (first ? 'どうぶつを えらんでね' : 'つぎの どうぶつを えらんでね')) + '</h2><div class="qc">' + (s.lv > 1 && !keep ? '<p style="margin:0 0 8px">' + badge(s.lv) + 'からスタート!' + '</p>' : '') +
      '<p class="qm" style="margin:0">いまの ポイントは そのまま。すきな どうぶつを タップしてね。</p><div class="apick">' + PETS.map(function (p) { return '<button type="button" data-p="' + p[0] + '" class="' + (s.pet === p[0] ? 'on' : '') + '">' + petSVG(p[0], 1) + p[1] + '</button>'; }).join('') + '</div>' +
      (keep ? '<button class="qb" id="aback">やめる</button>' : '') + '</div>');
    A.bind('[data-p]', function (b) { s.pet = b.dataset.p; save(s); home(); });
    if (keep) $('#aback').onclick = home;
  }
  function dex() {
    var s = load();
    A.draw('<h2>ずかん</h2><div class="qc">' + (s.grads.length ? '<div class="agr">' + s.grads.map(function (g) { return '<div class="' + (g.lv > 1 ? 'pm' : '') + '">' + petSVG(g.pet, g.lv) + esc(petName(g.pet)) + '<br>Lv.' + g.lv + (g.lv > 1 ? ' ⭐' : '') + '</div>'; }).join('') + '</div>' : '<p class="qm" style="margin:0">まだ いないよ。どうぶつを いっぱいに そだてると ここに のるよ。</p>') +
      '<p class="qm" style="margin:10px 0 0">あそんだ かい ' + s.played + ' ・ かった かい ' + s.wins + '</p><button class="qb" id="aback" style="margin-top:12px">もどる</button></div>');
    $('#aback').onclick = home;
  }

  function round() {
    stop(); var s = load(), d = DIFF[s.diff] || DIFF[1], k = pickPair(), f = k.charAt(0), l = k.charAt(1), left = d.sec, done = false;
    A.draw('<div class="qc"><div class="qm">おだい(ながい ことばを つくろう)</div><div class="aq"><b>' + esc(f) + '</b><span>…</span><b>' + esc(l) + '</b></div><p class="qm" style="text-align:center;margin:0 0 8px">「' + esc(f) + '」で はじまって「' + esc(l) + '」で おわる ことば</p>' +
      '<div class="qbar t"><i id="atb" style="width:100%"></i></div><div class="qm" id="atl" style="text-align:right;margin-bottom:6px">のこり ' + left + 'びょう</div>' +
      '<input class="ain" id="ain" type="text" placeholder="ひらがなで ことばを いれてね" autocomplete="off" autocapitalize="off"><div class="qm" id="amsg" style="min-height:1.6em;margin:6px 0 4px"></div>' +
      '<button class="qb pri" id="aok">けってい</button>' +
      '<button class="qb" id="agive">こたえられない(こたえを みる)</button></div>');
    var inp = $('#ain'); try { inp.focus(); } catch (e) {}
    function finish(give, w, known) { if (done) return; done = true; stop(); result(s, d, k, w ? [{ w: w, known: known, sc: scoreOf(w, known) }] : [], give); }
    function submit() {
      var w = hira(inp.value), v = validate(w, f, l), m = $('#amsg');
      if (!v.ok) { m.style.color = '#b3261e'; m.textContent = v.msg; return; }
      finish(false, w, v.known);
    }
    $('#aok').onclick = submit; inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } };
    $('#agive').onclick = function () { finish(true); };
    timer = setInterval(function () { left--; var tb = $('#atb'), tl = $('#atl'); if (!tb) return stop(); tb.style.width = Math.max(0, left / d.sec * 100) + '%'; tl.textContent = 'のこり ' + Math.max(0, left) + 'びょう'; if (left <= 0) { var w0 = hira(inp.value), v0 = validate(w0, f, l); if (v0.ok) finish(false, w0, v0.known); else finish(true); } }, 1000);
  }

  function result(s, d, k, mine, give) {
    var f = k.charAt(0), l = k.charAt(1), all = (IDX[k] || []).slice().reverse();   // ながい じゅん
    var me = mine.length ? mine.slice().sort(function (a, b) { return b.sc - a.sc; })[0] : null;
    var rows = [{ name: 'あなた', w: me ? me.w : '', sc: me ? me.sc : 0, me: true, known: me ? me.known : true }];
    var asc = (IDX[k] || []).slice();
    RIVALS.forEach(function (r) { var w = give ? '' : rivalWord(asc, d); rows.push({ name: r[0], w: w, sc: w ? w.length * 2 : 0 }); });
    var top = Math.max.apply(null, rows.map(function (x) { return x.sc; })), win = !give && me && me.sc === top && top > 0;
    var bonus = win && (!all.length || me.w.length > all[0].length) ? 2 : 0, gain = win ? me.sc + bonus : 0;
    var order = rows.slice().sort(function (a, b) { return b.sc - a.sc; }), medal = ['🥇', '🥈', '🥉', '4'];
    s.played++; if (win) s.wins++; save(s);
    var head = give ? 'こんな こたえが あったよ' : (win ? '🎉 いちばん ながい! ポイントゲット' : (top === 0 ? 'だれも こたえられなかった…' : 'ざんねん! こんどは かとう'));
    A.draw('<h2>' + head + '</h2><div class="qc"><div class="aq" style="margin-top:0"><b>' + esc(f) + '</b><span>…</span><b>' + esc(l) + '</b></div>' +
      (give ? '' : order.map(function (x, i) { return '<div class="arow' + (x.me ? ' me' : '') + '"><span class="rk">' + (x.sc && x.sc === top ? '🥇' : medal[Math.min(i, 3)]) + '</span><span class="nm">' + esc(x.name) + '</span><span>' + (x.w ? esc(x.w) : '(パス)') + '</span><span class="ln">' + (x.w ? (x.me && !x.known ? x.w.length + 'もじ→' + x.sc : x.w.length + 'もじ') : '') + '</span></div>'; }).join('')) +
      (win ? '<p style="margin:8px 0 0;font-weight:800;color:#3a2a8a">+' + gain + ' ポイント' + (bonus ? '(僕が 知っている どの ことばより ながい! ボーナス +2)' : '') + '</p>' : '') +
      (me && !me.known ? '<div class="abub" style="margin:10px 0 0">🐾 僕の知らない言葉だ!<br><span style="font-weight:600;font-size:.92em">「' + esc(me.w) + '」を 覚えたよ。つぎからは 僕が 知っている ことばに なるよ(文字数ぶん ' + me.w.length + 'ポイント)</span></div>' : (me ? '<p class="qm" style="margin:8px 0 0">僕が 知っている ことばだから ポイント2倍!(' + me.w.length + 'もじ × 2)</p>' : '')) + '</div>' +
      (all.length ? '<div class="qc"><b>こんな こたえが あったよ</b><div class="adex" style="margin-top:8px">' + all.slice(0, 8).map(function (w) { return '<span>' + esc(w) + ' <small>' + w.length + '</small></span>'; }).join('') + '</div></div>' : '') +
      (gain ? '<div class="qc" id="afeed">' + petBox(s, 'apet') + '<div>' + badge(s.lv) + '<b>' + esc(petName(s.pet)) + '</b></div><div id="abar">' + bar(s) + '</div></div>' : '') +
      '<button class="qb pri" id="anext">つぎの おだい</button><button class="qb" id="ahome">ホームに もどる</button>');
    $('#anext').onclick = round; $('#ahome').onclick = home;
    if (me && !me.known) learn(s, me.w);
    if (gain) setTimeout(function () { feed(s, gain, me ? me.w : ''); }, 350);
  }

  /* 知らない言葉を覚える: この端末にも、町会のみんなの分にも ためる */
  function learn(s, w) {
    if (!SET[w]) { SET[w] = 1; DICT.push(w); build(); }
    s.learn = (s.learn || []).filter(function (x) { return x !== w; }); s.learn.push(w); if (s.learn.length > 300) s.learn.shift(); save(s);
    try { A.call('atama_learn', { words: [w] }).then(function () {}, function () {}); } catch (e) {}
  }

  /* パクッ: 答えの文字が とんできて、どうぶつが 1文字ずつ たべて おおきくなる */
  function feed(s, gain, word) {
    var box = $('#apet'); if (!box) return; var svg = box.querySelector('svg'), chars = Array.from(word || '').slice(0, 14), n = chars.length || Math.min(gain, 10), before = s.pts, i = 0;
    var nb = $('#anext'), nh = $('#ahome'); if (nb) nb.disabled = true; if (nh) nh.disabled = true;
    function mouth() { var r = svg.getBoundingClientRect(), b = box.getBoundingClientRect(); return [r.left - b.left + r.width * .5, r.top - b.top + r.height * .62]; }
    function step() {
      if (!$('#apet')) return;
      if (i >= n) return after();
      var m = mouth(), tok = document.createElement('div'); tok.className = 'atok'; tok.textContent = chars.length ? chars[i] : '+'; box.appendChild(tok);
      var sx = 20 + Math.random() * (box.clientWidth - 60), t = tok.animate ? tok.animate([{ left: sx + 'px', top: '-30px', opacity: 1 }, { left: (m[0] - 13) + 'px', top: (m[1] - 13) + 'px', opacity: 1 }], { duration: 520, easing: 'ease-in', fill: 'forwards' }) : null;
      function eat() {
        tok.remove(); svg.classList.add('op'); i++;
        var p = before + gain * i / n; box.style.setProperty('--s', Math.min(1, sizeOf(s, Math.min(p, need(s.lv)))).toFixed(3));
        var up = $('#abar'); if (up) { var tmp = { pts: Math.min(Math.round(p), need(s.lv)), lv: s.lv }; up.innerHTML = bar(tmp); }
        setTimeout(function () { svg.classList.remove('op'); setTimeout(step, 90); }, 170);
      }
      if (t) t.onfinish = eat; else setTimeout(eat, 520);
    }
    function after() {
      s.pts += gain; var full = s.pts >= need(s.lv); save(s);
      if (nb) nb.disabled = false; if (nh) nh.disabled = false;
      if (!full) return;
      var sp = document.createElement('div'); sp.className = 'asp'; sp.textContent = '✨'; sp.style.left = '45%'; sp.style.top = '30%'; box.appendChild(sp);
      var fe = $('#afeed'); if (fe) fe.insertAdjacentHTML('beforeend', '<p style="margin:10px 0 0;font-weight:800;color:#b36b00">🎉 いっぱいに おおきくなったよ! ' + esc(petName(s.pet)) + 'が ずかんに のるよ</p><button class="qb pri" id="agrad" style="margin-top:10px">つぎの どうぶつを えらぶ</button>');
      var g = $('#agrad'); if (nb) nb.style.display = 'none'; if (nh) nh.style.display = 'none';
      if (g) g.onclick = function () { var o = s.pts - need(s.lv); s.grads.push({ pet: s.pet, lv: s.lv }); s.lv++; s.pts = Math.max(0, o); s.pet = null; save(s); choose(s, false); };
    }
    step();
  }

  function start(api) {
    A = api;
    if (!document.getElementById('qatcss')) { var st = document.createElement('style'); st.id = 'qatcss'; st.textContent = CSS; document.head.appendChild(st); }
    if (!DICT) {   // ことばは このファイルの中に入っています(別ファイルの読みこみは しません)
      DICT = WORDS0.slice(); var lc = load().learn || []; lc.forEach(function (w) { if (DICT.indexOf(w) < 0) DICT.push(w); }); build();
      try { A.call('atama_words').then(function (r) { var add = 0, have = {}; DICT.forEach(function (w) { have[w] = 1; }); ((r && r.words) || []).forEach(function (w) { if (!have[w]) { have[w] = 1; DICT.push(w); add++; } }); if (add) build(); }, function () {}); } catch (e) {}
    }
    home();
  }
  window.HmtAtama = { start: start, _t: { validate: validate, hira: hira, firstCh: firstCh, lastCh: lastCh, scoreOf: scoreOf, need: need } };
})();
