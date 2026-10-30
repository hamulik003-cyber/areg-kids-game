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
  let settings={master:true,music:true,voice:true,effects:true,theme:'day',font:'rounded',themeBlur:10,musicVolume:30,effectsVolume:75,voiceVolume:85,musicTrack:'default',...loadJson(SETTINGS_KEY,{})};
  if(!settings.font||settings.font==='system')settings.font='rounded';
  const STAR_RESET_V40='areg-stars-reset-v40';
  if(!localStorage.getItem(STAR_RESET_V40)){
    localStorage.setItem(STARS_KEY,'0');
    localStorage.setItem(STAR_RESET_V40,'1');
    localStorage.removeItem('areg-magic-unlocked-v1');
  }
  let stars=Number(localStorage.getItem(STARS_KEY)||0);
  const themes=[
    ['day','Օր','day.svg'],['night','Գիշեր','night.svg'],['winter','Ձմեռ','winter.svg'],['rain','Անձրև','rain.svg'],
    ['aurora','Բևեռափայլ','aurora.svg'],['wood','Փայտ','wood.svg'],['forest','Անտառ','forest.svg'],['ocean','Օվկիանոս','ocean.svg'],
    ['sunset','Մայրամուտ','sunset.svg'],['space','Տիեզերք','space.svg'],
    ['photo-user-01','Ծովային','theme-bg-ocean.svg'],
    ['photo-user-02','Փափուկ','theme-bg-fluffy.svg'],
    ['photo-user-03','Խոտ','theme-bg-grass.svg'],
    ['photo-user-04','Աշուն','theme-bg-autumn.svg'],
    ['photo-user-05','Անտառային լիճ','theme-bg-winterforest.svg'],
    ['photo-user-06','Լճափ','theme-bg-pier.svg'],
    ['photo-user-07','Լեռնային լիճ','theme-bg-mountainlake.svg'],
    ['photo-user-08','Տիեզերք՝ նկար','theme-bg-space.svg'],
    ['photo-user-09','Ձյունոտ լեռներ','theme-bg-snow.svg'],
    ['photo-user-10','Կախարդական ծառեր','theme-bg-magic.svg']
  ];
  const legacyThemeMap={
    'photo-nature':'photo-user-05','photo-mind':'photo-user-02','photo-create':'photo-user-04',
    'photo-desert':'photo-user-04','photo-space':'photo-user-08','photo-forest':'photo-user-05',
    'photo-ocean':'photo-user-01','photo-magic':'photo-user-10'
  };
  if(legacyThemeMap[settings.theme])settings.theme=legacyThemeMap[settings.theme];
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
    "dog":{voice:null,sound:null},
    "wolf":{voice:null,sound:null},
    "lynx":{voice:null,sound:null},
    "cow":{voice:null,sound:null},
    "horse":{voice:"audio/animals/horse-voice.mp3?v=106",sound:null},
    "goat":{voice:null,sound:null},
    "camel":{voice:"audio/animals/camel-voice.mp3?v=106",sound:null},
    "sheep":{voice:null,sound:null},
    "cat":{voice:null,sound:null},
    "tiger":{voice:null,sound:null},
    "donkey":{voice:null,sound:null},
    "bull":{voice:null,sound:null},
    "deer":{voice:null,sound:null},
    "bison":{voice:null,sound:null},
    "hippo":{voice:null,sound:null},
    "zebra":{voice:null,sound:null},
    "giraffe":{voice:null,sound:null},
    "elephant":{voice:null,sound:null},
    "rabbit":{voice:null,sound:null},
    "monkey":{voice:null,sound:null},
    "lion":{voice:null,sound:null},
    "bear":{voice:null,sound:null},
    "panda":{voice:null,sound:null},
    "fox":{voice:null,sound:null},
    "pig":{voice:null,sound:null},
    "rhino":{voice:null,sound:null},
    "polar-bear":{voice:null,sound:null},
    "leopard":{voice:null,sound:null},
    "hyena":{voice:null,sound:null},
    "black-panther":{voice:null,sound:null}
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

  const BIRD_AUDIO = {"magpie":{"voice":null,"sound":null},"crow":{"voice":null,"sound":null},"vulture":{"voice":null,"sound":null},"falcon":{"voice":null,"sound":null},"bald-eagle":{"voice":null,"sound":null},"lovebird":{"voice":null,"sound":null},"parrot":{"voice":null,"sound":null},"cockatiel":{"voice":null,"sound":null},"finch":{"voice":null,"sound":null},"canary":{"voice":null,"sound":null},"ostrich":{"voice":null,"sound":null},"hummingbird":{"voice":null,"sound":null},"woodpecker":{"voice":null,"sound":null},"cormorant":{"voice":null,"sound":null},"gull":{"voice":null,"sound":null},"swan":{"voice":null,"sound":null},"stork":{"voice":null,"sound":null},"owl":{"voice":null,"sound":null},"sparrow":{"voice":null,"sound":null},"swallow":{"voice":null,"sound":null},"guinea-fowl":{"voice":null,"sound":null},"peacock":{"voice":null,"sound":null},"quail":{"voice":null,"sound":null},"pigeon":{"voice":null,"sound":null},"turkey":{"voice":null,"sound":null},"goose":{"voice":null,"sound":null},"duck":{"voice":null,"sound":null},"chick":{"voice":null,"sound":null},"rooster":{"voice":null,"sound":null},"hen":{"voice":null,"sound":null}};

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



  const PLANET_BADGES={
    sun:'linear-gradient(180deg,#ffbd3f 0%,#e76b16 100%)',
    mercury:'linear-gradient(180deg,#9f9891 0%,#625b55 100%)',
    venus:'linear-gradient(180deg,#e8ad49 0%,#b86c21 100%)',
    earth:'linear-gradient(180deg,#3aa9df 0%,#2f8f58 100%)',
    moon:'linear-gradient(180deg,#aeb5bb 0%,#70777d 100%)',
    mars:'linear-gradient(180deg,#e26d4d 0%,#a83d2f 100%)',
    jupiter:'linear-gradient(180deg,#c99262 0%,#85583c 100%)',
    saturn:'linear-gradient(180deg,#d8b968 0%,#9c7740 100%)',
    uranus:'linear-gradient(180deg,#48c7d1 0%,#218d9b 100%)',
    neptune:'linear-gradient(180deg,#4c7fe8 0%,#2748aa 100%)',
    phobos:'linear-gradient(180deg,#8c7566 0%,#5d4d43 100%)',
    deimos:'linear-gradient(180deg,#9a8c81 0%,#665b54 100%)',
    io:'linear-gradient(180deg,#e5b832 0%,#c47d12 100%)',
    europa:'linear-gradient(180deg,#7fb7c9 0%,#547f94 100%)',
    ganymede:'linear-gradient(180deg,#9b836e 0%,#665346 100%)',
    callisto:'linear-gradient(180deg,#79695f 0%,#4a403b 100%)',
    titan:'linear-gradient(180deg,#dfa443 0%,#a86420 100%)',
    enceladus:'linear-gradient(180deg,#69b4d0 0%,#3b7f9c 100%)',
    titania:'linear-gradient(180deg,#819ba4 0%,#596f77 100%)',
    oberon:'linear-gradient(180deg,#76685e 0%,#4c433e 100%)',
    triton:'linear-gradient(180deg,#78a9bb 0%,#596f9d 100%)',
    charon:'linear-gradient(180deg,#7f7974 0%,#514c48 100%)',
    pluto:'linear-gradient(180deg,#c18a67 0%,#7f503b 100%)',
    ceres:'linear-gradient(180deg,#86898d 0%,#565b60 100%)',
    haumea:'linear-gradient(180deg,#8fa8b7 0%,#617783 100%)',
    makemake:'linear-gradient(180deg,#c56c4d 0%,#8b402f 100%)',
    eris:'linear-gradient(180deg,#8ca9b9 0%,#607783 100%)',
    'solar-system':'linear-gradient(180deg,#f2a83a 0%,#cf691b 100%)',
    'milky-way':'linear-gradient(180deg,#8f74e7 0%,#4d56b8 100%)',
    'black-hole':'linear-gradient(180deg,#f08b30 0%,#a43e68 100%)'
  };

  const PLANETS=[
    {id:'sun',img:'01-sun.jpg',name:'Արև',status:'Աստղ',kind:'sun',c1:'#ffd84f',c2:'#ff7b22',accent:'#ffb52f'},
    {id:'mercury',img:'02-mercury.jpg',name:'Մերկուրի',status:'Քարային մոլորակ',kind:'rock',c1:'#b8b0a7',c2:'#625b55',accent:'#aaa39b'},
    {id:'venus',img:'03-venus.jpg',name:'Վեներա',status:'Քարային մոլորակ',kind:'cloud',c1:'#f0c376',c2:'#9a6238',accent:'#e4a94f'},
    {id:'earth',img:'04-earth.jpg',name:'Երկիր',status:'Բնակելի մոլորակ',kind:'earth',c1:'#4aa0e6',c2:'#23549a',accent:'#55c981'},
    {id:'moon',img:'05-moon.jpg',name:'Լուսին',status:'Բնական արբանյակ',kind:'rock',c1:'#deded8',c2:'#77756f',accent:'#c9c9c4'},
    {id:'mars',img:'06-mars.jpg',name:'Մարս',status:'Քարային մոլորակ',kind:'rock',c1:'#d96a48',c2:'#7b2f28',accent:'#e07050'},
    {id:'jupiter',img:'07-jupiter.jpg',name:'Յուպիտեր',status:'Գազային հսկա',kind:'bands',c1:'#dbad80',c2:'#8e654b',accent:'#d8a275'},
    {id:'saturn',img:'08-saturn.jpg',name:'Սատուրն',status:'Գազային հսկա',kind:'saturn',c1:'#ead79d',c2:'#9f8557',accent:'#e4c77e'},
    {id:'uranus',img:'09-uranus.jpg',name:'Ուրան',status:'Սառցային հսկա',kind:'ring',c1:'#91e0e4',c2:'#4ca8b4',accent:'#83d8df'},
    {id:'neptune',img:'10-neptune.jpg',name:'Նեպտուն',status:'Սառցային հսկա',kind:'bands',c1:'#4b7ce3',c2:'#173e91',accent:'#5686e9'},
    {id:'phobos',img:'11-phobos.jpg',name:'Ֆոբոս',status:'Բնական արբանյակ',kind:'rock',c1:'#92847a',c2:'#534841',accent:'#9a8b82'},
    {id:'deimos',img:'12-deimos.jpg',name:'Դեյմոս',status:'Բնական արբանյակ',kind:'rock',c1:'#aa9c91',c2:'#65584f',accent:'#aea198'},
    {id:'io',img:'13-io.jpg',name:'Իո',status:'Բնական արբանյակ',kind:'spots',c1:'#eadf71',c2:'#8e8635',accent:'#e5d65f'},
    {id:'europa',img:'14-europa.jpg',name:'Եվրոպա',status:'Բնական արբանյակ',kind:'cracks',c1:'#dfd1ad',c2:'#907b5c',accent:'#dfc899'},
    {id:'ganymede',img:'15-ganymede.jpg',name:'Գանիմեդ',status:'Բնական արբանյակ',kind:'rock',c1:'#a7917c',c2:'#55473d',accent:'#a08a77'},
    {id:'callisto',img:'16-callisto.jpg',name:'Կալիստո',status:'Բնական արբանյակ',kind:'spots',c1:'#827368',c2:'#3d3430',accent:'#86766b'},
    {id:'titan',img:'17-titan.jpg',name:'Տիտան',status:'Բնական արբանյակ',kind:'haze',c1:'#dfa84e',c2:'#83521f',accent:'#e0a542'},
    {id:'enceladus',img:'18-enceladus.jpg',name:'Էնցելադուս',status:'Բնական արբանյակ',kind:'cracks',c1:'#f0fbff',c2:'#9cc8df',accent:'#dff6ff'},
    {id:'titania',img:'19-titania.jpg',name:'Տիտանիա',status:'Բնական արբանյակ',kind:'rock',c1:'#b2bfbd',c2:'#617674',accent:'#aebfbd'},
    {id:'oberon',img:'20-oberon.jpg',name:'Օբերոն',status:'Բնական արբանյակ',kind:'rock',c1:'#817f79',c2:'#44413d',accent:'#85817d'},
    {id:'triton',img:'21-triton.jpg',name:'Տրիտոն',status:'Բնական արբանյակ',kind:'ice',c1:'#c4d7da',c2:'#7d8f92',accent:'#b9d2d8'},
    {id:'charon',img:'22-charon.jpg',name:'Խարոն',status:'Բնական արբանյակ',kind:'rock',c1:'#9f9891',c2:'#514c48',accent:'#a19a94'},
    {id:'pluto',img:'23-pluto.jpg',name:'Պլուտոն',status:'Գաճաճ մոլորակ',kind:'pluto',c1:'#cda181',c2:'#6e513e',accent:'#c99a78'},
    {id:'ceres',img:'24-ceres.jpg',name:'Ցերերա',status:'Գաճաճ մոլորակ',kind:'rock',c1:'#958981',c2:'#4f4741',accent:'#978b83'},
    {id:'haumea',img:'25-haumea.jpg',name:'Հաումեա',status:'Գաճաճ մոլորակ',kind:'oval',c1:'#ddd8ca',c2:'#8f887c',accent:'#d3cec1'},
    {id:'makemake',img:'26-makemake.jpg',name:'Մակեմակե',status:'Գաճաճ մոլորակ',kind:'oval',c1:'#bd7350',c2:'#6a3928',accent:'#c47755'},
    {id:'eris',img:'27-eris.jpg',name:'Էրիս',status:'Գաճաճ մոլորակ',kind:'ice',c1:'#e7e7e7',c2:'#8b8b8b',accent:'#dedede'},
    {id:'solar-system',img:'28-solar-system.jpg',name:'Արեգակնային համակարգ',status:'Մոլորակային համակարգ',kind:'solar',c1:'#f4c341',c2:'#1d2d55',accent:'#ffc947'},
    {id:'milky-way',img:'29-milky-way.jpg',name:'Ծիր Կաթին',status:'Գալակտիկա',kind:'galaxy',c1:'#c4d1ff',c2:'#4c5d9a',accent:'#c1cdff'},
    {id:'black-hole',img:'30-black-hole.jpg',name:'Սև խոռոչ',status:'Տիեզերական օբյեկտ',kind:'blackhole',c1:'#ffb13b',c2:'#3a1c63',accent:'#ffad36'}
  ];


  const CONSTELLATION_TONES={
    indigo:{accent:'#6269b8',badge:'linear-gradient(180deg,#6574b8 0%,#35457e 100%)'},
    violet:{accent:'#7a61b7',badge:'linear-gradient(180deg,#8063b4 0%,#4c367b 100%)'},
    blue:{accent:'#4f78b5',badge:'linear-gradient(180deg,#557fb5 0%,#304f7d 100%)'},
    teal:{accent:'#4e8991',badge:'linear-gradient(180deg,#4f8990 0%,#2c5960 100%)'},
    plum:{accent:'#865784',badge:'linear-gradient(180deg,#875782 0%,#553552 100%)'},
    rose:{accent:'#98566f',badge:'linear-gradient(180deg,#985a72 0%,#603448 100%)'},
    armenia:{accent:'#8b5a8e',badge:'linear-gradient(180deg,#7a5a91 0%,#493760 100%)'}
  };

  const CONSTELLATIONS=[
    {id:'hayk-orion',img:'01-hayk-orion.jpg',name:'Հայկ (Օրիոն)',status:'Հայկական անուն',tone:'armenia'},
    {id:'ursa-major',img:'02-ursa-major.jpg',name:'Մեծ Արջ',status:'Համաստեղություն',tone:'indigo'},
    {id:'ursa-minor',img:'03-ursa-minor.jpg',name:'Փոքր Արջ',status:'Համաստեղություն',tone:'blue'},
    {id:'cassiopeia',img:'04-cassiopeia.jpg',name:'Կասիոպեա',status:'Համաստեղություն',tone:'violet'},
    {id:'andromeda',img:'05-andromeda.jpg',name:'Անդրոմեդա',status:'Համաստեղություն',tone:'plum'},
    {id:'pegasus',img:'06-pegasus.jpg',name:'Պեգաս',status:'Համաստեղություն',tone:'blue'},
    {id:'cepheus',img:'07-cepheus.jpg',name:'Ցեֆեոս',status:'Համաստեղություն',tone:'indigo'},
    {id:'draco',img:'08-draco.jpg',name:'Վիշապ',status:'Համաստեղություն',tone:'teal'},
    {id:'cygnus',img:'09-cygnus.jpg',name:'Կարապ',status:'Համաստեղություն',tone:'blue'},
    {id:'lyra',img:'10-lyra.jpg',name:'Քնար',status:'Համաստեղություն',tone:'violet'},
    {id:'leo',img:'11-leo.jpg',name:'Առյուծ',status:'Կենդանակերպ',tone:'rose'},
    {id:'cancer',img:'12-cancer.jpg',name:'Խեցգետին',status:'Կենդանակերպ',tone:'blue'},
    {id:'taurus',img:'13-taurus.jpg',name:'Ցուլ',status:'Կենդանակերպ',tone:'teal'},
    {id:'scorpius',img:'14-scorpius.jpg',name:'Կարիճ',status:'Կենդանակերպ',tone:'plum'},
    {id:'libra',img:'15-libra.jpg',name:'Կշեռք',status:'Կենդանակերպ',tone:'violet'},
    {id:'hayk-belt',img:'16-hayk-belt.jpg',name:'Հայկի գոտի',status:'Աստղաշար',tone:'armenia'},
    {id:'aquarius',img:'17-aquarius.jpg',name:'Ջրհոս',status:'Կենդանակերպ',tone:'blue'},
    {id:'virgo',img:'18-virgo.jpg',name:'Կույս',status:'Կենդանակերպ',tone:'plum'},
    {id:'gemini',img:'19-gemini.jpg',name:'Երկվորյակներ',status:'Կենդանակերպ',tone:'indigo'},
    {id:'capricornus',img:'20-capricornus.jpg',name:'Այծեղջյուր',status:'Կենդանակերպ',tone:'teal'},
    {id:'aries',img:'21-aries.jpg',name:'Խոյ',status:'Կենդանակերպ',tone:'rose'},
    {id:'pisces',img:'22-pisces.jpg',name:'Ձկներ',status:'Կենդանակերպ',tone:'blue'},
    {id:'perseus',img:'23-perseus.jpg',name:'Պերսեոս',status:'Համաստեղություն',tone:'indigo'},
    {id:'hercules',img:'24-hercules.jpg',name:'Հերկուլես (Վահագն)',status:'Հայկական անուն',tone:'armenia'},
    {id:'aquila',img:'25-aquila.jpg',name:'Արծիվ',status:'Համաստեղություն',tone:'blue'},
    {id:'delphinus',img:'26-delphinus.jpg',name:'Դելֆին',status:'Համաստեղություն',tone:'teal'},
    {id:'phoenix',img:'27-phoenix.jpg',name:'Փյունիկ',status:'Համաստեղություն',tone:'plum'},
    {id:'hydra',img:'28-hydra.jpg',name:'Հիդրա',status:'Համաստեղություն',tone:'indigo'},
    {id:'canis-major',img:'29-canis-major.jpg',name:'Մեծ շուն',status:'Համաստեղություն',tone:'blue'},
    {id:'canis-minor',img:'30-canis-minor.jpg',name:'Փոքր շուն',status:'Համաստեղություն',tone:'violet'},
    {id:'sagittarius',img:'31-sagittarius.jpg',name:'Աղեղնավոր',status:'Կենդանակերպ',tone:'rose'},
    {id:'ophiuchus',img:'32-ophiuchus.jpg',name:'Օձակիր',status:'Համաստեղություն',tone:'teal'},
    {id:'corona-borealis',img:'33-corona-borealis.jpg',name:'Հյուսիսային թագ',status:'Համաստեղություն',tone:'violet'},
    {id:'cetus',img:'34-cetus.jpg',name:'Կետ',status:'Համաստեղություն',tone:'blue'},
    {id:'monoceros',img:'35-monoceros.jpg',name:'Միաեղջյուր',status:'Համաստեղություն',tone:'plum'},
    {id:'auriga',img:'36-auriga.jpg',name:'Կառավար',status:'Համաստեղություն',tone:'indigo'},
    {id:'lupus',img:'37-lupus.jpg',name:'Գայլ',status:'Համաստեղություն',tone:'teal'},
    {id:'piscis-austrinus',img:'38-piscis-austrinus.jpg',name:'Հարավային ձուկ',status:'Համաստեղություն',tone:'blue'}
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
        {id:'planets',label:'Մոլորակներ',thumb:'space-game-1.jpg',kind:'planetGallery'},
        {id:'constellations',label:'Համաստեղություններ',thumb:'01-hayk-orion.jpg',kind:'constellationGallery'},
        {id:'space-search',label:'Գտիր ճիշտ մոլորակը',thumb:'space-game-3.jpg',kind:'spaceSearch'},
        {id:'constellation-game',label:'Գտիր ճիշտ աստղապատկերը',thumb:'space-game-4.jpg',kind:'constellationQuest'}
      ]
    },
    mind:{
      title:'Մտքի խաղեր', hero:'hero-mind.jpg', backdrop:'hero-mind.jpg',
      games:[
        {id:'puzzle',label:'Գտիր ճիշտ ձևը',thumb:'mind-game-1.jpg',kind:'mindShapesV4'},
        {id:'sizes',label:'Գտիր զույգը',thumb:'mind-game-2.jpg',kind:'mindPairs'},
        {id:'pattern',label:'Ո՞ւմ ստվերն է',thumb:'mind-game-3.jpg',kind:'pattern'},
        {id:'numbers',label:'Հավաքիր պատկերը',thumb:'mind-game-4.jpg',kind:'cups'}
      ]
    },
    create:{
      title:'Ստեղծագործություն', hero:'hero-create.jpg', backdrop:'hero-create.jpg',
      games:[
        {id:'draw-finger',label:'Մատով նկարչություն',thumb:'create-game-1.jpg',kind:'paint'},
        {id:'stickers',label:'Երաժշտական աշխարհ 3D',thumb:'create-game-2.jpg',kind:'stickers'},
        {id:'sea-battle',label:'Ծովամարտ',thumb:'create-game-4.jpg',kind:'seaBattle'},
        {id:'blocks',label:'Գաղտնի ուղիներ',thumb:'create-game-4.jpg',kind:'blocks'}
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
    // iOS installed PWA: use the visible viewport for the actual fitted stage.
    // The legacy screen.height fallback enlarged the stage and hid the star counter.
    // Keep the existing event handlers and every game unchanged.
    if(standalone&&ios&&vw<=vh){
      lw=Math.min(vw,innerWidth||vw);
      lh=Math.min(vh,innerHeight||vh);
    }
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

  /* Menu music library + independent audio mixer. This only changes audio;
     no approved Space gameplay, animation, UVs or wallet logic is modified. */
  const MUSIC_DB='areg-menu-music-v1',MUSIC_STORE='tracks';
  const DEFAULT_MENU_MUSIC=menuMusic.getAttribute('src');
  const MAX_MENU_MUSIC_BYTES=25*1024*1024;
  let customMusicUrl=null,savedMusicName='',musicContext=null,musicGain=null;
  let musicSelectionEpoch=0,audioUnlocked=false;
  const pct=(value,fallback)=>Math.max(0,Math.min(100,Number.isFinite(Number(value))?Number(value):fallback));
  const musicLevel=()=>pct(settings.musicVolume,30)*.0036;
  const effectsLevel=()=>Math.max(0,Math.min(1.55,pct(settings.effectsVolume,75)/75*1.12));
  const voiceLevel=()=>pct(settings.voiceVolume,85)/100;
  function ensureMenuMixer(){
    if(musicContext)return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    let ac;
    try{
      ac=new AC();
      const source=ac.createMediaElementSource(menuMusic);
      const gain=ac.createGain();
      source.connect(gain);gain.connect(ac.destination);
      musicContext=ac;musicGain=gain;
    }catch(error){
      try{ac?.close()}catch{}
      console.warn('AREG menu mixer fallback:',error);
    }
  }
  function updateMenuGain(){
    const target=musicLevel();
    if(musicGain&&musicContext){
      menuMusic.volume=1;
      musicGain.gain.setTargetAtTime(target,musicContext.currentTime,.045);
    }else menuMusic.volume=target;
  }
  function wantsMenuMusic(){
    return settings.master&&settings.music&&!document.hidden&&activityScreen.hidden;
  }
  async function ensureAudio(){
    if(!wantsMenuMusic()){menuMusic.pause();return}
    try{
      ensureMenuMixer();updateMenuGain();
      if(musicContext&&musicContext.state!=='running')await musicContext.resume();
      await menuMusic.play();audioUnlocked=true;
    }catch(error){console.warn('AREG menu music:',error)}
  }
  function applyAudio(){
    updateMenuGain();
    if(wantsMenuMusic())void ensureAudio();
    else menuMusic.pause();
  }
  ['pointerdown','touchend'].forEach(t=>document.addEventListener(t,()=>{if(!audioUnlocked)void ensureAudio()},{once:true,passive:true}));
  document.addEventListener('visibilitychange',()=>document.hidden?menuMusic.pause():applyAudio());
  updateMenuGain();applyAudio();

  // The selected music stays on THIS iPhone/DotKiosk in IndexedDB (Blob).
  // Never put user-provided music, stars, unlocked art or preferences on GitHub.
  function openMusicDb(){
    return new Promise((resolve,reject)=>{
      if(!window.indexedDB){reject(Error('IndexedDB unavailable'));return}
      const request=indexedDB.open(MUSIC_DB,1);
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains(MUSIC_STORE))db.createObjectStore(MUSIC_STORE);
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||Error('Music storage blocked'));
      request.onblocked=()=>reject(Error('Music storage locked'));
    });
  }
  async function readSavedMusic(){
    const db=await openMusicDb();
    try{
      return await new Promise((resolve,reject)=>{
        const request=db.transaction(MUSIC_STORE,'readonly').objectStore(MUSIC_STORE).get('menu');
        request.onsuccess=()=>resolve(request.result||null);
        request.onerror=()=>reject(request.error||Error('Music read error'));
      });
    }finally{db.close()}
  }
  function storedMusicBlob(row){
    if(!row)return null;
    if(row.blob instanceof Blob)return row.blob; // Backwards-compatible.
    if(row.bytes instanceof ArrayBuffer || ArrayBuffer.isView(row.bytes)){
      return new Blob([row.bytes],{type:row.type||'audio/mpeg'});
    }
    return null;
  }
  async function saveChosenMusic(file){
    // Safari/WKWebView can reject File/Blob structured cloning in IndexedDB.
    // A plain Uint8Array round-trips more reliably and plays via a Blob URL.
    const bytes=new Uint8Array(await file.arrayBuffer());
    const db=await openMusicDb();
    try{
      await new Promise((resolve,reject)=>{
        const tx=db.transaction(MUSIC_STORE,'readwrite');
        tx.objectStore(MUSIC_STORE).put({bytes,name:file.name,type:file.type},'menu');
        tx.oncomplete=resolve;
        tx.onerror=()=>reject(tx.error||Error('Music write error'));
        tx.onabort=()=>reject(tx.error||Error('Music storage limit'));
      });
    }finally{db.close()}
  }
  function swapMenuTrack(blob){
    const next=blob?URL.createObjectURL(blob):null;
    const previous=customMusicUrl;
    menuMusic.pause();
    menuMusic.src=next||DEFAULT_MENU_MUSIC;
    menuMusic.load();
    customMusicUrl=next;
    if(previous)URL.revokeObjectURL(previous);
    applyAudio();
  }
  const musicChoiceLabel=$('#selectedMusicLabel');
  const savedMusicButton=$('#savedMusicButton');
  function updateMusicChoice(){
    if(musicChoiceLabel)musicChoiceLabel.textContent=
      settings.musicTrack==='custom'&&savedMusicName
        ? 'Ընտրված է՝ '+savedMusicName : 'Ընտրված է՝ հիմնական երաժշտությունը';
    $('#defaultMusicButton')?.setAttribute('aria-pressed',String(settings.musicTrack!=='custom'));
    savedMusicButton?.setAttribute('aria-pressed',String(settings.musicTrack==='custom'));
    if(savedMusicButton)savedMusicButton.disabled=!savedMusicName;
  }
  function activateDefaultMusic(){
    ++musicSelectionEpoch;
    settings.musicTrack='default';saveSettings();
    swapMenuTrack(null);updateMusicChoice();
  }
  $('#defaultMusicButton')?.addEventListener('click',activateDefaultMusic);
  savedMusicButton?.addEventListener('click',async()=>{
    const epoch=++musicSelectionEpoch;
    try{
      const row=await readSavedMusic();
      if(epoch!==musicSelectionEpoch)return;
      const blob=storedMusicBlob(row);
      if(!blob)throw Error('Missing saved music');
      savedMusicName=row.name||'Իմ երաժշտությունը';
      settings.musicTrack='custom';saveSettings();
      swapMenuTrack(blob);updateMusicChoice();
    }catch{if(epoch===musicSelectionEpoch)showToast('Չհաջողվեց բացել պահված երաժշտությունը')}
  });
  const customMusicInput=$('#customMusicInput');
  customMusicInput?.addEventListener('change',async()=>{
    const file=customMusicInput.files?.[0];customMusicInput.value='';
    if(!file)return;
    if(file.size<=0||file.size>MAX_MENU_MUSIC_BYTES){
      showToast('Ընտրիր մինչև 25 ՄԲ երաժշտություն');return;
    }
    if(!/\.(mp3|m4a|aac|wav)$/i.test(file.name) &&
       !/^(audio\/mpeg|audio\/mp4|audio\/x-m4a|audio\/aac|audio\/wav|audio\/x-wav)$/i.test(file.type)){
      showToast('Ընտրիր MP3, M4A, AAC կամ WAV');return;
    }
    const epoch=++musicSelectionEpoch;
    try{
      await saveChosenMusic(file);
      if(epoch!==musicSelectionEpoch)return;
      savedMusicName=file.name;
      settings.musicTrack='custom';settings.music=true;
      saveSettings();syncSettings();
      swapMenuTrack(file);updateMusicChoice();
      showToast('✓ Երաժշտությունը պահպանված է');
    }catch(error){
      console.warn('AREG save music:',error);
      if(epoch===musicSelectionEpoch)showToast('Երաժշտությունը չի պահպանվել․ ստուգիր ազատ տեղը');
    }
  });
  const volumeKeys=[
    ['musicVolume','musicLevel','musicLevelValue'],
    ['effectsVolume','effectsLevel','effectsLevelValue'],
    ['voiceVolume','voiceLevel','voiceLevelValue']
  ];
  for(const [key,id,valueId] of volumeKeys){
    const slider=$('#'+id),value=$('#'+valueId);
    settings[key]=pct(settings[key],key==='musicVolume'?30:key==='voiceVolume'?85:75);
    if(!slider)continue;
    slider.value=String(settings[key]);
    if(value)value.textContent=Math.round(settings[key])+'%';
    slider.addEventListener('input',()=>{
      settings[key]=pct(slider.value,75);
      if(value)value.textContent=Math.round(settings[key])+'%';
      saveSettings();applyAudio();
    });
  }
  updateMusicChoice();
  const initialMusicEpoch=musicSelectionEpoch;
  readSavedMusic().then(row=>{
    if(initialMusicEpoch!==musicSelectionEpoch)return; // Don't undo a new tap.
    savedMusicName=row?.name||'';
    const blob=storedMusicBlob(row);
    if(settings.musicTrack==='custom'&&blob){
      swapMenuTrack(blob);
    }else if(settings.musicTrack==='custom'){
      settings.musicTrack='default';saveSettings();
    }
    updateMusicChoice();
  }).catch(error=>{
    console.warn('AREG local music not available:',error);
    if(initialMusicEpoch!==musicSelectionEpoch)return;
    if(settings.musicTrack==='custom'){settings.musicTrack='default';saveSettings()}
    updateMusicChoice();
  });
  // Theme selector restored from the stable menu version.
  const themeGrid=$('#themeGrid');
  if(themeGrid){
    themes.forEach(([id,label,preview])=>{
      const b=document.createElement('button');
      b.className='theme-option'; b.dataset.theme=id; b.setAttribute('aria-label',`Թեմա՝ ${label}`);
      b.innerHTML=`<img src="${preview||(`${id}.svg`)}?v=127" alt="" aria-hidden="true" draggable="false"><span>${label}</span>`;
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
    const allowed=new Set(themes.map(([id])=>id));
    if(!allowed.has(settings.theme))settings.theme='day';
    const blur=Math.max(0,Math.min(24,Number(settings.themeBlur??10)));
    settings.themeBlur=blur;
    root.dataset.theme=settings.theme||'day';
    root.style.setProperty('--theme-blur',blur+'px');
    const activeTheme=themes.find(([id])=>id===settings.theme);
    if(activeTheme&&String(activeTheme[0]).startsWith('photo-user-')){
      root.style.setProperty('--theme-photo',`url("${activeTheme[2]}?v=127")`);
      root.style.setProperty('--theme-photo-position','center');
    }else{
      root.style.removeProperty('--theme-photo');
      root.style.removeProperty('--theme-photo-position');
    }
    const blurInput=$('#themeBlur');
    const blurValue=$('#themeBlurValue');
    if(blurInput&&Number(blurInput.value)!==blur)blurInput.value=String(blur);
    if(blurValue)blurValue.textContent=String(blur);
    $$('.theme-option').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===root.dataset.theme)));
    const meta=$('meta[name="theme-color"]'),css=getComputedStyle(root),top=css.getPropertyValue('--bg-1').trim(),bottom=css.getPropertyValue('--bg-3').trim();
    const standalone=window.matchMedia?.('(display-mode: standalone)')?.matches||window.navigator.standalone===true;
    const isiOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    if(meta)meta.setAttribute('content',standalone&&isiOS&&bottom?bottom:top);
  }
  applyTheme();
  const themeBlur=$('#themeBlur');
  if(themeBlur){
    themeBlur.addEventListener('input',()=>{
      settings.themeBlur=Number(themeBlur.value);
      saveSettings();
      applyTheme();
    });
  }
  const toggles={master:$('#masterSound'),music:$('#musicSound'),voice:$('#voiceHints'),effects:$('#gameEffects')};
  function syncSettings(){Object.entries(toggles).forEach(([k,e])=>e.checked=!!settings[k])}
  syncSettings();Object.entries(toggles).forEach(([k,e])=>e.addEventListener('change',()=>{settings[k]=e.checked;saveSettings();applyAudio();root.classList.toggle('effects-off',!settings.effects)}));
  // V290 parent gate: opening sensitive home controls requires an uninterrupted
  // 1-second touch/pen/mouse/keyboard hold. A normal tap is deliberately inert.
  function requireParentHold(button,onAuthorized){
    const HOLD_MS=1000;
    let timer=0,frame=0,start=0,down=false,completed=false,pointerId=null,startX=0,startY=0;
    const clear=()=>{
      down=false;clearTimeout(timer);cancelAnimationFrame(frame);
      timer=frame=0;pointerId=null;
      button.classList.remove('parent-hold-active');
      button.style.removeProperty('--parent-hold-angle');
    };
    function progress(){
      if(!down)return;
      const ratio=Math.min(1,(performance.now()-start)/HOLD_MS);
      button.style.setProperty('--parent-hold-angle',(ratio*360)+'deg');
      frame=requestAnimationFrame(progress);
    }
    const begin=()=>{
      if(down||completed||!homeScreen||homeScreen.style.visibility==='hidden'||
         !settingsModal.hidden||!avatarModal.hidden)return;
      down=true;start=performance.now();
      button.classList.add('parent-hold-active');
      frame=requestAnimationFrame(progress);
      timer=setTimeout(()=>{
        if(!down)return;
        completed=true;
        clear();
        try{onAuthorized()}finally{completed=false}
      },HOLD_MS);
    };
    button.addEventListener('pointerdown',e=>{
      if(e.isPrimary===false||(e.pointerType==='mouse'&&e.button!==0))return;
      e.preventDefault();
      pointerId=e.pointerId;startX=e.clientX;startY=e.clientY;
      begin();
    });
    button.addEventListener('pointermove',e=>{
      if(down&&e.pointerId===pointerId&&Math.hypot(e.clientX-startX,e.clientY-startY)>18)clear();
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,clear);
    button.addEventListener('keydown',e=>{
      if((e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();begin()}
    });
    button.addEventListener('keyup',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();clear()}
    });
    button.addEventListener('contextmenu',e=>e.preventDefault());
    // Prevent click synthesis at release and old synthetic click entry.
    button.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation()},true);
    window.addEventListener('blur',clear);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});
  }
  requireParentHold($('#settingsButton'),()=>{syncSettings();applyFont();settingsModal.hidden=false});
  $$('[data-close="settings"]').forEach(e=>e.addEventListener('click',()=>settingsModal.hidden=true));
  $('#starCounter').addEventListener('click',()=>showToast(`⭐ ${stars}`));

  /* section navigation */
  // V288 five-section trial: reuse the user-liked Nature portal fade for
  // all five home tiles. Preserve every tile's DOM, geometry and artwork.
  let homeEntryTransitionActive=false;
  let restoreHomeSourceCard=null;
  let interruptHomeEntry=null;
  $$('.section-card').forEach(card=>card.addEventListener('click',()=>{
    if(homeEntryTransitionActive)return;
    openAnimatedHomeSection(card);
  }));
  $('#sectionBack').addEventListener('click',closeSection);
  $('#activityBack').addEventListener('click',backToSection);

  function fitSpaceConstellationsLabel(){
    const label=sectionGames.querySelector('.toddler-game-card[data-game="constellations"] .toddler-game-label');
    if(!label)return;
    // Enlarge actual font and compress only the text horizontally to fit the unchanged plaque.
    let text=label.querySelector('.constellations-fit-text');
    if(!text){
      text=document.createElement('span');
      text.className='constellations-fit-text';
      text.textContent='Համաստեղություններ';
      label.replaceChildren(text);
    }
    label.style.setProperty('font-size','16px','important');
    label.style.setProperty('letter-spacing','-.035em','important');
    text.style.cssText='display:inline-block;flex:0 0 auto;white-space:nowrap;max-width:none;transform-origin:center center;transform:none;';
    const css=getComputedStyle(label);
    const available=Math.max(1,label.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight)+2);
    const natural=text.getBoundingClientRect().width;
    text.style.transform='scaleX('+Math.min(1,available/Math.max(1,natural))+')';
  }

  // V245: decode the small section illustrations in a bounded warm cache.
  // Never download the heavy 3D engine or full-resolution gallery on startup.
  const sectionImageCache=new Map();
  function warmSectionImage(src){
    if(sectionImageCache.has(src))return sectionImageCache.get(src);
    const task=new Promise(resolve=>{
      const img=new Image();
      img.decoding='async';
      const done=()=>{if(img.decode)img.decode().then(()=>resolve(img)).catch(()=>resolve(img));else resolve(img)};
      img.onload=done;
      img.onerror=()=>{sectionImageCache.delete(src);resolve(null)};
      img.src=src;
    });
    sectionImageCache.set(src,task);
    return task;
  }
  function warmSectionImages(id){
    const data=SECTIONS[id];
    if(!data)return Promise.resolve([]);
    return Promise.all([data.hero,...data.games.map(g=>g.thumb)].map(warmSectionImage));
  }
  // Give the home menu its first paint before starting two common section menus.
  setTimeout(()=>warmSectionImages('nature').catch(()=>{}),950);
  setTimeout(()=>warmSectionImages('space').catch(()=>{}),1800);

  function openSection(id, beforeReveal, cinematicEntry=false){
    currentSection=id;const s=SECTIONS[id];if(!s)return;
    sectionScreen.dataset.section=id;sectionTitle.textContent=s.title;sectionHero.src=s.hero;sectionBackdrop.src=s.backdrop;
    updateStars();sectionGames.innerHTML='';
    sectionGames.classList.remove('magic-collection-grid');
    sectionScreen.classList.toggle('magic-collection-mode',id==='magic');
    // Do not switch the document to vertical pan while the home tile is flying.
    // On iPhone this can visually pull the Rewards tile upward mid-flight.
    // Enable native scrolling only after the stationary page dissolve finishes.
    if(id==='magic'&&cinematicEntry){
      document.body.classList.remove('magic-scroll-active');
      setTimeout(()=>{
        if(currentSection==='magic'&&sectionScreen.dataset.entryCrossfade!=='running')
          document.body.classList.add('magic-scroll-active');
      },1050);
    }else document.body.classList.toggle('magic-scroll-active',id==='magic');

    if(id==='magic'){
      renderMagicCollection();
    }else{
      s.games.forEach(g=>{
        const b=document.createElement('button');b.className='toddler-game-card';b.dataset.game=g.id;b.setAttribute('aria-label',g.label);
        b.innerHTML=`<img src="${g.thumb}" alt="" draggable="false"><span class="section-card-sheen game-card-sheen" aria-hidden="true"></span><span class="toddler-game-label">${g.label}</span>`;
        b.addEventListener('click',()=>openGame(s,g,b));sectionGames.appendChild(b);
      });
    }
    if(id==='nature')for(const k of ['animalGallery','birdGallery','seaGallery','insects'])warmGalleryPreviews(k,2);
    if(id==='space')for(const k of ['planetGallery','constellationGallery'])warmGalleryPreviews(k,2);
    const nav=++galleryNavigationId;
    const revealSection=()=>{
      if(nav!==galleryNavigationId||currentSection!==id)return;
      if(cinematicEntry){
        // V288: same approved Nature-look portal reveal for all 5 sections.
        // Keep the incoming page stationary and crossfade both full screens.
        // Inline important overrides legacy section transition !important.
        sectionScreen.hidden=false;
        sectionScreen.dataset.entryCrossfade='running';
        sectionScreen.dataset.entrySection=id;
        sectionScreen.style.setProperty('transition','none','important');
        sectionScreen.style.setProperty('opacity','0','important');
        // Cinematic Portal Fade: the incoming world stays perfectly fixed.
        // No rising from below, sliding sideways, or full-screen scale motion.
        sectionScreen.style.setProperty('transform','none','important');
        homeScreen.style.setProperty('transition','none','important');
        homeScreen.style.setProperty('opacity','1','important');
        // Prevent extra taps from interrupting the compositing handoff.
        homeScreen.style.pointerEvents='none';
        // The Back button must remain tappable during the incoming fade.
        // Other section controls stay locked until the transition finishes.
        sectionScreen.style.pointerEvents='none';
        $('#sectionBack').style.pointerEvents='auto';
        // Force a real 0-opacity rendered state before transition start.
        void sectionScreen.offsetWidth;
        let crossfadeStarted=false;
        const startCrossfade=()=>{
          if(crossfadeStarted||nav!==galleryNavigationId||currentSection!==id)return;
          crossfadeStarted=true;
          sectionScreen.style.setProperty('transition',
            'opacity '+HOME_SECTION_MOTION.dissolveMs+'ms cubic-bezier(.40,0,.24,1)','important');
          homeScreen.style.setProperty('transition',
            'opacity '+HOME_SECTION_MOTION.dissolveMs+'ms cubic-bezier(.40,0,.24,1)','important');
          sectionScreen.classList.add('is-visible');
          sectionScreen.style.setProperty('opacity','1','important');
          // Fit the long label on the normal animated entry path too.
          if(id==='space'){
            fitSpaceConstellationsLabel();
            if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{
              if(currentSection==='space')fitSpaceConstellationsLabel();
            });
          }
          // Keep transform fixed throughout; only alpha changes.
          sectionScreen.style.setProperty('transform','none','important');
          homeScreen.style.setProperty('opacity','0','important');
          // Count the finishing window from the ACTUAL transition start,
          // not from image-ready or initial request time.
          setTimeout(()=>{
            if(nav!==galleryNavigationId||currentSection!==id)return;
            homeScreen.style.visibility='hidden';
            // The 1040ms flying card may finish before this longer fade.
            // Restore the original source card ONLY after home is hidden.
            restoreHomeSourceCard?.();
            homeScreen.style.removeProperty('opacity');
            homeScreen.style.removeProperty('transition');
            homeScreen.style.removeProperty('pointer-events');
            sectionScreen.style.removeProperty('transition');
            sectionScreen.style.removeProperty('opacity');
            sectionScreen.style.removeProperty('transform');
            sectionScreen.style.removeProperty('pointer-events');
            $('#sectionBack').style.removeProperty('pointer-events');
            delete sectionScreen.dataset.entryCrossfade;
            delete sectionScreen.dataset.entrySection;
          },HOME_SECTION_MOTION.dissolveMs+80);
        };
        // WebKit can delay requestAnimationFrame when decoding pictures.
        // Start within a tiny guaranteed window even if a frame is throttled.
        const fallback=setTimeout(startCrossfade,45);
        requestAnimationFrame(()=>{clearTimeout(fallback);startCrossfade()});
      }else{
        homeScreen.style.visibility='hidden';sectionScreen.hidden=false;
        requestAnimationFrame(()=>{sectionScreen.classList.add('is-visible');if(id==='space'){fitSpaceConstellationsLabel();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitSpaceConstellationsLabel);}});
      }
      // Load the 3D engine only after the Space menu has become visible.
      if(id==='space')setTimeout(()=>{if(nav===galleryNavigationId&&currentSection==='space')ensureSpace3DLoaded().catch(()=>{});},900);
    };
    // For home-card animated entry, section reveal is timed to the
    // uninterrupted card flight, never stalled by a network image fetch.
    // Existing <=1150ms bounded wait remains as the nonanimated fallback.
    const warming=warmSectionImages(id);
    if(beforeReveal){
      warming.catch(()=>{});
      Promise.resolve(beforeReveal).then(revealSection,revealSection);
    }else{
      const deadline=new Promise(resolve=>setTimeout(resolve,1150));
      Promise.race([warming,deadline]).then(revealSection,revealSection);
    }
  }

  // Main section navigation ONLY; internal game cards keep existing timing.
  const HOME_SECTION_MOTION=Object.freeze({flightMs:760,returnMs:760,dissolveMs:800,leadMs:170});
  // Section-to-game navigation follows the same brisk tempo; individual
  // gallery/info card animation and audio-completion timing stay untouched.
  const INNER_SECTION_MOTION=Object.freeze({flightMs:760,returnMs:760,dissolveMs:800,leadMs:170});
  // Mind games use the same card-flight and dissolve duration as the approved section cards.
  const MIND_GAME_MOTION=INNER_SECTION_MOTION;
  const gameMotion=game=>game?.kind==='mindShapesV4'||game?.kind==='mindPairs'||game?.kind==='pattern'||game?.kind==='cups'?MIND_GAME_MOTION:INNER_SECTION_MOTION;

  // Shared motion contract for the five home tiles and all inner game tiles.
  // Keep the approved V297 1040ms flight and 1100ms screen dissolve.
  // Gallery cards are intentionally separate: their return follows audio completion.
  const SECTION_CARD_MOTION=Object.freeze({
    flightMs:1040,
    flightEasing:'cubic-bezier(.24,.20,.60,.94)',
    returnMs:1040,
    returnEasing:'cubic-bezier(.24,.20,.60,.94)',
    dissolveMs:1100
  });

  // Freeze only moving-copy text geometry: Safari must not reflow a
  // two-line title when its clone leaves the original grid/design stage.
  // No changes to the real card, animation, artwork or sound.
  function lockFlightTextLayout(sourceCard,flightCard){
    for(const selector of ['.home-card-label','.toddler-game-label','.animal-name','.animal-type']){
      const source=sourceCard.querySelector(selector);
      const target=flightCard.querySelector(selector);
      if(!source||!target)continue;
      const style=getComputedStyle(source);
      for(const prop of ['width','height','max-width','min-width','box-sizing',
        'font-family','font-size','font-weight','line-height','letter-spacing',
        'white-space','text-align','padding-left','padding-right',
        'display','align-items','justify-content']){
        target.style.setProperty(prop,style.getPropertyValue(prop),'important');
      }
      target.style.setProperty('flex-shrink','0','important');
    }
  }

  // Trial only: fly an exact visual clone of whichever of the 5 home cards
  // was pressed. Original design-stage positions are never modified.
  function openAnimatedHomeSection(card){
    if(!card||homeEntryTransitionActive)return;
    const id=card.dataset.section;
    if(!SECTIONS[id])return;
    const rect=card.getBoundingClientRect();
    if(!card.animate||!rect.width||!rect.height||
        window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){
      openSection(id);return;
    }
    homeEntryTransitionActive=true;
    const flight=document.createElement('div');
    flight.dataset.homeSectionFlight=id;
    Object.assign(flight.style,{
      position:'fixed',left:rect.left+'px',top:rect.top+'px',
      width:rect.width+'px',height:rect.height+'px',
      transformOrigin:'center center',pointerEvents:'none',
      willChange:'transform, opacity',zIndex:'2147483000'
    });
    const copy=card.cloneNode(true);
    copy.removeAttribute('data-section');
    copy.setAttribute('aria-hidden','true');
    copy.tabIndex=-1;
    Object.assign(copy.style,{
      position:'absolute',left:'0',top:'0',
      width:card.offsetWidth+'px',height:card.offsetHeight+'px',
      transformOrigin:'top left',
      transform:'scale('+(rect.width/card.offsetWidth)+')',
      pointerEvents:'none'
    });
    lockFlightTextLayout(card,copy);
    flight.appendChild(copy);
    document.body.appendChild(flight);
    const previousOpacity=card.style.opacity;
    card.style.opacity='0';
    restoreHomeSourceCard=()=>{
      card.style.opacity=previousOpacity;
      restoreHomeSourceCard=null;
    };
    let done=false;
    let safetyTimer=0;
    let flightAnimation=null;
    const restore=()=>{
      if(done)return;
      done=true;
      clearTimeout(safetyTimer);
      flight.remove();
      // When the moving card disappears at 1040ms, the two full screens are
      // still dissolving. Do not let the original tile flash back underneath.
      if(sectionScreen.dataset.entryCrossfade!=='running')
        restoreHomeSourceCard?.();
      homeEntryTransitionActive=false;
      if(interruptHomeEntry===interrupt)interruptHomeEntry=null;
    };
    const interrupt=()=>{
      // The destination page is already mounted; make it fully visible
      // before reverse navigation, without waiting for the entry dissolve.
      ++galleryNavigationId;
      flightAnimation?.cancel();
      restore();
      homeScreen.style.visibility='hidden';
      homeScreen.style.removeProperty('opacity');
      homeScreen.style.removeProperty('transition');
      homeScreen.style.removeProperty('pointer-events');
      sectionScreen.hidden=false;
      sectionScreen.classList.add('is-visible');
      for(const prop of ['transition','opacity','transform','pointer-events'])
        sectionScreen.style.removeProperty(prop);
      delete sectionScreen.dataset.entryCrossfade;
      delete sectionScreen.dataset.entrySection;
      $('#sectionBack').style.removeProperty('pointer-events');
      restoreHomeSourceCard?.();
      interruptHomeEntry=null;
    };
    interruptHomeEntry=interrupt;
    // Keep the entire artwork and Armenian title together, never move the
    // underlying menu card or its fixed positions in the 709px design stage.
    const scale=Math.max(1.1,Math.min(2.75,
      (window.innerWidth-22)/rect.width,
      (window.innerHeight-100)/rect.height));
    const dx=window.innerWidth/2-(rect.left+rect.width/2);
    const dy=window.innerHeight/2-(rect.top+rect.height/2);
    // The wide Rewards tile starts at the bottom of the home grid.
    // Limit upward travel so its entry reads as a forward zoom.
    const flightDy=id==='magic'?Math.max(-rect.height*.12,Math.min(rect.height*.12,dy)):dy;
    const destination='translate3d('+dx+'px,'+flightDy+'px,0) scale('+scale+')';
    try{
      // Single uninterrupted composite animation. Opacity fades WHILE the
      // card travels, never after a mid-flight pause or a second animation.
      flightAnimation=flight.animate([
        {transform:'translate3d(0,0,0) scale(1)',opacity:1},
        {transform:destination,opacity:0}
      ],{duration:HOME_SECTION_MOTION.flightMs,easing:SECTION_CARD_MOTION.flightEasing,fill:'forwards'});
      flightAnimation.finished.then(restore,restore);
      // All five section pages have identical gentle stationary dissolve.
      // Existing image warming/game initialization remain section-specific.
      // 230ms lead, 1100ms crossfade, 1040ms uninterrupted tile flight.
      const revealDuringFlight=new Promise(resolve=>setTimeout(resolve,HOME_SECTION_MOTION.leadMs));
      openSection(id,revealDuringFlight,true);
      safetyTimer=setTimeout(restore,1400);
    }catch(error){
      console.warn('Home section transition fallback:',id,error);
      restore();
      openSection(id);
    }
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
      b.setAttribute('aria-label',unlocked?`${item.name}, բացված է`:`${item.name}, ${item.cost} աստղ`);
      b.innerHTML=`
        <span class="magic-picture-wrap">
          <span class="magic-picture" aria-hidden="true">${item.icon}</span>
          <span class="magic-aura" aria-hidden="true"></span>
          <span class="magic-sparkle magic-sparkle--1" aria-hidden="true">✦</span>
          <span class="magic-sparkle magic-sparkle--2" aria-hidden="true">✦</span>
          <span class="magic-sparkle magic-sparkle--3" aria-hidden="true">✦</span>
        </span>
        <span class="section-card-sheen magic-card-sheen" aria-hidden="true"></span>
        <span class="magic-cost">${unlocked?'✓ Բացված է':'⭐ '+item.cost}</span>
        ${unlocked?'':'<span class="magic-lock" aria-hidden="true">🔒</span>'}
      `;
      b.addEventListener('click',()=>handleMagicItemTap(b,item));
      sectionGames.appendChild(b);
    });
  }

  function updateMagicAvailability(){
    for(const card of sectionGames.querySelectorAll('.magic-collect-card')){
      const item=MAGIC_ITEMS.find(entry=>entry.id===card.dataset.id);
      if(!item)continue;
      card.classList.toggle('can-unlock',!magicUnlocked.has(item.id)&&stars>=item.cost);
    }
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
      // A reward costs actual earned stars, paid ONCE. Do not debit
      // previously unlocked items again when they are tapped or revisited.
      const priorStars=stars;
      stars-=item.cost;
      magicUnlocked.add(item.id);
      try{
        saveStars();
        saveMagicUnlocked();
      }catch(error){
        stars=priorStars;
        magicUnlocked.delete(item.id);
        try{saveStars();saveMagicUnlocked()}catch{}
        showToast('Չհաջողվեց պահպանել։ Փորձիր նորից։');
        return;
      }
      updateStars();
      card.classList.remove('is-locked','can-unlock');
      card.classList.add('is-unlocked','just-unlocked');
      card.setAttribute('aria-label',`${item.name}, բացված է`);
      const price=$('.magic-cost',card);
      if(price)price.textContent='✓ Բացված է';
      $('.magic-lock',card)?.remove();
      updateMagicAvailability();
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

  /* V239 - decode the first gallery row before revealing its cards. */
  const GALLERY_WARM_ITEMS={
    animalGallery:ANIMALS.map(x=>x.image),
    birdGallery:BIRDS.map(x=>x.image),
    seaGallery:SEA_CREATURES.map(x=>x.image),
    insects:INSECTS.map(x=>x.image),
    planetGallery:PLANETS.map(x=>x.img),
    constellationGallery:CONSTELLATIONS.map(x=>x.img)
  };
  const galleryImagePromises=new Map();
  const GALLERY_PREVIEW_CACHE_LIMIT=40;
  function preloadGalleryPreview(file){
    const url='assets/thumbs/'+String(file).split('/').pop().replace(/\.[^.]+$/,'.webp')+'?v=238';
    if(galleryImagePromises.has(url))return galleryImagePromises.get(url);
    const task=new Promise(resolve=>{
      const img=new Image();img.decoding='async';
      img.onload=()=>{
        if(typeof img.decode==='function')img.decode().then(()=>resolve(img)).catch(()=>resolve(img.naturalWidth?img:null));
        else resolve(img);
      };
      img.onerror=()=>{galleryImagePromises.delete(url);resolve(null)};
      img.src=url;
    });
    galleryImagePromises.set(url,task);
    while(galleryImagePromises.size>GALLERY_PREVIEW_CACHE_LIMIT){
      galleryImagePromises.delete(galleryImagePromises.keys().next().value);
    }
    return task;
  }
  function warmGalleryPreviews(kind,count=8){
    const list=GALLERY_WARM_ITEMS[kind];
    return list?Promise.all(list.slice(0,count).map(preloadGalleryPreview)):Promise.resolve([]);
  }
  let galleryNavigationId=0;
  function observeGalleryUpcomingImages(wrap){
    // Reveal only decoded images, so Safari never paints a white bitmap in a card.
    wrap.querySelectorAll('img[data-full-src]').forEach(img=>{
      const reveal=()=>{
        if(!img.isConnected)return;
        const ready=()=>{if(img.isConnected&&img.naturalWidth)img.classList.add('is-decoded')};
        if(typeof img.decode==='function')img.decode().then(ready).catch(ready);
        else ready();
      };
      img.addEventListener('load',reveal,{once:true});
      if(img.complete&&img.naturalWidth)reveal();
    });
    if(!('IntersectionObserver' in window))return;
    const obs=new IntersectionObserver(entries=>{
      for(const e of entries){
        if(!e.isIntersecting)continue;
        e.target.loading='eager';
        obs.unobserve(e.target);
      }
    },{root:wrap,rootMargin:'700px 0px',threshold:0});
    wrap.querySelectorAll('img[loading="lazy"]').forEach(img=>obs.observe(img));
    gameCleanup.push(()=>obs.disconnect());
  }

  // V290 test: reverse the APPROVED portal effect when returning to the
  // previous screen. A cloned card travels smoothly from the center back to
  // its exact origin while the prior screen fades in without rising/sliding.
  let reversePortalActive=false;
  let finishReversePortalNow=null;
  function reversePortal(from,to,card,finishNavigation){
    if(reversePortalActive)return true;
    if(!card?.animate||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)return false;
    const toWasHidden=to.hidden;
    const oldVisibility=to.style.visibility;
    to.hidden=false;
    if(to===homeScreen)to.style.visibility='visible';
    if(to===sectionScreen)to.classList.add('is-visible');
    // Set the incoming screen at zero opacity at its FINAL fixed position.
    to.style.setProperty('transition','none','important');
    to.style.setProperty('opacity','0','important');
    to.style.setProperty('transform','none','important');
    const rect=card.getBoundingClientRect();
    if(!rect.width||!rect.height){
      to.hidden=toWasHidden;to.style.visibility=oldVisibility;
      for(const k of ['opacity','transform','transition'])to.style.removeProperty(k);
      return false;
    }
    reversePortalActive=true;
    const previousCardOpacity=card.style.opacity;
    // The actual destination tile MUST stay visible for the entire back fade.
    // Its original V288 forward entrance can transiently leave opacity:'0'
    // (particularly on a quick back from Magic). Remove that stale inline
    // state before the previous screen begins to fade into view.
    // IMPORTANT: preserve the user's original 2-keyframe reverse-flight
    // transform, speed and opacity unchanged. Only fix the EMPTY SOURCE SLOT.
    if(previousCardOpacity==='0')card.style.removeProperty('opacity');
    const flight=document.createElement('div');
    flight.dataset.reversePortalFlight=to===homeScreen?'home':'activity';
    Object.assign(flight.style,{
      position:'fixed',left:rect.left+'px',top:rect.top+'px',
      width:rect.width+'px',height:rect.height+'px',
      pointerEvents:'none',transformOrigin:'center center',
      willChange:'transform, opacity',zIndex:'2147483000'
    });
    const copy=card.cloneNode(true);
    copy.removeAttribute('data-section');copy.removeAttribute('data-game');
    copy.setAttribute('aria-hidden','true');copy.tabIndex=-1;
    Object.assign(copy.style,{
      position:'absolute',left:'0',top:'0',
      width:card.offsetWidth+'px',height:card.offsetHeight+'px',
      transformOrigin:'top left',
      transform:'scale('+(rect.width/card.offsetWidth)+')',
      pointerEvents:'none'
    });
    lockFlightTextLayout(card,copy);
    flight.appendChild(copy);
    document.body.appendChild(flight);
    from.style.setProperty('transition','none','important');
    from.style.setProperty('opacity','1','important');
    from.style.setProperty('transform','none','important');
    from.style.pointerEvents='none';to.style.pointerEvents='none';
    void to.offsetWidth;
    const dx=window.innerWidth/2-(rect.left+rect.width/2);
    const dy=window.innerHeight/2-(rect.top+rect.height/2);
    const returnDy=to===homeScreen&&card.dataset.section==='magic'
      ?Math.max(-rect.height*.12,Math.min(rect.height*.12,dy)):dy;
    const scale=Math.max(1.1,Math.min(2.75,
      (window.innerWidth-22)/rect.width,
      (window.innerHeight-100)/rect.height));
    let done=false,cleanupTimer=0;
    const complete=()=>{
      if(done)return;
      done=true;clearTimeout(cleanupTimer);
      from.hidden=true;
      if(from===sectionScreen)from.classList.remove('is-visible');
      if(from===activityScreen)from.classList.remove('is-visible');
      for(const screen of [from,to]){
        for(const k of ['transition','opacity','transform','pointer-events'])
          screen.style.removeProperty(k);
      }
      // Never put a stale "opacity:0" back on the destination tile:
      // it would make the slot EMPTY until the next unrelated render.
      if(previousCardOpacity==='0')card.style.removeProperty('opacity');
      else card.style.opacity=previousCardOpacity;
      flight.remove();
      reversePortalActive=false;
      finishReversePortalNow=null;
      finishNavigation();
    };
    finishReversePortalNow=complete;
    // Keep the destination Back arrow responsive even during the fade.
    const destinationBack=to===sectionScreen?$('#sectionBack'):to===activityScreen?$('#activityBack'):null;
    if(destinationBack){to.style.pointerEvents='auto';destinationBack.style.pointerEvents='auto';}
    try{
      // Nature-only trial: finish with the real destination card already
      // showing beneath the clone. Dissolve the clone before cleanup so
      // removing it cannot cause a one-frame label/bitmap snap.
      const seamlessReturn=to===homeScreen||to===sectionScreen;
      const fly=flight.animate(seamlessReturn?[
        {transform:'translate3d('+dx+'px,'+returnDy+'px,0) scale('+scale+')',opacity:0,offset:0},
        {transform:'translate3d(0,0,0) scale(1)',opacity:1,offset:.88},
        {transform:'translate3d(0,0,0) scale(1)',opacity:0,offset:1}
      ]:[
        {transform:'translate3d('+dx+'px,'+returnDy+'px,0) scale('+scale+')',opacity:0},
        {transform:'translate3d(0,0,0) scale(1)',opacity:1}
      ],{duration:to===homeScreen?HOME_SECTION_MOTION.returnMs:to===sectionScreen?gameMotion(currentGame).returnMs:SECTION_CARD_MOTION.returnMs,easing:SECTION_CARD_MOTION.returnEasing,fill:'forwards'});
      // Keep the completed hero clone through the end of the 1100ms fade
      // rather than exposing the real card while parent opacity is mid-way.
      fly.finished.catch(()=>{});
      const fade=()=>{
        if(done)return;
        to.dataset.reversePortal='running';
        const dissolveMs=to===homeScreen?HOME_SECTION_MOTION.dissolveMs:to===sectionScreen?gameMotion(currentGame).dissolveMs:SECTION_CARD_MOTION.dissolveMs;
        to.style.setProperty('transition','opacity '+dissolveMs+'ms cubic-bezier(.40,0,.24,1)','important');
        from.style.setProperty('transition','opacity '+dissolveMs+'ms cubic-bezier(.40,0,.24,1)','important');
        to.style.setProperty('opacity','1','important');
        from.style.setProperty('opacity','0','important');
        cleanupTimer=setTimeout(()=>{
          delete to.dataset.reversePortal;
          complete();
        },dissolveMs+80);
      };
      const fallback=setTimeout(fade,45);
      requestAnimationFrame(()=>{clearTimeout(fallback);fade()});
      return true;
    }catch(error){
      console.warn('Reverse portal fallback:',error);
      complete();
      return true;
    }
  }
  function closeSection(){
    if(reversePortalActive){finishReversePortalNow?.();return;}
    if(sectionScreen.hidden)return;
    if(interruptHomeEntry)interruptHomeEntry();
    ++galleryNavigationId;
    const card=$('.section-card[data-section="'+currentSection+'"]');
    if(reversePortal(sectionScreen,homeScreen,card,()=>{
      document.body.classList.remove('magic-scroll-active');
    }))return;
    document.body.classList.remove('magic-scroll-active');
    sectionScreen.classList.remove('is-visible');
    setTimeout(()=>{sectionScreen.hidden=true;homeScreen.style.visibility='visible'},180)
  }
  // V288 inner game-card pilot: same 1040ms continuously moving/fading
  // card and 1100ms stationary two-screen dissolve as the five home tiles.
  // On cold entry preserve current gallery/3D warmup before revealing a page.
  let innerGameEntryActive=false;
  let interruptInnerEntry=null;
  function beginInnerGameFlight(card,game){
    if(!card?.animate||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)return null;
    const rect=card.getBoundingClientRect();
    if(!rect.width||!rect.height)return null;
    const flight=document.createElement('div');
    flight.dataset.innerGameFlight=game.id;
    Object.assign(flight.style,{
      position:'fixed',left:rect.left+'px',top:rect.top+'px',
      width:rect.width+'px',height:rect.height+'px',transformOrigin:'center center',
      pointerEvents:'none',willChange:'transform, opacity',zIndex:'2147483000'
    });
    const copy=card.cloneNode(true);
    copy.removeAttribute('data-game');
    copy.setAttribute('aria-hidden','true');
    copy.tabIndex=-1;
    Object.assign(copy.style,{
      position:'absolute',left:'0',top:'0',
      width:card.offsetWidth+'px',height:card.offsetHeight+'px',
      transformOrigin:'top left',
      transform:'scale('+(rect.width/card.offsetWidth)+')',
      pointerEvents:'none'
    });
    lockFlightTextLayout(card,copy);
    flight.appendChild(copy);
    document.body.appendChild(flight);
    const oldOpacity=card.style.opacity;
    card.style.opacity='0';
    let restored=false;
    let flightFinished=false;
    const restoreCard=()=>{
      if(restored)return;
      restored=true;
      card.style.opacity=oldOpacity;
      innerGameEntryActive=false;
    };
    const cleanup=()=>{
      flight.remove();
      flightFinished=true;
      if(sectionScreen.hidden)restoreCard();
    };
    const dx=window.innerWidth/2-(rect.left+rect.width/2);
    const dy=window.innerHeight/2-(rect.top+rect.height/2);
    const scale=Math.max(1.1,Math.min(2.75,
      (window.innerWidth-22)/rect.width,(window.innerHeight-100)/rect.height));
    const to='translate3d('+dx+'px,'+dy+'px,0) scale('+scale+')';
    try{
      const anim=flight.animate([
        {transform:'translate3d(0,0,0) scale(1)',opacity:1},
        {transform:to,opacity:0}
      ],{duration:gameMotion(game).flightMs,easing:SECTION_CARD_MOTION.flightEasing,fill:'forwards'});
      anim.finished.then(cleanup,cleanup);
      // Not coupled to gallery/3D network readiness; no long overlay stall.
      const safety=setTimeout(cleanup,1400);
      anim.finished.then(()=>clearTimeout(safety),()=>clearTimeout(safety));
      return {restoreCard,finished:()=>flightFinished,cleanup,
        cancel:()=>{anim.cancel();cleanup();restoreCard()}};
    }catch(error){
      console.warn('Inner game flight fallback:',game.id,error);
      cleanup();
      restoreCard();
      return null;
    }
  }
  function openGame(section,game,card){
    if(innerGameEntryActive)return;
    if(game.kind==='seaBattle')battleMusicStart();
    const nav=++galleryNavigationId;
    const flight=card?beginInnerGameFlight(card,game):null;
    if(flight)innerGameEntryActive=true;
    // Permit an immediate Back tap even while the entry fade is running.
    // Invalidate all pending warmup/reveal callbacks before reversing.
    const interrupt=()=>{
      ++galleryNavigationId;
      flight?.cancel();
      // Keep both screens rendered for a valid reverse-flight card geometry.
      // Never hide the section before the Back transition locates its card.
      sectionScreen.hidden=false;
      sectionScreen.classList.add('is-visible');
      activityScreen.hidden=false;
      activityScreen.classList.add('is-visible');
      for(const screen of [activityScreen,sectionScreen]){
        for(const prop of ['transition','opacity','transform','pointer-events'])
          screen.style.removeProperty(prop);
      }
      delete activityScreen.dataset.innerGameCrossfade;
      delete activityScreen.dataset.innerGameEntry;
      $('#activityBack').style.removeProperty('pointer-events');
      innerGameEntryActive=false;
      interruptInnerEntry=null;
    };
    interruptInnerEntry=interrupt;
    const needsSpaceEngine=game.kind==='spaceSearch'||game.kind==='constellationQuest';
    const spaceEngineReady=needsSpaceEngine?(game.kind==='constellationQuest'?ensureConstellationQuestLoaded():ensureSpace3DLoaded()).catch(()=>{}):null;
    const launch=()=>{
      if(nav!==galleryNavigationId||sectionScreen.hidden){
        flight?.cleanup();flight?.restoreCard();
        if(interruptInnerEntry===interrupt)interruptInnerEntry=null;
        return;
      }
      cleanupGame();
      activityContent.classList.toggle('space-preparing',needsSpaceEngine);
      currentGame=game;activityScreen.dataset.game=game.id;
      activitySectionTitle.textContent=section.title;activityTitle.textContent=game.label;
      updateStars();
      if(!flight){
        // Unmodified fallback for reduced motion / missing WAAPI.
        sectionScreen.classList.remove('is-visible');
        setTimeout(()=>{
          if(nav!==galleryNavigationId)return;
          sectionScreen.hidden=true;activityScreen.hidden=false;
          requestAnimationFrame(()=>activityScreen.classList.add('is-visible'));
          renderGame(game);
        },150);
        return;
      }
      // The activity view is prepared INVISIBLY, at its final position.
      // No default translateY(8px) movement or hard screen cut.
      activityScreen.hidden=false;
      activityScreen.dataset.innerGameCrossfade='running';
      activityScreen.dataset.innerGameEntry=game.id;
      activityScreen.style.setProperty('transition','none','important');
      activityScreen.style.setProperty('opacity','0','important');
      activityScreen.style.setProperty('transform','none','important');
      sectionScreen.style.setProperty('transition','none','important');
      sectionScreen.style.setProperty('opacity','1','important');
      sectionScreen.style.setProperty('transform','none','important');
      sectionScreen.style.pointerEvents='none';
      // A child cannot receive taps while its parent is pointer-events:none
      // reliably in iOS Safari during crossfade. Keep the activity layer live.
      activityScreen.style.pointerEvents='auto';
      $('#activityBack').style.pointerEvents='auto';
      renderGame(game);
      void activityScreen.offsetWidth;
      let started=false;
      const start=()=>{
        if(started||nav!==galleryNavigationId)return;
        started=true;
        // Same look, timing and easing as the user-liked Nature home entry.
        activityScreen.style.setProperty('transition',
          'opacity '+gameMotion(game).dissolveMs+'ms cubic-bezier(.40,0,.24,1)','important');
        sectionScreen.style.setProperty('transition',
          'opacity '+gameMotion(game).dissolveMs+'ms cubic-bezier(.40,0,.24,1)','important');
        activityScreen.classList.add('is-visible');
        activityScreen.style.setProperty('opacity','1','important');
        sectionScreen.style.setProperty('opacity','0','important');
        setTimeout(()=>{
          if(nav!==galleryNavigationId)return;
          sectionScreen.hidden=true;
          sectionScreen.classList.remove('is-visible');
          flight.restoreCard();
          sectionScreen.style.removeProperty('opacity');
          sectionScreen.style.removeProperty('transition');
          sectionScreen.style.removeProperty('transform');
          sectionScreen.style.removeProperty('pointer-events');
          activityScreen.style.removeProperty('opacity');
          activityScreen.style.removeProperty('transition');
          activityScreen.style.removeProperty('transform');
          activityScreen.style.removeProperty('pointer-events');
          $('#activityBack').style.removeProperty('pointer-events');
          if(interruptInnerEntry===interrupt)interruptInnerEntry=null;
          delete activityScreen.dataset.innerGameCrossfade;
          delete activityScreen.dataset.innerGameEntry;
        },gameMotion(game).dissolveMs+80);
      };
      const fallback=setTimeout(start,45);
      requestAnimationFrame(()=>{clearTimeout(fallback);start()});
    };
    // Warm while the already-started card motion is flying. The incoming
    // page must not show an empty canvas on the FIRST cold Space/3D entry.
    let prep=Promise.resolve();
    if(needsSpaceEngine){
      prep=Promise.race([spaceEngineReady,new Promise(resolve=>setTimeout(resolve,3200))]);
    }else if(GALLERY_WARM_ITEMS[game.kind]){
      prep=Promise.race([warmGalleryPreviews(game.kind,4),
        new Promise(resolve=>setTimeout(resolve,1250))]);
    }
    if(flight){
      // 230ms minimum lead, without an artificial pause when resources are hot.
      Promise.all([prep,new Promise(resolve=>setTimeout(resolve,gameMotion(game).leadMs))]).then(launch,launch);
    }else prep.then(launch,launch);
  }
  function backToSection(){
    if(reversePortalActive){finishReversePortalNow?.();return;}
    if(interruptInnerEntry && !currentGame){
      interruptInnerEntry();
      activityScreen.hidden=true;activityScreen.classList.remove('is-visible');
      sectionScreen.hidden=false;sectionScreen.classList.add('is-visible');
      return;
    }
    if(activityScreen.hidden)return;
    if(interruptInnerEntry)interruptInnerEntry();
    ++galleryNavigationId;
    const leavingMindV4=currentGame?.kind==='mindShapesV4';
    const card=currentGame?sectionGames.querySelector('.toddler-game-card[data-game="'+currentGame.id+'"]'):null;
    if(reversePortal(activityScreen,sectionScreen,card,()=>{
      // Dispose 3D and gallery resources only after they have faded away.
      cleanupGame();
      // WebKit can leave a V4 forward-flight latch set if Back interrupts its
      // final callback; never lock the next Mind card after returning.
      if(leavingMindV4){innerGameEntryActive=false;card?.style.removeProperty('opacity')}
      applyAudio();
    }))return;
    cleanupGame();
    if(leavingMindV4){innerGameEntryActive=false;card?.style.removeProperty('opacity')}
    activityScreen.classList.remove('is-visible');
    setTimeout(()=>{activityScreen.hidden=true;sectionScreen.hidden=false;
      requestAnimationFrame(()=>sectionScreen.classList.add('is-visible'));applyAudio()},160);
  }
  // Star milestones are PER GAME VISIT, just like the visible 0/0 score.
  // Past visits' unfinished answers must NEVER silently earn a later star.
  const spaceCorrectCounts=Object.create(null);
  // Remove obsolete saved *answer* counters, never the earned-star wallet.
  for(const id of ['space-search','constellation-game']){
    try{localStorage.removeItem('areg-correct-'+id+'-v1')}catch{}
  }
  function resetSpaceCorrectAnswers(){
    spaceCorrectCounts['space-search']=0;
    spaceCorrectCounts['constellation-game']=0;
  }
  function cleanupGame(){
    gameCleanup.splice(0).forEach(fn=>{try{fn()}catch{}});
    resetSpaceCorrectAnswers();
    currentGame=null;
    activityContent.classList.remove('animal-gallery-mode');
    activityContent.innerHTML='';
  }
  function recordSpaceCorrectAnswer(gameId){
    if(gameId!=='space-search'&&gameId!=='constellation-game')return false;
    const count=(spaceCorrectCounts[gameId]||0)+1;
    spaceCorrectCounts[gameId]=count;
    if(count%10!==0)return false;
    stars+=1;saveStars();updateStars();return true;
  }
  function space3DContext(){
    return {activityContent,PLANETS,CONSTELLATIONS,settings,menuMusic,applyAudio,pickArmenianSpeechVoice,gameCleanup,
      awardStar(){stars+=1;saveStars();updateStars();},
      recordCorrectAnswer:recordSpaceCorrectAnswer,
      resetCorrectAnswerStreak:resetSpaceCorrectAnswers
    };
  }
  let space3DLoadPromise=null;
  function ensureSpace3DLoaded(){
    if(window.AregSpace3D)return Promise.resolve(window.AregSpace3D);
    if(!space3DLoadPromise){
      space3DLoadPromise=import('./space-3d-games.js?v=289')
        .then(()=>window.AregSpace3D)
        .catch(err=>{space3DLoadPromise=null;throw err});
    }
    return space3DLoadPromise;
  }
  let constellationQuestLoadPromise=null;
  function ensureConstellationQuestLoaded(){
    if(!constellationQuestLoadPromise){
      constellationQuestLoadPromise=import('./constellation-quest-v246.js?v=287')
        .catch(err=>{constellationQuestLoadPromise=null;throw err});
    }
    return constellationQuestLoadPromise;
  }
  function launchConstellationQuest(){
    let cancelled=false;
    gameCleanup.push(()=>{cancelled=true});
    ensureConstellationQuestLoaded().then(api=>{
      if(cancelled||activityScreen.hidden||activityScreen.dataset.game!=='constellation-game')return;
      if(typeof api.startConstellationQuest==='function')api.startConstellationQuest(space3DContext());
    }).catch(()=>{if(!cancelled)showToast('Համաստեղության խաղը չբեռնվեց')});
  }
  function launchSpace3D(name){
    let started=false;
    const run=()=>{
      if(started)return true;
      const api=window.AregSpace3D;
      if(api&&typeof api[name]==='function'){
        started=true;
        clearTimeout(run.timer);
        api[name](space3DContext());
        return true;
      }
      return false;
    };
    if(run())return;
    showToast('3D բեռնում…');
    run.timer=setTimeout(()=>{if(!started)showToast('3D-ը չբեռնվեց')},8000);
    ensureSpace3DLoaded().then(run).catch(()=>{clearTimeout(run.timer);if(!started)showToast('3D-ը չբեռնվեց')});
    gameCleanup.push(()=>{started=true;clearTimeout(run.timer)});
  }
  function renderGame(g){
    menuMusic.pause();
    const map={animalGallery:gameAnimalGallery,birdGallery:gameBirdGallery,seaGallery:gameSeaGallery,insects:gameInsectGallery,planetGallery:gamePlanetGallery,constellationGallery:gameConstellationGallery,spaceSearch:()=>launchSpace3D('spaceSearch'),constellationQuest:launchConstellationQuest,shadow:gameShadow,feed:gameFeed,hatch:gameHatch,garden:gameGarden,rocket:gameRocket,orbits:gameOrbits,catch:gameCatch,landing:gameLanding,mindShapesV4:gameMindShapesV4,mindPairs:gameMindPairs,colorBlast:gameColorBlast,sort:gameSort,sizes:gameSizes,pattern:gameMindShadow3D,cups:gameCups,paint:gamePaint,drawColor:gameDrawColor,stickers:gameStickers,mix:gameMix,blocks:gameBlocks,seaBattle:gameSeaBattle,connect:gameConnect,wand:gameWand,potion:gamePotion,book:gameBook};
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

  function signedAudioExpired(src){
    try{
      const token=new URL(src,location.href).searchParams.get('_jwt');
      if(!token)return false;
      let payload=token.split('.')[1]||'';
      payload=payload.replace(/-/g,'+').replace(/_/g,'/');
      while(payload.length%4)payload+='=';
      const data=JSON.parse(atob(payload));
      return Number.isFinite(data.exp)&&data.exp<=Math.floor(Date.now()/1000)+20;
    }catch{return false}
  }

  function pickArmenianSpeechVoice(){
    try{
      const voices=speechSynthesis.getVoices?.()||[];
      const hy=voices.filter(v=>/^hy(?:-|_|$)/i.test(v.lang||''));
      if(hy.length){
        const preferred=hy.find(v=>/female|woman|anna|anahit|mariam|nare|հայ/i.test(v.name||''));
        return preferred||hy[0];
      }
      return voices.find(v=>/armenian|հայ/i.test((v.name||'')+' '+(v.lang||'')))||null;
    }catch{return null}
  }

  function playAnimalClip(src,kind,token){
    return new Promise(resolve=>{
      if(!src||token!==animalPlaybackToken||signedAudioExpired(src)){resolve(false);return}
      const audio=new Audio();
      audio.preload='auto';
      audio.playsInline=true;
      audio.src=src;
      audio.volume=kind==='voice'?voiceLevel():Math.min(1,.50*effectsLevel());
      if(kind==='voice')animalVoicePlayer=audio;else animalSoundPlayer=audio;
      let settled=false,started=false;
      const finish=(ok)=>{
        if(settled)return;
        settled=true;
        clearTimeout(startTimer);clearTimeout(endTimer);
        audio.onplaying=audio.onended=audio.onerror=audio.onabort=null;
        if(!ok){try{audio.pause();audio.currentTime=0}catch{}}
        resolve(ok);
      };
      audio.onplaying=()=>{started=true;clearTimeout(startTimer)};
      audio.onended=()=>finish(true);
      audio.onerror=()=>finish(false);
      audio.onabort=()=>finish(false);
      const startTimer=setTimeout(()=>{if(!started)finish(false)},1100);
      const endTimer=setTimeout(()=>finish(false),kind==='voice'?7000:5200);
      try{audio.load()}catch{}
      const p=audio.play();
      if(p&&p.catch)p.catch(()=>finish(false));
    });
  }

  function speakAnimalFallback(animal,token){
    if(!settings.master||!settings.voice||!('speechSynthesis' in window)||token!==animalPlaybackToken)return Promise.resolve(false);
    return new Promise(resolve=>{
      let settled=false,voicesTimer=null,finishTimer=null;
      const finish=(ok)=>{
        if(settled)return;
        settled=true;
        clearTimeout(voicesTimer);clearTimeout(finishTimer);
        resolve(ok);
      };
      const speak=()=>{
        if(settled||token!==animalPlaybackToken){finish(false);return}
        try{
          speechSynthesis.cancel();
          const utter=new SpeechSynthesisUtterance(`${animal.name}՝ ${animal.type==='ընտանի'?'ընտանի':'վայրի'} կենդանի է։`);
          utter.lang='hy-AM';
          utter.rate=.88;
          utter.pitch=1.04;
          utter.volume=voiceLevel();
          const voice=pickArmenianSpeechVoice();
          if(voice)utter.voice=voice;
          utter.onend=()=>finish(true);
          utter.onerror=()=>finish(false);
          speechSynthesis.resume?.();
          speechSynthesis.speak(utter);
          finishTimer=setTimeout(()=>finish(false),6500);
        }catch{finish(false)}
      };
      const voices=speechSynthesis.getVoices?.()||[];
      if(voices.length)speak();
      else{
        const onVoices=()=>{speechSynthesis.removeEventListener?.('voiceschanged',onVoices);speak()};
        speechSynthesis.addEventListener?.('voiceschanged',onVoices,{once:true});
        voicesTimer=setTimeout(()=>{speechSynthesis.removeEventListener?.('voiceschanged',onVoices);speak()},450);
      }
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
        if(!ok)await speakAnimalFallback(animal,token);
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

  /* V238: tiny display asset while keeping untouched, full-resolution images
     for the zoom overlay. Never make 191 heavy full-size requests at once. */
  function galleryThumbnail(src){
    return 'assets/thumbs/'+String(src).split('/').pop().replace(/\.[^.]+$/,'.webp');
  }
  /* V239: never replace a rendered preview src in-place. WebKit may clear
     its decoded bitmap while the 4K original arrives, making a white flash.
     Render the full photo above the preview only after decoding is complete. */
  function promoteGalleryZoomPicture(original,previewCard,state){
    const wrap=previewCard?.querySelector('.animal-image-wrap');
    const preview=wrap?.querySelector('img');
    if(!original||!wrap||!preview||state.cancelled)return;
    const full=new Image();
    full.className='gallery-hires-layer';
    full.alt=preview.alt;
    full.decoding='async';full.loading='eager';full.draggable=false;
    full.style.objectFit=getComputedStyle(preview).objectFit;
    const reveal=()=>{
      if(activeGalleryPresentation!==state||state.cancelled||state.phase!=='arrived')return;
      if(!full.naturalWidth||!full.naturalHeight)return;
      wrap.appendChild(full);
      requestAnimationFrame(()=>{
        if(activeGalleryPresentation===state&&!state.cancelled&&state.phase==='arrived')
          full.classList.add('is-ready');
      });
    };
    full.src=original;
    if(typeof full.decode==='function')full.decode().then(reveal).catch(()=>{});
    else full.onload=reveal;
  }

  function galleryNameSize(name){
    const compact=String(name||'').trim().replace(/\s+/g,'');
    const n=Array.from(compact).length;
    const words=String(name||'').trim().split(/\s+/).filter(Boolean).length;
    if(n>=20)return '10.6px';
    if(n>=17)return '11.4px';
    if(n>=14)return '12.4px';
    if(n>=11)return '13.7px';
    if(n>=9||words>=2)return '14.8px';
    return '16.5px';
  }

  function galleryTypeSize(type){
    const n=Array.from(String(type||'').replace(/\s+/g,'')).length;
    if(n>=13)return '10.2px';
    if(n>=10)return '10.8px';
    if(n>=8)return '11.4px';
    return '12.4px';
  }

  function hardCenterGalleryCard(card){
    const name=card.querySelector('.animal-name');
    const type=card.querySelector('.animal-type');
    if(name){
      card.style.setProperty('--animal-name-size',galleryNameSize(name.textContent));
    }
    if(type){
      card.style.setProperty('--animal-type-size',galleryTypeSize(type.textContent));
    }
  }

  let activeGalleryPresentation=null;

  function cancelGalleryCardPresentation(){
    const state=activeGalleryPresentation;
    if(!state)return;
    state.cancelled=true;
    try{state.animation?.cancel()}catch{}
    try{state.host?.remove()}catch{}
    try{
      state.original?.style.removeProperty('opacity');
      state.original?.style.removeProperty('pointer-events');
    }catch{}
    activeGalleryPresentation=null;
  }

  async function presentGalleryCard(card,runSequence,stopSequence){
    if(!card||typeof runSequence!=='function')return;
    cancelGalleryCardPresentation();

    const rect=card.getBoundingClientRect();
    if(!rect.width||!rect.height){
      await runSequence(card);
      return;
    }

    const host=document.createElement('div');
    // Keep the source gallery's CSS context on the flight host.
    // In Constellations the original picture uses object-fit:contain;
    // losing this parent class changes it to cover during the flight,
    // producing the visible resize when returning to the grid.
    const sourceGallery=card.closest('.animal-gallery');
    host.className=(sourceGallery?.className||'animal-gallery')+' gallery-card-flight-host';
    host.setAttribute('aria-hidden','true');

    const shell=document.createElement('div');
    shell.className='gallery-card-flight-shell';
    shell.style.setProperty('left',rect.left+'px');
    shell.style.setProperty('top',rect.top+'px');
    shell.style.setProperty('width',rect.width+'px');
    shell.style.setProperty('height',rect.height+'px');

    const accent=getComputedStyle(card).getPropertyValue('--animal-accent').trim();
    const accentSoft=getComputedStyle(card).getPropertyValue('--animal-accent-soft').trim();
    if(accent)shell.style.setProperty('--animal-accent',accent);
    if(accentSoft)shell.style.setProperty('--animal-accent-soft',accentSoft);

    const originalImage=card.querySelector('.animal-image-wrap img');
    if(originalImage&&(!originalImage.complete||originalImage.naturalWidth===0)){
      try{await originalImage.decode()}catch{return}
    }
    if(originalImage?.naturalWidth)originalImage.classList.add('is-decoded');
    if(!card.isConnected)return;
    const clone=card.cloneNode(true);
    lockFlightTextLayout(card,clone);
    const cloneImage=clone.querySelector('.animal-image-wrap img');
    if(cloneImage){
      cloneImage.loading='eager';
      // Predecode the flight image before hiding the original card.
      try{await cloneImage.decode()}catch{return}
    }
    if(!card.isConnected)return;
    clone.classList.remove('animal-card--pressing','animal-card--focus','animal-card--speaking');
    clone.tabIndex=-1;
    clone.style.setProperty('width','100%','important');
    clone.style.setProperty('height','100%','important');
    clone.style.setProperty('min-height','0','important');
    clone.style.setProperty('max-height','none','important');
    clone.style.setProperty('pointer-events','none','important');
    shell.appendChild(clone);
    host.appendChild(shell);
    document.body.appendChild(host);

    let dismissResolve=null;
    let dismissRequested=false;
    const dismissPromise=new Promise(resolve=>{dismissResolve=resolve});
    const dismissPresentation=()=>{
      if(dismissRequested)return;
      dismissRequested=true;
      try{if(typeof stopSequence==='function')stopSequence()}catch{}
      try{dismissResolve?.('dismissed')}catch{}
    };
    host.addEventListener('click',()=>{
      dismissPresentation();
    });

    card.style.setProperty('opacity','0','important');
    card.style.setProperty('pointer-events','none','important');

    const vw=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);
    const vh=Math.max(document.documentElement.clientHeight||0,window.innerHeight||0);
    const scale=Math.min(1.80,(vw-34)/rect.width,(vh-128)/rect.height);
    const targetLeft=(vw-rect.width)/2;
    const targetTop=Math.max(70,(vh-rect.height)/2-8);
    const tx=targetLeft-rect.left;
    const ty=targetTop-rect.top;

    const endTransform='translate3d('+tx+'px,'+ty+'px,0) scale('+scale+') rotateY(0deg) rotateZ(0deg)';
    const state={host,shell,original:card,clone,cancelled:false,animation:null,endTransform,phase:'flying'};
    activeGalleryPresentation=state;
    host.classList.add('gallery-card-flight-host--visible');

    if(shell.animate){
      const midTransform='translate3d('+(tx*.55)+'px,'+(ty*.55)+'px,0) scale('+(1+(scale-1)*.48)+') rotateY(-7deg) rotateZ(1.4deg)';
      const enter=shell.animate([
        {transform:'translate3d(0,0,0) scale(1) rotateY(0deg) rotateZ(0deg)',offset:0},
        {transform:midTransform,offset:.52},
        {transform:endTransform,offset:1}
      ],{
        duration:560,
        easing:'cubic-bezier(.20,.78,.20,1)',
        fill:'forwards'
      });
      state.animation=enter;
      try{await enter.finished}catch{}
      if(state.cancelled)return;
      shell.style.transform=endTransform;
      try{enter.cancel()}catch{}
      state.animation=null;
    }else{
      shell.style.transform=endTransform;
      await new Promise(r=>setTimeout(r,560));
      if(state.cancelled)return;
    }

    shell.classList.add('gallery-card-flight-shell--arrived');
    state.phase='arrived';
    promoteGalleryZoomPicture(card.querySelector('img')?.dataset.fullSrc,clone,state);
    await new Promise(r=>setTimeout(r,90));
    if(state.cancelled)return;

    try{
      await Promise.race([
        Promise.resolve().then(()=>runSequence(clone)),
        dismissPromise
      ]);
    }finally{
      if(state.cancelled)return;
      state.phase='exiting';
      shell.classList.remove('gallery-card-flight-shell--arrived');
      await new Promise(r=>setTimeout(r,110));
      if(state.cancelled)return;

      if(shell.animate){
        const midBack='translate3d('+(tx*.42)+'px,'+(ty*.42)+'px,0) scale('+(1+(scale-1)*.36)+') rotateY(6deg) rotateZ(-1.1deg)';
        const exit=shell.animate([
          {transform:endTransform,offset:0},
          {transform:midBack,offset:.52},
          {transform:'translate3d(0,0,0) scale(1) rotateY(0deg) rotateZ(0deg)',offset:1}
        ],{
          duration:500,
          easing:'cubic-bezier(.30,0,.18,1)',
          fill:'forwards'
        });
        state.animation=exit;
        try{await exit.finished}catch{}
      }else{
        shell.style.transform='translate3d(0,0,0) scale(1)';
        await new Promise(r=>setTimeout(r,500));
      }

      if(activeGalleryPresentation===state){
        host.classList.remove('gallery-card-flight-host--visible');
        try{host.remove()}catch{}
        card.style.removeProperty('opacity');
        card.style.removeProperty('pointer-events');
        activeGalleryPresentation=null;
      }
    }
  }

  function gameAnimalGallery(){
    // V232: no 60-clip background audio storm on iPhone; play on tap.
    activityContent.innerHTML='';
    activityContent.classList.add('animal-gallery-mode');

    const wrap=document.createElement('div');
    wrap.className='animal-gallery';
    wrap.setAttribute('aria-label','Կենդանիների պատկերասրահ');
    // AREG TEST only: CSS-drawn slow ambient shapes behind animal cards.
    const ambient=document.createElement('div');
    ambient.className='areg-animal-ambient';
    ambient.setAttribute('aria-hidden','true');
    // Each particle occupies a separate grid cell. Reassign free cells only while invisible.
    const bokehCount=24, bokehCols=4, bokehRows=8;
    const bokehCells=Array.from({length:bokehCols*bokehRows},(_,i)=>i);
    const shuffleCells=()=>{for(let i=bokehCells.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bokehCells[i],bokehCells[j]]=[bokehCells[j],bokehCells[i]]}};
    shuffleCells();
    const occupied=new Map();
    const directions=[[22,-18],[-22,-16],[18,20],[-19,19],[24,4],[-24,-5],[5,-24],[-6,24]];
    const assignCell=(particle,index,cell)=>{
      const col=cell%bokehCols,row=Math.floor(cell/bokehCols);
      const [dx,dy]=directions[(index+Math.floor(Math.random()*directions.length))%directions.length];
      particle.style.setProperty('--ax',(12+col*24)+'%');
      particle.style.setProperty('--ay',(8+row*12)+'%');
      particle.style.setProperty('--dx',dx+'px');
      particle.style.setProperty('--dy',dy+'px');
      occupied.set(particle,cell);
    };
    for(let i=0;i<bokehCount;i++){
      const particle=document.createElement('span');
      particle.className='areg-animal-particle areg-animal-bokeh';
      particle.style.setProperty('--as',([48,36,25,15][Math.floor(i/6)]+(i%3)*2)+'px');
      particle.style.setProperty('--ad',(15+(i%7)*1.7)+'s');
      particle.style.setProperty('--al',(-i*.5)+'s');
      particle.style.setProperty('--bokeh-hue',([0,40,95,160,215,285][i%6])+'deg');
      assignCell(particle,i,bokehCells[i]);
      particle.addEventListener('animationiteration',()=>{
        const taken=new Set(occupied.values());
        taken.delete(occupied.get(particle));
        const free=bokehCells.filter(cell=>!taken.has(cell)&&cell!==occupied.get(particle));
        if(free.length)assignCell(particle,i,free[Math.floor(Math.random()*free.length)]);
      });
      ambient.appendChild(particle);
    }
    // Keep ambient outside the scrollable gallery so it stays visible at every scroll depth.


    ANIMALS.forEach((animal,cardIndex)=>{
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
          <img src="${galleryThumbnail(animal.image)}?v=238" data-full-src="${animal.image}?v=93" loading="${cardIndex<8?'eager':'lazy'}" fetchpriority="${cardIndex<4?'high':'auto'}" decoding="async" alt="${animal.name}" draggable="false">
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
        if(shouldPlay)presentGalleryCard(card,clone=>playAnimalSequence(animal,clone),()=>stopAnimalPlayback({restoreMusic:true}));
      });
      card.addEventListener('pointercancel',()=>{
        downPointer=null;moved=true;card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('pointerleave',()=>{
        if(downPointer!==null)card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('click',e=>{
        if(e.detail===0)presentGalleryCard(card,clone=>playAnimalSequence(animal,clone),()=>stopAnimalPlayback({restoreMusic:true}));
      });

      wrap.appendChild(card);
    });

    activityContent.appendChild(ambient);
    activityContent.appendChild(wrap);
    observeGalleryUpcomingImages(wrap);

    gameCleanup.push(()=>{
      cancelGalleryCardPresentation();
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
      if(!src||token!==birdPlaybackToken||signedAudioExpired(src)){resolve(false);return}
      const audio=new Audio();
      audio.preload='auto';
      audio.playsInline=true;
      audio.src=src;
      audio.volume=kind==='voice'?voiceLevel():Math.min(1,.50*effectsLevel());
      if(kind==='voice')birdVoicePlayer=audio;else birdSoundPlayer=audio;
      let settled=false,started=false;
      const finish=(ok)=>{
        if(settled)return;
        settled=true;
        clearTimeout(startTimer);clearTimeout(endTimer);
        audio.onplaying=audio.onended=audio.onerror=audio.onabort=null;
        if(!ok){try{audio.pause();audio.currentTime=0}catch{}}
        resolve(ok);
      };
      audio.onplaying=()=>{started=true;clearTimeout(startTimer)};
      audio.onended=()=>finish(true);
      audio.onerror=()=>finish(false);
      audio.onabort=()=>finish(false);
      const startTimer=setTimeout(()=>{if(!started)finish(false)},1100);
      const endTimer=setTimeout(()=>finish(false),kind==='voice'?7000:4800);
      try{audio.load()}catch{}
      const p=audio.play();
      if(p&&p.catch)p.catch(()=>finish(false));
    });
  }

  function speakBirdFallback(bird,token){
    if(!settings.master||!settings.voice||!('speechSynthesis' in window)||token!==birdPlaybackToken)return Promise.resolve(false);
    return new Promise(resolve=>{
      let settled=false,voicesTimer=null,finishTimer=null;
      const finish=(ok)=>{
        if(settled)return;
        settled=true;
        clearTimeout(voicesTimer);clearTimeout(finishTimer);
        resolve(ok);
      };
      const speak=()=>{
        if(settled||token!==birdPlaybackToken){finish(false);return}
        try{
          speechSynthesis.cancel();
          const utter=new SpeechSynthesisUtterance(`${bird.name}՝ ${bird.type==='ընտանի'?'ընտանի':'վայրի'} թռչուն է։`);
          utter.lang='hy-AM';
          utter.rate=.88;
          utter.pitch=1.04;
          utter.volume=voiceLevel();
          const voice=pickArmenianSpeechVoice();
          if(voice)utter.voice=voice;
          utter.onend=()=>finish(true);
          utter.onerror=()=>finish(false);
          speechSynthesis.resume?.();
          speechSynthesis.speak(utter);
          finishTimer=setTimeout(()=>finish(false),6500);
        }catch{finish(false)}
      };
      const voices=speechSynthesis.getVoices?.()||[];
      if(voices.length)speak();
      else{
        const onVoices=()=>{speechSynthesis.removeEventListener?.('voiceschanged',onVoices);speak()};
        speechSynthesis.addEventListener?.('voiceschanged',onVoices,{once:true});
        voicesTimer=setTimeout(()=>{speechSynthesis.removeEventListener?.('voiceschanged',onVoices);speak()},450);
      }
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
        if(!ok)await speakBirdFallback(bird,token);
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
    // V232: avoid 60 more remote audio downloads while opening cards.
    activityContent.innerHTML='';
    activityContent.classList.add('animal-gallery-mode');

    const wrap=document.createElement('div');
    wrap.className='animal-gallery';
    wrap.setAttribute('aria-label','Թռչունների պատկերասրահ');

    BIRDS.forEach((bird,cardIndex)=>{
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
          <img src="${galleryThumbnail(bird.image)}?v=238" data-full-src="${bird.image}?v=93" loading="${cardIndex<8?'eager':'lazy'}" fetchpriority="${cardIndex<4?'high':'auto'}" decoding="async" alt="${bird.name}" draggable="false">
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
        if(shouldPlay)presentGalleryCard(card,clone=>playBirdSequence(bird,clone),()=>stopBirdPlayback({restoreMusic:true}));
      });
      card.addEventListener('pointercancel',()=>{
        downPointer=null;moved=true;card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('pointerleave',()=>{
        if(downPointer!==null)card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('click',e=>{
        if(e.detail===0)presentGalleryCard(card,clone=>playBirdSequence(bird,clone),()=>stopBirdPlayback({restoreMusic:true}));
      });

      wrap.appendChild(card);
    });

    activityContent.appendChild(wrap);
    observeGalleryUpcomingImages(wrap);

    gameCleanup.push(()=>{
      cancelGalleryCardPresentation();
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
        utter.volume=.98*voiceLevel();
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

    SEA_CREATURES.forEach((creature,cardIndex)=>{
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
          <img src="${galleryThumbnail(creature.image)}?v=238" data-full-src="${creature.image}?v=93" loading="${cardIndex<8?'eager':'lazy'}" fetchpriority="${cardIndex<4?'high':'auto'}" decoding="async" alt="${creature.name}" draggable="false">
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
        if(shouldPlay)presentGalleryCard(card,clone=>playSeaSequence(creature,clone),()=>stopSeaPlayback({restoreMusic:true}));
      });
      card.addEventListener('pointercancel',()=>{
        downPointer=null;moved=true;card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('pointerleave',()=>{
        if(downPointer!==null)card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('click',e=>{
        if(e.detail===0)presentGalleryCard(card,clone=>playSeaSequence(creature,clone),()=>stopSeaPlayback({restoreMusic:true}));
      });

      wrap.appendChild(card);
    });

    activityContent.appendChild(wrap);
    observeGalleryUpcomingImages(wrap);

    gameCleanup.push(()=>{
      cancelGalleryCardPresentation();
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
        utter.volume=.98*voiceLevel();
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

    INSECTS.forEach((insect,cardIndex)=>{
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
          <img src="${galleryThumbnail(insect.image)}?v=238" data-full-src="${insect.image}?v=93" loading="${cardIndex<8?'eager':'lazy'}" fetchpriority="${cardIndex<4?'high':'auto'}" decoding="async" alt="${insect.name}" draggable="false">
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
        if(shouldPlay)presentGalleryCard(card,clone=>playInsectSequence(insect,clone),()=>stopInsectPlayback({restoreMusic:true}));
      });
      card.addEventListener('pointercancel',()=>{
        downPointer=null;moved=true;card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('pointerleave',()=>{
        if(downPointer!==null)card.classList.remove('animal-card--pressing');
      });
      card.addEventListener('click',e=>{
        if(e.detail===0)presentGalleryCard(card,clone=>playInsectSequence(insect,clone),()=>stopInsectPlayback({restoreMusic:true}));
      });

      wrap.appendChild(card);
    });

    activityContent.appendChild(wrap);
    observeGalleryUpcomingImages(wrap);

    gameCleanup.push(()=>{
      cancelGalleryCardPresentation();
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


  /* PLANETS GALLERY — same card/presentation system as Animals */
  let planetPlaybackToken=0;
  let activePlanetCard=null;

  function stopPlanetPlayback({restoreMusic=true}={}){
    planetPlaybackToken++;
    try{speechSynthesis?.cancel()}catch{}
    if(activePlanetCard){
      activePlanetCard.classList.remove('animal-card--pressing','animal-card--focus','animal-card--speaking');
      activePlanetCard=null;
    }
    if(restoreMusic&&settings.master&&settings.music)applyAudio();
  }

  function planetArt(p){
    const stars='<g fill="%23fff" opacity=".72"><circle cx="85" cy="115" r="4"/><circle cx="165" cy="70" r="3"/><circle cx="785" cy="140" r="5"/><circle cx="690" cy="250" r="3"/><circle cx="105" cy="760" r="3"/><circle cx="790" cy="720" r="4"/><circle cx="620" cy="85" r="2"/><circle cx="260" cy="800" r="4"/></g>';
    const defs='<defs><radialGradient id="bg"><stop stop-color="%231d315e"/><stop offset="1" stop-color="%23050a18"/></radialGradient><radialGradient id="p" cx=".35" cy=".3"><stop stop-color="'+p.c1+'"/><stop offset="1" stop-color="'+p.c2+'"/></radialGradient></defs>';
    let body='';
    if(p.kind==='sun'){
      let rays='';for(let i=0;i<18;i++){const a=i*20*Math.PI/180;rays+='<path d="M'+(Math.cos(a)*250).toFixed(1)+' '+(Math.sin(a)*250).toFixed(1)+' L'+(Math.cos(a)*330).toFixed(1)+' '+(Math.sin(a)*330).toFixed(1)+'"/>'}
      body='<g transform="translate(450 450)"><g stroke="%23ffb52f" stroke-width="24" stroke-linecap="round" opacity=".82">'+rays+'</g><circle r="235" fill="url(%23p)"/><circle r="180" fill="%23ffd85f" opacity=".20"/></g>';
    }else if(p.kind==='saturn'){
      body='<g transform="translate(450 450) rotate(-14)"><ellipse rx="330" ry="95" fill="none" stroke="%23dccb9a" stroke-width="36" opacity=".9"/><ellipse rx="275" ry="75" fill="none" stroke="%238d7b52" stroke-width="12" opacity=".85"/><circle r="210" fill="url(%23p)"/><path d="M-180-60h360M-195 5h390M-170 75h340" stroke="%23b49c67" stroke-width="18" opacity=".65"/></g>';
    }else if(p.kind==='ring'){
      body='<g transform="translate(450 450) rotate(-12)"><ellipse rx="300" ry="74" fill="none" stroke="%23b7eef0" stroke-width="18" opacity=".76"/><circle r="205" fill="url(%23p)"/></g>';
    }else if(p.kind==='earth'){
      body='<g transform="translate(450 450)"><circle r="230" fill="url(%23p)"/><g fill="%2372b55c"><path d="M-150-60c55-85 130-105 185-70 26 17 25 51-9 72-47 30-59 73-43 123-55 12-107-8-133-55Z"/><path d="M75-25c62-35 120-7 136 43 14 43-15 74-56 79-17 38-56 65-93 43 22-46 9-87-14-118Z"/></g><path d="M-210 55c100 36 220 34 415-2" fill="none" stroke="%23fff" stroke-width="16" opacity=".30"/></g>';
    }else if(p.kind==='bands'){
      body='<g transform="translate(450 450)"><circle r="230" fill="url(%23p)"/><clipPath id="c"><circle r="230"/></clipPath><g clip-path="url(%23c)" fill="none" stroke="%23f3dfc1" opacity=".50"><path d="M-250-115h500" stroke-width="34"/><path d="M-250-35h500" stroke-width="18"/><path d="M-250 55h500" stroke-width="42"/><path d="M-250 135h500" stroke-width="22"/></g></g>';
    }else if(p.kind==='spots'){
      body='<g transform="translate(450 450)"><circle r="220" fill="url(%23p)"/><g fill="%2354493c" opacity=".55"><circle cx="-95" cy="-80" r="34"/><circle cx="80" cy="-105" r="25"/><circle cx="115" cy="55" r="46"/><circle cx="-70" cy="95" r="30"/><circle cx="-145" cy="20" r="18"/></g></g>';
    }else if(p.kind==='cracks'){
      body='<g transform="translate(450 450)"><circle r="220" fill="url(%23p)"/><g stroke="%236c7580" stroke-width="9" fill="none" opacity=".65"><path d="M-165-130 20-30 155-145"/><path d="M-195 25-35 75 105 10 190 80"/><path d="M-90 190-50 75 5-30"/></g></g>';
    }else if(p.kind==='haze'){
      body='<g transform="translate(450 450)"><circle r="224" fill="'+p.c1+'"/><circle r="238" fill="none" stroke="%23f4c96d" stroke-width="28" opacity=".45"/><path d="M-205-40c120 35 280 25 410-10M-190 55c130 28 260 25 380-10" stroke="'+p.c2+'" stroke-width="18" fill="none" opacity=".5"/></g>';
    }else if(p.kind==='ice'){
      body='<g transform="translate(450 450)"><circle r="220" fill="url(%23p)"/><path d="M-140-90 0-170 135-85 85 30 150 120 0 180-135 105-75 15Z" fill="%23fff" opacity=".16"/></g>';
    }else if(p.kind==='pluto'){
      body='<g transform="translate(450 450)"><circle r="220" fill="url(%23p)"/><path d="M-55-25c-60-70-120 15-55 78 40 38 55 55 55 55s15-17 55-55c65-63 5-148-55-78Z" fill="%23e7c7a7" opacity=".8"/></g>';
    }else if(p.kind==='oval'){
      body='<g transform="translate(450 450) rotate(-12)"><ellipse rx="265" ry="165" fill="url(%23p)"/><ellipse rx="210" ry="115" fill="%23fff" opacity=".08"/></g>';
    }else if(p.kind==='solar'){
      body='<g transform="translate(450 450)"><circle r="62" fill="%23ffd54f"/><g fill="none" stroke="%239eb8e9" stroke-width="3" opacity=".6"><circle r="110"/><circle r="150"/><circle r="195"/><circle r="245"/><circle r="300"/><circle r="350"/></g><circle cx="110" r="12" fill="%23aaa"/><circle cy="-150" r="15" fill="%23e8b36b"/><circle cx="-195" r="18" fill="%23438cda"/><circle cy="245" r="22" fill="%23d99c76"/><circle cx="300" r="31" fill="%23d0a779"/><circle cx="-330" cy="115" r="27" fill="%23d9c78e"/></g>';
    }else if(p.kind==='galaxy'){
      let dots='';for(let i=0;i<44;i++){const a=i*2.7,r=80+(i%9)*28;dots+='<circle cx="'+(Math.cos(a)*r).toFixed(1)+'" cy="'+(Math.sin(a)*r*.38).toFixed(1)+'" r="'+(2+i%3)+'"/>'}
      body='<g transform="translate(450 450)"><ellipse rx="330" ry="120" fill="none" stroke="%23aebfff" stroke-width="48" opacity=".34" transform="rotate(-18)"/><ellipse rx="240" ry="70" fill="none" stroke="%23fff" stroke-width="34" opacity=".42" transform="rotate(-18)"/><circle r="55" fill="%23fff" opacity=".82"/><g fill="%23fff">'+dots+'</g></g>';
    }else if(p.kind==='blackhole'){
      body='<g transform="translate(450 450) rotate(-14)"><ellipse rx="330" ry="105" fill="none" stroke="%23ff9c2a" stroke-width="42" opacity=".9"/><ellipse rx="265" ry="72" fill="none" stroke="%23ffdf70" stroke-width="18" opacity=".85"/><circle r="150" fill="%23000"/><circle r="180" fill="none" stroke="%236d48a8" stroke-width="22" opacity=".45"/></g>';
    }else{
      body='<g transform="translate(450 450)"><circle r="220" fill="url(%23p)"/><g fill="%23332d2a" opacity=".30"><circle cx="-90" cy="-75" r="32"/><circle cx="75" cy="-110" r="22"/><circle cx="112" cy="45" r="44"/><circle cx="-58" cy="105" r="25"/></g></g>';
    }
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900">'+defs+'<rect width="900" height="900" rx="70" fill="url(%23bg)"/>'+stars+body+'</svg>');
  }

  function speakPlanet(planet,token){
    if(!settings.master||!settings.voice||!('speechSynthesis' in window)||token!==planetPlaybackToken)return Promise.resolve(false);
    return new Promise(resolve=>{
      let settled=false,timer=null;
      const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);resolve(ok)};
      try{
        speechSynthesis.cancel();
        const utter=new SpeechSynthesisUtterance(`${planet.name}՝ ${planet.status} է։`);
        utter.lang='hy-AM';utter.rate=.88;utter.pitch=1.04;utter.volume=voiceLevel();
        const voice=pickArmenianSpeechVoice();if(voice)utter.voice=voice;
        utter.onend=()=>finish(true);utter.onerror=()=>finish(false);
        speechSynthesis.resume?.();speechSynthesis.speak(utter);
        timer=setTimeout(()=>finish(false),6500);
      }catch{finish(false)}
    });
  }

  async function playPlanetSequence(planet,card){
    stopPlanetPlayback({restoreMusic:false});
    const token=++planetPlaybackToken;
    activePlanetCard=card;
    card.classList.remove('animal-card--pressing');
    card.classList.add('animal-card--focus','animal-card--speaking');
    const musicWasPlaying=!menuMusic.paused;
    if(musicWasPlaying)menuMusic.pause();
    if(settings.master&&settings.voice)await speakPlanet(planet,token);
    else await new Promise(r=>setTimeout(r,1050));
    if(token!==planetPlaybackToken)return;
    await new Promise(r=>setTimeout(r,180));
    if(token!==planetPlaybackToken)return;
    card.classList.remove('animal-card--speaking','animal-card--focus');
    activePlanetCard=null;
    if(musicWasPlaying&&settings.master&&settings.music)ensureAudio();
  }

  function gamePlanetGallery(){
    activityContent.innerHTML='';
    activityContent.classList.add('animal-gallery-mode');
    const wrap=document.createElement('div');
    wrap.className='animal-gallery animal-gallery--planet';
    wrap.setAttribute('aria-label','Մոլորակների և տիեզերական օբյեկտների պատկերասրահ');

    PLANETS.forEach((planet,cardIndex)=>{
      const card=document.createElement('button');
      card.type='button';
      card.className='animal-card animal-card--planet';
      card.dataset.planet=planet.id;
      card.style.setProperty('--animal-accent',planet.accent);
      card.style.setProperty('--animal-accent-soft',planet.accent+'55');
      card.style.setProperty('--animal-name-size',galleryNameSize(planet.name));
      card.style.setProperty('--animal-type-size',galleryTypeSize(planet.status));
      card.setAttribute('aria-label',`${planet.name}, ${planet.status}`);
      card.innerHTML=`
        <span class="animal-image-wrap">
          <img src="${galleryThumbnail(planet.img)}?v=238" data-full-src="${planet.img}?v=130" loading="${cardIndex<8?'eager':'lazy'}" fetchpriority="${cardIndex<4?'high':'auto'}" decoding="async" alt="${planet.name}" draggable="false">
          <span class="animal-card-sheen" aria-hidden="true"></span>
        </span>
        <span class="animal-meta animal-meta--planet">
          <strong class="animal-name">${planet.name}</strong>
          <small class="animal-type animal-type--planet" style="background:${PLANET_BADGES[planet.id]||'linear-gradient(180deg,#6f89a4,#465c74)'}">${planet.status}</small>
        </span>`;
      hardCenterGalleryCard(card);
      if(planet.id==='solar-system'){
        card.style.setProperty('--animal-name-size','13.4px');
        const statusPill=card.querySelector('.animal-type--planet');
        if(statusPill){
          statusPill.style.setProperty('width','100%','important');
          statusPill.style.setProperty('max-width','100%','important');
          statusPill.style.setProperty('padding-left','6px','important');
          statusPill.style.setProperty('padding-right','6px','important');
          statusPill.style.setProperty('font-size','8.4px','important');
        }
      }

      let downX=0,downY=0,downPointer=null,moved=false;
      card.addEventListener('pointerdown',e=>{
        if(e.pointerType==='mouse'&&e.button!==0)return;
        downPointer=e.pointerId;downX=e.clientX;downY=e.clientY;moved=false;
        card.classList.add('animal-card--pressing');
      });
      card.addEventListener('pointermove',e=>{
        if(e.pointerId!==downPointer)return;
        if(Math.hypot(e.clientX-downX,e.clientY-downY)>12){moved=true;card.classList.remove('animal-card--pressing')}
      });
      card.addEventListener('pointerup',e=>{
        if(e.pointerId!==downPointer)return;
        card.classList.remove('animal-card--pressing');
        const shouldPlay=!moved;downPointer=null;
        if(shouldPlay)presentGalleryCard(card,clone=>playPlanetSequence(planet,clone),()=>stopPlanetPlayback({restoreMusic:true}));
      });
      card.addEventListener('pointercancel',()=>{downPointer=null;moved=true;card.classList.remove('animal-card--pressing')});
      card.addEventListener('pointerleave',()=>{if(downPointer!==null)card.classList.remove('animal-card--pressing')});
      card.addEventListener('click',e=>{if(e.detail===0)presentGalleryCard(card,clone=>playPlanetSequence(planet,clone),()=>stopPlanetPlayback({restoreMusic:true}))});
      wrap.appendChild(card);
    });

    activityContent.appendChild(wrap);
    observeGalleryUpcomingImages(wrap);
    gameCleanup.push(()=>{
      cancelGalleryCardPresentation();
      stopPlanetPlayback({restoreMusic:true});
      activityContent.classList.remove('animal-gallery-mode');
    });
  }


  function gameConstellationGallery(){
    activityContent.innerHTML='';
    activityContent.classList.add('animal-gallery-mode');
    const wrap=document.createElement('div');
    wrap.className='animal-gallery animal-gallery--constellation';
    wrap.setAttribute('aria-label','Համաստեղությունների պատկերասրահ');

    CONSTELLATIONS.forEach((item,cardIndex)=>{
      const tone=CONSTELLATION_TONES[item.tone]||CONSTELLATION_TONES.indigo;
      const card=document.createElement('button');
      card.type='button';
      card.className='animal-card animal-card--constellation';
      card.dataset.constellation=item.id;
      card.style.setProperty('--animal-accent',tone.accent);
      card.style.setProperty('--animal-accent-soft',tone.accent+'55');
      card.style.setProperty('--animal-name-size',galleryNameSize(item.name));
      card.style.setProperty('--animal-type-size',galleryTypeSize(item.status));
      card.setAttribute('aria-label',`${item.name}, ${item.status}`);
      card.innerHTML=`
        <span class="animal-image-wrap">
          <img src="${galleryThumbnail(item.img)}?v=238" data-full-src="${item.img}?v=137" loading="${cardIndex<8?'eager':'lazy'}" fetchpriority="${cardIndex<4?'high':'auto'}" decoding="async" alt="${item.name}" draggable="false">
          <span class="animal-card-sheen" aria-hidden="true"></span>
        </span>
        <span class="animal-meta animal-meta--constellation">
          <strong class="animal-name">${item.name}</strong>
          <small class="animal-type animal-type--constellation" style="background:${tone.badge}">${item.status}</small>
        </span>`;
      hardCenterGalleryCard(card);

      if(item.id==='hercules'){
        card.style.setProperty('--animal-name-size','11.2px');
      }

      let downX=0,downY=0,downPointer=null,moved=false;
      card.addEventListener('pointerdown',e=>{
        if(e.pointerType==='mouse'&&e.button!==0)return;
        downPointer=e.pointerId;downX=e.clientX;downY=e.clientY;moved=false;
        card.classList.add('animal-card--pressing');
      });
      card.addEventListener('pointermove',e=>{
        if(e.pointerId!==downPointer)return;
        if(Math.hypot(e.clientX-downX,e.clientY-downY)>12){moved=true;card.classList.remove('animal-card--pressing')}
      });
      card.addEventListener('pointerup',e=>{
        if(e.pointerId!==downPointer)return;
        card.classList.remove('animal-card--pressing');
        const shouldPlay=!moved;downPointer=null;
        if(shouldPlay)presentGalleryCard(card,clone=>playPlanetSequence(item,clone),()=>stopPlanetPlayback({restoreMusic:true}));
      });
      card.addEventListener('pointercancel',()=>{downPointer=null;moved=true;card.classList.remove('animal-card--pressing')});
      card.addEventListener('pointerleave',()=>{if(downPointer!==null)card.classList.remove('animal-card--pressing')});
      card.addEventListener('click',e=>{if(e.detail===0)presentGalleryCard(card,clone=>playPlanetSequence(item,clone),()=>stopPlanetPlayback({restoreMusic:true}))});
      wrap.appendChild(card);
    });

    activityContent.appendChild(wrap);
    observeGalleryUpcomingImages(wrap);
    gameCleanup.push(()=>{
      cancelGalleryCardPresentation();
      stopPlanetPlayback({restoreMusic:true});
      activityContent.classList.remove('animal-gallery-mode');
    });
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
  function gameMindShapesV4(){
    // Keep the approved V4 game in its own browsing context, while the outer
    // activity screen uses the same portal animation as every other card.
    activityScreen.classList.add('mind-v4-mode');
    activityContent.replaceChildren();
    const frame=document.createElement('iframe');
    frame.className='mind-v4-frame';
    frame.title='Գտիր ճիշտ ձևը';
    frame.src='./mind-shapes-deluxe-v4.html?embed=1&v=294';
    frame.setAttribute('loading','eager');
    frame.setAttribute('allow','autoplay');
    activityContent.append(frame);
    const syncWallet=event=>{
      if(event.key!==STARS_KEY)return;
      const next=Number(event.newValue);
      if(Number.isFinite(next)&&next>=0){stars=next;updateStars()}
    };
    const handleBack=event=>{
      if(event.origin!==location.origin||event.source!==frame.contentWindow||
         event.data?.type!=='areg-mind-v4-back'||currentGame?.kind!=='mindShapesV4')return;
      backToSection();
    };
    addEventListener('storage',syncWallet);
    addEventListener('message',handleBack);
    gameCleanup.push(()=>{
      removeEventListener('storage',syncWallet);
      removeEventListener('message',handleBack);
      const next=Number(localStorage.getItem(STARS_KEY));
      if(Number.isFinite(next)&&next>=0){stars=next;updateStars()}
      activityScreen.classList.remove('mind-v4-mode');
    });
  }
  function gameMindPairs(){
    // Isolated trial game: no writes to the existing star wallet or PWA data.
    activityScreen.classList.add('mind-v4-mode');
    activityContent.replaceChildren();
    const frame=document.createElement('iframe');
    frame.className='mind-v4-frame';
    frame.title='Գտիր զույգը';
    frame.src='./mind-match-pairs.html?v=trial1';
    frame.setAttribute('loading','eager');
    activityContent.append(frame);
    const onBack=event=>{
      if(event.origin!==location.origin||event.source!==frame.contentWindow||
         event.data?.type!=='areg-mind-pairs-back'||currentGame?.kind!=='mindPairs')return;
      backToSection();
    };
    addEventListener('message',onBack);
    gameCleanup.push(()=>{
      removeEventListener('message',onBack);
      activityScreen.classList.remove('mind-v4-mode');
    });
  }
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
  function gameMindShadow3D(){
    // Isolated trial: reuse the approved Mind-game portal, back navigation,
    // selected parent background and existing stars without changing storage.
    activityScreen.classList.add('mind-v4-mode');
    activityContent.replaceChildren();
    const frame=document.createElement('iframe');
    frame.className='mind-v4-frame';
    frame.title='Ո՞ւմ ստվերն է';
    frame.src='./mind-shadow-3d.html?v=trial1';
    frame.setAttribute('loading','eager');
    activityContent.append(frame);
    const onBack=event=>{
      if(event.origin!==location.origin||event.source!==frame.contentWindow||
         event.data?.type!=='areg-mind-shadow-back'||currentGame?.kind!=='pattern')return;
      backToSection();
    };
    addEventListener('message',onBack);
    gameCleanup.push(()=>{
      removeEventListener('message',onBack);
      activityScreen.classList.remove('mind-v4-mode');
    });
  }
  function gameCups(){
    // "Հավաքիր պատկերը" — embedded real jigsaw, preserving the approved game-card portal.
    activityScreen.classList.add('mind-v4-mode');
    activityContent.replaceChildren();
    const frame=document.createElement('iframe');
    frame.className='mind-v4-frame';
    frame.title='Հավաքիր պատկերը';
    frame.src='./mind-jigsaw.html?embed=1&testv='+encodeURIComponent(new URLSearchParams(location.search).get('testv')||'initial');
    frame.setAttribute('loading','eager');
    activityContent.append(frame);
    // The child inherits the chosen global app theme, including photo themes.
    const sendJigsawTheme=()=>{
      const active=themes.find(([id])=>id===settings.theme);
      const css=getComputedStyle(root);
      const colors=['--bg-1','--bg-2','--bg-3'].map(k=>css.getPropertyValue(k).trim());
      const photo=active&&String(active[0]).startsWith('photo-user-')?active[2]:null;
      frame.contentWindow?.postMessage({
        type:'areg-jigsaw-theme',colors,photo,blur:Number(settings.themeBlur)||0
      },location.origin);
    };
    frame.addEventListener('load',sendJigsawTheme);
    const rewardedStages=new Set();
    const onMessage=event=>{
      if(event.origin!==location.origin||event.source!==frame.contentWindow||currentGame?.kind!=='cups')return;
      if(event.data?.type==='areg-jigsaw-back'){backToSection();return}
      if(event.data?.type==='areg-jigsaw-stars-request'){
        frame.contentWindow?.postMessage({type:'areg-jigsaw-stars-sync',stars},location.origin);return
      }
      if(event.data?.type==='areg-jigsaw-earned'){
        const amount=event.data.amount,awardId=event.data.awardId;
        if((amount!==1&&amount!==5)||typeof awardId!=='string'||awardId.length>96||rewardedStages.has(awardId))return;
        rewardedStages.add(awardId);
        stars+=amount;saveStars();updateStars();
        frame.contentWindow?.postMessage({type:'areg-jigsaw-stars-sync',stars},location.origin);
      }
    };
    addEventListener('message',onMessage);
    gameCleanup.push(()=>{
      removeEventListener('message',onMessage);
      activityScreen.classList.remove('mind-v4-mode');
    });
  }

  function gameDrawColor(){
    activityContent.replaceChildren();
    const frame=document.createElement('iframe');
    frame.className='mind-v4-frame';
    frame.title='Նկարիր և գունավորիր';
    frame.src='./areg-draw-and-color.html?testv='+encodeURIComponent(new URLSearchParams(location.search).get('testv')||'initial');
    frame.setAttribute('loading','eager');
    activityScreen.classList.add('areg-car-wash-mode');
    activityContent.append(frame);
    gameCleanup.push(()=>activityScreen.classList.remove('areg-car-wash-mode'));
  }

  /* CREATIVITY */
  function gamePaint(){
    const host=surface(null),css=document.createElement('style');
    css.textContent='.art3d{height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden;padding:6px 7px 9px;border-radius:20px;background:radial-gradient(ellipse at 50% 0%,#475b91,#192e61 55%,#101a39);color:white;font-family:system-ui;box-sizing:border-box}.art3d *{box-sizing:border-box}.art3d h2{text-align:center;flex:none;margin:1px 0 5px;font-size:17px;color:#fff2c7;text-shadow:0 3px #202954,0 0 15px #6cc6ff}.art3d .bar{display:flex;gap:5px;justify-content:center;flex-wrap:nowrap;margin-bottom:5px;flex:none}.art3d .bar button{flex:1;min-width:0;font-size:11px;padding:3px}.art3d button{border:1px solid #e2eaffaa;border-radius:11px;color:white;background:linear-gradient(155deg,#798fcb,#364c82 65%,#28375e);box-shadow:inset 0 2px #fff7,0 4px #0b1835,0 6px 10px #0005;min-height:40px;font-weight:800;touch-action:manipulation}.art3d button.on{background:linear-gradient(145deg,#ffe39a,#ff985f);color:#443049;border-color:#fff5b1}.art3d .tools{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:5px 2px 9px}.art3d .panels{flex:none;min-height:0}.art3d .tabs{display:flex;gap:6px;margin:4px 0 5px}.art3d .tab{flex:1;font-size:12px;min-height:39px}.art3d .tab.on{transform:translateY(1px)}.art3d .panel{display:none;padding:2px 3px 4px;border-radius:12px;background:#15254eaa}.art3d .panel.on{display:block}.art3d .tool{height:49px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:10px}.art3d .tool b{font-size:21px}.art3d .settings{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:12px;font-weight:800}.art3d input[type=range]{flex:1;min-width:50px;accent-color:#ffcf78}.art3d input[type=color]{width:43px;height:36px;border-radius:8px;border:2px solid white;background:#283a71}.art3d .colors{display:grid;grid-template-columns:repeat(9,1fr);gap:5px;margin:5px 0 9px}.art3d .swatch{height:31px;min-width:0;border:2px solid #fffc;box-shadow:inset 0 3px #fff8,0 4px #0e1941}.art3d .swatch.on{outline:3px solid #ffdf88;outline-offset:1px}.art3d .frame{flex:1;min-height:210px;display:flex;padding:7px;border:3px solid #cda76e;border-radius:22px;background:linear-gradient(145deg,#ffe6a5,#b77b42 45%,#f7d88e 70%,#89512f);box-shadow:inset 0 3px #fff9,inset 0 -4px #65371899,0 10px #0b183a,0 17px 22px #0008}.art3d .paper{flex:1;min-width:0;min-height:0;background:#fffefa;aspect-ratio:auto;max-height:none;border:3px solid #fff7df;border-radius:11px;overflow:hidden;box-shadow:inset 0 0 16px #d9cdb2,0 3px 7px #5e3c2777}.art3d canvas{display:block;width:100%;height:100%;touch-action:none}.art3d.compact .tool{height:41px}.art3d.compact .tool b{font-size:18px}.art3d.compact .tools{gap:3px;padding:3px}.art3d .hint{flex:none;text-align:center;font-size:11px;color:#d9e7ff;margin-top:7px}@media(max-width:380px){.art3d{padding:7px 6px 18px}.art3d .tools{gap:5px}.art3d .tool{font-size:9px}}';
    css.textContent += '.art3d .panel{display:none!important}.art3d .tabs{margin:2px 0 4px}.art3d .dock{height:70px;flex:none;display:flex;align-items:end;justify-content:space-around;gap:2px;padding:5px 3px 0;border-radius:12px;background:#18284b}.art3d .stick{position:relative;flex:1;min-width:0;max-width:34px;height:57px;padding:0;border:0;background:none;box-shadow:none;transition:transform .22s ease}.art3d .stick.on{transform:translateY(-12px)}.art3d .stick .shaft{position:absolute;bottom:0;left:20%;width:60%;height:44px;border-radius:5px 5px 2px 2px;border:1px solid #202b40;background:linear-gradient(90deg,#0006,transparent 35%,#fff9 50%,transparent 70%,#0005),var(--ink)}.art3d .stick .point{position:absolute;bottom:43px;left:25%;width:50%;height:12px;clip-path:polygon(50% 0,100% 100%,0 100%);background:var(--ink)}.art3d .stick.pencil .point{background:#dbb483}.art3d .stick.pen .point{background:#c6d9ea}.art3d .stick.brush .shaft{width:38%;left:31%;background:linear-gradient(90deg,#64391e,#edbd83,#63351a)}.art3d .stick.brush .point{height:var(--bristle,17px);bottom:43px;border-radius:60% 60% 30% 30%;clip-path:none}.art3d .stick.rgb .shaft{background:linear-gradient(120deg,#f46,#fc4,#4d9,#59f,#c6f)}.art3d .overlay{position:absolute;inset:0;z-index:50;background:#061329b8;backdrop-filter:blur(4px);display:flex;align-items:flex-start;justify-content:center;padding:75px 12px;opacity:0;transition:opacity .2s}.art3d .overlay.open{opacity:1}.art3d .dialog{width:100%;border:3px solid #e9bb79;border-radius:18px;background:linear-gradient(145deg,#4866a4,#1b2b58);padding:12px;transform:translateY(-15px);transition:transform .24s}.art3d .overlay.open .dialog{transform:translateY(0)}.art3d .dialog-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;font-weight:900}.art3d .dialog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.art3d .dialog-grid button{height:68px;font-size:12px}.art3d .frame{min-height:180px}.art3d{position:relative;padding:5px}.art3d h2{font-size:16px;margin-bottom:4px}';css.textContent += '.art3d .dock{height:85px;gap:5px;padding:6px 6px 1px;background:linear-gradient(180deg,#243d71,#101f47);box-shadow:inset 0 3px 8px #0008,inset 0 1px #d4e8ff66,0 4px 9px #0005}.art3d .stick{height:70px;max-width:48px;min-width:22px;filter:drop-shadow(1px 3px 2px #050e24aa)}.art3d .stick .shaft{height:53px;border-radius:7px 7px 3px 3px;box-shadow:inset 2px 0 3px #fff6,inset -3px 0 3px #0005,2px 2px 2px #0008}.art3d .stick .point{bottom:52px;height:15px}.art3d .stick.brush .point{bottom:52px}.art3d .stick.on{transform:translateY(-15px) scale(1.07);filter:drop-shadow(0 5px 5px #ffdb84a9)}.art3d .dialog{border-width:4px;border-radius:24px;padding:15px;background:linear-gradient(150deg,#718dd0 0%,#344d89 30%,#192e61 85%);box-shadow:inset 0 3px 2px #fff9,inset 0 -5px 4px #0c173f,0 15px 30px #000a}.art3d .dialog-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.art3d .dialog-grid button{height:104px;border:2px solid #d8e8ffb8;border-radius:18px;background:linear-gradient(145deg,#9cb2e2,#506ea8 58%,#2b457c);box-shadow:inset 0 3px 2px #fff9,inset 0 -4px 3px #1c315f,0 6px 0 #101c40,0 9px 10px #0007;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-size:13px;font-weight:900}.art3d .dialog-grid button .toy{font-size:47px;line-height:1.1;filter:drop-shadow(1px 5px 2px #0007);transform:rotate(-9deg);transition:transform .2s}.art3d .dialog-grid button:active .toy{transform:rotate(0deg) scale(1.12)}.art3d .rgb-box{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px}.art3d .rgb-box input[type=color]{width:100%;height:68px;border:3px solid #ffe7a8;border-radius:14px;background:#253f77}.art3d .rgb-box .rgb-preview{width:55px;height:55px;border:4px solid white;border-radius:50%;box-shadow:0 4px 9px #0007}.art3d .rgb-box .rgb-code{font-size:17px;font-weight:900;letter-spacing:2px}@media(max-width:380px){.art3d .dock{gap:3px;padding:5px 3px 1px}.art3d .stick{min-width:19px}}';css.textContent += '.art3d .dialog .dismiss{background:linear-gradient(145deg,#ff9197,#e7364e 65%,#a51d39)!important;border:2px solid #ffd1d5!important;color:#fff!important;min-width:44px;min-height:44px;border-radius:14px;font-size:26px;font-weight:900;box-shadow:inset 0 2px #fff9,0 4px #801d35!important}.art3d .stick.rgb input[type=color]{position:absolute;inset:0;width:100%;height:100%;opacity:0;z-index:5;cursor:pointer}.art3d .dialog-grid .outline-card{height:105px}';css.textContent += '.art3d .overlay{align-items:flex-start;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding-bottom:24px}.art3d .dialog{max-height:calc(100% - 6px);display:flex;flex-direction:column;min-height:0}.art3d .dialog-head{flex:none}.art3d .dialog-grid{min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:4px 4px 14px;align-content:start}.art3d .dialog-grid button{touch-action:pan-y;flex-shrink:0}';css.textContent += '.art3d .tabs{gap:7px;margin:5px 0 8px}.art3d .tabs .tab{min-height:75px;padding:7px 2px 8px;border:2px solid #cbdfff;border-radius:17px;background:linear-gradient(155deg,#9db7e8 0%,#5578b4 47%,#273e79 100%);box-shadow:inset 0 3px 2px #ffffffb0,inset 0 -5px 3px #172c5c,0 5px 0 #0b1b3b,0 8px 10px #0008;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#fff7eb;font-size:11px;text-shadow:0 2px 2px #182a52;transition:transform .28s ease,box-shadow .28s ease,background .28s ease}.art3d .tabs .tab .main-toy{font-size:30px;line-height:1.1;filter:drop-shadow(1px 4px 2px #0008);transform:rotate(-8deg);transition:transform .32s cubic-bezier(.2,.85,.25,1.3)}.art3d .tabs .tab:active .main-toy{transform:rotate(3deg) scale(1.13)}.art3d .tabs .tab.on{transform:translateY(2px);background:linear-gradient(150deg,#fff2b5,#f5ba6d 57%,#c47c3f);border-color:#fff2b8;color:#59351f;text-shadow:0 1px #fff9;box-shadow:inset 0 3px #fff9,inset 0 -4px #b46a3a,0 3px 0 #8a4d27,0 5px 8px #0006}.art3d .bar button{min-height:46px;border-radius:13px;font-size:12px;background:linear-gradient(150deg,#a6b9e5,#516fa8 58%,#2b437b);border:2px solid #c7ddff;box-shadow:inset 0 2px #fff9,inset 0 -3px #1b3262,0 4px #0c1c40}.art3d .overlay{transition:opacity .38s ease,backdrop-filter .38s ease}.art3d .dialog{transform:translateY(24px) scale(.91);opacity:.65;transition:transform .43s cubic-bezier(.2,.8,.2,1.03),opacity .38s ease}.art3d .overlay.open .dialog{transform:translateY(0) scale(1);opacity:1}@media(max-width:380px){.art3d .tabs .tab{min-height:68px;font-size:10px}.art3d .tabs .tab .main-toy{font-size:26px}}@media(prefers-reduced-motion:reduce){.art3d .overlay,.art3d .dialog,.art3d .tabs .tab,.art3d .tabs .tab .main-toy{transition:none}}';css.textContent += '.art3d .bar button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-height:60px;padding:3px 1px 5px!important;font-size:11px!important}.art3d .bar .action-toy{font-size:27px;line-height:1.1;filter:drop-shadow(1px 3px 2px #0007);transition:transform .22s ease}.art3d .bar button:active .action-toy{transform:scale(1.13) rotate(-8deg)}.art3d .bar .action-label{font-size:11px;line-height:1.1}@media(max-width:380px){.art3d .bar .action-toy{font-size:24px}.art3d .bar .action-label{font-size:10px}}';css.textContent += '.art3d .bar .history-action{background:linear-gradient(155deg,#9db9e9 0%,#567fbc 45%,#284a88 100%);border:2px solid #dceaff;box-shadow:inset 0 3px 2px #fff9,inset 0 -4px 3px #19335d,0 5px 0 #0b1c3c,0 8px 12px #0007}.art3d .bar .history-arrow{display:block;font-family:system-ui,sans-serif;font-size:45px;line-height:.86;font-weight:900;color:#fff4c9;text-shadow:0 2px 0 #8b6238,0 4px 3px #101f47,0 0 10px #fff5b366;filter:drop-shadow(1px 3px 2px #091936);transition:transform .22s ease}.art3d .bar .history-action:active .history-arrow{transform:scale(1.16) rotate(-10deg)}.art3d .bar .history-action .action-label{font-weight:900;color:#fff9df}@media(max-width:380px){.art3d .bar .history-arrow{font-size:39px}}';css.textContent += '.art3d .bar .history-arrow{width:65px;height:43px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(1px 4px 2px #061a40);transition:transform .25s ease}.art3d .bar .history-arrow svg{display:block;width:100%;height:100%;overflow:visible}.art3d .bar .history-arrow.reverse svg{transform:scaleX(-1)}.art3d .bar .history-action:active .history-arrow{transform:translateY(2px) scale(1.1)}@media(max-width:380px){.art3d .bar .history-arrow{width:54px;height:39px}}';host.appendChild(css);
    // Distinct premium tool silhouettes in the bottom color dock.
    css.textContent += '.art3d .stick.marker .shaft{width:72%;left:14%;height:40px;bottom:0;border-radius:7px 7px 3px 3px;background:linear-gradient(90deg,#0008,#fff7 35%,#fff2 55%,#0007),var(--ink);border:2px solid #293347}.art3d .stick.marker .point{bottom:39px;left:21%;width:58%;height:12px;clip-path:polygon(12% 100%,12% 50%,33% 0,67% 0,88% 50%,88% 100%);background:var(--ink);border-radius:2px}.art3d .stick.pencil .shaft{left:30%;width:40%;height:47px;border-radius:2px 2px 0 0;border:1px solid #81582d;background:repeating-linear-gradient(90deg,#9b632a 0 3px,#f2ca76 4px 9px,#bb833b 10px 12px)}.art3d .stick.pencil .point{left:29%;width:42%;height:14px;bottom:46px;clip-path:polygon(50% 0,100% 100%,0 100%);background:linear-gradient(to bottom,#33333b 0 27%,#e9bd7c 28%)}.art3d .stick.pen .shaft{left:37%;width:26%;height:49px;border:1px solid #4d6588;border-radius:4px 4px 1px 1px;background:linear-gradient(90deg,#1b355a,#b8d5ef 40%,#e8f5ff 55%,#26466c)}.art3d .stick.pen .point{left:32%;width:36%;height:12px;bottom:47px;clip-path:polygon(50% 0,100% 100%,0 100%);background:linear-gradient(#edf3f8,#8e9fb1 75%,#263f57)}.art3d .stick.pen .shaft:after{content:"";position:absolute;right:-5px;top:5px;width:3px;height:24px;border-radius:2px;background:#e5eef7;box-shadow:1px 0 2px #25334b}.art3d .stick.brush .point{background:var(--ink)}';
    css.textContent += '.art3d .stick.pencil .shaft{background:linear-gradient(90deg,#0006,transparent 22%,#fff8 45%,transparent 70%,#0006),var(--ink);border-color:#493c43}.art3d .stick.pencil .point{background:linear-gradient(to bottom,#303038 0 24%,#e9bd7c 25% 100%)}.art3d .stick.pen .shaft{background:linear-gradient(90deg,#0009,transparent 27%,#fff9 46%,transparent 67%,#0008),var(--ink);border-color:#334765}.art3d .stick.marker .shaft{background:linear-gradient(90deg,#0008,transparent 25%,#fff9 48%,transparent 70%,#0008),var(--ink)}.art3d .stick.brush .point{background:var(--ink)}.art3d .stick{filter:drop-shadow(0 2px 2px #0005)}';
    css.textContent += '.art3d .stick.pencil .shaft,.art3d .stick.pen .shaft,.art3d .stick.marker .shaft{background:linear-gradient(90deg,#0005 0%,transparent 17%,#ffffff55 30%,transparent 44%,transparent 74%,#0005 100%),var(--ink);filter:saturate(1.45)}.art3d .stick.marker .point,.art3d .stick.brush .point{filter:saturate(1.45)}.art3d .stick.on{filter:drop-shadow(0 0 5px #fff7)}';
    css.textContent += '.art3d .tabs .tab{font-size:14px;font-weight:900}.art3d .tabs .tab span:last-child{font-size:14px;line-height:1.15;font-weight:900;white-space:nowrap}.art3d .tabs .tab[data-panel="tools"] span:last-child{font-size:14px}@media(max-width:380px){.art3d .tabs .tab,.art3d .tabs .tab span:last-child,.art3d .tabs .tab[data-panel="tools"] span:last-child{font-size:12px}}';
    // Reclaim vertical space for the canvas; keep controls touch-friendly.
    css.textContent += '.art3d .hint{display:none!important}.art3d{padding:3px 5px 3px!important}.art3d h2{font-size:14px!important;margin:0 0 2px!important;line-height:1.15}.art3d .bar{gap:4px!important;margin-bottom:3px!important}.art3d .bar button{min-height:43px!important;height:43px!important;padding:2px 1px!important;gap:0!important;border-radius:10px!important}.art3d .bar .action-toy{font-size:19px!important;line-height:1!important}.art3d .bar .action-label{font-size:9px!important;line-height:1!important}.art3d .bar .history-arrow{width:43px!important;height:27px!important}.art3d .tabs{margin:2px 0 4px!important;gap:5px!important}.art3d .tabs .tab{min-height:51px!important;height:51px!important;padding:3px 1px!important;border-radius:12px!important;gap:1px!important}.art3d .tabs .tab .main-toy{font-size:23px!important;line-height:1!important}.art3d .tabs .tab span:last-child{font-size:12px!important}.art3d .frame{min-height:180px;padding:5px!important}.art3d .dock{height:77px!important;padding-top:4px!important}.art3d .stick{height:54px!important}';
    // Give Save/New labels their own line below the icons without overlap.
    css.textContent += '.art3d .bar button{height:53px!important;min-height:53px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;padding:3px 2px 4px!important;overflow:hidden}.art3d .bar .action-toy{display:block!important;font-size:21px!important;line-height:23px!important;height:23px!important;flex:none!important}.art3d .bar .action-label{display:block!important;font-size:10px!important;line-height:13px!important;height:13px!important;flex:none!important;white-space:nowrap!important}.art3d .bar .history-arrow{width:43px!important;height:27px!important;flex:none!important}.art3d .bar .history-action .action-label{height:13px!important}';
    css.textContent += '.art3d .dock .stick.rainbow .shaft,.art3d .dock .stick.rainbow .point{background:linear-gradient(90deg,#ff3157 0%,#ffae00 18%,#ffef39 34%,#32d866 51%,#1fa8ff 68%,#8646e8 84%,#ff4eb9 100%)!important}.art3d .dock .stick.rgb .shaft,.art3d .dock .stick.rgb .point{background:conic-gradient(#ff3157,#ffb400,#ffe84d,#30c96b,#24a9ff,#934ee8,#ff3157)!important}.art3d .dock .stick.rgb input[type=color]{opacity:0;position:absolute;inset:0;width:100%;height:100%;z-index:5;cursor:pointer}';
    // Five glossy 3D instrument tiles, sized to match the approved toolbar reference.
    css.textContent += '.art3d .tabs{gap:4px!important;margin:3px 0 5px!important}.art3d .tabs .tab{flex:1 1 0!important;min-width:0!important;height:73px!important;min-height:73px!important;padding:5px 1px!important;gap:3px!important;border:2px solid #b6d6ff!important;border-radius:15px!important;background:linear-gradient(160deg,#7db5ef 0%,#3269af 40%,#15386d 100%)!important;box-shadow:inset 0 3px 2px #e2f5ffbb,inset 0 -4px #0a2959,0 5px #0b1b3d,0 7px 9px #0007!important;color:white!important}.art3d .tabs .tab.on{background:linear-gradient(160deg,#fff4b2,#ffc970 52%,#df904a)!important;border-color:#fff2b0!important;color:#61371f!important;box-shadow:inset 0 3px #fff9,inset 0 -4px #c17d3d,0 5px #8d4b29!important}.art3d .tabs .tab .main-toy{font-size:29px!important;line-height:32px!important;filter:drop-shadow(2px 3px 2px #06193699)!important}.art3d .tabs .tab span:last-child{font-size:10px!important;line-height:12px!important;font-weight:900!important;white-space:nowrap!important;letter-spacing:-.4px}.art3d .dock{position:relative}.art3d .dock .size-access{position:absolute;right:0;top:-19px;width:28px;height:27px;min-height:27px;border-radius:9px;font-size:15px;padding:0;background:linear-gradient(#b7d4fa,#466eaa);z-index:3;border:1px solid #d8eaff;box-shadow:0 2px 4px #0006}@media(max-width:380px){.art3d .tabs .tab{height:67px!important;min-height:67px!important}.art3d .tabs .tab .main-toy{font-size:25px!important;line-height:28px!important}.art3d .tabs .tab span:last-child{font-size:9px!important}}';
    const ui=document.createElement('div');ui.className='art3d';ui.innerHTML='<h2>🎨 Կախարդական նկարչատուն</h2><div class="bar"></div><div class="panels"><div class="tabs"><button class="tab on" data-panel="marker" type="button">🖍️ Ֆլոմաստեր</button><button class="tab" data-panel="size" type="button">⚫ Չափ</button><button class="tab" data-panel="bucket" type="button">🪣 Դույլ</button><button class="tab" data-panel="eraser" type="button">🧽 Ռետին</button><button class="tab" data-panel="colors" type="button">🔷 Պատկերներ</button></div><div class="panel on" data-content="tools"><div class="tools"></div></div><div class="panel" data-content="colors"><div class="colors"></div></div><div class="panel" data-content="settings"><div class="settings">Վրձնի չափ <input type="range" min="2" max="46" value="12"><span class="num">12</span></div></div></div><div class="frame"><div class="paper"><canvas aria-label="Նկարելու դաշտ"></canvas></div></div><div class="dock"></div><div class="hint">✨ Ընտրիր գործիքն ու գույնը</div>';host.appendChild(ui);
    const canvas=ui.querySelector('canvas');let ctx=canvas.getContext('2d',{willReadFrequently:true});const bar=ui.querySelector('.bar'),toolsBox=ui.querySelector('.tools'),palette=ui.querySelector('.colors'),range=ui.querySelector('input[type=range]'),num=ui.querySelector('.num'),picker=document.createElement('input'),hint=ui.querySelector('.hint');
    picker.type='color';picker.value='#222936';const W=600,H=750;canvas.width=W;canvas.height=H;
    const tabs=Array.from(ui.querySelectorAll('.tab')),panels=Array.from(ui.querySelectorAll('.panel'));
    tabs.forEach(t=>{const original=t.textContent.trim(),match=original.match(/^(\S+)\s+(.+)$/u);if(!match)return;t.replaceChildren();const icon=document.createElement('span');icon.className='main-toy';icon.textContent=match[1];icon.setAttribute('aria-hidden','true');const caption=document.createElement('span');caption.textContent=match[2];t.append(icon,caption)});
    function updateToolTab(){tabs.forEach(t=>t.classList.toggle('on',(shapeMode?t.dataset.panel==='colors':t.dataset.panel===tool)))}
    function openPanel(name){tabs.forEach(t=>t.classList.toggle('on',t.dataset.panel===name));panels.forEach(t=>t.classList.toggle('on',t.dataset.content===name))}
    const dock=ui.querySelector('.dock');let activeColor=1;
    const inks=['#ff4c6e','#151823','#c64b24','#ffffff','#087aff','#00bb54','#8deb16','#ffe000','#ff7900','#ff2156','#b629f6','#ff76bb'];
    function drawDock(){dock.replaceChildren();const brush=tool==='brush';inks.forEach((ink,i)=>{const item=document.createElement('button');item.type='button';item.className='stick '+tool+(i===inks.length-1?' rgb':i===0?' rainbow':'');item.style.setProperty('--ink',ink);if(i===0)item.style.setProperty('--ink','transparent');item.style.setProperty('--bristle',(7+i*2)+'px');item.setAttribute('aria-label',i===inks.length-1?'RGB գույն':i===0?'Ծիածան գույն':brush?'Վրձնի չափ':'Գույն');item.innerHTML='<span class="shaft"></span><span class="point"></span>';if(i===inks.length-1){const input=document.createElement('input');input.type='color';input.value=color;input.setAttribute('aria-label','RGB գույն');input.addEventListener('input',()=>{if(shapeMode){shapeMode=null;tool='marker';updateToolTab()}else if(!['brush','pencil','marker','pen','bucket','eraser'].includes(tool))tool='marker';toolButtons.forEach((x,k)=>x.classList.toggle('on',k===tool));setColor(input.value);activeColor=i;Array.from(dock.children).forEach((x,j)=>x.classList.toggle('on',j===i))});item.appendChild(input)}item.addEventListener('click',()=>{if(shapeMode){shapeMode=null;tool='marker';updateToolTab()}else if(!['brush','pencil','marker','pen','bucket','eraser'].includes(tool)){tool='marker'}toolButtons.forEach((x,k)=>x.classList.toggle('on',k===tool));activeColor=i;Array.from(dock.children).forEach(x=>x.classList.remove('on'));item.classList.add('on');if(i===inks.length-1){return}else if(brush){width=3+i*3;range.value=Math.min(46,width);num.textContent=width}else{color=ink;picker.value=ink}});dock.appendChild(item)});dock.children[activeColor].classList.add('on');}
    const overlay=document.createElement('div');overlay.className='overlay';overlay.style.display='none';overlay.innerHTML='<div class="dialog"><div class="dialog-head"><span class="dialog-title"></span><button class="dismiss" type="button">✕</button></div><div class="dialog-grid"></div></div>';ui.appendChild(overlay);const grid=overlay.querySelector('.dialog-grid');
    let closeTimer=null;function closeDialog(){overlay.classList.remove('open');clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(!overlay.classList.contains('open'))overlay.style.display='none'},440)}
    overlay.querySelector('.dismiss').addEventListener('click',closeDialog);overlay.addEventListener('click',e=>{if(e.target===overlay)closeDialog()});
    function dialog(kind){clearTimeout(closeTimer);overlay.classList.remove('open');overlay.style.display='flex';grid.replaceChildren();overlay.querySelector('.dialog-title').textContent=kind==='tools'?'🖌️ Ընտրիր գործիքը':kind==='colors'?'🔷 Ընտրիր պատկերը':kind==='rgb'?'🌈 Ընտրիր քո գույնը':'⚙️ Չափեր';const choices=kind==='tools'?[['pencil','✏️ Մատիտ'],['marker','🖍️ Ֆլոմաստեր'],['pen','🖊️ Գրիչ'],['brush','🖌️ Վրձին'],['eraser','🧽 Ռետին'],['bucket','🪣 Դույլ']]:[['circle','⚪ Շրջան'],['rect','▣ Քառակուսի'],['triangle','🔺 Եռանկյուն'],['star','⭐ Աստղ'],['heart','❤️ Սիրտ'],['diamond','🔶 Շեղանկյուն'],['line','📏 Գիծ'],['flower','🌸 Ծաղիկ'],['sun','☀️ Արև'],['car','🚗 Մեքենա'],['truck','🚚 Բեռնատար'],['bus','🚌 Ավտոբուս'],['house','🏠 Տնակ'],['tree','🌳 Ծառ'],['boat','⛵ Նավակ'],['rocket','🚀 Հրթիռ'],['fish','🐟 Ձուկ'],['butterfly','🦋 Թիթեռ'],['ladybug','🐞 Զատիկ'],['bee','🐝 Մեղու'],['ant','🐜 Մրջյուն'],['dragonfly','🪰 Ճպուռ'],['snail','🐌 Խխունջ'],['dog','🐶 Շուն'],['rabbit','🐰 Նապաստակ'],['bear','🐻 Արջ'],['elephant','🐘 Փիղ'],['turtle','🐢 Կրիա'],['bird','🐦 Թռչուն'],['frog','🐸 Գորտ'],['mouse','🐭 Մուկ'],['owl','🦉 Բու'],['cat','🐱 Կատու'],['balloon','🎈 Փուչիկ'],['train','🚂 Գնացք'],['zigzag','〰️ Զիգզագ'],['wave','〰️ Ալիք'],['semicircle','〰️ Կիսաշրջան'],['hook','〰️ Կեռիկ'],['spiral','〰️ Պարույր'],['arc','〰️ Աղեղ'],['doublewave','〰️ Կրկնակի ալիք'],['chevron','〰️ Անկյուններ'],['stairs','〰️ Աստիճաններ'],['loop','〰️ Օղակներ'],['sline','〰️ S-գիծ'],['cross','〰️ Խաչ'],['rays','〰️ Ճառագայթներ'],['diamondline','〰️ Շեղանկյուն'],['curly','〰️ Գանգուր'],['mountainline','〰️ Լեռներ'],['rainbowarc','〰️ Ծիածան'],['dashes','〰️ Կետագիծ'],['sawtooth','〰️ Ատամնավոր'],['squiggle','〰️ Ոլորան']];if(kind==='rgb'){const box=document.createElement('div');box.className='rgb-box';const preview=document.createElement('span');preview.className='rgb-preview';preview.style.background=color;const label=document.createElement('span');label.className='rgb-code';label.textContent=color.toUpperCase();const choose=document.createElement('input');choose.type='color';choose.value=color;choose.setAttribute('aria-label','Ընտրել RGB գույն');choose.addEventListener('input',()=>{setColor(choose.value);preview.style.background=color;label.textContent=color.toUpperCase();dock.querySelector('.stick.rgb').style.setProperty('--ink',color)});const done=document.createElement('button');done.type='button';done.textContent='✓ Ընտրել գույնը';done.addEventListener('click',closeDialog);box.append(preview,label,choose,done);grid.appendChild(box)}else if(kind==='settings'){const settings=ui.querySelector('.settings');settings.style.gridColumn='1/-1';grid.appendChild(settings)}else choices.forEach(([id,label])=>{const btn=document.createElement('button');btn.type='button';const parts=label.split(' ');const icon=document.createElement('span');icon.className='toy';icon.textContent=parts.shift();if(kind==='colors'&&Object.prototype.hasOwnProperty.call(linePatterns,id)){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');svg.style.cssText='display:block;width:82px;height:67px;max-width:100%;overflow:visible';const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',linePatterns[id]);path.setAttribute('fill','none');path.setAttribute('stroke','#f8f5ff');path.setAttribute('stroke-width','5');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.appendChild(path);icon.replaceChildren(svg);icon.style.cssText='display:flex;justify-content:center;align-items:center;transform:none;width:100%;font-size:0'}const title=document.createElement('span');title.textContent=parts.join(' ');btn.append(icon,title);btn.addEventListener('click',()=>{if(kind==='tools'){tool=id;shapeMode=null;drawDock();updateToolTab();toolButtons.forEach((x,k)=>x.classList.toggle('on',k===id))}else{shapeMode=id;updateToolTab();toolButtons.forEach(x=>x.classList.remove('on'))}closeDialog()});grid.appendChild(btn)});requestAnimationFrame(()=>requestAnimationFrame(()=>overlay.classList.add('open')))}
    // Five dot sizes directly inside the former Pen tab.
    const sizeTab=tabs.find(t=>t.dataset.panel==='size');
    const sizes=[4,8,13,21,32];let selectedSize=2;
    const sizeDots=document.createElement('div');
    sizeDots.style.cssText='position:absolute;z-index:12;display:none;align-items:center;justify-content:space-evenly;gap:4px;padding:6px;background:linear-gradient(#3b629e,#1a315d);border:2px solid #c9e3ff;border-radius:13px;box-shadow:0 5px 14px #0009';
    sizes.forEach((value,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Գծի չափ '+(i+1));b.style.cssText='width:42px;min-width:42px;height:42px;min-height:42px;display:flex;align-items:center;justify-content:center;border-radius:9px;padding:0';const dot=document.createElement('span');dot.style.cssText='display:block;width:'+Math.max(5,value)+'px;height:'+Math.max(5,value)+'px;background:#fff;border-radius:50%;box-shadow:0 1px 3px #0008';b.appendChild(dot);b.addEventListener('click',()=>{selectedSize=i;width=value;range.value=String(value);num.textContent=String(value);sizeDots.style.display='none';sizeTab.classList.add('on')});sizeDots.appendChild(b)});
    ui.appendChild(sizeDots);
    sizeTab.addEventListener('click',()=>{sizeDots.style.display=sizeDots.style.display==='flex'?'none':'flex';const a=sizeTab.getBoundingClientRect(),u=ui.getBoundingClientRect();sizeDots.style.top=(a.bottom-u.top+5)+'px';sizeDots.style.left='6px';sizeDots.style.width='calc(100% - 12px)'});
    tabs.forEach(t=>t.addEventListener('click',()=>{const id=t.dataset.panel;if(id==='size')return;if(id==='colors'){dialog('colors');return}tool=((id==='bucket'||id==='eraser')&&tool===id)?'marker':id;shapeMode=null;updateToolTab();drawDock()}));
    // Keep brush-size controls available without crowding the five main tool buttons.

    // Keep the paper dominant, with a compact tool drawer above it.
    const compact=window.matchMedia&&window.matchMedia('(max-height:720px)').matches;
    if(compact)ui.classList.add('compact');
    let color='#222936',tool='marker',shapeMode=null,width=12,down=false,last=null,start=null,base=null;
    drawDock();updateToolTab();const undo=[],redo=[];
    let barriers=new Uint8Array(W*H),strokeRegion=null,strokeBefore=null;const barrierUndo=[],barrierRedo=[];
    const snapshot=()=>ctx.getImageData(0,0,W,H),restore=img=>ctx.putImageData(img,0,0);
    const clear=()=>{ctx.save();ctx.globalCompositeOperation='source-over';ctx.fillStyle='#fffefa';ctx.fillRect(0,0,W,H);ctx.restore()};clear();
    const saveStep=()=>{undo.push(snapshot());barrierUndo.push(barriers.slice());if(undo.length>15){undo.shift();barrierUndo.shift()}redo.length=0;barrierRedo.length=0};
    const button=(label,cls,action)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=label;b.addEventListener('click',action);return b};
    bar.append(button('↶','',()=>{if(undo.length){redo.push(snapshot());barrierRedo.push(barriers.slice());restore(undo.pop());barriers=barrierUndo.pop()}}),button('↷','',()=>{if(redo.length){undo.push(snapshot());barrierUndo.push(barriers.slice());restore(redo.pop());barriers=barrierRedo.pop()}}),button('🗑️ Նոր','',()=>{saveStep();clear();barriers.fill(0)}),button('💾 Պահել','',()=>{try{const data=canvas.toDataURL('image/png');const binary=atob(data.split(',')[1]);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);const file=new File([bytes],'AREG-art.png',{type:'image/png'});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:'AREG նկարչություն'}).then(()=>{hint.textContent='📸 Ընտրիր «Պահել պատկերը»՝ լուսանկարներում պահելու համար'}).catch(err=>{if(err.name!=='AbortError')hint.textContent='Նկարը պահելու համար բացիր «Պահել պատկերը»'})}else{const tab=window.open('','_blank');if(tab){tab.document.title='AREG նկարը';const image=tab.document.createElement('img');image.src=data;image.style.cssText='width:100%;height:auto;display:block';tab.document.body.style.margin='0';tab.document.body.appendChild(image);hint.textContent='📸 Պահիր բացված նկարը՝ սեղմած պահելով'}else{const link=document.createElement('a');link.download='AREG-art.png';link.href=data;link.click();hint.textContent='Նկարը ներբեռնվել է. բացիր Ֆայլերից ու պահիր Լուսանկարներում'}}}catch(e){hint.textContent='Պահպանումը չհաջողվեց. կրկին փորձիր'}}));
    // The existing Save button opens a compact choice: Photos or resume later.
    const saveButton=bar.querySelectorAll('button')[3];
    if(saveButton){let nativeSave=false;saveButton.addEventListener('click',e=>{if(nativeSave){nativeSave=false;return}e.stopImmediatePropagation();e.preventDefault();clearTimeout(closeTimer);overlay.style.display='flex';grid.replaceChildren();overlay.querySelector('.dialog-title').textContent='💾 Պահել նկարը';
      const make=(label,action)=>{const btn=document.createElement('button');btn.type='button';btn.textContent=label;btn.style.cssText='grid-column:1/-1;min-height:65px;font-size:15px;border-radius:12px';btn.addEventListener('click',action);grid.appendChild(btn)};
      make('📸 Պահել հեռախոսում',()=>{closeDialog();nativeSave=true;saveButton.click()});
      make('🖼️ Պահել խաղում',()=>{saveGallery();openGallery()});
      make('📂 Շարունակել պահված նկարը',()=>openGallery());
      requestAnimationFrame(()=>requestAnimationFrame(()=>overlay.classList.add('open')));
    },true);
    }
    Array.from(bar.querySelectorAll('button')).forEach((btn,index)=>{if(index<2){btn.classList.add('history-action');btn.setAttribute('aria-label',index===0?'Հետ':'Առաջ');const symbol=document.createElement('span');symbol.className='history-arrow';symbol.innerHTML='<svg viewBox="0 0 110 78" aria-hidden="true" focusable="false"><defs><linearGradient id="aregPaintArrowBlue" x1="0" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="#c4e7ff"/><stop offset=".22" stop-color="#67b9ff"/><stop offset=".65" stop-color="#3389f3"/><stop offset="1" stop-color="#1651b4"/></linearGradient></defs><path d="M5 65 Q25 15 64 20 L64 7 Q64 3 69 6 L106 35 Q110 39 106 43 L69 72 Q64 76 64 69 L64 57 Q31 47 11 70 Q3 77 5 65Z" fill="url(#aregPaintArrowBlue)" stroke="#2873d3" stroke-width="2.5" stroke-linejoin="round"/><path d="M11 63 Q29 23 65 27" fill="none" stroke="#e6f6ff" stroke-width="3.3" stroke-linecap="round" opacity=".9"/><path d="M65 62 L65 69 L104 41" fill="none" stroke="#16468e" stroke-width="3" opacity=".45"/></svg>';if(index===0)symbol.classList.add('reverse');const text=document.createElement('span');text.className='action-label';text.textContent=index===0?'Հետ':'Առաջ';btn.replaceChildren(symbol,text);return}const label=btn.textContent.trim(),parts=label.match(/^(\S+)\s+(.+)$/u);if(!parts)return;const symbol=document.createElement('span');symbol.className='action-toy';symbol.textContent=parts[1];const text=document.createElement('span');text.className='action-label';text.textContent=parts[2];btn.replaceChildren(symbol,text)});
    const types=[['brush','🖌️','Վրձին'],['pencil','✏️','Մատիտ'],['marker','🖍️','Ֆլոմաստեր'],['spray','💨','Սփրեյ'],['bucket','🪣','Դույլ'],['eraser','🧽','Ռետին'],['line','📏','Գիծ'],['circle','⭕','Շրջան'],['rect','▣','Քառակուսի'],['star','⭐','Աստղ'],['rainbow','🌈','Ծիածան'],['glitter','✨','Փայլ']];
    const toolButtons=new Map();types.forEach(([id,emoji,name])=>{const b=button('', 'tool',()=>{tool=id;shapeMode=null;toolButtons.forEach((x,k)=>x.classList.toggle('on',k===id));hint.textContent='🎨 '+name});const ico=document.createElement('b');ico.textContent=emoji;const t=document.createElement('span');t.textContent=name;b.append(ico,t);toolsBox.appendChild(b);toolButtons.set(id,b)});toolButtons.get('brush').classList.add('on');
    const swatches=[];const setColor=c=>{color=c;picker.value=c;swatches.forEach(([b,v])=>b.classList.toggle('on',v===c))};
    ['#222936','#ff934c','#ffdc4c','#7cda74','#39d6bf','#4bafff','#8274e9','#d675e9','#ffffff','#242b4b','#a76b46','#e7b8a3','#83d7ff','#afeb90','#ffaecb','#777777','#ff3e35','#f5f0da'].forEach(c=>{const b=button('','swatch',()=>{if(shapeMode){shapeMode=null;tool='marker';updateToolTab()}setColor(c)});b.style.background=c;b.setAttribute('aria-label','Գույն '+c);palette.appendChild(b);swatches.push([b,c])});setColor(color);
    picker.addEventListener('input',()=>{if(shapeMode){shapeMode=null;tool='marker';updateToolTab()}setColor(picker.value);activeColor=inks.length-1;Array.from(dock.children).forEach((x,i)=>x.classList.toggle('on',i===activeColor))});range.addEventListener('input',()=>{width=Number(range.value);num.textContent=width});
    const galleryKey='areg-paint-gallery-v1';
    const readGallery=()=>{try{return JSON.parse(localStorage.getItem(galleryKey)||'[]')}catch(_){return []}};
    const galleryButton=document.createElement('button');galleryButton.type='button';galleryButton.textContent='🖼️';
    galleryButton.setAttribute('aria-label','Իմ նկարները');galleryButton.title='Իմ նկարները';
    galleryButton.style.cssText='position:absolute;left:77px;top:-19px;width:32px;height:28px;min-height:28px;border-radius:9px;font-size:17px;padding:0;background:linear-gradient(#b7d4fa,#466eaa);z-index:4;border:1px solid #d8eaff;box-shadow:0 2px 4px #0006';

    const saveGallery=()=>{try{const items=readGallery();items.unshift({image:canvas.toDataURL('image/jpeg',.77),date:Date.now()});localStorage.setItem(galleryKey,JSON.stringify(items.slice(0,12)));hint.textContent='Նկարը պահպանված է պատկերասրահում';return true}catch(_){hint.textContent='Պահպանման հիշողությունը լցված է';return false}};
    const openGallery=()=>{
      clearTimeout(closeTimer);overlay.style.display='flex';grid.replaceChildren();overlay.querySelector('.dialog-title').textContent='🖼️ Իմ նկարները';
      const save=document.createElement('button');save.type='button';save.textContent='＋ Պահել ընթացիկ նկարը';
      save.style.cssText='grid-column:1/-1;padding:13px;border-radius:12px;background:#4b9fdb;color:white;font-weight:bold';
      save.addEventListener('click',()=>{if(saveGallery())openGallery()});grid.appendChild(save);
      readGallery().forEach((item,index)=>{
        const tile=document.createElement('div');tile.style.cssText='position:relative;background:#fff;border-radius:10px;padding:5px;box-shadow:0 2px 6px #0003';
        const img=document.createElement('img');img.src=item.image;img.alt='Պահված նկար';img.style.cssText='width:100%;height:105px;object-fit:contain';
        const open=document.createElement('button');open.type='button';open.textContent='Բացել';open.style.cssText='width:100%;padding:7px;border-radius:7px;background:#3d8fca;color:white';
        open.addEventListener('click',()=>{const pic=new Image();pic.onload=()=>{saveStep();clear();ctx.drawImage(pic,0,0,W,H);barriers.fill(0);closeDialog()};pic.src=item.image});
        const del=document.createElement('button');del.type='button';del.textContent='✕';del.setAttribute('aria-label','Ջնջել նկարը');del.style.cssText='position:absolute;right:2px;top:2px;border-radius:50%;background:#d44;color:white';
        del.addEventListener('click',()=>{const items=readGallery();items.splice(index,1);localStorage.setItem(galleryKey,JSON.stringify(items));openGallery()});
        tile.append(img,open,del);grid.appendChild(tile);
      });
      requestAnimationFrame(()=>requestAnimationFrame(()=>overlay.classList.add('open')));
    };
    const point=e=>{const r=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(W-1,(e.clientX-r.left)*W/r.width)),y:Math.max(0,Math.min(H-1,(e.clientY-r.top)*H/r.height))}};
    const configure=()=>{ctx.globalCompositeOperation='source-over';ctx.strokeStyle=tool==='eraser'?'#fffefa':color;ctx.fillStyle=tool==='eraser'?'#fffefa':color;ctx.lineWidth=tool==='pencil'?Math.max(1,width*.22):tool==='marker'?width*1.3:tool==='pen'?Math.max(1,width*.14):width;ctx.globalAlpha=tool==='marker'?.9:tool==='pencil'?.75:1;ctx.lineCap='round';ctx.lineJoin='round'};
    // Each drawing instrument has its own ink deposition and texture.
    const stroke=(p,q)=>{
      ctx.save();configure();
      const dx=p.x-q.x,dy=p.y-q.y,length=Math.hypot(dx,dy);if(activeColor===0&&tool!=='eraser'){const rainbow=ctx.createLinearGradient(0,0,0,H);['#ff3157','#ffad00','#ffeb31','#27d969','#26a6ff','#8847e7','#ff4eb9'].forEach((c,i)=>rainbow.addColorStop(i/6,c));ctx.strokeStyle=rainbow;ctx.fillStyle=rainbow;ctx.globalAlpha=1;}
      if(tool==='spray'||tool==='glitter'){
        for(let i=0;i<(tool==='spray'?23:9);i++){const ang=Math.random()*6.283,r=Math.sqrt(Math.random())*width*1.5;ctx.beginPath();ctx.arc(p.x+Math.cos(ang)*r,p.y+Math.sin(ang)*r,tool==='spray'?1:Math.random()*2+1,0,6.283);ctx.fill()}
      }else if(tool==='rainbow'){
        ['#ff4c6e','#ffad40','#ffe26d','#54d887','#4bb7f5','#9a73ed'].forEach((c,i)=>{ctx.strokeStyle=c;ctx.lineWidth=Math.max(2,width/2.8);ctx.beginPath();ctx.moveTo(q.x,q.y+(i-2.5)*width/2.5);ctx.lineTo(p.x,p.y+(i-2.5)*width/2.5);ctx.stroke()})
      }else if(tool==='pencil'){
        // Solid uninterrupted pencil line: lighter color, not transparency or grain.
        const size=Math.max(1.6,width*.27);
        const rgb=color.match(/^#([0-9a-f]{6})$/i);
        if(rgb){const n=parseInt(rgb[1],16),mix=v=>Math.round(v*.72+255*.28);ctx.strokeStyle='rgb('+mix((n>>16)&255)+','+mix((n>>8)&255)+','+mix(n&255)+')';ctx.fillStyle=ctx.strokeStyle}
        ctx.globalAlpha=1;ctx.lineWidth=size;ctx.lineCap='round';ctx.lineJoin='round';
        ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(p.x,p.y);ctx.stroke();
        if(length<.5){ctx.beginPath();ctx.arc(p.x,p.y,size/2,0,6.283);ctx.fill()}
      }else if(tool==='marker'){
        // Opaque, continuous felt-tip stroke; no translucent layers or overlapping dabs.
        const size=Math.max(3,width*1.3);
        ctx.globalAlpha=1;ctx.lineWidth=size;ctx.lineCap='round';ctx.lineJoin='round';
        ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(p.x,p.y);ctx.stroke();
        if(length<.5){ctx.beginPath();ctx.arc(p.x,p.y,size/2,0,Math.PI*2);ctx.fill()}
      }else if(tool==='pen'){
        // Ballpoint: crisp fine line, subtle ink pooling at the start/end.
        const size=Math.max(.85,width*.15);
        ctx.globalAlpha=.96;ctx.lineWidth=size;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(p.x,p.y);ctx.stroke();
        ctx.beginPath();ctx.arc(p.x,p.y,size*.47,0,6.283);ctx.fill();
      }else{
        ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(p.x,p.y);ctx.stroke();
        if(p.x===q.x&&p.y===q.y){ctx.beginPath();ctx.arc(p.x,p.y,ctx.lineWidth/2,0,6.283);ctx.fill()}
      }
      ctx.restore()
    };
    const linePatterns={"zigzag":"M5 70 L20 30 L35 70 L50 30 L65 70 L80 30 L95 70","wave":"M5 50 Q16 20 28 50 T51 50 T74 50 T97 50","semicircle":"M10 80 A40 40 0 0 1 90 80","hook":"M50 10 L50 68 Q50 91 27 85 Q12 78 23 62","spiral":"M50 50 C50 40 65 42 64 55 C62 72 32 70 30 49 C27 21 72 15 83 45 C96 80 53 99 26 78","arc":"M10 80 Q50 4 90 80","doublewave":"M5 37 Q16 12 28 37 T51 37 T74 37 T97 37 M5 65 Q16 40 28 65 T51 65 T74 65 T97 65","chevron":"M5 70 L25 30 L45 70 L65 30 L85 70","stairs":"M8 88 L8 70 L28 70 L28 52 L48 52 L48 34 L68 34 L68 16 L92 16","loop":"M7 52 C22 5 40 20 50 50 C60 80 80 95 93 48 C80 10 59 19 50 50 C40 80 19 91 7 52","sline":"M25 15 C88 5 88 43 50 50 C12 57 12 95 75 85","cross":"M50 10 L50 90 M10 50 L90 50","rays":"M50 50 L50 8 M50 50 L80 20 M50 50 L92 50 M50 50 L80 80 M50 50 L50 92 M50 50 L20 80 M50 50 L8 50 M50 50 L20 20","diamondline":"M50 8 L92 50 L50 92 L8 50 Z","curly":"M78 15 Q22 15 48 43 Q62 58 40 64 Q21 70 34 85","mountainline":"M5 82 L28 31 L43 62 L60 15 L95 82","rainbowarc":"M8 85 A42 42 0 0 1 92 85 M20 85 A30 30 0 0 1 80 85 M32 85 A18 18 0 0 1 68 85","dashes":"M5 50 L17 50 M26 50 L38 50 M47 50 L59 50 M68 50 L80 50 M89 50 L96 50","sawtooth":"M5 72 L17 30 L29 72 L41 30 L53 72 L65 30 L77 72 L89 30","squiggle":"M10 75 Q32 8 48 42 T70 55 Q95 88 88 20"};
    const animalOutlines={"butterfly":"M50 26 C34 2 6 10 8 34 C8 52 27 56 44 53 C19 52 12 67 24 83 C34 96 46 80 50 65 C54 80 66 96 76 83 C88 67 81 52 56 53 C73 56 92 52 92 34 C94 10 66 2 50 26 M50 28 Q43 52 50 78 Q57 52 50 28 M47 26 Q40 13 34 11 M53 26 Q60 13 66 11 M22 31 Q32 27 40 38 M78 31 Q68 27 60 38 M30 70 Q37 66 42 72 M70 70 Q63 66 58 72",
"ladybug":"M50 15 C18 15 13 42 18 66 C23 88 77 88 82 66 C87 42 82 15 50 15 Z M50 16 L50 85 M29 21 Q50 7 71 21 M33 8 L26 1 M67 8 L74 1 M17 44 L5 39 M17 62 L5 68 M83 44 L95 39 M83 62 L95 68 M34 37 a5 5 0 1 0 1 0 M65 37 a5 5 0 1 0 1 0 M33 63 a6 6 0 1 0 1 0 M66 63 a6 6 0 1 0 1 0",
"bee":"M21 53 C17 31 44 23 64 33 C87 43 88 66 65 76 C44 85 24 72 21 53 Z M39 31 Q20 3 49 12 Q63 17 54 32 M55 31 Q61 4 79 16 Q88 31 66 37 M40 33 Q34 55 43 76 M58 33 Q52 56 61 78 M80 46 L96 53 L81 60 M19 48 L8 42 M19 60 L8 67",
"ant":"M15 54 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 M39 54 a14 16 0 1 0 28 0 a14 16 0 1 0 -28 0 M67 54 a15 20 0 1 0 30 0 a15 20 0 1 0 -30 0 M22 42 L12 24 M32 43 L41 23 M41 44 L31 30 M41 64 L27 82 M62 44 L73 24 M62 64 L73 83 M82 36 L88 16 M82 74 L89 92",
"dragonfly":"M50 17 Q43 33 50 47 Q57 33 50 17 M50 47 L50 92 M46 55 L54 55 M46 65 L54 65 M46 75 L54 75 M46 85 L54 85 M47 42 C17 4 1 20 39 49 M53 42 C83 4 99 20 61 49 M43 53 C9 46 5 75 44 60 M57 53 C91 46 95 75 56 60 M43 13 L35 4 M57 13 L65 4",
"snail":"M12 76 Q8 61 22 59 Q20 28 48 24 C80 18 90 65 63 76 Z M46 63 C22 59 28 30 51 34 C76 37 70 63 53 63 C38 62 40 45 51 45 C61 45 59 55 52 55 M12 76 L90 76 Q97 74 93 65 L87 65 L85 32 M85 32 L79 20 M85 32 L94 20 M81 45 a2 2 0 1 0 1 0",
"dog":"M24 33 Q7 16 8 46 Q10 62 25 51 M76 33 Q93 16 92 46 Q90 62 75 51 M24 31 Q50 13 76 31 L78 67 Q69 88 50 90 Q31 88 22 67 Z M36 54 a3 3 0 1 0 1 0 M64 54 a3 3 0 1 0 1 0 M43 68 Q50 62 57 68 L50 75 Z M50 75 Q43 84 37 77 M50 75 Q57 84 63 77",
"rabbit":"M28 44 C12 6 25 0 43 37 M57 37 C75 0 88 6 72 44 M28 44 Q50 28 72 44 C91 60 80 90 50 91 C20 90 9 60 28 44 Z M36 59 a3 3 0 1 0 1 0 M64 59 a3 3 0 1 0 1 0 M46 73 L54 73 L50 78 Z M50 78 Q43 84 39 79 M50 78 Q57 84 61 79 M24 73 L9 69 M24 80 L9 83 M76 73 L91 69 M76 80 L91 83",
"bear":"M23 38 C6 14 28 4 40 26 Q50 23 60 26 C72 4 94 14 77 38 C91 55 83 87 50 90 C17 87 9 55 23 38 Z M33 54 a3 3 0 1 0 1 0 M67 54 a3 3 0 1 0 1 0 M35 70 Q50 59 65 70 Q62 86 50 85 Q38 86 35 70 M46 71 L54 71 L50 77 Z",
"elephant":"M20 34 Q35 12 64 25 Q83 32 82 55 L76 55 Q75 84 60 88 Q48 89 49 72 L49 55 Q39 74 21 65 Q6 54 20 34 Z M63 41 Q81 26 92 42 Q93 65 71 66 M49 72 Q48 94 65 91 M34 42 a3 3 0 1 0 1 0 M16 51 Q5 55 13 69",
"turtle":"M20 63 Q17 23 50 22 Q83 23 80 63 Z M20 63 Q50 79 80 63 M50 22 L50 65 M20 47 L80 47 M28 30 L41 47 L29 64 M72 30 L59 47 L71 64 M80 46 Q97 40 94 58 Q91 70 80 63 M25 64 L18 80 L30 77 M69 64 L82 80 L71 77 M44 72 L42 87 L55 87 L56 72 M89 51 a2 2 0 1 0 1 0",
"bird":"M19 64 Q9 32 42 27 Q69 18 80 46 L96 51 L80 59 Q67 88 39 79 Q25 75 19 64 Z M29 53 Q43 37 66 58 Q54 79 34 67 M67 42 a3 3 0 1 0 1 0 M43 79 L40 92 M55 80 L58 92",
"frog":"M17 49 Q9 25 30 25 Q41 26 43 39 Q50 36 57 39 Q59 26 70 25 Q91 25 83 49 Q93 72 72 85 Q50 94 28 85 Q7 72 17 49 Z M26 40 a4 4 0 1 0 1 0 M74 40 a4 4 0 1 0 1 0 M32 65 Q50 82 68 65 M22 77 L7 88 M78 77 L93 88",
"mouse":"M27 44 C-1 38 4 7 29 16 Q43 22 40 40 Q50 35 60 40 C57 22 71 7 87 16 C112 38 81 48 73 44 Q89 62 75 80 Q50 95 25 80 Q11 62 27 44 Z M35 57 a3 3 0 1 0 1 0 M65 57 a3 3 0 1 0 1 0 M45 72 L55 72 L50 78 Z M23 70 L8 66 M23 77 L8 81 M77 70 L92 66 M77 77 L92 81",
"owl":"M20 25 Q50 8 80 25 L82 70 Q76 90 50 93 Q24 90 18 70 Z M20 25 L13 8 L38 20 M80 25 L87 8 L62 20 M24 45 Q33 25 47 44 Q48 63 34 65 Q20 61 24 45 M53 44 Q67 25 76 45 Q80 61 66 65 Q52 63 53 44 M34 48 a3 3 0 1 0 1 0 M66 48 a3 3 0 1 0 1 0 M44 66 L56 66 L50 76 Z M40 92 L37 99 M60 92 L63 99"};
    const shapes=new Set([...Object.keys(linePatterns),'line','circle','rect','star','triangle','heart','diamond','flower','sun','car','truck','bus','house','tree','boat','rocket','fish','butterfly','cat','balloon','train',...Object.keys(animalOutlines)]);
    const shape=(p,q)=>{ctx.save();configure();ctx.beginPath();const kind=shapeMode||tool;if(Object.prototype.hasOwnProperty.call(animalOutlines,kind)){const x=Math.min(p.x,q.x),y=Math.min(p.y,q.y),w=Math.max(15,Math.abs(p.x-q.x)),h=Math.max(15,Math.abs(p.y-q.y));ctx.translate(x,y);ctx.scale(w/100,h/100);ctx.lineWidth=Math.max(1.8,Math.min(4.5,250/Math.max(55,Math.min(w,h))));ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(new Path2D(animalOutlines[kind]));ctx.restore();return}else if(Object.prototype.hasOwnProperty.call(linePatterns,kind)){const x=Math.min(p.x,q.x),y=Math.min(p.y,q.y),w=Math.max(12,Math.abs(p.x-q.x)),h=Math.max(12,Math.abs(p.y-q.y));ctx.translate(x,y);ctx.scale(w/100,h/100);ctx.lineWidth=Math.max(2,Math.min(5,250/Math.max(50,Math.min(w,h))));ctx.stroke(new Path2D(linePatterns[kind]));ctx.restore();return}else if(kind==='ellipse'){ctx.ellipse((q.x+p.x)/2,(q.y+p.y)/2,Math.max(.1,Math.abs(p.x-q.x)/2),Math.max(.1,Math.abs(p.y-q.y)/2),0,0,6.283)}else if(kind==='line'){ctx.moveTo(q.x,q.y);ctx.lineTo(p.x,p.y)}else if(kind==='rect'){ctx.rect(q.x,q.y,p.x-q.x,p.y-q.y)}else if(kind==='circle'){ctx.ellipse((q.x+p.x)/2,(q.y+p.y)/2,Math.max(.1,Math.abs(p.x-q.x)/2),Math.max(.1,Math.abs(p.y-q.y)/2),0,0,6.283)}else if(['triangle','diamond','heart'].includes(kind)){const cx=(q.x+p.x)/2,cy=(q.y+p.y)/2,rx=Math.max(2,Math.abs(p.x-q.x)/2),ry=Math.max(2,Math.abs(p.y-q.y)/2);if(kind==='triangle'){ctx.moveTo(cx,cy-ry);ctx.lineTo(cx+rx,cy+ry);ctx.lineTo(cx-rx,cy+ry)}else if(kind==='diamond'){ctx.moveTo(cx,cy-ry);ctx.lineTo(cx+rx,cy);ctx.lineTo(cx,cy+ry);ctx.lineTo(cx-rx,cy)}else{ctx.moveTo(cx,cy+ry);ctx.bezierCurveTo(cx-2*rx,cy-ry*.3,cx-rx,cy-ry*1.5,cx,cy-ry*.45);ctx.bezierCurveTo(cx+rx,cy-ry*1.5,cx+2*rx,cy-ry*.3,cx,cy+ry)}ctx.closePath()}else if(['car','truck','bus','house','tree','boat','rocket','fish','butterfly','cat','balloon','train'].includes(kind)){const x=Math.min(q.x,p.x),y=Math.min(q.y,p.y),w=Math.max(15,Math.abs(p.x-q.x)),h=Math.max(15,Math.abs(p.y-q.y));ctx.translate(x,y);ctx.scale(w/100,h/100);ctx.lineWidth=Math.max(2.8,380/Math.max(35,Math.min(w,h)));ctx.lineCap='round';ctx.lineJoin='round';const path=(...v)=>{ctx.moveTo(v[0],v[1]);for(let j=2;j<v.length;j+=2)ctx.lineTo(v[j],v[j+1])};const box=(x,y,w,h)=>ctx.rect(x,y,w,h);const circle=(x,y,r)=>{ctx.moveTo(x+r,y);ctx.arc(x,y,r,0,Math.PI*2)};if(['car','truck','bus','train'].includes(kind)){box(8,40,84,35);circle(26,78,11);circle(75,78,11);if(kind==='car'){path(22,40,36,23,68,23,83,40);box(39,26,24,13);path(22,40,83,40)}else if(kind==='truck'){box(9,22,55,18);box(66,35,26,18);box(73,40,11,10)}else if(kind==='bus'){box(8,17,84,23);for(let j=0;j<4;j++)box(15+j*19,23,14,14)}else{box(15,18,49,22);box(64,25,21,15);path(25,18,25,9,56,9,56,18)}}else if(kind==='house'){path(10,43,50,10,90,43,10,43);box(18,43,64,49);box(41,63,18,29);box(24,49,13,13);box(64,49,13,13)}else if(kind==='tree'){box(44,59,12,35);circle(50,34,25);circle(31,51,18);circle(69,51,18)}else if(kind==='boat'){/* Every sail edge terminates exactly on the mast or hull. No open gaps at any scale. */path(8,66,92,66,75,86,25,86,8,66);path(49,66,49,10);path(49,12,16,59,49,59,49,12);path(49,12,82,59,49,59,49,12);path(49,59,49,66)}else if(kind==='rocket'){path(50,8,68,30,68,72,50,85,32,72,32,30,50,8);circle(50,43,9);path(32,59,17,83,32,77);path(68,59,83,83,68,77)}else if(kind==='fish'){ctx.ellipse(47,51,30,22,0,0,Math.PI*2);path(75,51,96,26,96,76,75,51);circle(31,46,3);path(42,29,52,13,63,31)}else if(kind==='butterfly'){ctx.ellipse(29,33,19,26,-.5,0,Math.PI*2);ctx.ellipse(71,33,19,26,.5,0,Math.PI*2);ctx.ellipse(30,72,16,20,.4,0,Math.PI*2);ctx.ellipse(70,72,16,20,-.4,0,Math.PI*2);ctx.ellipse(50,53,5,34,0,0,Math.PI*2);path(48,23,39,7);path(52,23,61,7)}else if(kind==='cat'){circle(50,55,31);path(25,33,20,12,43,26);path(57,26,80,12,75,33);circle(38,51,3);circle(62,51,3);path(46,66,50,70,54,66);path(18,67,35,66);path(65,66,82,67)}else if(kind==='balloon'){ctx.ellipse(50,36,26,30,0,0,Math.PI*2);path(45,66,50,72,55,66);path(50,72,46,87,56,96)}ctx.stroke();ctx.restore();return}else if(kind==='sun'||kind==='flower'){const cx=(q.x+p.x)/2,cy=(q.y+p.y)/2,r=Math.max(4,Math.hypot(p.x-q.x,p.y-q.y)/2);for(let i=0;i<24;i++){const angle=i*Math.PI/12,rad=kind==='sun'?(i%3===0?r:r*.6):(i%2===0?r:r*.42);const x=cx+Math.cos(angle)*rad,y=cy+Math.sin(angle)*rad;if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.closePath()}else{const cx=(q.x+p.x)/2,cy=(q.y+p.y)/2,r=Math.max(3,Math.hypot(p.x-q.x,p.y-q.y)/2);for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.closePath()}ctx.stroke();ctx.restore()};
    // Remember template outlines separately from the children's coloring. Flood regions
    // follow the line art, not the current paint color, so later strokes cannot cross.
    const rememberOutline=(before)=>{const after=snapshot().data,old=before.data,next=barriers.slice();for(let k=0;k<W*H;k++){const i=k*4;if(Math.abs(after[i]-old[i])+Math.abs(after[i+1]-old[i+1])+Math.abs(after[i+2]-old[i+2])>65)next[k]=1}const expanded=next.slice();for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const k=y*W+x;if(next[k]){expanded[k-1]=1;expanded[k+1]=1;expanded[k-W]=1;expanded[k+W]=1}}barriers=expanded};
    const regionAt=(p)=>{const sx=Math.floor(p.x),sy=Math.floor(p.y),origin=sy*W+sx;let seed=origin;const empty=new Uint8Array(W*H);if(barriers[seed]){let found=false;for(let radius=1;radius<=18&&!found;radius++){for(let dy=-radius;dy<=radius&&!found;dy++)for(let dx=-radius;dx<=radius;dx++){const xx=sx+dx,yy=sy+dy;if(xx>=0&&xx<W&&yy>=0&&yy<H&&!barriers[yy*W+xx]){seed=yy*W+xx;found=true;break}}}if(!found)return empty}const region=new Uint8Array(W*H),queue=new Int32Array(W*H);let head=0,tail=1;queue[0]=seed;region[seed]=1;while(head<tail){const k=queue[head++],x=k%W;const visit=n=>{if(!barriers[n]&&!region[n]){region[n]=1;queue[tail++]=n}};if(x>0)visit(k-1);if(x<W-1)visit(k+1);if(k>=W)visit(k-W);if(k<W*(H-1))visit(k+W)}return region};
    const protectRegion=()=>{if(!strokeRegion||!strokeBefore)return;const image=snapshot(),data=image.data,original=strokeBefore.data;for(let k=0;k<W*H;k++){if(!strokeRegion[k]||barriers[k]){const i=k*4;data[i]=original[i];data[i+1]=original[i+1];data[i+2]=original[i+2];data[i+3]=original[i+3]}}restore(image)};
    const bucket=(x,y)=>{const rainbowFill=activeColor===0;const image=snapshot(),d=image.data,k0=(Math.floor(y)*W+Math.floor(x))*4,seed=Array.from(d.slice(k0,k0+4)),temp=document.createElement('canvas').getContext('2d');temp.fillStyle=color;temp.fillRect(0,0,1,1);const target=temp.getImageData(0,0,1,1).data;if(!rainbowFill&&seed.every((v,i)=>v===target[i]))return;const seen=new Uint8Array(W*H),stack=[Math.floor(y)*W+Math.floor(x)];while(stack.length){const k=stack.pop();if(k<0||k>=W*H||seen[k])continue;seen[k]=1;const i=k*4;if(Math.abs(d[i]-seed[0])>20||Math.abs(d[i+1]-seed[1])>20||Math.abs(d[i+2]-seed[2])>20||Math.abs(d[i+3]-seed[3])>20)continue;if(rainbowFill){const palette=[[255,49,87],[255,173,0],[255,235,49],[39,217,105],[38,166,255],[136,71,231],[255,78,185]];const t=(Math.floor(k/W)/(H-1))*6,j=Math.min(5,Math.floor(t)),f=t-j;d[i]=Math.round(palette[j][0]*(1-f)+palette[j+1][0]*f);d[i+1]=Math.round(palette[j][1]*(1-f)+palette[j+1][1]*f);d[i+2]=Math.round(palette[j][2]*(1-f)+palette[j+1][2]*f)}else{d[i]=target[0];d[i+1]=target[1];d[i+2]=target[2]}d[i+3]=255;const xx=k%W;if(xx)stack.push(k-1);if(xx<W-1)stack.push(k+1);if(k>=W)stack.push(k-W);if(k<W*(H-1))stack.push(k+W)}restore(image)};
    // Magic painting: an isolated, editable placement preview. Main canvas is untouched until ✓.
    const placementLayer=document.createElement('canvas');
    placementLayer.width=W;placementLayer.height=H;
    placementLayer.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3';
    const paper=canvas.parentElement;paper.style.position='relative';paper.appendChild(placementLayer);
    // A single orderly control strip; keep the original color dock exclusively for pencils.
    // Invisible two-finger pinch zoom, with no extra toolbar or screen controls.
    const frame=ui.querySelector('.frame');frame.style.overflow='hidden';
    paper.style.transformOrigin='center center';
    let zoom=1;
    // Multi-touch is exclusively a zoom gesture, never a drawing/shape gesture.
    const zoomTouches=new Map();let zoomStart=null,gestureBlocked=false;
    const cancelStroke=()=>{if(down&&base)restore(base);down=false;base=null;strokeRegion=null;strokeBefore=null;last=null;start=null};
    paper.addEventListener('pointerdown',e=>{
      if(placement||e.pointerType!=='touch')return;
      zoomTouches.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(zoomTouches.size>=2){
        cancelStroke();gestureBlocked=true;
        const pts=[...zoomTouches.values()];
        zoomStart={distance:Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y),zoom};
        e.preventDefault();e.stopImmediatePropagation();
      }else if(gestureBlocked){e.preventDefault();e.stopImmediatePropagation()}
    },true);
    paper.addEventListener('pointermove',e=>{
      if(!zoomTouches.has(e.pointerId))return;
      zoomTouches.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(gestureBlocked){e.preventDefault();e.stopImmediatePropagation()}
      if(zoomStart&&zoomTouches.size>=2){
        const pts=[...zoomTouches.values()];
        const distance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);
        zoom=Math.max(1,Math.min(3,zoomStart.zoom*distance/Math.max(1,zoomStart.distance)));
        paper.style.transform='scale('+zoom+')';
      }
    },true);
    const endZoom=e=>{
      if(!zoomTouches.has(e.pointerId))return;
      if(gestureBlocked){e.preventDefault();e.stopImmediatePropagation()}
      zoomTouches.delete(e.pointerId);
      if(zoomTouches.size<2)zoomStart=null;
      if(zoomTouches.size===0)gestureBlocked=false;
    };
    for(const name of ['pointerup','pointercancel','lostpointercapture'])paper.addEventListener(name,endZoom,true);
    const placementCtx=placementLayer.getContext('2d');
    const placementBar=document.createElement('div');
    placementBar.style.cssText='position:absolute;left:50%;bottom:8px;transform:translateX(-50%);display:none;gap:7px;z-index:5;align-items:center;white-space:nowrap';
    paper.appendChild(placementBar);
    const rotateHandle=document.createElement('button');
    rotateHandle.type='button';rotateHandle.textContent='⟳';rotateHandle.setAttribute('aria-label','Պտտել պատկերը');
    rotateHandle.style.cssText='position:absolute;display:none;z-index:6;width:43px;height:43px;border-radius:50%;border:2px solid white;background:linear-gradient(#80baff,#375da2);color:white;font-size:25px;touch-action:none;transform:translate(-50%,-50%);box-shadow:0 3px 9px #0007';
    paper.appendChild(rotateHandle);
    let placement=null,placementDrag=null,rotateDrag=null;
    const activePointers=new Map();let pinchStart=null;
    const placeButton=(label,aria,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',aria);b.style.cssText='min-height:39px;min-width:42px;border:2px solid white;border-radius:12px;background:linear-gradient(#6e93dc,#304a89);color:white;font-size:19px;box-shadow:0 3px 7px #0007';b.addEventListener('click',fn);placementBar.appendChild(b);return b};
    const resizePlacement=factor=>{if(!placement)return;const cx=(placement.a.x+placement.b.x)/2,cy=(placement.a.y+placement.b.y)/2;for(const p of [placement.a,placement.b]){p.x=cx+(p.x-cx)*factor;p.y=cy+(p.y-cy)*factor}renderPlacement()};
    const drawPlacement=target=>{if(!placement)return;const cx=(placement.a.x+placement.b.x)/2,cy=(placement.a.y+placement.b.y)/2;const oldMode=shapeMode,oldColor=color;shapeMode=placement.kind;color=placement.color;target.save();target.translate(cx,cy);target.rotate(placement.angle);target.translate(-cx,-cy);const main=ctx;ctx=target;try{
      if(placement.kind.startsWith('smart-')&&placement.vertices){
        const w=placement.b.x-placement.a.x,h=placement.b.y-placement.a.y;
        let v=placement.vertices.map(p=>({x:placement.a.x+p.x*w,y:placement.a.y+p.y*h}));
        if(placement.kind==='smart-curve'||placement.kind==='smart-closed-curve'){
          target.beginPath();target.moveTo(v[0].x,v[0].y);
          for(let i=0;i<v.length-1;i++){
            const p0=v[Math.max(0,i-1)],p1=v[i],p2=v[i+1],p3=v[Math.min(v.length-1,i+2)];
            // Centripetal-like cubic smoothing: smooth continuity without
            // snapping open handwriting to a zigzag or closing its endpoints.
            const t=.18;
            target.bezierCurveTo(p1.x+(p2.x-p0.x)*t,p1.y+(p2.y-p0.y)*t,p2.x-(p3.x-p1.x)*t,p2.y-(p3.y-p1.y)*t,p2.x,p2.y);
          }
          if(placement.kind==='smart-closed-curve')target.closePath();
          target.strokeStyle=placement.color;target.lineWidth=width;target.lineJoin='round';target.lineCap='round';target.globalAlpha=1;target.stroke();return;
        }
        if(placement.kind==='smart-square'||placement.kind==='smart-rectangle'){
          const x=Math.min(...v.map(p=>p.x)),y=Math.min(...v.map(p=>p.y)),right=Math.max(...v.map(p=>p.x)),bottom=Math.max(...v.map(p=>p.y));
          if(placement.kind==='smart-square'){const side=Math.min(right-x,bottom-y),cx=(x+right)/2,cy=(y+bottom)/2;v=[{x:cx-side/2,y:cy-side/2},{x:cx+side/2,y:cy-side/2},{x:cx+side/2,y:cy+side/2},{x:cx-side/2,y:cy+side/2}]}
          else v=[{x,y},{x:right,y},{x:right,y:bottom},{x,y:bottom}];
        }else if(placement.kind==='smart-diamond'){const x=Math.min(...v.map(p=>p.x)),y=Math.min(...v.map(p=>p.y)),right=Math.max(...v.map(p=>p.x)),bottom=Math.max(...v.map(p=>p.y));v=[{x:(x+right)/2,y},{x:right,y:(y+bottom)/2},{x:(x+right)/2,y:bottom},{x,y:(y+bottom)/2}]}
        target.beginPath();target.moveTo(v[0].x,v[0].y);for(const p of v.slice(1))target.lineTo(p.x,p.y);
        if(placement.kind!=='smart-polyline'||placement.closed)target.closePath();
        target.strokeStyle=placement.color;target.lineWidth=width;target.lineJoin='round';target.lineCap='round';target.globalAlpha=1;target.stroke();
      }else shape(placement.a,placement.b)
    }finally{ctx=main;target.restore();shapeMode=oldMode;color=oldColor}};
    const renderPlacement=()=>{
      placementCtx.clearRect(0,0,W,H);
      if(!placement){placementBar.style.display='none';rotateHandle.style.display='none';cornerHandles.forEach(({handle})=>handle.style.display='none');activePointers.clear();pinchStart=null;return}
      drawPlacement(placementCtx);
      const cx=(placement.a.x+placement.b.x)/2,cy=(placement.a.y+placement.b.y)/2;
      const w=Math.max(12,Math.abs(placement.a.x-placement.b.x)),h=Math.max(12,Math.abs(placement.a.y-placement.b.y));
      placementCtx.save();placementCtx.translate(cx,cy);placementCtx.rotate(placement.angle);
      placementCtx.strokeStyle='#3299e8';placementCtx.lineWidth=2.8;placementCtx.setLineDash([9,5]);
      placementCtx.strokeRect(-w/2-8,-h/2-8,w+16,h+16);placementCtx.setLineDash([]);
      placementCtx.fillStyle='#fff';placementCtx.strokeStyle='#3299e8';
      for(const x of [-w/2-8,w/2+8])for(const y of [-h/2-8,h/2+8]){placementCtx.beginPath();placementCtx.rect(x-5,y-5,10,10);placementCtx.fill();placementCtx.stroke()}
      placementCtx.restore();
      const handleY=cy-(h/2+32)*Math.cos(placement.angle);
      const handleX=cx+(h/2+32)*Math.sin(placement.angle);
      rotateHandle.style.left=(handleX/W*100)+'%';rotateHandle.style.top=(handleY/H*100)+'%';
      cornerHandles.forEach(({handle,sx,sy})=>{const dx=sx*(w/2+8),dy=sy*(h/2+8),px=cx+dx*Math.cos(placement.angle)-dy*Math.sin(placement.angle),py=cy+dx*Math.sin(placement.angle)+dy*Math.cos(placement.angle);handle.style.left=(px/W*100)+'%';handle.style.top=(py/H*100)+'%';handle.style.display='block'});
      rotateHandle.style.display='block';placementBar.style.display='flex';
      hint.textContent='Մատով տեղափոխիր • 2 մատով չափափոխիր • ⟳ շրջիր • ✓ հաստատիր';
    };
    // Four draggable corner handles: resize width and height independently in the object's rotated axes.
    const cornerHandles=[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy])=>{
      const handle=document.createElement('div');
      handle.style.cssText='position:absolute;display:none;z-index:7;width:26px;height:26px;transform:translate(-50%,-50%);touch-action:none;cursor:nwse-resize';
      handle.innerHTML='<span style="display:block;width:12px;height:12px;margin:7px;background:white;border:2px solid #3299e8;border-radius:2px;box-shadow:0 1px 4px #0006"></span>';
      paper.appendChild(handle);
      let resizing=null;
      handle.addEventListener('pointerdown',e=>{if(!placement)return;e.preventDefault();e.stopPropagation();handle.setPointerCapture(e.pointerId);const cx=(placement.a.x+placement.b.x)/2,cy=(placement.a.y+placement.b.y)/2;const w=Math.max(12,Math.abs(placement.b.x-placement.a.x)),h=Math.max(12,Math.abs(placement.b.y-placement.a.y));resizing={id:e.pointerId,cx,cy,w,h,angle:placement.angle,sx,sy}});
      handle.addEventListener('pointermove',e=>{if(!resizing||e.pointerId!==resizing.id||!placement)return;e.preventDefault();const p=point(e),dX=p.x-resizing.cx,dY=p.y-resizing.cy,cos=Math.cos(resizing.angle),sin=Math.sin(resizing.angle),localX=dX*cos+dY*sin,localY=-dX*sin+dY*cos;const fixedX=-resizing.sx*resizing.w/2,fixedY=-resizing.sy*resizing.h/2;const draggedX=resizing.sx===1?Math.max(fixedX+12,localX):Math.min(fixedX-12,localX),draggedY=resizing.sy===1?Math.max(fixedY+12,localY):Math.min(fixedY-12,localY);const centerX=(fixedX+draggedX)/2,centerY=(fixedY+draggedY)/2;const newCx=resizing.cx+centerX*cos-centerY*sin,newCy=resizing.cy+centerX*sin+centerY*cos;const halfW=Math.abs(draggedX-fixedX)/2,halfH=Math.abs(draggedY-fixedY)/2;placement.a={x:newCx-halfW,y:newCy-halfH};placement.b={x:newCx+halfW,y:newCy+halfH};renderPlacement()});
      for(const ev of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(ev,()=>{resizing=null});
      return {handle,sx,sy};
    });
    rotateHandle.addEventListener('pointerdown',e=>{if(!placement)return;e.preventDefault();e.stopPropagation();rotateHandle.setPointerCapture(e.pointerId);rotateDrag={id:e.pointerId}});
    rotateHandle.addEventListener('pointermove',e=>{if(!placement||!rotateDrag||rotateDrag.id!==e.pointerId)return;e.preventDefault();const p=point(e),cx=(placement.a.x+placement.b.x)/2,cy=(placement.a.y+placement.b.y)/2;placement.angle=Math.atan2(p.x-cx,cy-p.y);renderPlacement()});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])rotateHandle.addEventListener(name,()=>{rotateDrag=null});
    placeButton('✕','Չեղարկել',()=>{placement=null;renderPlacement()});
    const confirmPlacement=placeButton('✓','Հաստատել դիրքը',()=>{if(!placement)return;saveStep();const before=snapshot();drawPlacement(ctx);rememberOutline(before);placement=null;if(!shapeMode&&!['marker','pencil','pen','brush','bucket','eraser'].includes(tool))tool='marker';updateToolTab();toolButtons.forEach((button,id)=>button.classList.toggle('on',id===tool));hint.textContent='🎨 '+(types.find(([id])=>id===tool)?.[2]||'Նկարել');renderPlacement()});
    confirmPlacement.style.background='linear-gradient(#54e68c,#178c4d)';
    canvas.addEventListener('pointerdown',e=>{if(!placement)return;e.preventDefault();e.stopImmediatePropagation();try{canvas.setPointerCapture(e.pointerId)}catch(_){}activePointers.set(e.pointerId,point(e));placementDrag=null;if(activePointers.size===1)placementDrag=point(e);if(activePointers.size===2){const pts=[...activePointers.values()];pinchStart={distance:Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y),a:{...placement.a},b:{...placement.b}}}});
    canvas.addEventListener('pointermove',e=>{if(!placement||!activePointers.has(e.pointerId))return;e.preventDefault();e.stopImmediatePropagation();const p=point(e),prev=activePointers.get(e.pointerId);activePointers.set(e.pointerId,p);
      if(activePointers.size===2&&pinchStart){const pts=[...activePointers.values()],dist=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y),factor=Math.max(.2,Math.min(5,dist/Math.max(1,pinchStart.distance)));const cx=(pinchStart.a.x+pinchStart.b.x)/2,cy=(pinchStart.a.y+pinchStart.b.y)/2;placement.a={x:cx+(pinchStart.a.x-cx)*factor,y:cy+(pinchStart.a.y-cy)*factor};placement.b={x:cx+(pinchStart.b.x-cx)*factor,y:cy+(pinchStart.b.y-cy)*factor}}
      else if(activePointers.size===1){for(const v of [placement.a,placement.b]){v.x+=p.x-prev.x;v.y+=p.y-prev.y}}
      // Keep movable objects inside the drawing paper.
      const boxW=Math.abs(placement.b.x-placement.a.x),boxH=Math.abs(placement.b.y-placement.a.y);
      const midX=(placement.a.x+placement.b.x)/2,midY=(placement.a.y+placement.b.y)/2;
      const halfW=Math.min(W/2,boxW/2),halfH=Math.min(H/2,boxH/2);
      const fixedX=Math.max(halfW,Math.min(W-halfW,midX)),fixedY=Math.max(halfH,Math.min(H-halfH,midY));
      placement.a.x+=fixedX-midX;placement.b.x+=fixedX-midX;
      placement.a.y+=fixedY-midY;placement.b.y+=fixedY-midY;
      renderPlacement()});
    for(const eventName of ['pointerup','pointercancel'])canvas.addEventListener(eventName,e=>{if(!placement)return;e.stopImmediatePropagation();activePointers.delete(e.pointerId);pinchStart=null;placementDrag=activePointers.size===1?[...activePointers.values()][0]:null});
    canvas.addEventListener('pointerdown',e=>{if(!eyedropper)return;e.preventDefault();e.stopImmediatePropagation();const p=point(e);const rgba=ctx.getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data;if(rgba[3]>20){const hex='#'+[rgba[0],rgba[1],rgba[2]].map(n=>n.toString(16).padStart(2,'0')).join('');setColor(hex);activeColor=inks.length-1;tool='marker';shapeMode=null;updateToolTab();toolButtons.forEach((button,id)=>button.classList.toggle('on',id===tool));hint.textContent='Գույնն ընտրված է'}else hint.textContent='Դիպչիր գունավոր հատվածին';eyedropper=false;pickButton.style.outline='none'},true);
    canvas.addEventListener('pointerdown',e=>{if(gestureBlocked||zoomTouches.size>1)return;if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();try{canvas.setPointerCapture(e.pointerId)}catch(_){}down=true;last=start=point(e);saveStep();base=(shapeMode||shapes.has(tool))?snapshot():null;strokeRegion=(!base&&tool!=='bucket'&&barriers.some(v=>v!==0))?regionAt(last):null;strokeBefore=strokeRegion?snapshot():null;if(tool==='bucket'){bucket(last.x,last.y);down=false;return}if(!(shapeMode||shapes.has(tool))){stroke(last,last);protectRegion()}});
    canvas.addEventListener('pointermove',e=>{if(gestureBlocked||!down)return;e.preventDefault();const p=point(e);if(shapeMode||shapes.has(tool)){restore(base);shape(p,start)}else{stroke(p,last);protectRegion()}last=p});
    const finish=e=>{if(gestureBlocked){cancelStroke();return}if(!down)return;down=false;if((shapeMode||shapes.has(tool))&&e){restore(base);placement={a:{...start},b:point(e),angle:0,kind:shapeMode||tool,color};renderPlacement()}base=null;strokeRegion=null;strokeBefore=null;last=null;start=null};
    canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);canvas.addEventListener('lostpointercapture',()=>{down=false;base=null;strokeRegion=null;strokeBefore=null});
    gameCleanup.push(()=>{clearTimeout(closeTimer);down=false;placement=null;placementLayer.remove();placementBar.remove();rotateHandle.remove();cornerHandles.forEach(({handle})=>handle.remove());canvas.width=1;canvas.height=1});
  }
  function gameStickers(){
    // Self-contained music studio. Do not modify shared header, stars or other activities.
    const host=surface(null);
    const css=document.createElement('style');
    css.textContent=`
      .areg-beat-studio{box-sizing:border-box;width:100%;height:100%;min-height:490px;padding:12px 10px 18px;overflow:auto;position:relative;border-radius:20px;background:radial-gradient(ellipse at 50% 0%,#34437a 0%,#111b3d 52%,#090d20 100%);color:#fff;font-family:system-ui,-apple-system,sans-serif;touch-action:pan-y}
      /* Only this music game's shared title: keep its wooden header aligned with back/stars. */
      #activityScreen[data-game="stickers"] .activity-title-wrap{height:58px;min-height:58px;overflow:hidden;justify-content:center}
      #activityScreen[data-game="stickers"] .activity-title{font-size:18px;line-height:1.08;overflow-wrap:normal}
      .areg-beat-studio *{box-sizing:border-box}
      .areg-beat-heading{text-align:center;font-weight:950;font-size:21px;letter-spacing:1.1px;color:#fff7d9;text-shadow:0 3px 0 #26316d,0 0 17px #65baff}
      .areg-beat-sub{text-align:center;font-size:11px;opacity:.83;margin:2px 0 10px}
      .areg-beat-toolbar{display:flex;gap:7px;margin-bottom:10px;align-items:stretch}
      .areg-beat-select,.areg-beat-control{flex:1;min-width:0;border:1px solid #8db1ff8c;border-radius:12px;padding:10px 5px;color:#fff;background:linear-gradient(#47548b,#232d62);font-size:12px;font-weight:800;text-align:center;box-shadow:inset 0 2px 1px #ffffff45,0 4px 0 #0a1233;appearance:none}
      .areg-beat-control{flex:0 0 63px}
      .areg-beat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;perspective:800px;padding:6px 2px 14px}
      .areg-beat-pad{position:relative;aspect-ratio:1/1;min-height:58px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:4px;border:2px solid #ffffff5c;border-radius:17px;color:#fff;cursor:pointer;touch-action:manipulation;background:linear-gradient(160deg,#ffffff87 0%,#ffffff20 18%,transparent 43%),linear-gradient(150deg,var(--pad),#101a4a);box-shadow:inset 0 3px 4px #ffffff7a,inset 0 -7px 9px #0005,0 7px 0 #070b23,0 10px 14px #0009;transform:translateY(0);transition:transform .12s,box-shadow .12s,filter .12s,border-color .12s}
      .areg-beat-pad[data-instrument='0']{background:linear-gradient(155deg,#fffdf0aa,#b6d5ff44 38%,var(--pad) 72%,#111b4b);border-color:#f5f2e5}
      .areg-beat-pad[data-instrument='1']{background:linear-gradient(155deg,#ffe1a788,#a76b4344 38%,var(--pad) 72%,#211129)}
      .areg-beat-pad[data-instrument='2']{background:linear-gradient(155deg,#ffd7ae88,#8d3f3744 38%,var(--pad) 72%,#22112d)}
      .areg-beat-pad[data-instrument='3']{background:linear-gradient(155deg,#c9e5ff88,#263d7144 38%,var(--pad) 72%,#0b1939)}
      .areg-beat-pad:before{content:'';position:absolute;inset:5px;border:1px solid #ffffff36;border-radius:11px;pointer-events:none}
      .areg-beat-pad .symbol{font-size:27px;line-height:1;filter:drop-shadow(0 2px 2px #0008)}
      .areg-beat-pad .label{font-size:9px;font-weight:850;text-shadow:0 1px 2px #000a;line-height:1.1}
      .areg-beat-pad.on{transform:translateY(5px) scale(.98);border:3px solid #fff9b9;filter:brightness(1.42) saturate(1.4);box-shadow:inset 0 0 0 3px #fff8,inset 0 0 15px #fff9,0 2px 0 #090e29,0 0 18px 5px var(--pad),0 0 28px 6px #fff5}
      .areg-beat-pad.pulse{filter:brightness(1.8) saturate(1.6);box-shadow:inset 0 0 22px #fff,0 0 26px 7px var(--pad),0 2px 0 #080d24}
      .areg-beat-bottom{display:flex;justify-content:center;align-items:center;gap:10px;font-size:12px;color:#d6e4ff}
      .areg-beat-lamp{width:9px;height:9px;border-radius:50%;background:#48ffba;box-shadow:0 0 12px #48ffba;animation:aregBeatBlink 1s infinite alternate}
      @keyframes aregBeatBlink{to{opacity:.35;transform:scale(.8)}}
      @media(max-width:400px){.areg-beat-studio{padding:10px 8px}.areg-beat-grid{gap:7px}.areg-beat-pad{border-radius:13px}.areg-beat-pad .symbol{font-size:23px}.areg-beat-pad .label{font-size:8px}}
      @media(prefers-reduced-motion:reduce){.areg-beat-lamp{animation:none}.areg-beat-pad{transition:none}}
    `;
    host.appendChild(css);
    const wrap=document.createElement('div');wrap.className='areg-beat-studio';
    wrap.innerHTML='<div class="areg-beat-heading">🎶 Երաժշտական աշխարհ 3D</div><div class="areg-beat-sub">Միացրու մի քանի կոճակ՝ ստեղծիր քո ռիթմը</div><div class="areg-beat-toolbar"><select class="areg-beat-select" aria-label="Ռիթմ"><option value="0">🪩 Պարային</option><option value="1">🎤 Հիփ-հոփ</option><option value="2">⚡ Էլեկտրոնային</option><option value="3">🌴 Լատինո</option></select><select class="areg-beat-select" aria-label="Գործիք"><option value="0">🎹 Դաշնամուր</option><option value="1">🎸 Կիթառ</option><option value="2">🎻 Ջութակ</option><option value="3">🥁 Հարվածայիններ</option><option value="4">🎼 Մարիմբա</option><option value="5">🎶 Քսիլոֆոն</option></select><button class="areg-beat-control" type="button" aria-label="Անջատել ձայնը">🔊</button></div><div class="areg-beat-grid"></div><div class="areg-beat-bottom"><span class="areg-beat-lamp"></span><span class="areg-beat-caption">Ընտրիր գույները և միացրու երաժշտությունը</span></div>';
    host.appendChild(wrap);
    const grid=wrap.querySelector('.areg-beat-grid'),selectors=wrap.querySelectorAll('select'),mute=wrap.querySelector('.areg-beat-control'),caption=wrap.querySelector('.areg-beat-caption');
    const labels=['Բաս','Թմբուկ','Հարված','Ծափ','Հեթ','Շեյքեր','Ռիթմ','Տոմ','Դո','Ռե','Մի','Ֆա','Սոլ','Լյա','Սի','Դո+','Ակորդ','Ակորդ 2','Ակորդ 3','Արպեջիո','Էֆեկտ','Զանգ','Լազեր','Փայլ'];
    const symbols=['🎸','🥁','🥁','👏','🎩','🪇','🪘','🥁','🎹','🎵','🎶','🎼','🎹','🎵','🎶','🎹','🎼','🎹','🎼','✨','🌟','🔔','🚀','💫'];
    const palettes=[
      ['#ff4775','#ff9a3e','#ffdd42','#72d965','#2de0c6','#31bbf2','#8e78ff','#f46bc2'],
      ['#ff7355','#dbad52','#8c74db','#43b0d8','#ca62a4','#a2c36b','#ef9472','#637ee4'],
      ['#25d6f5','#8c5aff','#f73bb5','#e5ed41','#50e7a0','#ff704d','#629fff','#bf63ff'],
      ['#ffc054','#ff695c','#74dc82','#44c7c8','#e487eb','#ffdc5d','#72b6ff','#ef9a65']
    ];
    const active=new Set(),pads=[];let rhythm=0,instrument=0,silent=false,audio=null,master=null,fxSend=null,timer=null,nextTime=0,step=0,closed=false;
    const bpm=[124,92,138,112];
    // All pitched pads share a C-minor pentatonic palette and one chord progression.
    const scale=[0,3,5,7,10],roots=[0,8,3,10];
    for(let i=0;i<24;i++){
      const pad=document.createElement('button');pad.type='button';pad.className='areg-beat-pad';pad.setAttribute('aria-pressed','false');pad.setAttribute('aria-label',labels[i]);pad.innerHTML='<span class="symbol">'+symbols[i]+'</span><span class="label">'+labels[i]+'</span>';
      pad.addEventListener('click',()=>{if(closed)return;ensureAudio();if(active.has(i)){active.delete(i);pad.classList.remove('on');pad.setAttribute('aria-pressed','false')}else{active.add(i);pad.classList.add('on');pad.setAttribute('aria-pressed','true');if(audio&&audio.state!=='running')audio.resume().catch(()=>{caption.textContent='Սեղմիր նորից՝ ձայնը միացնելու համար'})}caption.textContent=active.size+' միացված • '+['Պարային','Հիփ-հոփ','Էլեկտրոնային','Լատինո'][rhythm]});
      grid.appendChild(pad);pads.push(pad);
    }
    function updateInstrumentLook(){
      const themes=['🎹','🎸','🎻','🥁','🎼','🎶'];
      pads.forEach((pad,i)=>{
        if(i<8)return;
        const symbol=pad.querySelector('.symbol'),label=pad.querySelector('.label');
        if(!symbol||!label)return;
        symbol.textContent=instrument===0?(i%3===0?'🎹':'🎵'):instrument===1?'🎸':instrument===2?'🎻':instrument===3?'🥁':instrument===4?'🎼' :'🎶';
        label.textContent=instrument===3?['Բիթ','Թմբուկ','Ռիթմ','Ծափ'][i%4]:instrument===0?['Դո','Ռե','Մի','Ֆա','Սոլ','Լյա','Սի','Դո+'][(i-8)%8]:instrument===1?'Լար '+(i-7):instrument===2?'Նոտա '+(i-7):instrument===4?'Ձայն '+(i-7):'Ձող '+(i-7);
        pad.dataset.instrument=String(instrument);
      });
    }
    function recolor(){pads.forEach((p,i)=>p.style.setProperty('--pad',palettes[rhythm][(i+Math.floor(i/4)*2)%8]))}
    recolor();updateInstrumentLook();
    function ensureAudio(){
      if(closed)return;
      try{
        if(!audio){const AC=window.AudioContext||window.webkitAudioContext;if(!AC){caption.textContent='Այս սարքում ձայնը հասանելի չէ';return}try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(_){}audio=new AC();master=audio.createGain();master.gain.value=.46;const limiter=audio.createDynamicsCompressor();limiter.threshold.value=-21;limiter.knee.value=22;limiter.ratio.value=5;limiter.attack.value=.012;limiter.release.value=.19;master.connect(limiter);limiter.connect(audio.destination);const delay=audio.createDelay(.6),feedback=audio.createGain(),wet=audio.createGain();delay.delayTime.value=.19;feedback.gain.value=.16;wet.gain.value=.12;fxSend=audio.createGain();fxSend.gain.value=.34;fxSend.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(limiter);nextTime=audio.currentTime+.06;timer=setInterval(tick,25)}
        if(audio.state!=='running')audio.resume().then(()=>{if(!closed){nextTime=audio.currentTime+.06;tick()}}).catch(()=>{caption.textContent='Սեղմիր կոճակը՝ ձայնը միացնելու համար'});
      }catch(e){console.warn('Music audio unavailable',e)}
    }
    // Soft musical voices with transient shaping, filtering and restrained ambience.
    function voice(hz,t,dur,kind,vol=.1){
      if(!audio||!master)return;
      const osc=audio.createOscillator(),gain=audio.createGain(),filter=audio.createBiquadFilter();
      const attack=(kind==='pad'||kind==='synth'||kind==='violin')?.09:.008,release=(kind==='pad'||kind==='synth')?.38:kind==='bass'?.13:kind==='guitar'?.11:kind==='violin'?.36:.22;
      const peak=Math.max(.001,vol),end=t+dur+release;
      osc.type=kind==='guitar'?'triangle':kind==='synth'?'sawtooth':kind==='violin'?'triangle':kind==='bass'?'triangle':'sine';
      osc.frequency.setValueAtTime(hz,t);
      filter.type='lowpass';filter.frequency.value=kind==='bass'?420:kind==='guitar'?1050:kind==='synth'?900:kind==='violin'?1150:kind==='pad'?1300:kind==='marimba'?1700:2400;
      gain.gain.setValueAtTime(.0001,t);
      gain.gain.linearRampToValueAtTime(peak,t+attack);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0002,peak*((kind==='pad'||kind==='synth')?.48:.17)),t+dur);
      gain.gain.exponentialRampToValueAtTime(.0001,end);
      osc.connect(filter);filter.connect(gain);gain.connect(master);
      if(fxSend&&kind!=='bass')gain.connect(fxSend);
      osc.start(t);osc.stop(end+.025);
      if(kind==='piano'||kind==='guitar'||kind==='violin'||kind==='marimba'||kind==='synth'){
        const color=audio.createOscillator(),cg=audio.createGain();
        const ratio=kind==='piano'?2:kind==='guitar'?3:kind==='violin'?2.003:kind==='marimba'?3.98:1.005;
        const strength=kind==='piano'?.24:kind==='guitar'?.11:kind==='violin'?.10:kind==='marimba'?.32:.25;
        color.type=kind==='synth'?'triangle':'sine';
        color.frequency.value=hz*ratio;
        cg.gain.setValueAtTime(.0001,t);
        cg.gain.linearRampToValueAtTime(Math.max(.0001,peak*strength),t+.006);
        cg.gain.exponentialRampToValueAtTime(.0001,t+(kind==='synth'?dur+.25:kind==='piano'?.23:kind==='guitar'?.11:.18));
        color.connect(cg);cg.connect(master);color.start(t);color.stop(t+(kind==='synth'?dur+.26:.26));
      }
      if(kind==='bell'||kind==='pluck'){
        const overtone=audio.createOscillator(),g=audio.createGain();
        overtone.type='sine';overtone.frequency.value=hz*(kind==='bell'?2.01:2);
        g.gain.setValueAtTime(Math.max(.0001,peak*.16),t);
        g.gain.exponentialRampToValueAtTime(.0001,t+Math.min(.19,dur));
        overtone.connect(g);g.connect(master);overtone.start(t);overtone.stop(t+Math.min(.19,dur)+.01);
      }
    }
    // Distinctive instrument articulations, synthesized locally for offline PWA.
    function instrumentVoice(midi,t,dur,vol=.055){
      if(!audio||!master)return;
      const f=440*Math.pow(2,(midi-69)/12),type=instrument;
      if(type===3){percussion(['kick','snare','hat','clap','shaker'][Math.abs(midi)%5],t);return}
      const attack=[.004,.003,.12,.004,.002,.002][type];
      const sustain=[.21,.10,.78,.1,.14,.075][type];
      const release=[.22,.12,.42,.1,.19,.12][type];
      const duration=type===2?Math.max(.32,dur):type===5?Math.min(.24,dur):dur;
      const partials=type===0?[[1,1],[2,.23],[3,.085]]:type===1?[[1,1],[2,.34],[3,.17],[4,.08]]:type===2?[[1,1],[2,.35],[3,.21],[4,.13]]:type===4?[[1,1],[2,.12],[3.98,.31]]:[[1,1],[2.02,.28],[3.93,.15],[5.4,.055]];
      const filter=audio.createBiquadFilter(),env=audio.createGain();
      filter.type='lowpass';filter.frequency.setValueAtTime([2600,1750,2200,1800,3200,3800][type],t);
      if(type===1)filter.frequency.exponentialRampToValueAtTime(580,t+.19);
      if(type===5)filter.frequency.exponentialRampToValueAtTime(1700,t+.16);
      env.gain.setValueAtTime(.0001,t);env.gain.linearRampToValueAtTime(vol,t+attack);
      env.gain.exponentialRampToValueAtTime(Math.max(.0002,vol*sustain),t+attack+duration);
      env.gain.exponentialRampToValueAtTime(.0001,t+attack+duration+release);
      filter.connect(env);env.connect(master);if(fxSend)env.connect(fxSend);
      for(const [ratio,weight] of partials){
        const osc=audio.createOscillator(),g=audio.createGain();osc.type='sine';
        osc.frequency.setValueAtTime(f*ratio,t);
        if(type===2){osc.frequency.setValueAtTime(f*ratio*.998,t);osc.frequency.linearRampToValueAtTime(f*ratio*1.002,t+duration)}
        g.gain.value=weight;osc.connect(g);g.connect(filter);osc.start(t);osc.stop(t+attack+duration+release+.02);
      }
    }
    function percussion(kind,t){
      if(!audio||!master)return;
      if(kind==='kick'){
        const osc=audio.createOscillator(),g=audio.createGain();osc.type='sine';
        osc.frequency.setValueAtTime(135,t);osc.frequency.exponentialRampToValueAtTime(47,t+.12);
        g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.34,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.20);
        osc.connect(g);g.connect(master);osc.start(t);osc.stop(t+.21);return;
      }
      const duration=kind==='hat'?.032:kind==='shaker'?.055:.095;
      const buf=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate),data=buf.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,1.4);
      const src=audio.createBufferSource(),fl=audio.createBiquadFilter(),g=audio.createGain();src.buffer=buf;
      fl.type=kind==='snare'?'bandpass':'highpass';fl.frequency.value=kind==='hat'?7500:kind==='shaker'?4600:kind==='clap'?2100:1450;
      fl.Q.value=.6;g.gain.setValueAtTime(kind==='hat'?.065:kind==='shaker'?.065:.13,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
      src.connect(fl);fl.connect(g);g.connect(master);src.start(t);src.stop(t+duration+.005);
    }
    const hz=midi=>440*Math.pow(2,(midi-69)/12);
    // C minor -> A-flat major -> E-flat major -> B-flat major.
    // Each bar uses only its own chord tones and compatible pentatonic passing notes.
    const harmony=[
      {bass:36,notes:[60,63,67,70,72,75,79]},
      {bass:44,notes:[56,60,63,68,72,75,80]},
      {bass:39,notes:[58,63,67,70,75,79,82]},
      {bass:46,notes:[58,62,65,70,74,77,82]}
    ];
    function play(id,t,k){
      if(!audio||silent||closed||audio.state!=='running')return;
      const h=harmony[Math.floor(step/16)%4],quarter=60/bpm[rhythm],dur=quarter*.65;
      if(id===0){voice(hz(h.bass),t,quarter*.64,'bass',.17);return}
      if(id===1){percussion('kick',t);return}
      if(id===2){percussion('snare',t);return}
      if(id===3){percussion('clap',t);return}
      if(id===4){percussion('hat',t);return}
      if(id===5){percussion('shaker',t);return}
      if(id===6){voice(hz(h.bass+12),t,.11,'pluck',.045);return}
      if(id===7){percussion('snare',t);return}
      if(id<16){
        const index=(id-8+Math.floor(k/4))%h.notes.length;
        const n=h.notes[index]+(id>=13?0:-12);
        const kind=['piano','guitar','violin','drums','marimba','xylophone'][instrument];
        instrumentVoice(n,t,instrument===2?quarter*1.35:instrument===1?quarter*.42:dur,.055);
        return;
      }
      if(id<20){
        // Voiced chord tones from the current harmony, with controlled polyphony.
        const offsets=[[0,1,2],[1,2,3],[0,2,4],[2,3,5]][id-16];
        for(const ix of offsets)instrumentVoice(h.notes[ix]-12,t,quarter*1.35,.018);
        return;
      }
      const n=h.notes[(id-20+Math.floor(k/4))%h.notes.length]+12;
      instrumentVoice(n,t,.19,.035);
    }
    const grooves=[
      [[0,4,8,12],[0,4,8,12],[4,12],[4,12],[0,2,4,6,8,10,12,14],[2,6,10,14],[3,11],[7,15]],
      [[0,7,10],[0,7,10],[4,12],[4,12],[0,2,4,6,8,10,12,14],[2,6,10,14],[3,11],[7,15]],
      [[0,3,6,9,12,15],[0,4,8,12],[4,12],[4,12],[0,2,4,6,8,10,12,14],[1,5,9,13],[3,11],[7,15]],
      [[0,3,6,8,11,14],[0,4,8,12],[4,12],[4,12],[0,2,4,6,8,10,12,14],[2,6,10,14],[3,11],[7,15]]
    ];
    function tick(){
      if(!audio||closed||audio.state!=='running')return;
      const beat=60/bpm[rhythm]/4;
      if(nextTime<audio.currentTime-.2)nextTime=audio.currentTime+.02;
      let count=0;
      while(nextTime<audio.currentTime+.12&&count++<10){
        const k=step%16;
        for(const id of active){
          // Restore the earlier approved Launchpad groove patterns, adapted to
          // the new 24-pad layout. Keep the current 3D UI and audio clock.
          const groove=id<8?grooves[rhythm][id]:id<16?[[0,4,8,12],[2,6,10,14],[0,8],[4,12],[3,7,11,15],[0,4,8,12],[2,10],[6,14]][id-8]:id<20?[[0,8],[4,12],[0],[8]][id-16]:[[0,8],[4,12],[2,10],[6,14]][id-20];
          // No per-row phase shift: every loop stays on the same 16-step grid.
          // Each instrument has a recognizable rhythmic phrase while staying in sync.
          const phrase=instrument===0?groove:
            instrument===1?(id<8?groove:(id<16?[0,3,6,10,12,14]:[0,6,10])):
            instrument===2?(id<8?groove:(id<16?[0,8]:[0])):
            instrument===3?(id<8?groove:(id<16?[0,2,4,6,8,10,12,14]:[4,12])):
            instrument===4?(id<8?groove:(id<16?[0,2,5,8,10,13]:[0,8])):
            (id<8?groove:(id<16?[0,3,7,10,14]:[0,4,8,12]));
          const hit=phrase.includes(k);
          if(hit){play(id,nextTime,k);const pad=pads[id];const delay=Math.max(0,(nextTime-audio.currentTime)*1000);setTimeout(()=>{if(closed||!pad.isConnected)return;pad.classList.add('pulse');setTimeout(()=>pad.classList.remove('pulse'),125)},delay)}
        }
        nextTime+=beat;step++;
      }
    }
    selectors[0].addEventListener('change',e=>{rhythm=Number(e.target.value);recolor();step=0;if(audio)nextTime=audio.currentTime+.035;caption.textContent='Նոր ռիթմ՝ '+['Պարային','Հիփ-հոփ','Էլեկտրոնային','Լատինո'][rhythm]});
    selectors[1].addEventListener('change',e=>{instrument=Number(e.target.value);updateInstrumentLook();caption.textContent='Նոր գործիք՝ '+['Դաշնամուր','Կիթառ','Ջութակ','Հարվածայիններ','Մարիմբա','Քսիլոֆոն'][instrument]});
    mute.addEventListener('click',()=>{silent=!silent;mute.textContent=silent?'🔇':'🔊';mute.setAttribute('aria-label',silent?'Միացնել ձայնը':'Անջատել ձայնը');if(master&&audio)master.gain.setTargetAtTime(silent?0:.46,audio.currentTime,.02)});
    gameCleanup.push(()=>{closed=true;if(timer)clearInterval(timer);active.clear();if(audio){audio.close().catch(()=>{});audio=null}css.remove()});
  }
  function gameMix(){
    // AREG TEST only: Starlight Canyon trial, preserve the canonical parent header.
    activityContent.replaceChildren();
    const frame=document.createElement('iframe');
    frame.className='mind-v4-frame';
    frame.title='Վեց աշխարհների գաղտնիքը · Փուլ 1';
    frame.src='./areg-starlight-adventure.html?stage1_build=20261025-first-world&testv='+encodeURIComponent(new URLSearchParams(location.search).get('testv')||'initial');
    frame.setAttribute('loading','eager');
    activityScreen.classList.add('areg-car-wash-mode');
    activityContent.append(frame);
    gameCleanup.push(()=>activityScreen.classList.remove('areg-car-wash-mode'));
  }
  function gameColorBlast(){
    activityContent.replaceChildren();
    const frame=document.createElement('iframe');
    frame.className='mind-v4-frame';
    frame.title='Գունավոր պայթյուն';
    frame.src='./areg-color-blast.html?testv='+encodeURIComponent(new URLSearchParams(location.search).get('testv')||'initial');
    frame.setAttribute('loading','eager');
    activityScreen.classList.add('areg-car-wash-mode');
    activityContent.append(frame);
    gameCleanup.push(()=>activityScreen.classList.remove('areg-car-wash-mode'));
  }
  /* Battleship music starts in the parent on the user's game-card tap.
     Its iframe owns the picker, but never starts a second audio player. */
  const battleMusic=new Audio();battleMusic.loop=true;
  let battleMusicUrl=null;
  function battleMusicSet(blob){
    battleMusic.pause();
    if(battleMusicUrl)URL.revokeObjectURL(battleMusicUrl);
    battleMusicUrl=blob?URL.createObjectURL(blob):null;
    if(battleMusicUrl)battleMusic.src=battleMusicUrl;
  }
  function battleMusicStart(){
    if(!battleMusicUrl)return;
    battleMusic.play().catch(()=>{});
  }
  function battleMusicStop(){battleMusic.pause();battleMusic.currentTime=0}
  function battleMusicRestore(){
    try{
      const req=indexedDB.open('areg-sea-battle-music',1);
      req.onupgradeneeded=()=>req.result.createObjectStore('tracks');
      req.onsuccess=()=>{
        const db=req.result;
        const q=db.transaction('tracks').objectStore('tracks').get('selected');
        q.onsuccess=()=>{if(q.result?.blob)battleMusicSet(q.result.blob)};
      };
    }catch(e){console.warn('Battleship music load:',e)}
  }
  battleMusicRestore();
  function battleMusicNotify(){
    const frame=activityContent.querySelector('iframe[title="Ծովամարտ"]');
    if(frame?.contentWindow)frame.contentWindow.postMessage({type:'areg-sea-music-state',playing:!battleMusic.paused},location.origin);
  }
  battleMusic.addEventListener('play',battleMusicNotify);
  battleMusic.addEventListener('pause',battleMusicNotify);
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==activityContent.querySelector('iframe[title="Ծովամարտ"]')?.contentWindow)return;
    if(event.data?.type==='areg-sea-music-selected'&&event.data.blob){
      battleMusicSet(event.data.blob);battleMusicStart();battleMusicNotify();
    }else if(event.data?.type==='areg-sea-music-control'){
      if(event.data.action==='play')battleMusicStart();
      if(event.data.action==='stop')battleMusic.pause();
      battleMusicNotify();
    }else if(event.data?.type==='areg-sea-music-query')battleMusicNotify();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)battleMusic.pause()});
  function gameSeaBattle(){
    activityContent.replaceChildren();
    const frame=document.createElement('iframe');
    frame.className='mind-v4-frame';
    frame.title='Ծովամարտ';
    frame.src='./areg-sea-battle.html?v=1&parentMusic=1&testv='+Date.now();
    frame.setAttribute('loading','eager');
    activityScreen.classList.add('areg-car-wash-mode');
    activityContent.append(frame);
    gameCleanup.push(()=>{battleMusicStop();activityScreen.classList.remove('areg-car-wash-mode')});
  }
  function gameBlocks(){
    activityContent.replaceChildren();
    const frame=document.createElement('iframe');
    frame.className='mind-v4-frame';
    frame.title='Գաղտնի ուղիներ';
    frame.src='./areg-tower-3d.html?testv=secret-paths-name';
    frame.setAttribute('loading','eager');
    // Do not reveal the iframe until the stage picker has completed layout.
    // This prevents iOS WebKit from showing an intermediate, reflowing picker.
    frame.style.opacity='0';
    frame.style.transition='none';
    const onTowerReady=(event)=>{
      if(event.source!==frame.contentWindow||event.data?.type!=='areg-tower-picker-ready')return;
      window.removeEventListener('message',onTowerReady);
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(frame.isConnected)frame.style.opacity='1';
      }));
    };
    window.addEventListener('message',onTowerReady);
    activityScreen.classList.add('areg-car-wash-mode');
    activityContent.append(frame);
    gameCleanup.push(()=>{window.removeEventListener('message',onTowerReady);activityScreen.classList.remove('areg-car-wash-mode')});
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
      btn.innerHTML=`<img src="${item.src}?v=93" alt="${item.label}" draggable="false">`;
      btn.addEventListener('click',()=>{
        setAvatar(item.src,'preset');
        avatarModal.hidden=true;
        showToast('✓');
      });
      presetAvatarGrid.appendChild(btn);
    });
    markPresetSelection();
  }

  requireParentHold(avatarButton,()=>{markPresetSelection();avatarModal.hidden=false});
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
  addEventListener('pageshow',()=>{const saved=Number(localStorage.getItem(STARS_KEY));if(Number.isFinite(saved)){stars=saved;updateStars()}});
  if(new URLSearchParams(location.search).get('section')==='mind'){
    // Standalone Mind V4 returns to this section even after a full PWA navigation.
    openSection('mind');
  }
  updateStars();
  if('serviceWorker'in navigator&&!window.__AREG_LIVE_TEST__)addEventListener('load',async()=>{
    try{
      const reg=await navigator.serviceWorker.register('./service-worker.js?v=300',{updateViaCache:'none'});
      reg.update().catch(()=>{});
    }catch{}
  });
})();