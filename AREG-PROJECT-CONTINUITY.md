# AREG KIDS GAME — MASTER CONTINUITY SNAPSHOT
Snapshot date: 2026-10-04 (Yerevan)

## Purpose
This file is the handoff/continuity record for Hamlet's Armenian children's educational PWA game for Areg. If a new chat is opened, retrieve this file from Library and continue as if the previous chat continued. Do not ask the user to re-explain known project details unless something is genuinely missing.

## Repository / deployment
- GitHub repo: hamulik003-cyber/areg-kids-game
- Branch: main
- GitHub upload: https://github.com/hamulik003-cyber/areg-kids-game/upload/main
- Live: https://hamulik003-cyber.github.io/areg-kids-game/
- Hard-refresh launcher: https://hamulik003-cyber.github.io/areg-kids-game/launcher.html
- Latest verified V60 upload commits at snapshot: cb36866fd9f7c9063cda9fe5cf26d89f0b57abe6 and 09e31bc575ea1722ff1783db4dc9b6f69f653426
- V60 verified remote state: index styles.css?v=60; launcher kiosk=v60; SW cache areg-v60-birds-gallery-audio-1; gameHatch() -> gameBirdGallery(); bird images present.
- Repo size observed around 64,716 KB (~63 MB).

## Backup baseline
- V58 = approved preliminary final Animals baseline.
- V60 = current verified Animals + Birds build.
- Full current source backup archive created from areg-kids-game-V60-BIRDS-FIX.zip.
- GitHub browser upload limit means user prefers ZIPs/parts with <=100 files. V60 was split into Part 1 = 100 files and Part 2 = 44 files.

## Animals section
Behavior approved in V58 and retained:
- 3-column vertical gallery.
- Whole card zooms on tap.
- Domestic active border soft green #59c95f.
- Wild active border soft red #ef5a5a.
- After sequence card returns to normal/gold state.
- Voice first, then animal SFX.
- Card stays focused during voice + SFX.
- Menu music pauses during sequence and resumes after.
- New card tap stops previous sequence.
- Voice Hints / Effects / master settings respected.
- Voice volume 1.0, SFX volume 0.50.

Animals list, ordered:
1 dog Շուն ընտանի
2 wolf Գայլ վայրի
3 lynx Լուսան վայրի
4 cow Կով ընտանի
5 horse Ձի ընտանի
6 goat Այծ ընտանի
7 camel Ուղտ ընտանի
8 sheep Ոչխար ընտանի
9 cat Կատու ընտանի
10 tiger Վագր վայրի
11 donkey Ավանակ ընտանի
12 bull Ցուլ ընտանի
13 deer Եղնիկ վայրի
14 bison Բիզոն վայրի
15 hippo Գետաձի վայրի
16 zebra Զեբր վայրի
17 giraffe Ընձուղտ վայրի
18 elephant Փիղ վայրի
19 rabbit Նապաստակ ընտանի
20 monkey Կապիկ վայրի
21 lion Առյուծ վայրի
22 bear Արջ վայրի
23 panda Պանդա վայրի
24 fox Աղվես վայրի
25 pig Խոզ ընտանի
26 rhino Ռնգեղջյուր վայրի
27 polar-bear Սպիտակ արջ վայրի
28 leopard Ընձառյուծ վայրի
29 hyena Բորենի վայրի
30 black-panther Սև հովազ վայրի

V58 approved special pronunciations (old Maggie-based system): dog, horse C, bull pause B, deer, zebra phonetic, hyena. Preserve unless replacing the whole game voice later.

