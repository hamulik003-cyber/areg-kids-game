(() => {
  'use strict';

  const DESIGN_W = 709, DESIGN_H = 1536;
  const root = document.documentElement;
  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>[...c.querySelectorAll(s)];

  const homeScreen=$('#homeScreen'), sectionScreen=$('#sectionScreen'), activityScreen=$('#activityScreen');
  const settingsModal=$('#settingsModal'), avatarModal=$('#avatarModal'), menuMusic=$('#menuMusic'), toast=$('#toast');
  const sectionBackdrop=$('#sectionBackdrop'), sectionHero=$('#sectionHero'), sectionTitle=$('#sectionTitle');
  const sectionGames=$('#sectionGames'), sectionStars=$('#sectionStars'), homeStars=$('#homeStars'), starCounter=$('#starCounter');
  const activitySectionTitle=$('#activitySectionTitle'), activityTitle=$('#activityTitle'), activityStars=$('#activityStars'), activityContent=$('#activityContent');

  const SETTINGS_KEY='areg-settings-v35', AVATAR_KEY='areg-avatar-v2', AVATAR_SOURCE_KEY='areg-avatar-source-v2', STARS_KEY='areg-stars-v35';
  let settings={master:true,music:true,voice:true,effects:true,theme:'day',font:'rounded',...loadJson(SETTINGS_KEY,{})};
  if(!settings.font||settings.font==='system')settings.font='rounded';
  const STAR_RESET_V40='areg-stars-reset-v40';
  if(!localStorage.getItem(STAR_RESET_V40)){
    localStorage.setItem(STARS_KEY,'0');
    localStorage.setItem(STAR_RESET_V40,'1');
    localStorage.removeItem('areg-magic-unlocked-v1');
  }
  let stars=Number(localStorage.getItem(STARS_KEY)||0);
  const themes=[['day','Օր'],['night','Գիշեր'],['winter','Ձմեռ'],['rain','Անձրև'],['aurora','Բևեռափայլ'],['wood','Փայտ'],['forest','Անտառ'],['ocean','Օվկիանոս'],['sunset','Մայրամուտ'],['space','Տիեզերք']];
  const fontPresets=[['rounded','Կլոր','Աա Բբ Գգ'],['clean','Մաքուր','Աա Բբ Գգ'],['book','Գրքային','Աա Բբ Գգ'],['classic','Դասական','Աա Բբ Գգ']];
  let currentSection='nature', currentGame=null, gameCleanup=[];

  const MAGIC_UNLOCK_KEY='areg-magic-unlocked-v1';
  let magicUnlocked=new Set(loadJson(MAGIC_UNLOCK_KEY,[]));

  const MAGIC_ITEMS=[
    // Vehicles
    {id:'car',icon:'🚗',name:'Մեքենա',motion:'drive'},
    {id:'racecar',icon:'🏎️',name:'Մրցարշավային մեքենա',motion:'driveFast'},
    {id:'bus',icon:'🚌',name:'Ավտոբուս',motion:'drive'},
    {id:'truck',icon:'🚚',name:'Բեռնատար',motion:'driveHeavy'},
    {id:'firetruck',icon:'🚒',name:'Հրշեջ մեքենա',motion:'siren'},
    {id:'police',icon:'🚓',name:'Ոստիկանական մեքենա',motion:'siren'},
    {id:'tractor',icon:'🚜',name:'Տրակտոր',motion:'driveHeavy'},
    {id:'train',icon:'🚂',name:'Գնացք',motion:'train'},
    {id:'plane',icon:'✈️',name:'Ինքնաթիռ',motion:'fly'},
    {id:'helicopter',icon:'🚁',name:'Ուղղաթիռ',motion:'flySpin'},

    // Animals
    {id:'cat',icon:'🐱',name:'Կատու',motion:'pounce'},
    {id:'dog',icon:'🐶',name:'Շուն',motion:'bounce'},
    {id:'rabbit',icon:'🐰',name:'Նապաստակ',motion:'hop'},
    {id:'lion',icon:'🦁',name:'Առյուծ',motion:'roar'},
    {id:'tiger',icon:'🐯',name:'Վագր',motion:'pounce'},
    {id:'elephant',icon:'🐘',name:'Փիղ',motion:'stomp'},
    {id:'giraffe',icon:'🦒',name:'Ընձուղտ',motion:'sway'},
    {id:'horse',icon:'🐴',name:'Ձի',motion:'gallop'},
    {id:'monkey',icon:'🐵',name:'Կապիկ',motion:'swing'},
    {id:'panda',icon:'🐼',name:'Պանդա',motion:'bounce'},
    {id:'bear',icon:'🐻',name:'Արջ',motion:'stomp'},
    {id:'fox',icon:'🦊',name:'Աղվես',motion:'pounce'},

    // Birds
    {id:'chick',icon:'🐥',name:'Ճուտիկ',motion:'hop'},
    {id:'bird',icon:'🐦',name:'Թռչուն',motion:'flutter'},
    {id:'owl',icon:'🦉',name:'Բու',motion:'sway'},
    {id:'eagle',icon:'🦅',name:'Արծիվ',motion:'soar'},
    {id:'duck',icon:'🦆',name:'Բադ',motion:'waddle'},
    {id:'parrot',icon:'🦜',name:'Թութակ',motion:'flutter'},
    {id:'swan',icon:'🦢',name:'Կարապ',motion:'glide'},
    {id:'flamingo',icon:'🦩',name:'Ֆլամինգո',motion:'sway'},

    // Insects / little creatures
    {id:'butterfly',icon:'🦋',name:'Թիթեռ',motion:'flutter'},
    {id:'bee',icon:'🐝',name:'Մեղու',motion:'buzz'},
    {id:'ladybug',icon:'🐞',name:'Զատիկ',motion:'buzz'},
    {id:'ant',icon:'🐜',name:'Մրջյուն',motion:'crawl'},
    {id:'beetle',icon:'🪲',name:'Բզեզ',motion:'crawl'},
    {id:'cricket',icon:'🦗',name:'Ծղրիդ',motion:'hop'},
    {id:'spider',icon:'🕷️',name:'Սարդ',motion:'crawl'},
    {id:'snail',icon:'🐌',name:'Խխունջ',motion:'crawlSlow'},

    // Sea
    {id:'dolphin',icon:'🐬',name:'Դելֆին',motion:'swimJump'},
    {id:'fish',icon:'🐠',name:'Ձուկ',motion:'swim'},
    {id:'whale',icon:'🐳',name:'Կետ',motion:'swimHeavy'},
    {id:'octopus',icon:'🐙',name:'Ութոտնուկ',motion:'wiggle'},
    {id:'turtle',icon:'🐢',name:'Կրիա',motion:'swim'},
    {id:'crab',icon:'🦀',name:'Խեցգետին',motion:'crab'},

    // Magic
    {id:'rocketMagic',icon:'🚀',name:'Հրթիռ',motion:'launch'},
    {id:'starMagic',icon:'⭐',name:'Աստղ',motion:'twinkle'},
    {id:'moonMagic',icon:'🌙',name:'Լուսին',motion:'glow'},
    {id:'rainbowMagic',icon:'🌈',name:'Ծիածան',motion:'rainbow'},
    {id:'unicorn',icon:'🦄',name:'Միաեղջյուր',motion:'prance'},
    {id:'dragon',icon:'🐲',name:'Վիշապ',motion:'roar'}
  ].map((item,index)=>({...item,cost:20+index*5}));

  const ANIMALS = [
    {id:'dog',name:'Շուն',type:'ընտանի',image:'animal-dog.jpg'},
    {id:'wolf',name:'Գայլ',type:'վայրի',image:'animal-wolf.jpg'},
    {id:'lynx',name:'Լուսան',type:'վայրի',image:'animal-lynx.jpg'},
    {id:'cow',name:'Կով',type:'ընտանի',image:'animal-cow.jpg'},
    {id:'horse',name:'Ձի',type:'ընտանի',image:'animal-horse.jpg'},
    {id:'goat',name:'Այծ',type:'ընտանի',image:'animal-goat.jpg'},
    {id:'camel',name:'Ուղտ',type:'ընտանի',image:'animal-camel.jpg'},
    {id:'sheep',name:'Ոչխար',type:'ընտանի',image:'animal-sheep.jpg'},
    {id:'cat',name:'Կատու',type:'ընտանի',image:'animal-cat.jpg'},
    {id:'tiger',name:'Վագր',type:'վայրի',image:'animal-tiger.jpg'},
    {id:'donkey',name:'Ավանակ',type:'ընտանի',image:'animal-donkey.jpg'},
    {id:'bull',name:'Ցուլ',type:'ընտանի',image:'animal-bull.jpg'},
    {id:'deer',name:'Եղնիկ',type:'վայրի',image:'animal-deer.jpg'},
    {id:'bison',name:'Բիզոն',type:'վայրի',image:'animal-bison.jpg'},
    {id:'hippo',name:'Գետաձի',type:'վայրի',image:'animal-hippo.jpg'},
    {id:'zebra',name:'Զեբր',type:'վայրի',image:'animal-zebra.jpg'},
    {id:'giraffe',name:'Ընձուղտ',type:'վայրի',image:'animal-giraffe.jpg'},
    {id:'elephant',name:'Փիղ',type:'վայրի',image:'animal-elephant.jpg'},
    {id:'rabbit',name:'Նապաստակ',type:'ընտանի',image:'animal-rabbit.jpg'},
    {id:'monkey',name:'Կապիկ',type:'վայրի',image:'animal-monkey.jpg'},
    {id:'lion',name:'Առյուծ',type:'վայրի',image:'animal-lion.jpg'},
    {id:'bear',name:'Արջ',type:'վայրի',image:'animal-bear.jpg'},
    {id:'panda',name:'Պանդա',type:'վայրի',image:'animal-panda.jpg'},
    {id:'fox',name:'Աղվես',type:'վայրի',image:'animal-fox.jpg'},
    {id:'pig',name:'Խոզ',type:'ընտանի',image:'animal-pig.jpg'},
    {id:'rhino',name:'Ռնգեղջյուր',type:'վայրի',image:'animal-rhino.jpg'},
    {id:'polar-bear',name:'Սպիտակ արջ',type:'վայրի',image:'animal-polar-bear.jpg'},
    {id:'leopard',name:'Ընձառյուծ',type:'վայրի',image:'animal-leopard.jpg'},
    {id:'hyena',name:'Բորենի',type:'վայրի',image:'animal-hyena.jpg'},
    {id:'black-panther',name:'Սև հովազ',type:'վայրի',image:'animal-black-panther.jpg'}
  ];

  const ANIMAL_AUDIO = {
    "dog":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/b141d0ef-ba13-48f8-9336-3633113576fe/AREG_pronunciation_TEST_dog.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMGI2MGVhZDgxMjA3ZmY4YiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIwMTc1Mn0.KI1Bh5sLW-Dl9tPyMHc7xqApbTR22OeeQXZzx3Oytf0",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/7da6c050-cb8b-484f-8f2b-7f8d9c561e11/AREG_animal_dog_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNjRiMWFjZGYwOWE2MmVkNSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzMTMyN30.VK3qgp2VAoaynHFIWP09tcxriCUCHtQVy_DRM9694Ro"},
    "wolf":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/2e22f1b3-ecd4-4772-94be-e2192a920d6d/AREG_V56_FINAL_wolf_Armenian_stressed_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNzY4M2FhNDBjYjU2ZjYyZSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2MTg4OH0.c5S_SKshdRSRTVjkJlKd3eLZkOO4pzs-bF9VMJAMQUQ",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/eb752af2-4cb7-4655-8779-2367208ae43e/AREG_V56_wolf_corrected_animal_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYTM2MDdjNDAxMTIxMzczOSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIxNDI3Mn0.2OBVjqgz3vpCRjosYYRf3BdAFqkW1ldqF8xu_AuzQAE"},
    "lynx":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/4c008df8-2499-4973-b369-5783442ef319/AREG_V56_FINAL_lynx_Armenian_stressed_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDlhMzJiYTVjOGFhOTczOSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MTUwOX0.2LiBsCcBJdfuLfL8xfB9M-zbi4kKcMTRz2Pctwri6TI",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/26f78256-3c24-424b-9f49-e2e824c0e4f5/AREG_animal_lynx_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiM2VjY2MyYTdiMDAzYTQ1MyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIwMzM2N30.vbzgHStPxGSFMH-8lbMAKaU3F4_C8Ul7zl8Qyj8bcOA"},
    "cow":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/335cae80-a8ef-4044-a5fd-7cd352e2e537/AREG_cow_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDUzZWViYWI0ZTA5NTFjNSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2MTg2N30.cBzAh4y7mZKctYaImoHVjjMSpamOZe-XsSjRo8vHT78",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/99c19d9b-d9b6-4158-aa4b-17c885551355/AREG_animal_cow_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzNlZmI5YWZjNmVjOWZhYyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0OTQ1NX0.w9MMqZs_4UF6_4CjNWolzv01zJ-dVIZc841b6m8-9RA"},
    "horse":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/bffc71a7-03e4-44b6-a2c2-af3bc4bda8f7/AREG_FINAL_PRON_TEST_horse_c.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTFhZmUzODFjZjdlNDU4MCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI4NjkxM30.4xPw6UNtOEpcMT1nDIf-k7fziqYO5ssXSL1n7_mMseQ",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/cb93da8b-c556-4785-9dfc-d0aac9b1cd42/AREG_animal_horse_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZmJhYjE3MzM3OTUyNWJhYyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI1NzAxMX0.4qBRxVC1YXjP8zzsvptgErnbpGv-_GETKBpD-SwJ0U8"},
    "goat":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/07b56df6-896c-4699-a2f6-e189623e2eac/AREG_goat_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjUzODA0MjA1MDVkNmQ3NSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyNDk5Mn0.1wPbICg6SwzOsfLQwpyUApcr3DYJMBT4WxBDhgOisO8",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/75a5b693-459f-41a7-81e6-f528b30a66c8/AREG_animal_goat_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYjEzYTQyODNiZGI3NzE4MiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2MDU0N30.6b71i1t70WYvbhycplIT8Ips5lmyBlvzwHF64ZwSWYM"},
    "camel":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/1ca589ec-83d9-49c4-b5ce-287e07c7f337/AREG_camel_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTQ5ZTE0YjdhMWNiYTA0OCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIwMzUxMX0.r3Dtq4mB9X0tn2cq76IId2sf65eAUpsuLn6AsbOZlEw",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/f20eb156-96bd-4b0f-bbab-bb11adf9e0e3/AREG_animal_camel_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDJlMjMzMGUxZjY3MzI1OSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzOTQzOH0.YlyyGT8jTBBrSbp1jkXjlHJI9Jl37ogoBgICWZB6B5I"},
    "sheep":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/5d577ef3-30c9-4aee-9d2a-9e411ecf26da/AREG_V56_FINAL_sheep_Armenian_stressed_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzQwZDRmMTNmMzgyMmI4YyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIwMzM0N30.a1EH-7fHaiJEG4ovRH4Z7A2KN-7VrnouFas3XzZAfoo",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/5548673e-79e9-4484-aa82-8f2d426f540d/AREG_animal_sheep_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzgyYTZmZTI4OTY4YTlmMyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3Mzk1NH0.cyW7Zh7keEIi2PPmFEMvK4VXZHby9Y78hiA7u-oqB8g"},
    "cat":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/38f0194b-b2dc-47ea-b900-ec54697a8408/AREG_cat_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiODU0NTAwN2I2ZDJlYzM3MyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3NzQzNX0.Ko1IJZdJZ93ahXcj9RVarLQg6Ie_2dzZSRl2bHanMUA",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/b39c50dd-941a-4664-83e6-033df8494d55/AREG_animal_cat_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNWUzZGZlYWJiZWIxNjZiZSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0NTk5NX0.6Ouq8cOFDibU5YIIPtD1M8aF0ekuEQ06KiCyX9I2mtc"},
    "tiger":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/62f1a0e3-5451-4fa2-9792-3b85b9ae4bf5/AREG_tiger_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYWY3ZjYxMzg4MGMyODBhZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2NjM2MH0.tR7KlVHAJ_BCxq5jIZmmizkTngYzXXfBU24X--Z9ugk",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/f08f3336-777f-4b67-92e6-fd3ee316d705/AREG_animal_tiger_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZDZhY2U1MWM3YmEyNmM0NyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyOTQ2OH0.23XT92b30RdrCFZjjFWFPOQvqTx77scJVNrij2izVMU"},
    "donkey":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/ebf9feb5-4a80-426c-858c-1ccd4b00e628/AREG_donkey_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZGQyMmNjMzdhZWE5OGNkZiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3NDAzOX0.sKVVezc-TDRPltYK0unNLVApoLBgWrGftCEdFV7iGjc",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/53c1081e-06bc-473a-a5fb-092dc7427fc2/AREG_V56_donkey_corrected_animal_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOGRkYWFhOTM0NWRlZGUyYSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3NDc3MX0.lTA9nIDmXdlWmr-wf_h-roEi2i2Jgt_l053Dr3dvCRE"},
    "bull":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/bcfaf3d1-c39c-4efb-b571-3cbe76577cda/AREG_BULL_PAUSE_TEST_bull_pause_b.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOTQ1YjAxYTM2NDU1M2ZkZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyNTc2M30.5CD0KRUZlmN_oX54ddg3PMzkgangz_e3ypr5umw0iO0",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/b653b373-0658-4907-b4f2-1cda29723095/AREG_animal_bull_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOWM5N2FiNjAwZTQ5NDc3ZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2NTUwNH0.ta7zayY_9Ri7U6-1tZOISmRlyxDEjYQOvlRTUzlXuZs"},
    "deer":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/bdb4ea10-d775-431d-8fa3-0bf2218ffb53/AREG_pronunciation_TEST_deer.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiM2ViZmVlYmY3Y2ViODQzNyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyNjY4N30.GkPyi4Znd-BGEMT5itemLOg0xZmKktUkwkOb08WWd6s",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/145c2ed6-638f-4a5c-ae0f-a28ea27fe97d/AREG_V56_deer_corrected_animal_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNWQ0ZjE2Nzk1YzQ1ZTMxMCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyNzM4NX0.prgmZopWRXdboEdz4ky0hMVb_OVB2FytDFu8V1q2X7U"},
    "bison":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/825b3af3-d4fe-43e0-9dc4-4824990ae30e/AREG_V56_FINAL_bison_Armenian_stressed_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTAzYTE5OGQ5NDk2M2Y3YSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MTQ4NX0.4hD2fTMqfd6CL_5ukvDnuZCX4Ju1tC_EPp_i-ekI1V8",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/0b451488-ef17-4c40-907e-84c2b5a33321/AREG_animal_bison_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZTExYWJjMmZlMjg1ZGYwOCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MDExMX0.LgkkCjnu1Ibg0s7HcmqPvmrhq8AKUP98nllxsurGbYg"},
    "hippo":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/f2de29bf-0a46-4a2a-93b9-19578ca15589/AREG_hippo_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzMyZGM1MjBjZTdhYTJiYiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MTUwNH0._b0LTdeHjjBN6ioB9xlGZximQCtwV_8WhDCxN6XLtnw",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/774e2336-6896-4434-8cf0-cdb751bd8bce/AREG_animal_hippo_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOGVjZDdjYTdmMjlhMTJmNCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIwNDI2M30.t79an5Rc-6Bbt9VIOGSFXU5NL8AliQulA8FsHmn7z6w"},
    "zebra":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/248c9cf4-31e4-4195-b02f-e1663de5dfaf/AREG_pronunciation_PHONETIC_zebra_phonetic.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiN2IxYWYxM2Q0MThiMTM3MCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIxNjA2MX0.-kBIvGEKTg0TkBTyV3yeVTl24kaXMd-hdpwEU11gfMM",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/bb3f4b84-0a88-45a7-b3fc-44ea2aa9ba3e/AREG_animal_zebra_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNjNhNzU0Y2NjMTk2M2EwYyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyOTAwNH0.DUxw4yYwGVE2-oR_2Qx9B_Fwxs3808mlFk_wN-weRc0"},
    "giraffe":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/1b772415-cab9-4cb5-9abd-064320f46f60/AREG_giraffe_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYjNlOTE4MWE2YjdlNjI1ZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI1ODUyMn0.IiJXw6H3LIIC40dyq0HLXzb1_sBDcAjIeyYvY-oMCAw",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/eda8d0b5-dab6-48f7-9d13-4fa5c26ae767/AREG_animal_giraffe_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOWFmNDEyOTA4MzliNjY4MiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MjAwMH0.9XFMhii0cMm9fERp_Z1mQK0vl9M5n-NubH9wSeSvAk4"},
    "elephant":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/ef164dcc-1757-41bf-9509-a3fee371e711/AREG_elephant_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzJhMjI5MTczZGJlNTAyNCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0ODE1MX0.GWVEYrLr_Lf_2cgMh_FudNbq3SRIOojAKTuJQP--xHQ",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/1250fc9d-cfc4-44c8-b1b5-bdeef4d2df1a/AREG_animal_elephant_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNTY1NmUwOWExNWEyNDM3ZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTE5NjU3MH0.vj-gP5WZ86b_gtht6hPnNXIPthqS9s1m03TJL9GevmA"},
    "rabbit":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/61ab27c5-0b5f-438f-953e-702ce7aab3fc/AREG_rabbit_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZGE3YTA4MTc4OTgxZmVmOCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MTc1MX0.UfIFnxgto1j9dA_7Zv0ah1bZhG3i5dEm6x8nrOrJnj8",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/a9552ae6-1e41-498d-a2e7-cfd9324d3eb0/AREG_animal_rabbit_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDNhYWIzYTMwYzU1OTVlOSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIwOTM3OX0.y0ykSTXXrR3Qm6mmMjtqDqxwiqWu4QtzuGH4bV4KrZs"},
    "monkey":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/47e2e3db-c90a-494a-9eb2-a124ff73e621/AREG_monkey_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMmFjY2U2YmJmNWMwZWUwOSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0NTg4M30.Gd5pMeZKsr6Y-Vg7Gm0yHjblgZzslJSAttGrtiUcqcc",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/078efba2-0cb5-4b93-ac24-f9d7e4ca3dc2/AREG_animal_monkey_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzVlMDhjYTRkNWRiMDJmOCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzODgyMH0.51kyn_UOoQLfFUdA1MDC1FSh74-ZC7ksb8Lrc_9sIZg"},
    "lion":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/1154d83b-1810-4f34-8627-6691fe8a7439/AREG_lion_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDU2ZWY4ODU5ZjkzZjgxMiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI1MTQ2MX0.NUmUlwg2saxpGHH2vXiP-X6Rqg-rjYNLX4NXuUC0apg",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/7e2e3cd7-d608-45ef-99ce-c5c71d976cac/AREG_animal_lion_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNmI2ODM4YWQxMWU0OTYyZiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3ODc2NX0.rIQV4VB7ZLnzrxIlLLqCnyDBXhLKYKdS21NJaxgHlNs"},
    "bear":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/e166cd05-762e-4946-8c9b-3730f235beb9/AREG_bear_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYTcyNTFmMDY1NzhmNDFhMiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3NDI0Nn0.g85Ou4eZjJ7U70wsoBW5eW7udRkwvlBLIQePra3022I",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/21b84ee7-7e5c-4915-8941-ac96c0e54dc0/AREG_animal_bear_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYTZiYWZjM2ZiZWU1ZWE4ZSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzMDUyN30.vUSNkwDoC9_w6XEcPngH4z-DnWnfoHWoeTgqaKmir2g"},
    "panda":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/9cecc975-0f6d-4727-a0c1-41c6674c16b8/AREG_panda_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZGNlYmQ0MzQxNmVlMDU5NSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIxNDAwNH0.w32i3uVIypAeMhbyj2qn55E9S1SB_W1fBA1e39BPfbE",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/951d3ad7-5d47-4173-b525-37f647b29d60/AREG_animal_panda_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiY2JiM2RlZGE3YzdiMjNhNyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI1NTY0Mn0.FOsXrKzOtDAQZg26ijosRBru82VN12sv7gh-_HAVg_c"},
    "fox":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/62546c4a-f66f-4340-85ba-fd8cc6f86335/AREG_fox_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOWMxMTgxMWM0OThiZDc1ZSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTE5OTI2MH0.a-gvDfIbyIfD9EQ9ewRCtgn4j9vKBRWaBGF_djBYbGU",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/c28c5ce5-16bc-4ae5-ac99-e7c3670f7569/AREG_V56_fox_corrected_animal_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNzBkNjU1MTQyZWI3MDU5YyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyOTA3Nn0.omxHjBQYvSctgP-TVtI4a-6eb3_DS9DwgQkDC87iDX0"},
    "pig":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/16a02257-06cc-4bb4-9883-0b2ca292d467/AREG_V56_FINAL_pig_Armenian_stressed_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNTEyYjM5ZDg3NDIyNWU1NSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI4MTc1Mn0.j_y36vsy6nDFuI1v73uX58KQFXJuyQOVa89_CG0q1m4",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/ade96e6a-4c8a-4734-9e9d-607d888f9775/AREG_V56_pig_corrected_animal_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzc2YjUwMzFmYWVlODczZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3NDE2MX0.VSU0H7Se30aOnkjvD8Rji3DYnUEoHoeNrg8JQOc8KcM"},
    "rhino":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/77b94079-6328-4ae4-b42a-72930f340694/AREG_rhino_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDljNDMxODQ0ODlhZmJkNSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0NTcwMH0.sSHR4mkR-Ty_xYyDunYX3nm2JHZDqLSDs8CcYqarVMY",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/230896ef-3dea-42f9-a382-d7bf2f68414e/AREG_animal_rhino_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDM2NTFmOGRkOWIzN2I1MCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2NjA2MX0.qeQ2XMUw2YmlIZ6oaxmbQumnXrTjoJgF_K3VaHCye6s"},
    "polar-bear":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/f7c3cb02-ea66-407f-84ff-ae15ade7220e/AREG_polar_bear_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNjIxYTY1YjhjNzBmMTlkOSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyMTk0NH0.Wmsan9gSTuCnHfJXeojq6BOsKKgg6iaXv48Xy5Xf-RI",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/0ddf5a15-0591-438f-bea0-25982184ee80/AREG_animal_polar_bear_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTA0M2QwZmFhYzU0MWQ2OSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3MzQ2Nn0.CoHBQnqskO8mJ5O1XEa3IRMpKU1lPb3u9GcbmvpK-dY"},
    "leopard":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/3a06123d-813e-4d12-b4c3-09b4b8e9b802/AREG_leopard_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNzQzZGNkMDQyYzhmYjI2OSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzMTIzNn0.T99ne1hHxtu-wRZwhrkKuoJWKhRvw7dlSLWoinrKeN8",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/5b104034-e398-4c71-9154-74ec151bd96f/AREG_animal_leopard_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYmU0M2Q3NDg3Yjc1OWFmNiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyNzQ2NH0.c6gZ2y_Iew6SwJZijcLLu-9VWxLp7rOzApAf3-R_Jks"},
    "hyena":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/c0e07ab6-c7dc-4b46-a928-25536d86722c/AREG_pronunciation_TEST_hyena.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZmI1NWZiNjRmZTNkZjg1MyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIwODkzMn0.P44138NZQ8vGyrgfXT861nXcAUcLOWVQm9uqBq-lD5s",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/1b5e7e22-7d9c-4124-8dea-68c919e282b5/AREG_animal_hyena_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYmVmZmQ3NjZiNjAyMWZhYiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3OTQ2Mn0.pnYw3nZyqXKDJ1NbczaEzVuEI5r2MbOswUKHgW6YtI8"},
    "black-panther":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/76515791-02e3-40c4-bc2b-7b3c6aa7a63e/AREG_black_panther_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiODAxZGMyNjVmYzVjMTA0NSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIxOTU1N30.Jbgy0aZSLjE7v1FB1OtPYctJu4Igq86XcCPB0Cg7r5o",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/fcda82d2-43c5-4aa4-9cd6-28ddc11c0ec2/AREG_animal_black_panther_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZTc2NTc4N2U0NjI4ZjIzNyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyMDQ3OH0.9Ok7RRJdyCSX6Ys2eFbRMC_kGQUIwZQ9L69phFnAePo"}
  };

  const BIRDS = [
    {id:"magpie",name:"Կաչաղակ",type:"վայրի",image:"bird-magpie.jpg"},
    {id:"crow",name:"Ագռավ",type:"վայրի",image:"bird-crow.jpg"},
    {id:"vulture",name:"Անգղ",type:"վայրի",image:"bird-vulture.jpg"},
    {id:"falcon",name:"Բազե",type:"վայրի",image:"bird-falcon.jpg"},
    {id:"bald-eagle",name:"Սպիտակագլուխ արծիվ",type:"վայրի",image:"bird-bald-eagle.jpg"},
    {id:"lovebird",name:"Սիրահար թութակ",type:"ընտանի",image:"bird-lovebird.jpg"},
    {id:"parrot",name:"Թութակ",type:"ընտանի",image:"bird-parrot.jpg"},
    {id:"cockatiel",name:"Կորելլա",type:"ընտանի",image:"bird-cockatiel.jpg"},
    {id:"finch",name:"Ամադին",type:"ընտանի",image:"bird-finch.jpg"},
    {id:"canary",name:"Դեղձանիկ",type:"ընտանի",image:"bird-canary.jpg"},
    {id:"ostrich",name:"Ջայլամ",type:"վայրի",image:"bird-ostrich.jpg"},
    {id:"hummingbird",name:"Կոլիբրի",type:"վայրի",image:"bird-hummingbird.jpg"},
    {id:"woodpecker",name:"Փայտփորիկ",type:"վայրի",image:"bird-woodpecker.jpg"},
    {id:"cormorant",name:"Ջրագռավ",type:"վայրի",image:"bird-cormorant.jpg"},
    {id:"gull",name:"Ճայ",type:"վայրի",image:"bird-gull.jpg"},
    {id:"swan",name:"Կարապ",type:"վայրի",image:"bird-swan.jpg"},
    {id:"stork",name:"Արագիլ",type:"վայրի",image:"bird-stork.jpg"},
    {id:"owl",name:"Բու",type:"վայրի",image:"bird-owl.jpg"},
    {id:"sparrow",name:"Ճնճղուկ",type:"վայրի",image:"bird-sparrow.jpg"},
    {id:"swallow",name:"Ծիծեռնակ",type:"վայրի",image:"bird-swallow.jpg"},
    {id:"guinea-fowl",name:"Գվինեական հավ",type:"ընտանի",image:"bird-guinea-fowl.jpg"},
    {id:"peacock",name:"Սիրամարգ",type:"վայրի",image:"bird-peacock.jpg"},
    {id:"quail",name:"Լոր",type:"վայրի",image:"bird-quail.jpg"},
    {id:"pigeon",name:"Աղավնի",type:"ընտանի",image:"bird-pigeon.jpg"},
    {id:"turkey",name:"Հնդկահավ",type:"ընտանի",image:"bird-turkey.jpg"},
    {id:"goose",name:"Սագ",type:"ընտանի",image:"bird-goose.jpg"},
    {id:"duck",name:"Բադ",type:"ընտանի",image:"bird-duck.jpg"},
    {id:"chick",name:"Ճուտիկ",type:"ընտանի",image:"bird-chick.jpg"},
    {id:"rooster",name:"Աքլոր",type:"ընտանի",image:"bird-rooster.jpg"},
    {id:"hen",name:"Հավ",type:"ընտանի",image:"bird-hen.jpg"}
  ];

  const BIRD_AUDIO = {"magpie":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/03bee5af-6bd1-43a4-b6b9-676aa78db2f4/AREG_V59_bird_magpie_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYjlkODEzZGNhZjFhNmYwZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3MzgyMH0.DQ3QxQ20SriyAMlSlnSptzxPfSKdfIo9om6DzZZAcmA","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/6448fd00-ba1e-4433-98f7-b45c44ffdd5b/AREG_V59_bird_magpie_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTUwN2FkZjZhYzg2NDM4MCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIxMjAyMn0.YqMnAW0ZBjO8lGJeDwe8MGRcOHb3RLj9yEt8z1lO6y8"},"crow":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/23880978-9e3f-4579-8b39-ee407a3f5dc2/AREG_V59_bird_crow_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiM2RjNDJhMjY5Zjg2YzE2MSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyOTIyMn0.DCD_DyCkc2AHkxv45YvsgVUc6iHyEf4QXZl77lAerjo","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/86602a46-ea29-4250-b100-ebdea094d44a/AREG_V59_bird_crow_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzMwYmNlMmE1NDUyZDg2NyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2MTk5NH0.7oDR5AYRkhNX7UZxfV0gNB5yotiNtoEnSlorRU9droQ"},"vulture":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/7fdb71ff-dd9c-4239-8de0-0509f7cf5019/AREG_V59_bird_vulture_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOTlmN2EyNDc2ODQwNjVhYSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI4Njk4M30.XOUTHxj5henpMzQ4B8jjBQUnitr5U2qbEHeHua9yyyM","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/b44e8cef-dd16-4aab-94cb-744772a1b526/AREG_V59_bird_vulture_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTJmNjJmMjg4ODI3YzBjMyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MzgxNn0.BGOvjV_eFkgYSDTjETogpP6BsFZhI5AxZupAsE3pAAk"},"falcon":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/9ac35182-df63-4483-b83f-edf7975bb9ef/AREG_V59_bird_falcon_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZGVmMzJmMjc1MTQ4NTg3OSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI5NTI3MX0.p3YPvV2A2RjOtKNsQEH8jElDY5qMBgfZ_adYLoYlrac","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/8b0da747-71e9-41aa-a5e3-af21cf4b2158/AREG_V59_bird_falcon_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZDQ5NDBhODBiZTY3YWNiYiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI5NzQwOH0.OdxVEpvKl_wxCOxeJbxmA_dgx-GArjruWW0g9Xw_kkA"},"bald-eagle":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/6bff7ff2-dcd5-42bd-9e57-e1cd780a589b/AREG_V59_bird_bald_eagle_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZWZkNmFmZTIyZWZhMmI4ZSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0ODM1NH0.B6DjePucosvQyZb3cm8FYtUCymitEJu1knidlMUEZF4","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/f0e544c6-0e2a-4c61-9b23-fdd28fe64d05/AREG_V59_bird_bald_eagle_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzM3ZDRiNGM3ZmFmN2M2NSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2Njg5Mn0.mryQqn7kYIystQH8ozk8TA3XXhS2kgeINWAFyQVjh4g"},"lovebird":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/e3ac7ded-ca31-4106-b9e4-41f210c00568/AREG_V59_bird_lovebird_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzEyZTFhNTc3ZDc3OWZmZSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzMjA4N30.jCXD2wdvXJmm7T-3pA9bBd55emo_egww4Quj6U1gsSA","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/d690f975-d4d5-4e6a-b728-d44afde5e9aa/AREG_V59_bird_lovebird_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZTFlNTZhOGY0YTE0NDUxZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIxNzQyM30.yDQ5pRbVZJ8FbP8UhsYzb-gLQ-lvHB_GIPmejReViZ0"},"parrot":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/e1e5d600-bdde-4e06-b6de-f216f89dfce5/AREG_V59_bird_parrot_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNGY0YmUzZThlYWQ0ZmVjZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzMTIwOH0.9zudCNPl2IiFQGM-tquHrKMBXctEfOoBhHOjedY7mC4","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/aebc10b4-561b-4768-a2fc-328a4bc56a9c/AREG_V59_bird_parrot_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYjM4NGNmZmJkOGI3MDlkNCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI1Mjg1OX0.d2ryJok1cBNcm2nB30g4-Ur7DctPWG5HeofAwz_NkWA"},"cockatiel":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/d90fbb0f-d2de-40d9-9238-2933b47dd61b/AREG_V59_bird_cockatiel_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYjg5MDI3MGMxOTU2N2IzNyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI5NjUyNH0.WALUgb64iGlZbSO6MKLOU3HzgBaSGmDliAAksmcy7ng","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/138cf1f2-cdf0-4528-9ea9-c83e26dbd684/AREG_V59_bird_cockatiel_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTRiNmM5ODE2NzJhMjMwNiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2NzQ1N30.muUPc_QBv77T9A5rBJxqxE6VwweWM-f-y8T7v0mnDuU"},"finch":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/21d9bf16-7146-43af-9bc5-ad53eef141a9/AREG_V59_bird_finch_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOWE3OGE4ODFhNWU3ZDVhOSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3NTUyMX0.5wD1H6esXyNhzjttvqxAawA8BXaYGXI9wzTVQfUSh7c","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/a25ea2b3-4efe-43b0-84ad-19074e7f59f2/AREG_V59_bird_finch_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTBiZTYzMzI1ZjIxNGNjMyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3MTA5MH0.9PxLx_CJrlVa1wFqxiwpuXEtIbn3jkHOe7Ywnlk-2eQ"},"canary":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/b01bfc45-7812-493f-9027-daaee5708b04/AREG_V59_bird_canary_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNmZmNTNlNDY3N2ZjMGE2NSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI1MjAzOH0.NOuN2pyDvr2ECQObRHUbAi-3BJgb0B5t8OLVZJD6Fqo","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/c24fc676-2bf7-4cb4-88bb-aeb212b68cbb/AREG_V59_bird_canary_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMjk1MjM0NWQ3NmQwNDI2OSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyNDQxM30.zk-R9u3J6s5Kta48kEQV-FSFVJ9ITvc6OkKzEuIlAEk"},"ostrich":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/ddeae588-86e8-4e03-8323-6d3bad66d62a/AREG_V59_bird_ostrich_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzYwMTU3OTNkN2IwM2QzMyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyNTYxOX0.2x7ez5DWcdgPnvDjYb3Gl5HhSn2URpTL4y8PXoyPl8Y","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/0577e41f-4c1c-44a5-9bc5-498f2a97a0df/AREG_V59_bird_ostrich_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYWQxYTg3OWY1MGVkYmFhNiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3ODYyM30.Uj4iKWy0kNiyWqe_OWvJvR_enGVHxIK7ISEmaVQA7Qw"},"hummingbird":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/e467d8e9-1646-4f56-9cb9-1b746fdd584d/AREG_V59_bird_hummingbird_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDRmZjg1OGM0OTQ2NDlhMCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI5MTUzMn0.hABEFQdUZEkmW-J_2uFL5os_OgK5OsV2yeyKt4dL9VQ","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/0dc3ac0b-e327-4388-9ffb-6e2d91efb80d/AREG_V59_bird_hummingbird_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzkyN2E0YmYyN2IyOTUzZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3Njk5MX0.BpEQ9gmqu9DSIaEdT5cDAaTgBo1nXBsNLOXWXSGVcus"},"woodpecker":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/dd382c7b-619c-4ffe-9282-ea00407f2085/AREG_V59_bird_woodpecker_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNzUwNDE0ZTRkYzhhYjc5MiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2NTc2NH0.vWIiNDz9R-aVV9Q-omKwJB31KiuhmOwY2HBzjnFIcGg","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/aac9f94b-7abd-4cd6-a6be-eafd07c4927d/AREG_V59_bird_woodpecker_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiY2ViMGYyZDI3Mjk0ZThiNyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI4Mzc5NH0.X0XrR0IYug4ioyaWFk5gEMDhJeiGMrvsHDFPlPn1pJ8"},"cormorant":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/cff8ccf7-f64f-45cd-82f0-701744e308f6/AREG_V59_bird_cormorant_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOGY2ZDZhM2RkZDIxOGRhZSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzMDkwOX0.ZZSwJTzrM_2noYTTjEW4zpDkQ2a_J93849aM2tcage0","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/4496981b-a10d-4c4a-8f54-0377a64bef7f/AREG_V59_bird_cormorant_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOWZiMjRjODljYjhlYjJlMiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MzE0NX0.gAu0aPOfAEph9wczgKm0b-SAxHC05LgX0txXK9I1ht4"},"gull":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/caf3af1f-cc3e-49da-a2ac-2380a772b515/AREG_V59_bird_gull_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjk1MTg1ODFlOGMxODY3YyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzMDk3N30.H38w-P8LbPle0cWmf929UuzWbNb7S1rHctTmtBSZaN0","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/4a914bdb-fae7-4485-ab0e-59c423e83d6e/AREG_V59_bird_gull_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOTQ0NjQ3ZGU0M2MzOWE0ZiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0OTg4Nn0.uiuLWtWEF1WrYBYCvTeJGQHnagP91XAwl94o87_JKJQ"},"swan":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/85f6873b-a7a0-46fd-91e5-39e484c2f777/AREG_V59_bird_swan_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiODQ0ZWI3ODNhN2ZmNDBmZiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI5MzY5OX0.aEw4JYzPJn6Q2WWhO-v0GBdDNFQxOnSL2-Y0XB4Hlao","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/1b44ee16-58f3-43a1-84a9-4ee481e6469a/AREG_V59_bird_swan_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYmI0MGRjYTRlZDA1NWEyMCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0NDU4MH0.Wdya4OSvpMcPPC8ftoWumac-5QNP_Yp2bRqEvy0gCfM"},"stork":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/fe993577-c7f1-4cf9-af7d-5fbb9298482a/AREG_V59_bird_stork_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNWNhZmFjNWM0OTYwYjNkYiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzNDM5Nn0.D656FVjpGa2MJAqjWjT1z7gWF11oTuyouEwABPC4Hjc","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/fdd234c2-8baf-4554-946f-2a10e4314732/AREG_V59_bird_stork_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZThhZWI0MjFhNzg3YmZmOCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI4MzQ4OX0.J3LqA-UBGm1xIPEwyvPAiB8jcQBcjTnTkBAZ3whLstg"},"owl":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/f2706106-4ebe-4eba-a649-348686b73136/AREG_V59_bird_owl_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiN2UxZTRkODdlMjYxOTNjZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyMzk0M30.ydktIPGv18jeHo0Y1w1OVWdepGGbC1U7rkWPYKT4gRU","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/3be2801a-adce-4b80-a682-8cc2f63a625f/AREG_V59_bird_owl_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjAzNjc3NDk2ZTFmZTdhNyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIxODEyMX0.NnRRSL4JXi9WFBG2mE9YHGDl8I56Q1OiGHIL9T2zUnA"},"sparrow":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/a721707f-a343-4344-b690-29443921a68a/AREG_V59_bird_sparrow_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOTQxYzg1N2VjNWU0ZjcyMSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3Nzk1MH0.wian39o32vQ9nfXsGjtwb8Gd__WbYm3KK7bky7fRIIE","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/c2b1cbd6-29ab-49d6-b5be-8a3c315838f0/AREG_V59_bird_sparrow_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNTViMGVmMWZjMTUzZjU2MCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI5NDExMX0.5LcF-bIaKJtbzqjR8qMBArhL5D2RFfZVZBJdTB1wd6Y"},"swallow":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/6ba52d53-81c9-4750-8bb7-184f65cdc2ea/AREG_V59_bird_swallow_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNGNhNTA5OTc5ZWE0NTJlNyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzNzkxMX0.V7xx6rtF9falKWSxU2M3T-qEogRyT7Hq21SzoR7rTJw","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/333a522a-e4bf-432b-97a9-3c92fa577f2f/AREG_V59_bird_swallow_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzQ3MWNjZjhjZTM5NTczNCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyMDQ3Mn0._jzx6yhCp4UadWVyw__qL35zdUe0wB76E-3_s_AVinw"},"guinea-fowl":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/54df61fe-b054-4d22-91f9-bcde4fd359ee/AREG_V59_bird_guinea_fowl_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYTZiMDllOTYyMmNhZGM2YiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MjM5MH0.Cu2aXq4Y-JgftTuBTz8P8JlCwL1BupuhsSMcWMXnDo8","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/c6f40b0d-ccc7-437c-baba-fa0e4358eb86/AREG_V59_bird_guinea_fowl_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOTZjMDk4ZDdhYWIxN2Y5MCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2MjAzOX0.46eVZ1hKlMfguaFiT8WtEmCXxvYjyoR_UcLRCUskoh8"},"peacock":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/8fb81aac-87cc-4798-8863-d907808b61b2/AREG_V59_bird_peacock_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOTliZGNhNmQ0YTE1MThmZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI5Nzc3M30.dVITDO-bnPggdsg__Gz3D7IO8UA4Kmi-aFTPC3ilHc4","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/70c868bb-a0a1-46f5-b910-2a365efb3b16/AREG_V59_bird_peacock_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZDJhNDg1ZDU5YmE2NDdlNSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyMzEyNX0.jEBgoQL48zG5wY4I5JSr-k2Vkc2ZTEZKrAW7goGPm2s"},"quail":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/97ff1bae-bd2d-416a-8cc9-ed864dd90770/AREG_V59_bird_quail_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYTRjM2IyMGFjYzQ2Y2MyYSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI1MTcyMn0.V-AvDbC__nOoOUWK78rCK4QPeNzg7vxQcQ0Woek8G94","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/0f7347c5-ca95-42e6-978e-57fbf7111a71/AREG_V59_bird_quail_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNzg2Y2YxY2E1ZGI4ZDk0ZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3MjkwNn0.7B05CqBWz-S_vrstY9HS30Q3Y2vkAg0CBoWHltzvgyU"},"pigeon":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/2fcba203-571d-4a6d-b650-3e7c978b13fb/AREG_V59_bird_pigeon_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOTA4YzI2OGNiZWRkNDg2NCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3MzYxMn0.cgUuqI1iWMHJuBrqjBwvV_j2xfdN5_XDUdKPoc4Jfso","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/d27b4aef-72a2-4f4c-a943-54817c6808ec/AREG_V59_bird_pigeon_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOGNmN2Y0MzAwNGZmYzk5ZiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3Nzc0NH0.UTsSiwrO_n345xG7_FjAFtsUx8Ikbyai6zaaKzOW4y0"},"turkey":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/eeb04a58-4f94-4519-ba3e-c976e4a70b12/AREG_V59_bird_turkey_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYmUwNjI5MDRhNDlhMWU1ZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0NTk1Nn0.xyutz223lT4Ua_c7n6Y1Pj7dECWz1tqn80I02fwAhUg","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/dd43807e-1d2e-458c-9f81-4274511680d8/AREG_V59_bird_turkey_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMGE1ODhjMzE4NDdiYzE3MiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MjQxN30.rnjcJonDj1auIQOA6h-uzMMBbHcRUCdE3LZS4sbnhgU"},"goose":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/66542c02-e2c5-4586-ae93-932c345d2018/AREG_V59_bird_goose_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOTUxMzM1Mzc3MzRmNmM2MyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI4Nzk5MX0.9__WNMInmR2NtgxDOyE3r412tWEex-71K6JQ6Nj7fiE","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/2a506d16-4916-4121-a0c7-3a222f57035e/AREG_V59_bird_goose_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOTUyMzlhMTg3MTU4YTkzNyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzOTE5Mn0.aLo9jYfGSbcR0mCVTg16833cspsEuMXxmhE0rQLQKr8"},"duck":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/abdf4d49-bef1-49ee-a8aa-3459c0e0b778/AREG_V59_bird_duck_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZGRmODU1ZGYxNTE0OTUxNiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3MTY0N30.S4BUV-LA4Hs6onUY2WFESRTOyg79oH5pnnStTZpd-jU","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/0356e968-4a38-456a-8572-95c24bdca233/AREG_V59_bird_duck_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOTkyNzZkZTcyMWQ0MzhmMiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI5MzI4N30.Jsy6T3iCtNk4aGBfuolbGrABtrUw3nxb6_LNYX64I8Y"},"chick":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/f2fcb7e0-c441-440b-8f94-cf9089506038/AREG_V59_bird_chick_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYjkyZGU1YTY0M2Q2MjI0NiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2NjQ3MH0.Uy5V31ud31ml1DLhaHU5YjbqtS4EhRF5iypOufDgmLs","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/86f18c44-7f69-4885-b2fd-4c073afea460/AREG_V59_bird_chick_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYTM2OWJhODA4YzJiMWFjZiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIxNTIzMn0.bVuCbggZipTEydKvMePxQ5SjatOzxe9ZUbmj9BJuigc"},"rooster":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/ae7d369a-7111-48f4-8ff0-dab8bfcfe474/AREG_V59_bird_rooster_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNzMzZGI0ZDNmYWNjNmZmNiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI5NTgyN30.OoihN0yNRb25bcI1fSvMdTGnGD9zgmDWN2nqL9Yk6jg","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/20f005fe-57a3-425e-bdcb-6365551bfee7/AREG_V59_bird_rooster_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjhkNDc4ZTAyYjBiMTJkYiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0Mzc0NH0.tG_Tl_WWfpTZXS9qqPl8wB0GcbV4wMRmwLPP45iCtBw"},"hen":{"voice":"https://dnznrvs05pmza.cloudfront.net/text_to_speech/73f6b329-6258-4dd6-8831-1ddf769024f7/AREG_V59_bird_hen_Armenian_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZGRhOGEyYTU0ODljZTQ5YiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzMjQyMX0.eVhnQbzY4guNBOpxDVT9tH8MB5qOWXJpfNizms9k7_U","sound":"https://dnznrvs05pmza.cloudfront.net/audio_sfx/55bdcc09-12a3-42a1-abf2-8c65994a6260/AREG_V59_bird_hen_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDg4ZGRlYWE4MzVkZjMxMyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0OTcwNn0.dRFoJ7wqj3W4VaoWQiTRYkiqKWLsADDHXpW-bTS4dnk"}};

  const SEA_CREATURES = [
    {id:'dolphin',name:'Դելֆին',type:'կաթնասուն',group:'mammal',image:'sea-dolphin.jpg'},
    {id:'seahorse',name:'Ծովաձի',type:'ձուկ',group:'fish',image:'sea-seahorse.jpg'},
    {id:'octopus',name:'Ութոտնուկ',type:'փափկամարմին',group:'mollusk',image:'sea-octopus.jpg'},
    {id:'sea-turtle',name:'Ծովային կրիա',type:'սողուն',group:'reptile',image:'sea-turtle.jpg'},
    {id:'clownfish',name:'Ծաղրածու ձուկ',type:'ձուկ',group:'fish',image:'sea-clownfish.jpg'},
    {id:'crab',name:'Խեցգետին',type:'խեցգետնակերպ',group:'crustacean',image:'sea-crab.jpg'},
    {id:'jellyfish',name:'Մեդուզա',type:'աղեխորշավոր',group:'aquatic',image:'sea-jellyfish.jpg'},
    {id:'starfish',name:'Ծովաստղ',type:'փշամորթ',group:'echinoderm',image:'sea-starfish.jpg'},
    {id:'whale',name:'Կետ',type:'կաթնասուն',group:'mammal',image:'sea-whale.jpg'},
    {id:'shark',name:'Շնաձուկ',type:'ձուկ',group:'fish',image:'sea-shark.jpg'},
    {id:'pufferfish',name:'Փքաձուկ',type:'ձուկ',group:'fish',image:'sea-pufferfish.jpg'},
    {id:'manta',name:'Մանտա',type:'ձուկ',group:'fish',image:'sea-manta.jpg'},
    {id:'lionfish',name:'Առյուծաձուկ',type:'ձուկ',group:'fish',image:'sea-lionfish.jpg'},
    {id:'moray-eel',name:'Մուրենա',type:'ձուկ',group:'fish',image:'sea-moray-eel.jpg'},
    {id:'lobster',name:'Օմար',type:'խեցգետնակերպ',group:'crustacean',image:'sea-lobster.jpg'},
    {id:'squid',name:'Կաղամար',type:'փափկամարմին',group:'mollusk',image:'sea-squid.jpg'},
    {id:'manatee',name:'Լամանտին',type:'կաթնասուն',group:'mammal',image:'sea-manatee.jpg'},
    {id:'swordfish',name:'Սրաձուկ',type:'ձուկ',group:'fish',image:'sea-swordfish.jpg'},
    {id:'seal',name:'Փոկ',type:'կաթնասուն',group:'mammal',image:'sea-seal.jpg'},
    {id:'penguin',name:'Պինգվին',type:'թռչուն',group:'bird',image:'sea-penguin.jpg'},
    {id:'narwhal',name:'Նարվալ',type:'կաթնասուն',group:'mammal',image:'sea-narwhal.jpg'},
    {id:'orca',name:'Խոյադելֆին',type:'կաթնասուն',group:'mammal',image:'sea-orca.jpg'},
    {id:'beluga',name:'Բելուգա',type:'կաթնասուն',group:'mammal',image:'sea-beluga.jpg'},
    {id:'walrus',name:'Ծովացուլ',type:'կաթնասուն',group:'mammal',image:'sea-walrus.jpg'},
    {id:'sea-otter',name:'Ծովային ջրասամույր',type:'կաթնասուն',group:'mammal',image:'sea-sea-otter.jpg'},
    {id:'anglerfish',name:'Ձկնորսաձուկ',type:'ձուկ',group:'fish',image:'sea-anglerfish.jpg'},
    {id:'nautilus',name:'Նաուտիլուս',type:'փափկամարմին',group:'mollusk',image:'sea-nautilus.jpg'},
    {id:'cuttlefish',name:'Սիպել',type:'փափկամարմին',group:'mollusk',image:'sea-cuttlefish.jpg'},
    {id:'leafy-seadragon',name:'Սաղարթավոր ծովավիշապ',type:'ձուկ',group:'fish',image:'sea-leafy-seadragon.jpg'},
    {id:'shrimp',name:'Ծովախեցգետին',type:'խեցգետնակերպ',group:'crustacean',image:'sea-shrimp.jpg'},
    {id:'sterlet',name:'Ստերլետ',type:'ձուկ',group:'fish',image:'sea-sterlet.jpg'},
    {id:'trout',name:'Իշխան',type:'ձուկ',group:'fish',image:'sea-trout.jpg'},
    {id:'goldfish',name:'Ոսկե ձկնիկ',type:'ձուկ',group:'fish',image:'sea-goldfish.jpg'}
  ];

  const SEA_PALETTES={
    fish:{accent:'#3da9fc',soft:'rgba(61,169,252,.30)',badge:'linear-gradient(180deg,#65c7ff,#2a86e5)'},
    mammal:{accent:'#7b63ff',soft:'rgba(123,99,255,.28)',badge:'linear-gradient(180deg,#9f8bff,#6b55e4)'},
    reptile:{accent:'#37c98b',soft:'rgba(55,201,139,.28)',badge:'linear-gradient(180deg,#5be2a2,#2ea36d)'},
    crustacean:{accent:'#ff8e48',soft:'rgba(255,142,72,.30)',badge:'linear-gradient(180deg,#ffb36e,#eb7233)'},
    mollusk:{accent:'#d96bff',soft:'rgba(217,107,255,.28)',badge:'linear-gradient(180deg,#ed8fff,#bc56db)'},
    bird:{accent:'#f6aa2d',soft:'rgba(246,170,45,.28)',badge:'linear-gradient(180deg,#ffd069,#de8d1d)'},
    echinoderm:{accent:'#ff72a1',soft:'rgba(255,114,161,.28)',badge:'linear-gradient(180deg,#ff99bc,#e35281)'},
    aquatic:{accent:'#00bfd8',soft:'rgba(0,191,216,.28)',badge:'linear-gradient(180deg,#49d8ea,#00a4bd)'}
  };


  const INSECT_PALETTES = {
    pollinator:{accent:'#f5b23e',soft:'rgba(245,178,62,.30)',badge:'linear-gradient(180deg,#f8b94a,#df8e1a)'},
    beetle:{accent:'#7acb5e',soft:'rgba(122,203,94,.30)',badge:'linear-gradient(180deg,#7ecb60,#4f9637)'},
    crawler:{accent:'#f06b78',soft:'rgba(240,107,120,.28)',badge:'linear-gradient(180deg,#f48692,#d34e5d)'},
    winged:{accent:'#62b9ff',soft:'rgba(98,185,255,.30)',badge:'linear-gradient(180deg,#74c4ff,#2f92e0)'},
    jumper:{accent:'#8f77ff',soft:'rgba(143,119,255,.28)',badge:'linear-gradient(180deg,#a28dff,#6d58dc)'},
    predator:{accent:'#ff9c5f',soft:'rgba(255,156,95,.30)',badge:'linear-gradient(180deg,#ffab71,#e46e2c)'},
    night:{accent:'#7da7ff',soft:'rgba(125,167,255,.28)',badge:'linear-gradient(180deg,#89b0ff,#5479d8)'},
    water:{accent:'#4fcfd2',soft:'rgba(79,207,210,.28)',badge:'linear-gradient(180deg,#67d9dc,#2aa8ad)'}
  };

  const INSECTS = [
    {id:'butterfly',name:'Թիթեռ',type:'փոշոտող',group:'winged',image:'insect-butterfly.png'},
    {id:'bee',name:'Մեղու',type:'փոշոտող',group:'pollinator',image:'insect-bee.png'},
    {id:'ant',name:'Մրջյուն',type:'սողացող',group:'crawler',image:'insect-ant.png'},
    {id:'ladybug',name:'Զատիկ',type:'բզեզ',group:'beetle',image:'insect-ladybug.png'},
    {id:'cricket',name:'Ծղրիդ',type:'ցատկող',group:'jumper',image:'insect-cricket.png'},
    {id:'dragonfly',name:'Ճպուռ',type:'թռչող',group:'winged',image:'insect-dragonfly.png'},
    {id:'praying-mantis',name:'Աղոթող մանտիս',type:'գիշատիչ',group:'predator',image:'insect-praying-mantis.png'},
    {id:'rhinoceros-beetle',name:'Ռնգեղջյուր բզեզ',type:'բզեզ',group:'beetle',image:'insect-rhinoceros-beetle.png'},
    {id:'grasshopper',name:'Մորեխ',type:'ցատկող',group:'jumper',image:'insect-grasshopper.png'},
    {id:'damselfly',name:'Նրբաճպուռ',type:'թռչող',group:'winged',image:'insect-damselfly.png'},
    {id:'wasp',name:'Կրետ',type:'թռչող',group:'winged',image:'insect-wasp.png'},
    {id:'green-beetle',name:'Կանաչ բզեզ',type:'բզեզ',group:'beetle',image:'insect-green-beetle.png'},
    {id:'bumblebee',name:'Իշամեղու',type:'փոշոտող',group:'pollinator',image:'insect-bumblebee.png'},
    {id:'may-beetle',name:'Մայիսյան բզեզ',type:'բզեզ',group:'beetle',image:'insect-may-beetle.png'},
    {id:'stag-beetle',name:'Եղջերաբզեզ',type:'բզեզ',group:'beetle',image:'insect-stag-beetle.png'},
    {id:'water-strider',name:'Ջրաչափ',type:'սահող',group:'water',image:'insect-water-strider.png'},
    {id:'colorado-beetle',name:'Կոլորադյան բզեզ',type:'բզեզ',group:'beetle',image:'insect-colorado-beetle.png'},
    {id:'firefly',name:'Լուսատտիկ',type:'գիշերային',group:'night',image:'insect-firefly.png'},
    {id:'earwig',name:'Ականջամտուկ',type:'սողացող',group:'crawler',image:'insect-earwig.png'},
    {id:'dung-beetle',name:'Թրիքաբզեզ',type:'բզեզ',group:'beetle',image:'insect-dung-beetle.png'},
    {id:'fly',name:'Ճանճ',type:'թռչող',group:'winged',image:'insect-fly.png'},
    {id:'bark-beetle',name:'Կեղևակեր բզեզ',type:'բզեզ',group:'beetle',image:'insect-bark-beetle.png'},
    {id:'louse',name:'Ոջիլ',type:'սողացող',group:'crawler',image:'insect-louse.png'},
    {id:'flower-butterfly',name:'Զարդաթիթեռ',type:'փոշոտող',group:'pollinator',image:'insect-flower-butterfly.png'},
    {id:'cabbage-butterfly',name:'Կաղամբի ճերմակաթիթեռ',type:'փոշոտող',group:'pollinator',image:'insect-cabbage-butterfly.png'},
    {id:'moth',name:'Ցեց',type:'գիշերային',group:'night',image:'insect-moth.png'},
    {id:'aphid',name:'Լվիճ',type:'սողացող',group:'crawler',image:'insect-aphid.png'},
    {id:'mosquito',name:'Մոծակ',type:'թռչող',group:'winged',image:'insect-mosquito.png'},
    {id:'horsefly',name:'Ձիաճանճ',type:'թռչող',group:'winged',image:'insect-horsefly.png'},
    {id:'termite',name:'Տերմիտ',type:'սողացող',group:'crawler',image:'insect-termite.png'},
  ];

  const SECTIONS={
    nature:{
      title:'Բնություն', hero:'hero-nature.jpg', backdrop:'hero-nature.jpg',
      games:[
        {id:'animals',label:'Կենդանիներ',thumb:'nature-game-1.jpg',kind:'animalGallery'},
        {id:'birds',label:'Թռչուններ',thumb:'nature-game-2.jpg',kind:'birdGallery'},
        {id:'sea',label:'Ջրային կենդանիներ',thumb:'nature-game-3.jpg',kind:'seaGallery'},
        {id:'insects',label:'Միջատներ',thumb:'nature-game-4.jpg',kind:'insects'}
      ]
    },
    space:{
      title:'Տիեզերք', hero:'hero-space.jpg', backdrop:'hero-space.jpg',
      games:[
        {id:'planets',label:'Մոլորակներ',thumb:'space-game-1.jpg',kind:'orbits'},
        {id:'stars',label:'Աստղեր',thumb:'space-game-2.jpg',kind:'catch'},
        {id:'rocket',label:'Հրթիռ',thumb:'space-game-3.jpg',kind:'rocket'},
        {id:'constellation',label:'Համաստեղություն',thumb:'space-game-4.jpg',kind:'connect'}
      ]
    },
    mind:{
      title:'Մտքի խաղեր', hero:'hero-mind.jpg', backdrop:'hero-mind.jpg',
      games:[
        {id:'puzzle',label:'Գլուխկոտրուկ',thumb:'mind-game-1.jpg',kind:'sort'},
        {id:'sizes',label:'Մեծ ու փոքր',thumb:'mind-game-2.jpg',kind:'sizes'},
        {id:'pattern',label:'Շարունակի՛ր շարքը',thumb:'mind-game-3.jpg',kind:'pattern'},
        {id:'numbers',label:'Թվեր',thumb:'mind-game-4.jpg',kind:'cups'}
      ]
    },
    create:{
      title:'Ստեղծագործություն', hero:'hero-create.jpg', backdrop:'hero-create.jpg',
      games:[
        {id:'paint',label:'Մատով նկարչություն',thumb:'create-game-1.jpg',kind:'paint'},
        {id:'stickers',label:'Կպչուն պատկերներ',thumb:'create-game-2.jpg',kind:'stickers'},
        {id:'mix',label:'Խառնիր գույները',thumb:'create-game-3.jpg',kind:'mix'},
        {id:'blocks',label:'Կառուցիր աշտարակ',thumb:'create-game-4.jpg',kind:'blocks'}
      ]
    },
    magic:{
      title:'Պարգևների դաշտ', hero:'hero-magic.jpg', backdrop:'hero-magic.jpg',
      games:[
        {id:'connect',label:'Միացրու աստղերը',thumb:'magic-game-1.jpg',kind:'connect'},
        {id:'wand',label:'Կախարդական փայտիկ',thumb:'magic-game-2.jpg',kind:'wand'},
        {id:'potion',label:'Կախարդական ըմպելիք',thumb:'magic-game-3.jpg',kind:'potion'},
        {id:'book',label:'Կենդանի հեքիաթների գիրք',thumb:'magic-game-4.jpg',kind:'book'}
      ]
    }
  };

  function loadJson(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}
  function saveSettings(){localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}
  function saveStars(){localStorage.setItem(STARS_KEY,String(stars))}
  function updateStars(){
    const value=String(stars);
    if(homeStars)homeStars.textContent=value;
    if(starCounter)starCounter.setAttribute('aria-label',`${value} աստղ`);
    sectionStars.textContent=value;
    activityStars.textContent=value;
  }

  /* viewport */
  const safeProbe=document.createElement('div');
  Object.assign(safeProbe.style,{position:'fixed',inset:'0',visibility:'hidden',pointerEvents:'none',paddingTop:'env(safe-area-inset-top,0px)'});
  document.body.appendChild(safeProbe);
  let stableViewportWidth=0, stableViewportHeight=0;
  function syncViewport(){
    const vv=visualViewport;
    const rawW=vv?.width||innerWidth;
    const rawH=Math.max(vv?.height||0,innerHeight||0);
    const orientationChanged=stableViewportWidth&&Math.abs(rawW-stableViewportWidth)>80;
    if(!stableViewportHeight||orientationChanged){stableViewportWidth=rawW;stableViewportHeight=rawH}
    else{stableViewportWidth=rawW;stableViewportHeight=Math.max(stableViewportHeight,rawH)}
    const vw=rawW, vh=stableViewportHeight;
    const standalone=matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;
    const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    let lw=vw,lh=vh,safeTop=parseFloat(getComputedStyle(safeProbe).paddingTop)||0;
    if(standalone&&ios){
      const sw=screen?.width||vw,sh=screen?.height||vh,portrait=vw<=vh;
      lw=portrait?Math.min(sw,sh):Math.max(sw,sh); lh=portrait?Math.max(sw,sh):Math.min(sw,sh);
      if(!Number.isFinite(lw)||Math.abs(lw-vw)>120)lw=vw;
      if(!Number.isFinite(lh)||lh<vh)lh=Math.max(vh,innerHeight||0);
      safeTop=Math.max(safeTop,Math.max(sw,sh)>=852?59:Math.max(sw,sh)>=812?47:20);root.classList.add('ios-standalone');
    }else root.classList.remove('ios-standalone');
    const scale=Math.min(lw/DESIGN_W,lh/DESIGN_H);
    root.style.setProperty('--app-h',`${lh}px`);root.style.setProperty('--stage-scale',String(scale));
    root.style.setProperty('--stage-x',`${lw/2}px`);root.style.setProperty('--stage-y',`${lh/2}px`);
    if(standalone&&ios){
      root.style.setProperty('--avatar-safe-y',`${Math.max(0,(safeTop+2)/scale-58)}px`);
      root.style.setProperty('--top-controls-safe-y',`${Math.max(0,(safeTop+8)/scale-34)}px`);
    }else{root.style.setProperty('--avatar-safe-y','0px');root.style.setProperty('--top-controls-safe-y','0px')}
  }
  syncViewport();[100,500,1200].forEach(ms=>setTimeout(syncViewport,ms));
  addEventListener('resize',syncViewport,{passive:true});visualViewport?.addEventListener('resize',syncViewport,{passive:true});

  document.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('dragstart',e=>e.preventDefault());
  document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
  document.addEventListener('touchmove',e=>{
    if(!e.target.closest('.settings-panel,.avatar-panel,#cropPreview,.activity-content,.magic-collection-grid,input[type="range"],canvas'))e.preventDefault();
  },{passive:false});

  /* audio/settings */
  menuMusic.volume=.24;let audioUnlocked=false;
  async function ensureAudio(){if(!settings.master||!settings.music)return;try{await menuMusic.play();audioUnlocked=true}catch{}}
  function applyAudio(){if(settings.master&&settings.music)ensureAudio();else menuMusic.pause()}
  ['pointerdown','touchend'].forEach(t=>document.addEventListener(t,()=>{if(!audioUnlocked)ensureAudio()},{once:true,passive:true}));
  document.addEventListener('visibilitychange',()=>document.hidden?menuMusic.pause():applyAudio());applyAudio();
  // Theme selector restored from the stable menu version.
  const themeGrid=$('#themeGrid');
  if(themeGrid){
    themes.forEach(([id,label])=>{
      const b=document.createElement('button');
      b.className='theme-option'; b.dataset.theme=id; b.setAttribute('aria-label',`Թեմա՝ ${label}`);
      b.innerHTML=`<img src="${id}.svg?v=89" alt="" aria-hidden="true" draggable="false"><span>${label}</span>`;
      b.addEventListener('click',()=>{settings.theme=id;saveSettings();applyTheme()});
      themeGrid.appendChild(b);
    });
  }
  const fontGrid=$('#fontGrid');
  if(fontGrid){
    fontPresets.forEach(([id,label,sample])=>{
      const b=document.createElement('button');
      b.type='button';
      b.className='font-option';
      b.dataset.font=id;
      b.setAttribute('aria-label',`Տառաձև՝ ${label}`);
      b.innerHTML=`<span class="font-option-title">${label}</span><span class="font-option-sample">${sample}</span>`;
      b.addEventListener('click',()=>{settings.font=id;saveSettings();applyFont()});
      fontGrid.appendChild(b);
    });
  }
  function applyFont(){
    const allowed=new Set(fontPresets.map(([id])=>id));
    const id=allowed.has(settings.font)?settings.font:'rounded';
    settings.font=id;
    root.dataset.font=id;
    $$('.font-option').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.font===id)));
  }
  applyFont();

  function applyTheme(){
    root.dataset.theme=settings.theme||'day';
    $$('.theme-option').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===root.dataset.theme)));
    const meta=$('meta[name="theme-color"]'),css=getComputedStyle(root),top=css.getPropertyValue('--bg-1').trim(),bottom=css.getPropertyValue('--bg-3').trim();
    const standalone=window.matchMedia?.('(display-mode: standalone)')?.matches||window.navigator.standalone===true;
    const isiOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    if(meta)meta.setAttribute('content',standalone&&isiOS&&bottom?bottom:top);
  }
  applyTheme();
  const toggles={master:$('#masterSound'),music:$('#musicSound'),voice:$('#voiceHints'),effects:$('#gameEffects')};
  function syncSettings(){Object.entries(toggles).forEach(([k,e])=>e.checked=!!settings[k])}
  syncSettings();Object.entries(toggles).forEach(([k,e])=>e.addEventListener('change',()=>{settings[k]=e.checked;saveSettings();applyAudio();root.classList.toggle('effects-off',!settings.effects)}));
  $('#settingsButton').addEventListener('click',()=>{syncSettings();applyFont();settingsModal.hidden=false});
  $$('[data-close="settings"]').forEach(e=>e.addEventListener('click',()=>settingsModal.hidden=true));
  $('#starCounter').addEventListener('click',()=>showToast(`⭐ ${stars}`));

  /* section navigation */
  $$('.section-card').forEach(card=>card.addEventListener('click',()=>openSection(card.dataset.section)));
  $('#sectionBack').addEventListener('click',closeSection);
  $('#activityBack').addEventListener('click',backToSection);

  function openSection(id){
    currentSection=id;const s=SECTIONS[id];if(!s)return;
    sectionScreen.dataset.section=id;sectionTitle.textContent=s.title;sectionHero.src=s.hero;sectionBackdrop.src=s.backdrop;
    updateStars();sectionGames.innerHTML='';
    sectionGames.classList.remove('magic-collection-grid');
    sectionScreen.classList.toggle('magic-collection-mode',id==='magic');
    document.body.classList.toggle('magic-scroll-active',id==='magic');

    if(id==='magic'){
      renderMagicCollection();
    }else{
      s.games.forEach(g=>{
        const b=document.createElement('button');b.className='toddler-game-card';b.setAttribute('aria-label',g.label);
        b.innerHTML=`<img src="${g.thumb}" alt="" draggable="false"><span class="section-card-sheen game-card-sheen" aria-hidden="true"></span><span class="toddler-game-label">${g.label}</span>`;
        b.addEventListener('click',()=>openGame(s,g));sectionGames.appendChild(b);
      });
    }
    homeScreen.style.visibility='hidden';sectionScreen.hidden=false;requestAnimationFrame(()=>sectionScreen.classList.add('is-visible'));
  }

  function saveMagicUnlocked(){
    localStorage.setItem(MAGIC_UNLOCK_KEY,JSON.stringify([...magicUnlocked]));
  }

  function renderMagicCollection(){
    sectionGames.classList.add('magic-collection-grid');
    sectionGames.innerHTML='';
    MAGIC_ITEMS.forEach((item,index)=>{
      const unlocked=magicUnlocked.has(item.id);
      const eligible=stars>=item.cost;
      const b=document.createElement('button');
      b.className='magic-collect-card'+(unlocked?' is-unlocked':' is-locked')+(eligible&&!unlocked?' can-unlock':'');
      b.dataset.id=item.id;
      b.dataset.motion=item.motion;
      b.setAttribute('aria-label',`${item.name}, ${item.cost} աստղ`);
      b.innerHTML=`
        <span class="magic-picture-wrap">
          <span class="magic-picture" aria-hidden="true">${item.icon}</span>
          <span class="magic-aura" aria-hidden="true"></span>
          <span class="magic-sparkle magic-sparkle--1" aria-hidden="true">✦</span>
          <span class="magic-sparkle magic-sparkle--2" aria-hidden="true">✦</span>
          <span class="magic-sparkle magic-sparkle--3" aria-hidden="true">✦</span>
        </span>
        <span class="section-card-sheen magic-card-sheen" aria-hidden="true"></span>
        <span class="magic-cost">⭐ ${item.cost}</span>
        <span class="magic-lock" aria-hidden="true">${unlocked?'':'🔒'}</span>
      `;
      b.addEventListener('click',()=>handleMagicItemTap(b,item));
      sectionGames.appendChild(b);
    });
  }

  function handleMagicItemTap(card,item){
    if(!magicUnlocked.has(item.id)){
      if(stars<item.cost){
        card.classList.remove('need-stars');
        void card.offsetWidth;
        card.classList.add('need-stars');
        showToast(`⭐ ${item.cost}`);
        return;
      }
      magicUnlocked.add(item.id);
      saveMagicUnlocked();
      card.classList.remove('is-locked','can-unlock');
      card.classList.add('is-unlocked','just-unlocked');
      const lock=$('.magic-lock',card);if(lock)lock.textContent='';
      setTimeout(()=>card.classList.remove('just-unlocked'),900);
      animateMagicItem(card,item.motion);
      return;
    }
    animateMagicItem(card,item.motion);
  }

  function animateMagicItem(card,motion){
    const pic=$('.magic-picture',card);
    if(!pic)return;
    const className=`magic-motion-${motion}`;
    pic.classList.remove(
      'magic-motion-drive','magic-motion-driveFast','magic-motion-driveHeavy','magic-motion-siren','magic-motion-train',
      'magic-motion-fly','magic-motion-flySpin','magic-motion-pounce','magic-motion-bounce','magic-motion-hop',
      'magic-motion-roar','magic-motion-stomp','magic-motion-sway','magic-motion-gallop','magic-motion-swing',
      'magic-motion-flutter','magic-motion-soar','magic-motion-waddle','magic-motion-glide','magic-motion-buzz',
      'magic-motion-crawl','magic-motion-crawlSlow','magic-motion-swimJump','magic-motion-swim','magic-motion-swimHeavy',
      'magic-motion-wiggle','magic-motion-crab','magic-motion-launch','magic-motion-twinkle','magic-motion-glow',
      'magic-motion-rainbow','magic-motion-prance'
    );
    void pic.offsetWidth;
    pic.classList.add(className);
    card.classList.remove('magic-active');void card.offsetWidth;card.classList.add('magic-active');
    setTimeout(()=>{pic.classList.remove(className);card.classList.remove('magic-active')},1900);
  }

  function closeSection(){
    document.body.classList.remove('magic-scroll-active');
    sectionScreen.classList.remove('is-visible');
    setTimeout(()=>{sectionScreen.hidden=true;homeScreen.style.visibility='visible'},180)
  }
  function openGame(section,game){
    cleanupGame();currentGame=game;activitySectionTitle.textContent=section.title;activityTitle.textContent=game.label;updateStars();
    sectionScreen.classList.remove('is-visible');setTimeout(()=>{sectionScreen.hidden=true;activityScreen.hidden=false;requestAnimationFrame(()=>activityScreen.classList.add('is-visible'));renderGame(game)},150);
  }
  function backToSection(){cleanupGame();activityScreen.classList.remove('is-visible');setTimeout(()=>{activityScreen.hidden=true;sectionScreen.hidden=false;requestAnimationFrame(()=>sectionScreen.classList.add('is-visible'))},160)}
  function cleanupGame(){gameCleanup.splice(0).forEach(fn=>{try{fn()}catch{}});activityContent.classList.remove('animal-gallery-mode');activityContent.innerHTML=''}
  function renderGame(g){
    const map={animalGallery:gameAnimalGallery,birdGallery:gameBirdGallery,seaGallery:gameSeaGallery,insects:gameInsectGallery,shadow:gameShadow,feed:gameFeed,hatch:gameHatch,garden:gameGarden,rocket:gameRocket,orbits:gameOrbits,catch:gameCatch,landing:gameLanding,sort:gameSort,sizes:gameSizes,pattern:gamePattern,cups:gameCups,paint:gamePaint,stickers:gameStickers,mix:gameMix,blocks:gameBlocks,connect:gameConnect,wand:gameWand,potion:gamePotion,book:gameBook};
    (map[g.kind]||gameShadow)();
  }

  function surface(hint='👆'){activityContent.innerHTML='<div class="game-surface"></div>';const s=$('.game-surface',activityContent);if(hint){const h=document.createElement('div');h.className='game-hint';h.textContent=hint;s.appendChild(h);const hide=()=>h.classList.add('hide');s.addEventListener('pointerdown',hide,{once:true});}return s}
  function reward(n=2){stars+=n;saveStars();updateStars();celebrate()}
  function celebrate(){
    const o=document.createElement('div');o.className='big-celebrate';o.innerHTML='<div>🌟</div>';activityContent.appendChild(o);
    for(let i=0;i<18;i++){const c=document.createElement('span');c.className='confetti-piece';c.textContent=['⭐','✨','●'][i%3];c.style.left=`${5+Math.random()*90}%`;c.style.top=`${-10-Math.random()*25}px`;c.style.animationDelay=`${Math.random()*.25}s`;o.appendChild(c)}
    setTimeout(()=>o.remove(),1000);
  }
  function completeOnce(el,n=2){if(el.dataset.done)return;el.dataset.done='1';reward(n)}
  function shake(el){el.animate([{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(0)'}],{duration:260})}
  function rectOverlap(a,b){const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return A.left<B.right&&A.right>B.left&&A.top<B.bottom&&A.bottom>B.top}
  function makeDrag(el,{onMove,onDrop,container=activityContent}={}){
    let sx=0,sy=0,ox=0,oy=0,drag=false;
    const down=e=>{drag=true;el.classList.add('dragging');el.setPointerCapture?.(e.pointerId);sx=e.clientX;sy=e.clientY;ox=parseFloat(el.style.left)||el.offsetLeft;oy=parseFloat(el.style.top)||el.offsetTop;e.preventDefault()};
    const move=e=>{if(!drag)return;const cr=container.getBoundingClientRect(),x=Math.max(0,Math.min(cr.width-el.offsetWidth,ox+e.clientX-sx)),y=Math.max(0,Math.min(cr.height-el.offsetHeight,oy+e.clientY-sy));el.style.left=x+'px';el.style.top=y+'px';onMove?.(el,e)};
    const up=e=>{if(!drag)return;drag=false;el.classList.remove('dragging');onDrop?.(el,e)};
    el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
    gameCleanup.push(()=>{el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)});
  }

  /* NATURE */
  let animalAudioWarmStarted=false;
  function warmAnimalAudioCache(){
    if(animalAudioWarmStarted||!navigator.onLine)return;
    animalAudioWarmStarted=true;
    const urls=[];
    Object.values(ANIMAL_AUDIO).forEach(a=>{if(a.voice)urls.push(a.voice);if(a.sound)urls.push(a.sound)});
    let cursor=0;
    const worker=async()=>{
      while(cursor<urls.length){
        const url=urls[cursor++];
        try{await fetch(url,{mode:'no-cors',cache:'force-cache'})}catch{}
      }
    };
    Promise.all([worker(),worker(),worker(),worker()]).catch(()=>{});
  }

  let animalPlaybackToken=0;
  let animalVoicePlayer=null;
  let animalSoundPlayer=null;
  let activeAnimalCard=null;

  function stopAnimalPlayback({restoreMusic=true}={}){
    animalPlaybackToken++;
    [animalVoicePlayer,animalSoundPlayer].forEach(a=>{
      if(!a)return;
      try{a.pause();a.currentTime=0}catch{}
    });
    animalVoicePlayer=null;
    animalSoundPlayer=null;
    if(activeAnimalCard){
      activeAnimalCard.classList.remove('animal-card--pressing','animal-card--focus','animal-card--speaking');
      activeAnimalCard=null;
    }
    if(restoreMusic&&settings.master&&settings.music)applyAudio();
  }

  function playAnimalClip(src,kind,token){
    return new Promise(resolve=>{
      if(!src||token!==animalPlaybackToken){resolve(false);return}
      const audio=new Audio();
      audio.preload='auto';
      audio.playsInline=true;
      audio.src=src;
      audio.volume=kind==='voice'?1:.50; // V58: balance quieter narration against hotter animal SFX (~-6 dB)
      if(kind==='voice')animalVoicePlayer=audio;else animalSoundPlayer=audio;
      let settled=false;
      const finish=(ok)=>{
        if(settled)return;
        settled=true;
        clearTimeout(timer);
        audio.onended=audio.onerror=audio.onabort=null;
        resolve(ok);
      };
      audio.onended=()=>finish(true);
      audio.onerror=()=>finish(false);
      audio.onabort=()=>finish(false);
      const timer=setTimeout(()=>finish(false),kind==='voice'?7000:5200);
      const p=audio.play();
      if(p&&p.catch)p.catch(()=>finish(false));
    });
  }

  function speakAnimalFallback(animal){
    if(!settings.master||!settings.voice||!('speechSynthesis' in window))return Promise.resolve(false);
    return new Promise(resolve=>{
      try{
        speechSynthesis.cancel();
        const utter=new SpeechSynthesisUtterance(`${animal.name}՝ ${animal.type==='ընտանի'?'ընտանի':'վայրի'} կենդանի է։`);
        utter.lang='hy-AM';
        utter.rate=.9;
        utter.pitch=1.02;
        utter.volume=.96;
        utter.onend=()=>resolve(true);
        utter.onerror=()=>resolve(false);
        speechSynthesis.speak(utter);
        setTimeout(()=>resolve(false),6500);
      }catch{resolve(false)}
    });
  }

  async function playAnimalSequence(animal,card){
    stopAnimalPlayback({restoreMusic:false});
    const token=++animalPlaybackToken;
    const audio=ANIMAL_AUDIO[animal.id]||{};
    activeAnimalCard=card;
    card.classList.remove('animal-card--pressing');
    card.classList.add('animal-card--focus','animal-card--speaking');

    const musicWasPlaying=!menuMusic.paused;
    if(musicWasPlaying)menuMusic.pause();

    if(!settings.master){
      await new Promise(r=>setTimeout(r,1050));
    }else{
      if(settings.voice){
        const ok=await playAnimalClip(audio.voice,'voice',token);
        if(token!==animalPlaybackToken)return;
        if(!ok)await speakAnimalFallback(animal);
      }
      if(token!==animalPlaybackToken)return;
      if(settings.voice&&settings.effects)await new Promise(r=>setTimeout(r,120));
      if(settings.effects)await playAnimalClip(audio.sound,'sound',token);
    }

    if(token!==animalPlaybackToken)return;
    await new Promise(r=>setTimeout(r,180));
    if(token!==animalPlaybackToken)return;
    card.classList.remove('animal-card--speaking','animal-card--focus');
    activeAnimalCard=null;
    animalVoicePlayer=null;
    animalSoundPlayer=null;
    if(musicWasPlaying&&settings.master&&settings.music)ensureAudio();
  }

  function galleryNameSize(name){
    const n=Array.from(String(name||'').replace(/\s+/g,'')).length;
    if(n>=22)return '11.5px';
    if(n>=18)return '12.5px';
    if(n>=15)return '13.6px';
    if(n>=12)return '14.8px';
    return '16.5px';
  }

  function hardCenterGalleryCard(card){
    const meta=card.querySelector('.animal-meta');
    const name=card.querySelector('.animal-name');
    const type=card.querySelector('.animal-type');
    if(meta){
      meta.style.setProperty('position','absolute','important');
    }
    if(name){
      name.style.setProperty('position','absolute','important');
      name.style.setProperty('top','6px','important');
      name.style.setProperty('left','0','important');
      name.style.setProperty('right','0','important');
      name.style.setProperty('bottom','38px','important');
      name.style.setProperty('width','auto','important');
      name.style.setProperty('max-width','none','important');
      name.style.setProperty('margin','0','important');
      name.style.setProperty('padding','0 8px','important');
      name.style.setProperty('box-sizing','border-box','important');
      name.style.setProperty('display','flex','important');
      name.style.setProperty('align-items','center','important');
      name.style.setProperty('justify-content','center','important');
      name.style.setProperty('text-align','center','important');
      name.style.setProperty('text-indent','0','important');
      name.style.setProperty('transform','none','important');
    }
    if(type){
      type.style.setProperty('position','absolute','important');
      type.style.setProperty('left','50%','important');
      type.style.setProperty('right','auto','important');
      type.style.setProperty('bottom','8px','important');
      type.style.setProperty('top','auto','important');
      type.style.setProperty('margin','0','important');
      type.style.setProperty('transform','translateX(-50%)','important');
    }
  }

  function gameAnimalGallery(){
    warmAnimalAudioCache();
    activityContent.innerHTML='';
    activityContent.classList.add('animal-gallery-mode');

    const wrap=document.createElement('div');
    wrap.className='animal-gallery';
    wrap.setAttribute('aria-label','Կենդանիների պատկերասրահ');

    ANIMALS.forEach(animal=>{
      const card=document.createElement('button');
      card.type='button';
      card.className='animal-card';
      card.dataset.animal=animal.id;
      card.dataset.animalType=animal.type;
      const domestic=animal.type==='ընտանի';
      card.style.setProperty('--animal-accent',domestic?'#59c95f':'#ef5a5a');
      card.style.setProperty('--animal-accent-soft',domestic?'rgba(89,201,95,.34)':'rgba(239,90,90,.34)');
      card.style.setProperty('--animal-name-size',galleryNameSize(animal.name));
      card.setAttribute('aria-label',`${animal.name}, ${animal.type} կենդանի`);
      card.innerHTML=`
        <span class="animal-image-wrap">
          <img src="${animal.image}?v=89" alt="${animal.name}" draggable="false">
          <span class="animal-card-sheen" aria-hidden="true"></span>
        </span>
        <span class="animal-meta">
          <strong class="animal-name">${animal.name}</strong>
          <small class="animal-type animal-type--${animal.type==='ընտանի'?'domestic':'wild'}">${animal.type}</small>
        </span>`;
      hardCenterGalleryCard(card);

      let downX=0,downY=0,downPointer=null,moved=false;
      card.addEventListener('pointerdown',e=>{
        if(e.pointerType==='mouse'&&e.button!==0)return;
        downPointer=e.pointerId;
        downX=e.clientX;downY=e.clientY;moved=false;
        card.classList.add('animal-card--pressing');
      });
      card.addEventListener('pointermove',e=>{
        if(e.pointerId!==downPointer)return;
        if(Math.hypot(e.clientX-downX,e.clientY-downY)>12){
          moved=true;
          card.classList.remove('animal-card--pressing');
        }
      });
      card.addEventListener('pointerup',e=>{
        if(e.pointerId!==downPointer)return;
        card.classList.remove('animal-card--pressing');
        const shouldPlay=!moved;
        downPointer=null;
        if(shouldPlay)playAnimalSequence(animal,card);
      });
      card.addEventListener('pointercancel',()=>{
        downPointer=null;moved=true;card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('pointerleave',()=>{
        if(downPointer!==null)card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('click',e=>{
        if(e.detail===0)playAnimalSequence(animal,card);
      });

      wrap.appendChild(card);
    });

    activityContent.appendChild(wrap);

    const syncAnimalFocusScale=()=>{
      const gap=parseFloat(getComputedStyle(wrap).columnGap)||10;
      $$('.animal-card',wrap).forEach(card=>{
        const width=card.offsetWidth||1;
        const sideGrow=gap*.86;
        const scale=Math.min(1.105,1+(sideGrow*2/width));
        card.style.setProperty('--animal-focus-scale',scale.toFixed(4));
        card.style.setProperty('--animal-press-scale',Math.min(1.035,1+(sideGrow*.62/width)).toFixed(4));
      });
    };
    requestAnimationFrame(syncAnimalFocusScale);
    addEventListener('resize',syncAnimalFocusScale,{passive:true});

    gameCleanup.push(()=>{
      removeEventListener('resize',syncAnimalFocusScale);

      stopAnimalPlayback({restoreMusic:true});
      try{speechSynthesis?.cancel()}catch{}
      activityContent.classList.remove('animal-gallery-mode');
    });
  }


  let birdAudioWarmStarted=false;
  function warmBirdAudioCache(){
    if(birdAudioWarmStarted||!navigator.onLine)return;
    birdAudioWarmStarted=true;
    const urls=[];
    Object.values(BIRD_AUDIO).forEach(a=>{if(a.voice)urls.push(a.voice);if(a.sound)urls.push(a.sound)});
    let cursor=0;
    const worker=async()=>{
      while(cursor<urls.length){
        const url=urls[cursor++];
        try{await fetch(url,{mode:'no-cors',cache:'force-cache'})}catch{}
      }
    };
    Promise.all([worker(),worker(),worker(),worker()]).catch(()=>{});
  }

  let birdPlaybackToken=0;
  let birdVoicePlayer=null;
  let birdSoundPlayer=null;
  let activeBirdCard=null;

  function stopBirdPlayback({restoreMusic=true}={}){
    birdPlaybackToken++;
    [birdVoicePlayer,birdSoundPlayer].forEach(a=>{
      if(!a)return;
      try{a.pause();a.currentTime=0}catch{}
    });
    birdVoicePlayer=null;
    birdSoundPlayer=null;
    if(activeBirdCard){
      activeBirdCard.classList.remove('animal-card--pressing','animal-card--focus','animal-card--speaking');
      activeBirdCard=null;
    }
    if(restoreMusic&&settings.master&&settings.music)applyAudio();
  }

  function playBirdClip(src,kind,token){
    return new Promise(resolve=>{
      if(!src||token!==birdPlaybackToken){resolve(false);return}
      const audio=new Audio();
      audio.preload='auto';
      audio.playsInline=true;
      audio.src=src;
      audio.volume=kind==='voice'?1:.50;
      if(kind==='voice')birdVoicePlayer=audio;else birdSoundPlayer=audio;
      let settled=false;
      const finish=(ok)=>{
        if(settled)return;
        settled=true;
        clearTimeout(timer);
        audio.onended=audio.onerror=audio.onabort=null;
        resolve(ok);
      };
      audio.onended=()=>finish(true);
      audio.onerror=()=>finish(false);
      audio.onabort=()=>finish(false);
      const timer=setTimeout(()=>finish(false),kind==='voice'?7000:4800);
      const p=audio.play();
      if(p&&p.catch)p.catch(()=>finish(false));
    });
  }

  function speakBirdFallback(bird){
    if(!settings.master||!settings.voice||!('speechSynthesis' in window))return Promise.resolve(false);
    return new Promise(resolve=>{
      try{
        speechSynthesis.cancel();
        const utter=new SpeechSynthesisUtterance(`${bird.name}՝ ${bird.type==='ընտանի'?'ընտանի':'վայրի'} թռչուն է։`);
        utter.lang='hy-AM';
        utter.rate=.88;
        utter.pitch=1.02;
        utter.volume=.96;
        utter.onend=()=>resolve(true);
        utter.onerror=()=>resolve(false);
        speechSynthesis.speak(utter);
        setTimeout(()=>resolve(false),6500);
      }catch{resolve(false)}
    });
  }

  async function playBirdSequence(bird,card){
    stopBirdPlayback({restoreMusic:false});
    const token=++birdPlaybackToken;
    const audio=BIRD_AUDIO[bird.id]||{};
    activeBirdCard=card;
    card.classList.remove('animal-card--pressing');
    card.classList.add('animal-card--focus','animal-card--speaking');

    const musicWasPlaying=!menuMusic.paused;
    if(musicWasPlaying)menuMusic.pause();

    if(!settings.master){
      await new Promise(r=>setTimeout(r,1050));
    }else{
      if(settings.voice){
        const ok=await playBirdClip(audio.voice,'voice',token);
        if(token!==birdPlaybackToken)return;
        if(!ok)await speakBirdFallback(bird);
      }
      if(token!==birdPlaybackToken)return;
      if(settings.voice&&settings.effects)await new Promise(r=>setTimeout(r,120));
      if(settings.effects)await playBirdClip(audio.sound,'sound',token);
    }

    if(token!==birdPlaybackToken)return;
    await new Promise(r=>setTimeout(r,180));
    if(token!==birdPlaybackToken)return;
    card.classList.remove('animal-card--speaking','animal-card--focus');
    activeBirdCard=null;
    birdVoicePlayer=null;
    birdSoundPlayer=null;
    if(musicWasPlaying&&settings.master&&settings.music)ensureAudio();
  }

  function gameBirdGallery(){
    warmBirdAudioCache();
    activityContent.innerHTML='';
    activityContent.classList.add('animal-gallery-mode');

    const wrap=document.createElement('div');
    wrap.className='animal-gallery';
    wrap.setAttribute('aria-label','Թռչունների պատկերասրահ');

    BIRDS.forEach(bird=>{
      const card=document.createElement('button');
      card.type='button';
      card.className='animal-card animal-card--bird';
      card.dataset.bird=bird.id;
      card.dataset.birdType=bird.type;
      const domestic=bird.type==='ընտանի';
      card.style.setProperty('--animal-accent',domestic?'#59c95f':'#ef5a5a');
      card.style.setProperty('--animal-accent-soft',domestic?'rgba(89,201,95,.34)':'rgba(239,90,90,.34)');
      card.style.setProperty('--animal-name-size',galleryNameSize(bird.name));
      card.setAttribute('aria-label',`${bird.name}, ${bird.type} թռչուն`);
      card.innerHTML=`
        <span class="animal-image-wrap">
          <img src="${bird.image}?v=89" alt="${bird.name}" draggable="false">
          <span class="animal-card-sheen" aria-hidden="true"></span>
        </span>
        <span class="animal-meta">
          <strong class="animal-name">${bird.name}</strong>
          <small class="animal-type animal-type--${bird.type==='ընտանի'?'domestic':'wild'}">${bird.type}</small>
        </span>`;
      hardCenterGalleryCard(card);

      let downX=0,downY=0,downPointer=null,moved=false;
      card.addEventListener('pointerdown',e=>{
        if(e.pointerType==='mouse'&&e.button!==0)return;
        downPointer=e.pointerId;
        downX=e.clientX;downY=e.clientY;moved=false;
        card.classList.add('animal-card--pressing');
      });
      card.addEventListener('pointermove',e=>{
        if(e.pointerId!==downPointer)return;
        if(Math.hypot(e.clientX-downX,e.clientY-downY)>12){
          moved=true;
          card.classList.remove('animal-card--pressing');
        }
      });
      card.addEventListener('pointerup',e=>{
        if(e.pointerId!==downPointer)return;
        card.classList.remove('animal-card--pressing');
        const shouldPlay=!moved;
        downPointer=null;
        if(shouldPlay)playBirdSequence(bird,card);
      });
      card.addEventListener('pointercancel',()=>{
        downPointer=null;moved=true;card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('pointerleave',()=>{
        if(downPointer!==null)card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('click',e=>{
        if(e.detail===0)playBirdSequence(bird,card);
      });

      wrap.appendChild(card);
    });

    activityContent.appendChild(wrap);

    const syncBirdFocusScale=()=>{
      const gap=parseFloat(getComputedStyle(wrap).columnGap)||10;
      $$('.animal-card',wrap).forEach(card=>{
        const width=card.offsetWidth||1;
        const sideGrow=gap*.86;
        const scale=Math.min(1.105,1+(sideGrow*2/width));
        card.style.setProperty('--animal-focus-scale',scale.toFixed(4));
        card.style.setProperty('--animal-press-scale',Math.min(1.035,1+(sideGrow*.62/width)).toFixed(4));
      });
    };
    requestAnimationFrame(syncBirdFocusScale);
    addEventListener('resize',syncBirdFocusScale,{passive:true});

    gameCleanup.push(()=>{
      removeEventListener('resize',syncBirdFocusScale);
      stopBirdPlayback({restoreMusic:true});
      try{speechSynthesis?.cancel()}catch{}
      activityContent.classList.remove('animal-gallery-mode');
    });
  }

  let seaPlaybackToken=0;
  let activeSeaCard=null;

  function stopSeaPlayback({restoreMusic=true}={}){
    seaPlaybackToken++;
    try{speechSynthesis?.cancel()}catch{}
    if(activeSeaCard){
      activeSeaCard.classList.remove('animal-card--pressing','animal-card--focus','animal-card--speaking');
      activeSeaCard=null;
    }
    if(restoreMusic&&settings.master&&settings.music)applyAudio();
  }

  function speakSeaCreature(creature,token){
    if(!settings.master||!settings.voice||!('speechSynthesis' in window))return Promise.resolve(false);
    return new Promise(resolve=>{
      try{
        speechSynthesis.cancel();
        if(token!==seaPlaybackToken){resolve(false);return;}
        const utter=new SpeechSynthesisUtterance(`${creature.name}՝ ${creature.type} ջրային կենդանի է։`);
        utter.lang='hy-AM';
        utter.rate=.9;
        utter.pitch=1.03;
        utter.volume=.98;
        let settled=false;
        const finish=(ok)=>{
          if(settled)return;
          settled=true;
          clearTimeout(timer);
          utter.onend=utter.onerror=null;
          resolve(ok);
        };
        utter.onend=()=>finish(true);
        utter.onerror=()=>finish(false);
        const timer=setTimeout(()=>finish(false),5600);
        speechSynthesis.speak(utter);
      }catch{resolve(false)}
    });
  }

  async function playSeaSequence(creature,card){
    stopSeaPlayback({restoreMusic:false});
    const token=++seaPlaybackToken;
    activeSeaCard=card;
    card.classList.remove('animal-card--pressing');
    card.classList.add('animal-card--focus','animal-card--speaking');

    const musicWasPlaying=!menuMusic.paused;
    if(musicWasPlaying)menuMusic.pause();

    if(settings.master&&settings.voice){
      await speakSeaCreature(creature,token);
    }else{
      await new Promise(r=>setTimeout(r,1050));
    }

    if(token!==seaPlaybackToken)return;
    await new Promise(r=>setTimeout(r,180));
    if(token!==seaPlaybackToken)return;
    card.classList.remove('animal-card--speaking','animal-card--focus');
    activeSeaCard=null;
    if(musicWasPlaying&&settings.master&&settings.music)ensureAudio();
  }

  function gameSeaGallery(){
    activityContent.innerHTML='';
    activityContent.classList.add('animal-gallery-mode');

    const wrap=document.createElement('div');
    wrap.className='animal-gallery animal-gallery--sea';
    wrap.setAttribute('aria-label','Ջրային կենդանիների պատկերասրահ');

    SEA_CREATURES.forEach(creature=>{
      const palette=SEA_PALETTES[creature.group]||SEA_PALETTES.aquatic;
      const card=document.createElement('button');
      card.type='button';
      card.className='animal-card animal-card--sea';
      card.dataset.seaCreature=creature.id;
      card.style.setProperty('--animal-accent',palette.accent);
      card.style.setProperty('--animal-accent-soft',palette.soft);
      card.style.setProperty('--animal-name-size',galleryNameSize(creature.name));
      card.setAttribute('aria-label',`${creature.name}, ${creature.type} ջրային կենդանի`);
      card.innerHTML=`
        <span class="animal-image-wrap">
          <img src="${creature.image}?v=89" alt="${creature.name}" draggable="false">
          <span class="animal-card-sheen" aria-hidden="true"></span>
        </span>
        <span class="animal-meta animal-meta--sea">
          <strong class="animal-name">${creature.name}</strong>
          <small class="animal-type animal-type--sea" style="background:${palette.badge}">${creature.type}</small>
        </span>`;
      hardCenterGalleryCard(card);

      let downX=0,downY=0,downPointer=null,moved=false;
      card.addEventListener('pointerdown',e=>{
        if(e.pointerType==='mouse'&&e.button!==0)return;
        downPointer=e.pointerId;
        downX=e.clientX;downY=e.clientY;moved=false;
        card.classList.add('animal-card--pressing');
      });
      card.addEventListener('pointermove',e=>{
        if(e.pointerId!==downPointer)return;
        if(Math.hypot(e.clientX-downX,e.clientY-downY)>12){
          moved=true;
          card.classList.remove('animal-card--pressing');
        }
      });
      card.addEventListener('pointerup',e=>{
        if(e.pointerId!==downPointer)return;
        card.classList.remove('animal-card--pressing');
        const shouldPlay=!moved;
        downPointer=null;
        if(shouldPlay)playSeaSequence(creature,card);
      });
      card.addEventListener('pointercancel',()=>{
        downPointer=null;moved=true;card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('pointerleave',()=>{
        if(downPointer!==null)card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('click',e=>{
        if(e.detail===0)playSeaSequence(creature,card);
      });

      wrap.appendChild(card);
    });

    activityContent.appendChild(wrap);

    const syncSeaFocusScale=()=>{
      const gap=parseFloat(getComputedStyle(wrap).columnGap)||10;
      $$('.animal-card',wrap).forEach(card=>{
        const width=card.offsetWidth||1;
        const sideGrow=gap*.86;
        const scale=Math.min(1.105,1+(sideGrow*2/width));
        card.style.setProperty('--animal-focus-scale',scale.toFixed(4));
        card.style.setProperty('--animal-press-scale',Math.min(1.035,1+(sideGrow*.62/width)).toFixed(4));
      });
    };
    requestAnimationFrame(syncSeaFocusScale);
    addEventListener('resize',syncSeaFocusScale,{passive:true});

    gameCleanup.push(()=>{
      removeEventListener('resize',syncSeaFocusScale);
      stopSeaPlayback({restoreMusic:true});
      try{speechSynthesis?.cancel()}catch{}
      activityContent.classList.remove('animal-gallery-mode');
    });
  }


  let insectPlaybackToken=0;
  let activeInsectCard=null;

  function stopInsectPlayback({restoreMusic=true}={}){
    insectPlaybackToken++;
    try{speechSynthesis?.cancel()}catch{}
    if(activeInsectCard){
      activeInsectCard.classList.remove('animal-card--pressing','animal-card--focus','animal-card--speaking');
      activeInsectCard=null;
    }
    if(restoreMusic&&settings.master&&settings.music)applyAudio();
  }

  function speakInsect(insect,token){
    if(!settings.master||!settings.voice||!('speechSynthesis' in window))return Promise.resolve(false);
    return new Promise(resolve=>{
      try{
        speechSynthesis.cancel();
        if(token!==insectPlaybackToken){resolve(false);return;}
        const utter=new SpeechSynthesisUtterance(`${insect.name}՝ ${insect.type} միջատ է։`);
        utter.lang='hy-AM';
        utter.rate=.9;
        utter.pitch=1.04;
        utter.volume=.98;
        let settled=false;
        const finish=(ok)=>{
          if(settled)return;
          settled=true;
          clearTimeout(timer);
          utter.onend=utter.onerror=null;
          resolve(ok);
        };
        utter.onend=()=>finish(true);
        utter.onerror=()=>finish(false);
        const timer=setTimeout(()=>finish(false),5600);
        speechSynthesis.speak(utter);
      }catch{resolve(false)}
    });
  }

  async function playInsectSequence(insect,card){
    stopInsectPlayback({restoreMusic:false});
    const token=++insectPlaybackToken;
    activeInsectCard=card;
    card.classList.remove('animal-card--pressing');
    card.classList.add('animal-card--focus','animal-card--speaking');

    const musicWasPlaying=!menuMusic.paused;
    if(musicWasPlaying)menuMusic.pause();

    if(settings.master&&settings.voice){
      await speakInsect(insect,token);
    }else{
      await new Promise(r=>setTimeout(r,1050));
    }

    if(token!==insectPlaybackToken)return;
    await new Promise(r=>setTimeout(r,180));
    if(token!==insectPlaybackToken)return;
    card.classList.remove('animal-card--speaking','animal-card--focus');
    activeInsectCard=null;
    if(musicWasPlaying&&settings.master&&settings.music)ensureAudio();
  }

  function gameInsectGallery(){
    activityContent.innerHTML='';
    activityContent.classList.add('animal-gallery-mode');

    const wrap=document.createElement('div');
    wrap.className='animal-gallery animal-gallery--insect';
    wrap.setAttribute('aria-label','Միջատների պատկերասրահ');

    INSECTS.forEach(insect=>{
      const palette=INSECT_PALETTES[insect.group]||INSECT_PALETTES.winged;
      const card=document.createElement('button');
      card.type='button';
      card.className='animal-card animal-card--insect';
      card.dataset.insectId=insect.id;
      card.style.setProperty('--animal-accent',palette.accent);
      card.style.setProperty('--animal-accent-soft',palette.soft);
      card.style.setProperty('--animal-name-size',galleryNameSize(insect.name));
      card.setAttribute('aria-label',`${insect.name}, ${insect.type} միջատ`);
      card.innerHTML=`
        <span class="animal-image-wrap">
          <img src="${insect.image}?v=89" alt="${insect.name}" draggable="false">
          <span class="animal-card-sheen" aria-hidden="true"></span>
        </span>
        <span class="animal-meta animal-meta--insect">
          <strong class="animal-name">${insect.name}</strong>
          <small class="animal-type animal-type--insect" style="background:${palette.badge}">${insect.type}</small>
        </span>`;
      hardCenterGalleryCard(card);

      let downX=0,downY=0,downPointer=null,moved=false;
      card.addEventListener('pointerdown',e=>{
        if(e.pointerType==='mouse'&&e.button!==0)return;
        downPointer=e.pointerId;
        downX=e.clientX;downY=e.clientY;moved=false;
        card.classList.add('animal-card--pressing');
      });
      card.addEventListener('pointermove',e=>{
        if(e.pointerId!==downPointer)return;
        if(Math.hypot(e.clientX-downX,e.clientY-downY)>12){
          moved=true;
          card.classList.remove('animal-card--pressing');
        }
      });
      card.addEventListener('pointerup',e=>{
        if(e.pointerId!==downPointer)return;
        card.classList.remove('animal-card--pressing');
        const shouldPlay=!moved;
        downPointer=null;
        if(shouldPlay)playInsectSequence(insect,card);
      });
      card.addEventListener('pointercancel',()=>{
        downPointer=null;moved=true;card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('pointerleave',()=>{
        if(downPointer!==null)card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('click',e=>{
        if(e.detail===0)playInsectSequence(insect,card);
      });

      wrap.appendChild(card);
    });

    activityContent.appendChild(wrap);

    const syncInsectFocusScale=()=>{
      const gap=parseFloat(getComputedStyle(wrap).columnGap)||10;
      $$('.animal-card',wrap).forEach(card=>{
        const width=card.offsetWidth||1;
        const sideGrow=gap*.86;
        const scale=Math.min(1.105,1+(sideGrow*2/width));
        card.style.setProperty('--animal-focus-scale',scale.toFixed(4));
        card.style.setProperty('--animal-press-scale',Math.min(1.035,1+(sideGrow*.62/width)).toFixed(4));
      });
    };
    requestAnimationFrame(syncInsectFocusScale);
    addEventListener('resize',syncInsectFocusScale,{passive:true});

    gameCleanup.push(()=>{
      removeEventListener('resize',syncInsectFocusScale);
      stopInsectPlayback({restoreMusic:true});
      try{speechSynthesis?.cancel()}catch{}
      activityContent.classList.remove('animal-gallery-mode');
    });
  }

  function gameShadow(){
    const s=surface('☝️'),animals=[['🦁','lion'],['🐘','ele'],['🐇','bun']];let done=0;
    animals.forEach(([ico,key],i)=>{
      const slot=document.createElement('div');slot.className='drop-slot shadow-slot';slot.dataset.key=key;slot.style.left=`${10+i*31}%`;slot.style.top='17%';slot.innerHTML=`<span class="sil">${ico}</span>`;s.appendChild(slot);
      const p=document.createElement('div');p.className='drag-piece shadow-animal';p.dataset.key=key;p.textContent=ico;p.style.left=`${8+i*31}%`;p.style.top='68%';s.appendChild(p);
      makeDrag(p,{container:s,onDrop:()=>{if(rectOverlap(p,slot)){p.remove();slot.innerHTML=ico;slot.classList.add('good');if(++done===3)reward()}else shake(p)}});
    });
  }
  function gameFeed(){
    gameSeaGallery();
  }
  function gameHatch(){
    gameBirdGallery();
  }
  function gameGarden(){
    const s=surface('↔️'),bed=document.createElement('div');bed.className='garden-bed';s.appendChild(bed);let done=0;
    [12,35,58,80].forEach((x,i)=>{const pot=document.createElement('div');pot.className='pot';pot.style.left=`${x}%`;pot.innerHTML=`<span class="flower">${['🌷','🌻','🌸','🌼'][i]}</span>`;bed.appendChild(pot)});
    const can=document.createElement('div');can.className='drag-piece watering-can';can.textContent='🚿';can.style.left='8%';can.style.top='20%';s.appendChild(can);
    makeDrag(can,{container:s,onMove:()=>{$$('.pot',bed).forEach(p=>{if(!p.classList.contains('bloom')&&rectOverlap(can,p)){p.classList.add('bloom');if(++done===4)reward()}})}})
  }

  /* SPACE */
  function gameRocket(){
    const s=surface('☝️'),board=document.createElement('div');board.className='rocket-board';s.appendChild(board);let done=0;
    const data=[['🔺',0],['⬜',1],['🔥',2]];
    data.forEach(([ico,k])=>{const sl=document.createElement('div');sl.className='drop-slot rocket-slot';sl.dataset.k=k;sl.style.top=`${k*96}px`;sl.textContent='·';board.appendChild(sl);
      const p=document.createElement('div');p.className='drag-piece rocket-piece';p.textContent=ico;p.dataset.k=k;p.style.left=`${12+k*30}%`;p.style.top='73%';s.appendChild(p);
      makeDrag(p,{container:s,onDrop:()=>{if(rectOverlap(p,sl)){p.remove();sl.textContent=ico;sl.classList.add('good');if(++done===3)reward()}else shake(p)}})
    })
  }
  function gameOrbits(){
    const s=surface('☝️'),zone=document.createElement('div');zone.className='orbit-zone';s.appendChild(zone);let done=0;
    const targets=[{x:44,y:40,size:62,k:'a'},{x:17,y:56,size:78,k:'b'},{x:70,y:65,size:92,k:'c'}],planets=[['🌕','a'],['🌍','b'],['🪐','c']];
    targets.forEach(t=>{const sl=document.createElement('div');sl.className='orbit-target';sl.dataset.k=t.k;sl.style.left=t.x+'%';sl.style.top=t.y+'%';sl.style.width=t.size+'px';sl.style.height=t.size+'px';s.appendChild(sl)});
    planets.forEach(([ico,k],i)=>{const p=document.createElement('div');p.className='drag-piece planet-piece';p.textContent=ico;p.dataset.k=k;p.style.left=`${10+i*31}%`;p.style.top='78%';s.appendChild(p);makeDrag(p,{container:s,onDrop:()=>{const sl=$(`.orbit-target[data-k="${k}"]`,s);if(rectOverlap(p,sl)){p.remove();sl.textContent=ico;sl.style.fontSize='52px';sl.style.display='grid';sl.style.placeItems='center';if(++done===3)reward()}else shake(p)}})})
  }
  function gameCatch(){
    const s=surface('↔️');s.classList.add('space-field');const c=document.createElement('div');c.className='star-catcher';c.textContent='🧺';c.style.left='45%';s.appendChild(c);const cnt=document.createElement('div');cnt.className='catch-counter';cnt.textContent='⭐ 0/6';s.appendChild(cnt);let caught=0,running=true,last=0,items=[];
    makeDrag(c,{container:s});function spawn(){const st=document.createElement('div');st.className='falling-star';st.textContent='⭐';st.style.left=(5+Math.random()*85)+'%';st.dataset.y='-50';s.appendChild(st);items.push(st)}
    const timer=setInterval(spawn,700);gameCleanup.push(()=>clearInterval(timer));
    function loop(t){if(!running)return;const dt=Math.min(32,t-last||16);last=t;items=[...items].filter(st=>{let y=+st.dataset.y+dt*.16;st.dataset.y=y;st.style.top=y+'px';if(rectOverlap(st,c)){st.remove();caught++;cnt.textContent=`⭐ ${caught}/6`;if(caught>=6){running=false;clearInterval(timer);reward()}return false}if(y>s.clientHeight){st.remove();return false}return true});if(running)requestAnimationFrame(loop)}requestAnimationFrame(loop);gameCleanup.push(()=>running=false)
  }
  function gameLanding(){
    const s=surface('🔥');s.classList.add('moon-field');const lander=document.createElement('div');lander.className='lander';lander.textContent='🚀';const pad=document.createElement('div');pad.className='landing-pad';const thr=document.createElement('button');thr.className='thrust-btn';thr.textContent='🔥';s.append(lander,pad,thr);
    let y=65,v=0,thrust=false,running=true,crashed=false,last=performance.now();const pd=()=>thrust=true,pu=()=>thrust=false;thr.addEventListener('pointerdown',pd);addEventListener('pointerup',pu);gameCleanup.push(()=>{running=false;thr.removeEventListener('pointerdown',pd);removeEventListener('pointerup',pu)});
    function reset(){y=65;v=0;crashed=false;lander.textContent='🚀';lander.style.left='50%';lander.style.top='65px'}
    function loop(t){
      if(!running)return;
      const dt=Math.min(.035,(t-last)/1000);last=t;
      if(!crashed){
        v+=(thrust?-42:23)*dt;y+=v*22*dt;lander.style.top=y+'px';
        if(y>s.clientHeight-190){
          if(Math.abs(v)<8){running=false;lander.style.top=(s.clientHeight-190)+'px';reward(3)}
          else{crashed=true;lander.textContent='💥';setTimeout(()=>{reset();last=performance.now()},520)}
        }
      }
      requestAnimationFrame(loop);
    }requestAnimationFrame(loop)
  }

  /* MIND */
  function gameSort(){
    const s=surface('☝️'),colors=[['#ef5350','r'],['#42a5f5','b'],['#66bb6a','g']],bins=[];let done=0;
    colors.forEach(([col,k],i)=>{const b=document.createElement('div');b.className='sort-bin';b.dataset.k=k;b.style.left=`${5+i*31}%`;b.style.background=col+'99';s.appendChild(b);bins.push(b)});
    const chips=[...colors,...colors];chips.forEach(([col,k],i)=>{const p=document.createElement('div');p.className='drag-piece color-chip';p.dataset.k=k;p.style.background=col;p.style.left=`${8+(i%3)*31}%`;p.style.top=`${18+Math.floor(i/3)*18}%`;s.appendChild(p);makeDrag(p,{container:s,onDrop:()=>{const b=bins.find(x=>x.dataset.k===k);if(rectOverlap(p,b)){p.remove();if(++done===6)reward()}else shake(p)}})})
  }
  function gameSizes(){
    const s=surface('☝️'),sizes=[56,82,108];let done=0;
    sizes.forEach((sz,i)=>{const sl=document.createElement('div');sl.className='drop-slot size-slot';sl.dataset.i=i;sl.style.width=sl.style.height=sz+'px';sl.style.left=`${12+i*31}%`;sl.style.top='20%';s.appendChild(sl);
      const p=document.createElement('div');p.className='drag-piece size-piece';p.dataset.i=i;p.style.width=p.style.height=sz+'px';p.style.left=`${10+i*31}%`;p.style.top='67%';s.appendChild(p);makeDrag(p,{container:s,onDrop:()=>{if(rectOverlap(p,sl)){p.remove();sl.style.background='#61b4ff';sl.style.borderStyle='solid';if(++done===3)reward()}else shake(p)}})})
  }
  function gamePattern(){
    const s=surface('☝️');let round=0;const rounds=[[['🔵','🟡','🔵','🟡'],'🔵',['🔵','🟢','🔺']],[['⭐','🌙','⭐','🌙'],'⭐',['🌙','⭐','☀️']],[['🍎','🍌','🍎','🍌'],'🍎',['🍎','🍓','🍌']]];
    function draw(){s.innerHTML='';const h=document.createElement('div');h.className='game-hint';h.textContent='☝️';s.appendChild(h);const [seq,ans,opts]=rounds[round];const row=document.createElement('div');row.className='pattern-row';row.textContent=seq.join(' ')+'  ❓';const choices=document.createElement('div');choices.className='pattern-options';opts.forEach(o=>{const b=document.createElement('button');b.className='pattern-choice';b.textContent=o;b.addEventListener('click',()=>{if(o===ans){b.style.background='#c7f2ac';round++;if(round>=rounds.length)reward();else setTimeout(draw,350)}else shake(b)});choices.appendChild(b)});s.append(row,choices)}draw()
  }
  function gameCups(){
    const s=surface('☝️');let round=0,target=0;const area=document.createElement('div');area.className='cups-area';s.appendChild(area);
    function next(){area.innerHTML='';target=Math.floor(Math.random()*3);for(let i=0;i<3;i++){const b=document.createElement('button');b.className='cup-btn';b.innerHTML=`🥤<span class="cup-star">⭐</span>`;if(i===target)b.classList.add('reveal');area.appendChild(b);b.addEventListener('click',()=>choose(i,b))}setTimeout(()=>{$$('.cup-btn',area).forEach(b=>b.classList.remove('reveal'));area.animate([{transform:'translateX(0)'},{transform:'translateX(10px)'},{transform:'translateX(-10px)'},{transform:'translateX(0)'}],{duration:650})},850)}
    function choose(i,b){if(i===target){b.classList.add('reveal');round++;if(round>=3)reward();else setTimeout(next,550)}else shake(b)}next()
  }

  /* CREATIVITY */
  function gamePaint(){
    const s=surface(null),wrap=document.createElement('div');wrap.className='paint-wrap';const pal=document.createElement('div');pal.className='palette-row';const box=document.createElement('div');box.className='paint-canvas-box';box.innerHTML='<canvas class="paint-canvas"></canvas>';const done=document.createElement('button');done.className='primary-action';done.textContent='⭐';done.style.cssText='align-self:center;min-width:90px;font-size:28px';wrap.append(pal,box,done);s.appendChild(wrap);
    const colors=['#ef5350','#ff9800','#ffeb3b','#66bb6a','#42a5f5','#ab47bc','#3e2723'];let col=colors[0];colors.forEach((c,i)=>{const b=document.createElement('button');b.className='palette-dot';b.style.background=c;if(i===0)b.style.boxShadow='0 0 0 4px #ffd77f';b.addEventListener('click',()=>{col=c;$$('.palette-dot',pal).forEach(x=>x.style.boxShadow='');b.style.boxShadow='0 0 0 4px #ffd77f'});pal.appendChild(b)});
    const canvas=$('canvas',box),ctx=canvas.getContext('2d');function size(){const r=box.getBoundingClientRect();canvas.width=Math.max(250,r.width);canvas.height=Math.max(300,r.height);ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=10}requestAnimationFrame(size);let drawing=false;
    const pt=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};canvas.onpointerdown=e=>{drawing=true;const p=pt(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};canvas.onpointermove=e=>{if(!drawing)return;const p=pt(e);ctx.strokeStyle=col;ctx.lineTo(p.x,p.y);ctx.stroke()};const paintUp=()=>drawing=false;addEventListener('pointerup',paintUp);gameCleanup.push(()=>removeEventListener('pointerup',paintUp));done.addEventListener('click',()=>reward())
  }
  function gameStickers(){
    const s=surface('☝️'),scene=document.createElement('div');scene.className='sticker-scene';
    const tray=document.createElement('div');tray.className='sticker-tray';s.append(scene,tray);let placed=0;
    ['🌈','☀️','🌳','🐶','⭐','🌸'].forEach(ico=>{
      const p=document.createElement('button');p.className='sticker-item';p.textContent=ico;tray.appendChild(p);
      p.addEventListener('click',()=>{
        const clone=document.createElement('div');clone.className='sticker-item';clone.textContent=ico;
        clone.style.cssText=`position:absolute;left:${5+Math.random()*78}%;top:${8+Math.random()*68}%;font-size:${42+Math.random()*22}px;transform:rotate(${Math.random()*18-9}deg);`;
        scene.appendChild(clone);clone.animate([{transform:'scale(.2)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],{duration:280});
        if(++placed===5)reward();
      });
    });
  }
  function gameMix(){
    const s=surface('☝️'),area=document.createElement('div');area.className='mix-area';const drops=document.createElement('div');drops.className='mix-drops';const bowl=document.createElement('div');bowl.className='mix-bowl';bowl.innerHTML='<div class="mix-liquid"></div>';area.append(drops,bowl);s.appendChild(area);let selected=[],found=new Set();const colors=[['#ef5350','r'],['#ffeb3b','y'],['#42a5f5','b']],mix={ry:'#ff9800',br:'#ab47bc',by:'#66bb6a'};
    colors.forEach(([c,k])=>{const b=document.createElement('button');b.className='paint-drop';b.style.background=c;b.addEventListener('click',()=>{if(selected.includes(k))return;selected.push(k);b.style.boxShadow='0 0 0 5px #fff,0 6px 0 rgba(75,39,17,.16)';if(selected.length===2){const key=[...selected].sort().join('');$('.mix-liquid',bowl).style.background=mix[key]||'#795548';found.add(key);setTimeout(()=>{$$('.paint-drop',drops).forEach(x=>x.style.boxShadow='');selected=[];if(found.size>=3)reward()},700)}});drops.appendChild(b)})
  }
  function gameBlocks(){
    const s=surface('☝️'),zone=document.createElement('div');zone.className='block-zone';const pad=document.createElement('div');pad.className='tower-pad';zone.appendChild(pad);s.appendChild(zone);let stack=0;
    ['#ef5350','#42a5f5','#ffca28','#66bb6a'].forEach((c,i)=>{const b=document.createElement('div');b.className='drag-piece block';b.style.background=c;b.style.left=`${8+i*21}%`;b.style.top='12%';zone.appendChild(b);makeDrag(b,{container:zone,onDrop:()=>{const zr=zone.getBoundingClientRect(),br=b.getBoundingClientRect(),cx=br.left+br.width/2-zr.left;if(Math.abs(cx-zr.width/2)<110){b.style.left=(zr.width/2-36)+'px';b.style.top=(zr.height-60-72*(stack+1))+'px';b.style.pointerEvents='none';stack++;if(stack===4)reward()}else shake(b)}})})
  }

  /* MAGIC */
  function gameConnect(){
    const s=surface('☝️'),field=document.createElement('div');field.className='star-connect';s.appendChild(field);const pts=[[18,68],[34,30],[50,58],[68,25],[82,66]];let next=0,drawing=false;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.style.cssText='position:absolute;inset:0;width:100%;height:100%';const poly=document.createElementNS(svg.namespaceURI,'polyline');poly.setAttribute('fill','none');poly.setAttribute('stroke','#ffe56f');poly.setAttribute('stroke-width','1.5');poly.setAttribute('stroke-linecap','round');svg.appendChild(poly);field.appendChild(svg);
    const stars=pts.map((p,i)=>{const e=document.createElement('div');e.className='connect-star';e.textContent='⭐';e.style.left=`calc(${p[0]}% - 25px)`;e.style.top=`calc(${p[1]}% - 25px)`;e.dataset.i=i;field.appendChild(e);return e});
    function hit(e){const r=field.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100,p=pts[next];if(p&&Math.hypot(x-p[0],y-p[1])<9){stars[next].classList.add('done');next++;poly.setAttribute('points',pts.slice(0,next).map(p=>p.join(',')).join(' '));if(next===pts.length){drawing=false;reward(3)}}}
    field.addEventListener('pointerdown',e=>{drawing=true;next=0;stars.forEach(x=>x.classList.remove('done'));poly.setAttribute('points','');hit(e)});field.addEventListener('pointermove',e=>{if(drawing)hit(e)});const connectUp=()=>drawing=false;addEventListener('pointerup',connectUp);gameCleanup.push(()=>removeEventListener('pointerup',connectUp))
  }
  function gameWand(){
    const s=surface('↔️'),field=document.createElement('div');field.className='wand-field';s.appendChild(field);let lit=0;
    ['⭐','🌙','🔮','🦋','💎'].forEach((ico,i)=>{const o=document.createElement('div');o.className='magic-object';o.textContent=ico;o.style.left=`${12+(i%3)*33}%`;o.style.top=`${18+Math.floor(i/3)*42}%`;field.appendChild(o)});
    const w=document.createElement('div');w.className='drag-piece magic-wand';w.textContent='🪄';w.style.left='8%';w.style.top='70%';field.appendChild(w);makeDrag(w,{container:field,onMove:()=>{$$('.magic-object',field).forEach(o=>{if(!o.classList.contains('lit')&&rectOverlap(w,o)){o.classList.add('lit');if(++lit===5)reward()}})}})
  }
  function gamePotion(){
    const s=surface('☝️'),area=document.createElement('div');area.className='potion-area';const ca=document.createElement('div');ca.className='cauldron';ca.innerHTML='🫕<span class="potion-bubbles">✨🫧✨</span>';const ing=document.createElement('div');ing.className='ingredients';area.append(ca,ing);s.appendChild(area);let used=0;
    ['🍓','🍋','🍇','🌿','🫐','🌸'].forEach(ico=>{const b=document.createElement('button');b.className='ingredient';b.textContent=ico;b.addEventListener('click',()=>{if(b.disabled)return;b.disabled=true;b.style.opacity=.25;ca.classList.remove('bubble');void ca.offsetWidth;ca.classList.add('bubble');used++;if(used===4)reward(3)});ing.appendChild(b)})
  }
  function gameBook(){
    const s=surface('☝️'),book=document.createElement('div');book.className='story-book';const scene=document.createElement('button');scene.className='story-scene';const dots=document.createElement('div');dots.className='page-dots';book.append(scene,dots);s.appendChild(book);const pages=['🏰','🐉','🧚‍♀️','🌟'];let i=0;
    pages.forEach((_,n)=>{const d=document.createElement('span');d.className='page-dot'+(n===0?' on':'');dots.appendChild(d)});
    function draw(){scene.textContent=pages[i];$$('.page-dot',dots).forEach((d,n)=>d.classList.toggle('on',n===i))}draw();scene.addEventListener('click',()=>{scene.classList.add('pop');setTimeout(()=>scene.classList.remove('pop'),240);i++;if(i>=pages.length){reward(3);i=0}setTimeout(draw,260)})
  }

  /* avatar */
  const PRESET_AVATARS=[
    {src:'preset-gummy-bear.svg',label:'Ժելե արջուկ'},
    {src:'preset-bunny.svg',label:'Նապաստակ'},
    {src:'preset-kitten.svg',label:'Կատու'},
    {src:'preset-puppy.svg',label:'Շնիկ'},
    {src:'preset-panda.svg',label:'Պանդա'},
    {src:'preset-fox.svg',label:'Աղվես'},
    {src:'preset-lion.svg',label:'Առյուծիկ'},
    {src:'preset-monkey.svg',label:'Կապիկ'},
    {src:'preset-koala.svg',label:'Կոալա'},
    {src:'preset-robot.svg',label:'Ռոբոտ'}
  ];
  const avatarButton=$('#avatarButton'),savedAvatar=$('#savedAvatar'),photoInput=$('#photoInput'),cropPreview=$('#cropPreview'),cropImage=$('#cropImage'),cropPlaceholder=$('#cropPlaceholder'),zoomSlider=$('#zoomSlider'),saveAvatar=$('#saveAvatar'),presetAvatarGrid=$('#presetAvatarGrid');
  let sourceDataUrl=null,naturalW=0,naturalH=0,zoom=1,panX=0,panY=0,pointerMap=new Map(),dragStart=null,pinchStart=null;
  const persisted=localStorage.getItem(AVATAR_KEY);if(persisted){savedAvatar.src=persisted;savedAvatar.hidden=false}

  function setAvatar(src,source='preset'){
    localStorage.setItem(AVATAR_KEY,src);
    localStorage.setItem(AVATAR_SOURCE_KEY,source);
    savedAvatar.src=src;
    savedAvatar.hidden=false;
    markPresetSelection();
  }
  function markPresetSelection(){
    const current=((localStorage.getItem(AVATAR_KEY)||savedAvatar.getAttribute('src')||'').split('/').pop()||'').split('?')[0];
    $$('.preset-avatar-option',presetAvatarGrid).forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.src===current)));
  }
  function renderPresetAvatars(){
    if(!presetAvatarGrid)return;
    presetAvatarGrid.innerHTML='';
    PRESET_AVATARS.forEach(item=>{
      const btn=document.createElement('button');
      btn.className='preset-avatar-option';
      btn.type='button';
      btn.dataset.src=item.src;
      btn.setAttribute('aria-label',item.label);
      btn.setAttribute('aria-pressed','false');
      btn.innerHTML=`<img src="${item.src}?v=89" alt="${item.label}" draggable="false">`;
      btn.addEventListener('click',()=>{
        setAvatar(item.src,'preset');
        avatarModal.hidden=true;
        showToast('✓');
      });
      presetAvatarGrid.appendChild(btn);
    });
    markPresetSelection();
  }

  avatarButton.addEventListener('click',()=>{markPresetSelection();avatarModal.hidden=false});
  $$('[data-close="avatar"]').forEach(e=>e.addEventListener('click',()=>avatarModal.hidden=true));
  renderPresetAvatars();

  photoInput.addEventListener('change',async()=>{
    const f=photoInput.files?.[0];
    if(!f)return;
    sourceDataUrl=await downscaleImage(f,1800);
    cropImage.onload=()=>{
      naturalW=cropImage.naturalWidth;naturalH=cropImage.naturalHeight;zoom=1;panX=panY=0;zoomSlider.value='1';cropImage.hidden=false;cropPlaceholder.hidden=true;saveAvatar.disabled=false;renderCrop();
    };
    cropImage.src=sourceDataUrl;
    photoInput.value='';
  });
  function previewSize(){return cropPreview.clientWidth-16}
  function baseFit(){const s=previewSize();return Math.max(s/naturalW,s/naturalH)}
  function renderCrop(){if(!naturalW)return;const s=previewSize(),fit=baseFit(),w=naturalW*fit*zoom,h=naturalH*fit*zoom;cropImage.style.width=w+'px';cropImage.style.height=h+'px';cropImage.style.left=((s-w)/2+8+panX)+'px';cropImage.style.top=((s-h)/2+8+panY)+'px'}
  zoomSlider.addEventListener('input',()=>{zoom=+zoomSlider.value;renderCrop()});$('#zoomOut').addEventListener('click',()=>{zoom=Math.max(.4,zoom-.15);zoomSlider.value=zoom;renderCrop()});$('#zoomIn').addEventListener('click',()=>{zoom=Math.min(4,zoom+.15);zoomSlider.value=zoom;renderCrop()});
  cropPreview.addEventListener('pointerdown',e=>{if(!sourceDataUrl)return;cropPreview.setPointerCapture?.(e.pointerId);pointerMap.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointerMap.size===1)dragStart={x:e.clientX,y:e.clientY,panX,panY};if(pointerMap.size===2){const p=[...pointerMap.values()];pinchStart={distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),zoom}}});
  cropPreview.addEventListener('pointermove',e=>{if(!pointerMap.has(e.pointerId))return;pointerMap.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointerMap.size===1&&dragStart){panX=dragStart.panX+e.clientX-dragStart.x;panY=dragStart.panY+e.clientY-dragStart.y;renderCrop()}else if(pointerMap.size===2&&pinchStart){const p=[...pointerMap.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);zoom=Math.max(.4,Math.min(4,pinchStart.zoom*d/Math.max(1,pinchStart.distance)));zoomSlider.value=zoom;renderCrop()}});
  ['pointerup','pointercancel'].forEach(t=>cropPreview.addEventListener(t,e=>{pointerMap.delete(e.pointerId);if(pointerMap.size<2)pinchStart=null;if(!pointerMap.size)dragStart=null}));
  saveAvatar.addEventListener('click',async()=>{if(!sourceDataUrl)return;const data=await renderSavedAvatar();setAvatar(data,'upload');avatarModal.hidden=true;showToast('✓')});
  async function renderSavedAvatar(){const out=512,c=document.createElement('canvas');c.width=c.height=out;const ctx=c.getContext('2d'),im=new Image();await new Promise((res,rej)=>{im.onload=res;im.onerror=rej;im.src=sourceDataUrl});const s=previewSize(),fit=Math.max(s/im.naturalWidth,s/im.naturalHeight),w=im.naturalWidth*fit*zoom,h=im.naturalHeight*fit*zoom,k=out/s;ctx.save();ctx.beginPath();ctx.arc(out/2,out/2,out/2,0,Math.PI*2);ctx.clip();ctx.drawImage(im,((s-w)/2+panX)*k,((s-h)/2+panY)*k,w*k,h*k);ctx.restore();return c.toDataURL('image/jpeg',.9)}
  async function downscaleImage(file,max){const raw=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)}),im=new Image();await new Promise((res,rej)=>{im.onload=res;im.onerror=rej;im.src=raw});const sc=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight));if(sc===1)return raw;const c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*sc);c.height=Math.round(im.naturalHeight*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.9)}

  function showToast(t){toast.textContent=t;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),900)}
  updateStars();
  if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();