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
  let settings={master:true,music:true,voice:true,effects:true,theme:'day',...loadJson(SETTINGS_KEY,{})};
  const STAR_RESET_V40='areg-stars-reset-v40';
  if(!localStorage.getItem(STAR_RESET_V40)){
    localStorage.setItem(STARS_KEY,'0');
    localStorage.setItem(STAR_RESET_V40,'1');
    localStorage.removeItem('areg-magic-unlocked-v1');
  }
  let stars=Number(localStorage.getItem(STARS_KEY)||0);
  const themes=[['day','Day'],['night','Night'],['winter','Winter'],['rain','Rain'],['aurora','Aurora'],['wood','Wood'],['forest','Forest'],['ocean','Ocean'],['sunset','Sunset'],['space','Space']];
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
    "dog":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/7523579c-081c-439b-94e2-f21e366167fa/AREG_dog_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDdkMDI5NzMxZTE1MjhhYyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyMTIzNX0.SxYICOJETFJKx1bw8-BOQuh1dxBM8JwGAmhd8HpkmU0",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/7da6c050-cb8b-484f-8f2b-7f8d9c561e11/AREG_animal_dog_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNjRiMWFjZGYwOWE2MmVkNSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzMTMyN30.VK3qgp2VAoaynHFIWP09tcxriCUCHtQVy_DRM9694Ro"},
    "wolf":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/4263cfdf-f6ae-4c71-8324-3037c34a4bfd/AREG_wolf_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZmYzZmQ2MGQ2ZDQ4Y2Q4YiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIwMjQ0NX0.j4HIqh380XGVgJWhAjaaGXsGU09lM3l3Xq0R2OVEctY",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/d2d7358d-4df1-4b84-9c44-93f79f62f23f/AREG_animal_wolf_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzU5OTg2ZjBmZGE3YmUxMiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0OTkwNH0.yr4Dw01xx1Qd5uRKWNCDUeI7434uRDOqxLi9vKou_mE"},
    "lynx":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/403db06a-3828-4bd6-9028-ab3c294b9aec/AREG_lynx_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNTkyODk0MTBkMWY2NGMxZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzMzE2OH0._0V1HV0etcsAYgySoRfRkdv-SXDKlAKMxyKplnGmZZw",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/26f78256-3c24-424b-9f49-e2e824c0e4f5/AREG_animal_lynx_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiM2VjY2MyYTdiMDAzYTQ1MyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIwMzM2N30.vbzgHStPxGSFMH-8lbMAKaU3F4_C8Ul7zl8Qyj8bcOA"},
    "cow":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/335cae80-a8ef-4044-a5fd-7cd352e2e537/AREG_cow_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDUzZWViYWI0ZTA5NTFjNSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2MTg2N30.cBzAh4y7mZKctYaImoHVjjMSpamOZe-XsSjRo8vHT78",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/99c19d9b-d9b6-4158-aa4b-17c885551355/AREG_animal_cow_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzNlZmI5YWZjNmVjOWZhYyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0OTQ1NX0.w9MMqZs_4UF6_4CjNWolzv01zJ-dVIZc841b6m8-9RA"},
    "horse":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/282132f5-b71b-4f9c-947d-38a2debb867c/AREG_horse_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOTY3MjkzOWI4YWVkNWEwZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0NjQ5MX0.rygBeY22gTVZqhOJiaK1O9xgzSrhtJUpi3_wYtCuZ_s",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/cb93da8b-c556-4785-9dfc-d0aac9b1cd42/AREG_animal_horse_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZmJhYjE3MzM3OTUyNWJhYyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI1NzAxMX0.4qBRxVC1YXjP8zzsvptgErnbpGv-_GETKBpD-SwJ0U8"},
    "goat":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/07b56df6-896c-4699-a2f6-e189623e2eac/AREG_goat_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjUzODA0MjA1MDVkNmQ3NSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyNDk5Mn0.1wPbICg6SwzOsfLQwpyUApcr3DYJMBT4WxBDhgOisO8",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/75a5b693-459f-41a7-81e6-f528b30a66c8/AREG_animal_goat_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYjEzYTQyODNiZGI3NzE4MiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2MDU0N30.6b71i1t70WYvbhycplIT8Ips5lmyBlvzwHF64ZwSWYM"},
    "camel":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/1ca589ec-83d9-49c4-b5ce-287e07c7f337/AREG_camel_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTQ5ZTE0YjdhMWNiYTA0OCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIwMzUxMX0.r3Dtq4mB9X0tn2cq76IId2sf65eAUpsuLn6AsbOZlEw",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/f20eb156-96bd-4b0f-bbab-bb11adf9e0e3/AREG_animal_camel_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDJlMjMzMGUxZjY3MzI1OSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzOTQzOH0.YlyyGT8jTBBrSbp1jkXjlHJI9Jl37ogoBgICWZB6B5I"},
    "sheep":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/636838a3-f5ad-44dc-8f6e-5df7f858ee6e/AREG_sheep_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTYxNGFkMmZlODFlMWNhNyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIxNTQwN30.5S02EZL2VK9J_JIFKnnmzYvWOEDmXLzQwjZDf-vH21Y",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/5548673e-79e9-4484-aa82-8f2d426f540d/AREG_animal_sheep_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzgyYTZmZTI4OTY4YTlmMyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3Mzk1NH0.cyW7Zh7keEIi2PPmFEMvK4VXZHby9Y78hiA7u-oqB8g"},
    "cat":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/38f0194b-b2dc-47ea-b900-ec54697a8408/AREG_cat_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiODU0NTAwN2I2ZDJlYzM3MyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3NzQzNX0.Ko1IJZdJZ93ahXcj9RVarLQg6Ie_2dzZSRl2bHanMUA",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/b39c50dd-941a-4664-83e6-033df8494d55/AREG_animal_cat_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNWUzZGZlYWJiZWIxNjZiZSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0NTk5NX0.6Ouq8cOFDibU5YIIPtD1M8aF0ekuEQ06KiCyX9I2mtc"},
    "tiger":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/62f1a0e3-5451-4fa2-9792-3b85b9ae4bf5/AREG_tiger_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYWY3ZjYxMzg4MGMyODBhZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2NjM2MH0.tR7KlVHAJ_BCxq5jIZmmizkTngYzXXfBU24X--Z9ugk",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/f08f3336-777f-4b67-92e6-fd3ee316d705/AREG_animal_tiger_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZDZhY2U1MWM3YmEyNmM0NyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyOTQ2OH0.23XT92b30RdrCFZjjFWFPOQvqTx77scJVNrij2izVMU"},
    "donkey":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/ebf9feb5-4a80-426c-858c-1ccd4b00e628/AREG_donkey_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZGQyMmNjMzdhZWE5OGNkZiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3NDAzOX0.sKVVezc-TDRPltYK0unNLVApoLBgWrGftCEdFV7iGjc",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/c1b6e7a3-7c46-4daf-8569-e387e6961058/AREG_animal_donkey_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNzVhMTFmNDYyZWQ3MDgwOCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3NTk3NH0.5tu8G0Qr2Qq7PnrtcdmdWH-N5Jr49vGjLnUMuUahE74"},
    "bull":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/900c5fc8-6aff-461b-ad1b-ddc321bb73fe/AREG_bull_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjEwMTIzOWE2NDdlODQ2NSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI4MTMwNn0.dCR6mDb29UAY5Odv3e_38UI-yI5DF3yAcvK4icE-0gw",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/b653b373-0658-4907-b4f2-1cda29723095/AREG_animal_bull_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOWM5N2FiNjAwZTQ5NDc3ZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2NTUwNH0.ta7zayY_9Ri7U6-1tZOISmRlyxDEjYQOvlRTUzlXuZs"},
    "deer":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/6a3892a5-99a0-4440-a138-26b5ac5c603f/AREG_deer_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjNjOTE1NDAzYjVmN2QwMiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTE5Njg2NH0.tXZQPby-RapwoefRwWlbuqAZZO5sXrN5cDQADju_xmU",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/a06941a6-0020-466b-9420-7ec7c0d25f2a/AREG_animal_deer_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDg0NGYzN2M5NDdhNjM2ZSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyMjkwOH0.vS_sKTyX7Dft_NT7c1tgaMfLq7nqmsU32H9doO7P_Ww"},
    "bison":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/0a041f09-471c-441f-a09e-87f9cf14361d/AREG_bison_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDM5NDc3Nzg3OWVmMTNhMCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyMDk4NH0.23OpXc_kugdd9cdbcmK6H9KcVHM1jT3v9cP6UCLNmMA",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/0b451488-ef17-4c40-907e-84c2b5a33321/AREG_animal_bison_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZTExYWJjMmZlMjg1ZGYwOCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MDExMX0.LgkkCjnu1Ibg0s7HcmqPvmrhq8AKUP98nllxsurGbYg"},
    "hippo":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/f2de29bf-0a46-4a2a-93b9-19578ca15589/AREG_hippo_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzMyZGM1MjBjZTdhYTJiYiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MTUwNH0._b0LTdeHjjBN6ioB9xlGZximQCtwV_8WhDCxN6XLtnw",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/774e2336-6896-4434-8cf0-cdb751bd8bce/AREG_animal_hippo_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOGVjZDdjYTdmMjlhMTJmNCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIwNDI2M30.t79an5Rc-6Bbt9VIOGSFXU5NL8AliQulA8FsHmn7z6w"},
    "zebra":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/8b997739-bd2d-4c4a-a738-e939b9d21f77/AREG_zebra_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYTc2YTdkYmFjOGU4NTgzMyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MTI3NH0.oBXvdJlrN7WtLL2xUI5U-d6qs_S2cXgoTazwhSnGo6I",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/bb3f4b84-0a88-45a7-b3fc-44ea2aa9ba3e/AREG_animal_zebra_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNjNhNzU0Y2NjMTk2M2EwYyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyOTAwNH0.DUxw4yYwGVE2-oR_2Qx9B_Fwxs3808mlFk_wN-weRc0"},
    "giraffe":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/1b772415-cab9-4cb5-9abd-064320f46f60/AREG_giraffe_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYjNlOTE4MWE2YjdlNjI1ZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI1ODUyMn0.IiJXw6H3LIIC40dyq0HLXzb1_sBDcAjIeyYvY-oMCAw",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/eda8d0b5-dab6-48f7-9d13-4fa5c26ae767/AREG_animal_giraffe_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOWFmNDEyOTA4MzliNjY4MiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MjAwMH0.9XFMhii0cMm9fERp_Z1mQK0vl9M5n-NubH9wSeSvAk4"},
    "elephant":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/ef164dcc-1757-41bf-9509-a3fee371e711/AREG_elephant_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzJhMjI5MTczZGJlNTAyNCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0ODE1MX0.GWVEYrLr_Lf_2cgMh_FudNbq3SRIOojAKTuJQP--xHQ",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/1250fc9d-cfc4-44c8-b1b5-bdeef4d2df1a/AREG_animal_elephant_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNTY1NmUwOWExNWEyNDM3ZCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTE5NjU3MH0.vj-gP5WZ86b_gtht6hPnNXIPthqS9s1m03TJL9GevmA"},
    "rabbit":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/61ab27c5-0b5f-438f-953e-702ce7aab3fc/AREG_rabbit_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZGE3YTA4MTc4OTgxZmVmOCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MTc1MX0.UfIFnxgto1j9dA_7Zv0ah1bZhG3i5dEm6x8nrOrJnj8",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/a9552ae6-1e41-498d-a2e7-cfd9324d3eb0/AREG_animal_rabbit_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDNhYWIzYTMwYzU1OTVlOSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIwOTM3OX0.y0ykSTXXrR3Qm6mmMjtqDqxwiqWu4QtzuGH4bV4KrZs"},
    "monkey":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/47e2e3db-c90a-494a-9eb2-a124ff73e621/AREG_monkey_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMmFjY2U2YmJmNWMwZWUwOSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0NTg4M30.Gd5pMeZKsr6Y-Vg7Gm0yHjblgZzslJSAttGrtiUcqcc",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/078efba2-0cb5-4b93-ac24-f9d7e4ca3dc2/AREG_animal_monkey_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzVlMDhjYTRkNWRiMDJmOCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzODgyMH0.51kyn_UOoQLfFUdA1MDC1FSh74-ZC7ksb8Lrc_9sIZg"},
    "lion":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/1154d83b-1810-4f34-8627-6691fe8a7439/AREG_lion_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDU2ZWY4ODU5ZjkzZjgxMiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI1MTQ2MX0.NUmUlwg2saxpGHH2vXiP-X6Rqg-rjYNLX4NXuUC0apg",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/7e2e3cd7-d608-45ef-99ce-c5c71d976cac/AREG_animal_lion_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNmI2ODM4YWQxMWU0OTYyZiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3ODc2NX0.rIQV4VB7ZLnzrxIlLLqCnyDBXhLKYKdS21NJaxgHlNs"},
    "bear":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/e166cd05-762e-4946-8c9b-3730f235beb9/AREG_bear_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYTcyNTFmMDY1NzhmNDFhMiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3NDI0Nn0.g85Ou4eZjJ7U70wsoBW5eW7udRkwvlBLIQePra3022I",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/21b84ee7-7e5c-4915-8941-ac96c0e54dc0/AREG_animal_bear_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYTZiYWZjM2ZiZWU1ZWE4ZSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzMDUyN30.vUSNkwDoC9_w6XEcPngH4z-DnWnfoHWoeTgqaKmir2g"},
    "panda":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/9cecc975-0f6d-4727-a0c1-41c6674c16b8/AREG_panda_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZGNlYmQ0MzQxNmVlMDU5NSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIxNDAwNH0.w32i3uVIypAeMhbyj2qn55E9S1SB_W1fBA1e39BPfbE",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/951d3ad7-5d47-4173-b525-37f647b29d60/AREG_animal_panda_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiY2JiM2RlZGE3YzdiMjNhNyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI1NTY0Mn0.FOsXrKzOtDAQZg26ijosRBru82VN12sv7gh-_HAVg_c"},
    "fox":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/62546c4a-f66f-4340-85ba-fd8cc6f86335/AREG_fox_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiOWMxMTgxMWM0OThiZDc1ZSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTE5OTI2MH0.a-gvDfIbyIfD9EQ9ewRCtgn4j9vKBRWaBGF_djBYbGU",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/d0e92b7c-f61f-4043-8b1a-fef72e3062bc/AREG_animal_fox_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjQxOTI0MmI5NmI4NDc2NyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI1OTU2M30.H0ApUR2MYKLfZsY1qdaGGBSWqknU-3hrS3tNpBKBBZE"},
    "pig":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/dbea82e5-a7d0-4d92-af26-f343bdce40bf/AREG_pig_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZmEwMTBjNzYzNjMyZjc4OSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0MzEyNn0.iX3GmEQH-_eNufZBDNkXiz2Z4z4LcTcwYAPM8SdhSGM",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/f7e2a2ba-2025-4833-b9de-4c9ae6510cde/AREG_animal_pig_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNzQ1NjM4YjgzODFmN2FkMSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3NjQ3Mn0.m9EX-JgQuykEA-aTcbrQNSnPB69kUlTK8ZYlDUvszZA"},
    "rhino":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/77b94079-6328-4ae4-b42a-72930f340694/AREG_rhino_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDljNDMxODQ0ODlhZmJkNSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI0NTcwMH0.sSHR4mkR-Ty_xYyDunYX3nm2JHZDqLSDs8CcYqarVMY",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/230896ef-3dea-42f9-a382-d7bf2f68414e/AREG_animal_rhino_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDM2NTFmOGRkOWIzN2I1MCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI2NjA2MX0.qeQ2XMUw2YmlIZ6oaxmbQumnXrTjoJgF_K3VaHCye6s"},
    "polar-bear":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/f7c3cb02-ea66-407f-84ff-ae15ade7220e/AREG_polar_bear_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNjIxYTY1YjhjNzBmMTlkOSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyMTk0NH0.Wmsan9gSTuCnHfJXeojq6BOsKKgg6iaXv48Xy5Xf-RI",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/0ddf5a15-0591-438f-bea0-25982184ee80/AREG_animal_polar_bear_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMTA0M2QwZmFhYzU0MWQ2OSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3MzQ2Nn0.CoHBQnqskO8mJ5O1XEa3IRMpKU1lPb3u9GcbmvpK-dY"},
    "leopard":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/3a06123d-813e-4d12-b4c3-09b4b8e9b802/AREG_leopard_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNzQzZGNkMDQyYzhmYjI2OSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIzMTIzNn0.T99ne1hHxtu-wRZwhrkKuoJWKhRvw7dlSLWoinrKeN8",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/5b104034-e398-4c71-9154-74ec151bd96f/AREG_animal_leopard_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYmU0M2Q3NDg3Yjc1OWFmNiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyNzQ2NH0.c6gZ2y_Iew6SwJZijcLLu-9VWxLp7rOzApAf3-R_Jks"},
    "hyena":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/61ab5292-b5f4-4338-bb2a-d9f542066092/AREG_hyena_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjkyNzJmMGE5YjhhOWVlMCIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyMTEzMH0.mZk59EYTbuMKCvUWnClGBrx3PYtSMA1gIKdJYUreLR0",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/1b5e7e22-7d9c-4124-8dea-68c919e282b5/AREG_animal_hyena_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYmVmZmQ3NjZiNjAyMWZhYiIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTI3OTQ2Mn0.pnYw3nZyqXKDJ1NbczaEzVuEI5r2MbOswUKHgW6YtI8"},
    "black-panther":{voice:"https://dnznrvs05pmza.cloudfront.net/text_to_speech/76515791-02e3-40c4-bc2b-7b3c6aa7a63e/AREG_black_panther_Armenian_girl_voice.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiODAxZGMyNjVmYzVjMTA0NSIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIxOTU1N30.Jbgy0aZSLjE7v1FB1OtPYctJu4Igq86XcCPB0Cg7r5o",sound:"https://dnznrvs05pmza.cloudfront.net/audio_sfx/fcda82d2-43c5-4aa4-9cd6-28ddc11c0ec2/AREG_animal_black_panther_sound.mp3?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZTc2NTc4N2U0NjI4ZjIzNyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTIyMDQ3OH0.9Ok7RRJdyCSX6Ys2eFbRMC_kGQUIwZQ9L69phFnAePo"}
  };

  const SECTIONS={
    nature:{
      title:'Բնություն', hero:'hero-nature.jpg', backdrop:'hero-nature.jpg',
      games:[
        {id:'animals',label:'Կենդանիներ',thumb:'nature-game-1.jpg',kind:'animalGallery'},
        {id:'birds',label:'Թռչուններ',thumb:'nature-game-2.jpg',kind:'hatch'},
        {id:'sea',label:'Ջրային կենդանիներ',thumb:'nature-game-3.jpg',kind:'feed'},
        {id:'flowers',label:'Ծաղիկներ',thumb:'nature-game-4.jpg',kind:'garden'}
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
        {id:'puzzle',label:'Փազլ',thumb:'mind-game-1.jpg',kind:'sort'},
        {id:'sizes',label:'Մեծ ու փոքր',thumb:'mind-game-2.jpg',kind:'sizes'},
        {id:'pattern',label:'Շարունակի՛ր շարքը',thumb:'mind-game-3.jpg',kind:'pattern'},
        {id:'numbers',label:'Թվեր',thumb:'mind-game-4.jpg',kind:'cups'}
      ]
    },
    create:{
      title:'Ստեղծագործություն', hero:'hero-create.jpg', backdrop:'hero-create.jpg',
      games:[
        {id:'paint',label:'Մատիկով նկարչություն',thumb:'create-game-1.jpg',kind:'paint'},
        {id:'stickers',label:'Սթիքերների աշխարհ',thumb:'create-game-2.jpg',kind:'stickers'},
        {id:'mix',label:'Խառնիր գույները',thumb:'create-game-3.jpg',kind:'mix'},
        {id:'blocks',label:'Կառուցիր աշտարակ',thumb:'create-game-4.jpg',kind:'blocks'}
      ]
    },
    magic:{
      title:'Բոնուս դաշտ', hero:'hero-magic.jpg', backdrop:'hero-magic.jpg',
      games:[
        {id:'connect',label:'Միացրու աստղերը',thumb:'magic-game-1.jpg',kind:'connect'},
        {id:'wand',label:'Կախարդական փայտիկ',thumb:'magic-game-2.jpg',kind:'wand'},
        {id:'potion',label:'Կախարդական ըմպելիք',thumb:'magic-game-3.jpg',kind:'potion'},
        {id:'book',label:'Կենդանի հեքիաթագիրք',thumb:'magic-game-4.jpg',kind:'book'}
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
      b.className='theme-option'; b.dataset.theme=id; b.setAttribute('aria-label',`Theme ${label}`);
      b.innerHTML=`<img src="${id}.svg?v=55" alt="" aria-hidden="true" draggable="false"><span>${label}</span>`;
      b.addEventListener('click',()=>{settings.theme=id;saveSettings();applyTheme()});
      themeGrid.appendChild(b);
    });
  }
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
  $('#settingsButton').addEventListener('click',()=>{syncSettings();settingsModal.hidden=false});
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
    const map={animalGallery:gameAnimalGallery,shadow:gameShadow,feed:gameFeed,hatch:gameHatch,garden:gameGarden,rocket:gameRocket,orbits:gameOrbits,catch:gameCatch,landing:gameLanding,sort:gameSort,sizes:gameSizes,pattern:gamePattern,cups:gameCups,paint:gamePaint,stickers:gameStickers,mix:gameMix,blocks:gameBlocks,connect:gameConnect,wand:gameWand,potion:gamePotion,book:gameBook};
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
      audio.volume=kind==='voice'?.98:.92;
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
      card.setAttribute('aria-label',`${animal.name}, ${animal.type} կենդանի`);
      card.innerHTML=`
        <span class="animal-image-wrap">
          <img src="${animal.image}?v=55" alt="${animal.name}" draggable="false">
          <span class="animal-card-sheen" aria-hidden="true"></span>
        </span>
        <span class="animal-meta">
          <strong class="animal-name">${animal.name}</strong>
          <small class="animal-type animal-type--${animal.type==='ընտանի'?'domestic':'wild'}">${animal.type}</small>
        </span>`;

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

  function gameShadow(){
    const s=surface('☝️'),animals=[['🦁','lion'],['🐘','ele'],['🐇','bun']];let done=0;
    animals.forEach(([ico,key],i)=>{
      const slot=document.createElement('div');slot.className='drop-slot shadow-slot';slot.dataset.key=key;slot.style.left=`${10+i*31}%`;slot.style.top='17%';slot.innerHTML=`<span class="sil">${ico}</span>`;s.appendChild(slot);
      const p=document.createElement('div');p.className='drag-piece shadow-animal';p.dataset.key=key;p.textContent=ico;p.style.left=`${8+i*31}%`;p.style.top='68%';s.appendChild(p);
      makeDrag(p,{container:s,onDrop:()=>{if(rectOverlap(p,slot)){p.remove();slot.innerHTML=ico;slot.classList.add('good');if(++done===3)reward()}else shake(p)}});
    });
  }
  function gameFeed(){
    const s=surface('☝️'),rounds=[['🐰','🥕'],['🐵','🍌'],['🐶','🦴']];let r=0;
    const animal=document.createElement('div');animal.className='feed-animal';
    const bubble=document.createElement('div');bubble.className='feed-bubble';
    const mouth=document.createElement('div');mouth.className='feed-mouth';
    s.append(animal,bubble,mouth);
    function next(){
      $$('.food-piece',s).forEach(x=>x.remove());
      if(r>=rounds.length){reward();return}
      animal.textContent=rounds[r][0];bubble.textContent=rounds[r][1];
      ['🥕','🍌','🦴'].forEach((food,i)=>{
        const p=document.createElement('div');p.className='drag-piece food-piece';p.textContent=food;
        p.style.left=`${10+i*31}%`;p.style.top='72%';s.appendChild(p);
        const startLeft=p.style.left,startTop=p.style.top;
        makeDrag(p,{container:s,onDrop:()=>{
          if(food===rounds[r][1]&&rectOverlap(p,mouth)){
            animal.animate([{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-50%) scale(1.12)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:300});
            r++;setTimeout(next,300);
          }else{p.style.left=startLeft;p.style.top=startTop;shake(p)}
        }});
      });
    }next();
  }
  function gameHatch(){
    const s=surface('☝️'),grid=document.createElement('div');grid.className='egg-grid';s.appendChild(grid);let done=0;
    ['🐦','🐤','🦜','🦉'].forEach(bird=>{const b=document.createElement('button');b.className='egg-btn';b.innerHTML=`<span class="egg">🥚</span><span class="bird">${bird}</span>`;b.dataset.taps='0';
      b.addEventListener('click',()=>{let n=+b.dataset.taps+1;b.dataset.taps=n;if(n===1)b.querySelector('.egg').textContent='🐣';if(n>=2&&!b.classList.contains('hatched')){b.classList.add('hatched');if(++done===4)reward()}});grid.appendChild(b)})
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
    {src:'preset-gummy-bear.svg',label:'Գամիբեար արջուկ'},
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
      btn.innerHTML=`<img src="${item.src}?v=55" alt="${item.label}" draggable="false">`;
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