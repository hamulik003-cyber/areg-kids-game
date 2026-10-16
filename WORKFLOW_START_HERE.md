## 2026-10-16 — PERMANENT RULE: NATURE HEADER LANDMARK FOR ALL FUTURE SCREENS (USER-APPROVED)
- The user has verified the latest production appearance and explicitly requires every newly created section, category, minigame and iframe-embedded game to preserve the **exact same top header vertical position as the approved “Բնություն” (Nature) screenshot**. This is a mandatory design invariant, not an optional suggestion.
- The back arrow, centered title wooden panel and star counter must share the same horizontal top alignment on **every** screen; respect the iPhone safe area / Dynamic Island. The current CSS reference is `--areg-unified-header-top: calc(env(safe-area-inset-top, 0px) + 12px)` in `styles.css`, used by native `.toddler-section-shell` and `.activity-shell`. Standalone game iframes must match the same **visual viewport position**, without accidentally double-counting parent and iframe top padding.
- When building or editing any new screen, reuse the approved header component/layout geometry, top inset, font family, back/title/star sizing and responsive behavior. Do not create independent arbitrary header offsets, margin-top, transforms or top padding. On narrower screens long Armenian titles must fit **inside** the wooden title frame using the existing font and a readable measured size; never allow overflow or shrink text to unreadable sizes.
- Before requesting approval, check **every new screen** and its internal stages/categories against the Nature reference in Safari/iPhone and DotKiosk when available. Preserve gameplay, artwork, audio, star economy, PWA and cache behavior. Changes remain trial-first and main only after explicit user approval.
- Current approved production UI: header alignment PR #79 (`9baccb01cf8f12ad4c6b30432f21e66676ba38a5`) and detail fixes PR #81 (`02bd29b83be2a4b45c34c2f30caa4bb69ad89e0f`); documentation PR #82 (`59d157fd3a9914835081b1c9d3d0a0632f916827`). These supersede older baseline descriptions **for these specifically user-approved changes**. User said latest result looks good; do not imply a comprehensive device test was performed by assistant.

## 2026-10-15 — FINAL USER-APPROVED CANONICAL GAME BASELINE (HIGHEST PRIORITY)
- The user explicitly reconfirmed that the **EXACT** playable version at commit `84cc2cfb9ff835cb4a3ff8589f759aa5789a28f2` is the **FINAL APPROVED GAME** and the sole baseline for all future chats and modifications. Canonical immutable reference: https://raw.githack.com/hamulik003-cyber/areg-kids-game/84cc2cfb9ff835cb4a3ff8589f759aa5789a28f2/index.html . Its approved "Գտիր զույգը" view includes the six illustrated category tiles (fruits, transport, toys, space, nature, tools). Do not replace this with the screenshot of blue circles; the user expressly rejected that as the final visual reference.
- Production code from this snapshot was merged in PR #69 at `9fd5288198777166af62b8d2debce1f9b2265c60`. Documentation-only PR #70 at `7788ca55caca4625cef69a76d00b0e343e9323a7` changed only handoffs, **not the approved game**. Later documentation-only commits likewise must not be mistaken for game-version changes. Verify production file content against the canonical SHA rather than equating main HEAD with a different approved version.
- Permanent production origin: https://hamulik003-cyber.github.io/areg-kids-game/ . Pages run #38755885206 succeeded. The user reported different-looking screens between the immutable preview and production; investigate navigation state, deployed assets and PWA/Safari/DotKiosk cache before changing code. Do **not** claim DotKiosk verified from Safari screenshots. Do not clear storage, uninstall PWA, or reset stars.
- Preserve ALL approved visuals, 6 category tiles, gameplay, animation, sound, stars, PWA/DotKiosk compatibility. Reject unapproved navigation experiments made after canonical SHA, including `c15dd2d`. In each new chat, first read WORKFLOW_START_HERE.md, AGENTS.md, CURRENT_STATUS.md, PROJECT_HANDOFF.md, NEW_CHAT_HANDOFF.md, inspect GitHub main/branches/CI/Pages, state the canonical approved SHA and actual production status, then await a specific user request. All code changes trial-first and main only with user approval.
- Audit run #38755885736 failed the handoff guard for the original PR #69 release (journals missing in that PR); Pages deployment succeeded. Do not conflate audit with deployment or assert browser QA passed. This record is an explicit confirmation of the user's final choice, **not** evidence of an additional code release or installed-device verification.

