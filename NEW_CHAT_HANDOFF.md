# AREG Kids Game — ՆՈՐ ՉԱԹԻ ԱՄԲՈՂՋԱԿԱՆ ՓՈԽԱՆՑՈՒՄ
_Թարմացված է 2026-10-10, V280-ի անվտանգության վերադարձից հետո։ Կարդալ առաջին հերթին, հետո ստուգել main-ի իրական HEAD-ը։_

## Հանձնարարություն նոր զրույցի օգնականին
Սա նախորդ երկա՜ր տեխնիկական աշխատանքի ուղիղ շարունակությունն է։ Մի խնդրիր օգտվողից ZIP, screenshot կամ repository URL կրկին։ Կա միացված GitHub connector. ԱՆՄԻՋԱՊԵՍ ստուգիր `hamulik003-cyber/areg-kids-game` repository-ի `main` ճյուղի վերջին commit, README/ `CURRENT_STATUS.md`, `PROJECT_HANDOFF.md`, և հատկապես `constellation-quest-v246.js`։ Այս ֆայլը նոր զրույցի հրահանգների մեկ պատճենն է, բայց վերջին HEAD-ը միշտ աղբյուրն է։

**Հիմնական հասցեն**՝ https://hamulik003-cyber.github.io/areg-kids-game/ . iPhone-ում խաղը բացվում է DotKiosk-ով։ `refresh.html`-ի հետ նախկինում եղել են 404, էկրանի մասշտաբի և սև բեռնման խնդիրներ․ սովորաբար ուղարկիր միայն սովորական գլխավոր հասցեն, եթե հատուկ cache ախտորոշում պետք չէ։ Չառաջարկես ջնջել DotKiosk-ը, PWA-ն կամ clear website data, քանի որ կարող են կորել տեղային աստղերը/կարգավորումները։

## Ներկա ամենակարևոր խնդիրը և պահանջը
Խաղ՝ `Տիեզերք → Աստղային համաստեղություններ → Գտի՛ր համաստեղությունը`, 38 ճիշտ նկար/անվանում, 4 մեծ պատկեր 2×2, իսկ երեխան սեղմում է ճիշտը։

Օգտվողը մի քանի ժամ շեշտում է.
- ՃԻՇՏ պատկերը պետք է **հենց հպման պահից անընդհատ, մեկ սահուն ուղիով** մոտենա էկրանին՝ առանց թեկուզ մեկ պահ կանգնելու, դանդաղելու մինչև զրո, ապա նորից առաջ գալու։
- Միևնույն պահին մյուս **երեք պատկերները մնում են իրենց 2×2 դիրքերում, առանց հետ գնալու/փոքրանալու, մեղմ թափանցիկանում են**, և մինչև հաղթող պատկերը հասնի վերջնական լիաչափ կենտրոնին՝ արդեն լրիվ անտեսանելի են։
- Պահպանել հաղթողի ճիշտ կենտրոնացումը, 3D տեսքն ու approved 38 տիեզերական նկարները, 850մվ մոտեցումը, մոտ 2750մվ մինչև exit, 690մվ exit, 160մվ մաքուր աստղային կարճ անցումը, նոր 4-ի 780մվ հայտնվելը, 1 աստղ ամեն 10 ճիշտ պատասխանից։
- Պետք է գործի **ԲՈԼՈՐ** փուլերում, ոչ միայն առաջին Առյուծի դեպքում։
- Հիմնական UX-ում **որևէ նկատելի երկար պաուզա** չլինի հաջորդ 4 պատկերների բեռնման պատճառով։

**Կոնկրետ պատճառը մինչև V275**՝ V273–274-ի `animateWinningHero(t)`-ում `earlyProgress=.30*Math.sin(...)` հաղթողին սահմանափակում էր 30%-ով, մինչև `_fadeReleaseAt`-ը ստացվեր երեք այլ պատկերների fade ավարտից. դա երևում էր որպես «գալիս է → կանգնում → նորից գալիս»։ V275-ն անցնում է հաղթողի **մեկ ամբողջական Web Animations API compositor `hero.animate(..., 850ms)`**, ոչ թե երկփուլ RAF/timeout gate. մյուս 3-ը WAAPI `card.animate({opacity:1→0}, 340ms)` են հենց նույն click-ում։ Hero-ի exit-ը դեռ նախորդ անիմացիայից անվտանգ անջատվում է։ Սրանք source փոփոխություններ են. **իրական iPhone-ում դեռ ընդունված չեն**։

**V274-ից**՝ նախքան նախորդ հաղթող նկարը exit անի, հաջորդ 4 օբյեկտների `plan.ready=Promise.all(preload(...))` արդեն պետք է `prepared=true` լինի, որպեսզի դատարկ ֆոնում ծանր loading չլինի. այս լոգիկան պահպանել։

