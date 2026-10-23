export const WORLD_NAMES=["Աստղերի կիրճ","Կախարդական անտառ","Ավազների գաղտնի քաղաք","Սառցե պալատ","Երկնային կղզիներ","Աստղային ամրոց"];
export const WORLD_COUNTS=[6,7,8,8,8,9];
export const WORLD_LENGTHS=[5400,7200,8400,9200,10000,12000];
export const SAVE_KEY="areg-six-worlds-v1";
export const SAVE_SCHEMA_VERSION=1;
export function makeSave(){return {schemaVersion:1,slotId:"areg-adventure-1",currentWorld:1,currentSection:1,checkpointId:"W01-S01-start",worldProgress:{},solvedPuzzleIds:[],collectedStarIds:[],discoveredSecretIds:[],unlockedWorldIds:[1],completedGame:false};}
export function readSave(storage){try{const x=JSON.parse(storage.getItem(SAVE_KEY));if(x&&x.schemaVersion===1&&x.slotId==="areg-adventure-1"&&Number.isInteger(x.currentWorld)&&x.currentWorld>=1&&x.currentWorld<=6&&Number.isInteger(x.currentSection)&&x.currentSection>=1&&x.currentSection<=WORLD_COUNTS[x.currentWorld-1])return x;}catch{}return makeSave();}
export function sectionId(w,s){return "W"+String(w).padStart(2,"0")+"-S"+String(s).padStart(2,"0");}
export function nextSection(w,s){if(s<WORLD_COUNTS[w-1])return {world:w,section:s+1};if(w<6)return {world:w+1,section:1};return null;}
export function generateSection(world,section){
 if(!Number.isInteger(world)||world<1||world>6||!Number.isInteger(section)||section<1||section>WORLD_COUNTS[world-1])throw Error("Invalid section");
 const id=sectionId(world,section), width=960, groundY=450, seed=world*41+section*17;
 const gaps=[{x:270+(seed%3)*13,w:78+(section%3)*9},{x:635+(seed%4)*12,w:73+(world%3)*12}];
 const ground=[];let cursor=0;for(const g of gaps){ground.push({id:id+"-ground-"+ground.length,x:cursor,y:groundY,w:g.x-cursor,h:90,collisionType:"solid",state:"active",resetBehavior:"static"});cursor=g.x+g.w;}ground.push({id:id+"-ground-"+ground.length,x:cursor,y:groundY,w:width-cursor,h:90,collisionType:"solid",state:"active",resetBehavior:"static"});
 const platforms=[{id:id+"-platform-a",x:gaps[0].x-38,y:groundY-92,w:142,h:20,collisionType:"oneway",state:"active",resetBehavior:"static"},{id:id+"-platform-b",x:gaps[1].x-55,y:groundY-112,w:150,h:20,collisionType:"oneway",state:"active",resetBehavior:"static"}];
 const kind=(section+world*2)%6,px=465,py=groundY-58;
 const puzzleObjects=[{id:id+"-puzzle",x:px,y:py,w:54,h:58,collisionType:"trigger",state:"locked",resetBehavior:"checkpoint",kind:["rune","pressure","sequence","crystal","mirror","lever"][kind],solution:[(seed%3),((seed+1)%3),((seed+2)%3)],progress:0}];
 const hazards=world>=2?[{id:id+"-hazard",x:720,y:groundY-22,w:44,h:22,collisionType:"damage",state:"active",resetBehavior:"static"}]:[];
 const movingPlatforms=world>=3?[{id:id+"-moving",x:590,y:330,w:110,h:18,collisionType:"solid",state:"active",resetBehavior:"checkpoint",path:[{x:590,y:330},{x:700,y:300}],speed:45,dwell:0.5,phase:0}]:[];
 const triggers=[{id:id+"-star",x:188+(seed%4)*15,y:310,w:25,h:25,collisionType:"collect",state:"active",resetBehavior:"persist"},{id:id+"-door",x:904,y:365,w:38,h:85,collisionType:"exit",state:"locked",resetBehavior:"checkpoint"}];
 return {id,world,section,title:WORLD_NAMES[world-1]+" · "+section+"/"+WORLD_COUNTS[world-1],width,height:540,ground,platforms,hazards,movingPlatforms,triggers,puzzleObjects,checkpoint:{id:id+"-start",x:50,y:groundY-78},exit:{id:id+"-exit",x:904,y:365,w:38,h:85,requiresPuzzle:true},cameraBounds:{x:0,y:0,w:width,h:540}};
}
export function validateSection(s){const ids=new Set();for(const key of ["ground","platforms","hazards","movingPlatforms","triggers","puzzleObjects"]){if(!Array.isArray(s[key]))throw Error(key+" missing");for(const o of s[key]){if(ids.has(o.id))throw Error("Duplicate "+o.id);ids.add(o.id);for(const k of ["x","y","w","h"])if(!Number.isFinite(o[k]))throw Error(o.id+" invalid "+k);if(o.w<=0||o.h<=0)throw Error(o.id+" size");}}if(s.exit.x<0||s.exit.x>s.width)throw Error("Invalid exit");return true;}