# AREG Kids Game — ՊԱՐՏԱԴԻՐ ԱՇԽԱՏԱՆՔԱՅԻՆ ՈՒՂԵՑՈՒՅՑ / START HERE

**Թարմացվել է 2026-10-13-ին։ Սա համագործակցության գործող կանոնների առաջնային աղբյուրն է։ Հին փաստաթղթերի հակասող աշխատանքային ընթացակարգերը պատմական են։**

Repository: https://github.com/hamulik003-cyber/areg-kids-game

Գործող խաղի հաստատուն URL: https://hamulik003-cyber.github.io/areg-kids-game/

Մեր իրական նպատակն է արագ և անվտանգ կատարել խաղի փոփոխություններ, տալ անմիջապես բացվող Safari փորձնական հղումներ, օգտատիրոջ iPhone-ի տեսագրությամբ ճշգրտել դրանք և հաստատված արդյունքը հասցնել նույն գործող PWA/DotKiosk-ին՝ առանց սարքի տվյալները կորցնելու։

## 1. Նոր զրույցի պարտադիր սկիզբ

1. ԻՆՔՆՈՒՐՈՒՅՆ մտիր այս GitHub repo՝ եթե GitHub connector-ը հասանելի է։ Ստուգիր main-ի նորագույն SHA-ն, commit-ի իրական բովանդակությունը, ակտիվ ճյուղերը, PR-ները, անհրաժեշտ CI/Pages-ի կարգավիճակը։ Վերջին commit-ը ինքնաբերաբար չի նշանակում օգտատիրոջ հաստատած խաղային տարբերակ։
2. Կարդա ՍԿԶԲՈՒՄ հենց այս WORKFLOW_START_HERE.md-ը, ապա AGENTS.md-ը, CURRENT_STATUS.md-ի, PROJECT_HANDOFF.md-ի, NEW_CHAT_HANDOFF.md-ի վերջին ժամանակագրական գրառումները և տվյալ խնդրին առնչվող կոդն ու փորձնական PR-ի պատմությունը։ Երկար, հին handoff-ներից հակասող պահանջները չեն փոխարինում այս թարմ workflow-ին։
3. Սկզբում հայերենով շատ կարճ ասա՝ ինչն է հաստատված արտադրական վիճակը և նրա SHA-ն, ինչն է փորձնական, որն է չավարտված խնդիրը, որտեղից ենք շարունակում։ Չստուգված փաստը մի ներկայացրու որպես փաստ։
4. Եթե GitHub connector-ը տվյալ զրույցում հասանելի չէ, ստուգիր միացման հնարավորությունը, հստակ բացատրիր սահմանափակումը և խնդրիր կապել GitHub-ը։ Մի՛ հայտարարիր ընդհանրապես «չեմ կարող խաղում փոփոխություն անել», երբ իրական GitHub write գործիքներ կան։ Մի՛ հորինիր commit, live հղում կամ օգտատիրոջ հաստատում։

## 2. ՄԵՐ ՀԱՄԱԳՈՐԾԱԿՑՈՒԹՅԱՆ ԱՐԱԳ ՑԻԿԼԸ

Սա խորհրդատվական աշխատանք չէ. օգտատերը ասում է՝ «սրա գույնը փոխի», «ուղղի», «սկսիր», «@GitHub», և ուզում է, որ օգնականը իրականում փոփոխությունը կատարի GitHub-ում ու նրան ուղիղ Safari հղում տա։ Մի՛ ավարտիր պարզապես կոդի տեքստ կամ ցուցում տալով, եթե գործող GitHub connector-ով կարելի է կատարել աշխատանքը։

A. Ստուգել GitHub-ի իրական կոդը և ընդունված տեսքը. չդիպչել ոչ մի չառնչվող հաստատված բանի։

B. Հստակ փոփոխության խնդրանքը թույլտվություն է **փորձնական ճյուղում իրական աշխատանքը կատարելու համար**։ Կատարել փոքր, թիրախային փոփոխություն նույն համապատասխան trial branch-ի վրա՝ առանց ամեն փորձի համար նոր release կամ մեծ PR գործընթաց սկսելու։

