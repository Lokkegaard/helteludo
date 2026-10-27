# Helteludo – overdragelse til ny session

Indsæt denne tekst i den nye session (eller bed den læse filen), så kan den fortsætte, hvor den forrige slap.

## Opgaven
Jeg (Henrik) får bygget en digital udgave af brætspillet **Helteludo** (ludo med rollespilsevner; regler af Mette Finderup & Kristoffer Apollo). Spillet er én HTML-fil, publiceret som claude.ai-artifact:

**https://claude.ai/artifact/R8J5dSQnqe5X31Ei1cjNCU** (seneste version: 29)

- Svar mig altid på **dansk**.
- Opdater **samme artifact** (send `url` med ved publicering; læs den først med `action: "read"`). Lav ikke et nyt link.
- Artifacten bruger kapabiliteterne **db** (online-spil) og **user** (profiler). Behold dem ved publicering.
- Filen `helteludo.html` i denne mappe er identisk med version 46.

## Hvad der er bygget (alt virker og er testet)
- **Regler/motor:** fuld Helteludo med evnetabel (32 evner), stjerner, globusser, slag, Kommandosoldat-raids, Uheldig-genslag mod hver modstander, husregler (indstillingspanel), gem/fortsæt spil, vejledning for nye spillere, Heltebog med statistik og historik.
- **Ludoterning-varianten blev prøvet og rullet helt tilbage** efter mit ønske – brug almindelig terning.
- **Computermodstandere** på tre niveauer (let/normal/svær).
- **Online-spil** hvor hver spiller bruger sin egen enhed (via artifact-db: `games/{kode}`, låsning, rev-tjek, heartbeat, overtagelse af værtsrolle, genforbindelse).
- **Grafik:** "fantasykort"-stil (stilskitse 3), skrifttyper Cinzel + Alegreya. 2D-bræt + **3D-bræt med Three.js r128** (indlæses dovent fra cdn.jsdelivr.net), frit kamera (ingen kameraknapper eller instruktionstekst – det ønskede jeg fjernet), grafikkvalitet auto/høj/lav, sejrsscene med konfetti.
- **Figurer:** 16 fantasy-arter i miniaturestil, der går felt for felt. **Arten bestemmes af den første evne, brikken slog på tabellen** (`ABIL_KIND`), ikke af et frit valg; arterne har ingen særlige gaver. Hver evne giver synligt udstyr på figuren (`GEAR`, `LOOK`, `GEAR_TF`). Tryk på en brik viser dens evner.
- **Lyd:** syntetiske lydeffekter, stemmer pr. art og middelalderlig baggrundsmusik (Web Audio, ingen lydfiler).

### Art ud fra evne (`ABIL_KIND`)
sej/kampivrig/kommandosoldat→dværg · stifinder/globetrotter/booster→elver · dræber/vatarm→ork · heldig/uheldig/bakgear→nisse · hjemve/kryster→trold · hypnotisør/forbandet→troldmand · regeneration/neurotiker→skelet · bersærk/ærkefjende→minotaur · stjernehopper/aura→fe · turbo/selvantændelig→drage · atlet/højdespringer→kat · hurtig/pacifist→faun · usynlighed/ingenstedsans→spøgelse · bredskuldret/langsom→golem · snigmorder/hævner→varulv · målsøgende/hovmodig→kyklop

## Tegnede 2.5D-figurer (version 20–21)
- **Alle 16 arter har nu AI-tegninger** fra Canva i samme stil (blæk + akvarel). Originalerne i fuld størrelse, fritlagt, ligger i `tegninger/` (`<art>.png`, 944×1680 eller 1024×1536); `tegninger/hvid/` har de 13 nye med hvid baggrund.
- I `SPRITES` ligger de som WebP (640 px høje, ~60 KB hver). Felter: `h` (højde i 3D), `hand` ([afstand fra midten i bredder, højde fra bunden]) til udstyret, `aspect`.
- **Tegnede figurer er nu standard** (`UI.figStyle` falder tilbage til `'tegnet'`); et gemt valg i `localStorage` `helteludo.figurer` vinder stadig. Knappen "Figurer: tegnede / 3D" skifter.
- "Prøv tegnede figurer" (et demospil med otte tilfældige arter) er fjernet i version 46.
- `buildSprite(p)`: papfigur på fod med holdring, skygge, vender mod kameraet, vralter/hopper.
- **Version 21: tegnede figurer har intet 3D-udstyr.** I stedet viser `dressBadges(p,rig)` evnerne som malede mærker (`BADGES`, 128 px WebP, ét pr. evne, alle 35) i en bue foran foden; skivens farve følger tabellen (pergament/grå/guld), og niveau ≥2 får romertal (`badgeTexture`). Infopanelet viser mærket ved hver evne i tegnet stil og teksten "På 3D-figuren …" kun i 3D-stil. 3D-figurerne har stadig `dressPiece`-udstyr. Mærkerne ligger også i `tegninger/evner/`.
- Hent fra Canva: kun forhåndsvisninger via API; fuld størrelse hentes via Chrome (logget ind) med "…" → Download på `canva.com/M/<id>`.