## Birds section
Final accepted ordered image/name manifest:
1 Կաչաղակ — magpie — wild
2 Ագռավ — crow — wild
3 Անգղ — vulture — wild
4 Բազե — falcon — wild
5 Սպիտակագլուխ արծիվ — bald-eagle — wild
6 Սիրահար թութակ — lovebird — domestic
7 Թութակ — parrot — domestic
8 Կորելլա — cockatiel — domestic
9 Ամադին — finch — domestic
10 Դեղձանիկ — canary — domestic
11 Ջայլամ — ostrich — wild
12 Կոլիբրի — hummingbird — wild
13 Փայտփորիկ — woodpecker — wild
14 Ջրագռավ — cormorant — wild
15 Ճայ — gull — wild
16 Կարապ — swan — wild
17 Արագիլ — stork — wild
18 Բու — owl — wild
19 Ճնճղուկ — sparrow — wild
20 Ծիծեռնակ — swallow — wild
21 Գվինեական հավ — guinea-fowl — domestic
22 Սիրամարգ — peacock — wild
23 Լոր — quail — wild
24 Աղավնի — pigeon — domestic
25 Հնդկահավ — turkey — domestic
26 Սագ — goose — domestic
27 Բադ — duck — domestic
28 Ճուտիկ — chick — domestic
29 Աքլոր — rooster — domestic
30 Հավ — hen — domestic

Bird behavior = same card/sequence principle as Animals, but narration wording: «[bird name], ընտանի/վայրի թռչուն է», then bird SFX.
Bird SFX are AI-generated realistic effects, not field recordings.

## UI issues still to fix
- «Սպիտակագլուխ արծիվ» text is too long and intrudes into icon area / final letters are not visible. Fix by 2-line wrapping or slightly smaller font, without harming readability.
- «Գվինեական հավ» last portion overlaps the green domestic label; fix layout/wrapping so nothing sits behind the badge.

## Voice strategy decision as of snapshot
User wants the ENTIRE GAME to eventually use ONE girl voice.
Current plan: finish/build the whole game first, then replace all narration at the end with one consistent voice pack.
Preferred candidate: Runway preset voice **Serene**.
Why: Serene pronounced difficult Armenian bird names much better than Maggie.
Target standard for final voice pack: same Serene voice, same speed/tone/pacing, natural Armenian sentences, then local MP3 assets in repo so final game does not depend on expiring signed Runway URLs.
Do NOT generate the full replacement voice pack until the game structure/content is finished, unless user changes this decision.

### Serene tests / approvals
- «Թութակ, ընտանի թռչուն է» — Serene full B was judged “շատ լավ”, but initially user worried it differed from the old Maggie voice. Since whole-game Serene is now planned, this is a useful approved reference.
- Difficult-name Serene test batch: Դեղձանիկ, Փայտփորիկ, Ճնճղուկ, Ծիծեռնակ, Բազե were judged good.
- Ջայլամ first Serene test dropped an internal ա and sounded «ջայլմ».
- Corrected **Ջայլամ A** («Ջայլա՛մ, վայրի թռչուն է։») was explicitly approved as good.
- Prior «Անգղ» Maggie correction was approved before the whole-game Serene decision, but final whole-game replacement should eventually use Serene if possible.

### Problem birds originally reported under Maggie
Need correction/replacement eventually:
Անգղ, Բազե, Թութակ, Դեղձանիկ, Ջայլամ, Փայտփորիկ, Ճայ, Կարապ, Ճնճղուկ, Ծիծեռնակ, Սագ, Բադ, Ճուտիկ, Հավ.
Since whole game will be one Serene voice later, regenerate all narration together rather than mixing voices.

## Runway plan / credits
- At snapshot the connected Runway workspace was on Free with ~10 credits remaining after tests.
- Standard plan shown by Runway: $15/month, 625 credits/month.
- User said they may buy Standard later, but then decided it is fine to finish the entire game first and do all final voices afterward.
- Do not waste credits on unnecessary repeated tests.

## Important audio durability limitation
Current V60 app.js references Runway CloudFront signed audio URLs for Animals and Birds. Those URLs are temporary and can expire. The final production game should NOT rely on them.
Final desired architecture: download/materialize approved voice and SFX MP3 files, store them under the project (e.g. audio/animals, audio/birds, etc.), and rewrite app.js to local paths.
At snapshot, source code is backed up, but remote audio binaries could not be downloaded into the container because the environment could not resolve the CloudFront host. Therefore the backup source still contains signed URLs. This is an important restoration caveat.