C. Յուրաքանչյուր տեսանելի փորձից հետո տալ **սեղմվող և իսկապես գոյություն ունեցող Safari/GitHack URL**՝ օրինակ https://raw.githack.com/hamulik003-cyber/areg-kids-game/EXACT_COMMIT_SHA/preview-file.html։ Փորձնական ամբողջ խաղը փորձելու համար օգտագործել տվյալ SHA-ի համապատասխան index.html կամ հատուկ preview entrypoint։ Ոչ միայն GitHub PR հղում։ Պետք է փաստացի ստուգել SHA-ն, ֆայլի առկայությունը և հնարավորության դեպքում JS/browser QA-ն։

D. Օգտատերը բացում է հղումը iPhone Safari-ով, ասում է «լավ է» կամ ցույց է տալիս խնդիր սքրինշոթով/տեսագրությամբ։ Եթե չի հավանել՝ հենց նույն փորձնական կոդը ուղղել ու **նոր commit-pinned հղում տալ**։ Միշտ պահել ընդունված սկիզբը, ավարտը, գույները, երաժշտությունը, գործողությունները. շտկել միայն դիտարկված սխալը։

E. Երբ օգտատերը հստակ ընդունում է ու ուզում է հիմնականի մեջ («հաստատում եմ, քցենք հիմնական», «լավա, հիմնականի մեջ», «դիր DotKiosk-ում» կամ տվյալ համատեքստում համարժեք հստակ հրահանգ), անտեղի երկրորդ հաստատում չպահանջել։ Գործարկել անհրաժեշտ ստուգումները, ճյուղի պաշտպանության իրական պահանջներով PR/merge և Pages ստուգումը։ Եթե պարզապես ասում է «նայեմ», «փորձենք», «դեռ չեմ հաստատել», main չտեղափոխել։

F. Փորձնական raw.githack հղումը և արտադրական GitHub Pages/DotKiosk-ն **առանձին են**։ Main/Pages-ում փոփոխություն անելը չի ապացուցում, որ օգտատիրոջ կոնկրետ DotKiosk-ում թարմացումը բացվել է։ Վերջնական սարքային հաստատումը տալիս է օգտատերը։

## 3. ՓՈՐՁՆԱԿԱՆ ԱՇԽԱՏԱՆՔՆԵՐԸ ՉԴԱՐՁՆԵԼ ԴԱՆԴԱՂ

Նախկին, ավելի հին գրառումները պահանջում էին երեք հսկայական handoff ֆայլ թարմացնել ամեն փոքր փոփոխությունից հետո։ Օգտատերը հետագայում **փոխել է այս ընթացակարգը**. արագ փորձերը մի՛ կրկնօրինակիր անընդհատ CURRENT_STATUS.md, PROJECT_HANDOFF.md և NEW_CHAT_HANDOFF.md ֆայլերում։ Փորձերի համար բավական է կարճ checkpoint համապատասխան փորձնական PR-ի comment-ում կամ branch history-ում՝ ինչ փորձվեց, ինչ ընդունվեց/մերժվեց, commit/preview link, թեստի վիճակ և հաջորդ քայլ։

Իսկ **օգտատիրոջ կողմից հաստատված նախնական/վերջնական վիճակը, իրական release-ը, կարևոր վտանգներն ու rollback-ը** գրանցվում են հիմնական handoff-ներում և ըստ անհրաժեշտության AGENTS.md-ում։ Եթե նախագծի qa/handoff-guard.mjs-ը պահանջում է փաստաթղթեր տվյալ կոդային PR-ում, կատարել **նվազագույն ճիշտ checkpoint** այդ PR-ում՝ առանց ամեն փորձի ծանր փաստաթղթավորման։

Բոլոր պատմությունները չեն հավասարվում հաստատման։ Վերջին commit-ը կարող է լինել չհաստատված փորձ կամ սխալ փոփոխության revert։

## 4. ԱՆՎՏԱՆԳՈՒԹՅՈՒՆ ԵՎ ԱՐՏԱԴՐԱԿԱՆ ԽԱՂ

Main-ը գործող խաղի ճյուղն է՝ պաշտպանված pull request-ով և 4 անհրաժեշտ CI աշխատանքներով (նախքան merge ստուգել ընթացիկ ruleset-ը)։ Երբ main-ն արգելում է ուղիղ push-ը, դա «չեմ կարող» չէ. ստեղծել trial branch → տալ preview → հաստատումից հետո PR/required checks → merge → Pages։ Ուղղակի շրջանցել branch protection չի կարելի։