## Teknisk overblik over `helteludo.html` (~430 KB)
- Tilstand i `S` (kan serialiseres til JSON). Positioner relativt pr. sæde: -1 = hjem, 0..50 bane, 51..55 indløb, 56 = mål. `relAbs(seat,rel)=mod(rel+13*seat,52)`.
- Motor: `newGame`, `rollSeat`, `execute`, `finishAction`, `endTurn`, `addRaids`/`resolveRaid`. Animationer via `S.anim`, terningslag via `S.rollSeq`.
- AI: `scoreOpt`, `aiStep`; turstyring `schedule`/`act`.
- Online: `withLock`, `commit`.
- 3D: `load3D`, objektet `V3D` (init, sync, frame, applyQuality, celebrate …), figurer `buildFigure`/`buildSprite`/`dressPiece`, `KINDS`.
- Lyd: `SOUNDS`, `VOICE`, `MUSIC`. Øvrigt: `COACH`, `settingsHtml`, `renderBook`, `recordGame`, `saveGame`.
- localStorage-nøgler: `helteludo.spil`, `.vejledning`, `.online`, `.figurer`, `.grafik`, `.lyd`, `.musik`, `.visning`.

## Tests (mappen `tests/`)
Playwright-scripts (headless Chromium): `test2.js` (motor 60 spil, UI/AI, online med falsk db i `mock.js`), `t3d.js` (3D), `sprt.js` (tegnede figurer). De blev skrevet til cloud-miljøet, så **stier skal rettes** (de pegede på en scratchpad-mappe og en lokal kopi af `three@0.128.0`, der blev serveret i stedet for jsdelivr). Kræver Node + `npm i playwright three@0.128.0`.

Ikke testet endnu: online-genforbindelse og værtsskifte på den rigtige db med flere enheder, og om lyden lyder godt på rigtige enheder.

## Husregel om stjernehop (version 22)
- Husreglen `starGoal` (stjernehop fra næstsidste stjerne direkte i mål) er nu **slået fra som standard**: fra næstsidste stjerne hopper brikken til sidste stjerne, og først derfra i mål. `DEF_OPTS.v=2`; ved indlæsning slås `starGoal` fra én gang for gemte indstillinger uden `v`. Reglen kan stadig slås til under husregler.