## Դեպլոյ և թեստերի կանոն
- Վերջին ճյուղը միշտ կարդալ՝ GitHub connector `mcp__GitHub__fetch` → `https://api.github.com/repos/hamulik003-cyber/areg-kids-game/branches/main`։
- `.github/workflows/areg-full-audit.yml` երեք պարտադիր հաջող test job՝ `assets-and-code`, `mobile-browser` (Chromium), `ios-webkit` (Playwright)։ Նույն commit SHA-ի GitHub Pages `build` և `deploy` հաջող լինելը նույնպես հաստատել։
- Նոր փոփոխություն push անելիս անպայման նույն commit-ով թարմացնել **ԵՐԿՈՒՍԸ**՝ `CURRENT_STATUS.md` և `PROJECT_HANDOFF.md` (հակառակ դեպքում handoff guard CI-ն կձախողվի)։
- Ցանկացած վտանգավոր փոփոխությունից առաջ `backup/<unique-descriptive-name>` ճյուղ պահել exact main HEAD-ից. GitHub tool `create_branch` → `create_blob` → `create_tree` → `create_commit` → `update_ref` expected SHA։
- Շատ թեստեր նախկինում սխալ PASS էին միայն առաջին պատասխանի համար։ `qa/browser-smoke.mjs` հիմա պարտադիր վերլուծում է առաջին, երկրորդ, երրորդ, չորրորդ ճիշտ պատասխանները՝ 3 fade, hero movement, star, next quartet եւ չափումներ։ Թեստերը չթուլացնել՝ պարզապես կանաչի համար։ WebKit-ի իրական rendered RAF cadence-ը կարող է լինել 150–300մվ; փաստացի կադրերի տվյալները հաշվի առնել։ V275-ի նոր հատուկ stress test-ը ստուգում է 420մվ main-thread busy հանգամանքը։
- Օգտվողը հաստատ չի ուզում «CI green = տեսողական անթերի» կեղծ հավաստիացում։ Հաստատված է միայն երբ ինքը DotKiosk-ի տեսագրությամբ ասում է՝ ճիշտ է։

## 38-ի ավարտ, միավորներ և հնչյուններ
- Երկու Space guessing խաղերը՝ (1) 38 համաստեղություն (2) 30 Space Search 3D օբյեկտ/մոլորակ։
- Յուրաքանչյուր խաղ մուտք գործելիս score `0/0`՝ սխալը ձախ RED, ճիշտը աջ GREEN (զրոն սպիտակ)։ Սխալ կրկնակի tap-ը կրկնակի սխալ է։
- Առանց անունը կրկնելու ամբողջ pool-ն ավարտելուց հետո՝ մեծ կենտրոնացված **հաղթանակ / խրախուսանք / հավասար** dialog. ցույց է տալիս տվյալ ցիկլի վերջնական թվերը, իսկ վերևի score-ն անմիջապես նոր `0/0`։ Նոր խաղ **ինքնուրույն ՉԻ սկսվում**՝ միայն մեծ կանաչ `↻ Խաղալ նորից` կոճակից։ Ելք և կրկին մուտք = `0/0`։
- Ընդհանուր աստղերը առանձին persistent են և յուրաքանչյուր 10 ճիշտից +1. ոչ մի reset չանել։
- Հաղթանակի մեղեդին և մեղմ ծափերը V268-ից iOS Web Audio live context + 22 soft claps. **իրական հեռախոսում դեռ սպասում է օգտվողի հնչյունային ստուգմանը**, ուստի մի պնդել, թե լսվում են։
- Բոլոր մյուս խաղերը, մոլորակների հավանություն ստացած UV textures/3D, պատկերներ, ձայներ և մենյուն պետք է մնան անփոփոխ։

## Պահուստներ և պահպանում
- Նախկին լիարժեք green V274 source՝ `a963374d857e660ce0677ccc71ee8c4973389df7` պահուստավորվել է որպես `backup/v274-green-before-single-continuous-winner-motion-v275-2026-10-09`։
- V273 green `98f4a8682005aa95f24292015f656af8196e81ca` և V272 green `34d4eab1e3a63368fd6cf296d32ad387514819de` նույնպես պահուստավորվել են, նախորդները չջնջել։
- GitHub repositories, PWA cache / persistent stars backup-ը երկարաժամկետ անվտանգ պահեստավորման կարևոր հարց է. օգտվողը ուզում է հետագայում վաճառել անհատական երեխաների խաղեր՝ առանց տվյալները կամ հասանելիությունը կորցնելու։