Պահպանել ընդունված բոլոր խաղերը, հայերեն գրությունները, 3D պատկերները, 3D UV-երը, միջավայրերը, ժամանակները, էֆեկտները, հավաքած աստղերը, ընտրված ձայները, ավատարները, localStorage-ը, IndexedDB-ն, PWA cache-ը, service-worker-ը և գոյություն ունեցող հիմնական URL-ը, եթե խնդրանքը չի պահանջում դրանք փոխել։ DotKiosk-ը մի՛ ջնջիր, մի՛ խնդրիր մաքրել տվյալները և մի՛ փոխիր origin-ը հեշտության համար։

«Միայն ուսումնասիրիր» = ոչ մի write գործողություն։ «@GitHub փոխի/սկսիր» = թույլտվություն կատարել թիրախային փորձնական փոփոխություն։ «Դիր հիմնականի մեջ» = փորձարկված ու հաստատված փոփոխությունը release-ի հասցնելու հստակ նպատակ՝ իրական անվտանգության և GitHub կանոններով։

Արագ վիզուալ փորձերի համար նախ գործարկիր համապատասխան, ոչ չափազանց ծանր թեստերը։ Production release-ի համար ստուգիր բոլոր պահանջվող checks-ը և GitHub Pages-ի իրական deploy-ը։ Չպնդել, թե iPhone-ով փորձել ես, եթե փորձել է միայն ավտոմատ WebKit-ը։

## 5. ԱՅՍ ՊԱՀԻ ՀԱՅՏՆԻ ՀՂՈՒՄՆԵՐ (միայն 2026-10-13-ի պահի snapshot. ՎԵՐՍՏՈՒԳԵԼ)

- Main HEAD՝ 8d365c739466eff1e45575235cc3320098d5b6bd — օգտատիրոջ մերժած PR #38 gallery focus փոփոխության վերադարձից հետո։ Սա վերաստուգման ելակետ է, ոչ հավերժական SHA և ոչ հիմք կրկին «V290» ասելու։
- Փորձնական V291 կարմիր մեքենայի անիմացիա՝ draft PR #22, branch feature/v291-reward-car-cinematic-pilot-20261012, այնտեղ HEAD 499b2a2cd69f17ba3487bf4471dc5b52062b1196։ Օգտատերը հավանել է տարբեր դրվագներ, բայց այդ փորձը **main չի merge արվել**։
- Բոնուսների 9 օրինակների համեմատության ինտերակտիվ էջ՝ branch preview/reward-bonus-nine-concepts-20261012, file reward-concepts-comparison.html. 3 bonus դաշտի օրինակ և 6 շարժման ընտանիք արդեն պատրաստված են՝ **դեռ չհաստատված**, նախ պետք է նոր զրույցում վերագտնել այս պատրաստի էջը և ուղարկել փորձնական Safari հղում։
- Գործող հիմնական խաղի URL՝ https://hamulik003-cyber.github.io/areg-kids-game/

## 6. ՊԱՏԱՍԽԱՆԻ ՁԵՎԸ

Հայերեն, պարզ, կարճ։ Միշտ տարբերել **հաստատված հիմնական**, **չհաստատված փորձնական**, **դեռ չարված առաջարկ**։ Կոդային փոփոխության ավարտին տալ աշխատող կոնկրետ commit, անմիջապես սեղմվող փորձնական Safari հղում, և հստակ մեկ հաջորդ քայլ։ Առանց վերագրելու հաստատումը, CI-ն, Pages-ը, DotKiosk-ը կամ պահուստները։

**English summary for new coding agent:** Always inspect live GitHub main/ref, this WORKFLOW_START_HERE.md, AGENTS and newest handoff entries. User requests are authorizations to IMPLEMENT on a test branch, not merely advise. Provide verified SHA-pinned raw.githack Safari preview links, iterate quickly from actual iPhone feedback, minimize changes, keep ephemeral tests out of giant handoffs, document approved releases, preserve all local PWA data. Promote via protected PR/requisite checks only on clear approval. Never conflate latest commit with user-approved game. Read current GitHub state again before acting.