## 10 forbedringer af brugeroplevelsen (version 23)
1. **Forhåndsvisning af træk** (`markList`/`drawMarks`/`V3D.setMarks`): ring på landingsfeltet, prikker langs vejen, stiplet bue ved stjernehop, sværd over en brik der slås hjem. Vises ved hover over træk, over en brik der kan flytte (`UI.hoverPid`, også i 3D via pointermove), eller når en brik er valgt.
2. **Svævende tekst** (`pop(p,txt,k)` → `S.pops`/`S.popSeq`, vises af `showPops()` når animationen er færdig; `UI.popSeen`). Ligger i spilletilstanden, så online-spillere ser dem også.
3. **Computerens tempo** (`UI.speed`, localStorage `helteludo.tempo`, `SPEED`/`aiF()`) styrer ventetid og animationstempo for computerens træk. Knap **"Spring over ⏭"** (`#skipbtn`, `skipAnim()`).
4. **Mobilbjælke** (`#mbar`, ≤920 px): terning, besked, evneknapper og træk fast forneden; turpanelet skjules på mobil. Vejledningen finder det synlige element.
5. **Evnemærker** vokser (×1,5) på brikker der kan flytte/er valgt; evnens navn vises ved mus over/tryk på et mærke (`V3D.pickBadge`, `badgeTip`).
6. **Heltepræsentation** på opstillingen: figur + "X slog Sej og blev dværg" (`.hcard`, animeres efter rul). Evnechips har ikoner.
7. **Fortryd** (`UI.undo`, kun lokale spil): sidste menneskelige træk kan fortrydes, indtil der slås igen; computeren venter 1,8 s efter et menneskes træk.
8. **"Din tur" online** (`turnSignal()`): lyd `yourturn`, vibration, blinkende fanetitel når fanen er skjult. Grøn/grå prik for forbindelse i holdlisten.
9. **Holdsymboler** (`SYM_D`, `symSvg`): flamme/blad/sol/bølge på skjolde (2D+3D), i paneler, ved borgene. **Tekststørrelse** (`UI.text`, `helteludo.tekst`, CSS-variabel `--ts` med `zoom`).
10. **Dagens helte** efter spillet (`awardsHtml`): Dagens helt, Først i mål, Slagsbror, Stjernespringer, Uheldig sjæl, Homerun. Nye felter: `p.st.stars`, `S.firstGoalPid`.
- Topbjælken har nu en **Indstillinger**-menu (`menuHtml`/`menuItems`) med figurer, grafik, tempo, tekst, musik og lyd.
- Mærker og figurer bruges i HTML som CSS-klasser (`.bi-<evne>`, `.fs-<art>`, genereret ved opstart), så billederne ikke skrives ind ved hver opdatering.
- Test lokalt: python http.server sender ikke charset og siden har ingen viewport-meta (artifacten tilføjer begge) — tilføj `<meta charset="utf-8"><meta name="viewport" ...>` i en testkopi.

## Fantasynavne (version 24)
- Nye hold og brikker får tilfældige fantasynavne: `FIRST_NAMES` + `EPITHETS` (fx "Sigurd Ravnehjerte", "Oda den Modige") via `fantasyName(used)`, helst med fornavn og tilnavn, der ikke allerede er brugt. Holdnavne fra `TEAM_NAMES[seat]` passer til farven (fx Drageklanen, Smaragdlogen, Solridderne, Safirordenen) og er valgt korte nok til overskriften.
- Knappen **"Nye fantasynavne"** på holdkortet (`renameSeat`) giver holdet og brikkerne nye navne og beholder evnerne.
- Engangsskift (`R.namesV=2`): gamle standardnavne (`SEATS[s].team`/`.pieces`) skiftes ud; navne brugeren selv har skrevet bevares.
- Tælleren for slag står nu under navnet på opstillingen, så navnefeltet har plads til lange navne.

## Malet spilleplade (version 25)
- `BOARD_ART` indeholder et malet landskab (`landskab`, 1024 px), et rundt område pr. hjemmebase (`omraade[seat]`: rød vulkan, grøn skovlysning, gyldne marker, blå lagune), en bygning pr. hold (`bygning[seat]`: rød borg, elverhal i træ, solpalads, fyrtårn) og `skat` (kiste med guld). Alle fra Canva; originaler og WebP-udgaver i `tegninger/braet/`.
- 2D: `.board` har landskabet som baggrund; baserne har klasserne `reg reg-<seat>` og en `.bldg bb-<seat>`; skattekammeret har `.treasure` oven på farvekilerne. CSS-klasserne genereres ved opstart sammen med `.bi-`/`.fs-`.
- 3D: `boardTexture` tegner landskabet (`LAND_IMG`, gentegnes når det er indlæst); baseskiverne har området som top-tekstur; bygninger og kiste er `THREE.Sprite`-papfigurer (`artTex`). Den gamle `castle()` og 3D-kisten er fjernet. Inaktive baser er tonet grå.

## Felter med karakter (version 26)
- `TILE_ART`: tre malede trædesten (`sten[0..2]`, fordelt med `stoneKind(a)`), stjernesten, helligdom (globus/fristed), holdfarvede bannere (`banner[seat]`, startfeltet) og holdfarvede løbere (`loeber[seat]`, målvejene; rød og gul er drejet vandret). Bannere og løbere er farvet i Python ud fra ét hvidt billede. Originaler og WebP i `tegninger/felter/`.
- 2D: felterne har klasserne `art tk-<slags>` / `art ln-<seat>` (CSS genereres ved opstart med selektorer `.cell.stone.tk-…`, så de vinder over de gamle regler); startfeltet har en ring i holdfarven og et `.banner`. `.board::after` giver en mørk kant (vignet).
- 3D: stentoppene bruger `flatTex` (billedet på stenfarvet bund), bannere er sprites ved startfelterne, løberne er teksturerede kasser. Lyset er gjort varmere. `stoneTexture`, `STAR_SVG` og `GLOBE_SVG` er fjernet.

