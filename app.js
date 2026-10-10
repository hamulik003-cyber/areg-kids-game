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
  $('#settingsButton').addEventListener('click',()=>{syncSettings();applyFont();settingsModal.hidden=false});
  $$('[data-close="settings"]').forEach(e=>e.addEventListener('click',()=>settingsModal.hidden=true));
  $('#starCounter').addEventListener('click',()=>showToast(`⭐ ${stars}`));

  /* section navigation */
  $$('.section-card').forEach(card=>card.addEventListener('click',()=>openSection(card.dataset.section)));
  $('#sectionBack').addEventListener('click',closeSection);
  $('#activityBack').addEventListener('click',backToSection);

  function fitSpaceConstellationsLabel(){
    const label=sectionGames.querySelector('.toddler-game-card[data-game="constellations"] .toddler-game-label');
    if(!label)return;
    label.style.setProperty('font-size','16px','important');
    label.style.setProperty('letter-spacing','-.035em','important');
    const min=10.5,step=.25;
    let size=16;
    while(size>min && label.scrollWidth>label.clientWidth){
      size=Math.max(min,size-step);
      label.style.setProperty('font-size',size+'px','important');
    }
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
        const b=document.createElement('button');b.className='toddler-game-card';b.dataset.game=g.id;b.setAttribute('aria-label',g.label);
        b.innerHTML=`<img src="${g.thumb}" alt="" draggable="false"><span class="section-card-sheen game-card-sheen" aria-hidden="true"></span><span class="toddler-game-label">${g.label}</span>`;
        b.addEventListener('click',()=>openGame(s,g));sectionGames.appendChild(b);
      });
    }
    if(id==='nature')for(const k of ['animalGallery','birdGallery','seaGallery','insects'])warmGalleryPreviews(k,2);
    if(id==='space')for(const k of ['planetGallery','constellationGallery'])warmGalleryPreviews(k,2);
    const nav=++galleryNavigationId;
    const revealSection=()=>{
      if(nav!==galleryNavigationId||currentSection!==id)return;
      homeScreen.style.visibility='hidden';sectionScreen.hidden=false;
      requestAnimationFrame(()=>{sectionScreen.classList.add('is-visible');if(id==='space'){fitSpaceConstellationsLabel();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitSpaceConstellationsLabel);}});
      // Load the 3D engine only after the Space menu has become visible.
      if(id==='space')setTimeout(()=>{if(nav===galleryNavigationId&&currentSection==='space')ensureSpace3DLoaded().catch(()=>{});},900);
    };
    // Already-cached pictures resolve immediately; never stall a tap for seconds.
    const deadline=new Promise(resolve=>setTimeout(resolve,1150));
    Promise.race([warmSectionImages(id),deadline]).then(revealSection,revealSection);
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

  function closeSection(){
    ++galleryNavigationId;
    document.body.classList.remove('magic-scroll-active');
    sectionScreen.classList.remove('is-visible');
    setTimeout(()=>{sectionScreen.hidden=true;homeScreen.style.visibility='visible'},180)
  }
  function openGame(section,game){
    // Warm and decode the first eight cards while the existing menu stays
    // visible. No all-gallery download and no white cards on cold entry.
    const nav=++galleryNavigationId;
    const needsSpaceEngine=game.kind==='spaceSearch'||game.kind==='constellationQuest';
    const spaceEngineReady=needsSpaceEngine?(game.kind==='constellationQuest'?ensureConstellationQuestLoaded():ensureSpace3DLoaded()).catch(()=>{}):null;
    const launch=()=>{
      if(nav!==galleryNavigationId||sectionScreen.hidden)return;
      cleanupGame();activityContent.classList.toggle('space-preparing',needsSpaceEngine);
      currentGame=game;activityScreen.dataset.game=game.id;
      activitySectionTitle.textContent=section.title;activityTitle.textContent=game.label;
      updateStars();sectionScreen.classList.remove('is-visible');
      setTimeout(()=>{
        if(nav!==galleryNavigationId)return;
        sectionScreen.hidden=true;activityScreen.hidden=false;
        requestAnimationFrame(()=>activityScreen.classList.add('is-visible'));
        renderGame(game);
      },150);
    };
    if(needsSpaceEngine){
      // The old code revealed a cream empty stage while the 3D module
      // was still downloading. Keep the space section painted instead.
      const deadline=new Promise(resolve=>setTimeout(resolve,3200));
      Promise.race([spaceEngineReady,deadline]).then(launch,launch);
    }else if(GALLERY_WARM_ITEMS[game.kind]){
      const timeout=new Promise(resolve=>setTimeout(resolve,1250));
      Promise.race([warmGalleryPreviews(game.kind,4),timeout]).then(launch,launch);
    }else launch();
  }
  function backToSection(){++galleryNavigationId;cleanupGame();activityScreen.classList.remove('is-visible');setTimeout(()=>{activityScreen.hidden=true;sectionScreen.hidden=false;requestAnimationFrame(()=>sectionScreen.classList.add('is-visible'));applyAudio()},160)}
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
      space3DLoadPromise=import('./space-3d-games.js?v=285')
        .then(()=>window.AregSpace3D)
        .catch(err=>{space3DLoadPromise=null;throw err});
    }
    return space3DLoadPromise;
  }
  let constellationQuestLoadPromise=null;
  function ensureConstellationQuestLoaded(){
    if(!constellationQuestLoadPromise){
      constellationQuestLoadPromise=import('./constellation-quest-v246.js?v=294f')
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
    const map={animalGallery:gameAnimalGallery,birdGallery:gameBirdGallery,seaGallery:gameSeaGallery,insects:gameInsectGallery,planetGallery:gamePlanetGallery,constellationGallery:gameConstellationGallery,spaceSearch:()=>launchSpace3D('spaceSearch'),constellationQuest:launchConstellationQuest,shadow:gameShadow,feed:gameFeed,hatch:gameHatch,garden:gameGarden,rocket:gameRocket,orbits:gameOrbits,catch:gameCatch,landing:gameLanding,sort:gameSort,sizes:gameSizes,pattern:gamePattern,cups:gameCups,paint:gamePaint,stickers:gameStickers,mix:gameMix,blocks:gameBlocks,connect:gameConnect,wand:gameWand,potion:gamePotion,book:gameBook};
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
    host.className='animal-gallery gallery-card-flight-host';
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
  if('serviceWorker'in navigator)addEventListener('load',async()=>{
    try{
      const reg=await navigator.serviceWorker.register('./service-worker.js?v=294f',{updateViaCache:'none'});
      reg.update().catch(()=>{});
    }catch{}
  });
})();