## Հետագա հերթականություն
1. Ստուգել `main` HEAD և V275-ի մասին վերջին status/QA/Pages։ Եթե V275-ը CI FAIL է՝ աղբյուրային կոնկրետ խնդիրը գտնել, շտկել ու նորից QA/Pages-ը ստուգել։ Առանց սպասելու user-ին, լրիվ ավարտել։
2. DotKiosk-ում 3–5 անընդմեջ ճիշտ գուշակման տեսագրությամբ ստուգել հաղթողի **ԱՆԸՆԴՀԱՏ** single compositor շարժումը, մյուս երեքի անշարժ dissolve-ը և նոր քառյակի pause-free մուտքը։ Եթե user ասում է սխալ է՝ լսել նրա նկարագրածը, մի նշել «բոլոր թեստերը կանաչ են» իբրև մերժում։
3. Միայն դրանից հետո ստուգել վերջնական արդյունքի 38/30 cycle-ը, `↻ Խաղալ նորից`, `0/0`, ձայները։ Չփոփոխել նկարները, տեքստերը, layout-ը։
4. Անպայման առաջիկա պատասխանով հաղորդել user-ին վերջնական main SHA, backups, հաջող/անհաջող CI/Pages, առկա չստուգված հանգամանքները. առանց ֆայլ/ZIP կրկին խնդրելու։

Ամբողջ նախագծի լրիվ պատմություն՝ `CURRENT_STATUS.md`, `PROJECT_HANDOFF.md`։ Նոր զրույցի օգնականը կարող է աշխատել անմիջապես GitHub-ից։

## V276 newest — device approval pending
- The user requested a softer, synchronized result in every round. Correct picture immediately approaches in ONE uninterrupted 1120ms WAAPI ease-in-out; all 3 other pictures begin stationary gentle 580ms opacity fade on the SAME tap. No old 30% mid-zoom stop. Preserve approved next-four 780ms entrance and V274 preloading.
- Last green V275 `9b3869ad38887e87760be5dc65427d87e03c738e` backed up at `backup/v275-before-soft-synchronized-constellation-transition-v276-2026-10-10`. Verify V276 exact main SHA CI/Pages and real DotKiosk 3–5 consecutive right-answer video. Older V275 content earlier in this handoff is historical.


## V277 — LATEST: faster approach only (user DotKiosk evaluation pending)
- User loves V276 and requested only a slight speed increase in the winner's zoom: **1120ms → 1000ms**, same ease-in-out and same immediate simultaneous three stationary 580ms fading decoys on EVERY round. New-four 780ms entrance, win total 2750ms, exit 690ms, clear sky 160ms, all graphics/sounds/game state unchanged. Version v277 for safe PWA cache update.
- Previous V276 green commit `3d186e59d290ecb2ff48dff7e70f32a99b04e7cb` is backed up at `backup/v276-approved-soft-animation-before-faster-hero-v277-2026-10-10`. Check current main exact-SHA audit and Pages before claiming CI success. Wait for user real DotKiosk confirmation.


## V278 — latest; awaiting actual iPhone test
- User requests experiment: 850ms winner approach (same time as Space Search planets but KEEP elegant `cubic-bezier(.42,0,.58,1)` rather than their quick-out easing). The winning constellation moves continuously from same tap; all other THREE stationary images fade over approved 580ms. All 38 rounds use shared handler. No adjustments to their approved 780ms next-four entrance, image assets, audio, 2750ms win stage, 690ms exit, 160ms sky, score/stars or any other section.
- Latest pre-change green V277 HEAD `402114010cf9a4fe79b67ef3a02be538f6d30195` backup `backup/v277-approved-1000ms-before-850ms-test-v278-2026-10-10`. Updated QA for 850ms and sparse iOS WebKit RAF; verify exact V278 commit GitHub Actions and Pages before signoff. User must compare DotKiosk real video.


## V279 latest: actual iPhone video proves fade only works in first round
- At ~7.9s FIRST correct answer fades 3 other silhouettes smoothly, but at ~13s SECOND and ~18s THIRD they stay opaque while winner zooms. Approved winner native 850ms must remain unchanged. V279 keeps first native 580ms fade and uses 580ms shared requestAnimationFrame opacity curve with exactly matching cubic-bezier(.42,0,.58,1) on ALL later 37 choices; iOS stale WAAPI on later rounds bypassed. Next-four 780ms entrance, prefetch, layout, other games, audio, scoring/stars unchanged. Updated QA verifies first, second, third and blocked fourth; needs exact commit CI/Pages plus user DotKiosk verification. Backup backup/v278-850ms-before-all-round-decoy-fade-fix-v279-2026-10-10 of 5dea4eaf23a699184b3aaccde1ce79fb7bf7afad.

## V280 CURRENT: V279 rejected on real iPhone, safe restore from V278
- User: V279 broke even FIRST correct answer soft fade. Reverted gameplay/QA to V278 green SHA 5dea4eaf23a699184b3aaccde1ce79fb7bf7afad, with only v280 PWA cache/import bump and V280 build dataset. 850ms winner and 580ms three-fade V278 behavior restored. This is NOT yet an all-round fade fix: previous video proved second/third wrong artwork fades visually late. Keep original 38 art/images/audio/scores/stars. V279 saved branch backup/v279-rejected-by-user-before-safe-rollback-v280-2026-10-10. Check exact main SHA CI/Pages, ask real DotKiosk test; never claim resolved until user's device verifies.