## Liv på brættet (version 27)
- Pynt uden for banen: `DECO_ART` (træ, sten, svampe, busk; billeder i `tegninger/pynt/`), placeret med `DECO_SPOTS`/`decoList()` i alle fire hjørneområder. 2D: `.life .deco`; 3D: sprites i `V3D.init`.
- 3D (`V3D.buildLife`/`V3D.lifeTick`, kaldes fra `V3D.frame`): krusninger på lagunen (blå base), glødende lava (rød base, `emissiveMap` på `V3D.regMats[0]`), ildfluer over skoven (grøn), røg fra den røde borg, tre fugle der cirkler over bordet, blafrende bannere (`V3D.banners`). Kun for hold, der er med (`V3D.activeSeats`).
- 2D: samme liv med CSS-animationer i `#life` og `::after` på baserne; bannerne blafrer.
- Slås fra ved **Grafik: lav** (3D: `V3D.q==='lav'`; 2D: `body.lowfx`) og ved reduceret bevægelse. Grafik-knappen findes nu også i 2D-menuen.

## Kroværtshusbord (version 28)
- `TABLE_ART`: malede egeplanker (`planker`), et gammelt kort med bøjede hjørner (`kort`) og ting på bordet (`ting`: stearinlys, mønttaske, terningbæger, kortbunke med x/z/h). Originaler og WebP i `tegninger/bord/`.
- 3D: bordet bruger plankerne (spejlet gentagelse), kortet ligger lidt skævt under brættet, tingene er sprites; stearinlyset har et `PointLight` (`V3D.candle`) og et glødende skær, der flakker (ikke ved reduceret bevægelse). Terningen ligger nu på bordet (`dieRest.y=-.14`) ved bægeret. Den gamle `woodTexture` er fjernet.
- 2D: brættet ligger i `.mapframe` (kortet) inde i `.board-wrap` (plankerne + varmt skær i hjørnet). I 3D slås det fra med `.board-wrap:has(.board.v3d)`.

## Spilleplade til 3 spillere (version 29)
- Spil med 3 hold (sæde 0, 1, 2) bruger et særligt bræt med **39 felter** (13 pr. hold, samme mønster: start/globus +0, stjerne +5, globus +8, stjerne +11). `S.board='tri'`; ældre gemte spil uden `S.board` kører videre på det firkantede.
- Geometrien er samlet i `makeBoard(kind)` → `BOARDS.quad`/`BOARDS.tri`; det aktive bræt er `B` (`B.TL` banelængde, `B.LAST` sidste banefelt, `B.GOAL` mål, `B.armAng`, `B.BASEC`, `B.seats`), og `PATH`, `STRETCH`, `SLOTS`, `GOALPOS`, `GLOBE_REL`, `STAR_REL`, `GLOBE_ABS`, `STAR_ABS` peger på dets lister (`useBoard`, `ensureBoard` i `render`/`act`). Regelmotoren har ingen faste tal for 52/50/51/55/56 længere. Det firkantede bræt har nøjagtigt de gamle koordinater.
- 2D: på 3-spiller-brættet placeres felter, baser og midten frit (`.grid.tri`), og løberne drejes langs målvejen (`laneRot`). Midtens farvekiler følger målvejene.
- 3D: banen (sten, bannere, målveje, skattekammer, pynt, liv) bygges af `V3D.buildTrack()` og bygges om, når brættet skifter.
- Pynt på 3-spiller-brættet placeres automatisk på frie pladser (`decoList`).
- Rettet samtidig: en animation, der stadig kørte, når man forlod et spil i 3D, kunne låse det næste spil (`stopAnim`).
- `tests/motor-braet.js` (Node, uden browser): tjekker det firkantede bræts koordinater og spiller 60 computerspil med 2, 3 og 4 hold.

