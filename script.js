(function(){
  'use strict';

  const canvas=document.getElementById('gameCanvas');
  const game=document.getElementById('game');
  const ctx=canvas.getContext('2d',{alpha:false});
  const viewport=document.getElementById('viewport');
  const goldValue=document.getElementById('goldValue');
  const cargoValue=document.getElementById('cargoValue');
  const areaName=document.getElementById('areaName');
  const areaBanner=document.getElementById('areaBanner');
  const areaBannerName=document.getElementById('areaBannerName');
  const objective=document.getElementById('objective');
  const objectiveText=document.getElementById('objectiveText');
  const focusMeter=document.getElementById('focusMeter');
  const focusCount=document.getElementById('focusCount');
  const contextPanel=document.getElementById('contextPanel');
  const contextEyebrow=document.getElementById('contextEyebrow');
  const contextTitle=document.getElementById('contextTitle');
  const contextDetail=document.getElementById('contextDetail');
  const contextButton=document.getElementById('contextButton');
  const starforgeChoices=document.getElementById('starforgeChoices');
  const mineButton=document.getElementById('mineButton');
  const joystick=document.getElementById('joystick');
  const joystickKnob=document.getElementById('joystickKnob');
  const pickaxeName=document.getElementById('pickaxeName');
  const powerValue=document.getElementById('powerValue');
  const speedValue=document.getElementById('speedValue');
  const unlockFill=document.getElementById('unlockFill');
  const unlockLabel=document.getElementById('unlockLabel');
  const toast=document.getElementById('toast');
  const menuButton=document.getElementById('menuButton');
  const menuShade=document.getElementById('menuShade');
  const resumeButton=document.getElementById('resumeButton');
  const resetButton=document.getElementById('resetButton');

  const BUILD={version:'0.6.1',name:'POCKET RENDER FIX'};
  document.getElementById('buildVersion').textContent='v'+BUILD.version;
  document.getElementById('menuBuildVersion').textContent='DEEPFORGE v'+BUILD.version+' · '+BUILD.name;

  const WORLD={width:4480,height:1280,gateX:1110,emberGateX:2240,starfallGateX:3360,gateY:650,gateHalfGap:118};
  const MINE_DEFINITIONS={
    mossMine:{
      id:'mossMine',name:'MOSSVEIN MINE',surfaceName:'MOSSVEIN QUARRY',width:1920,height:5120,entrance:{x:145,y:640},surfaceEntrance:{x:165,y:690,radius:112},
      unlock:()=>true,accent:'#d2a65b',detail:'#e9cf8c',floor:'#20241d',wall:'#2c3027',wallEdge:'#4f533f',style:'moss',finalGoal:'Mine the Gilded Heart',
      solids:[{x:0,y:0,w:1920,h:145},{x:0,y:4975,w:1920,h:145},{x:585,y:145,w:125,h:345},{x:585,y:790,w:125,h:345},{x:1190,y:145,w:125,h:345},{x:1190,y:790,w:125,h:345}],
      barriers:[{id:'outer_rubble',x:620,y:490,w:76,h:300,requiresPickaxe:1,label:'Loose Rubble',objective:'Break through the loose rubble'},{id:'iron_seam',x:1225,y:490,w:76,h:300,requiresPickaxe:2,label:'Ironbound Collapse'}],
      rocks:[['stone',285,350],['stone',430,530],['stone',260,890],['copper',465,940],['stone',655,590,'outer_rubble'],['stone',655,640,'outer_rubble'],['stone',655,690,'outer_rubble'],['stone',835,335],['copper',930,495],['stone',1040,760],['copper',845,950],['copper',1085,1020],['stone',1260,590,'iron_seam'],['stone',1260,640,'iron_seam'],['stone',1260,690,'iron_seam'],['copper',1450,350],['copper',1650,470],['copper',1435,885],['gold',1680,820],['gold',1535,1010]],
      labels:[['OLD WORKINGS',360,205,'#b8ad82'],['COPPER CHAMBER',945,205,'#dc9c65'],['GILDED HEART',1570,205,'#ffe18a']]
    },
    moonMine:{
      id:'moonMine',name:'MOONGLASS LABYRINTH',surfaceName:'MOONGLASS CAVERN',width:1680,height:5760,entrance:{x:150,y:1180},surfaceEntrance:{x:1225,y:720,radius:112},
      unlock:state=>state.areaUnlocked,accent:'#71e3df',detail:'#c8a7ff',floor:'#10272a',wall:'#18363b',wallEdge:'#4c8d91',style:'moon',finalGoal:'Reach the Starshard Sanctum',
      solids:[{x:0,y:0,w:1680,h:135},{x:0,y:5625,w:1680,h:135},{x:480,y:135,w:110,h:435},{x:480,y:825,w:110,h:480},{x:1000,y:135,w:110,h:230},{x:1000,y:650,w:110,h:655},{x:590,y:1010,w:260,h:85}],
      barriers:[{id:'moon_prism_gate',x:497,y:570,w:76,h:255,requiresPickaxe:3,label:'Prismatic Fault'},{id:'moon_star_lock',x:1017,y:365,w:76,h:285,requiresPickaxe:4,label:'Starbound Geode'}],
      rocks:[['copper',270,1050],['moonglass',335,820],['moonglass',280,420],['moonglass',535,645,'moon_prism_gate'],['moonglass',535,695,'moon_prism_gate'],['moonglass',535,745,'moon_prism_gate'],['moonglass',760,1160],['moonglass',760,760],['moonglass',830,430],['starshard',910,245],['moonglass',1055,455,'moon_star_lock'],['moonglass',1055,505,'moon_star_lock'],['moonglass',1055,555,'moon_star_lock'],['moonglass',1270,310],['moonglass',1420,560],['moonglass',1275,890],['starshard',1445,1120],['starshard',1270,1230]],
      labels:[['LOWER CRYSTALS',300,1260,'#78d9d7'],['REFRACTION HALL',790,700,'#c8a7ff'],['STARSHARD SANCTUM',1335,205,'#efe0ff']]
    },
    emberMine:{
      id:'emberMine',name:'EMBERDEEP WORKS',surfaceName:'EMBERDEEP FOUNDRY',width:1880,height:6400,entrance:{x:145,y:1030},surfaceEntrance:{x:2340,y:650,radius:112},
      unlock:state=>state.emberdeepUnlocked,accent:'#ff7543',detail:'#ffc06f',floor:'#251817',wall:'#39201c',wallEdge:'#8f4b32',style:'ember',finalGoal:'Claim the Sunslag Crucible',
      solids:[{x:0,y:0,w:1880,h:145},{x:0,y:6255,w:1880,h:145},{x:500,y:145,w:110,h:390},{x:500,y:720,w:110,h:415},{x:1210,y:145,w:110,h:215},{x:1210,y:545,w:110,h:590},{x:770,y:360,w:250,h:190},{x:770,y:820,w:250,h:190}],
      barriers:[{id:'ember_bulkhead',x:517,y:535,w:76,h:185,requiresPickaxe:4,label:'Cinder Bulkhead'},{id:'ember_crucible_lock',x:1227,y:360,w:76,h:185,requiresPickaxe:5,label:'Crucible Seal'}],
      rocks:[['moonglass',250,930],['emberstone',310,690],['emberstone',300,350],['emberstone',555,575,'ember_bulkhead'],['emberstone',555,625,'ember_bulkhead'],['emberstone',555,675,'ember_bulkhead'],['emberstone',700,1050],['emberstone',720,680],['emberstone',910,680],['emberstone',1100,960],['emberstone',1265,400,'ember_crucible_lock'],['emberstone',1265,452,'ember_crucible_lock'],['emberstone',1265,505,'ember_crucible_lock'],['emberstone',1445,270],['emberstone',1615,470],['emberstone',1475,800],['sunslag',1660,980],['sunslag',1480,1060]],
      labels:[['COOLING TUNNELS',290,1090,'#caa77d'],['FURNACE MAZE',900,700,'#ff8a52'],['SUNSLAG CRUCIBLE',1540,205,'#ffd27d']]
    },
    starMine:{
      id:'starMine',name:'STARFALL HOLLOW',surfaceName:'STARFALL DEPTHS',width:2200,height:7200,entrance:{x:160,y:750},surfaceEntrance:{x:3450,y:690,radius:112},
      unlock:state=>state.fourthUnlocked,accent:'#b8c3ff',detail:'#f0ddff',floor:'#121329',wall:'#0a0b19',wallEdge:'#5a5f96',style:'star',finalGoal:'Reach the Crownstone Observatory',
      solids:[{x:0,y:0,w:2200,h:135},{x:0,y:7065,w:2200,h:135},{x:700,y:135,w:400,h:490},{x:700,y:825,w:400,h:540},{x:1450,y:135,w:400,h:215},{x:1450,y:570,w:400,h:795},{x:1110,y:1030,w:220,h:335}],
      barriers:[{id:'star_bridge_lock',x:862,y:625,w:76,h:200,requiresPickaxe:5,label:'Astral Bridge Lock'},{id:'star_crown_lock',x:1612,y:350,w:76,h:220,requiresPickaxe:5,label:'Crownstone Ward'}],
      rocks:[['emberstone',300,480],['astralite',360,750],['astralite',315,1050],['astralite',900,675,'star_bridge_lock'],['astralite',900,725,'star_bridge_lock'],['astralite',900,775,'star_bridge_lock'],['astralite',1180,420],['astralite',1260,760],['astralite',1390,1180],['crownstone',1360,250],['astralite',1650,410,'star_crown_lock'],['astralite',1650,460,'star_crown_lock'],['astralite',1650,510,'star_crown_lock'],['astralite',1950,280],['astralite',2020,650],['astralite',1940,1030],['crownstone',2025,1250],['crownstone',1910,1180]],
      labels:[['FALLEN APPROACH',350,205,'#aeb8ee'],['ASTRAL CROSSING',1260,710,'#c9d2ff'],['CROWNSTONE OBSERVATORY',1940,205,'#f1d7ff']]
    }
  };
  const MINE_SCENES=Object.keys(MINE_DEFINITIONS);
  const BIOMES=[
    {id:'mossvein',name:'MOSSVEIN QUARRY',start:0,end:WORLD.gateX,floor:'#273228',accent:'#78b36c',detail:'#a8c48e'},
    {id:'moonglass',name:'MOONGLASS CAVERN',start:WORLD.gateX,end:WORLD.emberGateX,floor:'#14282b',accent:'#65dedb',detail:'#b294ef'},
    {id:'emberdeep',name:'EMBERDEEP FOUNDRY',start:WORLD.emberGateX,end:WORLD.starfallGateX,floor:'#261817',accent:'#ff7543',detail:'#ffbd68'},
    {id:'starfall',name:'STARFALL DEPTHS',start:WORLD.starfallGateX,end:WORLD.width,floor:'#17172a',accent:'#b8c3ff',detail:'#eee4ff'}
  ];
  const MATERIAL_FEEDBACK={
    stone:{shape:'chip',gravity:390,spread:1},copper:{shape:'spark',gravity:350,spread:1.05},gold:{shape:'spark',gravity:310,spread:1.12},
    moonglass:{shape:'shard',gravity:245,spread:1.08},starshard:{shape:'shard',gravity:175,spread:1.18},
    emberstone:{shape:'ember',gravity:285,spread:1.12},sunslag:{shape:'ember',gravity:245,spread:1.22},
    astralite:{shape:'star',gravity:115,spread:1.18},crownstone:{shape:'star',gravity:70,spread:1.28}
  };
  const SAVE_KEY='deepforgePrototypeV1';
  const GATE_COST=120;
  const EMBER_GATE_COST=360;
  const EMBER_PICKAXE_ORE_REQUIRED=12;
  const GROUND_DROP_LIFETIME=300;
  const GROUND_DROP_PICKUP_RADIUS=48;
  const MAX_GROUND_DROPS=160;
  const MAX_MINING_PARTICLES=260;
  const EMBER_MASTERY=[
    {rank:0,power:31,cooldown:.23,gold:0,sunslag:0,label:'Awakened',shellPower:.72,bonusYield:.22,precisionDelay:1},
    {rank:1,power:38,cooldown:.215,gold:450,sunslag:1,label:'Tempered',shellPower:.85,bonusYield:.27,precisionDelay:.96},
    {rank:2,power:46,cooldown:.20,gold:850,sunslag:3,label:'Kindled',shellPower:1,bonusYield:.32,precisionDelay:.92},
    {rank:3,power:66,cooldown:.185,gold:1450,sunslag:6,label:'Blazing',shellPower:1.15,bonusYield:.38,precisionDelay:.88},
    {rank:4,power:92,cooldown:.17,gold:2300,sunslag:10,label:'Infernal',shellPower:1.3,bonusYield:.45,precisionDelay:.82},
    {rank:5,power:128,cooldown:.155,gold:3600,sunslag:15,label:'Deepforge Master',shellPower:1.5,bonusYield:.55,precisionDelay:.75}
  ];
  const MINING_RANGE=116;
  const MINE_TILE_SIZE=48;
  const MINE_CHUNK_CELLS=16;
  const MINE_TERRAIN_HP=8;
  const PLAYER_SPEED=340;
  const ROCK_TYPES={
    stone:{label:'Stone',hp:10,value:2,color:'#88928a',edge:'#cbd0ca',accent:'#68736c',respawn:6},
    copper:{label:'Copper',hp:18,value:7,color:'#8f6546',edge:'#d9955e',accent:'#5d4030',respawn:8},
    moonglass:{label:'Moonglass',hp:42,value:22,color:'#3d8695',edge:'#9ef2ed',accent:'#235365',respawn:10},
    gold:{label:'Gold Vein',hp:28,value:34,color:'#8a6b31',edge:'#ffe17a',accent:'#513d1b',respawn:22,rare:true},
    starshard:{label:'Starshard',hp:58,value:68,color:'#4d477f',edge:'#d6b8ff',accent:'#29284f',respawn:28,rare:true},
    emberstone:{label:'Emberstone',hp:74,shell:32,value:48,color:'#632b22',edge:'#ff9b54',accent:'#321918',respawn:13,armored:true},
    sunslag:{label:'Sunslag Core',hp:92,shell:44,value:118,color:'#6f321a',edge:'#ffd078',accent:'#26110c',respawn:31,rare:true,armored:true},
    astralite:{label:'Astralite',hp:325,shell:72,value:260,color:'#303158',edge:'#b9c7ff',accent:'#17182f',respawn:18,armored:true,starfall:true},
    crownstone:{label:'Crownstone',hp:460,shell:110,value:620,color:'#49355f',edge:'#f4c5ff',accent:'#21172e',respawn:38,rare:true,armored:true,starfall:true}
  };
  const MINE_DISCOVERY_PROFILES={
    mossMine:{seed:13579,cavernCount:6,veinCount:11,main:'copper',secondary:'copper',rare:'gold',requiredPickaxe:1,names:['Forgotten Pocket','Rootbound Hollow','Old Prospector Room','Echo Chamber','Buried Camp','Gilded Hollow']},
    moonMine:{seed:24680,cavernCount:7,veinCount:12,main:'moonglass',secondary:'copper',rare:'starshard',requiredPickaxe:3,names:['Prism Pocket','Silent Grotto','Glasswater Hollow','Moonlit Fault','Crystal Nest','Lost Survey','Starshard Grotto']},
    emberMine:{seed:97531,cavernCount:8,veinCount:13,main:'emberstone',secondary:'moonglass',rare:'sunslag',requiredPickaxe:4,names:['Cinder Pocket','Ashen Vault','Collapsed Furnace','Heatwell Hollow','Old Smelter','Burning Grotto','Magma Scar','Crucible Pocket']},
    starMine:{seed:86420,cavernCount:9,veinCount:14,main:'astralite',secondary:'emberstone',rare:'crownstone',requiredPickaxe:5,names:['Fallen Pocket','Silent Orbit','Astral Hollow','Void Grotto','Lost Observatory','Starlight Vault','Crown Scar','Celestial Nest','Last Light Chamber']}
  };
  const POCKET_REWARD_KINDS=['cache','crystal','motherlode','shrine'];

  function seededRandom(seed){
    let value=seed>>>0;return()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296};
  }

  function generateMineDiscoveries(scene){
    const mine=MINE_DEFINITIONS[scene],profile=MINE_DISCOVERY_PROFILES[scene],random=seededRandom(profile.seed);
    const cols=Math.ceil(mine.width/MINE_TILE_SIZE),rows=Math.ceil(mine.height/MINE_TILE_SIZE),caverns=[],deposits=[],rocks=[];
    const firstDeepRow=Math.ceil(1500/MINE_TILE_SIZE),lastDeepRow=rows-7,deepRows=lastDeepRow-firstDeepRow;
    for(let index=0;index<profile.cavernCount;index++){
      const band=(index+.5)/profile.cavernCount,row=Math.round(firstDeepRow+deepRows*band+(random()-.5)*4);
      const col=4+Math.floor(random()*Math.max(1,cols-8)),rx=112+Math.floor(random()*65),ry=82+Math.floor(random()*52);
      const kind=POCKET_REWARD_KINDS[(index+MINE_SCENES.indexOf(scene))%POCKET_REWARD_KINDS.length],rewardId=scene+'_pocket_reward_'+(index+1);
      const reward={id:rewardId,kind,type:kind==='crystal'?profile.rare:profile.main,label:kind==='cache'?'BURIED CACHE':kind==='crystal'?'CRYSTAL CLUSTER':kind==='motherlode'?'MOTHERLODE':'RESTORATIVE SHRINE'};
      if(kind==='cache'){
        reward.rewards={};reward.rewards[profile.main]=3+MINE_SCENES.indexOf(scene);
        reward.rewards[profile.secondary]=(reward.rewards[profile.secondary]||0)+2;
      }
      caverns.push({id:scene+'_cavern_'+(index+1),name:profile.names[index],x:(col+.5)*MINE_TILE_SIZE,y:(row+.5)*MINE_TILE_SIZE,rx,ry,reward});
    }
    const insideCavern=(x,y,padding=0)=>caverns.some(cavern=>Math.pow((x-cavern.x)/(cavern.rx+padding),2)+Math.pow((y-cavern.y)/(cavern.ry+padding),2)<1);
    const directions=[[1,0],[1,1],[0,1],[-1,1]],occupiedCells=new Set();
    for(let depositIndex=0;depositIndex<profile.veinCount;depositIndex++){
      const rare=(depositIndex+1)%5===0,type=rare?profile.rare:random()<.18?profile.secondary:profile.main;
      let positions=[];
      for(let attempt=0;attempt<48&&positions.length<4;attempt++){
        const length=4+Math.floor(random()*7),direction=directions[Math.floor(random()*directions.length)];
        const startCol=3+Math.floor(random()*Math.max(1,cols-7)),startRow=firstDeepRow+Math.floor(random()*Math.max(1,deepRows-8));
        const candidate=[],used=new Set();
        for(let step=0;step<length;step++){
          const wobble=step>1&&step%3===0?(random()<.5?-1:1):0;
          const col=Math.max(2,Math.min(cols-3,startCol+direction[0]*step+(direction[1]?wobble:0)));
          const row=Math.max(firstDeepRow,Math.min(rows-3,startRow+direction[1]*step+(direction[0]?wobble:0)));
          const key=col+','+row,x=(col+.5)*MINE_TILE_SIZE,y=(row+.5)*MINE_TILE_SIZE;
          if(used.has(key)||occupiedCells.has(key)||insideCavern(x,y,72))continue;
          used.add(key);candidate.push([x,y]);
        }
        if(candidate.length>=4)positions=candidate;
      }
      if(positions.length<4)continue;
      const id=scene+'_vein_'+(depositIndex+1);
      deposits.push({id,type,positions});
      for(const position of positions){
        occupiedCells.add(Math.floor(position[0]/MINE_TILE_SIZE)+','+Math.floor(position[1]/MINE_TILE_SIZE));
        rocks.push({type,x:position[0],y:position[1],depositId:id,requiredPickaxe:profile.requiredPickaxe});
      }
    }
    for(let index=0;index<caverns.length;index++){
      const cavern=caverns[index],reward=cavern.reward;
      if(reward.kind==='crystal'||reward.kind==='motherlode'){
        const offsets=reward.kind==='crystal'?[[-50,12],[0,-28],[50,12]]:[[-58,-12],[-30,28],[0,-24],[30,28],[58,-12]];
        const positions=offsets.map(([offsetX,offsetY])=>[(Math.floor((cavern.x+offsetX)/MINE_TILE_SIZE)+.5)*MINE_TILE_SIZE,(Math.floor((cavern.y+offsetY)/MINE_TILE_SIZE)+.5)*MINE_TILE_SIZE]);
        const id=reward.id+'_deposit';
        deposits.push({id,type:reward.type,positions,cavernId:cavern.id,pocketRewardId:reward.id,pocketReward:true});
        for(const position of positions)rocks.push({type:reward.type,x:position[0],y:position[1],depositId:id,cavernId:cavern.id,pocketRewardId:reward.id,pocketReward:true,requiredPickaxe:profile.requiredPickaxe});
      }
      if(index!==Math.floor(caverns.length*.45)&&index!==caverns.length-1)continue;
      const id=cavern.id+'_rare_find';
      const x=(Math.floor(cavern.x/MINE_TILE_SIZE)+.5)*MINE_TILE_SIZE,y=(Math.floor(cavern.y/MINE_TILE_SIZE)+.5)*MINE_TILE_SIZE;
      deposits.push({id,type:profile.rare,positions:[[x,y]],rareFind:true,cavernId:cavern.id});
      rocks.push({type:profile.rare,x,y,depositId:id,cavernId:cavern.id,rareFind:true,requiredPickaxe:profile.requiredPickaxe});
    }
    return{caverns,deposits,rocks};
  }

  const MINE_DISCOVERIES=Object.fromEntries(Object.keys(MINE_DISCOVERY_PROFILES).map(scene=>[scene,generateMineDiscoveries(scene)]));
  const PICKAXES=[
    null,
    {name:'Worn Pickaxe',power:4,cooldown:.72,cost:0},
    {name:'Iron Pickaxe',power:7,cooldown:.54,cost:30},
    {name:'Runed Pickaxe',power:12,cooldown:.40,cost:85},
    {name:'Moonglass Pickaxe',power:20,cooldown:.29,cost:210},
    {name:'Ember Pickaxe',power:31,cooldown:.23,cost:650}
  ];
  const STARFORGE_VARIANTS={
    crusher:{name:'Astral Crusher',short:'Heavy power',cost:{astralite:6,crownstone:1},powerMultiplier:1.55,cooldownMultiplier:1.18,shellMultiplier:1.2,yieldBonus:0,color:'#cfd5ff'},
    swift:{name:'Comet Edge',short:'Rapid strikes',cost:{astralite:6,crownstone:1},powerMultiplier:1.08,cooldownMultiplier:.58,shellMultiplier:.9,yieldBonus:0,color:'#8ff5ff'},
    prospector:{name:'Crownseeker',short:'Bonus yield',cost:{astralite:5,crownstone:2},powerMultiplier:1,cooldownMultiplier:.88,shellMultiplier:1,yieldBonus:.28,color:'#ffe19b'}
  };
  const STATIONS={
    sell:{x:205,y:250,radius:132},
    forge:{x:455,y:250,radius:132},
    gate:{x:1045,y:650,radius:145},
    emberGate:{x:2175,y:650,radius:145},
    starfallGate:{x:3295,y:650,radius:145},
    starforge:{x:3505,y:155,radius:118}
  };
  const CHEST_DEFINITIONS=[
    {id:'moss_supply',name:"Miner's Supply Chest",biome:'mossvein',x:690,y:1110,tier:0,requires:{pickaxeLevel:1,label:'Worn Pickaxe'},rewards:{stone:3,copper:2}},
    {id:'moss_ironbound',name:'Ironbound Chest',biome:'mossvein',x:980,y:205,tier:1,requires:{pickaxeLevel:2,label:'Iron Pickaxe'},rewards:{copper:5,gold:1}},
    {id:'moon_cache',name:'Crystal Cache',biome:'moonglass',x:1285,y:1110,tier:1,requires:{pickaxeLevel:3,label:'Runed Pickaxe'},rewards:{moonglass:3,copper:2}},
    {id:'moon_reliquary',name:'Moonglass Reliquary',biome:'moonglass',x:2070,y:215,tier:2,requires:{pickaxeLevel:4,label:'Moonglass Pickaxe'},rewards:{moonglass:5,starshard:1}},
    {id:'ember_cache',name:'Foundry Lockbox',biome:'emberdeep',x:2385,y:1110,tier:2,requires:{pickaxeLevel:4,label:'Moonglass Pickaxe'},rewards:{emberstone:3,moonglass:2}},
    {id:'ember_vault',name:'Ember Vault',biome:'emberdeep',x:3250,y:205,tier:3,requires:{pickaxeLevel:5,label:'Ember Pickaxe'},rewards:{emberstone:5,sunslag:1}},
    {id:'star_cache',name:'Astral Cache',biome:'starfall',x:3495,y:1110,tier:3,requires:{pickaxeLevel:5,label:'Ember Pickaxe'},rewards:{astralite:3}},
    {id:'star_coffer',name:'Celestial Coffer',biome:'starfall',x:4370,y:205,tier:4,requires:{starforge:true,label:'Starforge Pickaxe'},rewards:{astralite:5,crownstone:1}}
  ];
  const CHEST_INTERACT_RADIUS=108;
  const ROCK_LAYOUT=[
    ['stone',250,535],['stone',425,600],['stone',605,480],['stone',760,670],['stone',890,410],
    ['stone',325,900],['stone',610,1020],['stone',835,930],['stone',935,780],['stone',510,790],
    ['copper',790,300],['copper',915,565],['copper',205,1050],['copper',710,845],['copper',430,1060],
    ['gold',560,380],
    ['moonglass',1300,350],['moonglass',1490,530],['moonglass',1730,330],['moonglass',1980,500],
    ['moonglass',1265,825],['moonglass',1510,1010],['moonglass',1790,810],['moonglass',2040,1030],
    ['copper',1390,690],['copper',1880,670],['stone',1600,750],['stone',2100,750],['starshard',1840,1080],
    ['emberstone',2380,335],['emberstone',2580,520],['emberstone',2825,310],['emberstone',3140,470],
    ['emberstone',2400,865],['emberstone',2690,1030],['emberstone',2940,790],['emberstone',3220,1010],
    ['moonglass',2520,700],['copper',3070,680],['sunslag',3000,1080],
    ['astralite',3505,320],['astralite',3700,520],['astralite',3970,300],['astralite',4240,470],
    ['astralite',3475,900],['astralite',3780,1040],['astralite',4090,820],['astralite',4380,1040],
    ['moonglass',3630,735],['emberstone',4300,690],['crownstone',4140,1110]
  ];
  const VEIN_DEFINITIONS=[
    {id:'copper_run',label:'COPPER RUN',type:'copper',timeLimit:16,respawn:28,color:'#e2a36e',bonus:{copper:3},positions:[[875,1085],[945,1025],[1010,1100]]},
    {id:'moonglass_bloom',label:'MOONGLASS BLOOM',type:'moonglass',timeLimit:18,respawn:32,color:'#9ef2ed',bonus:{moonglass:2,starshard:1},positions:[[1600,430],[1665,500],[1735,555]]},
    {id:'ember_fault',label:'EMBER FAULT',type:'emberstone',timeLimit:22,respawn:38,color:'#ff9b54',bonus:{emberstone:3,sunslag:1},positions:[[2700,690],[2780,665],[2855,725]]},
    {id:'starfall_lattice',label:'STARFALL LATTICE',type:'astralite',timeLimit:20,respawn:42,color:'#c4cfff',bonus:{astralite:3,crownstone:1},positions:[[3720,690],[3810,650],[3900,720]]}
  ];
  const VEIN_ROCK_LAYOUT=VEIN_DEFINITIONS.flatMap(vein=>vein.positions.map(position=>[vein.type,position[0],position[1],vein.id]));

  let width=800,height=600,viewZoom=.86,viewWidth=930,viewHeight=698,dpr=1,lastFrame=0,time=0,timeScale=1,toastTimer=0,bannerTimer=0;
  let audioContext=null,audioUnlocked=false,impactNoiseBuffer=null;
  let particles=[],floaters=[],rings=[],groundDrops=[];
  let saleMotes=[];
  let activeContext=null,uiDirty=true,lastSavedSnapshot='',lastRegion=-1,nextDropId=1,terrainSaveDelay=0;
  const miningFeedback={shake:0,shakeTime:0,flash:0,flashColor:'#ffffff',hitStop:0,terrainHitIndex:-1,terrainHitTime:0,lastDiscovery:null,lastDepositBeat:null,lastPocketReward:null};
  let lastHapticAt=-1;
  const pickupBatch={items:Object.create(null),count:0,quiet:0,x:0,y:0,bestType:null};

  const input={keys:new Set(),moveX:0,moveY:0,joystickPointer:null,minePointers:new Set(),mineHeld:false};
  const camera={x:0,y:0};
  const player={x:330,y:690,radius:23,facing:1,aimX:1,aimY:0,walk:0,swing:null,swingCooldown:0,hitRockId:null,hitTerrainIndex:-1};
  const miningFocus={streak:0,timer:0};
  const state=loadState();
  let currentScene=state.location.scene;
  player.x=state.location.x;player.y=state.location.y;
  let displayedGold=state.gold,goldTween=null;
  const surfaceRocks=ROCK_LAYOUT.concat(VEIN_ROCK_LAYOUT).map((entry,index)=>({
    id:index+1,type:entry[0],x:entry[1],y:entry[2],hp:ROCK_TYPES[entry[0]].hp,maxHp:ROCK_TYPES[entry[0]].hp,
    shell:ROCK_TYPES[entry[0]].shell||0,maxShell:ROCK_TYPES[entry[0]].shell||0,
    scene:'surface',veinId:entry[3]||null,barrierId:null,requiredPickaxe:1,respawn:0,hit:0,broken:false,seed:(index*47)%97,glintTimer:1.5+(index%5)*.48,glintActive:0,bonusYield:0
  }));
  let mineRockIndex=0;
  const mineRocks=MINE_SCENES.flatMap(scene=>{
    const mine=MINE_DEFINITIONS[scene];
    const entries=mine.rocks.concat(MINE_DISCOVERIES[scene].rocks);
    return entries.map(entry=>{
      const generated=!Array.isArray(entry),type=generated?entry.type:entry[0],barrierId=generated?null:entry[3]||null;
      const barrier=barrierId?mine.barriers.find(item=>item.id===barrierId):null,index=mineRockIndex++,data=ROCK_TYPES[type],shell=generated?(data.shell||0):0;
      return{id:1000+index,type,x:generated?entry.x:entry[1],y:generated?entry.y:entry[2],hp:data.hp,maxHp:data.hp,
        shell,maxShell:shell,scene,veinId:null,depositId:generated?entry.depositId:null,cavernId:generated?entry.cavernId||null:null,rareFind:generated&&!!entry.rareFind,pocketRewardId:generated?entry.pocketRewardId||null:null,
        barrierId,requiredPickaxe:generated?entry.requiredPickaxe:barrier?barrier.requiresPickaxe:1,
        respawn:0,hit:0,broken:false,seed:(index*53)%97,glintTimer:1.5+(index%5)*.48,glintActive:0,bonusYield:0};
    });
  });
  const rocks=surfaceRocks.concat(mineRocks);
  for(const rock of mineRocks)if(rock.barrierId&&state.clearedMineBarriers[rock.barrierId]){rock.broken=true;rock.respawn=Infinity}
  for(const rock of mineRocks)if(rock.pocketRewardId&&state.claimedPocketRewards[rock.pocketRewardId]){rock.broken=true;rock.respawn=Infinity}
  const mineTerrain=Object.fromEntries(MINE_SCENES.map(scene=>[scene,createMineTerrain(scene)]));
  const veins=VEIN_DEFINITIONS.map(definition=>({...definition,status:'idle',timer:0,displaySecond:-1,brokenRockIds:new Set()}));
  const chests=CHEST_DEFINITIONS.map(definition=>({...definition}));
  for(const [chestId,rewards] of Object.entries(state.pendingChestLoot)){
    const chest=chestById(chestId);if(!chest)continue;
    let rewardIndex=0;
    for(const [type,amount] of Object.entries(rewards))spawnGroundDrop(type,amount,chest.x+(rewardIndex++-1)*18,chest.y+18,chestId,'surface');
  }
  for(const scene of MINE_SCENES)for(const cavern of MINE_DISCOVERIES[scene].caverns){
    const reward=cavern.reward,pending=state.pendingPocketLoot[reward.id];if(!pending)continue;
    let rewardIndex=0;for(const [type,amount] of Object.entries(pending))spawnGroundDrop(type,amount,cavern.x+(rewardIndex++-1)*18,cavern.y+12,null,scene,reward.id);
  }

  function defaultState(){
    return{
      gold:0,pickaxeLevel:1,emberMastery:0,areaUnlocked:false,discoveredSecond:false,emberdeepUnlocked:false,discoveredThird:false,fourthUnlocked:false,discoveredFourth:false,
      cargo:{stone:0,copper:0,moonglass:0,gold:0,starshard:0,emberstone:0,sunslag:0,astralite:0,crownstone:0},
      mined:{stone:0,copper:0,moonglass:0,gold:0,starshard:0,emberstone:0,sunslag:0,astralite:0,crownstone:0},
      veinsCompleted:{copper_run:0,moonglass_bloom:0,ember_fault:0,starfall_lattice:0},
      starforgeVariant:null,starforgeUnlocked:{crusher:false,swift:false,prospector:false},
      openedChests:{},pendingChestLoot:{},claimedPocketRewards:{},pendingPocketLoot:{},
      clearedMineBarriers:{},terrainDug:{mossMine:[],moonMine:[],emberMine:[],starMine:[]},discoveredCaverns:{},mineDiscovered:false,discoveredMines:{mossMine:false,moonMine:false,emberMine:false,starMine:false},
      location:{scene:'surface',x:330,y:690,surfaceX:330,surfaceY:690},
      totalGold:0,totalSwings:0,precisionHits:0
    };
  }

  function loadState(){
    try{
      const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
      if(!raw||typeof raw!=='object')return defaultState();
      const base=defaultState();
      base.gold=Math.max(0,Number(raw.gold)||0);
      base.pickaxeLevel=Math.max(1,Math.min(PICKAXES.length-1,Number(raw.pickaxeLevel)||1));
      base.emberMastery=base.pickaxeLevel===PICKAXES.length-1?Math.max(0,Math.min(EMBER_MASTERY.length-1,Number(raw.emberMastery)||0)):0;
      base.areaUnlocked=!!raw.areaUnlocked;
      base.discoveredSecond=!!raw.discoveredSecond;
      base.emberdeepUnlocked=!!raw.emberdeepUnlocked;
      base.discoveredThird=!!raw.discoveredThird;
      base.fourthUnlocked=!!raw.fourthUnlocked;
      base.discoveredFourth=!!raw.discoveredFourth;
      for(const key of Object.keys(base.cargo)){
        base.cargo[key]=Math.max(0,Number(raw.cargo&&raw.cargo[key])||0);
        base.mined[key]=Math.max(0,Number(raw.mined&&raw.mined[key])||0);
      }
      for(const key of Object.keys(base.veinsCompleted))base.veinsCompleted[key]=Math.max(0,Number(raw.veinsCompleted&&raw.veinsCompleted[key])||0);
      for(const key of Object.keys(base.starforgeUnlocked))base.starforgeUnlocked[key]=!!(raw.starforgeUnlocked&&raw.starforgeUnlocked[key]);
      for(const chest of CHEST_DEFINITIONS){
        base.openedChests[chest.id]=!!(raw.openedChests&&raw.openedChests[chest.id]);
        const pending=raw.pendingChestLoot&&raw.pendingChestLoot[chest.id];
        if(pending&&typeof pending==='object'){
          base.pendingChestLoot[chest.id]={};
          for(const type of Object.keys(base.cargo))if(Number(pending[type])>0)base.pendingChestLoot[chest.id][type]=Math.floor(Number(pending[type]));
          if(!Object.keys(base.pendingChestLoot[chest.id]).length)delete base.pendingChestLoot[chest.id];
        }
      }
      for(const scene of MINE_SCENES){
        const mine=MINE_DEFINITIONS[scene];
        base.discoveredMines[scene]=!!(raw.discoveredMines&&raw.discoveredMines[scene])||(scene==='mossMine'&&!!raw.mineDiscovered);
        for(const barrier of mine.barriers)base.clearedMineBarriers[barrier.id]=!!(raw.clearedMineBarriers&&raw.clearedMineBarriers[barrier.id]);
        for(const cavern of MINE_DISCOVERIES[scene].caverns){
          base.discoveredCaverns[cavern.id]=!!(raw.discoveredCaverns&&raw.discoveredCaverns[cavern.id]);
          const rewardId=cavern.reward.id;base.claimedPocketRewards[rewardId]=!!(raw.claimedPocketRewards&&raw.claimedPocketRewards[rewardId]);
          const pending=raw.pendingPocketLoot&&raw.pendingPocketLoot[rewardId];
          if(pending&&typeof pending==='object'){
            base.pendingPocketLoot[rewardId]={};
            for(const type of Object.keys(base.cargo))if(Number(pending[type])>0)base.pendingPocketLoot[rewardId][type]=Math.floor(Number(pending[type]));
            if(!Object.keys(base.pendingPocketLoot[rewardId]).length)delete base.pendingPocketLoot[rewardId];
          }
        }
        const dug=raw.terrainDug&&raw.terrainDug[scene];
        const terrainCellCount=Math.ceil(mine.width/MINE_TILE_SIZE)*Math.ceil(mine.height/MINE_TILE_SIZE);
        if(Array.isArray(dug))base.terrainDug[scene]=[...new Set(dug.map(Number).filter(Number.isInteger).filter(index=>index>=0&&index<terrainCellCount))];
      }
      base.mineDiscovered=base.discoveredMines.mossMine;
      if(raw.location&&MINE_SCENES.includes(raw.location.scene)){
        const mine=MINE_DEFINITIONS[raw.location.scene];
        base.location.scene=mine.unlock(base)?raw.location.scene:'surface';base.location.x=clamp(Number(raw.location.x)||mine.entrance.x,52,mine.width-52);base.location.y=clamp(Number(raw.location.y)||mine.entrance.y,70,mine.height-58);
      }
      base.location.surfaceX=clamp(Number(raw.location&&raw.location.surfaceX)||330,52,WORLD.width-52);
      base.location.surfaceY=clamp(Number(raw.location&&raw.location.surfaceY)||690,70,WORLD.height-58);
      base.starforgeVariant=base.starforgeUnlocked[raw.starforgeVariant]?raw.starforgeVariant:null;
      base.totalGold=Math.max(0,Number(raw.totalGold)||0);
      base.totalSwings=Math.max(0,Number(raw.totalSwings)||0);
      base.precisionHits=Math.max(0,Number(raw.precisionHits)||0);
      return base;
    }catch(error){return defaultState()}
  }

  function saveState(force){
    try{
      state.location.scene=currentScene;state.location.x=player.x;state.location.y=player.y;
      if(currentScene==='surface'){state.location.surfaceX=player.x;state.location.surfaceY=player.y}
      const snapshot=JSON.stringify(state);
      if(force||snapshot!==lastSavedSnapshot){localStorage.setItem(SAVE_KEY,snapshot);lastSavedSnapshot=snapshot}
    }catch(error){}
  }

  function resetProgress(){
    const fresh=defaultState();
    Object.keys(fresh).forEach(key=>state[key]=fresh[key]);
    for(const rock of rocks){rock.hp=rock.maxHp;rock.shell=rock.maxShell;rock.broken=false;rock.respawn=0;rock.hit=0;rock.glintActive=0;rock.glintTimer=1.4+(rock.id%5)*.45;rock.bonusYield=0}
    rebuildMineTerrain();
    resetVeins();groundDrops.length=0;nextDropId=1;
    pickupBatch.items=Object.create(null);pickupBatch.count=0;pickupBatch.quiet=0;pickupBatch.bestType=null;
    currentScene='surface';player.x=330;player.y=690;player.swing=null;player.swingCooldown=0;
    miningFocus.streak=0;miningFocus.timer=0;saleMotes.length=0;goldTween=null;displayedGold=0;
    Object.assign(miningFeedback,{shake:0,shakeTime:0,flash:0,hitStop:0,terrainHitIndex:-1,terrainHitTime:0,lastDiscovery:null,lastDepositBeat:null,lastPocketReward:null});
    lastRegion=-1;activeContext=null;menuShade.hidden=true;uiDirty=true;saveState(true);showToast('A fresh vein awaits.');
  }

  function resize(){
    const rect=viewport.getBoundingClientRect();
    width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    viewZoom=width<=620?.71:.75;
    viewWidth=width/viewZoom;viewHeight=height/viewZoom;
    dpr=Math.min(2,window.devicePixelRatio||1);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    updateCamera(true);
  }

  function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
  function titleCase(value){return String(value).toLowerCase().replace(/\b\w/g,letter=>letter.toUpperCase())}
  function distance(x1,y1,x2,y2){return Math.hypot(x2-x1,y2-y1)}
  function easeOut(t){return 1-Math.pow(1-clamp(t,0,1),3)}
  function easeInOut(t){t=clamp(t,0,1);return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function cargoCount(){return Object.values(state.cargo).reduce((total,amount)=>total+amount,0)}
  function cargoValueTotal(){return Object.keys(state.cargo).reduce((total,type)=>total+state.cargo[type]*ROCK_TYPES[type].value,0)}
  function currentPickaxe(){return PICKAXES[state.pickaxeLevel]}
  function currentMastery(){return EMBER_MASTERY[state.emberMastery]}
  function currentStarforge(){return state.starforgeVariant?STARFORGE_VARIANTS[state.starforgeVariant]:null}
  function currentPickaxeName(){const variant=currentStarforge();return variant?variant.name:currentPickaxe().name+(state.emberMastery?' +'+state.emberMastery:'')}
  function currentPower(){const base=state.pickaxeLevel===PICKAXES.length-1?currentMastery().power:currentPickaxe().power,variant=currentStarforge();return variant?Math.round(base*variant.powerMultiplier):base}
  function currentCooldown(){const base=state.pickaxeLevel===PICKAXES.length-1?currentMastery().cooldown:currentPickaxe().cooldown,variant=currentStarforge();return variant?base*variant.cooldownMultiplier:base}
  function currentShellPower(){const base=state.pickaxeLevel===PICKAXES.length-1?currentMastery().shellPower:.72,variant=currentStarforge();return variant?base*variant.shellMultiplier:base}
  function currentBonusYieldChance(){const base=state.pickaxeLevel<4?0:state.pickaxeLevel===PICKAXES.length-1?currentMastery().bonusYield:.22,variant=currentStarforge();return Math.min(.92,base+(variant?variant.yieldBonus:0))}
  function currentPrecisionDelay(){return state.pickaxeLevel===PICKAXES.length-1?currentMastery().precisionDelay:1}
  function currentMine(){return MINE_DEFINITIONS[currentScene]||null}
  function currentWorld(){return currentMine()||WORLD}
  function currentRocks(){return currentScene==='surface'?surfaceRocks:mineRocks.filter(rock=>rock.scene===currentScene)}
  function regionIndexAt(x){return x>=WORLD.starfallGateX?3:x>=WORLD.emberGateX?2:x>=WORLD.gateX?1:0}
  function currentBiome(){const mine=currentMine();return mine?{id:mine.id,name:mine.name,accent:mine.accent,detail:mine.detail}:BIOMES[regionIndexAt(player.x)]}
  function starforgeMastered(){return Object.values(state.starforgeUnlocked).every(Boolean)}
  function nextMastery(){return EMBER_MASTERY[state.emberMastery+1]||null}
  function masteryReady(){const next=nextMastery();return !!next&&state.mined.sunslag>=next.sunslag&&state.gold>=next.gold}
  function hitsRequired(type,power){return Math.ceil(ROCK_TYPES[type].hp/power)}
  function armoredHitsRequired(type,power,shellPower){
    const data=ROCK_TYPES[type];let shell=data.shell||0,hp=data.hp,hits=0;
    while((shell>0||hp>0)&&hits<100){
      hits++;
      if(shell>0){
        const shellDamage=Math.ceil(power*shellPower),remaining=shellDamage-shell;
        shell=Math.max(0,shell-shellDamage);
        if(shell===0&&remaining>0)hp=Math.max(0,hp-Math.floor(remaining/shellPower));
      }else hp=Math.max(0,hp-power);
    }
    return hits;
  }
  function localReferenceRock(){return state.pickaxeLevel>=4?'emberstone':state.pickaxeLevel>=3?'moonglass':state.mined.copper>0?'copper':'stone'}
  function emberPickaxeReady(){return state.emberdeepUnlocked&&state.mined.emberstone>=EMBER_PICKAXE_ORE_REQUIRED}
  function veinById(id){return veins.find(vein=>vein.id===id)||null}
  function chestById(id){return chests.find(chest=>chest.id===id)||null}
  function chestRequirementMet(chest){return chest.requires.starforge?!!state.starforgeVariant:state.pickaxeLevel>=chest.requires.pickaxeLevel}
  function chestRewardLabel(chest){return Object.entries(chest.rewards).map(([type,amount])=>amount+' '+ROCK_TYPES[type].label).join(' + ')}
  function nearbyChest(){
    if(currentScene!=='surface')return null;
    let nearest=null,best=CHEST_INTERACT_RADIUS;
    for(const chest of chests){
      if(state.openedChests[chest.id])continue;
      const range=distance(player.x,player.y,chest.x,chest.y);
      if(range<=best){best=range;nearest=chest}
    }
    return nearest;
  }
  function resetVeins(){for(const vein of veins){vein.status='idle';vein.timer=0;vein.displaySecond=-1;vein.brokenRockIds.clear()}}

  function mineBarrierById(id){for(const scene of MINE_SCENES){const barrier=MINE_DEFINITIONS[scene].barriers.find(item=>item.id===id);if(barrier)return barrier}return null}
  function mineBarrierCleared(id){return !!state.clearedMineBarriers[id]}
  function activeMineSolids(){const mine=currentMine();return mine?mine.solids.concat(mine.barriers.filter(barrier=>!mineBarrierCleared(barrier.id))):[]}

  function createMineTerrain(scene){
    const mine=MINE_DEFINITIONS[scene],cols=Math.ceil(mine.width/MINE_TILE_SIZE),rows=Math.ceil(mine.height/MINE_TILE_SIZE);
    const terrain={scene,cols,rows,chunks:new Map(),cleared:new Set(),dug:new Set(state.terrainDug[scene]||[]),caverns:[]};
    const clearCell=(col,row)=>{if(col>=0&&row>=0&&col<cols&&row<rows)terrain.cleared.add(row*cols+col)};
    const clearCircle=(x,y,radius)=>{
      const minCol=Math.max(0,Math.floor((x-radius)/MINE_TILE_SIZE)),maxCol=Math.min(cols-1,Math.floor((x+radius)/MINE_TILE_SIZE));
      const minRow=Math.max(0,Math.floor((y-radius)/MINE_TILE_SIZE)),maxRow=Math.min(rows-1,Math.floor((y+radius)/MINE_TILE_SIZE));
      for(let row=minRow;row<=maxRow;row++)for(let col=minCol;col<=maxCol;col++){
        const cx=(col+.5)*MINE_TILE_SIZE,cy=(row+.5)*MINE_TILE_SIZE;if(distance(cx,cy,x,y)<=radius)clearCell(col,row);
      }
    };
    const clearRect=(x,y,w,h)=>{
      const minCol=Math.max(0,Math.floor(x/MINE_TILE_SIZE)),maxCol=Math.min(cols-1,Math.floor((x+w)/MINE_TILE_SIZE));
      const minRow=Math.max(0,Math.floor(y/MINE_TILE_SIZE)),maxRow=Math.min(rows-1,Math.floor((y+h)/MINE_TILE_SIZE));
      for(let row=minRow;row<=maxRow;row++)for(let col=minCol;col<=maxCol;col++)clearCell(col,row);
    };
    clearCircle(mine.entrance.x+54,mine.entrance.y,142);
    for(const wall of mine.solids)clearRect(wall.x,wall.y,wall.w,wall.h);
    for(const barrier of mine.barriers)clearRect(barrier.x-125,barrier.y-62,barrier.w+250,barrier.h+124);
    for(const definition of MINE_DISCOVERIES[scene].caverns){
      const cavern={...definition,cells:[],cellSet:new Set(),boundary:new Set()};
      const minCol=Math.max(0,Math.floor((cavern.x-cavern.rx)/MINE_TILE_SIZE)),maxCol=Math.min(cols-1,Math.floor((cavern.x+cavern.rx)/MINE_TILE_SIZE));
      const minRow=Math.max(0,Math.floor((cavern.y-cavern.ry)/MINE_TILE_SIZE)),maxRow=Math.min(rows-1,Math.floor((cavern.y+cavern.ry)/MINE_TILE_SIZE));
      for(let row=minRow;row<=maxRow;row++)for(let col=minCol;col<=maxCol;col++){
        const x=(col+.5)*MINE_TILE_SIZE,y=(row+.5)*MINE_TILE_SIZE;
        if(Math.pow((x-cavern.x)/cavern.rx,2)+Math.pow((y-cavern.y)/cavern.ry,2)>1)continue;
        const index=row*cols+col;cavern.cells.push(index);cavern.cellSet.add(index);clearCell(col,row);
      }
      terrain.caverns.push(cavern);
    }
    for(const cavern of terrain.caverns){
      for(const index of cavern.cells){
        const col=index%cols,row=Math.floor(index/cols);
        for(const [dc,dr] of [[-1,0],[1,0],[0,-1],[0,1]]){
          const nextCol=col+dc,nextRow=row+dr;if(nextCol<0||nextRow<0||nextCol>=cols||nextRow>=rows)continue;
          const nextIndex=nextRow*cols+nextCol;if(!cavern.cellSet.has(nextIndex)&&!terrain.cleared.has(nextIndex))cavern.boundary.add(nextIndex);
        }
      }
      if([...cavern.boundary].some(index=>terrain.dug.has(index)))state.discoveredCaverns[cavern.id]=true;
      delete cavern.cellSet;
    }
    return terrain;
  }

  function rebuildMineTerrain(){for(const scene of MINE_SCENES)mineTerrain[scene]=createMineTerrain(scene)}
  function currentTerrain(){return mineTerrain[currentScene]||null}
  function terrainChunkAt(terrain,col,row){
    const chunkCol=Math.floor(col/MINE_CHUNK_CELLS),chunkRow=Math.floor(row/MINE_CHUNK_CELLS),key=chunkCol+','+chunkRow;
    let chunk=terrain.chunks.get(key);if(chunk)return chunk;
    const types=new Uint8Array(MINE_CHUNK_CELLS*MINE_CHUNK_CELLS),hp=new Uint8Array(types.length);
    for(let localRow=0;localRow<MINE_CHUNK_CELLS;localRow++)for(let localCol=0;localCol<MINE_CHUNK_CELLS;localCol++){
      const worldCol=chunkCol*MINE_CHUNK_CELLS+localCol,worldRow=chunkRow*MINE_CHUNK_CELLS+localRow;
      if(worldCol>=terrain.cols||worldRow>=terrain.rows)continue;
      const index=worldRow*terrain.cols+worldCol,localIndex=localRow*MINE_CHUNK_CELLS+localCol;
      if(!terrain.cleared.has(index)&&!terrain.dug.has(index)){types[localIndex]=1;hp[localIndex]=MINE_TERRAIN_HP}
    }
    chunk={col:chunkCol,row:chunkRow,types,hp};terrain.chunks.set(key,chunk);return chunk;
  }
  function terrainLocalIndex(col,row){return row%MINE_CHUNK_CELLS*MINE_CHUNK_CELLS+col%MINE_CHUNK_CELLS}
  function terrainTypeAt(terrain,col,row){
    if(!terrain||col<0||row<0||col>=terrain.cols||row>=terrain.rows)return 0;
    return terrainChunkAt(terrain,col,row).types[terrainLocalIndex(col,row)];
  }
  function terrainHpAt(terrain,col,row){
    if(!terrain||col<0||row<0||col>=terrain.cols||row>=terrain.rows)return 0;
    return terrainChunkAt(terrain,col,row).hp[terrainLocalIndex(col,row)];
  }
  function setTerrainCell(terrain,col,row,type,hp){
    const chunk=terrainChunkAt(terrain,col,row),localIndex=terrainLocalIndex(col,row);
    chunk.types[localIndex]=type;chunk.hp[localIndex]=hp;
  }
  function terrainSolidCellCount(terrain){return terrain.cols*terrain.rows-terrain.cleared.size-[...terrain.dug].filter(index=>!terrain.cleared.has(index)).length}
  function terrainCellAt(terrain,x,y){
    if(!terrain)return null;
    const col=Math.floor(x/MINE_TILE_SIZE),row=Math.floor(y/MINE_TILE_SIZE);
    if(col<0||row<0||col>=terrain.cols||row>=terrain.rows)return null;
    const index=row*terrain.cols+col;return{index,col,row,x:(col+.5)*MINE_TILE_SIZE,y:(row+.5)*MINE_TILE_SIZE,type:terrainTypeAt(terrain,col,row),hp:terrainHpAt(terrain,col,row)};
  }
  function cavernIsDiscovered(id){return !!state.discoveredCaverns[id]}
  function discoverCavernFromCell(terrain,index){
    if(!terrain)return null;
    const cavern=terrain.caverns.find(item=>!cavernIsDiscovered(item.id)&&item.boundary.has(index));if(!cavern)return null;
    state.discoveredCaverns[cavern.id]=true;uiDirty=true;return cavern;
  }
  function rockIsExposed(rock){
    if(rock.scene==='surface'||rock.barrierId)return true;
    if(rock.cavernId&&!cavernIsDiscovered(rock.cavernId))return false;
    const terrain=mineTerrain[rock.scene],cell=terrainCellAt(terrain,rock.x,rock.y);return !cell||cell.type===0;
  }
  function pocketRewardById(id){for(const scene of MINE_SCENES)for(const cavern of MINE_DISCOVERIES[scene].caverns)if(cavern.reward.id===id)return cavern.reward;return null}
  function pocketRewardLabel(reward){
    if(reward.kind==='cache')return Object.entries(reward.rewards).map(([type,amount])=>amount+' '+ROCK_TYPES[type].label).join(' + ');
    if(reward.kind==='shrine')return 'Focus restored to maximum';
    return ROCK_TYPES[reward.type].label+' '+(reward.kind==='crystal'?'cluster':'motherlode');
  }
  function claimPocketReward(cavern){
    const reward=cavern&&cavern.reward;if(!reward||state.claimedPocketRewards[reward.id])return false;
    if(reward.kind==='crystal'||reward.kind==='motherlode')return false;
    state.claimedPocketRewards[reward.id]=true;
    if(reward.kind==='cache'){
      state.pendingPocketLoot[reward.id]={...reward.rewards};let rewardIndex=0;
      for(const [type,amount] of Object.entries(reward.rewards))spawnGroundDrop(type,amount,cavern.x+(rewardIndex++-1)*18,cavern.y+12,null,currentScene,reward.id);
      sound('chest');
    }else{
      miningFocus.streak=5;miningFocus.timer=25;sound('unlock');uiDirty=true;
    }
    rings.push({x:cavern.x,y:cavern.y,age:0,life:.85,radius:22,color:currentMine().detail});
    floaters.push({x:cavern.x,y:cavern.y-48,text:reward.kind==='cache'?'CACHE OPENED':'FOCUS RESTORED',color:currentMine().detail,age:0,life:1.35,size:17});
    miningFeedback.lastPocketReward={id:reward.id,kind:reward.kind,label:reward.label};
    showToast(pocketRewardLabel(reward));saveState(true);return true;
  }
  function updatePocketRewards(){
    const terrain=currentTerrain();if(!terrain)return;
    for(const cavern of terrain.caverns){
      if(!cavernIsDiscovered(cavern.id)||state.claimedPocketRewards[cavern.reward.id])continue;
      if(distance(player.x,player.y,cavern.x,cavern.y)<=Math.min(cavern.rx,cavern.ry)*.7)claimPocketReward(cavern);
    }
  }
  function nearestTerrainCell(range){
    const terrain=currentTerrain();if(!terrain)return null;
    const aimLength=Math.hypot(player.aimX,player.aimY)||1,aimX=player.aimX/aimLength,aimY=player.aimY/aimLength;
    const maxTravel=range+MINE_TILE_SIZE*.65-player.radius,step=MINE_TILE_SIZE/12;
    for(let travel=0;travel<=maxTravel;travel+=step){
      const probeX=player.x+aimX*travel,probeY=player.y+aimY*travel;
      const minCol=Math.max(0,Math.floor((probeX-player.radius)/MINE_TILE_SIZE)),maxCol=Math.min(terrain.cols-1,Math.floor((probeX+player.radius)/MINE_TILE_SIZE));
      const minRow=Math.max(0,Math.floor((probeY-player.radius)/MINE_TILE_SIZE)),maxRow=Math.min(terrain.rows-1,Math.floor((probeY+player.radius)/MINE_TILE_SIZE));
      let best=null,bestLateral=Infinity,bestForward=Infinity;
      for(let row=minRow;row<=maxRow;row++)for(let col=minCol;col<=maxCol;col++){
        const index=row*terrain.cols+col,type=terrainTypeAt(terrain,col,row);if(!type)continue;
        const left=col*MINE_TILE_SIZE,top=row*MINE_TILE_SIZE,nearestX=clamp(probeX,left,left+MINE_TILE_SIZE),nearestY=clamp(probeY,top,top+MINE_TILE_SIZE);
        if(distance(probeX,probeY,nearestX,nearestY)>=player.radius)continue;
        const x=(col+.5)*MINE_TILE_SIZE,y=(row+.5)*MINE_TILE_SIZE,dx=x-player.x,dy=y-player.y;
        const forward=dx*aimX+dy*aimY,lateral=Math.abs(dx*-aimY+dy*aimX);
        if(lateral<bestLateral-.01||Math.abs(lateral-bestLateral)<.01&&forward<bestForward){
          bestLateral=lateral;bestForward=forward;best={index,col,row,x,y,type,hp:terrainHpAt(terrain,col,row)};
        }
      }
      if(best)return best;
    }
    return null;
  }
  function terrainCollidesCircle(x,y){
    const terrain=currentTerrain();if(!terrain)return false;
    const minCol=Math.max(0,Math.floor((x-player.radius)/MINE_TILE_SIZE)),maxCol=Math.min(terrain.cols-1,Math.floor((x+player.radius)/MINE_TILE_SIZE));
    const minRow=Math.max(0,Math.floor((y-player.radius)/MINE_TILE_SIZE)),maxRow=Math.min(terrain.rows-1,Math.floor((y+player.radius)/MINE_TILE_SIZE));
    for(let row=minRow;row<=maxRow;row++)for(let col=minCol;col<=maxCol;col++){
      if(!terrainTypeAt(terrain,col,row))continue;
      const left=col*MINE_TILE_SIZE,top=row*MINE_TILE_SIZE,nearestX=clamp(x,left,left+MINE_TILE_SIZE),nearestY=clamp(y,top,top+MINE_TILE_SIZE);
      if(distance(x,y,nearestX,nearestY)<player.radius)return true;
    }
    return false;
  }

  function unlockAudio(){
    if(audioUnlocked){if(audioContext&&audioContext.state==='suspended')audioContext.resume();return}
    try{
      audioContext=new(window.AudioContext||window.webkitAudioContext)();audioUnlocked=true;
      impactNoiseBuffer=audioContext.createBuffer(1,Math.ceil(audioContext.sampleRate*.22),audioContext.sampleRate);
      const channel=impactNoiseBuffer.getChannelData(0);
      for(let index=0;index<channel.length;index++)channel[index]=(Math.random()*2-1)*Math.pow(1-index/channel.length,1.8);
    }catch(error){}
  }

  function playTone(startFrequency,endFrequency,duration,volume,type,delay){
    const start=audioContext.currentTime+(delay||0),oscillator=audioContext.createOscillator(),gain=audioContext.createGain();
    oscillator.type=type||'triangle';oscillator.frequency.setValueAtTime(startFrequency,start);oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),start+duration);
    gain.gain.setValueAtTime(volume,start);gain.gain.exponentialRampToValueAtTime(.001,start+duration);
    oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(start);oscillator.stop(start+duration);
  }

  function playImpactNoise(duration,volume,frequency,delay){
    if(!impactNoiseBuffer)return;
    const start=audioContext.currentTime+(delay||0),source=audioContext.createBufferSource(),filter=audioContext.createBiquadFilter(),gain=audioContext.createGain();
    source.buffer=impactNoiseBuffer;filter.type='lowpass';filter.frequency.setValueAtTime(frequency,start);
    gain.gain.setValueAtTime(volume,start);gain.gain.exponentialRampToValueAtTime(.001,start+duration);
    source.connect(filter);filter.connect(gain);gain.connect(audioContext.destination);source.start(start);source.stop(start+duration);
  }

  function addParticle(particle){
    if(particles.length>=MAX_MINING_PARTICLES)particles.splice(0,particles.length-MAX_MINING_PARTICLES+1);
    particles.push(particle);
  }

  function miningKick(strength,_flash,_color,hapticDuration){
    // Keep impact weight in timing, sound, particles and optional haptics without
    // moving or flashing the entire screen during repeated mining.
    miningFeedback.shake=0;
    miningFeedback.shakeTime=0;
    miningFeedback.flash=0;
    miningFeedback.hitStop=Math.max(miningFeedback.hitStop,strength>=7?.065:strength>=4?.038:.016);
    if(hapticDuration&&navigator.vibrate&&time-lastHapticAt>.065){
      try{navigator.vibrate(hapticDuration);lastHapticAt=time}catch(error){}
    }
  }

  function sound(kind,resourceType,intensity){
    if(!audioContext)return;
    const materialTone={stone:0,copper:95,moonglass:260,gold:175,starshard:340,emberstone:-25,sunslag:125,astralite:410,crownstone:520}[resourceType]||0;
    if(kind==='precision'){
      playTone(128,48,.14,.105,'triangle');playTone(760+materialTone,1380+materialTone,.11,.05,'sine',.006);playTone(1120+materialTone,620,.08,.025,'square',.018);playImpactNoise(.075,.046,1450+materialTone);
    }else if(kind==='hit'){
      const strength=(state.pickaxeLevel-1)*18;
      playTone(105-strength*.35,52,.1,.09,'triangle');playTone(680+strength+materialTone,230+materialTone*.25,.048,.026,'square',.004);playImpactNoise(.055,.032,1050+strength*8+materialTone,.003);
    }else if(kind==='break'){
      playTone(82,32,.22,.13,'triangle');playTone(310+materialTone,88+materialTone*.25,.13,.042,'square',.008);playImpactNoise(.18,.085,760+materialTone);
    }else if(kind==='coin'){
      playTone(610,920,.13,.075,'triangle');playTone(880,1240,.1,.045,'sine',.055);
    }else if(kind==='chest'){
      playTone(145,92,.18,.085,'triangle');playImpactNoise(.11,.045,720);
      playTone(520,820,.15,.05,'sine',.08);playTone(760,1280,.22,.042,'sine',.16);
    }else if(kind==='upgrade'){
      playTone(250,510,.28,.1,'triangle');playTone(440,900,.32,.065,'sine',.08);
    }else if(kind==='unlock'){
      playTone(155,390,.52,.12,'sine');playTone(245,680,.58,.065,'triangle',.09);
    }else if(kind==='vein'){
      playTone(210,520,.22,.1,'triangle');playTone(420,980,.34,.07,'sine',.06);playTone(720,1320,.2,.04,'triangle',.16);
    }else if(kind==='veinStep'){
      const progress=clamp(Number(intensity)||0,0,1),lift=progress*420;
      playTone(190+materialTone*.2+lift,330+materialTone*.25+lift,.085,.052,'triangle');playTone(420+lift,610+lift,.07,.026,'sine',.025);
    }else if(kind==='jackpot'){
      playTone(180+materialTone*.2,510+materialTone*.25,.22,.105,'triangle');playTone(420+materialTone*.25,940+materialTone*.35,.28,.075,'sine',.055);playTone(680+materialTone*.2,1380+materialTone*.3,.34,.052,'triangle',.13);
    }else if(kind==='discovery'){
      playImpactNoise(.16,.075,920+materialTone,.002);playTone(170,360,.2,.095,'triangle');playTone(480+materialTone,980+materialTone,.3,.07,'sine',.055);playTone(760+materialTone,1480+materialTone,.36,.045,'sine',.13);
    }else if(kind==='pickup'){
      playTone(440+materialTone*.35,820+materialTone*.45,.075,.035,'sine');playTone(690+materialTone*.3,1050+materialTone*.35,.06,.022,'triangle',.035);
    }else{
      playTone(100,72,.085,.04,'square');
    }
  }

  function showToast(message){
    toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.classList.remove('show'),1450);
  }

  function showAreaBanner(name){
    areaBannerName.textContent=name||'MOONGLASS CAVERN';
    areaBanner.dataset.area=name==='STARFALL DEPTHS'?'starfall':name==='EMBERDEEP FOUNDRY'?'ember':name==='MOSSVEIN QUARRY'?'mossvein':'moonglass';
    areaBanner.classList.add('show');clearTimeout(bannerTimer);
    bannerTimer=setTimeout(()=>areaBanner.classList.remove('show'),2200);
  }

  function worldToScreen(x,y){return{x:x-camera.x,y:y-camera.y}}
  function screenToWorld(x,y){return{x:x/viewZoom+camera.x,y:y/viewZoom+camera.y}}

  function updateCamera(immediate){
    const world=currentWorld();
    const targetX=clamp(player.x-viewWidth*.5,0,Math.max(0,world.width-viewWidth));
    const targetY=clamp(player.y-viewHeight*.5,0,Math.max(0,world.height-viewHeight));
    if(immediate){camera.x=targetX;camera.y=targetY;return}
    camera.x+=(targetX-camera.x)*.105;camera.y+=(targetY-camera.y)*.105;
  }

  function nearestRock(range){
    let best=null,bestDistance=Infinity;
    for(const rock of currentRocks()){
      if(rock.broken||!rockIsExposed(rock))continue;
      const d=distance(player.x,player.y,rock.x,rock.y);
      if(d<bestDistance&&d<=range){bestDistance=d;best=rock}
    }
    return best;
  }

  function startSwing(manualPress){
    if(player.swing||player.swingCooldown>0)return false;
    const rock=nearestRock(MINING_RANGE),terrainTarget=rock?null:nearestTerrainCell(MINING_RANGE);
    if(!rock&&!terrainTarget){sound('empty');if(!input.mineHeld)showToast(currentMine()?'Face the mountain to dig.':'Move closer to a rock.');player.swingCooldown=.16;return false}
    if(terrainTarget){
      player.facing=terrainTarget.x>=player.x?1:-1;player.hitRockId=null;player.hitTerrainIndex=terrainTarget.index;
      player.swing={elapsed:0,duration:currentCooldown(),hit:false,precision:false,target:'terrain'};
      state.totalSwings++;uiDirty=true;return true;
    }
    const precision=!!manualPress&&rock.glintActive>0;
    if(precision){
      rock.glintActive=0;rock.glintTimer=(2.3+Math.random()*1.7)*currentPrecisionDelay();rock.bonusYield=1;
      miningFocus.streak=Math.min(5,miningFocus.streak+1);miningFocus.timer=7;
      if(miningFocus.streak===5)floaters.push({x:player.x,y:player.y-62,text:'FOCUS MAX',color:'#ffe69a',age:0,life:1.05,size:15});
      uiDirty=true;
    }else if(manualPress&&miningFocus.streak){
      miningFocus.streak=0;miningFocus.timer=0;uiDirty=true;
    }
    player.facing=rock.x>=player.x?1:-1;player.hitRockId=rock.id;player.hitTerrainIndex=-1;
    player.swing={elapsed:0,duration:currentCooldown(),hit:false,precision,target:'rock'};
    state.totalSwings++;uiDirty=true;return true;
  }

  function hitRock(rock,precision){
    if(!rock||rock.broken)return;
    if(rock.requiredPickaxe>state.pickaxeLevel){
      const required=PICKAXES[rock.requiredPickaxe];rock.hit=.12;sound('empty');
      floaters.push({x:rock.x,y:rock.y-36,text:required.name.toUpperCase()+' REQUIRED',color:'#e8c98b',age:0,life:.9,size:12});
      return;
    }
    const power=currentPower(),focusBonus=1+Math.max(0,miningFocus.streak-1)*.06,damage=precision?Math.ceil(power*2.25*focusBonus):power;
    let feedbackDamage=damage;
    if(rock.shell>0){
      const shellMultiplier=precision?1.7:currentShellPower(),previousShell=rock.shell;
      const shellDamage=Math.ceil(damage*shellMultiplier);
      feedbackDamage=shellDamage;
      rock.shell=Math.max(0,rock.shell-shellDamage);
      if(rock.shell===0){
        const overflow=Math.max(0,shellDamage-previousShell),carryDamage=Math.floor(overflow/shellMultiplier);
        if(carryDamage>0){rock.hp=Math.max(0,rock.hp-carryDamage);floaters.push({x:rock.x,y:rock.y-49,text:'BREACH +'+carryDamage,color:'#ffdda0',age:0,life:.82,size:12})}
        floaters.push({x:rock.x,y:rock.y-34,text:'SHELL BROKEN',color:'#ffd195',age:0,life:1,size:14});
        rings.push({x:rock.x,y:rock.y,age:0,life:.42,radius:16,color:'#ff9b54'});
        sound('precision',rock.type);
      }
    }else rock.hp=Math.max(0,rock.hp-damage);
    rock.hit=.16;
    sound(precision?'precision':'hit',rock.type);spawnImpact(rock.x,rock.y,rock.type,feedbackDamage,precision);
    miningKick(precision?4.8:2.3,precision?.13:.055,ROCK_TYPES[rock.type].edge,precision?18:8);
    if(precision){state.precisionHits++;floaters.push({x:rock.x,y:rock.y-37,text:'PRECISION!',color:'#fff2a6',age:0,life:.9,size:14})}
    if(rock.shell<=0&&rock.hp<=0)breakRock(rock);
  }

  function hitTerrain(index){
    const terrain=currentTerrain(),cellCount=terrain?terrain.cols*terrain.rows:0;if(!terrain||index<0||index>=cellCount)return;
    const col=index%terrain.cols,row=Math.floor(index/terrain.cols),x=(col+.5)*MINE_TILE_SIZE,y=(row+.5)*MINE_TILE_SIZE;
    const type=terrainTypeAt(terrain,col,row);if(!type)return;
    const hiddenBefore=mineRocks.filter(rock=>rock.scene===currentScene&&!rock.barrierId&&!rock.broken&&!rockIsExposed(rock));
    const hp=Math.max(0,terrainHpAt(terrain,col,row)-currentPower());setTerrainCell(terrain,col,row,type,hp);
    miningFeedback.terrainHitIndex=index;miningFeedback.terrainHitTime=.16;
    spawnImpact(x,y,'stone',currentPower(),false);sound('hit','stone');miningKick(hp>0?2.4:4.2,hp>0?.05:.11,currentMine().wallEdge,hp>0?8:14);
    if(hp>0)return;
    setTerrainCell(terrain,col,row,0,0);terrain.dug.add(index);
    state.terrainDug[currentScene].push(index);
    state.mined.stone++;spawnGroundDrop('stone',1,x,y);spawnBreak(x,y,'stone');sound('break','stone');
    floaters.push({x,y:y-22,text:'TUNNEL OPEN',color:'#d8c49a',age:0,life:.72,size:11});
    const cavern=discoverCavernFromCell(terrain,index);
    if(cavern){
      rings.push({x,y,age:0,life:.95,radius:32,color:currentMine().detail});
      floaters.push({x,y:y-48,text:'HIDDEN CHAMBER',color:currentMine().detail,age:0,life:1.5,size:17});
    }
    const revealed=hiddenBefore.filter(rock=>rockIsExposed(rock));
    const primaryReveal=revealed.find(rock=>rock.rareFind)||revealed[0];
    if(revealed.length){
      const rock=primaryReveal,data=ROCK_TYPES[rock.type],label=rock.rareFind?'RARE '+data.label.toUpperCase():rock.depositId?data.label.toUpperCase()+' VEIN':data.label.toUpperCase()+' REVEALED';
      spawnDiscoveryBurst(rock,label);
    }
    if(cavern||revealed.length){
      const rock=primaryReveal,detail=rock?(rock.rareFind?' Rare '+ROCK_TYPES[rock.type].label+' waits inside.':' You struck a '+ROCK_TYPES[rock.type].label+' vein.'):' It was buried in the rock.';
      showToast((cavern?cavern.name+' discovered.':'New deposit uncovered.')+detail);
      if(!revealed.length){sound('unlock');miningKick(6,.12,currentMine().detail,20)}
    }
    terrainSaveDelay=.4;uiDirty=true;
  }

  function breakRock(rock){
    const vein=rock.veinId?veinById(rock.veinId):null;
    rock.broken=true;rock.respawn=rock.barrierId?Infinity:vein?vein.respawn:ROCK_TYPES[rock.type].respawn;
    const yieldAmount=1+rock.bonusYield+(Math.random()<currentBonusYieldChance()?1:0);
    state.mined[rock.type]+=yieldAmount;spawnGroundDrop(rock.type,yieldAmount,rock.x,rock.y);
    sound('break',rock.type);spawnBreak(rock.x,rock.y,rock.type);miningKick(ROCK_TYPES[rock.type].rare?7:4.6,ROCK_TYPES[rock.type].rare?.16:.09,ROCK_TYPES[rock.type].edge,ROCK_TYPES[rock.type].rare?24:14);rock.bonusYield=0;
    floaters.push({x:rock.x,y:rock.y-22,text:ROCK_TYPES[rock.type].label.toUpperCase(),color:ROCK_TYPES[rock.type].edge,age:0,life:.82,size:12});
    registerDepositBreak(rock);
    if(rock.pocketRewardId)registerPocketDepositBreak(rock);
    if(vein)registerVeinBreak(vein,rock);
    if(rock.barrierId){
      const remaining=mineRocks.some(item=>item.barrierId===rock.barrierId&&!item.broken);
      if(!remaining){
        state.clearedMineBarriers[rock.barrierId]=true;
        const barrier=mineBarrierById(rock.barrierId);sound('unlock');rings.push({x:barrier.x+barrier.w*.5,y:barrier.y+barrier.h*.5,age:0,life:.9,radius:36,color:'#e1b96d'});
        floaters.push({x:barrier.x+barrier.w*.5,y:barrier.y+barrier.h*.5-52,text:'PASSAGE OPEN',color:'#ffe2a0',age:0,life:1.3,size:17});
        showToast(barrier.label+' cleared.');
      }
    }
    uiDirty=true;saveState();
  }

  function registerPocketDepositBreak(rock){
    const reward=pocketRewardById(rock.pocketRewardId);if(!reward||state.claimedPocketRewards[reward.id])return;
    const rewardRocks=mineRocks.filter(item=>item.pocketRewardId===reward.id);if(rewardRocks.some(item=>!item.broken))return;
    state.claimedPocketRewards[reward.id]=true;for(const item of rewardRocks)item.respawn=Infinity;
    const bonusType=reward.kind==='crystal'?reward.type:MINE_DISCOVERY_PROFILES[currentScene].main;
    state.pendingPocketLoot[reward.id]={[bonusType]:1};spawnGroundDrop(bonusType,1,rock.x,rock.y,null,currentScene,reward.id);
    sound('jackpot',reward.type);rings.push({x:rock.x,y:rock.y,age:0,life:.9,radius:28,color:ROCK_TYPES[reward.type].edge});
    floaters.push({x:rock.x,y:rock.y-52,text:reward.kind==='crystal'?'CLUSTER CLEARED':'MOTHERLODE CLEARED',color:'#fff2bd',age:0,life:1.5,size:18});
    miningFeedback.lastPocketReward={id:reward.id,kind:reward.kind,label:reward.label};showToast(pocketRewardLabel(reward)+' cleared!');saveState(true);
  }

  function registerDepositBreak(rock){
    if(!rock.depositId)return;
    const depositRocks=mineRocks.filter(item=>item.depositId===rock.depositId),broken=depositRocks.filter(item=>item.broken).length,total=depositRocks.length,progress=total?broken/total:0,data=ROCK_TYPES[rock.type];
    miningFeedback.lastDepositBeat={id:rock.depositId,type:rock.type,broken,total,jackpot:broken===total};
    if(broken<total){
      sound('veinStep',rock.type,progress);rings.push({x:rock.x,y:rock.y,age:0,life:.42,radius:18,color:data.edge});
      floaters.push({x:rock.x,y:rock.y-42,text:broken+' / '+total+' VEIN',color:data.edge,age:0,life:.92,size:12});
      return;
    }
    sound('jackpot',rock.type);spawnJackpot(rock.x,rock.y,rock.type);
    rings.push({x:rock.x,y:rock.y,age:0,life:.95,radius:24,color:data.edge},{x:rock.x,y:rock.y,age:-.12,life:1.02,radius:34,color:'#fff2bd'});
    floaters.push({x:rock.x,y:rock.y-52,text:rock.rareFind?'RARE FIND!':'VEIN CLEARED!',color:'#fff2bd',age:0,life:1.55,size:18});
    showToast(rock.rareFind?data.label+' claimed!':data.label+' vein cleared!');miningKick(rock.rareFind?9:7,.2,data.edge,rock.rareFind?30:24);
  }

  function registerVeinBreak(vein,rock){
    if(vein.status==='idle'){
      vein.status='active';vein.timer=vein.timeLimit;vein.displaySecond=Math.ceil(vein.timer);vein.brokenRockIds.clear();
      showToast(vein.label+' opened. Clear the full vein!');
    }
    if(vein.status!=='active')return;
    vein.brokenRockIds.add(rock.id);
    const veinRocks=rocks.filter(item=>item.veinId===vein.id);
    if(vein.brokenRockIds.size<veinRocks.length)return;
    vein.status='completed';vein.timer=0;vein.displaySecond=-1;state.veinsCompleted[vein.id]++;
    const rewards=[];
    for(const [type,amount] of Object.entries(vein.bonus)){
      state.mined[type]+=amount;rewards.push(amount+' '+ROCK_TYPES[type].label);
    }
    const center=veinCenter(vein);
    let rewardIndex=0;for(const [type,amount] of Object.entries(vein.bonus))spawnGroundDrop(type,amount,center.x+(rewardIndex++-.5)*22,center.y-5);
    sound('vein',vein.type);rings.push({x:center.x,y:center.y,age:0,life:.8,radius:30,color:vein.color});
    floaters.push({x:center.x,y:center.y-48,text:'VEIN CLEARED',color:'#fff0b0',age:0,life:1.45,size:18});
    showToast(rewards.join('  /  '));uiDirty=true;saveState();
  }

  function veinCenter(vein){
    let x=0,y=0;for(const position of vein.positions){x+=position[0];y+=position[1]}
    return{x:x/vein.positions.length,y:y/vein.positions.length};
  }

  function updateVeins(dt){
    for(const vein of veins){
      if(vein.status==='active'){
        vein.timer=Math.max(0,vein.timer-dt);
        const displaySecond=Math.ceil(vein.timer);
        if(displaySecond!==vein.displaySecond){vein.displaySecond=displaySecond;uiDirty=true}
        if(vein.timer===0){vein.status='failed';vein.displaySecond=-1;showToast(vein.label+' cooled before it was cleared.');uiDirty=true}
      }else if(vein.status!=='idle'){
        const allRestored=rocks.filter(rock=>rock.veinId===vein.id).every(rock=>!rock.broken);
        if(allRestored){vein.status='idle';vein.timer=0;vein.displaySecond=-1;vein.brokenRockIds.clear();uiDirty=true}
      }
    }
  }

  function spawnImpact(x,y,type,damage,precision){
    const data=ROCK_TYPES[type],feedback=MATERIAL_FEEDBACK[type]||MATERIAL_FEEDBACK.stone;
    const count=precision?11:6;
    for(let i=0;i<count;i++)addParticle({x,y,vx:(Math.random()-.5)*(precision?225:160)*feedback.spread,vy:-45-Math.random()*(precision?175:125),age:0,life:.35+Math.random()*.22,size:2+Math.random()*(precision?5:4),color:i%2?data.edge:data.accent,gravity:feedback.gravity,shape:feedback.shape});
    floaters.push({x,y:y-14,text:String(damage),color:'#fff2b3',age:0,life:.62,size:13});
    rings.push({x,y,age:0,life:precision?.38:.24,radius:precision?17:12,color:data.edge});
  }

  function spawnBreak(x,y,type){
    const data=ROCK_TYPES[type],feedback=MATERIAL_FEEDBACK[type]||MATERIAL_FEEDBACK.stone;
    for(let i=0;i<15;i++)addParticle({x,y,vx:(Math.random()-.5)*250*feedback.spread,vy:-70-Math.random()*190,age:0,life:.55+Math.random()*.35,size:3+Math.random()*6,color:i%3?data.color:data.edge,gravity:feedback.gravity,shape:feedback.shape});
    rings.push({x,y,age:0,life:.45,radius:18,color:data.edge});
  }

  function spawnDiscoveryBurst(rock,label){
    const data=ROCK_TYPES[rock.type],rare=!!rock.rareFind||!!data.rare,count=rare?28:20;
    for(let index=0;index<count;index++){
      const angle=index/count*Math.PI*2+(index%3)*.08,speed=(rare?150:115)+(index%5)*18;
      addParticle({x:rock.x,y:rock.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-45,age:0,life:.62+(index%4)*.08,size:rare?4.5:3.5,color:index%3?data.edge:data.color,gravity:80,shape:rare?'star':MATERIAL_FEEDBACK[rock.type].shape});
    }
    rings.push({x:rock.x,y:rock.y,age:0,life:.85,radius:18,color:data.edge},{x:rock.x,y:rock.y,age:-.12,life:1.05,radius:30,color:data.edge});
    floaters.push({x:rock.x,y:rock.y-52,text:label,color:data.edge,age:0,life:1.65,size:rare?19:16});
    miningFeedback.lastDiscovery={type:rock.type,label,rare};
    showAreaBanner(label);sound('discovery',rock.type);miningKick(rare?9:7,rare?.24:.18,data.edge,rare?30:22);
  }

  function spawnJackpot(x,y,type){
    const data=ROCK_TYPES[type],feedback=MATERIAL_FEEDBACK[type]||MATERIAL_FEEDBACK.stone;
    for(let index=0;index<28;index++){
      const angle=index/28*Math.PI*2+(index%3)*.07,speed=110+(index%7)*27;
      addParticle({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-60,age:0,life:.7+(index%4)*.09,size:3+(index%5),color:index%4===0?'#fff2bd':index%2?data.edge:data.color,gravity:feedback.gravity*.55,shape:index%5===0?'star':feedback.shape});
    }
  }

  function spawnGroundDrop(type,amount,x,y,sourceChest,scene,sourcePocket){
    if(!ROCK_TYPES[type]||amount<=0)return;
    const count=Math.max(1,Math.floor(amount));
    for(let item=0;item<count;item++){
      if(groundDrops.length>=MAX_GROUND_DROPS){
        let oldestIndex=0;
        for(let index=1;index<groundDrops.length;index++)if(groundDrops[index].age>groundDrops[oldestIndex].age)oldestIndex=index;
        groundDrops.splice(oldestIndex,1);
      }
      const seed=nextDropId++,angle=(seed*2.399963)%6.283,burst=34+(seed%4)*7;
      groundDrops.push({id:seed,type,amount:1,x,y,z:12,vx:Math.cos(angle)*burst,vy:Math.sin(angle)*burst*.58,vz:92+(seed%5)*9,age:0,settled:false,sourceChest:sourceChest||null,sourcePocket:sourcePocket||null,scene:scene||currentScene});
    }
  }

  function collectGroundDrop(drop){
    state.cargo[drop.type]+=drop.amount;
    if(drop.sourceChest&&state.pendingChestLoot[drop.sourceChest]){
      const pending=state.pendingChestLoot[drop.sourceChest];pending[drop.type]=Math.max(0,(pending[drop.type]||0)-drop.amount);
      if(!pending[drop.type])delete pending[drop.type];
      if(!Object.keys(pending).length)delete state.pendingChestLoot[drop.sourceChest];
    }
    if(drop.sourcePocket&&state.pendingPocketLoot[drop.sourcePocket]){
      const pending=state.pendingPocketLoot[drop.sourcePocket];pending[drop.type]=Math.max(0,(pending[drop.type]||0)-drop.amount);
      if(!pending[drop.type])delete pending[drop.type];if(!Object.keys(pending).length)delete state.pendingPocketLoot[drop.sourcePocket];
    }
    pickupBatch.items[drop.type]=(pickupBatch.items[drop.type]||0)+drop.amount;pickupBatch.count+=drop.amount;pickupBatch.quiet=0;
    pickupBatch.x=drop.x;pickupBatch.y=drop.y;
    if(!pickupBatch.bestType||ROCK_TYPES[drop.type].value>ROCK_TYPES[pickupBatch.bestType].value)pickupBatch.bestType=drop.type;
    uiDirty=true;
  }

  function flushPickupBatch(){
    if(!pickupBatch.count)return;
    const entries=Object.entries(pickupBatch.items),best=pickupBatch.bestType||entries[0][0],label=entries.length===1?'+'+pickupBatch.count+' '+ROCK_TYPES[best].label.toUpperCase():'+'+pickupBatch.count+' RESOURCES';
    floaters.push({x:pickupBatch.x,y:pickupBatch.y-24,text:label,color:ROCK_TYPES[best].edge,age:0,life:1.05,size:pickupBatch.count>=4?16:14});
    rings.push({x:pickupBatch.x,y:pickupBatch.y,age:0,life:.28,radius:9+Math.min(8,pickupBatch.count),color:ROCK_TYPES[best].edge});
    sound('pickup',best);
    pickupBatch.items=Object.create(null);pickupBatch.count=0;pickupBatch.quiet=0;pickupBatch.bestType=null;
  }

  function updateGroundDrops(dt){
    let collected=false;
    for(let index=groundDrops.length-1;index>=0;index--){
      const drop=groundDrops[index];drop.age+=dt;
      if(drop.scene!==currentScene)continue;
      if(drop.age>=GROUND_DROP_LIFETIME){groundDrops.splice(index,1);continue}
      if(!drop.settled){
        drop.x+=drop.vx*dt;drop.y+=drop.vy*dt;drop.z+=drop.vz*dt;drop.vz-=330*dt;drop.vx*=Math.pow(.11,dt);drop.vy*=Math.pow(.11,dt);
        if(drop.z<=0){drop.z=0;if(Math.abs(drop.vz)>28){drop.vz=-drop.vz*.27;drop.vx*=.62;drop.vy*=.62}else{drop.vz=0;drop.vx=0;drop.vy=0;drop.settled=true}}
      }
      if(distance(player.x,player.y,drop.x,drop.y)<=GROUND_DROP_PICKUP_RADIUS){collectGroundDrop(drop);groundDrops.splice(index,1);collected=true}
    }
    if(collected)flushPickupBatch();
    else if(pickupBatch.count){pickupBatch.quiet+=dt;if(pickupBatch.quiet>=.075)flushPickupBatch()}
    if(collected)saveState();
  }

  function transitionScene(scene){
    releaseTouchControls();player.swing=null;player.swingCooldown=0;miningFocus.streak=0;miningFocus.timer=0;
    particles.length=0;floaters.length=0;rings.length=0;saleMotes.length=0;activeContext=null;
    if(MINE_SCENES.includes(scene)){
      const mine=MINE_DEFINITIONS[scene];if(!mine.unlock(state))return;
      state.location.surfaceX=player.x;state.location.surfaceY=player.y;currentScene=scene;
      player.x=mine.entrance.x+85;player.y=mine.entrance.y;state.discoveredMines[scene]=true;state.mineDiscovered=state.discoveredMines.mossMine;
      showAreaBanner(mine.name);showToast(scene==='starMine'?'The stars vanish above you.':'The mountain closes behind you.');
    }else{
      const previousMine=currentMine();
      currentScene='surface';player.x=state.location.surfaceX;player.y=state.location.surfaceY;
      showAreaBanner(previousMine?previousMine.surfaceName:currentBiome().name);showToast('Back beneath the open sky.');
    }
    lastRegion=-1;updateCamera(true);uiDirty=true;sound('unlock');saveState(true);
  }

  function contextAtPlayer(){
    const mine=currentMine();
    if(mine){
      if(distance(player.x,player.y,mine.entrance.x,mine.entrance.y)<=118)return'mineExit';
      return null;
    }
    const chest=nearbyChest();if(chest)return'chest:'+chest.id;
    for(const scene of MINE_SCENES){
      const candidate=MINE_DEFINITIONS[scene],entrance=candidate.surfaceEntrance;
      if(candidate.unlock(state)&&distance(player.x,player.y,entrance.x,entrance.y)<=entrance.radius)return'mineEntrance:'+scene;
    }
    if(distance(player.x,player.y,STATIONS.sell.x,STATIONS.sell.y)<=STATIONS.sell.radius)return'sell';
    if(distance(player.x,player.y,STATIONS.forge.x,STATIONS.forge.y)<=STATIONS.forge.radius)return'forge';
    if(!state.areaUnlocked&&distance(player.x,player.y,STATIONS.gate.x,STATIONS.gate.y)<=STATIONS.gate.radius)return'gate';
    if(state.areaUnlocked&&!state.emberdeepUnlocked&&distance(player.x,player.y,STATIONS.emberGate.x,STATIONS.emberGate.y)<=STATIONS.emberGate.radius)return'emberGate';
    if(state.emberdeepUnlocked&&!state.fourthUnlocked&&distance(player.x,player.y,STATIONS.starfallGate.x,STATIONS.starfallGate.y)<=STATIONS.starfallGate.radius)return'starfallGate';
    if(state.fourthUnlocked&&distance(player.x,player.y,STATIONS.starforge.x,STATIONS.starforge.y)<=STATIONS.starforge.radius)return'starforge';
    return null;
  }

  function performContext(){
    unlockAudio();
    if(activeContext&&activeContext.startsWith('mineEntrance:'))transitionScene(activeContext.slice(13));
    else if(activeContext==='mineExit')transitionScene('surface');
    else if(activeContext&&activeContext.startsWith('chest:'))openChest(chestById(activeContext.slice(6)));
    else if(activeContext==='sell')sellCargo();
    else if(activeContext==='forge')upgradePickaxe();
    else if(activeContext==='gate')unlockArea();
    else if(activeContext==='emberGate')unlockEmberdeep();
    else if(activeContext==='starfallGate')unlockStarfall();
  }

  function openChest(chest){
    if(!chest||state.openedChests[chest.id])return;
    if(!chestRequirementMet(chest)){showToast('Requires '+chest.requires.label+'.');sound('empty');return}
    state.openedChests[chest.id]=true;state.pendingChestLoot[chest.id]={...chest.rewards};
    let rewardIndex=0;
    for(const [type,amount] of Object.entries(chest.rewards))spawnGroundDrop(type,amount,chest.x+(rewardIndex++-1)*18,chest.y+8,chest.id);
    const biome=BIOMES.find(item=>item.id===chest.biome);
    sound('chest');rings.push({x:chest.x,y:chest.y,age:0,life:.9,radius:24,color:biome.detail});
    for(let index=0;index<20;index++)particles.push({x:chest.x,y:chest.y-8,vx:(Math.random()-.5)*230,vy:-75-Math.random()*145,age:0,life:.55+Math.random()*.35,size:2+Math.random()*4,color:index%3?'#f4cb69':biome.accent,gravity:270,shape:'spark'});
    floaters.push({x:chest.x,y:chest.y-48,text:'CHEST OPENED',color:'#ffe8a0',age:0,life:1.35,size:18});
    showToast(chestRewardLabel(chest));activeContext=null;uiDirty=true;saveState(true);
  }

  function canForgeStarVariant(id){const variant=STARFORGE_VARIANTS[id];return !!variant&&Object.entries(variant.cost).every(([type,amount])=>state.cargo[type]>=amount)}

  function forgeStarVariant(id){
    const variant=STARFORGE_VARIANTS[id];if(!variant)return;
    if(state.starforgeUnlocked[id]){
      state.starforgeVariant=id;showToast(variant.name+' equipped.');sound('upgrade');uiDirty=true;saveState();return;
    }
    if(!canForgeStarVariant(id)){showToast('Need '+Object.entries(variant.cost).map(([type,amount])=>amount+' '+ROCK_TYPES[type].label).join(' + ')+'.');sound('empty');return}
    for(const [type,amount] of Object.entries(variant.cost))state.cargo[type]-=amount;
    const masteredBefore=starforgeMastered();state.starforgeUnlocked[id]=true;state.starforgeVariant=id;
    sound('upgrade');rings.push({x:STATIONS.starforge.x,y:STATIONS.starforge.y,age:0,life:.9,radius:26,color:variant.color});
    for(let i=floaters.length-1;i>=0;i--)if(floaters[i].source==='starforge')floaters.splice(i,1);
    if(!masteredBefore&&starforgeMastered()){
      rings.push({x:STATIONS.starforge.x,y:STATIONS.starforge.y,age:0,life:1.45,radius:38,color:'#fff0ad'});
      floaters.push({x:player.x,y:player.y+65,text:'DEEPFORGE MASTERED',color:'#fff2b5',age:0,life:2.1,size:21,source:'starforge'});
      showToast('All three Starforge forms mastered.');
    }else{
      floaters.push({x:player.x,y:player.y+65,text:variant.name.toUpperCase(),color:variant.color,age:0,life:1.6,size:18,source:'starforge'});
      showToast(variant.name+' forged. Return here to swap styles.');
    }
    uiDirty=true;saveState();
  }

  function sellCargo(){
    const value=cargoValueTotal();
    if(value<=0){showToast('Your satchel is empty.');sound('empty');return}
    const soldCargo={...state.cargo},goldBefore=state.gold;
    state.gold+=value;state.totalGold+=value;
    startGoldCount(goldBefore,state.gold);spawnSaleMotes(soldCargo);
    for(const type of Object.keys(state.cargo))state.cargo[type]=0;
    sound('coin');floaters.push({x:STATIONS.sell.x,y:STATIONS.sell.y-45,text:'+'+value+' GOLD',color:'#ffd66e',age:0,life:1.35,size:18});
    showToast('Sold your haul for '+value+' gold.');uiDirty=true;saveState();
  }

  function upgradePickaxe(){
    if(state.pickaxeLevel>=PICKAXES.length-1){reforgeEmberPickaxe();return}
    const next=PICKAXES[state.pickaxeLevel+1];
    if(state.pickaxeLevel===4&&!state.emberdeepUnlocked){showToast('Open Emberdeep Foundry first.');sound('empty');return}
    if(state.pickaxeLevel===4&&state.mined.emberstone<EMBER_PICKAXE_ORE_REQUIRED){showToast('Mine '+(EMBER_PICKAXE_ORE_REQUIRED-state.mined.emberstone)+' more Emberstone.');sound('empty');return}
    if(state.gold<next.cost){showToast('Need '+(next.cost-state.gold)+' more gold.');sound('empty');return}
    const referenceType=localReferenceRock(),oldHits=hitsRequired(referenceType,currentPickaxe().power),newHits=hitsRequired(referenceType,next.power);
    state.gold-=next.cost;state.pickaxeLevel++;settleGoldDisplay();
    sound('upgrade');rings.push({x:player.x,y:player.y,age:0,life:.7,radius:20,color:'#f5c766'});
    floaters.push({x:player.x,y:player.y-50,text:PICKAXES[state.pickaxeLevel].name.toUpperCase(),color:'#ffe39a',age:0,life:1.6,size:17});
    showToast(ROCK_TYPES[referenceType].label+': '+oldHits+' hits -> '+newHits+' hits');uiDirty=true;saveState();
  }

  function reforgeEmberPickaxe(){
    const next=nextMastery();
    if(!next){showToast('Ember Mastery is complete.');sound('empty');return}
    if(state.mined.sunslag<next.sunslag){showToast('Discover '+(next.sunslag-state.mined.sunslag)+' more Sunslag.');sound('empty');return}
    if(state.gold<next.gold){showToast('Need '+(next.gold-state.gold)+' more gold.');sound('empty');return}
    const oldPower=currentPower(),oldShellPower=currentShellPower();
    state.gold-=next.gold;state.emberMastery=next.rank;settleGoldDisplay();
    sound('upgrade');rings.push({x:player.x,y:player.y,age:0,life:.82,radius:24,color:'#ff873e'});
    floaters.push({x:player.x,y:player.y-53,text:'EMBER MASTERY '+next.rank,color:'#ffd38c',age:0,life:1.65,size:18});
    showToast(next.label+' - Power '+oldPower+' -> '+currentPower()+' - Shell '+Math.round(oldShellPower*100)+'% -> '+Math.round(currentShellPower()*100)+'%');uiDirty=true;saveState();
  }

  function unlockArea(){
    if(state.pickaxeLevel<3){showToast('A Runed Pickaxe is required.');sound('empty');return}
    if(state.gold<GATE_COST){showToast('Need '+(GATE_COST-state.gold)+' more gold.');sound('empty');return}
    state.gold-=GATE_COST;state.areaUnlocked=true;settleGoldDisplay();
    sound('unlock');rings.push({x:WORLD.gateX,y:WORLD.gateY,age:0,life:1,radius:35,color:'#87edf0'});
    showToast('The Moonglass gate is open.');uiDirty=true;saveState();
  }

  function unlockEmberdeep(){
    if(state.pickaxeLevel<4){showToast('A Moonglass Pickaxe is required.');sound('empty');return}
    if(state.gold<EMBER_GATE_COST){showToast('Need '+(EMBER_GATE_COST-state.gold)+' more gold.');sound('empty');return}
    state.gold-=EMBER_GATE_COST;state.emberdeepUnlocked=true;settleGoldDisplay();
    sound('unlock');rings.push({x:WORLD.emberGateX,y:WORLD.gateY,age:0,life:1,radius:38,color:'#ff8b4f'});
    showToast('The Emberdeep seal has shattered.');uiDirty=true;saveState();
  }

  function unlockStarfall(){
    if(state.emberMastery<5){showToast('Deepforge Mastery 5 is required.');sound('empty');return}
    state.fourthUnlocked=true;
    sound('unlock');rings.push({x:WORLD.starfallGateX,y:WORLD.gateY,age:0,life:1.15,radius:42,color:'#c3c9ff'});
    floaters.push({x:WORLD.starfallGateX,y:WORLD.gateY-55,text:'STARFALL OPEN',color:'#efe5ff',age:0,life:1.8,size:19});
    showToast('The Master Seal answers your pickaxe.');uiDirty=true;saveState();
  }

  function updateInputVector(){
    let x=input.moveX,y=input.moveY;
    if(input.keys.has('ArrowLeft')||input.keys.has('KeyA'))x-=1;
    if(input.keys.has('ArrowRight')||input.keys.has('KeyD'))x+=1;
    if(input.keys.has('ArrowUp')||input.keys.has('KeyW'))y-=1;
    if(input.keys.has('ArrowDown')||input.keys.has('KeyS'))y+=1;
    const length=Math.hypot(x,y);return length>1?{x:x/length,y:y/length}:{x,y};
  }

  function collidesWithMine(x,y){
    if(!currentMine())return false;
    if(terrainCollidesCircle(x,y))return true;
    for(const solid of activeMineSolids()){
      const nearestX=clamp(x,solid.x,solid.x+solid.w),nearestY=clamp(y,solid.y,solid.y+solid.h);
      if(distance(x,y,nearestX,nearestY)<player.radius)return true;
    }
    return false;
  }

  function update(dt){
    if(!menuShade.hidden)return;
    time+=dt;
    const move=updateInputVector();
    if(Math.abs(move.x)+Math.abs(move.y)>.02){
      const aimLength=Math.hypot(move.x,move.y);if(aimLength>.05){player.aimX=move.x/aimLength;player.aimY=move.y/aimLength}
      let nx=player.x+move.x*PLAYER_SPEED*dt,ny=player.y+move.y*PLAYER_SPEED*dt;
      const world=currentWorld();nx=clamp(nx,52,world.width-52);ny=clamp(ny,70,world.height-58);
      if(currentScene==='surface'){
        if(!state.areaUnlocked&&player.x<WORLD.gateX&&nx>WORLD.gateX-36)nx=WORLD.gateX-36;
        if(!state.areaUnlocked&&player.x>WORLD.gateX&&nx<WORLD.gateX+36)nx=WORLD.gateX+36;
        if(!state.emberdeepUnlocked&&player.x<WORLD.emberGateX&&nx>WORLD.emberGateX-36)nx=WORLD.emberGateX-36;
        if(!state.emberdeepUnlocked&&player.x>WORLD.emberGateX&&nx<WORLD.emberGateX+36)nx=WORLD.emberGateX+36;
        if(!state.fourthUnlocked&&player.x<WORLD.starfallGateX&&nx>WORLD.starfallGateX-36)nx=WORLD.starfallGateX-36;
        if(!state.fourthUnlocked&&player.x>WORLD.starfallGateX&&nx<WORLD.starfallGateX+36)nx=WORLD.starfallGateX+36;
      }
      if(!collidesWithMine(nx,player.y))player.x=nx;
      if(!collidesWithMine(player.x,ny))player.y=ny;
      player.walk+=dt*9;player.facing=move.x<-.06?-1:(move.x>.06?1:player.facing);
    }
    player.swingCooldown=Math.max(0,player.swingCooldown-dt);
    if(miningFocus.timer>0){
      miningFocus.timer=Math.max(0,miningFocus.timer-dt);
      if(miningFocus.timer===0&&miningFocus.streak){miningFocus.streak=0;uiDirty=true}
    }
    if(player.swing){
      player.swing.elapsed+=dt;
      const hitAt=player.swing.duration*.36;
      if(!player.swing.hit&&player.swing.elapsed>=hitAt){
        player.swing.hit=true;
        if(player.swing.target==='terrain')hitTerrain(player.hitTerrainIndex);
        else hitRock(rocks.find(rock=>rock.id===player.hitRockId),player.swing.precision);
      }
      if(player.swing.elapsed>=player.swing.duration){player.swing=null;player.swingCooldown=.02}
    }
    if(input.mineHeld&&!player.swing&&player.swingCooldown<=0)startSwing(false);
    const miningTarget=nearestRock(MINING_RANGE);
    for(const rock of currentRocks()){
      rock.hit=Math.max(0,rock.hit-dt);
      if(rock.broken){
        if(rock.barrierId)continue;
        rock.respawn-=dt;
        if(rock.respawn<=0){rock.broken=false;rock.hp=rock.maxHp;rock.shell=rock.maxShell;rock.respawn=0;rock.glintActive=0;rock.glintTimer=1.6+(rock.id%5)*.52;rock.bonusYield=0}
        continue;
      }
      if(rock.glintActive>0)rock.glintActive=Math.max(0,rock.glintActive-dt);
      else if(miningTarget&&miningTarget.id===rock.id){
        rock.glintTimer-=dt;
        if(rock.glintTimer<=0){rock.glintActive=.72;rock.glintTimer=(2.4+(rock.id%4)*.38)*currentPrecisionDelay()}
      }
    }
    if(currentScene==='surface')updateVeins(dt);else updatePocketRewards();updateGroundDrops(dt);
    if(terrainSaveDelay>0){terrainSaveDelay=Math.max(0,terrainSaveDelay-dt);if(terrainSaveDelay===0)saveState()}
    updateEffects(dt);updateGoldCount(dt);updateCamera(false);
    const region=currentScene==='surface'?regionIndexAt(player.x):-1;
    if(region!==lastRegion){lastRegion=region;game.dataset.biome=currentBiome().id;uiDirty=true}
    const nextContext=contextAtPlayer();
    if(nextContext!==activeContext){activeContext=nextContext;uiDirty=true}
    if(currentScene==='surface'){
      if(!state.discoveredSecond&&player.x>WORLD.gateX+100){state.discoveredSecond=true;showAreaBanner('MOONGLASS CAVERN');sound('unlock');uiDirty=true;saveState()}
      if(!state.discoveredThird&&player.x>WORLD.emberGateX+100){state.discoveredThird=true;showAreaBanner('EMBERDEEP FOUNDRY');sound('unlock');uiDirty=true;saveState()}
      if(!state.discoveredFourth&&player.x>WORLD.starfallGateX+100){state.discoveredFourth=true;showAreaBanner('STARFALL DEPTHS');sound('unlock');uiDirty=true;saveState()}
    }
    if(uiDirty)updateUI();
  }

  function updateEffects(dt){
    for(const particle of particles){particle.age+=dt;particle.x+=particle.vx*dt;particle.y+=particle.vy*dt;particle.vy+=particle.gravity*dt;particle.vx*=Math.pow(.08,dt)}
    for(const floater of floaters){floater.age+=dt;floater.y-=35*dt}
    for(const ring of rings)ring.age+=dt;
    for(const mote of saleMotes)mote.age+=dt;
    if(miningFeedback.shakeTime>0){miningFeedback.shakeTime=Math.max(0,miningFeedback.shakeTime-dt);miningFeedback.shake*=Math.pow(.002,dt)}else miningFeedback.shake=0;
    miningFeedback.flash=Math.max(0,miningFeedback.flash-dt*1.9);
    miningFeedback.terrainHitTime=Math.max(0,miningFeedback.terrainHitTime-dt);
    if(miningFeedback.terrainHitTime===0)miningFeedback.terrainHitIndex=-1;
    particles=particles.filter(item=>item.age<item.life);floaters=floaters.filter(item=>item.age<item.life);rings=rings.filter(item=>item.age<item.life);saleMotes=saleMotes.filter(item=>item.age<item.life);
  }

  function startGoldCount(from,to){displayedGold=from;goldTween={from,to,elapsed:0,duration:.72}}
  function settleGoldDisplay(){goldTween=null;displayedGold=state.gold;goldValue.textContent=String(Math.floor(displayedGold))}
  function updateGoldCount(dt){
    if(!goldTween)return;
    goldTween.elapsed+=dt;const progress=easeOut(goldTween.elapsed/goldTween.duration);
    displayedGold=goldTween.from+(goldTween.to-goldTween.from)*progress;goldValue.textContent=String(Math.floor(displayedGold));
    if(goldTween.elapsed>=goldTween.duration)settleGoldDisplay();
  }

  function spawnSaleMotes(soldCargo){
    let moteIndex=0;
    for(const type of Object.keys(soldCargo)){
      const amount=soldCargo[type];if(!amount)continue;
      const count=Math.min(4,Math.max(1,Math.ceil(amount/3)));
      for(let index=0;index<count;index++)saleMotes.push({sx:player.x+(index-count/2)*8,sy:player.y-22-index*3,tx:STATIONS.sell.x,ty:STATIONS.sell.y-20,age:-moteIndex*.045,life:.56,color:ROCK_TYPES[type].edge,size:3+(type==='gold'||type==='starshard'?2:0)});
      moteIndex+=count;
    }
  }

  function updateUI(){
    uiDirty=false;
    if(!goldTween){displayedGold=state.gold;goldValue.textContent=String(Math.floor(displayedGold))}cargoValue.textContent=String(cargoCount());
    pickaxeName.textContent=currentPickaxeName();powerValue.textContent=String(currentPower());
    game.dataset.pickaxeTier=String(state.pickaxeLevel);
    game.dataset.masteryRank=String(state.emberMastery);
    speedValue.textContent=(PICKAXES[1].cooldown/currentCooldown()).toFixed(1)+'x';
    const biome=currentBiome();areaName.textContent=biome.name;game.dataset.biome=biome.id;
    let progress=1,label='DEEPFORGE MASTERED';
    if(currentMine()){
      const mine=currentMine(),cleared=mine.barriers.filter(barrier=>mineBarrierCleared(barrier.id)).length;progress=cleared/mine.barriers.length;label=mine.name+' - PASSAGES '+cleared+'/'+mine.barriers.length;
    }
    else if(starforgeMastered()){progress=1;label='DEEPFORGE MASTERED - 3/3 STARFORGE FORMS'}
    else if(!state.areaUnlocked){progress=Math.min(1,Math.min(state.gold/GATE_COST,state.pickaxeLevel/3));label='MOONGLASS CAVERN'}
    else if(!state.emberdeepUnlocked){progress=Math.min(1,Math.min(state.gold/EMBER_GATE_COST,state.pickaxeLevel/4));label='EMBERDEEP FOUNDRY'}
    else if(state.pickaxeLevel<PICKAXES.length-1){progress=Math.min(1,state.gold/PICKAXES[PICKAXES.length-1].cost,state.mined.emberstone/EMBER_PICKAXE_ORE_REQUIRED);label='EMBER PICKAXE '+Math.min(EMBER_PICKAXE_ORE_REQUIRED,state.mined.emberstone)+'/'+EMBER_PICKAXE_ORE_REQUIRED}
    else if(nextMastery()){
      const next=nextMastery();progress=Math.min(1,state.gold/next.gold,state.mined.sunslag/next.sunslag);label='EMBER MASTERY '+state.emberMastery+'/5 - SUNSLAG '+Math.min(next.sunslag,state.mined.sunslag)+'/'+next.sunslag;
    }else if(!state.fourthUnlocked){progress=0;label='OPEN STARFALL DEPTHS'}
    else if(!state.starforgeVariant){progress=Math.min(1,state.cargo.astralite/5,state.cargo.crownstone/1);label='STARFORGE - ASTRALITE '+Math.min(5,state.cargo.astralite)+'/5 - CROWNSTONE '+Math.min(1,state.cargo.crownstone)+'/1'}
    else{progress=Object.values(state.starforgeUnlocked).filter(Boolean).length/3;label='STARFORGE FORMS '+Object.values(state.starforgeUnlocked).filter(Boolean).length+'/3'}
    unlockFill.style.width=(progress*100)+'%';unlockLabel.textContent=label;
    const activeVein=veins.find(vein=>vein.status==='active');
    objective.hidden=starforgeMastered();
    if(currentMine()){
      const mine=currentMine(),barrier=mine.barriers.find(item=>!mineBarrierCleared(item.id)),nearBarrier=barrier&&distance(player.x,player.y,barrier.x+barrier.w*.5,barrier.y+barrier.h*.5)<190;
      const revealed=mineRocks.find(rock=>rock.scene===currentScene&&!rock.barrierId&&!rock.broken&&rockIsExposed(rock));
      if(nearBarrier&&state.pickaxeLevel<barrier.requiresPickaxe)objectiveText.textContent='Return with a '+PICKAXES[barrier.requiresPickaxe].name;
      else if(nearBarrier)objectiveText.textContent=barrier.objective||'Break the '+barrier.label;
      else if(revealed)objectiveText.textContent='Mine the exposed '+ROCK_TYPES[revealed.type].label;
      else if(state.terrainDug[currentScene].length===0)objectiveText.textContent='Mine into the mountain';
      else objectiveText.textContent='Dig deeper - what is behind the wall?';
    }
    else if(starforgeMastered())objectiveText.textContent='Deepforge mastered - every Starforge form forged';
    else if(activeVein)objectiveText.textContent=activeVein.label+' '+activeVein.brokenRockIds.size+'/'+activeVein.positions.length+' - '+Math.ceil(activeVein.timer)+'s';
    else if(state.emberMastery===5&&!state.fourthUnlocked)objectiveText.textContent='Open the Starfall Master Seal';
    else if(state.fourthUnlocked&&!state.discoveredFourth)objectiveText.textContent='Enter Starfall Depths';
    else if(state.discoveredFourth&&state.mined.astralite===0)objectiveText.textContent='Discover Astralite';
    else if(state.discoveredFourth&&state.veinsCompleted.starfall_lattice===0)objectiveText.textContent='Clear the Starfall Lattice';
    else if(state.discoveredFourth&&state.mined.crownstone===0)objectiveText.textContent='Find a Crownstone vein';
    else if(state.discoveredFourth&&!state.starforgeVariant)objectiveText.textContent='Forge a Starfall Pickaxe';
    else if(state.discoveredFourth&&state.starforgeVariant)objectiveText.textContent='Forge all three Starforge styles';
    else if(Object.values(state.mined).every(value=>value===0))objectiveText.textContent='Hold MINE near a rock';
    else if(state.totalGold===0)objectiveText.textContent='Sell your haul at the assay cart';
    else if(state.pickaxeLevel===1)objectiveText.textContent='Forge an Iron Pickaxe';
    else if(state.pickaxeLevel===2)objectiveText.textContent='Forge a Runed Pickaxe';
    else if(!state.areaUnlocked)objectiveText.textContent='Open the Moonglass Gate';
    else if(!state.discoveredSecond)objectiveText.textContent='Enter the new cavern';
    else if(state.mined.moonglass===0)objectiveText.textContent='Discover Moonglass';
    else if(state.pickaxeLevel===3)objectiveText.textContent='Forge a Moonglass Pickaxe';
    else if(!state.emberdeepUnlocked)objectiveText.textContent='Break the Emberdeep Seal';
    else if(!state.discoveredThird)objectiveText.textContent='Enter Emberdeep Foundry';
    else if(state.mined.emberstone===0)objectiveText.textContent='Crack an Emberstone shell';
    else if(state.pickaxeLevel===4&&state.mined.emberstone<EMBER_PICKAXE_ORE_REQUIRED)objectiveText.textContent='Mine Emberstone - '+state.mined.emberstone+'/'+EMBER_PICKAXE_ORE_REQUIRED;
    else if(state.pickaxeLevel===4)objectiveText.textContent='Forge the Ember Pickaxe';
    else if(state.mined.gold+state.mined.starshard+state.mined.sunslag===0)objectiveText.textContent='Hunt for a rare vein';
    else if(nextMastery()&&state.mined.sunslag<nextMastery().sunslag)objectiveText.textContent='Find Sunslag - '+state.mined.sunslag+'/'+nextMastery().sunslag;
    else if(nextMastery())objectiveText.textContent='Reforge Ember Mastery '+nextMastery().rank;
    else objectiveText.textContent='Mine. Sell. Grow stronger.';
    renderContext();updateLedger();
    renderFocus();
  }

  function renderFocus(){
    focusMeter.hidden=miningFocus.streak===0;
    if(!miningFocus.streak)return;
    focusCount.textContent=miningFocus.streak+'/5';focusMeter.classList.toggle('master',miningFocus.streak===5);
    focusMeter.querySelectorAll('i').forEach((pip,index)=>pip.classList.toggle('active',index<miningFocus.streak));
  }

  function renderContext(){
    contextPanel.hidden=!activeContext;
    contextPanel.classList.toggle('starforge-open',activeContext==='starforge');
    contextPanel.classList.toggle('chest-context',!!activeContext&&activeContext.startsWith('chest:'));
    contextPanel.classList.toggle('mine-context',activeContext==='mineExit'||!!activeContext&&activeContext.startsWith('mineEntrance:'));
    contextButton.hidden=activeContext==='starforge';starforgeChoices.hidden=activeContext!=='starforge';
    if(!activeContext)return;
    if(activeContext.startsWith('mineEntrance:')){
      const mine=MINE_DEFINITIONS[activeContext.slice(13)];
      contextEyebrow.textContent='DUNGEON ENTRANCE';contextTitle.textContent=titleCase(mine.name);contextDetail.textContent='Explore a unique mine layout, clear permanent passages and uncover richer resources.';contextButton.textContent='ENTER';contextButton.disabled=false;
    }else if(activeContext==='mineExit'){
      const mine=currentMine();contextEyebrow.textContent='MINE EXIT';contextTitle.textContent='Return to '+titleCase(mine.surfaceName);contextDetail.textContent='Your cargo and cleared passages are preserved.';contextButton.textContent='LEAVE';contextButton.disabled=false;
    }else if(activeContext.startsWith('chest:')){
      const chest=chestById(activeContext.slice(6)),ready=chest&&chestRequirementMet(chest);
      if(!chest)return;
      contextEyebrow.textContent=ready?'DISCOVERED CACHE':'SEALED CACHE';contextTitle.textContent=chest.name;
      contextDetail.textContent=ready?chestRewardLabel(chest):'Requires '+chest.requires.label+' - return when your pickaxe is stronger.';
      contextButton.textContent=ready?'OPEN':'LOCKED';contextButton.disabled=!ready;
    }else if(activeContext==='sell'){
      const value=cargoValueTotal();contextEyebrow.textContent='ASSAY CART';contextTitle.textContent=value?value+' gold in your satchel':'Sell Resources';contextDetail.textContent=value?'Turn every carried resource into gold.':'Mine something, then bring it here.';contextButton.textContent=value?'SELL ALL':'EMPTY';contextButton.disabled=value<=0;
    }else if(activeContext==='forge'){
      if(state.pickaxeLevel===4){
        const next=PICKAXES[5],currentHits=hitsRequired('emberstone',currentPickaxe().power),nextHits=hitsRequired('emberstone',next.power);
        contextEyebrow.textContent='FORGE UPGRADE - POWER '+currentPickaxe().power+' -> '+next.power;contextTitle.textContent=next.name;
        if(!state.emberdeepUnlocked)contextDetail.textContent='Open Emberdeep Foundry first.';
        else if(!emberPickaxeReady())contextDetail.textContent='EMBERSTONE '+state.mined.emberstone+' / '+EMBER_PICKAXE_ORE_REQUIRED+' - '+currentHits+' -> '+nextHits+' HITS';
        else contextDetail.textContent='EMBERSTONE READY - '+currentHits+' -> '+nextHits+' HITS';
        contextButton.textContent=emberPickaxeReady()?next.cost+' GOLD':'LOCKED '+Math.min(EMBER_PICKAXE_ORE_REQUIRED,state.mined.emberstone)+'/'+EMBER_PICKAXE_ORE_REQUIRED;
        contextButton.disabled=!emberPickaxeReady()||state.gold<next.cost;return;
      }
      if(state.pickaxeLevel>=PICKAXES.length-1){
        const next=nextMastery();
        if(!next){contextEyebrow.textContent='EMBER MASTERY 5 / 5';contextTitle.textContent='Deepforge Master';contextDetail.textContent=state.fourthUnlocked?'Starfall Depths is open. Astralite now yields to your pickaxe.':'The Starfall Master Seal waits east of Emberdeep.';contextButton.textContent='MASTERED';contextButton.disabled=true}
        else{
          const oldHits=armoredHitsRequired('sunslag',currentPower(),currentShellPower()),newHits=armoredHitsRequired('sunslag',next.power,next.shellPower);
          contextEyebrow.textContent='REFORGE '+state.emberMastery+' / 5 - POWER '+currentPower()+' -> '+next.power;contextTitle.textContent=next.label;
          contextDetail.textContent='SUNSLAG '+Math.min(state.mined.sunslag,next.sunslag)+' / '+next.sunslag+' - TOTAL '+oldHits+' -> '+newHits+' HITS - YIELD '+Math.round(next.bonusYield*100)+'%';
          contextButton.textContent=state.mined.sunslag>=next.sunslag?next.gold+' GOLD':'LOCKED '+Math.min(state.mined.sunslag,next.sunslag)+'/'+next.sunslag;
          contextButton.disabled=!masteryReady();
        }
      }
      else{const next=PICKAXES[state.pickaxeLevel+1],type=localReferenceRock(),currentHits=hitsRequired(type,currentPickaxe().power),nextHits=hitsRequired(type,next.power);contextEyebrow.textContent='FORGE UPGRADE · POWER '+currentPickaxe().power+' -> '+next.power;contextTitle.textContent=next.name;contextDetail.textContent=ROCK_TYPES[type].label.toUpperCase()+' '+currentHits+' -> '+nextHits+' HITS';contextButton.textContent=next.cost+' GOLD';contextButton.disabled=state.gold<next.cost}
    }else if(activeContext==='gate'){
      contextEyebrow.textContent='SEALED PASSAGE';contextTitle.textContent='Moonglass Cavern';contextDetail.textContent=state.pickaxeLevel<3?'Requires a Runed Pickaxe.':'A richer vein waits beyond.';contextButton.textContent=GATE_COST+' GOLD';contextButton.disabled=state.pickaxeLevel<3||state.gold<GATE_COST;
    }else if(activeContext==='emberGate'){
      contextEyebrow.textContent='ANCIENT HEAT SEAL';contextTitle.textContent='Emberdeep Foundry';contextDetail.textContent=state.pickaxeLevel<4?'Requires a Moonglass Pickaxe.':'Precision cracks its armored ore faster.';contextButton.textContent=EMBER_GATE_COST+' GOLD';contextButton.disabled=state.pickaxeLevel<4||state.gold<EMBER_GATE_COST;
    }else if(activeContext==='starfallGate'){
      contextEyebrow.textContent='MASTER SEAL';contextTitle.textContent='Starfall Depths';contextDetail.textContent=state.emberMastery<5?'Requires Ember Mastery 5.':'Your completed Ember Pickaxe can open it.';contextButton.textContent=state.emberMastery<5?'LOCKED '+state.emberMastery+'/5':'OPEN';contextButton.disabled=state.emberMastery<5;
    }else if(activeContext==='starforge'){
      contextEyebrow.textContent='STARFORGE';contextTitle.textContent=state.starforgeVariant?currentStarforge().name:'Choose a final craft';contextDetail.textContent='Crusher hits harder. Comet strikes faster. Crownseeker finds more ore.';
      starforgeChoices.querySelectorAll('button').forEach(button=>{
        const id=button.dataset.starforge,variant=STARFORGE_VARIANTS[id],unlocked=state.starforgeUnlocked[id],selected=state.starforgeVariant===id;
        button.classList.toggle('selected',selected);button.disabled=selected;
        button.querySelector('b').textContent=variant.name.toUpperCase();
        button.querySelector('small').textContent=selected?'ACTIVE':unlocked?'SELECT':variant.short+' - '+variant.cost.astralite+'A '+variant.cost.crownstone+'C';
      });
    }
  }

  function updateLedger(){
    document.getElementById('stoneMined').textContent=state.mined.stone;
    document.getElementById('copperMined').textContent=state.mined.copper;
    document.getElementById('crystalMined').textContent=state.mined.moonglass;
    document.getElementById('emberMined').textContent=state.mined.emberstone;
    document.getElementById('astraliteMined').textContent=state.mined.astralite;
    document.getElementById('rareMined').textContent=state.mined.gold+state.mined.starshard+state.mined.sunslag+state.mined.crownstone;
    document.getElementById('veinsCleared').textContent=Object.values(state.veinsCompleted).reduce((total,value)=>total+value,0);
    document.getElementById('masteryRank').textContent=state.emberMastery+' / 5';
    document.getElementById('deepestFrontier').textContent=state.discoveredFourth?'Starfall':state.discoveredThird?'Emberdeep':state.discoveredSecond?'Moonglass':'Mossvein';
    document.getElementById('starforgeForms').textContent=Object.values(state.starforgeUnlocked).filter(Boolean).length+' / 3';
    document.getElementById('chestsOpened').textContent=Object.values(state.openedChests).filter(Boolean).length+' / '+chests.length;
    const totalMineBarriers=MINE_SCENES.reduce((total,scene)=>total+MINE_DEFINITIONS[scene].barriers.length,0);
    document.getElementById('minePassages').textContent=Object.values(state.clearedMineBarriers).filter(Boolean).length+' / '+totalMineBarriers;
    document.getElementById('totalGold').textContent=state.totalGold;
  }

  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    ctx.save();ctx.scale(viewZoom,viewZoom);
    if(currentMine()){
      drawMineGround();drawMineTerrain();drawMineWalls();drawMineEntrance(false,currentMine());drawRocks();drawWorldLabels();drawEffects(false);drawGroundDrops();drawPlayer();drawEffects(true);
    }else{
      drawGround();drawBiomeStructure();drawDecorations();drawStations();drawSurfaceMineEntrances();drawGate();drawVeins();drawRocks();drawChests();drawWorldLabels();drawEffects(false);drawGroundDrops();drawPlayer();drawEffects(true);
    }
    ctx.restore();
  }

  function drawMineGround(){
    const mine=currentMine();ctx.fillStyle=mine.floor;ctx.fillRect(0,0,viewWidth,viewHeight);
    const origin=worldToScreen(0,0);
    ctx.save();ctx.translate(origin.x,origin.y);ctx.fillStyle=mine.floor;ctx.fillRect(0,0,mine.width,mine.height);
    const glowX=mine.width*.78,glowY=mine.height*.5,glow=ctx.createRadialGradient(glowX,glowY,40,glowX,glowY,Math.max(mine.width,mine.height)*.38);
    glow.addColorStop(0,mine.style==='ember'?'rgba(255,91,34,.18)':mine.style==='moon'?'rgba(92,226,225,.14)':mine.style==='star'?'rgba(163,145,255,.15)':'rgba(166,118,45,.17)');glow.addColorStop(1,'rgba(10,12,14,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,mine.width,mine.height);
    ctx.strokeStyle=mine.style==='ember'?'rgba(255,127,69,.055)':mine.style==='star'?'rgba(190,195,255,.05)':mine.style==='moon'?'rgba(115,224,220,.055)':'rgba(198,174,112,.055)';ctx.lineWidth=1;
    for(let x=0;x<=mine.width;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,mine.height);ctx.stroke()}
    for(let y=0;y<=mine.height;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(mine.width,y);ctx.stroke()}
    if(mine.style==='moss'){
      ctx.strokeStyle='#4a3e29';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(120,650);ctx.lineTo(1800,650);ctx.stroke();ctx.strokeStyle='#a07c43';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(120,641);ctx.lineTo(1800,641);ctx.moveTo(120,659);ctx.lineTo(1800,659);ctx.stroke();ctx.strokeStyle='#55452d';ctx.lineWidth=5;for(let x=140;x<1810;x+=54){ctx.beginPath();ctx.moveTo(x,628);ctx.lineTo(x,672);ctx.stroke()}
    }else if(mine.style==='moon'){
      drawMineRoute([[150,1180],[350,1180],[535,700],[790,700],[1055,500],[1320,350],[1530,350]],'#224e52','#6bc6c3');
      ctx.fillStyle='rgba(107,229,224,.22)';for(let i=0;i<20;i++){const x=90+(i*277)%1500,y=170+(i*193)%1080;ctx.beginPath();ctx.moveTo(x,y-18);ctx.lineTo(x+11,y+8);ctx.lineTo(x-8,y+15);ctx.closePath();ctx.fill()}
    }else if(mine.style==='ember'){
      drawMineRoute([[145,1030],[360,1030],[555,625],[710,625],[1080,680],[1265,450],[1560,450],[1710,980]],'#54261d','#d75b32');
      ctx.strokeStyle='rgba(255,91,35,.55)';ctx.lineWidth=5;for(let x=170;x<mine.width;x+=310){ctx.beginPath();ctx.moveTo(x,145);ctx.lineTo(x+90,mine.height-145);ctx.stroke()}
    }else{
      drawMineRoute([[160,750],[510,750],[900,725],[1260,725],[1650,460],[2020,460]],'#242650','#777fc1');
      ctx.fillStyle='rgba(224,226,255,.6)';for(let i=0;i<55;i++){const x=(i*173)%mine.width,y=(i*271)%mine.height,r=i%9===0?2:1;ctx.fillRect(x,y,r,r)}
    }
    for(const cavern of currentTerrain().caverns){
      if(!cavernIsDiscovered(cavern.id))continue;
      const screenX=origin.x+cavern.x,screenY=origin.y+cavern.y;if(screenX+cavern.rx<-50||screenY+cavern.ry<-50||screenX-cavern.rx>viewWidth+50||screenY-cavern.ry>viewHeight+50)continue;
      ctx.save();ctx.translate(cavern.x,cavern.y);ctx.fillStyle='rgba(4,7,7,.42)';ctx.strokeStyle=mine.detail;ctx.globalAlpha=.82;ctx.lineWidth=3;
      ctx.beginPath();ctx.ellipse(0,0,cavern.rx,cavern.ry,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.globalAlpha=1;
      ctx.fillStyle='rgba(5,8,7,.78)';ctx.fillRect(-68,-11,136,22);ctx.fillStyle=mine.detail;ctx.textAlign='center';ctx.font='900 9px Georgia';ctx.fillText(cavern.name.toUpperCase(),0,3);ctx.restore();
      drawPocketReward(cavern,origin);
    }
    ctx.restore();
  }

  function drawPocketReward(cavern,origin){
    const mine=currentMine(),reward=cavern.reward,claimed=!!state.claimedPocketRewards[reward.id];
    if(reward.kind==='crystal'||reward.kind==='motherlode')return;
    const x=origin.x+cavern.x,y=origin.y+cavern.y+30;if(x<-70||y<-70||x>viewWidth+70||y>viewHeight+70)return;
    ctx.save();ctx.translate(cavern.x,cavern.y+30);ctx.globalAlpha=claimed?.34:1;
    if(reward.kind==='cache'){
      ctx.fillStyle=claimed?'#3d3327':'#765329';ctx.strokeStyle=claimed?'#75684e':'#e4bd65';ctx.lineWidth=2;ctx.fillRect(-20,-12,40,25);ctx.strokeRect(-20,-12,40,25);
      ctx.fillStyle=claimed?'#6f6249':'#d6aa4f';ctx.fillRect(-22,-15,44,8);ctx.fillStyle='#1b1710';ctx.fillRect(-3,-8,6,9);
    }else if(reward.kind==='shrine'){
      ctx.strokeStyle=mine.detail;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(7,0);ctx.lineTo(0,15);ctx.lineTo(-7,0);ctx.closePath();ctx.stroke();
    }else{
      ctx.strokeStyle=ROCK_TYPES[reward.type].edge;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.stroke();
    }
    if(!claimed){ctx.fillStyle=mine.detail;ctx.textAlign='center';ctx.font='900 8px Georgia';ctx.fillText(reward.label,0,31)}ctx.restore();
  }

  function drawMineRoute(points,edge,center){
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=edge;ctx.lineWidth=72;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.stroke();
    ctx.strokeStyle=center;ctx.globalAlpha=.38;ctx.lineWidth=3;ctx.stroke();ctx.globalAlpha=1;
  }

  function drawMineTerrainCell(mine,index,col,row,damage,targeted){
    const x=col*MINE_TILE_SIZE-camera.x,y=row*MINE_TILE_SIZE-camera.y,seed=(index*37+row*11)%29;
    ctx.fillStyle=mine.wall;ctx.fillRect(x-.5,y-.5,MINE_TILE_SIZE+1,MINE_TILE_SIZE+1);
    ctx.strokeStyle=mine.wallEdge;ctx.globalAlpha=.28;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+4,y+13+seed%8);ctx.lineTo(x+18+seed%12,y+4);ctx.lineTo(x+MINE_TILE_SIZE-3,y+17+seed%11);ctx.lineTo(x+MINE_TILE_SIZE-9,y+MINE_TILE_SIZE-4);ctx.lineTo(x+9,y+MINE_TILE_SIZE-7);ctx.closePath();ctx.stroke();
    if(damage>0){
      const stage=Math.max(1,Math.min(3,Math.ceil(damage*3))),cx=x+MINE_TILE_SIZE*.5,cy=y+MINE_TILE_SIZE*.5,jitter=seed%7-3;
      ctx.globalAlpha=.52+.15*stage;ctx.strokeStyle='#11120f';ctx.lineWidth=1.2+stage*.7;ctx.lineCap='round';ctx.beginPath();
      ctx.moveTo(cx+jitter,cy);ctx.lineTo(x+8+seed%9,y+6);ctx.moveTo(cx+jitter,cy);ctx.lineTo(x+MINE_TILE_SIZE-7,y+13+seed%12);
      if(stage>=2){ctx.moveTo(cx,cy);ctx.lineTo(x+12,y+MINE_TILE_SIZE-5);ctx.moveTo(cx-4,cy-3);ctx.lineTo(x+7,y+22)}
      if(stage>=3){ctx.moveTo(cx,cy);ctx.lineTo(x+MINE_TILE_SIZE-8,y+MINE_TILE_SIZE-6);ctx.moveTo(cx+7,cy+5);ctx.lineTo(x+MINE_TILE_SIZE-5,y+30)}
      ctx.stroke();
    }
    if(miningFeedback.terrainHitIndex===index&&miningFeedback.terrainHitTime>0){ctx.globalAlpha=miningFeedback.terrainHitTime/.16*.28;ctx.fillStyle=mine.wallEdge;ctx.fillRect(x+1,y+1,MINE_TILE_SIZE-2,MINE_TILE_SIZE-2)}
    if(targeted){ctx.globalAlpha=.72;ctx.strokeStyle=mine.detail;ctx.lineWidth=3;ctx.strokeRect(x+3,y+3,MINE_TILE_SIZE-6,MINE_TILE_SIZE-6)}
    ctx.globalAlpha=1;
  }

  function drawMineTerrain(){
    const mine=currentMine(),terrain=currentTerrain();if(!mine||!terrain)return;
    const startCol=Math.max(0,Math.floor(camera.x/MINE_TILE_SIZE)-1),endCol=Math.min(terrain.cols-1,Math.ceil((camera.x+viewWidth)/MINE_TILE_SIZE)+1);
    const startRow=Math.max(0,Math.floor(camera.y/MINE_TILE_SIZE)-1),endRow=Math.min(terrain.rows-1,Math.ceil((camera.y+viewHeight)/MINE_TILE_SIZE)+1);
    const target=nearestTerrainCell(MINING_RANGE);
    for(let row=startRow;row<=endRow;row++)for(let col=startCol;col<=endCol;col++){
      const index=row*terrain.cols+col,type=terrainTypeAt(terrain,col,row);if(!type)continue;
      drawMineTerrainCell(mine,index,col,row,1-terrainHpAt(terrain,col,row)/MINE_TERRAIN_HP,target&&target.index===index);
    }
    for(const cavern of terrain.caverns){
      if(cavernIsDiscovered(cavern.id))continue;
      for(const index of cavern.cells){
        const col=index%terrain.cols,row=Math.floor(index/terrain.cols);if(col<startCol||col>endCol||row<startRow||row>endRow)continue;
        drawMineTerrainCell(mine,index,col,row,0,false);
      }
    }
  }

  function drawMineWalls(){
    const mine=currentMine();
    for(const wall of mine.solids){
      const p=worldToScreen(wall.x,wall.y);if(p.x>viewWidth+60||p.y>viewHeight+60||p.x+wall.w< -60||p.y+wall.h< -60)continue;
      ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle=mine.style==='star'?'#050610':'#0e1110';ctx.fillRect(0,0,wall.w,wall.h);ctx.fillStyle=mine.wall;ctx.strokeStyle=mine.wallEdge;ctx.lineWidth=2;
      for(let x=12;x<wall.w;x+=48)for(let y=12;y<wall.h;y+=44){const jitter=((x+y)*.13)%7;ctx.beginPath();ctx.moveTo(x-10,y+12);ctx.lineTo(x+jitter,y-8);ctx.lineTo(x+25,y-3);ctx.lineTo(x+32,y+17);ctx.lineTo(x+8,y+24);ctx.closePath();ctx.fill();ctx.stroke();if(mine.style==='ember'){ctx.fillStyle='#d86635';ctx.beginPath();ctx.arc(x+8,y+7,2,0,Math.PI*2);ctx.fill();ctx.fillStyle=mine.wall}else if(mine.style==='moon'){ctx.strokeStyle='rgba(113,227,223,.45)';ctx.beginPath();ctx.moveTo(x+2,y+18);ctx.lineTo(x+18,y-2);ctx.stroke();ctx.strokeStyle=mine.wallEdge}else if(mine.style==='star'&&((x+y)%3<1)){ctx.fillStyle='#cdd2ff';ctx.fillRect(x+5,y+4,1.5,1.5);ctx.fillStyle=mine.wall}}
      ctx.restore();
    }
    for(const barrier of mine.barriers){
      if(mineBarrierCleared(barrier.id))continue;
      const p=worldToScreen(barrier.x,barrier.y),locked=state.pickaxeLevel<barrier.requiresPickaxe;
      ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(10,12,9,.68)';ctx.fillRect(0,0,barrier.w,barrier.h);
      ctx.strokeStyle=locked?'#98784a':mine.accent;ctx.globalAlpha=.55;ctx.lineWidth=3;ctx.setLineDash([9,7]);ctx.strokeRect(5,5,barrier.w-10,barrier.h-10);ctx.setLineDash([]);ctx.globalAlpha=1;
      ctx.fillStyle='rgba(7,9,7,.88)';ctx.fillRect(-34,-32,barrier.w+68,24);ctx.strokeStyle='#7e673b';ctx.lineWidth=1;ctx.strokeRect(-34,-32,barrier.w+68,24);
      ctx.fillStyle=locked?'#cfb985':'#f0d58d';ctx.textAlign='center';ctx.font='900 9px Georgia';ctx.fillText(locked?PICKAXES[barrier.requiresPickaxe].name.toUpperCase()+' REQUIRED':'BREAK: '+barrier.label.toUpperCase(),barrier.w*.5,-16);ctx.restore();
    }
  }

  function drawSurfaceMineEntrances(){for(const scene of MINE_SCENES){const mine=MINE_DEFINITIONS[scene];if(mine.unlock(state))drawMineEntrance(true,mine)}}

  function drawMineEntrance(surface,mine){
    const entrance=surface?mine.surfaceEntrance:mine.entrance,p=worldToScreen(entrance.x,entrance.y),selected=activeContext===(surface?'mineEntrance:'+mine.id:'mineExit');
    if(p.x<-100||p.y<-120||p.x>viewWidth+100||p.y>viewHeight+120)return;
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(0,42,66,20,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#34372d';ctx.strokeStyle='#80734f';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-58,39);ctx.lineTo(-49,-22);ctx.quadraticCurveTo(0,-86,49,-22);ctx.lineTo(58,39);ctx.closePath();ctx.fill();ctx.stroke();
    const darkness=ctx.createRadialGradient(0,6,5,0,6,48);darkness.addColorStop(0,'#030403');darkness.addColorStop(1,'#151711');ctx.fillStyle=darkness;ctx.beginPath();ctx.moveTo(-39,36);ctx.lineTo(-33,-15);ctx.quadraticCurveTo(0,-58,33,-15);ctx.lineTo(39,36);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#9c7136';ctx.lineWidth=5;for(const x of [-34,34]){ctx.beginPath();ctx.moveTo(x,35);ctx.lineTo(x,-14);ctx.stroke()}ctx.beginPath();ctx.arc(0,-9,34,Math.PI,Math.PI*2);ctx.stroke();
    ctx.fillStyle=mine.detail;ctx.textAlign='center';ctx.font='900 10px Georgia';ctx.fillText(surface?mine.name:'RETURN TO '+mine.surfaceName.replace('MOSSVEIN ','').replace('MOONGLASS ','').replace('EMBERDEEP ','').replace('STARFALL ',''),0,61);
    if(selected){ctx.strokeStyle='#f0d58d';ctx.globalAlpha=.75;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,4,72+Math.sin(time*4)*2,0,Math.PI*2);ctx.stroke()}
    ctx.restore();
  }

  function drawGround(){
    ctx.fillStyle='#273228';ctx.fillRect(0,0,viewWidth,viewHeight);
    const cavernStart=worldToScreen(WORLD.gateX,0).x,emberStart=worldToScreen(WORLD.emberGateX,0).x,starfallStart=worldToScreen(WORLD.starfallGateX,0).x;
    ctx.fillStyle='#14282b';ctx.fillRect(cavernStart,0,emberStart-cavernStart,viewHeight);
    ctx.fillStyle='#261817';ctx.fillRect(emberStart,0,starfallStart-emberStart,viewHeight);
    ctx.fillStyle='#17172a';ctx.fillRect(starfallStart,0,viewWidth-starfallStart,viewHeight);
    const cavernBlend=ctx.createLinearGradient(cavernStart-95,0,cavernStart+95,0);cavernBlend.addColorStop(0,'#273228');cavernBlend.addColorStop(1,'#14282b');ctx.fillStyle=cavernBlend;ctx.fillRect(cavernStart-95,0,190,viewHeight);
    const emberBlend=ctx.createLinearGradient(emberStart-110,0,emberStart+110,0);emberBlend.addColorStop(0,'#14282b');emberBlend.addColorStop(1,'#261817');ctx.fillStyle=emberBlend;ctx.fillRect(emberStart-110,0,220,viewHeight);
    const starfallBlend=ctx.createLinearGradient(starfallStart-120,0,starfallStart+120,0);starfallBlend.addColorStop(0,'#261817');starfallBlend.addColorStop(1,'#17172a');ctx.fillStyle=starfallBlend;ctx.fillRect(starfallStart-120,0,240,viewHeight);
    ctx.save();ctx.translate(-camera.x%80,-camera.y%80);ctx.strokeStyle='rgba(190,205,165,.045)';ctx.lineWidth=1;
    for(let x=-80;x<viewWidth+80;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,viewHeight+80);ctx.stroke()}
    for(let y=-80;y<viewHeight+80;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(viewWidth+80,y);ctx.stroke()}
    ctx.restore();
    ctx.fillStyle='rgba(75,174,177,.08)';ctx.fillRect(cavernStart,0,emberStart-cavernStart,viewHeight);
    ctx.fillStyle='rgba(222,76,35,.07)';ctx.fillRect(emberStart,0,starfallStart-emberStart,viewHeight);
    ctx.fillStyle='rgba(154,164,255,.075)';ctx.fillRect(starfallStart,0,viewWidth-starfallStart,viewHeight);
  }

  function drawBiomeStructure(){
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    const quarryPath=[[80,760],[360,705],[690,760],[1010,660]].map(point=>worldToScreen(point[0],point[1]));
    ctx.strokeStyle='rgba(125,103,64,.2)';ctx.lineWidth=94;ctx.beginPath();quarryPath.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.stroke();
    ctx.strokeStyle='rgba(204,183,123,.09)';ctx.lineWidth=3;ctx.setLineDash([15,20]);ctx.stroke();ctx.setLineDash([]);

    const moonCenter=worldToScreen(1650,670),moonGlow=ctx.createRadialGradient(moonCenter.x,moonCenter.y,20,moonCenter.x,moonCenter.y,360);
    moonGlow.addColorStop(0,'rgba(87,224,221,.12)');moonGlow.addColorStop(.58,'rgba(74,132,146,.055)');moonGlow.addColorStop(1,'rgba(44,82,90,0)');ctx.fillStyle=moonGlow;ctx.fillRect(moonCenter.x-370,moonCenter.y-370,740,740);
    ctx.strokeStyle='rgba(138,231,229,.15)';ctx.lineWidth=3;for(const radius of [190,285]){ctx.beginPath();ctx.arc(moonCenter.x,moonCenter.y,radius,Math.PI*.1,Math.PI*.9);ctx.stroke()}

    const emberVents=[[2450,220],[2850,610],[3190,1060]];
    for(let index=0;index<emberVents.length;index++){
      const vent=worldToScreen(emberVents[index][0],emberVents[index][1]),pulse=.5+.5*Math.sin(time*2.3+index);
      const heat=ctx.createRadialGradient(vent.x,vent.y,3,vent.x,vent.y,74+pulse*16);heat.addColorStop(0,'rgba(255,187,90,.18)');heat.addColorStop(.35,'rgba(255,92,43,.08)');heat.addColorStop(1,'rgba(255,66,28,0)');ctx.fillStyle=heat;ctx.fillRect(vent.x-95,vent.y-95,190,190);
      ctx.strokeStyle='rgba(255,121,65,'+(.16+pulse*.08)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(vent.x,vent.y,24+pulse*5,0,Math.PI*2);ctx.stroke();
    }

    const starCenter=worldToScreen(3900,650);ctx.strokeStyle='rgba(202,208,255,.13)';ctx.lineWidth=2;
    for(const radius of [175,315]){ctx.beginPath();ctx.arc(starCenter.x,starCenter.y,radius,0,Math.PI*2);ctx.stroke()}
    for(let index=0;index<14;index++){
      const wx=3420+(index*193)%940,wy=105+(index*271)%1040,p=worldToScreen(wx,wy),twinkle=.28+.22*Math.sin(time*1.8+index);
      ctx.fillStyle='rgba(237,232,255,'+twinkle+')';ctx.beginPath();ctx.arc(p.x,p.y,index%5===0?2.4:1.35,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawDecorations(){
    ctx.save();
    const veins=[[1080,140,1100,450],[1220,110,1340,280],[1880,80,2010,300],[1500,980,1670,1210]];
    ctx.lineWidth=5;ctx.strokeStyle='rgba(105,226,220,.22)';ctx.shadowBlur=12;ctx.shadowColor='#4bd9dd';
    for(const vein of veins){const a=worldToScreen(vein[0],vein[1]),b=worldToScreen(vein[2],vein[3]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo((a.x+b.x)*.5+20,(a.y+b.y)*.5-15);ctx.lineTo(b.x,b.y);ctx.stroke()}
    ctx.restore();
    ctx.save();ctx.lineWidth=4;ctx.strokeStyle='rgba(255,94,47,.28)';ctx.shadowBlur=9;ctx.shadowColor='#ff5f2f';
    const emberCracks=[[2260,120,2420,350],[2500,60,2700,250],[2800,980,3100,1190],[3060,130,3290,410],[2350,1120,2590,940]];
    for(const crack of emberCracks){const a=worldToScreen(crack[0],crack[1]),b=worldToScreen(crack[2],crack[3]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo((a.x+b.x)*.5-18,(a.y+b.y)*.5+12);ctx.lineTo(b.x,b.y);ctx.stroke()}
    ctx.restore();
    ctx.save();ctx.lineWidth=3;ctx.strokeStyle='rgba(191,199,255,.24)';ctx.shadowBlur=8;ctx.shadowColor='#a9b3ff';
    const starfallLines=[[3390,160,3590,360],[3660,80,3860,280],[3940,1060,4210,890],[4220,120,4430,360],[3480,1110,3740,930]];
    for(const line of starfallLines){const a=worldToScreen(line[0],line[1]),b=worldToScreen(line[2],line[3]),mx=(a.x+b.x)*.5,my=(a.y+b.y)*.5;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(mx+12,my-18);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.fillStyle='rgba(238,232,255,.48)';ctx.beginPath();ctx.arc(mx+12,my-18,2.5,0,Math.PI*2);ctx.fill()}
    ctx.restore();
    for(let i=0;i<30;i++){
      const wx=80+(i*227)%2100,wy=90+(i*163)%1090,p=worldToScreen(wx,wy);
      if(p.x<-30||p.y<-30||p.x>viewWidth+30||p.y>viewHeight+30)continue;
      ctx.fillStyle=i%3?'rgba(18,24,18,.48)':'rgba(111,127,92,.17)';ctx.beginPath();ctx.ellipse(p.x,p.y,18+(i%4)*6,7+(i%3)*3,(i*.7)%3,0,Math.PI*2);ctx.fill();
    }
    drawBiomeDetails();
  }

  function drawBiomeDetails(){
    ctx.save();
    for(let i=0;i<18;i++){
      const wx=95+(i*181)%900,wy=150+(i*239)%990,p=worldToScreen(wx,wy);
      if(p.x<-35||p.y<-35||p.x>viewWidth+35||p.y>viewHeight+35)continue;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate((i%7)*.31);ctx.strokeStyle='rgba(116,158,91,.34)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(0,8);ctx.quadraticCurveTo(-3,-2,0,-13);ctx.moveTo(0,-4);ctx.lineTo(-8,-10);ctx.moveTo(0,0);ctx.lineTo(9,-7);ctx.stroke();ctx.restore();
    }
    for(let i=0;i<15;i++){
      const wx=1190+(i*173)%940,wy=110+(i*211)%1050,p=worldToScreen(wx,wy);
      if(p.x<-35||p.y<-35||p.x>viewWidth+35||p.y>viewHeight+35)continue;
      ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle=i%3?'rgba(91,210,211,.18)':'rgba(188,150,255,.17)';ctx.strokeStyle='rgba(153,239,235,.36)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,-10-(i%3)*3);ctx.lineTo(5,4);ctx.lineTo(0,9);ctx.lineTo(-5,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    }
    for(let i=0;i<18;i++){
      const wx=2290+(i*197)%980,wy=95+(i*233)%1090,p=worldToScreen(wx,wy);
      if(p.x<-35||p.y<-35||p.x>viewWidth+35||p.y>viewHeight+35)continue;
      ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle=i%3?'rgba(72,34,27,.7)':'rgba(255,92,40,.12)';ctx.strokeStyle='rgba(255,126,67,.28)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(-14,8);ctx.lineTo(-8,-9);ctx.lineTo(2,-14);ctx.lineTo(15,-3);ctx.lineTo(11,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    }
    for(let i=0;i<18;i++){
      const wx=3410+(i*193)%960,wy=100+(i*227)%1080,p=worldToScreen(wx,wy);
      if(p.x<-35||p.y<-35||p.x>viewWidth+35||p.y>viewHeight+35)continue;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate((i%9)*.23);ctx.fillStyle=i%4?'rgba(102,108,170,.22)':'rgba(229,218,255,.24)';ctx.strokeStyle='rgba(196,204,255,.38)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,-8-(i%3)*2);ctx.lineTo(4,0);ctx.lineTo(0,8);ctx.lineTo(-4,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    }
    ctx.restore();
  }

  function drawStations(){
    drawSellStation();drawForge();if(state.fourthUnlocked)drawStarforge();
  }

  function drawSellStation(){
    const p=worldToScreen(STATIONS.sell.x,STATIONS.sell.y);if(p.x<-100||p.y<-100||p.x>viewWidth+100||p.y>viewHeight+100)return;
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,32,70,22,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#52341f';ctx.fillRect(-45,-15,88,44);ctx.fillStyle='#9f6d35';ctx.fillRect(-52,-22,102,12);ctx.fillStyle='#c7a35d';ctx.fillRect(-33,-7,64,7);
    ctx.fillStyle='#d7c4a0';ctx.beginPath();ctx.arc(-23,-31,13,0,Math.PI*2);ctx.arc(1,-34,16,0,Math.PI*2);ctx.arc(27,-29,11,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#161d17';ctx.font='900 9px Georgia';ctx.textAlign='center';ctx.fillText('ASSAY',0,15);ctx.restore();
  }

  function drawForge(){
    const p=worldToScreen(STATIONS.forge.x,STATIONS.forge.y);if(p.x<-100||p.y<-100||p.x>viewWidth+100||p.y>viewHeight+100)return;
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,37,65,20,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#3a3f39';ctx.fillRect(-43,-20,86,53);ctx.fillStyle='#222a24';ctx.fillRect(-30,-9,60,30);
    const glow=ctx.createRadialGradient(0,5,2,0,5,35);glow.addColorStop(0,'#fff09b');glow.addColorStop(.35,'#ef7c2f');glow.addColorStop(1,'rgba(190,55,15,0)');ctx.fillStyle=glow;ctx.fillRect(-38,-33,76,76);
    ctx.fillStyle='#f18b35';ctx.beginPath();ctx.moveTo(-20,19);ctx.lineTo(0,-18);ctx.lineTo(22,19);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#d2bb82';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(32,-25);ctx.lineTo(51,22);ctx.stroke();ctx.restore();
  }

  function drawStarforge(){
    const p=worldToScreen(STATIONS.starforge.x,STATIONS.starforge.y);if(p.x<-100||p.y<-100||p.x>viewWidth+100||p.y>viewHeight+100)return;
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(0,34,68,20,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#282943';ctx.strokeStyle='#abb5ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-45,23);ctx.lineTo(-35,-18);ctx.lineTo(0,-34);ctx.lineTo(35,-18);ctx.lineTo(45,23);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.save();ctx.rotate(time*.28);ctx.strokeStyle='#d8dcff';ctx.globalAlpha=.72;for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(0,-29);ctx.stroke()}ctx.restore();
    const variant=currentStarforge();ctx.fillStyle=variant?variant.color:'#f0d9ff';ctx.shadowBlur=12;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(10,0);ctx.lineTo(0,20);ctx.lineTo(-10,0);ctx.closePath();ctx.fill();ctx.restore();
  }

  function drawGroundDrops(){
    for(const drop of groundDrops){
      if(drop.scene!==currentScene)continue;
      const p=worldToScreen(drop.x,drop.y),data=ROCK_TYPES[drop.type];if(p.x<-40||p.y<-55||p.x>viewWidth+40||p.y>viewHeight+40)continue;
      const fade=drop.age>GROUND_DROP_LIFETIME-8?(GROUND_DROP_LIFETIME-drop.age)/8:1,bob=drop.settled?Math.sin(time*3.2+drop.id)*2:0,size=data.rare?9:7;
      ctx.save();ctx.globalAlpha=fade;ctx.translate(p.x,p.y-drop.z+bob);ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(0,drop.z-bob+7,size+5,4,0,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=data.rare?11:5;ctx.shadowColor=data.edge;ctx.fillStyle=data.color;ctx.strokeStyle=data.edge;ctx.lineWidth=1.5;ctx.rotate(time*(data.rare?.55:.3)+drop.id);
      ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.78,-size*.15);ctx.lineTo(size*.52,size);ctx.lineTo(-size*.62,size*.72);ctx.lineTo(-size,-size*.2);ctx.closePath();ctx.fill();ctx.stroke();ctx.rotate(-(time*(data.rare?.55:.3)+drop.id));ctx.shadowBlur=0;
      if(drop.amount>1){ctx.fillStyle='#fff2c8';ctx.strokeStyle='rgba(0,0,0,.8)';ctx.lineWidth=3;ctx.textAlign='center';ctx.font='900 9px Georgia';ctx.strokeText('x'+drop.amount,0,-size-6);ctx.fillText('x'+drop.amount,0,-size-6)}ctx.restore();
    }
  }

  function drawGate(){
    drawGateAt(WORLD.gateX,state.areaUnlocked,'#68e8e5','#202720','#576358');
    drawGateAt(WORLD.emberGateX,state.emberdeepUnlocked,'#ff7747','#2b1b18','#75412c');
    drawGateAt(WORLD.starfallGateX,state.fourthUnlocked,'#c7caff','#1d1e31','#5e6081');
  }

  function drawGateAt(x,open,glowColor,stoneColor,braceColor){
    const p=worldToScreen(x,WORLD.gateY);if(p.x<-130||p.x>viewWidth+130)return;
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle=stoneColor;ctx.fillRect(-28,-190,56,145);ctx.fillRect(-28,45,56,145);
    ctx.fillStyle=braceColor;for(const y of [-170,-115,-60,60,115,170])ctx.fillRect(-34,y-13,68,25);
    ctx.strokeStyle=open?glowColor+'44':glowColor;ctx.lineWidth=open?2:7;ctx.shadowBlur=open?4:15;ctx.shadowColor=glowColor;
    ctx.beginPath();ctx.moveTo(0,-43);ctx.lineTo(0,43);ctx.stroke();
    if(!open){ctx.lineWidth=3;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(-24+i*5,-44);ctx.lineTo(22-i*4,44);ctx.stroke()}}
    ctx.restore();
  }

  function drawVeins(){
    for(const vein of veins){
      const center=veinCenter(vein),screenCenter=worldToScreen(center.x,center.y);
      if(screenCenter.x<-180||screenCenter.y<-180||screenCenter.x>viewWidth+180||screenCenter.y>viewHeight+180)continue;
      const active=vein.status==='active',pulse=.5+.5*Math.sin(time*5);
      ctx.save();ctx.strokeStyle=vein.color;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=active?5:3;ctx.globalAlpha=active?.46+.18*pulse:.2;
      ctx.shadowBlur=active?12:5;ctx.shadowColor=vein.color;ctx.setLineDash(active?[]:[7,8]);
      ctx.beginPath();
      vein.positions.forEach((position,index)=>{const p=worldToScreen(position[0],position[1]);if(index===0)ctx.moveTo(p.x,p.y+9);else ctx.lineTo(p.x,p.y+9)});
      ctx.stroke();ctx.setLineDash([]);ctx.shadowBlur=0;
      for(const position of vein.positions){const p=worldToScreen(position[0],position[1]);ctx.beginPath();ctx.arc(p.x,p.y+8,active?50+pulse*3:47,0,Math.PI*2);ctx.stroke()}
      const topY=Math.min(...vein.positions.map(position=>position[1]))-112,labelPoint=worldToScreen(center.x,topY);
      const status=active?Math.ceil(vein.timer)+'s  '+vein.brokenRockIds.size+'/'+vein.positions.length:vein.status==='completed'?'CLEARED':vein.status==='failed'?'COOLED':'BONUS VEIN';
      ctx.globalAlpha=active?1:.78;ctx.fillStyle='rgba(6,9,7,.84)';ctx.fillRect(labelPoint.x-69,labelPoint.y-17,138,31);
      ctx.strokeStyle=vein.color;ctx.lineWidth=1;ctx.strokeRect(labelPoint.x-69,labelPoint.y-17,138,31);
      ctx.textAlign='center';ctx.fillStyle=vein.color;ctx.font='900 9px Georgia';ctx.fillText(vein.label,labelPoint.x,labelPoint.y-4);
      ctx.fillStyle='#eee4bd';ctx.font='800 7px Arial';ctx.fillText(status,labelPoint.x,labelPoint.y+8);ctx.restore();
    }
  }

  function drawRockBody(rock,data){
    if(rock.type==='emberstone'||rock.type==='sunslag'){
      ctx.fillStyle=data.color;ctx.strokeStyle=data.edge;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-37,19);ctx.lineTo(-40,-7);ctx.lineTo(-23,-31);ctx.lineTo(5,-38);ctx.lineTo(33,-23);ctx.lineTo(41,4);ctx.lineTo(26,27);ctx.lineTo(-13,29);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=data.accent;ctx.beginPath();ctx.moveTo(-23,-29);ctx.lineTo(3,-37);ctx.lineTo(-2,-3);ctx.lineTo(-33,6);ctx.closePath();ctx.fill();
      ctx.strokeStyle=rock.type==='sunslag'?'#ffe197':'#ff6c3c';ctx.lineWidth=3;ctx.shadowBlur=8;ctx.shadowColor=ctx.strokeStyle;
      ctx.beginPath();ctx.moveTo(-17,-15);ctx.lineTo(-3,-3);ctx.lineTo(9,-22);ctx.moveTo(-3,-3);ctx.lineTo(17,15);ctx.lineTo(29,5);ctx.moveTo(-3,-3);ctx.lineTo(-20,15);ctx.stroke();ctx.shadowBlur=0;
      return;
    }
    if(rock.type==='moonglass'||rock.type==='starshard'||rock.type==='astralite'||rock.type==='crownstone'){
      const side=rock.type==='starshard'?-1:1;
      ctx.fillStyle=data.accent;ctx.strokeStyle=data.edge;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-34,23);ctx.lineTo(-27,-11);ctx.lineTo(-12,-28);ctx.lineTo(-4,21);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=data.color;ctx.beginPath();ctx.moveTo(-11,23);ctx.lineTo(-5,-37);ctx.lineTo(12,-23);ctx.lineTo(18,23);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=data.accent;ctx.beginPath();ctx.moveTo(13,23);ctx.lineTo(18,-18);ctx.lineTo(34,-5);ctx.lineTo(30,24);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.globalAlpha=.42;ctx.fillStyle=data.edge;ctx.beginPath();ctx.moveTo(-3,-32);ctx.lineTo(4,-25);ctx.lineTo(8,12);ctx.lineTo(1,5);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
      if(side<0){ctx.strokeStyle='#fff3ff';ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(-26,-8);ctx.lineTo(-17,8);ctx.stroke();ctx.globalAlpha=1}
      if(rock.type==='crownstone'){
        ctx.strokeStyle='#fff2ff';ctx.lineWidth=2;ctx.globalAlpha=.72;ctx.beginPath();ctx.moveTo(-20,-5);ctx.lineTo(-7,-22);ctx.lineTo(1,-8);ctx.lineTo(12,-25);ctx.lineTo(23,-5);ctx.stroke();ctx.globalAlpha=1;
      }
      return;
    }
    ctx.beginPath();ctx.moveTo(-33,22);ctx.lineTo(-39,-1);ctx.lineTo(-21,-29);ctx.lineTo(3,-39);ctx.lineTo(29,-27);ctx.lineTo(40,-2);ctx.lineTo(29,25);ctx.closePath();ctx.fillStyle=data.color;ctx.fill();ctx.strokeStyle=data.edge;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=data.accent;ctx.beginPath();ctx.moveTo(-21,-27);ctx.lineTo(2,-37);ctx.lineTo(-1,-5);ctx.lineTo(-32,5);ctx.closePath();ctx.fill();
  }

  function drawChests(){
    for(const chest of chests){
      const p=worldToScreen(chest.x,chest.y);if(p.x<-75||p.y<-80||p.x>viewWidth+75||p.y>viewHeight+80)continue;
      const biome=BIOMES.find(item=>item.id===chest.biome),opened=!!state.openedChests[chest.id],ready=chestRequirementMet(chest);
      const selected=activeContext==='chest:'+chest.id,pulse=1+Math.sin(time*2.4+chest.tier)*.018;
      ctx.save();ctx.translate(p.x,p.y);ctx.scale(pulse,pulse);
      ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(0,25,35,12,0,0,Math.PI*2);ctx.fill();
      if(selected&&!opened){ctx.strokeStyle=ready?'#ffe19a':'#8d8570';ctx.globalAlpha=.72;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,3,43,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
      ctx.fillStyle=opened?'#241f19':'#3b2a1b';ctx.strokeStyle=opened?'#786d59':'#c69545';ctx.lineWidth=3;
      ctx.beginPath();ctx.roundRect(-31,-4,62,33,4);ctx.fill();ctx.stroke();
      ctx.fillStyle=opened?'#17130f':'#5b3a22';ctx.strokeStyle=opened?'#716655':'#d3a553';ctx.beginPath();
      if(opened){ctx.moveTo(-30,-5);ctx.lineTo(-24,-34);ctx.lineTo(25,-34);ctx.lineTo(31,-5);ctx.closePath()}
      else ctx.roundRect(-31,-25,62,25,[7,7,2,2]);
      ctx.fill();ctx.stroke();
      ctx.fillStyle=biome.accent;ctx.globalAlpha=opened?.22:ready?.9:.34;ctx.fillRect(-25,5,50,4);ctx.globalAlpha=1;
      ctx.fillStyle='#d7ad58';ctx.fillRect(-4,-7,8,18);ctx.strokeStyle='#4b351a';ctx.lineWidth=1;ctx.strokeRect(-4,-7,8,18);
      ctx.fillStyle=ready||opened?biome.detail:'#675f51';ctx.shadowBlur=ready&&!opened?8:0;ctx.shadowColor=biome.accent;ctx.beginPath();ctx.arc(0,1,3.4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      for(const side of [-1,1]){ctx.fillStyle='#a97c36';ctx.fillRect(side*22-2,-20,4,44)}
      if(!opened&&!ready){
        ctx.fillStyle='rgba(8,9,8,.82)';ctx.strokeStyle='#8d846e';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-36,11,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.fillStyle='#bdb49c';ctx.font='900 10px Georgia';ctx.textAlign='center';ctx.fillText(String(chest.requires.pickaxeLevel||'S'),0,-32);
      }
      if(!opened&&ready){
        const sparkle=.45+.35*Math.sin(time*3.1+chest.tier);ctx.strokeStyle='#fff0b1';ctx.globalAlpha=sparkle;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(34,-25);ctx.lineTo(34,-11);ctx.moveTo(27,-18);ctx.lineTo(41,-18);ctx.stroke();ctx.globalAlpha=1;
      }
      ctx.restore();
    }
  }

  function drawRocks(){
    const target=nearestRock(MINING_RANGE);
    for(const rock of currentRocks()){
      if(rock.broken||!rockIsExposed(rock))continue;
      const p=worldToScreen(rock.x,rock.y);if(p.x<-70||p.y<-70||p.x>viewWidth+70||p.y>viewHeight+70)continue;
      const data=ROCK_TYPES[rock.type],pulse=target&&target.id===rock.id?1+Math.sin(time*6)*.025:1;
      ctx.save();ctx.translate(p.x,p.y);ctx.scale(pulse,pulse);
      if(target&&target.id===rock.id){ctx.strokeStyle=data.edge;ctx.globalAlpha=.55;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,5,42,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
      if(rock.veinId){const vein=veinById(rock.veinId);ctx.strokeStyle=vein.color;ctx.globalAlpha=vein.status==='active'?.72:.34;ctx.lineWidth=2;ctx.beginPath();for(let point=0;point<6;point++){const angle=-Math.PI/2+point*Math.PI/3,x=Math.cos(angle)*46,y=5+Math.sin(angle)*40;if(point===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.closePath();ctx.stroke();ctx.globalAlpha=1}
      if(data.rare){ctx.strokeStyle=data.edge;ctx.globalAlpha=.22+.12*Math.sin(time*2.8+rock.seed);ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,4,46,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
      ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(0,24,37,13,0,0,Math.PI*2);ctx.fill();
      const hitScale=rock.hit>0?1+rock.hit*.22:1;ctx.scale(hitScale,1/hitScale);
      drawRockBody(rock,data);
      const damageStage=Math.min(3,Math.ceil((rock.shell>0?1-rock.shell/rock.maxShell:1-rock.hp/rock.maxHp)*3));
      ctx.strokeStyle=damageStage>=2?'rgba(25,18,14,.88)':data.edge;ctx.lineWidth=damageStage>=3?4:3;ctx.globalAlpha=damageStage?1:.38;
      ctx.beginPath();ctx.moveTo(-9,-27);ctx.lineTo(4,-7);ctx.lineTo(22,-19);
      if(damageStage>=1){ctx.moveTo(4,-7);ctx.lineTo(13,18)}
      if(damageStage>=2){ctx.moveTo(4,-7);ctx.lineTo(-17,8);ctx.lineTo(-26,21);ctx.moveTo(13,18);ctx.lineTo(27,11)}
      if(damageStage>=3){ctx.moveTo(-17,8);ctx.lineTo(-29,-4);ctx.moveTo(13,18);ctx.lineTo(5,29);ctx.moveTo(22,-19);ctx.lineTo(31,-8)}
      ctx.stroke();ctx.globalAlpha=1;
      if(rock.shell>0){
        ctx.strokeStyle=data.edge;ctx.globalAlpha=.5;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-2,39,Math.PI*.08,Math.PI*.92);ctx.stroke();ctx.globalAlpha=1;
      }
      if(rock.type==='copper'||rock.type==='gold'){
        ctx.fillStyle=data.edge;ctx.shadowBlur=rock.type==='gold'?9:4;ctx.shadowColor=data.edge;
        for(let i=0;i<(rock.type==='gold'?5:3);i++){const ox=-20+i*10,oy=-3+(i%2)*14;ctx.beginPath();ctx.arc(ox,oy,rock.type==='gold'?4.2:3.2,0,Math.PI*2);ctx.fill()}
        ctx.shadowBlur=0;
      }else if(rock.type==='moonglass'||rock.type==='starshard'||rock.type==='astralite'||rock.type==='crownstone'){
        ctx.strokeStyle=data.edge;ctx.lineWidth=2;ctx.globalAlpha=.58;ctx.beginPath();ctx.moveTo(-5,-34);ctx.lineTo(2,14);ctx.moveTo(19,-15);ctx.lineTo(24,16);ctx.stroke();ctx.globalAlpha=1;
      }
      if(rock.shell>0){ctx.fillStyle='rgba(0,0,0,.62)';ctx.fillRect(-31,-55,62,6);ctx.fillStyle=data.edge;ctx.fillRect(-31,-55,62*(rock.shell/rock.maxShell),6)}
      else if(rock.hp<rock.maxHp){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(-30,-52,60,5);ctx.fillStyle=data.edge;ctx.fillRect(-30,-52,60*(rock.hp/rock.maxHp),5)}
      if(rock.glintActive>0){
        const flash=rock.glintActive/.72,ox=-11+(rock.seed%21),oy=-19+(rock.seed%13);
        ctx.save();ctx.translate(ox,oy);ctx.rotate(time*4);ctx.globalAlpha=.5+.5*Math.sin(flash*Math.PI);ctx.strokeStyle='#fff7c8';ctx.lineWidth=2;ctx.shadowBlur=8;ctx.shadowColor=data.edge;
        ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(9,0);ctx.moveTo(0,-9);ctx.lineTo(0,9);ctx.stroke();ctx.restore();
      }
      ctx.restore();
    }
  }

  function drawPlayer(){
    const p=worldToScreen(player.x,player.y),moving=Math.abs(updateInputVector().x)+Math.abs(updateInputVector().y)>.02,bob=moving?Math.sin(player.walk)*2:Math.sin(time*2.4)*1.2;
    ctx.save();ctx.translate(p.x,p.y+bob);ctx.scale(player.facing,1);
    ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(0,25,34,12,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#30352f';ctx.lineWidth=11;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-11,8);ctx.lineTo(-14,25);ctx.moveTo(11,8);ctx.lineTo(14,25);ctx.stroke();
    ctx.strokeStyle='#b06d34';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(-14,23);ctx.lineTo(-24,27);ctx.moveTo(14,23);ctx.lineTo(24,27);ctx.stroke();
    ctx.fillStyle='#3f7051';ctx.beginPath();ctx.moveTo(-24,-23);ctx.quadraticCurveTo(0,-39,24,-23);ctx.lineTo(19,9);ctx.quadraticCurveTo(0,19,-19,9);ctx.closePath();ctx.fill();ctx.strokeStyle='#d4aa55';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#d7a274';ctx.beginPath();ctx.arc(0,-37,17,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4b2e20';ctx.beginPath();ctx.arc(-1,-32,15,.05,Math.PI-.05);ctx.quadraticCurveTo(0,-10,14,-32);ctx.fill();
    ctx.fillStyle='#1d251e';ctx.beginPath();ctx.arc(0,-48,19,Math.PI,Math.PI*2);ctx.lineTo(25,-45);ctx.lineTo(-22,-45);ctx.closePath();ctx.fill();ctx.strokeStyle='#d3a44b';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#f5d7a1';ctx.beginPath();ctx.arc(7,-38,2.2,0,Math.PI*2);ctx.fill();
    drawPlayerPickaxe();ctx.restore();
  }

  function drawPlayerPickaxe(){
    let angle=-.25;
    if(player.swing){const t=player.swing.elapsed/player.swing.duration;angle=-1.45+easeInOut(Math.min(1,t*1.35))*2.25}
    const styles=[null,{handle:'#8b562c',head:'#b8c0ba',accent:'#7e8982'},{handle:'#754728',head:'#e2e8e5',accent:'#8fa8a1'},{handle:'#594628',head:'#d5b057',accent:'#76d29b'},{handle:'#315968',head:'#a9f3ee',accent:'#5fe6df'},{handle:'#542c22',head:'#ffc06d',accent:'#ff6638'}],starStyles={crusher:{handle:'#292b48',head:'#c8ceff',accent:'#858cff'},swift:{handle:'#214a54',head:'#e5ffff',accent:'#71f1ff'},prospector:{handle:'#5d4528',head:'#fff0b5',accent:'#e9b852'}},style=currentStarforge()?starStyles[state.starforgeVariant]:styles[state.pickaxeLevel];
    ctx.save();ctx.translate(7,-6);ctx.rotate(angle);ctx.strokeStyle=style.handle;ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-24,0);ctx.lineTo(38,0);ctx.stroke();ctx.strokeStyle=style.head;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(28,-17);ctx.quadraticCurveTo(45,-4,38,14);ctx.stroke();ctx.fillStyle='#c98a57';ctx.beginPath();ctx.arc(-5,0,7,0,Math.PI*2);ctx.fill();
    if(state.pickaxeLevel>=3){ctx.strokeStyle=style.accent;ctx.lineWidth=2;ctx.shadowBlur=state.pickaxeLevel>=4?7:3;ctx.shadowColor=style.accent;ctx.beginPath();ctx.moveTo(13,-1);ctx.lineTo(20,-1);ctx.moveTo(17,-5);ctx.lineTo(17,3);ctx.stroke()}
    if(state.emberMastery){
      ctx.strokeStyle=state.emberMastery===5?'#fff0a5':'#ff8a42';ctx.lineWidth=1.5;ctx.shadowBlur=3+state.emberMastery;ctx.shadowColor=ctx.strokeStyle;
      for(let notch=0;notch<state.emberMastery;notch++){const x=-17+notch*8;ctx.beginPath();ctx.moveTo(x,-4);ctx.lineTo(x+3,3);ctx.stroke()}
      ctx.globalAlpha=.45+.25*Math.sin(time*4);ctx.beginPath();ctx.arc(35,-1,5+state.emberMastery*.45,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
    }
    if(state.starforgeVariant){
      ctx.strokeStyle=style.accent;ctx.fillStyle=style.accent;ctx.shadowBlur=9;ctx.shadowColor=style.accent;ctx.globalAlpha=.75+.2*Math.sin(time*5);
      if(state.starforgeVariant==='crusher'){
        ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(30,-22);ctx.lineTo(45,-11);ctx.lineTo(43,17);ctx.stroke();ctx.strokeRect(28,-17,14,31);
      }else if(state.starforgeVariant==='swift'){
        ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(24,-20);ctx.lineTo(47,-4);ctx.lineTo(29,19);ctx.moveTo(37,-13);ctx.lineTo(42,10);ctx.stroke();
      }else{
        ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(31,-18);ctx.lineTo(45,-4);ctx.lineTo(37,0);ctx.lineTo(46,13);ctx.stroke();ctx.beginPath();ctx.arc(35,0,7,0,Math.PI*2);ctx.stroke();
      }
      ctx.globalAlpha=1;ctx.shadowBlur=0;
    }
    ctx.restore();
  }

  function drawEffects(front){
    if(!front){
      for(const ring of rings){const p=worldToScreen(ring.x,ring.y),t=ring.age/ring.life;ctx.save();ctx.globalAlpha=1-t;ctx.strokeStyle=ring.color;ctx.lineWidth=3*(1-t)+1;ctx.beginPath();ctx.arc(p.x,p.y,ring.radius+t*55,0,Math.PI*2);ctx.stroke();ctx.restore()}
      return;
    }
    for(const particle of particles){
      const p=worldToScreen(particle.x,particle.y),t=particle.age/particle.life;ctx.save();ctx.globalAlpha=1-t;ctx.fillStyle=particle.color;ctx.strokeStyle=particle.color;ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(particle.vy,particle.vx));
      if(particle.shape==='shard'){ctx.beginPath();ctx.moveTo(particle.size*1.7,0);ctx.lineTo(-particle.size*.55,-particle.size*.5);ctx.lineTo(-particle.size*.2,particle.size*.62);ctx.closePath();ctx.fill()}
      else if(particle.shape==='spark'){ctx.shadowBlur=4;ctx.shadowColor=particle.color;ctx.fillRect(-particle.size*.35,-particle.size*.25,particle.size*2.1,particle.size*.5)}
      else if(particle.shape==='ember'){ctx.shadowBlur=6;ctx.shadowColor=particle.color;ctx.beginPath();ctx.arc(0,0,particle.size*.55,0,Math.PI*2);ctx.fill()}
      else if(particle.shape==='star'){ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-particle.size,0);ctx.lineTo(particle.size,0);ctx.moveTo(0,-particle.size);ctx.lineTo(0,particle.size);ctx.stroke()}
      else ctx.fillRect(-particle.size*.5,-particle.size*.5,particle.size*1.7,particle.size);
      ctx.restore();
    }
    for(const mote of saleMotes){
      if(mote.age<0)continue;const t=easeInOut(mote.age/mote.life),wx=mote.sx+(mote.tx-mote.sx)*t,wy=mote.sy+(mote.ty-mote.sy)*t-Math.sin(t*Math.PI)*32,p=worldToScreen(wx,wy);
      ctx.save();ctx.globalAlpha=Math.sin(Math.min(1,t)*Math.PI)*.75+.2;ctx.fillStyle=mote.color;ctx.shadowBlur=7;ctx.shadowColor=mote.color;ctx.beginPath();ctx.arc(p.x,p.y,mote.size,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    for(const floater of floaters){const p=worldToScreen(floater.x,floater.y),t=floater.age/floater.life;ctx.save();ctx.globalAlpha=Math.min(1,(1-t)*2.4);ctx.fillStyle=floater.color;ctx.strokeStyle='rgba(3,5,3,.8)';ctx.lineWidth=3;ctx.textAlign='center';ctx.font='900 '+floater.size+'px Georgia';ctx.strokeText(floater.text,p.x,p.y);ctx.fillText(floater.text,p.x,p.y);ctx.restore()}
  }

  function drawWorldLabels(){
    const mine=currentMine();
    const labels=mine?mine.labels.slice():[['ASSAY CART',STATIONS.sell.x,STATIONS.sell.y-75,'#e9cb82'],['FORGE',STATIONS.forge.x,STATIONS.forge.y-75,'#f2a35d']];
    if(mine){
      ctx.save();ctx.textAlign='center';ctx.font='900 10px Georgia';
      for(const label of labels){const p=worldToScreen(label[1],label[2]);if(p.x<0||p.x>viewWidth||p.y<0||p.y>viewHeight)continue;ctx.fillStyle='rgba(5,8,5,.72)';ctx.fillRect(p.x-58,p.y-11,116,20);ctx.fillStyle=label[3];ctx.fillText(label[0],p.x,p.y+3)}ctx.restore();return;
    }
    if(state.fourthUnlocked)labels.push(['STARFORGE',STATIONS.starforge.x,STATIONS.starforge.y-73,'#d9dcff']);
    if(!state.areaUnlocked)labels.push(['MOONGLASS GATE',WORLD.gateX-58,WORLD.gateY-215,'#9ce7e6']);
    if(state.areaUnlocked&&!state.emberdeepUnlocked)labels.push(['EMBERDEEP SEAL',WORLD.emberGateX-58,WORLD.gateY-215,'#ff9a68']);
    if(state.emberdeepUnlocked&&!state.fourthUnlocked)labels.push(['STARFALL MASTER SEAL',WORLD.starfallGateX-65,WORLD.gateY-215,'#d6d8ff']);
    ctx.save();ctx.textAlign='center';ctx.font='900 10px Georgia';
    for(const label of labels){const p=worldToScreen(label[1],label[2]);if(p.x<0||p.x>viewWidth||p.y<0||p.y>viewHeight)continue;ctx.fillStyle='rgba(5,8,5,.72)';ctx.fillRect(p.x-56,p.y-11,112,20);ctx.fillStyle=label[3];ctx.fillText(label[0],p.x,p.y+3)}ctx.restore();
  }

  function frame(timestamp){
    const raw=Math.min(.05,Math.max(0,(timestamp-lastFrame)/1000||0));lastFrame=timestamp;
    const frozen=Math.min(raw,miningFeedback.hitStop);miningFeedback.hitStop=Math.max(0,miningFeedback.hitStop-frozen);
    update((raw-frozen)*timeScale);draw();requestAnimationFrame(frame);
  }

  function setJoystickFromEvent(event){
    const rect=joystick.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,dx=event.clientX-cx,dy=event.clientY-cy,max=rect.width*.31,length=Math.hypot(dx,dy)||1,scale=Math.min(1,max/length),px=dx*scale,py=dy*scale;
    joystickKnob.style.transform='translate(calc(-50% + '+px+'px),calc(-50% + '+py+'px))';input.moveX=clamp(dx/max,-1,1);input.moveY=clamp(dy/max,-1,1);
  }
  function releaseJoystick(event){if(input.joystickPointer!==null&&event.pointerId!==undefined&&event.pointerId!==input.joystickPointer)return;input.joystickPointer=null;input.moveX=0;input.moveY=0;joystickKnob.style.transform='translate(-50%,-50%)'}

  joystick.addEventListener('pointerdown',event=>{
    event.preventDefault();unlockAudio();input.joystickPointer=event.pointerId;setJoystickFromEvent(event);
    try{joystick.setPointerCapture(event.pointerId)}catch(error){}
  });
  joystick.addEventListener('pointermove',event=>{if(event.pointerId===input.joystickPointer){event.preventDefault();setJoystickFromEvent(event)}});
  joystick.addEventListener('pointerup',releaseJoystick);joystick.addEventListener('pointercancel',releaseJoystick);joystick.addEventListener('lostpointercapture',releaseJoystick);

  mineButton.addEventListener('pointerdown',event=>{
    event.preventDefault();unlockAudio();input.minePointers.add(event.pointerId);input.mineHeld=true;mineButton.classList.add('active');startSwing(true);
    try{mineButton.setPointerCapture(event.pointerId)}catch(error){}
  });
  function releaseMine(event){input.minePointers.delete(event.pointerId);input.mineHeld=input.minePointers.size>0;if(!input.mineHeld)mineButton.classList.remove('active')}
  mineButton.addEventListener('pointerup',releaseMine);mineButton.addEventListener('pointercancel',releaseMine);mineButton.addEventListener('lostpointercapture',releaseMine);

  canvas.addEventListener('pointerdown',event=>{
    event.preventDefault();unlockAudio();const rect=canvas.getBoundingClientRect(),world=screenToWorld(event.clientX-rect.left,event.clientY-rect.top),rock=rocks.find(item=>!item.broken&&distance(item.x,item.y,world.x,world.y)<48);
    if(rock&&distance(player.x,player.y,rock.x,rock.y)<=MINING_RANGE){player.hitRockId=rock.id;startSwing(true)}
  });

  // Safari still exposes native zoom/callout gestures around mixed canvas and DOM controls.
  // Keep those gestures outside the game while preserving normal single-pointer controls.
  const preventGameGesture=event=>{if(game.contains(event.target))event.preventDefault()};
  document.addEventListener('gesturestart',preventGameGesture,{passive:false});
  document.addEventListener('gesturechange',preventGameGesture,{passive:false});
  document.addEventListener('gestureend',preventGameGesture,{passive:false});
  document.addEventListener('dblclick',preventGameGesture,{passive:false});
  document.addEventListener('contextmenu',preventGameGesture,{passive:false});
  document.addEventListener('touchmove',event=>{if(event.touches.length>1&&game.contains(event.target))event.preventDefault()},{passive:false});

  function releaseTouchControls(){
    input.minePointers.clear();input.mineHeld=false;mineButton.classList.remove('active');releaseJoystick({});
  }

  window.addEventListener('keydown',event=>{
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(event.code))event.preventDefault();
    unlockAudio();input.keys.add(event.code);
    if(event.code==='Space'){input.mineHeld=true;mineButton.classList.add('active');if(!event.repeat)startSwing(true)}
    if(event.code==='KeyE')performContext();
    if(event.code==='Escape'&&!menuShade.hidden)menuShade.hidden=true;
  });
  window.addEventListener('keyup',event=>{input.keys.delete(event.code);if(event.code==='Space'){input.mineHeld=false;mineButton.classList.remove('active')}});
  window.addEventListener('blur',()=>{input.keys.clear();releaseTouchControls()});
  window.addEventListener('pagehide',()=>{releaseTouchControls();saveState(true)});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseTouchControls();saveState(true)}});
  contextButton.addEventListener('click',performContext);
  starforgeChoices.addEventListener('click',event=>{const button=event.target.closest('[data-starforge]');if(button&&!button.disabled){unlockAudio();forgeStarVariant(button.dataset.starforge)}});
  menuButton.addEventListener('click',()=>{unlockAudio();menuShade.hidden=false;updateLedger()});resumeButton.addEventListener('click',()=>menuShade.hidden=true);
  resetButton.addEventListener('click',()=>{if(window.confirm('Reset all Deepforge prototype progress?'))resetProgress()});
  menuShade.addEventListener('pointerdown',event=>{if(event.target===menuShade)menuShade.hidden=true});
  window.addEventListener('resize',resize,{passive:true});

  window.__deepforgeTest={
    snapshot:()=>JSON.parse(JSON.stringify({
      build:BUILD,state,scene:currentScene,
      effectivePickaxe:{name:currentPickaxeName(),power:currentPower(),cooldown:currentCooldown(),shellPower:currentShellPower(),bonusYield:currentBonusYieldChance(),emberstoneHits:armoredHitsRequired('emberstone',currentPower(),currentShellPower()),sunslagHits:armoredHitsRequired('sunslag',currentPower(),currentShellPower()),astraliteHits:armoredHitsRequired('astralite',currentPower(),currentShellPower())},
      player:{x:player.x,y:player.y,aimX:player.aimX,aimY:player.aimY},camera:{x:camera.x,y:camera.y,viewWidth,viewHeight},biome:currentBiome().id,
      mine:currentMine()?{
        id:currentMine().id,name:currentMine().name,width:currentMine().width,height:currentMine().height,style:currentMine().style,solids:currentMine().solids,solidCount:currentMine().solids.length,barrierIds:currentMine().barriers.map(barrier=>barrier.id),labels:currentMine().labels.map(label=>label[0]),
        terrain:{tileSize:MINE_TILE_SIZE,chunkCells:MINE_CHUNK_CELLS,totalChunks:Math.ceil(currentTerrain().cols/MINE_CHUNK_CELLS)*Math.ceil(currentTerrain().rows/MINE_CHUNK_CELLS),activeChunks:currentTerrain().chunks.size,cellCount:currentTerrain().cols*currentTerrain().rows,solidCells:terrainSolidCellCount(currentTerrain()),dugCells:state.terrainDug[currentScene].length,target:nearestTerrainCell(MINING_RANGE)},
        discovery:{caverns:currentTerrain().caverns.map(cavern=>({id:cavern.id,name:cavern.name,x:cavern.x,y:cavern.y,rx:cavern.rx,ry:cavern.ry,cellCount:cavern.cells.length,boundaryIndex:[...cavern.boundary][0],discovered:cavernIsDiscovered(cavern.id),reward:{...cavern.reward,claimed:!!state.claimedPocketRewards[cavern.reward.id]}})),deposits:MINE_DISCOVERIES[currentScene].deposits.map(deposit=>({id:deposit.id,type:deposit.type,size:deposit.positions.length,rareFind:!!deposit.rareFind,cavernId:deposit.cavernId||null,pocketRewardId:deposit.pocketRewardId||null}))}
      }:null,
      focus:miningFocus,
      rocks:rocks.map(rock=>({id:rock.id,type:rock.type,x:rock.x,y:rock.y,scene:rock.scene,barrierId:rock.barrierId,requiredPickaxe:rock.requiredPickaxe,veinId:rock.veinId,depositId:rock.depositId,cavernId:rock.cavernId,rareFind:rock.rareFind,pocketRewardId:rock.pocketRewardId,hp:rock.hp,shell:rock.shell,broken:rock.broken,exposed:rockIsExposed(rock)})),
      veins:veins.map(vein=>({id:vein.id,status:vein.status,timer:vein.timer,broken:vein.brokenRockIds.size,total:vein.positions.length})),
      chests:chests.map(chest=>({id:chest.id,name:chest.name,x:chest.x,y:chest.y,ready:chestRequirementMet(chest),opened:!!state.openedChests[chest.id]})),
      groundDrops:groundDrops.map(drop=>({id:drop.id,type:drop.type,amount:drop.amount,x:drop.x,y:drop.y,z:drop.z,age:drop.age,settled:drop.settled,scene:drop.scene,sourceChest:drop.sourceChest,sourcePocket:drop.sourcePocket})),feedback:{floaters:floaters.map(item=>item.text),pickupCount:pickupBatch.count,particleCount:particles.length,shake:miningFeedback.shake,flash:miningFeedback.flash,hitStop:miningFeedback.hitStop,terrainHitIndex:miningFeedback.terrainHitIndex,lastDiscovery:miningFeedback.lastDiscovery,lastDepositBeat:miningFeedback.lastDepositBeat,lastPocketReward:miningFeedback.lastPocketReward},activeContext
    })),
    reset:resetProgress,
    setPosition:(x,y)=>{const world=currentWorld();player.x=clamp(Number(x),52,world.width-52);player.y=clamp(Number(y),70,world.height-58);updateCamera(true);uiDirty=true},
    setAim:(x,y)=>{const length=Math.hypot(Number(x)||0,Number(y)||0);if(length){player.aimX=Number(x)/length;player.aimY=Number(y)/length;player.facing=player.aimX<0?-1:1}},
    mineOnce:()=>{if(player.swingCooldown>0)update(player.swingCooldown+.001);if(startSwing(true)){update(currentCooldown());update(.021);return true}return false},
    step:seconds=>update(clamp(Number(seconds)||0,0,2)),
    setTimeScale:value=>{timeScale=clamp(Number(value)||1,.25,12)},
    restoreRocks:()=>{for(const rock of rocks){rock.broken=!!(rock.barrierId&&state.clearedMineBarriers[rock.barrierId]||rock.pocketRewardId&&state.claimedPocketRewards[rock.pocketRewardId]);rock.hp=rock.maxHp;rock.shell=rock.maxShell;rock.respawn=rock.broken?Infinity:0;rock.glintActive=0;rock.bonusYield=0}resetVeins();uiDirty=true},
    restoreTerrain:()=>{for(const scene of MINE_SCENES){state.terrainDug[scene]=[];for(const cavern of MINE_DISCOVERIES[scene].caverns){state.discoveredCaverns[cavern.id]=false;state.claimedPocketRewards[cavern.reward.id]=false;delete state.pendingPocketLoot[cavern.reward.id]}}for(const rock of mineRocks)if(rock.pocketRewardId){rock.broken=false;rock.respawn=0;rock.hp=rock.maxHp;rock.shell=rock.maxShell}rebuildMineTerrain();uiDirty=true},
    mineTerrainCell:index=>{hitTerrain(Number(index));return terrainTypeAt(currentTerrain(),Number(index)%currentTerrain().cols,Math.floor(Number(index)/currentTerrain().cols))},
    primePrecision:()=>{const rock=nearestRock(MINING_RANGE);if(rock){rock.glintActive=.72;return rock.id}return null},
    grantCargo:(type,amount)=>{if(Object.prototype.hasOwnProperty.call(state.cargo,type)){state.cargo[type]+=Math.max(0,Number(amount)||0);uiDirty=true}},
    grantMined:(type,amount)=>{if(Object.prototype.hasOwnProperty.call(state.mined,type)){state.mined[type]+=Math.max(0,Number(amount)||0);uiDirty=true}},
    breakVeinRock:(veinId,index)=>{const candidates=rocks.filter(rock=>rock.veinId===veinId);const rock=candidates[Math.max(0,Math.min(candidates.length-1,Number(index)||0))];if(rock&&!rock.broken){rock.shell=0;rock.hp=0;breakRock(rock);return rock.id}return null},
    breakDepositRock:(depositId,index)=>{const candidates=rocks.filter(rock=>rock.depositId===depositId);const rock=candidates[Math.max(0,Math.min(candidates.length-1,Number(index)||0))];if(rock&&!rock.broken){rock.shell=0;rock.hp=0;breakRock(rock);return rock.id}return null},
    claimPocketReward:id=>{const terrain=currentTerrain(),cavern=terrain&&terrain.caverns.find(item=>item.reward.id===id);return claimPocketReward(cavern)},
    renderOnce:draw,
    grantGold:amount=>{state.gold+=Math.max(0,Number(amount)||0);uiDirty=true},
    setPickaxeLevel:level=>{state.pickaxeLevel=clamp(Math.floor(Number(level)||1),1,PICKAXES.length-1);if(state.pickaxeLevel<PICKAXES.length-1)state.emberMastery=0;uiDirty=true},
    unlockAllAreas:()=>{state.areaUnlocked=true;state.discoveredSecond=true;state.emberdeepUnlocked=true;state.discoveredThird=true;uiDirty=true},
    unlockStarfall:()=>{state.fourthUnlocked=true;state.discoveredFourth=true;uiDirty=true},
    spawnGroundDrops:(type,amount,x=player.x+80,y=player.y)=>spawnGroundDrop(type,amount,x,y),
    collectGroundDrops:()=>{for(const drop of groundDrops)if(drop.scene===currentScene){drop.x=player.x;drop.y=player.y;drop.z=0;drop.settled=true}updateGroundDrops(.001);uiDirty=true},
    expireGroundDrops:()=>{for(const drop of groundDrops)drop.age=GROUND_DROP_LIFETIME;updateGroundDrops(.001)},
    forgeStarVariant:id=>forgeStarVariant(id),
    enterMine:(scene='mossMine')=>transitionScene(scene),
    exitMine:()=>transitionScene('surface'),
    openChest:id=>openChest(chestById(id)),
    interact:performContext,
    save:()=>saveState(true)
  };

  resize();updateUI();requestAnimationFrame(frame);
})();
