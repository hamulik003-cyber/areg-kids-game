# AREG TEST — պարտադիր գործնական հրապարակման ընթացակարգ (2026-10-30)

Այս փաստաթուղթը կարդալ առաջինը՝ `AGENTS.md`, `WORKFLOW_START_HERE.md`, `CURRENT_STATUS.md`, `PROJECT_HANDOFF.md`, `NEW_CHAT_HANDOFF.md`-ի հետ։ Վերոնշյալ ֆայլերի 2026-10-30 անխախտելի կանոնները ամբողջությամբ կիրառվում են։

## Առանձնացված միջավայրեր
- Փորձնական GitHub branch՝ `trial/areg-test-full-app-20261017`։ Միայն այստեղ է կատարվում ընթացիկ փորձարկվող խաղի փոփոխությունը։
- Հեռախոսի Home Screen-ի արդեն տեղադրված **AREG TEST**՝ `https://areg-test-screen-live.onrender.com/index.html?areg_trial=1`։ Փորձարկումը այս նույն պատկերակով է, ոչ թե Safari-ով։
- Render ծառայություն՝ `areg-test-screen-live`, `serviceId=srv-db9obf3ncjis73a2tm3g`, `workspaceId=tea-dau4frvavr4c73fl4jtg`։
- Production՝ GitHub `main` / DotKiosk. պահպանել հաստատված վիճակը։ 2026-10-30 օգտատերը հաստատել է «Ծովամարտ»-ը production merge `3ed4df55e3df4984fa917c2299ed5759336984c4`։

## Յուրաքանչյուր փոփոխության իրական գործնական հաջորդականություն
1. Կարդալ վեց փաստաթղթերը և ստուգել GitHub main/trial commit-ները, branch diff-ը, user-approved baseline-ը, CI-ն ու Render վերջին deploy-ը։
2. Փոխել **միայն** խնդրված խաղի առնչվող ֆայլերը trial branch-ում։ «Միայն ուսումնասիրիր» = write չանել։ Չփոխել մյուս խաղերը։
3. Ստուգել կոդն ու համապատասխան gameplay/PWA/iPhone/iframe սցենարները, commit անել trial branch-ում։
4. Render-ի վերջին deploy-ը ստուգել։ Եթե trial commit-ը ինքնաբերաբար live չի դարձել, կանչել Render `trigger_deploy` հենց նշված serviceId/workspaceId-ով։ `get_deploy`-ով ստուգել մինչև `live` և հաստատել deploy-ի commit SHA-ն։ `build_in_progress` կամ `failed` ≠ `live`։ AutoDeploy-ին կուրորեն չվստահել։
5. Միայն այդ ժամանակ ասել օգտատիրոջը՝ «Փակիր և նորից բացիր հեռախոսի արդեն տեղադրված AREG TEST պատկերակը»։ Եթե հին տարբերակն է՝ ստուգել Render deploy SHA-ն, build output/version JSON-ը, SW/PWA/cache-ը և խաղի իրական UI ուղին, մինչև խնդիրը պարզ լինի։ Մի՛ ստիպել Safari-ում կամ raw.githack-ում խաղալ։
6. Օգտատիրոջ իրական Home Screen ստուգման հաստատումը գրանցել։ Trial հաստատումը production հաստատում չէ։
7. Միայն production տեղափոխելու **առանձին հստակ հրահանգով**՝ նոր release branch `main`-ից, ընտրված խաղի/անհրաժեշտ assets-ի նպատակային import, PWA cache/SW registration/version/test alignment, 3 handoff/status փաստաթղթերի թարմացում, բոլոր CI-ի հաջող ավարտ, focused PR merge, GitHub Pages ստուգում, ապա իրական DotKiosk user acceptance։ **Ամբողջ trial branch-ը երբեք չmerge անել**։

## Պարտադիր հաշվետվություն
Ամեն քայլից հետո հակիրճ նշել կոնկրետ commit, Render deploy ID և վիճակ, փորձարկման պատրաստ լինելը, production-ի անփոփոխ լինելը։ GitHub commit, Render live, Home Screen user acceptance, main merge և DotKiosk acceptance՝ առանձին փաստեր են։ Գործիքների անհասանելիությունը հստակ ասել, երբեք չհորինել արդյունք։