## Rundt 3-spiller-bræt (version 30)
- 3-spiller-brættet (`kind:'tri'`, `B.round`) er nu **rundt**: de 39 felter ligger i en ring (radius 6,1). Hver målvej går lige ind mod midten fra holdets sidste banefelt (to felter før starten), og baserne (radius 2, `B.baseR`) ligger inde i ringen mellem målvejene. Regler og felt-numre er uændrede, så gemte 3-spiller-spil fra version 29 fortsætter på det runde bræt.
- Basens størrelse og afstanden mellem brikpladserne er parametre (`B.baseR`, `B.baseW`, `B.slotD`), som 2D-base, 3D-skive, bygning, ildfluer og røg skaleres efter. Det firkantede bræt er uændret.
- 2D: `.board.round` klipper landskabet til en cirkel med en træramme. 3D: plade, underside og ramme bygges i `V3D.buildTrack()` (cirkel og torus på det runde bræt, plan og fire lister på det firkantede).

## Skjult tekstmenu og terningebæger (version 31)
- Menuen i højre side (tur-panel, holdene, log) er **skjult som standard** (`UI.side`, gemt i `localStorage` som `helteludo.menu`). Knappen »Vis menu«/»Skjul menu« i topbjælken viser den igen. Når spillet er slut, vises den altid, fordi heltestigningen ligger der.
- Uden menu (`.game.noside`) ligger en linje under brættet (`#hud`, bygges i `renderSide`): terningebægeret, terningen og en lille seddel med holdets navn, beskeden, tvungne træk og knapperne til Heldig/Booster/Uheldig, »Afslut turen«, »Videre« og »Fortryd«. Den faste mobilbjælke (`#mbar`) bruges kun, når menuen er vist.
- **Man slår ved at trykke på bægeret**: i 2D på `.hud .cup` (`data-act="roll"`), i 3D på bægeret på bordet (`V3D.cup`, `V3D.pickCup`). Bægeret vugger og lyser, når det er din tur til at slå (`V3D.cupReady`). Mellemrumstasten virker stadig.
- Træk vælges ved at trykke på en brik, der lyser; brikkortet (`#pinfo`) viser brikkens træk. Vejledningen peger nu på bægeret og på »Vis menu«.

## Spillet fylder hele vinduet (version 32)
- Når tekstmenuen er skjult, får `body` klassen `fullgame`: siden fylder præcis vinduet (`100dvh`, ingen rulning), og `.board-wrap` er en størrelses-container. Brættets side er `--S`:
  - i et højt vindue: `min(100cqw, 100cqh − 118px)`, med bægeret og sedlen under brættet
  - i et bredt vindue (`min-aspect-ratio: 5/4`): `min(100cqh, 100cqw − 290px)`, med bægeret og sedlen i en kolonne ved siden af