## Working style / user preference
- User wants actual working ZIPs, not just instructions.
- For GitHub manual upload, keep each ZIP / batch <=100 files when possible. User uploads contents to main and says «քցեցի»; then verify GitHub remotely before claiming success.
- Never claim deployment succeeded without checking GitHub.
- For voice corrections: generate test first, user listens, only after explicit approval put it into a build. Do NOT make a ZIP before approvals.
- Armenian colloquial, warm, direct.

## Continuity instruction for future chats
When the user opens a new chat and refers to “մեր խաղը”, “Արեգի խաղը”, “կենդանիները”, “թռչունները”, “Serene”, or asks to continue, retrieve this continuity file and continue from here. Treat it as an ongoing project, not a fresh start.

## Approved / useful Runway task IDs for voice continuity
These task IDs identify the exact test generations discussed/approved in the chat. Signed CDN URLs may expire, so prefer retrieving by task ID through the connected Runway workspace if available.
- Serene — Թութակ full B (very good reference): fe2f0393-9d0a-40df-84b5-ed64eba49b75
- Serene — Դեղձանիկ good: 5b154c1d-7feb-4050-81d3-2fb862c1f308
- Serene — Փայտփորիկ good: 94141d4b-f024-4dae-b0a5-130ece304323
- Serene — Ճնճղուկ good: ae672646-016d-4c55-8d29-8e12759117eb
- Serene — Ծիծեռնակ good: e3b7a973-5b5c-4906-905a-3c1a59389e3b
- Serene — Բազե good: bac5b718-52a0-43a9-9c48-961b696da2fb
- Serene — Ջայլամ A explicitly approved: 8c1a2be6-4d0f-484d-9abc-d226228b8db8
- Older Maggie — Անգղ correction explicitly approved before Serene whole-game plan: 1adf0625-e693-431f-a82e-a9939a1b7046


## V127 — standalone SVG theme backgrounds
- Broken combined `theme-user-sprite.jpg` was removed.
- The 10 custom photo-style theme choices now use 10 independent local SVG files.
- Theme blur remains live and global across home, section, and activity backgrounds.
- No game cards, section icons, gallery cards, fonts, or game mechanics were changed.
- Launcher/build/cache baseline: V127.


## V128 — Planets gallery
- V127 preserved on branch `baseline-v127-prefinal`.
- Space → Planets now uses the same gallery cards and tap/zoom presentation system as Animals.
- 30 cards, ordered from Sun through Black Hole.
- Each card has a concise object status. Earth is labeled `Բնակելի մոլորակ`.
- Planet/card artwork is embedded SVG generated locally in app.js, so these images do not depend on the network.
- No other section/game layout was intentionally changed.


## V129 — 30 generated planet/space JPG assets installed
- User uploaded the 30 JPG assets to repo root in one upload commit.
- Space → Planets now uses those uploaded JPG files instead of the temporary generated SVG/data-URI artwork.
- Mapping is fixed: 01-sun.jpg through 30-black-hole.jpg, matching the existing 30 PLANETS records.
- Existing Animals-style card geometry, image window, object-fit center, tap/zoom presentation, labels, statuses, and game mechanics were not changed.
- Earth remains labeled `Բնակելի մոլորակ`.
- Launcher/build/cache baseline: V129.


## V130 — planet status pills use planet colors
- Only Space → Planets status pill colors changed.
- Status text remains white, matching the Nature/Insects badge logic.
- Each of the 30 planet/space cards now has a vivid gradient badge matched to that object's visual color.
- Planet JPGs, card geometry, labels, image crop/centering, animations, and all other sections were left unchanged.
- Launcher/build/cache baseline: V130.