- I 3D fylder lærredet hele området (ikke længere kvadratisk), og sedlen ligger øverst over bordet. I et højt vindue øges kameraets synsvinkel, så brættet ikke skæres af i siderne (`V3D.resize`).
- Knappen »Fuld skærm« (Fullscreen-API'et) vises kun, hvor browseren tillader det (`document.fullscreenEnabled`).
- Med menuen vist er layoutet som før.

## Lysende aura om brikker, der kan handle (version 33)
- `actionPieces()` finder de brikker, spilleren kan gøre noget med lige nu: et træk (`S.options`) eller en evne som Heldig og Booster (`visibleActs`, ikke Uheldig, som er en anden spillers valg). Det gælder kun i din egen tur, i fasen 'choose'.
- 2D: `.tok.can::before` er en pulserende gylden aura bag skjoldet (`@keyframes aura`).
- 3D: hver brik har en additiv glød-sprite (`o.glow`) og en orange glorie på jorden (`o.halo`), som pulserer i `V3D.frame`. Begge har `raycast` slået fra, så de ikke stjæler klik.
- Brikkortet viser nu også brikkens evne-knapper (Heldig/Booster) under trækkene.

## Strømlinet interface – 10 forbedringer (version 34)
1. **Én menu:** topbjælken har logo, stilling, en 2D/3D-knap, 📜 (log-popup, `UI.logOpen`) og ☰ Menu (`#tbmenu`). Menuen indeholder holdpanelet, fuld skærm, regler, indstillinger og »Afbryd spillet«.
2. **Ét tryk for at flytte:** `tapPiece(pid,long)`. Har brikken ét træk og ingen evne, udføres trækket straks (`chooseOpt`); et træk, hvor brikken selv ryger hjem, kræver altid bekræftelse. Har brikken flere træk, kan man trykke på målfelterne (2D: `.mark.tgt`, 3D: `V3D.markHits`/`pickMark`) eller på en brik, der står på målfeltet (`targetAt`).
3. **Valg adskilt fra info:** et kort tryk viser et lille kort med kun træk og evner (`.pinfo.compact`, `UI.infoFull=false`). Et langt tryk (480 ms) eller ⓘ viser brikkens art og evner.
4. **Korte beskeder:** `hudMsg()` oversætter `S.msg` til korte linjer med ikon; den fulde tekst står i `title`.
5. **Evner som mærker:** `actBtn()` viser Heldig, Booster og Uheldig som knapper med evnens malede mærke (`.abtn`).
6. **Advarsler på trækkene:** ⚔️ slår hjem, ⚠️ ryger selv hjem (rød, `.opt.warn`), 🏁 i mål, ★ stjernehop og ☁️ højdespring – både på trækknapperne og på målfelterne (også i 3D-ringenes farve).
7. **Færre klik:** »Videre« er fjernet, fordi turen går videre af sig selv. »Afslut turen uden at flytte« hedder nu »Spring over« og vises kun, når en evne er det eneste valg. Fortryd hedder »↶ Fortryd«.
8. **Tur-markering:** basen for holdet med turen lyser i holdets farve (2D: `.base.turn`, 3D: `V3D.turnRing`). Stillingsbjælken fremhæver holdet med turen og mærker det næste med »næste«.
9. **Stillingsbjælke:** `.score` i topbjælken viser for hvert hold symbol, navn (på brede skærme), brikker i mål (●) og heltepoint. Holdpanelet med log kan stadig vises fra menuen.
10. **Hurtigere start og tips:**
    - »⚡ Hurtigt spil« på opstillingen ruller automatisk evner for hold, der ikke har rullet, med fordelingen 2-2-1-1, hvis slagene ikke er fordelt.
    - Efter spillet starter »Spil igen med samme hold« (`again`) en ny runde; heltestigningen udføres først, hvis den ikke allerede er gjort.
    - Rundvisningen starter ikke længere af sig selv. I stedet vises små tips første gang (`TIPS`, `checkTips`, gemt i `helteludo.tips`). Rundvisningen kan stadig startes fra »Evner og regler«.

## Bedre kamera i 3D (version 35)
- **Mindre perspektiv:** synsvinklen er 28° (`V3D_FOV`) i stedet for 40°, og kameraet står længere væk. Tågen følger kameraets afstand (`moveCamera`).
- **Automatisk udsnit:** `V3D.camFor(mode)` finder ved binær søgning den afstand, hvor brættets kant, basernes bygninger, bægeret og terningen (`V3D.fitPts`) lige netop er i billedet. Fokuspunktet flyttes, så det hele står midt i den del af billedet, sedlen ikke dækker (`V3D.topLimit`). Udsnittet beregnes igen ved ny størrelse og nyt spil, så længe spilleren ikke selv har flyttet kameraet (`V3D.userMoved`).
- **Tre faste kameraer** (`CAMS`):
  - Overblik: næsten lige oppefra
  - Skråt: 60° hældning, standard
  - Mit hold: 45°, set fra din egen base. Online er det dit hold; ved samme skærm er det holdet med turen, hvis det er et menneske (`mySeat`).
- Kameraerne vælges med knapperne nederst til højre (`#camsel`) eller tasterne 1, 2 og 3. Et dobbelttryk på bordet vender tilbage til den valgte visning, og skiftet glider (`V3D.camAnim`). Valget gemmes i `helteludo.kamera`.
- I »Mit hold« står bægeret, terningen og kortbunken på bordet foran kameraet (`V3D.placeProps`), og terningen kastes fra den side.

## Evner, når musen svæver over en brik (version 37, erstatter version 36)
- Version 36's regel om, at en brik hjemme eller på startfeltet altid åbnede det fulde kort, er fjernet igen. Ét tryk flytter som i version 34.
- `hoverCard(pid)`: når musen (`pointerType==='mouse'`) svæver over en brik, vises et lille kort (`#hovercard`). Det viser navn, art, hold og heltepoint og alle evner med mærke, niveau og beskrivelse. Har brikken ingen evner, står der »Ingen særlige evner.«
  - I 2D bruges `pointerover`/`pointerout` på `.tok`, i 3D `pointermove`/`pointerleave` på lærredet (`V3D.pick`).
  - Kortet placeres ved brikken (`placeInfo`) og skjules, når brikkortet for samme brik er åbent, eller når en brik går.
- Det fulde brikkort viser »Ingen særlige evner.« for brikker uden evner.

## Noter om, hvad evnerne konkret betyder (version 38)
- `abilNote(p,id)` giver en kort note, som vises fremhævet (`.anote`) under evnens navn på både svævekortet og det fulde brikkort:
  - **Varige valg:** Forbandet viser holdets øjental (`t.curse`). Ærkefjende viser hvilket hold (`p.hates`). Hævner viser hvem, med hold (`p.nemeses`).
  - **Tællere:** Heldig, Booster, Selvantændelig og Regeneration viser »x af y tilbage i dette spil«. Uheldig viser, hvor mange omslag hvert menneskehold stadig kan kræve.
  - **Terningchancer efter niveau**, regnet ud fra de samme tærskler som regelmotoren:
    - Turbo og Kampivrig: `6−niveau`.
    - Pacifist og Hovmodig: `6−niveau`.
    - Sej, Vatarm, Ingen stedsans, Bersærk og Hypnotisør: `7−niveau`.
    - Hurtig, Langsom og Dræber viser deres tal.
- De gamle meta-linjer på brikkortet (»Tilbage i dette spil«, »Ærkefjende«, »Vil hævne sig på«) er fjernet, fordi noterne erstatter dem.
- Stillingsbjælken viser ☠ og øjentallet for et forbandet hold.
- Rettet: sedlen sagde »Slå en 4'er for at komme ud« for forbandede hold. Forbandelsen ændrer kun ekstraslaget; man skal stadig bruge en 6'er for at komme ud.

## Stien på 3-spiller-brættet følger målvejene (version 39)
- Det runde bræt (`kind:'tri'`, `round:true`) bruger igen armgeometrien fra version 29: 3 arme med 120° imellem, så stien løber langs begge sider af hver målvej, og baserne ligger uden for stien mellem armene. Brættets ydre form er stadig rund (træramme, cirkel-udsnit i 2D, rund plade i 3D).
- Parametre: `r0:1.15`, `baseD:5.05`, `baseR:2.15`, `slotD:.92`. Ringen fra version 30 findes stadig i `makeBoard` bag `cfg.ring`, men bruges ikke.
- Felternes numre og regler er uændrede: 39 felter, samme mønster af stjerner og globusser.
- Testet med 180 computerspil (`tests/motor-braet.js` er opdateret). Ingen felter overlapper, og det yderste felt ligger 6,7 fra midten, inden for kanten på 7,5.

## Kameraet følger turen (version 40)
- Ny standardvisning **Følg turen** (`CAMS.tur`, hældning 37°). Når turen går videre til et andet hold, også et computerhold, drejer kameraet hen bag det holds base. Det sker først, når den forrige brik er færdig med at gå (`renderGame`, `V3D.turnSeen`). Har spilleren selv flyttet kameraet, tager følgningen over igen ved næste turskifte.
- Naturlig bevægelse (`V3D.applyCam` og `moveCamera`):
  - Kameraet glider i en bue rundt om brættet ad korteste vej (vinkel, hældning og afstand interpoleres).
  - Bevægelsen accelererer og bremser blødt (cosinus-kurve) og løfter sig lidt undervejs.
  - Varigheden er 0,9–1,6 s efter hvor langt der skal drejes.
  - Bægeret, terningen og kortbunken glider med rundt om bordet (`placeProps` hvert billede).
- Kameraknapperne er nu fire: Følg turen, Overblik, Skråt og Mit hold (tasterne 1–4). Kun et tryk på en knap eller en tast gemmer valget (`helteludo.kamera2`), så standarden er Følg turen, indtil man selv vælger andet.
- Rettet: `V3D.mount` kalder `resize` ved hver opdatering, og det satte kameraet på plads igen hver gang. Nu sker det kun, når størrelsen faktisk ændrer sig (`V3D.sizeKey`).

## Bæger og terning i en fast bakke i 3D (version 41)
- I 3D står bægeret og terningen i en bakke nederst i venstre hjørne af billedet (`#tray`, bygges i `renderSide` med samme indhold som sedlen i 2D). Bakken står samme sted uanset kameravinkel og zoom, er stor nok til at ramme på en telefon og lyser, når du skal slå.
- Bægeret og terningen på bordet i 3D-scenen er skjult (`visible=false`), så de ikke tæller med i kameraets udsnit og ikke kan klikkes. Kortbunken er stadig på bordet.
- Kameraets udsnit (`V3D.camFor`) holder brættet fri af bakken og kameraknapperne (`V3D.blockRects`). Det firkantede bræts kanter er derfor sat ind som 16 punkter pr. side i `fitPts`.
- Når der slås, ryster bægeret (`.cup.shaken`), og terningen ruller ind (`@keyframes dieroll`), også i 2D.

## Mindre flimmer i 3D (version 42)
- Kameraets dybdeinterval følger afstanden (`moveCamera`: `near=max(.5, afstand−26)`, `far=afstand+60`). Med den lange afstand fra version 35 og `near=.1` var præcisionen så lav, at flader tæt på hinanden kæmpede om pixlerne, når kameraet bevægede sig (z-fighting).
- Flader er løftet lidt fra hinanden:
  - Brættets overflade fra y .001 til .012.
  - Det gamle kort fra −.49 til −.47 (bordet ligger på −.5).
  - Brikkernes ringe fra .012 til .03 og glorien fra .03 til .045.
- Alle teksturer bruger den største anisotrope filtrering, grafikkortet kan (`aniso()`, op til 16), så fine detaljer set på skrå ikke glimter.
- Målt ved to billeder med kun en brøkdel af en pixels kameraforskel, uden animationer: 208 og 390 skiftende pixels mod før 1.713 og 987. Nederst i billedet, ved kortet og bordet, faldt det fra 898 til 3.

## Bægeret vises altid (version 43)
- `.hud .cup` og `.tray .cup` brugte `background:`-genvejen, som nulstiller `background-image`. Billedet sættes i det genererede stilark (`.hud .cup,.tray .cup{background-image:…}`), så bægeret forsvandt, hvis det stilark blev indlæst før hovedstilarket. Reglerne bruger nu kun enkeltegenskaber (`background-color/-position/-size/-repeat`) og virker uanset rækkefølge (testet ved at flytte stilarket).
- Når det er din tur til at slå, står der en guldlabel »🎲 Slå« under bægeret (`.cuplbl`) i både 2D og 3D.
- Husk generelt: brug aldrig `background:`-genvejen på elementer, der får deres billede fra det genererede stilark.

## Sedlen i hjørnet og rolig turrækkefølge i 3D (version 44)
- I 3D står sedlen i øverste venstre hjørne (højst 340 px bred) i stedet for øverst i midten. Kameraets udsnit holder brættet fri af den som af bakken og kameraknapperne (`V3D.blockRects` med `#hud`; `topLimit` bruges ikke længere i `camFor`).
- Kameraet drejer først videre, når den forrige brik er færdig med at gå. Følg-turen-tjekket ligger nu efter `renderTokens`, som starter gåturen; før lå det foran og startede kameraet samtidig med gåturen. Efter brikken er stoppet, er der en pause på 0,45 s (`UI.animEndAt`, `V3D.camPending`).
- Et computerhold slår først, når kameraet er færdigt med at dreje hen til det, plus 0,3 s (`schedule`: venter på `V3D.camPending` og `V3D.camAnim`).
- Målt forløb ved normal fart: brikken går → 0,47 s pause → kameraet drejer 1,45 s → 0,75 s → computeren slår.

## GitHub og GitHub Pages (version 45)
- Projektet ligger offentligt på https://github.com/Lokkegaard/helteludo (gren `main`) og kan spilles på https://lokkegaard.github.io/helteludo/.
- `index.html` sender videre til `helteludo.html`. `helteludo.html` har nu selv `<meta charset>` og `<meta viewport>` øverst, fordi GitHub Pages ikke tilføjer dem, som artefakt-visningen gør.
- Online-spil kræver claude.ai's runtime (`window.claude`) og virker kun i artefaktet. På GitHub Pages virker spil på samme skærm og mod computeren.
- Efter en ændring: publicér artefaktet som før, og skub derefter til GitHub (`git commit` + `git push`). Pages bygger selv siden igen.

## Knappen »Prøv tegnede figurer« er fjernet (version 46)
- Knappen på opstillingen og dens handling (`spritedemo`) er fjernet. Man vælger stadig figurstil i 3D under ☰ Menu (»Figurer: tegnede/3D«).
