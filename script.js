(function(){
  'use strict';

  const canvas=document.getElementById('gameCanvas');
  const game=document.getElementById('game');
  const ctx=canvas.getContext('2d',{alpha:false});
  const ASSET_VERSION='0260';
  const LIGHTING=Object.freeze({
    bufferScale:.34,darknessDepth1:.78,darknessDepth2:.86,
    ambientRadius:132,beamLength:590,beamHalfAngle:.52,beamCoreHalfAngle:.3,
    maxOreLights:16,rayStep:20,ambientRays:36,beamRays:34,oreRays:16
  });
  const lightCanvas=typeof document.createElement==='function'?document.createElement('canvas'):null;
  const lightCtx=lightCanvas&&lightCanvas.getContext?lightCanvas.getContext('2d',{alpha:true}):null;
  let lightingRayChecks=0,lightingOreCount=0;
  const MUSIC_PATH='assets/audio/ever-deeper-drift-loop.mp3?v='+ASSET_VERSION;
  // iOS may ignore HTMLAudioElement volume. The asset itself is mastered at -28 LUFS.
  const MUSIC_VOLUME=1;
  const MOSSVEIN_ART={wall:null,floor:null,floorPattern:null};
  const SURFACE_ART={mossveinGround:null,moonglassGround:null,moonglassGroundPattern:null,moonglassCrystals:null,moonglassBloomBed:null};
  const DISCOVERY_ART={crystalPocket:null};
  const STARTER_ART={sellStation:null,forgeStation:null,storageChest:null,wayfarerShop:null,moonglassGate:null,emberdeepSeal:null,emberdeepGateOpen:null,treasureClosed:null,treasureOpen:null,drops:{}};
  const STARTER_PATHS=Object.freeze({
    sellStation:'assets/surface/assay-station.png',forgeStation:'assets/surface/forge-station.png',storageChest:'assets/surface/storage-chest.png',wayfarerShop:'assets/surface/wayfarer-shop.png',
    treasureClosed:'assets/surface/treasure-cache-closed.png',treasureOpen:'assets/surface/treasure-cache-open.png',moonglassGate:'assets/surface/moonglass-gate.png',emberdeepSeal:'assets/surface/emberdeep-seal.png',emberdeepGateOpen:'assets/surface/emberdeep-gate-open.png'
  });
  const SURFACE_MOONGLASS_PATHS=Object.freeze({
    ground:'assets/surface/moonglass-ground.png',crystals:'assets/surface/moonglass-crystals.png',bloomBed:'assets/surface/moonglass-bloom-bed.png',
    crystalCacheClosed:'assets/surface/crystal-cache-closed.png',crystalCacheOpen:'assets/surface/crystal-cache-open.png',reliquaryClosed:'assets/surface/moonglass-reliquary-closed.png',reliquaryOpen:'assets/surface/moonglass-reliquary-open.png'
  });
  const MOONGLASS_SURFACE_CHEST_ART={moon_cache:{closed:null,open:null},moon_reliquary:{closed:null,open:null}};
  const MINE_ENTRANCE_PATHS=Object.freeze({mossMine:'assets/entrances/mossvein-entrance.png',moonMine:'assets/entrances/moonglass-entrance.png'});
  const MOONGLASS_ART={floor:null,floorPattern:null,wall:null,routeMarker:null,pocket:null,rewards:{cache:null,shrine:null},nodes:{},wallHints:{},barriers:{}};
  const MOONGLASS_PATHS=Object.freeze({
    floor:'assets/moonglass/floor.png',wall:'assets/moonglass/wall.png',routeMarker:'assets/moonglass/route-marker.png',pocket:'assets/moonglass/crystal-pocket.png',cache:'assets/moonglass/buried-cache.png',shrine:'assets/moonglass/mining-rush-shrine.png',
    moonglassNode:'assets/moonglass/moonglass-node.png',starshardNode:'assets/moonglass/starshard-node.png',moonglassWall:'assets/moonglass/moonglass-wall.png',starshardWall:'assets/moonglass/starshard-wall.png',
    prismFault:'assets/moonglass/prismatic-fault.png',starGeode:'assets/moonglass/starbound-geode.png'
  });
  const PRISMATIC_ART={floor:null,floorPattern:null,wall:null,shaft:null,sellStation:null,drillForge:null,pocket:null,rewards:{cache:null,shrine:null},nodes:{},wallHints:{}};
  const PRISMATIC_PATHS=Object.freeze({
    floor:'assets/prismatic/floor.png',wall:'assets/prismatic/wall.png',shaft:'assets/prismatic/depth-portal.png',sellStation:'assets/prismatic/sell-station.png',drillForge:'assets/prismatic/drill-forge.png',pocket:'assets/prismatic/crystal-pocket.png',cache:'assets/prismatic/buried-cache.png',shrine:'assets/prismatic/mining-rush-shrine.png',
    prismiteNode:'assets/prismatic/prismite-node.png',lunacoreNode:'assets/prismatic/lunacore-node.png',phasecrystalNode:'assets/prismatic/phasecrystal-node.png',prismiteWall:'assets/prismatic/prismite-wall.png',deepstoneWall:'assets/prismatic/deepstone-wall.png',lunacoreWall:'assets/prismatic/lunacore-wall.png',phasecrystalWall:'assets/prismatic/phasecrystal-wall.png'
  });
  const MOSSVEIN_REWARD_ART={cache:null,shrine:null};
  const MOSSVEIN_REWARD_PATHS=Object.freeze({cache:'assets/mossvein/buried-cache.png',shrine:'assets/mossvein/mining-rush-shrine.png'});
  const DROP_PATHS=Object.freeze({
    stone:'assets/drops/stone-drop.png',copper:'assets/drops/copper-drop.png',gold:'assets/drops/gold-drop.png',moonglass:'assets/drops/moonglass-drop.png',starshard:'assets/drops/starshard-drop.png',
    deepstone:'assets/drops/deepstone-drop.png',prismite:'assets/drops/prismite-drop.png',lunacore:'assets/drops/lunacore-drop.png',phasecrystal:'assets/drops/phasecrystal-drop.png'
  });
  const ROOTWOUND_ART={floor:null,floorPattern:null,wall:null,rootironWall:null,shaft:null,sellStation:null,drillForge:null,nodes:{}};
  const ROOTWOUND_PATHS=Object.freeze({
    floor:'assets/rootwound/floor.png',wall:'assets/rootwound/wall.png',rootironWall:'assets/rootwound/rootiron-wall.png',shaft:'assets/rootwound/depth-shaft.png',sellStation:'assets/rootwound/sell-station.png',drillForge:'assets/rootwound/drill-forge.png',
    rootiron:'assets/rootwound/rootiron-node.png',deepstone:'assets/rootwound/deepstone-node.png',ambercore:'assets/rootwound/ambercore-node.png',burrowsteel:'assets/rootwound/burrowsteel-node.png'
  });
  const MINERAL_ART={stone:{wall:null,node:null},copper:{wall:null,node:null},gold:{wall:null,node:null}};
  const MINE_ENTRANCE_ART={mossMine:null,moonMine:null};
  const PLAYER_ART={base:null,tools:{},drillCharacters:{}};
  const PLAYER_TOOL_PATHS=Object.freeze({
    'pickaxe-worn':'assets/tools/pickaxe-worn.png','pickaxe-iron':'assets/tools/pickaxe-iron.png','pickaxe-runed':'assets/tools/pickaxe-runed.png','pickaxe-moonglass':'assets/tools/pickaxe-moonglass.png','pickaxe-ember':'assets/tools/pickaxe-ember.png',
    'starforge-crusher':'assets/tools/starforge-crusher.png','starforge-swift':'assets/tools/starforge-swift.png','starforge-prospector':'assets/tools/starforge-prospector.png'
  });
  const PLAYER_DRILL_CHARACTER_PATHS=Object.freeze({
    'drill-burrower':'assets/characters/miner-b-drill-burrower.png',
    'drill-pulse':'assets/characters/miner-b-drill-pulse.png',
    'drill-deepcore':'assets/characters/miner-b-drill-deepcore.png'
  });
  const PLAYER_TOOL_RENDER=Object.freeze({
    'pickaxe-worn':{width:82,pivotX:.32,pivotY:.5},'pickaxe-iron':{width:82,pivotX:.32,pivotY:.5},'pickaxe-runed':{width:82,pivotX:.32,pivotY:.5},'pickaxe-moonglass':{width:82,pivotX:.32,pivotY:.5},'pickaxe-ember':{width:82,pivotX:.32,pivotY:.5},
    'starforge-crusher':{width:80,pivotX:.32,pivotY:.5},'starforge-swift':{width:84,pivotX:.32,pivotY:.5},'starforge-prospector':{width:84,pivotX:.32,pivotY:.5}
  });
  const PLAYER_RENDER_CONTRACT=Object.freeze({
    bodyHeight:112,bodyBottom:34,
    gripCrop:Object.freeze({x:246,y:307,w:69,h:101}),
    gripPivot:Object.freeze({x:14,y:24}),
    gripPoint:Object.freeze({x:42,y:50}),
    drillCompositeHeight:112,
    layeredTools:true,animatedGrip:true,bodyReaction:true,sharedGripAnchor:true,fullDrillComposites:true,legacyDrillLimbCrops:false,
    legacyCanvasCharacter:false,legacyCanvasTools:false
  });
  function loadGameImage(src,key){
    if(typeof Image==='undefined')return null;
    const image=new Image();image.decoding='async';image.onload=()=>{
      MOSSVEIN_ART[key]=image;
      if(key==='floor'&&typeof ctx.createPattern==='function')MOSSVEIN_ART.floorPattern=ctx.createPattern(image,'repeat');
    };image.src=src+'?v='+ASSET_VERSION;return image;
  }
  function imageReady(image){return !!image&&image.complete&&image.naturalWidth>0}
  function loadMineralImage(type,kind){
    if(typeof Image==='undefined')return null;
    const image=new Image();image.decoding='async';image.onload=()=>{MINERAL_ART[type][kind]=image};image.src='assets/minerals/'+type+'-'+kind+'.png?v='+ASSET_VERSION;return image;
  }
  function loadMineEntranceImage(scene,src=MINE_ENTRANCE_PATHS[scene]){
    if(typeof Image==='undefined')return null;
    const image=new Image();image.decoding='async';image.onload=()=>{MINE_ENTRANCE_ART[scene]=image};image.src=src+'?v='+ASSET_VERSION;return image;
  }
  function loadSurfaceImage(src,key,patternKey=null){
    if(typeof Image==='undefined')return null;
    const image=new Image();image.decoding='async';image.onload=()=>{SURFACE_ART[key]=image;if(patternKey&&typeof ctx.createPattern==='function')SURFACE_ART[patternKey]=ctx.createPattern(image,'repeat')};image.src=src+'?v='+ASSET_VERSION;return image;
  }
  function loadDiscoveryImage(src,key){
    if(typeof Image==='undefined')return null;
    const image=new Image();image.decoding='async';image.onload=()=>{DISCOVERY_ART[key]=image};image.src=src+'?v='+ASSET_VERSION;return image;
  }
  function loadMappedImage(src,target,key){
    if(typeof Image==='undefined')return null;
    const image=new Image();image.decoding='async';image.onload=()=>{target[key]=image};image.src=src+'?v='+ASSET_VERSION;return image;
  }
  function loadProductionImage(src,target,key,patternKey=null){
    if(typeof Image==='undefined')return null;
    const image=new Image();image.decoding='async';image.onload=()=>{target[key]=image;if(patternKey&&typeof ctx.createPattern==='function')target[patternKey]=ctx.createPattern(image,'repeat')};image.src=src+'?v='+ASSET_VERSION;return image;
  }
  function loadRootwoundImage(src,key,node=false){
    if(typeof Image==='undefined')return null;
    const image=new Image();image.decoding='async';image.onload=()=>{
      if(node)ROOTWOUND_ART.nodes[key]=image;else ROOTWOUND_ART[key]=image;
      if(key==='floor'&&typeof ctx.createPattern==='function')ROOTWOUND_ART.floorPattern=ctx.createPattern(image,'repeat');
    };image.src=src+'?v='+ASSET_VERSION;return image;
  }
  function loadPlayerImage(src,key,kind='base'){
    if(typeof Image==='undefined')return null;
    const image=new Image();image.decoding='async';image.onload=()=>{if(kind==='tool')PLAYER_ART.tools[key]=image;else if(kind==='drillCharacter')PLAYER_ART.drillCharacters[key]=image;else PLAYER_ART.base=image};image.src=src+'?v='+ASSET_VERSION;return image;
  }
  MOSSVEIN_ART.wall=loadGameImage('assets/mossvein/cave-wall.png','wall');
  MOSSVEIN_ART.floor=loadGameImage('assets/mossvein/cave-floor.png','floor');
  for(const type of Object.keys(MINERAL_ART)){if(type!=='stone')MINERAL_ART[type].wall=loadMineralImage(type,'wall');MINERAL_ART[type].node=loadMineralImage(type,'node')}
  for(const [scene,path] of Object.entries(MINE_ENTRANCE_PATHS))MINE_ENTRANCE_ART[scene]=loadMineEntranceImage(scene,path);
  SURFACE_ART.mossveinGround=loadSurfaceImage('assets/surface/mossvein-ground.png','mossveinGround');
  SURFACE_ART.moonglassGround=loadSurfaceImage(SURFACE_MOONGLASS_PATHS.ground,'moonglassGround','moonglassGroundPattern');
  SURFACE_ART.moonglassCrystals=loadSurfaceImage(SURFACE_MOONGLASS_PATHS.crystals,'moonglassCrystals');
  SURFACE_ART.moonglassBloomBed=loadSurfaceImage(SURFACE_MOONGLASS_PATHS.bloomBed,'moonglassBloomBed');
  MOONGLASS_SURFACE_CHEST_ART.moon_cache.closed=loadMappedImage(SURFACE_MOONGLASS_PATHS.crystalCacheClosed,MOONGLASS_SURFACE_CHEST_ART.moon_cache,'closed');
  MOONGLASS_SURFACE_CHEST_ART.moon_cache.open=loadMappedImage(SURFACE_MOONGLASS_PATHS.crystalCacheOpen,MOONGLASS_SURFACE_CHEST_ART.moon_cache,'open');
  MOONGLASS_SURFACE_CHEST_ART.moon_reliquary.closed=loadMappedImage(SURFACE_MOONGLASS_PATHS.reliquaryClosed,MOONGLASS_SURFACE_CHEST_ART.moon_reliquary,'closed');
  MOONGLASS_SURFACE_CHEST_ART.moon_reliquary.open=loadMappedImage(SURFACE_MOONGLASS_PATHS.reliquaryOpen,MOONGLASS_SURFACE_CHEST_ART.moon_reliquary,'open');
  DISCOVERY_ART.crystalPocket=loadDiscoveryImage('assets/mossvein/magic-crystal-pocket.png','crystalPocket');
  for(const [key,path] of Object.entries(STARTER_PATHS))STARTER_ART[key]=loadMappedImage(path,STARTER_ART,key);
  for(const [key,path] of Object.entries(MOSSVEIN_REWARD_PATHS))MOSSVEIN_REWARD_ART[key]=loadMappedImage(path,MOSSVEIN_REWARD_ART,key);
  for(const [key,path] of Object.entries(DROP_PATHS))STARTER_ART.drops[key]=loadMappedImage(path,STARTER_ART.drops,key);
  for(const [key,path] of Object.entries(ROOTWOUND_PATHS)){const node=['rootiron','deepstone','ambercore','burrowsteel'].includes(key),image=loadRootwoundImage(path,key,node);if(node)ROOTWOUND_ART.nodes[key]=image;else ROOTWOUND_ART[key]=image}
  MOONGLASS_ART.floor=loadProductionImage(MOONGLASS_PATHS.floor,MOONGLASS_ART,'floor','floorPattern');
  for(const [key,path] of [['wall',MOONGLASS_PATHS.wall],['routeMarker',MOONGLASS_PATHS.routeMarker],['pocket',MOONGLASS_PATHS.pocket]])MOONGLASS_ART[key]=loadProductionImage(path,MOONGLASS_ART,key);
  MOONGLASS_ART.rewards.cache=loadProductionImage(MOONGLASS_PATHS.cache,MOONGLASS_ART.rewards,'cache');MOONGLASS_ART.rewards.shrine=loadProductionImage(MOONGLASS_PATHS.shrine,MOONGLASS_ART.rewards,'shrine');
  MOONGLASS_ART.nodes.moonglass=loadProductionImage(MOONGLASS_PATHS.moonglassNode,MOONGLASS_ART.nodes,'moonglass');MOONGLASS_ART.nodes.starshard=loadProductionImage(MOONGLASS_PATHS.starshardNode,MOONGLASS_ART.nodes,'starshard');
  MOONGLASS_ART.wallHints.moonglass=loadProductionImage(MOONGLASS_PATHS.moonglassWall,MOONGLASS_ART.wallHints,'moonglass');MOONGLASS_ART.wallHints.starshard=loadProductionImage(MOONGLASS_PATHS.starshardWall,MOONGLASS_ART.wallHints,'starshard');
  MOONGLASS_ART.barriers.moon_prism_gate=loadProductionImage(MOONGLASS_PATHS.prismFault,MOONGLASS_ART.barriers,'moon_prism_gate');MOONGLASS_ART.barriers.moon_star_lock=loadProductionImage(MOONGLASS_PATHS.starGeode,MOONGLASS_ART.barriers,'moon_star_lock');
  PRISMATIC_ART.floor=loadProductionImage(PRISMATIC_PATHS.floor,PRISMATIC_ART,'floor','floorPattern');
  for(const [key,path] of [['wall',PRISMATIC_PATHS.wall],['shaft',PRISMATIC_PATHS.shaft],['sellStation',PRISMATIC_PATHS.sellStation],['drillForge',PRISMATIC_PATHS.drillForge],['pocket',PRISMATIC_PATHS.pocket]])PRISMATIC_ART[key]=loadProductionImage(path,PRISMATIC_ART,key);
  PRISMATIC_ART.rewards.cache=loadProductionImage(PRISMATIC_PATHS.cache,PRISMATIC_ART.rewards,'cache');PRISMATIC_ART.rewards.shrine=loadProductionImage(PRISMATIC_PATHS.shrine,PRISMATIC_ART.rewards,'shrine');
  PRISMATIC_ART.nodes.prismite=loadProductionImage(PRISMATIC_PATHS.prismiteNode,PRISMATIC_ART.nodes,'prismite');PRISMATIC_ART.nodes.deepstone=ROOTWOUND_ART.nodes.deepstone;PRISMATIC_ART.nodes.lunacore=loadProductionImage(PRISMATIC_PATHS.lunacoreNode,PRISMATIC_ART.nodes,'lunacore');PRISMATIC_ART.nodes.phasecrystal=loadProductionImage(PRISMATIC_PATHS.phasecrystalNode,PRISMATIC_ART.nodes,'phasecrystal');
  for(const [type,path] of [['prismite',PRISMATIC_PATHS.prismiteWall],['deepstone',PRISMATIC_PATHS.deepstoneWall],['lunacore',PRISMATIC_PATHS.lunacoreWall],['phasecrystal',PRISMATIC_PATHS.phasecrystalWall]])PRISMATIC_ART.wallHints[type]=loadProductionImage(path,PRISMATIC_ART.wallHints,type);
  PLAYER_ART.base=loadPlayerImage('assets/characters/miner-b.png','base');
  for(const [key,path] of Object.entries(PLAYER_TOOL_PATHS))PLAYER_ART.tools[key]=loadPlayerImage(path,key,'tool');
  for(const [key,path] of Object.entries(PLAYER_DRILL_CHARACTER_PATHS))PLAYER_ART.drillCharacters[key]=loadPlayerImage(path,key,'drillCharacter');
  const viewport=document.getElementById('viewport');
  const goldValue=document.getElementById('goldValue');
  const cargoValue=document.getElementById('cargoValue');
  const areaName=document.getElementById('areaName');
  const areaBanner=document.getElementById('areaBanner');
  const areaBannerName=document.getElementById('areaBannerName');
  const objective=document.getElementById('objective');
  const objectiveText=document.getElementById('objectiveText');
  const objectiveDetail=document.getElementById('objectiveDetail');
  const focusMeter=document.getElementById('focusMeter');
  const focusCount=document.getElementById('focusCount');
  const contextPanel=document.getElementById('contextPanel');
  const contextEyebrow=document.getElementById('contextEyebrow');
  const contextTitle=document.getElementById('contextTitle');
  const contextDetail=document.getElementById('contextDetail');
  const contextButton=document.getElementById('contextButton');
  const contextActions=document.getElementById('contextActions');
  const contextSecondaryButton=document.getElementById('contextSecondaryButton');
  const starforgeChoices=document.getElementById('starforgeChoices');
  const mineButton=document.getElementById('mineButton');
  const mineAction=document.getElementById('mineAction');
  const mineHint=document.getElementById('mineHint');
  const joystick=document.getElementById('joystick');
  const joystickKnob=document.getElementById('joystickKnob');
  const pickaxeName=document.getElementById('pickaxeName');
  const toolKind=document.getElementById('toolKind');
  const powerValue=document.getElementById('powerValue');
  const speedValue=document.getElementById('speedValue');
  const unlockFill=document.getElementById('unlockFill');
  const unlockLabel=document.getElementById('unlockLabel');
  const toast=document.getElementById('toast');
  const menuButton=document.getElementById('menuButton');
  const menuShade=document.getElementById('menuShade');
  const resumeButton=document.getElementById('resumeButton');
  const resetButton=document.getElementById('resetButton');
  const inventoryButton=document.getElementById('inventoryButton');
  const inventoryShade=document.getElementById('inventoryShade');
  const inventoryCloseButton=document.getElementById('inventoryCloseButton');
  const inventoryTotal=document.getElementById('inventoryTotal');
  const inventoryTypes=document.getElementById('inventoryTypes');
  const inventoryGrid=document.getElementById('inventoryGrid');
  const autoSortButton=document.getElementById('autoSortButton');
  const autoSortHint=document.getElementById('autoSortHint');
  const buyChestButton=document.getElementById('buyChestButton');
  const buyChestCost=document.getElementById('buyChestCost');
  const baseModuleList=document.getElementById('baseModuleList');

  const BUILD={version:'0.26.0',name:'MOONGLASS COMPLETE'};
  document.getElementById('buildVersion').textContent='v'+BUILD.version;
  document.getElementById('menuBuildVersion').textContent='EVER DEEPER v'+BUILD.version+' · '+BUILD.name;

  const WORLD={width:4480,height:1280,gateX:1110,emberGateX:2240,starfallGateX:3360,gateY:650,gateHalfGap:118};
  const MINE_DEFINITIONS={
    mossMine:{
      id:'mossMine',name:'MOSSVEIN MINE',surfaceName:'MOSSVEIN QUARRY',width:1920,height:5120,entrance:{x:145,y:640},surfaceEntrance:{x:165,y:690,radius:112},
      unlock:()=>true,accent:'#d2a65b',detail:'#e9cf8c',floor:'#1b241c',wall:'#34372e',wallEdge:'#716b4d',style:'moss',finalGoal:'Mine the Gilded Heart',
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
  const MINE_DEPTH_PROFILES={
    mossMine:{name:'ROOTWOUND DEPTHS',dirt:'#6b4b2e',floor:'#151b17',wallEdge:'#a2764d',accent:'#d39a58',detail:'#f0c47d',terrainHp:320,seedOffset:41011},
    moonMine:{name:'PRISMATIC DEPTHS',dirt:'#285466',floor:'#0c1b21',wallEdge:'#62a9b7',accent:'#79e4e2',detail:'#d0b8ff',terrainHp:360,seedOffset:52021},
    emberMine:{name:'MOLTEN DEPTHS',dirt:'#6b2f24',floor:'#1a1010',wallEdge:'#c15c38',accent:'#ff7b45',detail:'#ffd080',terrainHp:400,seedOffset:63031},
    starMine:{name:'VOIDSTAR DEPTHS',dirt:'#34365f',floor:'#090a18',wallEdge:'#767cba',accent:'#bfc8ff',detail:'#f2d8ff',terrainHp:440,seedOffset:74041}
  };
  const DEPTH2_RESOURCE_PROFILES={
    mossMine:{main:'rootiron',secondary:'deepstone',rare:'ambercore'},
    moonMine:{main:'prismite',secondary:'deepstone',rare:'lunacore'},
    emberMine:{main:'magmaite',secondary:'deepstone',rare:'furnaceheart'},
    starMine:{main:'voidglass',secondary:'deepstone',rare:'singularity'}
  };
  const DRILL_GATED_RESOURCE_PROFILES={
    mossMine:{type:'burrowsteel',requiresDrillLevel:1,veinCount:4},
    moonMine:{type:'phasecrystal',requiresDrillLevel:2,veinCount:4},
    emberMine:{type:'infernium',requiresDrillLevel:2,veinCount:4}
  };
  const DEPTH_ROUTE_LABELS={mossMine:'ROOTWOUND DEPTHS',moonMine:'PRISMATIC DEPTHS',emberMine:'MOLTEN DEPTHS',starMine:'VOIDSTAR DEPTHS'};
  const MINE_DIRT_COLORS={mossMine:'#4b3d2b',moonMine:'#244d57',emberMine:'#5b2c23',starMine:'#303154'};
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
    astralite:{shape:'star',gravity:115,spread:1.18},crownstone:{shape:'star',gravity:70,spread:1.28},
    deepstone:{shape:'chip',gravity:410,spread:1.08},rootiron:{shape:'spark',gravity:390,spread:1.08},ambercore:{shape:'shard',gravity:250,spread:1.18},
    prismite:{shape:'shard',gravity:210,spread:1.13},lunacore:{shape:'star',gravity:120,spread:1.22},magmaite:{shape:'ember',gravity:270,spread:1.16},
    furnaceheart:{shape:'ember',gravity:180,spread:1.25},voidglass:{shape:'shard',gravity:95,spread:1.2},singularity:{shape:'star',gravity:45,spread:1.3},
    burrowsteel:{shape:'spark',gravity:360,spread:1.16},phasecrystal:{shape:'shard',gravity:150,spread:1.24},infernium:{shape:'ember',gravity:180,spread:1.28}
  };
  const SAVE_KEY='everDeeperPrototypeV2';
  const GATE_COST=120;
  const EMBER_GATE_COST=360;
  const EMBER_PICKAXE_ORE_REQUIRED=12;
  const GROUND_DROP_LIFETIME=300;
  const LOOT_SWEEP_WARNING_SECONDS=30;
  const GROUND_DROP_PICKUP_RADIUS=48;
  const GROUND_DROP_EDGE_X=56;
  const GROUND_DROP_EDGE_TOP=76;
  const GROUND_DROP_EDGE_BOTTOM=64;
  const BASE_MODULE_INTERACT_RADIUS=118;
  const AUTO_SORT_RADIUS=360;
  const STORAGE_CHEST_CAPACITY=20;
  const MAX_GROUND_DROPS=160;
  const MAX_MINING_PARTICLES=260;
  const EMBER_MASTERY=[
    {rank:0,power:31,cooldown:.23,gold:0,sunslag:0,label:'Awakened',shellPower:.72,bonusYield:.22,precisionDelay:1},
    {rank:1,power:38,cooldown:.215,gold:450,sunslag:1,label:'Tempered',shellPower:.85,bonusYield:.27,precisionDelay:.96},
    {rank:2,power:46,cooldown:.20,gold:850,sunslag:3,label:'Kindled',shellPower:1,bonusYield:.32,precisionDelay:.92},
    {rank:3,power:66,cooldown:.185,gold:1450,sunslag:6,label:'Blazing',shellPower:1.15,bonusYield:.38,precisionDelay:.88},
    {rank:4,power:92,cooldown:.17,gold:2300,sunslag:10,label:'Infernal',shellPower:1.3,bonusYield:.45,precisionDelay:.82},
    {rank:5,power:128,cooldown:.155,gold:3600,sunslag:15,label:'Depth Master',shellPower:1.5,bonusYield:.55,precisionDelay:.75}
  ];
  const MINING_RANGE=116;
  const MINE_TILE_SIZE=48;
  const MINERAL_NODE_RENDER_SCALE=.85;
  const MINE_CHUNK_CELLS=16;
  const MINE_TERRAIN_HP=8;
  const PLAYER_SPEED=340;
  const PLAYER_MOVE_STEP=16;
  const MOVEMENT_SPEED_GAIN=.07;
  const MINING_RUSH_DURATION=30;
  const MINING_RUSH_COOLDOWN_MULTIPLIER=.65;
  const ROCK_TYPES={
    stone:{label:'Stone',hp:10,value:2,color:'#88928a',edge:'#cbd0ca',accent:'#68736c',respawn:6},
    copper:{label:'Copper',hp:18,value:7,color:'#8f6546',edge:'#d9955e',accent:'#5d4030',respawn:8},
    moonglass:{label:'Moonglass',hp:42,value:22,color:'#3d8695',edge:'#9ef2ed',accent:'#235365',respawn:10},
    gold:{label:'Gold Vein',hp:28,value:34,color:'#8a6b31',edge:'#ffe17a',accent:'#513d1b',respawn:22,rare:true},
    starshard:{label:'Starshard',hp:58,value:68,color:'#4d477f',edge:'#d6b8ff',accent:'#29284f',respawn:28,rare:true},
    emberstone:{label:'Emberstone',hp:74,shell:32,value:48,color:'#632b22',edge:'#ff9b54',accent:'#321918',respawn:13,armored:true},
    sunslag:{label:'Sunslag Core',hp:92,shell:44,value:118,color:'#6f321a',edge:'#ffd078',accent:'#26110c',respawn:31,rare:true,armored:true},
    astralite:{label:'Astralite',hp:325,shell:72,value:260,color:'#303158',edge:'#b9c7ff',accent:'#17182f',respawn:18,armored:true,starfall:true},
    crownstone:{label:'Crownstone',hp:460,shell:110,value:620,color:'#49355f',edge:'#f4c5ff',accent:'#21172e',respawn:38,rare:true,armored:true,starfall:true},
    deepstone:{label:'Deepstone',hp:145,value:5,color:'#3d4544',edge:'#91a09c',accent:'#252c2b',respawn:10,depth2:true},
    rootiron:{label:'Rootiron',hp:480,shell:95,value:310,color:'#42513b',edge:'#a9ca83',accent:'#232d20',respawn:19,armored:true,depth2:true},
    ambercore:{label:'Ambercore',hp:620,shell:130,value:820,color:'#6e471e',edge:'#ffc667',accent:'#38230f',respawn:42,rare:true,armored:true,depth2:true},
    prismite:{label:'Prismite',hp:540,shell:105,value:380,color:'#285269',edge:'#8df5ff',accent:'#172d3b',respawn:20,armored:true,depth2:true},
    lunacore:{label:'Lunacore',hp:690,shell:145,value:980,color:'#514177',edge:'#e1bdff',accent:'#261e3c',respawn:44,rare:true,armored:true,depth2:true},
    magmaite:{label:'Magmaite',hp:610,shell:125,value:460,color:'#6c2b20',edge:'#ff8c4d',accent:'#341510',respawn:21,armored:true,depth2:true},
    furnaceheart:{label:'Furnace Heart',hp:780,shell:165,value:1180,color:'#7b351b',edge:'#ffdf76',accent:'#351409',respawn:46,rare:true,armored:true,depth2:true},
    voidglass:{label:'Voidglass',hp:710,shell:150,value:560,color:'#27284e',edge:'#b8c7ff',accent:'#111226',respawn:23,armored:true,depth2:true},
    singularity:{label:'Singularity Core',hp:920,shell:210,value:1500,color:'#3d2859',edge:'#f3bfff',accent:'#160c24',respawn:50,rare:true,armored:true,depth2:true},
    burrowsteel:{label:'Burrowsteel',hp:760,shell:180,value:640,color:'#33483c',edge:'#80e0b1',accent:'#16281f',respawn:24,armored:true,depth2:true,drillGated:true},
    phasecrystal:{label:'Phase Crystal',hp:980,shell:235,value:920,color:'#284d70',edge:'#8df4ff',accent:'#13273f',respawn:28,rare:true,armored:true,depth2:true,drillGated:true},
    infernium:{label:'Infernium',hp:1080,shell:260,value:980,color:'#702a1c',edge:'#ff9b55',accent:'#32120b',respawn:28,rare:true,armored:true,depth2:true,drillGated:true}
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

  function newWorldSeed(){
    try{const values=new Uint32Array(1);crypto.getRandomValues(values);return values[0]||1}catch(error){return(Math.floor(Math.random()*4294967295)||1)>>>0}
  }

  function generateMineDiscoveries(scene,depth=1){
    const mine=MINE_DEFINITIONS[scene],profile=MINE_DISCOVERY_PROFILES[scene],random=seededRandom(profile.seed);
    const resources=depth===2?DEPTH2_RESOURCE_PROFILES[scene]:profile;
    const cols=Math.ceil(mine.width/MINE_TILE_SIZE),rows=Math.ceil(mine.height/MINE_TILE_SIZE),caverns=[],deposits=[],rocks=[];
    const depthProfile=MINE_DEPTH_PROFILES[scene],depthPrefix=depth===2?'_depth2':'',cavernCount=profile.cavernCount+(depth===2?2:0),veinCount=profile.veinCount+(depth===2?4:0);
    const depthRandom=depth===2?seededRandom(profile.seed+depthProfile.seedOffset):random;
    const firstDeepRow=Math.ceil((depth===2?700:1500)/MINE_TILE_SIZE),lastDeepRow=rows-7,deepRows=lastDeepRow-firstDeepRow;
    for(let index=0;index<cavernCount;index++){
      const band=(index+.5)/cavernCount,row=Math.round(firstDeepRow+deepRows*band+(depthRandom()-.5)*4);
      const col=4+Math.floor(depthRandom()*Math.max(1,cols-8)),rx=112+Math.floor(depthRandom()*65),ry=82+Math.floor(depthRandom()*52);
      const kind=POCKET_REWARD_KINDS[(index+MINE_SCENES.indexOf(scene))%POCKET_REWARD_KINDS.length];
      const uniqueRewardId=scene+depthPrefix+'_pocket_reward_'+(index+1);
      const reward={id:uniqueRewardId,kind,type:kind==='crystal'?resources.rare:resources.main,label:kind==='cache'?'BURIED CACHE':kind==='crystal'?'CRYSTAL CLUSTER':kind==='motherlode'?'MOTHERLODE':'RESTORATIVE SHRINE'};
      if(kind==='cache'){
        reward.rewards={};reward.rewards[resources.main]=3+MINE_SCENES.indexOf(scene);
        reward.rewards[resources.secondary]=(reward.rewards[resources.secondary]||0)+2;
      }
      const baseName=profile.names[index%profile.names.length];
      caverns.push({id:scene+depthPrefix+'_cavern_'+(index+1),name:depth===2?'Deep '+baseName:baseName,x:(col+.5)*MINE_TILE_SIZE,y:(row+.5)*MINE_TILE_SIZE,rx,ry,reward,depth});
    }
    const insideCavern=(x,y,padding=0)=>caverns.some(cavern=>Math.pow((x-cavern.x)/(cavern.rx+padding),2)+Math.pow((y-cavern.y)/(cavern.ry+padding),2)<1);
    const directions=[[1,0],[1,1],[0,1],[-1,1]],occupiedCells=new Set();
    for(let depositIndex=0;depositIndex<veinCount;depositIndex++){
      const rare=(depositIndex+1)%(depth===2?4:5)===0,type=rare?resources.rare:depthRandom()<(depth===2?.28:.18)?resources.secondary:resources.main;
      let positions=[];
      for(let attempt=0;attempt<48&&positions.length<4;attempt++){
        const length=4+Math.floor(depthRandom()*(depth===2?9:7)),direction=directions[Math.floor(depthRandom()*directions.length)];
        const startCol=3+Math.floor(depthRandom()*Math.max(1,cols-7)),startRow=firstDeepRow+Math.floor(depthRandom()*Math.max(1,deepRows-8));
        const candidate=[],used=new Set();
        for(let step=0;step<length;step++){
          const wobble=step>1&&step%3===0?(depthRandom()<.5?-1:1):0;
          const col=Math.max(2,Math.min(cols-3,startCol+direction[0]*step+(direction[1]?wobble:0)));
          const row=Math.max(firstDeepRow,Math.min(rows-3,startRow+direction[1]*step+(direction[0]?wobble:0)));
          const key=col+','+row,x=(col+.5)*MINE_TILE_SIZE,y=(row+.5)*MINE_TILE_SIZE;
          if(used.has(key)||occupiedCells.has(key)||insideCavern(x,y,72))continue;
          used.add(key);candidate.push([x,y]);
        }
        if(candidate.length>=4)positions=candidate;
      }
      if(positions.length<4)continue;
      const id=scene+depthPrefix+'_vein_'+(depositIndex+1);
      deposits.push({id,type,positions});
      for(const position of positions){
        occupiedCells.add(Math.floor(position[0]/MINE_TILE_SIZE)+','+Math.floor(position[1]/MINE_TILE_SIZE));
        rocks.push({type,x:position[0],y:position[1],depositId:id,requiredPickaxe:Math.min(5,profile.requiredPickaxe+(depth===2?1:0)),requiresDeepTool:depth===2,depth});
      }
    }
    for(let index=0;index<caverns.length;index++){
      const cavern=caverns[index],reward=cavern.reward;
      if(reward.kind==='crystal'||reward.kind==='motherlode'){
        const offsets=reward.kind==='crystal'?[[-50,12],[0,-28],[50,12]]:[[-58,-12],[-30,28],[0,-24],[30,28],[58,-12]];
        const positions=offsets.map(([offsetX,offsetY])=>[(Math.floor((cavern.x+offsetX)/MINE_TILE_SIZE)+.5)*MINE_TILE_SIZE,(Math.floor((cavern.y+offsetY)/MINE_TILE_SIZE)+.5)*MINE_TILE_SIZE]);
        const id=reward.id+'_deposit';
        deposits.push({id,type:reward.type,positions,cavernId:cavern.id,pocketRewardId:reward.id,pocketReward:true});
        for(const position of positions)rocks.push({type:reward.type,x:position[0],y:position[1],depositId:id,cavernId:cavern.id,pocketRewardId:reward.id,pocketReward:true,requiredPickaxe:Math.min(5,profile.requiredPickaxe+(depth===2?1:0)),requiresDeepTool:depth===2,depth});
      }
      if(index!==Math.floor(caverns.length*.45)&&index!==caverns.length-1)continue;
      const id=cavern.id+'_rare_find';
      const x=(Math.floor(cavern.x/MINE_TILE_SIZE)+.5)*MINE_TILE_SIZE,y=(Math.floor(cavern.y/MINE_TILE_SIZE)+.5)*MINE_TILE_SIZE;
      deposits.push({id,type:resources.rare,positions:[[x,y]],rareFind:true,cavernId:cavern.id});
      rocks.push({type:resources.rare,x,y,depositId:id,cavernId:cavern.id,rareFind:true,requiredPickaxe:Math.min(5,profile.requiredPickaxe+(depth===2?1:0)),requiresDeepTool:depth===2,depth});
    }
    const gatedProfile=depth===2?DRILL_GATED_RESOURCE_PROFILES[scene]:null;
    if(gatedProfile){
      for(let gatedIndex=0;gatedIndex<gatedProfile.veinCount;gatedIndex++){
        let positions=[];
        for(let attempt=0;attempt<64&&positions.length<4;attempt++){
          const length=4+Math.floor(depthRandom()*3),horizontal=depthRandom()<.5;
          const startCol=3+Math.floor(depthRandom()*Math.max(1,cols-8)),startRow=firstDeepRow+Math.floor(depthRandom()*Math.max(1,deepRows-8));
          const candidate=[];
          for(let step=0;step<length;step++){
            const col=Math.max(2,Math.min(cols-3,startCol+(horizontal?step:step%2))),row=Math.max(firstDeepRow,Math.min(rows-3,startRow+(horizontal?step%2:step)));
            const key=col+','+row,x=(col+.5)*MINE_TILE_SIZE,y=(row+.5)*MINE_TILE_SIZE;
            if(occupiedCells.has(key)||insideCavern(x,y,72))continue;
            candidate.push([x,y]);
          }
          if(candidate.length>=4)positions=candidate;
        }
        if(positions.length<4){
          for(let row=firstDeepRow+gatedIndex*5;row<rows-3&&positions.length<4;row++)for(let col=3;col<cols-3&&positions.length<4;col++){
            const key=col+','+row,x=(col+.5)*MINE_TILE_SIZE,y=(row+.5)*MINE_TILE_SIZE;
            if(!occupiedCells.has(key)&&!insideCavern(x,y,72))positions.push([x,y]);
          }
        }
        if(positions.length<4)continue;
        const id=scene+'_depth2_drill_gate_'+(gatedIndex+1);
        deposits.push({id,type:gatedProfile.type,positions,drillGated:true,requiresDrillLevel:gatedProfile.requiresDrillLevel});
        for(const position of positions){
          occupiedCells.add(Math.floor(position[0]/MINE_TILE_SIZE)+','+Math.floor(position[1]/MINE_TILE_SIZE));
          rocks.push({type:gatedProfile.type,x:position[0],y:position[1],depositId:id,requiredPickaxe:5,requiresDeepTool:true,requiresDrillLevel:gatedProfile.requiresDrillLevel,drillGated:true,depth});
        }
      }
    }
    return{caverns,deposits,rocks};
  }

  const MINE_DISCOVERIES=Object.fromEntries(Object.keys(MINE_DISCOVERY_PROFILES).map(scene=>[scene,generateMineDiscoveries(scene,1)]));
  const MINE_DEPTH_DISCOVERIES=Object.fromEntries(Object.keys(MINE_DISCOVERY_PROFILES).map(scene=>[scene,generateMineDiscoveries(scene,2)]));
  function discoveriesFor(scene,depth=1){return depth===2?MINE_DEPTH_DISCOVERIES[scene]:MINE_DISCOVERIES[scene]}
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
  const DRILLS=[
    null,
    {name:'Burrower Drill',power:210,cooldown:.075,shellPower:1.65,yieldBonus:.35,color:'#8fd9bc'},
    {name:'Pulse Drill',power:300,cooldown:.060,shellPower:1.9,yieldBonus:.44,color:'#7defff'},
    {name:'Deepcore Drill',power:430,cooldown:.046,shellPower:2.2,yieldBonus:.56,color:'#ffd47a'}
  ];
  const DRILL_RECIPES=[
    null,
    {gold:1200,requirements:[{scene:'mossMine',type:'rootiron',amount:8},{scene:'mossMine',type:'ambercore',amount:1}]},
    {gold:3200,requirements:[{scene:'mossMine',type:'burrowsteel',amount:12}]},
    {gold:7200,requirements:[{scene:'moonMine',type:'phasecrystal',amount:10},{scene:'emberMine',type:'infernium',amount:10}]}
  ];
  const STATIONS={
    sell:{x:205,y:250,radius:132},
    forge:{x:455,y:250,radius:132},
    speedShop:{x:730,y:220,radius:128},
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
  let audioContext=null,audioUnlocked=false,impactNoiseBuffer=null,backgroundMusic=null,musicStarted=false;
  let particles=[],floaters=[],rings=[],groundDrops=[];
  let saleMotes=[];
  let activeContext=null,uiDirty=true,lastSavedSnapshot='',lastRegion=-1,nextDropId=1,terrainSaveDelay=0,lootSweepCheck=0,lootSweepWarned30=false,lootSweepWarned10=false;
  const miningFeedback={shake:0,shakeTime:0,flash:0,flashColor:'#ffffff',hitStop:0,terrainHitIndex:-1,terrainHitTime:0,lastDiscovery:null,lastDepositBeat:null,lastPocketReward:null};
  let lastHapticAt=-1;
  const pickupBatch={items:Object.create(null),count:0,quiet:0,x:0,y:0,bestType:null};

  const input={keys:new Set(),moveX:0,moveY:0,joystickPointer:null,minePointers:new Set(),mineHeld:false};
  const camera={x:0,y:0};
  const player={x:330,y:690,radius:23,facing:1,aimX:1,aimY:0,walk:0,swing:null,swingCooldown:0,hitRockId:null,hitTerrainIndex:-1};
  const miningFocus={streak:0,timer:0};
  const miningRush={timer:0,lastSecond:0};
  const state=loadState();
  let currentScene=state.location.scene;
  let currentDepth=currentScene==='surface'?1:state.location.depth;
  player.x=state.location.x;player.y=state.location.y;
  let displayedGold=state.gold,goldTween=null;
  let depthEntrances=createDepthEntrances();
  const surfaceRocks=ROCK_LAYOUT.concat(VEIN_ROCK_LAYOUT).map((entry,index)=>({
    id:index+1,type:entry[0],x:entry[1],y:entry[2],hp:ROCK_TYPES[entry[0]].hp,maxHp:ROCK_TYPES[entry[0]].hp,
    shell:ROCK_TYPES[entry[0]].shell||0,maxShell:ROCK_TYPES[entry[0]].shell||0,
    scene:'surface',veinId:entry[3]||null,barrierId:null,requiredPickaxe:1,respawn:0,hit:0,broken:false,seed:(index*47)%97,glintTimer:1.5+(index%5)*.48,glintActive:0,bonusYield:0
  }));
  let mineRockIndex=0;
  const mineRocks=MINE_SCENES.flatMap(scene=>{
    const mine=MINE_DEFINITIONS[scene];
    const entries=mine.rocks.map(entry=>({entry,depth:1})).concat(MINE_DISCOVERIES[scene].rocks.map(entry=>({entry,depth:1})),MINE_DEPTH_DISCOVERIES[scene].rocks.map(entry=>({entry,depth:2})));
    return entries.map(wrapper=>{
      const entry=wrapper.entry,depth=wrapper.depth;
      const generated=!Array.isArray(entry),type=generated?entry.type:entry[0],barrierId=generated?null:entry[3]||null;
      const barrier=barrierId?mine.barriers.find(item=>item.id===barrierId):null,index=mineRockIndex++,data=ROCK_TYPES[type],shell=generated?(data.shell||0):0;
      return{id:1000+index,type,x:generated?entry.x:entry[1],y:generated?entry.y:entry[2],hp:data.hp,maxHp:data.hp,
        shell,maxShell:shell,scene,depth,veinId:null,depositId:generated?entry.depositId:null,cavernId:generated?entry.cavernId||null:null,rareFind:generated&&!!entry.rareFind,pocketRewardId:generated?entry.pocketRewardId||null:null,
        barrierId,requiredPickaxe:generated?entry.requiredPickaxe:barrier?barrier.requiresPickaxe:1,requiresDeepTool:generated&&!!entry.requiresDeepTool,requiresDrillLevel:generated?entry.requiresDrillLevel||0:0,
        respawn:0,hit:0,broken:false,seed:(index*53)%97,glintTimer:1.5+(index%5)*.48,glintActive:0,bonusYield:0};
    });
  });
  const rocks=surfaceRocks.concat(mineRocks);
  const rocksByLocation=new Map([['surface:1',surfaceRocks]]);
  for(const scene of MINE_SCENES)for(const depth of [1,2])rocksByLocation.set(scene+':'+depth,mineRocks.filter(rock=>rock.scene===scene&&rock.depth===depth));
  for(const rock of mineRocks)if(rock.barrierId&&state.clearedMineBarriers[rock.barrierId]){rock.broken=true;rock.respawn=Infinity}
  for(const rock of mineRocks)if(rock.pocketRewardId&&state.claimedPocketRewards[rock.pocketRewardId]){rock.broken=true;rock.respawn=Infinity}
  const mineTerrain=Object.fromEntries(MINE_SCENES.map(scene=>[scene,{1:createMineTerrain(scene,1),2:createMineTerrain(scene,2)}]));
  const mineRocksByTerrainCell=new Map(),mineRocksByCavern=new Map();
  for(const rock of mineRocks){
    if(rock.barrierId)continue;
    const terrain=mineTerrain[rock.scene][rock.depth||1],col=Math.floor(rock.x/MINE_TILE_SIZE),row=Math.floor(rock.y/MINE_TILE_SIZE),cellKey=rock.scene+':'+(rock.depth||1)+':'+(row*terrain.cols+col);
    if(!mineRocksByTerrainCell.has(cellKey))mineRocksByTerrainCell.set(cellKey,[]);
    mineRocksByTerrainCell.get(cellKey).push(rock);
    if(rock.cavernId){if(!mineRocksByCavern.has(rock.cavernId))mineRocksByCavern.set(rock.cavernId,[]);mineRocksByCavern.get(rock.cavernId).push(rock)}
  }
  const veins=VEIN_DEFINITIONS.map(definition=>({...definition,status:'idle',timer:0,displaySecond:-1,brokenRockIds:new Set()}));
  const chests=CHEST_DEFINITIONS.map(definition=>({...definition}));
  for(const [chestId,rewards] of Object.entries(state.pendingChestLoot)){
    const chest=chestById(chestId);if(!chest)continue;
    let rewardIndex=0;
    for(const [type,amount] of Object.entries(rewards))spawnGroundDrop(type,amount,chest.x+(rewardIndex++-1)*18,chest.y+18,chestId,'surface');
  }
  for(const scene of MINE_SCENES)for(const depth of [1,2])for(const cavern of discoveriesFor(scene,depth).caverns){
    const reward=cavern.reward,pending=state.pendingPocketLoot[reward.id];if(!pending)continue;
    let rewardIndex=0;for(const [type,amount] of Object.entries(pending))spawnGroundDrop(type,amount,cavern.x+(rewardIndex++-1)*18,cavern.y+12,null,scene,reward.id,depth);
  }
  if(state.nextLootSweepAt<=Date.now())performGlobalLootSweep(false);

  function emptyResourceStore(){return Object.fromEntries(Object.keys(ROCK_TYPES).map(type=>[type,0]))}

  function defaultBaseState(){
    return{
      forge:{id:'forge',kind:'forge',scene:'surface',depth:1,x:STATIONS.forge.x,y:STATIONS.forge.y,packed:false},
      sell:{id:'sell',kind:'sell',scene:'surface',depth:1,x:STATIONS.sell.x,y:STATIONS.sell.y,packed:false},
      chests:[{id:'storage-1',kind:'storage',scene:'surface',depth:1,x:335,y:390,packed:false,items:emptyResourceStore()}],
      nextChestId:2
    };
  }

  function sanitizeBaseState(raw){
    const fallback=defaultBaseState(),source=raw&&typeof raw==='object'?raw:{};
    const sanitizeModule=(value,baseModule)=>{
      const scene=value&&(['surface',...MINE_SCENES].includes(value.scene))?value.scene:baseModule.scene;
      return{...baseModule,scene,depth:scene==='surface'?1:value&&value.depth===2?2:1,x:Number(value&&value.x)||baseModule.x,y:Number(value&&value.y)||baseModule.y,packed:!!(value&&value.packed)};
    };
    fallback.forge=sanitizeModule(source.forge,fallback.forge);fallback.sell=sanitizeModule(source.sell,fallback.sell);
    if(Array.isArray(source.chests)&&source.chests.length){
      fallback.chests=source.chests.map((rawChest,index)=>{
        const chest=sanitizeModule(rawChest,{id:'storage-'+(index+1),kind:'storage',scene:'surface',depth:1,x:335,y:390,packed:true}),items=emptyResourceStore();
        for(const type of Object.keys(items))items[type]=Math.max(0,Math.floor(Number(rawChest&&rawChest.items&&rawChest.items[type])||0));
        chest.id=typeof rawChest.id==='string'&&rawChest.id?rawChest.id:'storage-'+(index+1);chest.items=items;return chest;
      });
    }
    fallback.nextChestId=Math.max(fallback.chests.length+1,Math.floor(Number(source.nextChestId)||0),2);return fallback;
  }

  function defaultState(){
    return{
      gold:0,pickaxeLevel:1,emberMastery:0,drillLevel:0,drillGoalScene:null,movementSpeedLevel:0,nextLootSweepAt:Date.now()+GROUND_DROP_LIFETIME*1000,areaUnlocked:false,discoveredSecond:false,emberdeepUnlocked:false,discoveredThird:false,fourthUnlocked:false,discoveredFourth:false,
      cargo:{stone:0,copper:0,moonglass:0,gold:0,starshard:0,emberstone:0,sunslag:0,astralite:0,crownstone:0,deepstone:0,rootiron:0,ambercore:0,prismite:0,lunacore:0,magmaite:0,furnaceheart:0,voidglass:0,singularity:0,burrowsteel:0,phasecrystal:0,infernium:0},
      mined:{stone:0,copper:0,moonglass:0,gold:0,starshard:0,emberstone:0,sunslag:0,astralite:0,crownstone:0,deepstone:0,rootiron:0,ambercore:0,prismite:0,lunacore:0,magmaite:0,furnaceheart:0,voidglass:0,singularity:0,burrowsteel:0,phasecrystal:0,infernium:0},
      veinsCompleted:{copper_run:0,moonglass_bloom:0,ember_fault:0,starfall_lattice:0},
      starforgeVariant:null,starforgeUnlocked:{crusher:false,swift:false,prospector:false},
      openedChests:{},pendingChestLoot:{},claimedPocketRewards:{},pendingPocketLoot:{},
      clearedMineBarriers:{},terrainDug:{mossMine:[],moonMine:[],emberMine:[],starMine:[],mossMineDepth2:[],moonMineDepth2:[],emberMineDepth2:[],starMineDepth2:[]},discoveredCaverns:{},discoveredDepthEntrances:{},visitedDepths:{},mineDiscovered:false,discoveredMines:{mossMine:false,moonMine:false,emberMine:false,starMine:false},
      base:defaultBaseState(),
      worldSeed:newWorldSeed(),location:{scene:'surface',depth:1,x:330,y:690,surfaceX:330,surfaceY:690},
      totalGold:0,totalSwings:0,precisionHits:0
    };
  }

  function parseStoredState(serialized){
    try{return JSON.parse(serialized||'null')}catch(error){return null}
  }

  function isCompatibleLegacySave(candidate){
    return !!candidate&&typeof candidate==='object'&&Number(candidate.pickaxeLevel)>=1&&candidate.cargo&&candidate.mined&&candidate.terrainDug&&candidate.discoveredMines&&candidate.base;
  }

  function readStoredState(){
    const current=parseStoredState(localStorage.getItem(SAVE_KEY));
    if(current&&typeof current==='object')return current;
    if(typeof localStorage.key!=='function')return null;
    for(let index=0,count=Math.max(0,Number(localStorage.length)||0);index<count;index++){
      const key=localStorage.key(index);
      if(!key||key===SAVE_KEY)continue;
      const serialized=localStorage.getItem(key),candidate=parseStoredState(serialized);
      if(!isCompatibleLegacySave(candidate))continue;
      localStorage.setItem(SAVE_KEY,serialized);
      localStorage.removeItem(key);
      return candidate;
    }
    return null;
  }

  function loadState(){
    try{
      const raw=readStoredState();
      if(!raw||typeof raw!=='object')return defaultState();
      const base=defaultState();
      base.worldSeed=Number.isInteger(raw.worldSeed)&&raw.worldSeed>0?raw.worldSeed>>>0:base.worldSeed;
      base.gold=Math.max(0,Number(raw.gold)||0);
      base.pickaxeLevel=Math.max(1,Math.min(PICKAXES.length-1,Number(raw.pickaxeLevel)||1));
      base.emberMastery=base.pickaxeLevel===PICKAXES.length-1?Math.max(0,Math.min(EMBER_MASTERY.length-1,Number(raw.emberMastery)||0)):0;
      base.drillLevel=Math.max(0,Math.min(DRILLS.length-1,Number(raw.drillLevel)||0));
      base.movementSpeedLevel=Math.max(0,Math.floor(Number(raw.movementSpeedLevel)||0));
      base.nextLootSweepAt=Number.isFinite(Number(raw.nextLootSweepAt))?Number(raw.nextLootSweepAt):base.nextLootSweepAt;
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
      base.base=sanitizeBaseState(raw.base);
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
        for(const depth of [1,2])for(const cavern of discoveriesFor(scene,depth).caverns){
          base.discoveredCaverns[cavern.id]=!!(raw.discoveredCaverns&&raw.discoveredCaverns[cavern.id]);
          const rewardId=cavern.reward.id;base.claimedPocketRewards[rewardId]=!!(raw.claimedPocketRewards&&raw.claimedPocketRewards[rewardId]);
          const pending=raw.pendingPocketLoot&&raw.pendingPocketLoot[rewardId];
          if(pending&&typeof pending==='object'){
            base.pendingPocketLoot[rewardId]={};
            for(const type of Object.keys(base.cargo))if(Number(pending[type])>0)base.pendingPocketLoot[rewardId][type]=Math.floor(Number(pending[type]));
            if(!Object.keys(base.pendingPocketLoot[rewardId]).length)delete base.pendingPocketLoot[rewardId];
          }
        }
        const terrainCellCount=Math.ceil(mine.width/MINE_TILE_SIZE)*Math.ceil(mine.height/MINE_TILE_SIZE);
        for(const depth of [1,2]){
          const key=terrainStateKey(scene,depth),dug=raw.terrainDug&&raw.terrainDug[key];
          if(Array.isArray(dug))base.terrainDug[key]=[...new Set(dug.map(Number).filter(Number.isInteger).filter(index=>index>=0&&index<terrainCellCount))];
        }
        base.discoveredDepthEntrances[scene]=!!(raw.discoveredDepthEntrances&&raw.discoveredDepthEntrances[scene]);
        base.visitedDepths[scene]=!!(raw.visitedDepths&&raw.visitedDepths[scene]);
      }
      base.drillGoalScene=MINE_SCENES.includes(raw.drillGoalScene)?raw.drillGoalScene:MINE_SCENES.find(scene=>base.visitedDepths[scene])||null;
      base.mineDiscovered=base.discoveredMines.mossMine;
      if(raw.location&&MINE_SCENES.includes(raw.location.scene)){
        const mine=MINE_DEFINITIONS[raw.location.scene];
        base.location.scene=mine.unlock(base)?raw.location.scene:'surface';base.location.depth=raw.location.depth===2&&base.discoveredDepthEntrances[raw.location.scene]?2:1;base.location.x=clamp(Number(raw.location.x)||mine.entrance.x,52,mine.width-52);base.location.y=clamp(Number(raw.location.y)||mine.entrance.y,70,mine.height-58);
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
      state.location.scene=currentScene;state.location.depth=currentScene==='surface'?1:currentDepth;state.location.x=player.x;state.location.y=player.y;
      if(currentScene==='surface'){state.location.surfaceX=player.x;state.location.surfaceY=player.y}
      const snapshot=JSON.stringify(state);
      if(force||snapshot!==lastSavedSnapshot){localStorage.setItem(SAVE_KEY,snapshot);lastSavedSnapshot=snapshot}
    }catch(error){}
  }

  function resetProgress(){
    const fresh=defaultState();
    Object.keys(fresh).forEach(key=>state[key]=fresh[key]);
    for(const rock of rocks){rock.hp=rock.maxHp;rock.shell=rock.maxShell;rock.broken=false;rock.respawn=0;rock.hit=0;rock.glintActive=0;rock.glintTimer=1.4+(rock.id%5)*.45;rock.bonusYield=0}
    depthEntrances=createDepthEntrances();rebuildMineTerrain();
    resetVeins();groundDrops.length=0;nextDropId=1;
    pickupBatch.items=Object.create(null);pickupBatch.count=0;pickupBatch.quiet=0;pickupBatch.bestType=null;
    currentScene='surface';currentDepth=1;player.x=330;player.y=690;player.swing=null;player.swingCooldown=0;
    miningFocus.streak=0;miningFocus.timer=0;miningRush.timer=0;miningRush.lastSecond=0;saleMotes.length=0;goldTween=null;displayedGold=0;
    lootSweepCheck=0;lootSweepWarned30=false;lootSweepWarned10=false;
    Object.assign(miningFeedback,{shake:0,shakeTime:0,flash:0,hitStop:0,terrainHitIndex:-1,terrainHitTime:0,lastDiscovery:null,lastDepositBeat:null,lastPocketReward:null});
    lastRegion=-1;activeContext=null;menuShade.hidden=true;inventoryShade.hidden=true;uiDirty=true;saveState(true);showToast('A fresh vein awaits.');
  }

  function resize(){
    const rect=viewport.getBoundingClientRect();
    width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    viewZoom=width<=620?.71:.75;
    viewWidth=width/viewZoom;viewHeight=height/viewZoom;
    dpr=Math.min(2,window.devicePixelRatio||1);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if(lightCanvas){
      lightCanvas.width=Math.max(1,Math.ceil(viewWidth*LIGHTING.bufferScale));
      lightCanvas.height=Math.max(1,Math.ceil(viewHeight*LIGHTING.bufferScale));
    }
    updateCamera(true);
  }

  function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
  function titleCase(value){return String(value).toLowerCase().replace(/\b\w/g,letter=>letter.toUpperCase())}
  function distance(x1,y1,x2,y2){return Math.hypot(x2-x1,y2-y1)}
  function easeOut(t){return 1-Math.pow(1-clamp(t,0,1),3)}
  function easeInOut(t){t=clamp(t,0,1);return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function cargoCount(){return Object.values(state.cargo).reduce((total,amount)=>total+amount,0)}
  function cargoValueTotal(cargo=state.cargo){return Object.keys(cargo).reduce((total,type)=>total+(cargo[type]||0)*ROCK_TYPES[type].value,0)}
  function currentPickaxe(){return PICKAXES[state.pickaxeLevel]}
  function currentMastery(){return EMBER_MASTERY[state.emberMastery]}
  function currentDrill(){return DRILLS[state.drillLevel]||null}
  function currentStarforge(){return !state.drillLevel&&state.starforgeVariant?STARFORGE_VARIANTS[state.starforgeVariant]:null}
  function currentPlayerToolKey(){
    if(state.drillLevel)return['','drill-burrower','drill-pulse','drill-deepcore'][state.drillLevel];
    if(state.starforgeVariant)return'starforge-'+state.starforgeVariant;
    return['','pickaxe-worn','pickaxe-iron','pickaxe-runed','pickaxe-moonglass','pickaxe-ember'][state.pickaxeLevel];
  }
  function hasDeepTool(){return state.drillLevel>0||!!state.starforgeVariant}
  function currentPickaxeName(){const drill=currentDrill(),variant=currentStarforge();return drill?drill.name:variant?variant.name:currentPickaxe().name+(state.emberMastery?' +'+state.emberMastery:'')}
  function currentPower(){const drill=currentDrill();if(drill)return drill.power;const base=state.pickaxeLevel===PICKAXES.length-1?currentMastery().power:currentPickaxe().power,variant=currentStarforge();return variant?Math.round(base*variant.powerMultiplier):base}
  function currentCooldown(){
    const drill=currentDrill(),base=drill?drill.cooldown:state.pickaxeLevel===PICKAXES.length-1?currentMastery().cooldown:currentPickaxe().cooldown,variant=currentStarforge();
    const toolCooldown=!drill&&variant?base*variant.cooldownMultiplier:base;
    return toolCooldown*(miningRush.timer>0?MINING_RUSH_COOLDOWN_MULTIPLIER:1);
  }
  function currentShellPower(){const drill=currentDrill();if(drill)return drill.shellPower;const base=state.pickaxeLevel===PICKAXES.length-1?currentMastery().shellPower:.72,variant=currentStarforge();return variant?base*variant.shellMultiplier:base}
  function currentBonusYieldChance(){const drill=currentDrill();if(drill)return drill.yieldBonus;const base=state.pickaxeLevel<4?0:state.pickaxeLevel===PICKAXES.length-1?currentMastery().bonusYield:.22,variant=currentStarforge();return Math.min(.92,base+(variant?variant.yieldBonus:0))}
  function currentPrecisionDelay(){return state.drillLevel?.62:state.pickaxeLevel===PICKAXES.length-1?currentMastery().precisionDelay:1}
  function movementSpeedMultiplier(level=state.movementSpeedLevel){return 1+Math.max(0,level)*MOVEMENT_SPEED_GAIN}
  function movementSpeedCost(level=state.movementSpeedLevel){return Math.round((150+75*level+25*level*level)/10)*10}
  function terrainStateKey(scene,depth=1){return depth===2?scene+'Depth2':scene}
  function currentMine(){return MINE_DEFINITIONS[currentScene]||null}
  function currentMineVisual(){
    const mine=currentMine();if(!mine)return null;
    return currentDepth===2?{...mine,...MINE_DEPTH_PROFILES[currentScene],style:mine.style+'-deep'}:{...mine,dirt:MINE_DIRT_COLORS[currentScene]};
  }
  function currentWorld(){return currentMine()||WORLD}
  function currentRocks(){return rocksByLocation.get(currentScene+':'+currentDepth)||[]}
  function regionIndexAt(x){return x>=WORLD.starfallGateX?3:x>=WORLD.emberGateX?2:x>=WORLD.gateX?1:0}
  function currentBiome(){const mine=currentMineVisual();return mine?{id:currentDepth===2?mine.id+'Depth2':mine.id,name:mine.name,accent:mine.accent,detail:mine.detail}:BIOMES[regionIndexAt(player.x)]}
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
  function activeMineSolids(){const mine=currentMine();return mine&&currentDepth===1?mine.solids.concat(mine.barriers.filter(barrier=>!mineBarrierCleared(barrier.id))):[]}

  function createDepthEntrances(){
    return Object.fromEntries(MINE_SCENES.map(scene=>{
      const mine=MINE_DEFINITIONS[scene],profile=MINE_DISCOVERY_PROFILES[scene],cols=Math.ceil(mine.width/MINE_TILE_SIZE),rows=Math.ceil(mine.height/MINE_TILE_SIZE);
      const random=seededRandom((state.worldSeed^profile.seed^0x9e3779b9)>>>0),caverns=MINE_DISCOVERIES[scene].caverns.concat(MINE_DEPTH_DISCOVERIES[scene].caverns);
      let col=Math.floor(cols*.5),row=Math.floor(rows*.72);
      for(let attempt=0;attempt<160;attempt++){
        const candidateCol=3+Math.floor(random()*Math.max(1,cols-6)),candidateRow=Math.ceil(1700/MINE_TILE_SIZE)+Math.floor(random()*Math.max(1,rows-Math.ceil(1700/MINE_TILE_SIZE)-7));
        const x=(candidateCol+.5)*MINE_TILE_SIZE,y=(candidateRow+.5)*MINE_TILE_SIZE;
        const nearCavern=caverns.some(cavern=>Math.pow((x-cavern.x)/(cavern.rx+190),2)+Math.pow((y-cavern.y)/(cavern.ry+190),2)<1);
        const nearStructure=mine.solids.some(item=>x>item.x-150&&x<item.x+item.w+150&&y>item.y-150&&y<item.y+item.h+150)||mine.barriers.some(item=>x>item.x-180&&x<item.x+item.w+180&&y>item.y-180&&y<item.y+item.h+180);
        if(!nearCavern&&!nearStructure&&distance(x,y,mine.entrance.x,mine.entrance.y)>700){col=candidateCol;row=candidateRow;break}
      }
      return[scene,{id:scene+'_depth_entrance',scene,x:(col+.5)*MINE_TILE_SIZE,y:(row+.5)*MINE_TILE_SIZE,radius:78}];
    }));
  }

  function depthStations(scene=currentScene){
    const entrance=depthEntrances[scene],mine=MINE_DEFINITIONS[scene];
    return{
      sell:{x:clamp(entrance.x-112,70,mine.width-70),y:clamp(entrance.y-112,90,mine.height-90),radius:88},
      forge:{x:clamp(entrance.x+112,70,mine.width-70),y:clamp(entrance.y-112,90,mine.height-90),radius:88}
    };
  }

  function nextDrill(){return DRILLS[state.drillLevel+1]||null}
  function drillCost(){
    const drill=nextDrill(),recipe=DRILL_RECIPES[state.drillLevel+1];
    return drill&&recipe?{gold:recipe.gold,requirements:recipe.requirements.map(requirement=>({...requirement}))}:null;
  }
  function drillReady(){
    const cost=drillCost();if(!cost)return false;
    return (state.drillLevel>0||!!state.starforgeVariant)&&state.gold>=cost.gold&&cost.requirements.every(requirement=>state.cargo[requirement.type]>=requirement.amount);
  }
  function nextMissingDrillRequirement(cost=drillCost()){
    return cost&&cost.requirements.find(requirement=>state.cargo[requirement.type]<requirement.amount)||null;
  }
  function drillRequirementProgress(requirement){
    return ROCK_TYPES[requirement.type].label.toUpperCase()+' '+Math.min(requirement.amount,state.cargo[requirement.type])+'/'+requirement.amount;
  }

  function protectedDrillCargo(){
    const cost=drillCost(),protectedCargo={};
    if(!cost)return protectedCargo;
    for(const requirement of cost.requirements)protectedCargo[requirement.type]=Math.min(requirement.amount,state.cargo[requirement.type]);
    return protectedCargo;
  }

  function sellableCargo(){
    const protectedCargo=protectedDrillCargo(),sellable={};
    for(const type of Object.keys(state.cargo))sellable[type]=Math.max(0,state.cargo[type]-(protectedCargo[type]||0));
    return sellable;
  }

  function protectedCargoLabel(){
    return Object.entries(protectedDrillCargo()).filter(([,amount])=>amount>0).map(([type,amount])=>amount+' '+ROCK_TYPES[type].label).join(' + ');
  }

  function allBaseModules(){return[state.base.forge,state.base.sell,...state.base.chests]}
  function baseModuleById(id){return allBaseModules().find(module=>module.id===id)||null}
  function moduleIsHere(module){return !!module&&!module.packed&&module.scene===currentScene&&module.depth===currentDepth}
  function canInteractModule(module,range=BASE_MODULE_INTERACT_RADIUS){return moduleIsHere(module)&&distance(player.x,player.y,module.x,module.y)<=range}
  function nearbyStorageChests(range=AUTO_SORT_RADIUS){return state.base.chests.filter(chest=>moduleIsHere(chest)&&distance(player.x,player.y,chest.x,chest.y)<=range)}
  function chestTypeCount(chest){return Object.values(chest.items).filter(amount=>amount>0).length}
  function storageChestCost(){return Math.round(250*Math.pow(1.65,Math.max(0,state.base.chests.length-1))/10)*10}
  function moduleLocationLabel(module){
    if(module.packed)return'PACKED · READY TO PLACE';
    if(module.scene==='surface')return'SURFACE · '+titleCase(BIOMES[regionIndexAt(module.x)].name);
    const mine=MINE_DEFINITIONS[module.scene],name=module.depth===2?MINE_DEPTH_PROFILES[module.scene].name:mine.name;return titleCase(name);
  }
  function nearestBaseModule(){
    let nearest=null,best=BASE_MODULE_INTERACT_RADIUS;
    for(const module of allBaseModules()){
      if(!moduleIsHere(module))continue;const range=distance(player.x,player.y,module.x,module.y);
      if(range<=best){best=range;nearest=module}
    }
    return nearest;
  }
  function findModulePlacement(){
    const candidates=[[player.aimX*86,player.aimY*86],[0,82],[82,0],[-82,0],[0,-82],[58,58],[-58,58]],world=currentWorld();
    for(const [ox,oy] of candidates){
      const x=clamp(player.x+ox,58,world.width-58),y=clamp(player.y+oy,76,world.height-64);
      if(currentMine()&&collidesWithMine(x,y))continue;
      if(allBaseModules().some(module=>moduleIsHere(module)&&distance(x,y,module.x,module.y)<68))continue;
      return{x,y};
    }
    return{x:player.x,y:player.y};
  }
  function placeBaseModule(id){
    const module=baseModuleById(id);if(!module||!module.packed)return false;
    const placement=findModulePlacement();module.scene=currentScene;module.depth=currentDepth;module.x=placement.x;module.y=placement.y;module.packed=false;
    inventoryShade.hidden=true;activeContext=null;uiDirty=true;sound('upgrade');rings.push({x:module.x,y:module.y,age:0,life:.65,radius:22,color:module.kind==='forge'?'#f2a35d':module.kind==='sell'?'#e9cb82':'#8fcf9d'});showToast((module.kind==='storage'?'Storage chest':module.kind==='forge'?'Forge':'Sell Chest')+' placed.');saveState(true);return true;
  }
  function packBaseModule(id){
    const module=baseModuleById(id);if(!module||!canInteractModule(module))return false;
    module.packed=true;activeContext=null;uiDirty=true;sound('pickup',module.kind==='storage'?'gold':'stone');showToast((module.kind==='storage'?'Storage chest':module.kind==='forge'?'Forge':'Sell Chest')+' packed without loss.');saveState(true);if(!inventoryShade.hidden)renderInventory();return true;
  }
  function buyStorageChest(){
    const cost=storageChestCost();if(state.gold<cost){showToast('Need '+(cost-state.gold)+' more gold.');sound('empty');return false}
    const goldBefore=state.gold,id='storage-'+state.base.nextChestId++;state.gold-=cost;state.base.chests.push({id,kind:'storage',scene:currentScene,depth:currentDepth,x:player.x,y:player.y,packed:true,items:emptyResourceStore()});startGoldCount(goldBefore,state.gold);sound('coin');showToast('New 20-type storage chest added to your base.');uiDirty=true;renderInventory();saveState(true);return true;
  }
  function autoSortResources(){
    const chests=nearbyStorageChests(),protectedCargo=protectedDrillCargo();if(!chests.length){showToast('No storage chest nearby.');sound('empty');return 0}
    let moved=0;
    for(const type of Object.keys(state.cargo)){
      let remaining=Math.max(0,state.cargo[type]-(protectedCargo[type]||0));if(!remaining)continue;
      const existing=chests.find(chest=>chest.items[type]>0),target=existing||chests.find(chest=>chestTypeCount(chest)<STORAGE_CHEST_CAPACITY);
      if(!target)continue;target.items[type]+=remaining;state.cargo[type]-=remaining;moved+=remaining;
    }
    if(!moved){showToast('Nothing can be sorted. Drill materials stay with you.');sound('empty');return 0}
    sound('pickup','gold');showToast(moved+' resources sorted into nearby chests.');uiDirty=true;renderInventory();saveState(true);return moved;
  }
  function takeAllFromChest(id){
    const chest=baseModuleById(id);if(!chest||chest.kind!=='storage'||!canInteractModule(chest,AUTO_SORT_RADIUS))return false;
    let moved=0;for(const type of Object.keys(chest.items)){const amount=chest.items[type];if(!amount)continue;state.cargo[type]+=amount;chest.items[type]=0;moved+=amount}
    if(!moved){showToast('This chest is empty.');sound('empty');return false}
    sound('pickup','gold');showToast(moved+' resources returned to your inventory.');uiDirty=true;renderInventory();saveState(true);return true;
  }

  function openInventory(){releaseTouchControls();inventoryShade.hidden=false;renderInventory()}
  function closeInventory(){inventoryShade.hidden=true}

  function renderInventory(){
    const total=cargoCount(),types=Object.values(state.cargo).filter(amount=>amount>0).length,protectedCargo=protectedDrillCargo();inventoryTotal.textContent=String(total);inventoryTypes.textContent=String(types);
    const entries=Object.entries(state.cargo).filter(([,amount])=>amount>0).sort((a,b)=>Number(ROCK_TYPES[b[0]].rare)-Number(ROCK_TYPES[a[0]].rare)||ROCK_TYPES[a[0]].label.localeCompare(ROCK_TYPES[b[0]].label));
    inventoryGrid.innerHTML=entries.length?entries.map(([type,amount])=>{const data=ROCK_TYPES[type],protectedAmount=protectedCargo[type]||0;return'<div class="inventory-slot'+(protectedAmount?' protected':'')+'"><i class="resource-gem" style="--gem-color:'+data.color+';--gem-edge:'+data.edge+'"></i><span>'+data.label+'</span><b>'+amount+'</b></div>'}).join(''):'<div class="inventory-slot empty">Resources you pick up will appear here.</div>';
    const nearby=nearbyStorageChests();autoSortButton.disabled=!nearby.length||!total;autoSortHint.textContent=nearby.length?nearby.length+' CHEST'+(nearby.length===1?'':'S')+' NEARBY':'NO CHEST NEARBY';
    const cost=storageChestCost();buyChestCost.textContent=cost+' GOLD';buyChestButton.disabled=state.gold<cost;
    const modules=allBaseModules();baseModuleList.innerHTML=modules.map(module=>{
      const nearbyModule=canInteractModule(module),nearbyStorage=canInteractModule(module,AUTO_SORT_RADIUS),placedHere=moduleIsHere(module),items=module.kind==='storage'?Object.entries(module.items).filter(([,amount])=>amount>0):[];
      const title=module.kind==='forge'?'Forge':module.kind==='sell'?'Sell Chest':'Storage Chest '+(state.base.chests.indexOf(module)+1);
      const contents=module.kind==='storage'?(items.length?items.map(([type,amount])=>ROCK_TYPES[type].label+' ×'+amount).join(' · '):'Empty · '+chestTypeCount(module)+' / '+STORAGE_CHEST_CAPACITY+' types'):(module.kind==='forge'?'Pickaxe upgrades and Ember Mastery.':'Sell carried resources while protecting drill materials.');
      const action=module.packed?'<button data-base-place="'+module.id+'">PLACE HERE</button>':placedHere&&nearbyModule?'<button class="secondary" data-base-pack="'+module.id+'">PACK</button>':'<button disabled>'+moduleLocationLabel(module)+'</button>';
      const take=module.kind==='storage'&&placedHere&&nearbyStorage?'<button data-chest-take="'+module.id+'"'+(items.length?'':' disabled')+'>TAKE ALL</button>':'';
      return'<article class="base-module"><div class="base-module-head"><h4>'+title+'</h4><small>'+(module.kind==='storage'?chestTypeCount(module)+' / '+STORAGE_CHEST_CAPACITY+' TYPES':'BASE MODULE')+'</small></div><small>'+moduleLocationLabel(module)+'</small><div class="base-module-items">'+contents+'</div><div class="base-module-actions">'+action+take+'</div></article>';
    }).join('');
  }

  function guidePoint(kind,scene,depth,x,y,color,closeRadius=96,extra={}){
    return{kind,scene,depth,x,y,color:color||'#fff0ad',closeRadius,...extra};
  }

  function closestGuideRock(scene,depth,types,exposedOnly=false){
    const wanted=new Set(Array.isArray(types)?types:[types]),candidates=(rocksByLocation.get(scene+':'+depth)||[]).filter(rock=>
      wanted.has(rock.type)&&!rock.broken&&!rock.barrierId&&(!exposedOnly||rockIsExposed(rock))&&rock.requiredPickaxe<=state.pickaxeLevel&&(!rock.requiresDeepTool||hasDeepTool())&&(rock.requiresDrillLevel||0)<=state.drillLevel
    );
    if(!candidates.length)return null;
    const sameLocation=currentScene===scene&&currentDepth===depth,origin=sameLocation?player:scene==='surface'?player:depth===2?depthEntrances[scene]:MINE_DEFINITIONS[scene].entrance;
    candidates.sort((a,b)=>distance(origin.x,origin.y,a.x,a.y)-distance(origin.x,origin.y,b.x,b.y));
    const rock=candidates[0],data=ROCK_TYPES[rock.type];
    return guidePoint('rock',scene,depth,rock.x,rock.y,data.edge,88,{rockId:rock.id,resource:rock.type});
  }

  function resourceGuide(type,scene='surface',depth=1){
    const local=closestGuideRock(currentScene,currentDepth,type,currentScene==='surface');
    if(local)return local;
    return closestGuideRock(scene,depth,type,scene==='surface');
  }

  function surfaceStationGuide(kind,station,color){return guidePoint(kind,'surface',1,station.x,station.y,color,station.radius||116)}
  function baseModuleGuide(kind,color){const module=state.base[kind];return module&&!module.packed?guidePoint(kind,module.scene,module.depth,module.x,module.y,color,BASE_MODULE_INTERACT_RADIUS):null}
  function mineEntranceGuide(scene){const mine=MINE_DEFINITIONS[scene];return guidePoint('mine-entrance','surface',1,mine.surfaceEntrance.x,mine.surfaceEntrance.y,mine.detail,mine.surfaceEntrance.radius,{destination:scene})}
  function depthEntranceGuide(scene){const entrance=depthEntrances[scene];return guidePoint(state.discoveredDepthEntrances[scene]?'depth-entrance':'dig-route',scene,1,entrance.x,entrance.y,MINE_DEPTH_PROFILES[scene].detail,108)}
  function depthForgeGuide(scene){const station=depthStations(scene).forge;return guidePoint('drill-forge',scene,2,station.x,station.y,MINE_DEPTH_PROFILES[scene].detail,station.radius)}

  function routeVisualGuide(target){
    if(!target)return null;
    if(currentScene==='surface')return target.scene==='surface'?target:mineEntranceGuide(target.scene);
    if(target.scene==='surface'||target.scene!==currentScene){
      if(currentDepth===2){const entrance=depthEntrances[currentScene];return guidePoint('depth-exit',currentScene,2,entrance.x,entrance.y,currentMineVisual().detail,108)}
      const entrance=currentMine().entrance;return guidePoint('mine-exit',currentScene,1,entrance.x,entrance.y,currentMineVisual().detail,108);
    }
    if(currentDepth!==target.depth){
      if(target.depth===2)return depthEntranceGuide(currentScene);
      const entrance=depthEntrances[currentScene];return guidePoint('depth-exit',currentScene,2,entrance.x,entrance.y,currentMineVisual().detail,108);
    }
    return target;
  }

  function mineForGoldGuide(){
    if(cargoValueTotal(sellableCargo())>0){
      if(currentScene!=='surface'&&currentDepth===2){const station=depthStations().sell;return guidePoint('sell',currentScene,2,station.x,station.y,currentMineVisual().detail,station.radius)}
      return routeVisualGuide(baseModuleGuide('sell','#f4d68a'));
    }
    const localTypes=currentRocks().filter(rock=>!rock.broken&&rockIsExposed(rock)&&rock.requiredPickaxe<=state.pickaxeLevel&&(!rock.requiresDeepTool||hasDeepTool())&&(rock.requiresDrillLevel||0)<=state.drillLevel).map(rock=>rock.type);
    const local=localTypes.length?closestGuideRock(currentScene,currentDepth,localTypes,true):null;
    return local||routeVisualGuide(closestGuideRock('surface',1,['stone','copper','moonglass','emberstone','astralite'],true));
  }

  function purchaseGuide(cost,target){
    if(state.gold>=cost)return routeVisualGuide(target);
    return mineForGoldGuide();
  }

  function starforgeGuide(){
    const nextId=Object.keys(STARFORGE_VARIANTS).find(id=>!state.starforgeUnlocked[id]);
    if(!nextId)return null;
    const variant=STARFORGE_VARIANTS[nextId],missing=Object.entries(variant.cost).find(([type,amount])=>state.cargo[type]<amount);
    if(missing)return routeVisualGuide(resourceGuide(missing[0],'surface',1));
    return routeVisualGuide(surfaceStationGuide('starforge',STATIONS.starforge,'#d9dcff'));
  }

  function visualGuide(){
    if((state.drillGoalScene||state.drillLevel)&&(state.starforgeVariant||state.drillLevel)){
      const drill=nextDrill(),cost=drillCost();if(!drill||!cost)return null;
      const missing=nextMissingDrillRequirement(cost);
      if(missing)return routeVisualGuide(closestGuideRock(missing.scene,2,missing.type,false));
      if(state.gold<cost.gold)return mineForGoldGuide();
      const forgeScene=currentScene!=='surface'&&currentDepth===2?currentScene:state.visitedDepths.mossMine?'mossMine':MINE_SCENES.find(scene=>state.visitedDepths[scene])||'mossMine';
      return routeVisualGuide(depthForgeGuide(forgeScene));
    }
    if(starforgeMastered())return routeVisualGuide(depthEntranceGuide('mossMine'));
    if(state.emberMastery===5&&!state.fourthUnlocked)return routeVisualGuide(surfaceStationGuide('gate',STATIONS.starfallGate,'#d6d8ff'));
    if(state.fourthUnlocked&&!state.discoveredFourth)return routeVisualGuide(mineEntranceGuide('starMine'));
    if(state.discoveredFourth&&state.mined.astralite===0)return routeVisualGuide(resourceGuide('astralite','surface',1));
    if(state.discoveredFourth&&state.veinsCompleted.starfall_lattice===0){
      const vein=veinById('starfall_lattice'),remaining=surfaceRocks.find(rock=>rock.veinId===vein.id&&!rock.broken);
      if(remaining)return routeVisualGuide(guidePoint('rock','surface',1,remaining.x,remaining.y,vein.color,88,{rockId:remaining.id,resource:remaining.type}));
    }
    if(state.discoveredFourth&&state.mined.crownstone===0)return routeVisualGuide(resourceGuide('crownstone','surface',1));
    if(state.discoveredFourth&&!starforgeMastered())return starforgeGuide();
    if(Object.values(state.mined).every(value=>value===0))return routeVisualGuide(closestGuideRock('surface',1,['stone','copper'],true));
    if(state.totalGold===0)return mineForGoldGuide();
    if(state.pickaxeLevel===1)return purchaseGuide(PICKAXES[2].cost,baseModuleGuide('forge','#f2a35d'));
    if(state.pickaxeLevel===2)return purchaseGuide(PICKAXES[3].cost,baseModuleGuide('forge','#f2a35d'));
    if(!state.areaUnlocked){
      if(state.pickaxeLevel<3)return purchaseGuide(PICKAXES[3].cost,baseModuleGuide('forge','#f2a35d'));
      return purchaseGuide(GATE_COST,surfaceStationGuide('gate',STATIONS.gate,'#9ce7e6'));
    }
    if(!state.discoveredSecond)return routeVisualGuide(mineEntranceGuide('moonMine'));
    if(state.mined.moonglass===0)return routeVisualGuide(resourceGuide('moonglass','surface',1));
    if(state.pickaxeLevel===3)return purchaseGuide(PICKAXES[4].cost,baseModuleGuide('forge','#f2a35d'));
    if(!state.emberdeepUnlocked)return purchaseGuide(EMBER_GATE_COST,surfaceStationGuide('gate',STATIONS.emberGate,'#ff9a68'));
    if(!state.discoveredThird)return routeVisualGuide(mineEntranceGuide('emberMine'));
    if(state.mined.emberstone===0||state.pickaxeLevel===4&&state.mined.emberstone<EMBER_PICKAXE_ORE_REQUIRED)return routeVisualGuide(resourceGuide('emberstone','surface',1));
    if(state.pickaxeLevel===4)return purchaseGuide(PICKAXES[5].cost,baseModuleGuide('forge','#f2a35d'));
    if(state.mined.gold+state.mined.starshard+state.mined.sunslag===0)return routeVisualGuide(resourceGuide('gold','surface',1));
    if(nextMastery()&&state.mined.sunslag<nextMastery().sunslag)return routeVisualGuide(resourceGuide('sunslag','surface',1));
    if(nextMastery())return purchaseGuide(nextMastery().gold,baseModuleGuide('forge','#f2a35d'));
    return null;
  }

  function createMineTerrain(scene,depth=1){
    const mine=MINE_DEFINITIONS[scene],cols=Math.ceil(mine.width/MINE_TILE_SIZE),rows=Math.ceil(mine.height/MINE_TILE_SIZE);
    const stateKey=terrainStateKey(scene,depth),terrain={scene,depth,stateKey,cols,rows,maxHp:depth===2?MINE_DEPTH_PROFILES[scene].terrainHp:MINE_TERRAIN_HP,chunks:new Map(),cleared:new Set(),dug:new Set(state.terrainDug[stateKey]||[]),caverns:[],depthEntrance:null};
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
    const depthEntrance=depthEntrances[scene];
    if(depth===1){
      clearCircle(mine.entrance.x+54,mine.entrance.y,142);
      for(const wall of mine.solids)clearRect(wall.x,wall.y,wall.w,wall.h);
      for(const barrier of mine.barriers)clearRect(barrier.x-125,barrier.y-62,barrier.w+250,barrier.h+124);
    }else clearCircle(depthEntrance.x,depthEntrance.y,215);
    for(const definition of discoveriesFor(scene,depth).caverns){
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
    if(depth===1){
      const shaft={...depthEntrance,cells:[],cellSet:new Set(),boundary:new Set()};
      const minCol=Math.max(0,Math.floor((shaft.x-shaft.radius)/MINE_TILE_SIZE)),maxCol=Math.min(cols-1,Math.floor((shaft.x+shaft.radius)/MINE_TILE_SIZE));
      const minRow=Math.max(0,Math.floor((shaft.y-shaft.radius)/MINE_TILE_SIZE)),maxRow=Math.min(rows-1,Math.floor((shaft.y+shaft.radius)/MINE_TILE_SIZE));
      for(let row=minRow;row<=maxRow;row++)for(let col=minCol;col<=maxCol;col++){
        const x=(col+.5)*MINE_TILE_SIZE,y=(row+.5)*MINE_TILE_SIZE;if(distance(x,y,shaft.x,shaft.y)>shaft.radius)continue;
        const index=row*cols+col;shaft.cells.push(index);shaft.cellSet.add(index);terrain.cleared.add(index);
      }
      for(const index of shaft.cells){
        const col=index%cols,row=Math.floor(index/cols);
        for(const [dc,dr] of [[-1,0],[1,0],[0,-1],[0,1]]){
          const nextCol=col+dc,nextRow=row+dr;if(nextCol<0||nextRow<0||nextCol>=cols||nextRow>=rows)continue;
          const nextIndex=nextRow*cols+nextCol;if(!shaft.cellSet.has(nextIndex)&&!terrain.cleared.has(nextIndex))shaft.boundary.add(nextIndex);
        }
      }
      if([...shaft.boundary].some(index=>terrain.dug.has(index)))state.discoveredDepthEntrances[scene]=true;
      delete shaft.cellSet;terrain.depthEntrance=shaft;
    }
    return terrain;
  }

  function rebuildMineTerrain(){for(const scene of MINE_SCENES)mineTerrain[scene]={1:createMineTerrain(scene,1),2:createMineTerrain(scene,2)}}
  function currentTerrain(){return mineTerrain[currentScene]&&mineTerrain[currentScene][currentDepth]||null}
  function terrainChunkAt(terrain,col,row){
    const chunkCol=Math.floor(col/MINE_CHUNK_CELLS),chunkRow=Math.floor(row/MINE_CHUNK_CELLS),key=chunkCol+','+chunkRow;
    let chunk=terrain.chunks.get(key);if(chunk)return chunk;
    const types=new Uint8Array(MINE_CHUNK_CELLS*MINE_CHUNK_CELLS),hp=new Uint16Array(types.length);
    for(let localRow=0;localRow<MINE_CHUNK_CELLS;localRow++)for(let localCol=0;localCol<MINE_CHUNK_CELLS;localCol++){
      const worldCol=chunkCol*MINE_CHUNK_CELLS+localCol,worldRow=chunkRow*MINE_CHUNK_CELLS+localRow;
      if(worldCol>=terrain.cols||worldRow>=terrain.rows)continue;
      const index=worldRow*terrain.cols+worldCol,localIndex=localRow*MINE_CHUNK_CELLS+localCol;
      if(!terrain.cleared.has(index)&&!terrain.dug.has(index)){types[localIndex]=1;hp[localIndex]=terrain.maxHp}
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
  function discoverDepthEntranceFromCell(terrain,index){
    const entrance=terrain&&terrain.depthEntrance;if(!entrance||state.discoveredDepthEntrances[terrain.scene]||!entrance.boundary.has(index))return null;
    state.discoveredDepthEntrances[terrain.scene]=true;uiDirty=true;return entrance;
  }
  function rockIsExposed(rock){
    if(rock.scene==='surface'||rock.barrierId)return true;
    if(rock.cavernId&&!cavernIsDiscovered(rock.cavernId))return false;
    const terrain=mineTerrain[rock.scene]&&mineTerrain[rock.scene][rock.depth||1],cell=terrainCellAt(terrain,rock.x,rock.y);return !cell||cell.type===0;
  }
  function pocketRewardById(id){for(const scene of MINE_SCENES)for(const depth of [1,2])for(const cavern of discoveriesFor(scene,depth).caverns)if(cavern.reward.id===id)return cavern.reward;return null}
  function pocketRewardLabel(reward){
    if(reward.kind==='cache')return Object.entries(reward.rewards).map(([type,amount])=>amount+' '+ROCK_TYPES[type].label).join(' + ');
    if(reward.kind==='shrine')return 'Mining Rush: 55% faster mining for '+MINING_RUSH_DURATION+' seconds';
    return ROCK_TYPES[reward.type].label+' '+(reward.kind==='crystal'?'cluster':'motherlode');
  }
  function activateMiningRush(){
    miningRush.timer=MINING_RUSH_DURATION;miningRush.lastSecond=Math.ceil(miningRush.timer);uiDirty=true;
  }
  function claimPocketReward(cavern){
    const reward=cavern&&cavern.reward;if(!reward||state.claimedPocketRewards[reward.id])return false;
    if(reward.kind==='crystal'||reward.kind==='motherlode')return false;
    state.claimedPocketRewards[reward.id]=true;
    if(reward.kind==='cache'){
      state.pendingPocketLoot[reward.id]={...reward.rewards};let rewardIndex=0;
      for(const [type,amount] of Object.entries(reward.rewards))spawnGroundDrop(type,amount,cavern.x+(rewardIndex++-1)*18,cavern.y+12,null,currentScene,reward.id,currentDepth);
      sound('chest');
    }else{activateMiningRush();sound('unlock')}
    const visual=currentMineVisual();rings.push({x:cavern.x,y:cavern.y,age:0,life:.85,radius:22,color:visual.detail});
    floaters.push({x:cavern.x,y:cavern.y-48,text:reward.kind==='cache'?'CACHE OPENED':'MINING RUSH',color:visual.detail,age:0,life:1.35,size:17});
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

  function startBackgroundMusic(){
    if(typeof Audio==='undefined')return;
    if(!backgroundMusic){
      backgroundMusic=new Audio(MUSIC_PATH);backgroundMusic.loop=true;backgroundMusic.preload='auto';backgroundMusic.volume=MUSIC_VOLUME;backgroundMusic.playsInline=true;
    }
    if(!backgroundMusic.paused)return;
    const playback=backgroundMusic.play();
    if(playback&&typeof playback.then==='function')playback.then(()=>{musicStarted=true}).catch(()=>{});else musicStarted=true;
  }

  function unlockAudio(){
    startBackgroundMusic();
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
    // Rapid drills need continuous simulation. Repeated hit-stop at drill speed
    // reads as frame loss even when rendering is holding a steady frame rate.
    if(currentDrill())miningFeedback.hitStop=0;
    else miningFeedback.hitStop=Math.max(miningFeedback.hitStop,strength>=7?.065:strength>=4?.038:.016);
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

  function colorWithAlpha(color,alpha){
    const value=String(color||'#ffffff').replace('#','');
    const hex=value.length===3?value.split('').map(part=>part+part).join(''):value;
    const number=parseInt(hex.slice(0,6),16);if(!Number.isFinite(number))return'rgba(255,255,255,'+alpha+')';
    return'rgba('+((number>>16)&255)+','+((number>>8)&255)+','+(number&255)+','+alpha+')';
  }

  function lightBlockedAt(x,y,terrain,solids,world){
    lightingRayChecks++;
    if(x<0||y<0||x>=world.width||y>=world.height)return true;
    if(terrain&&terrainTypeAt(terrain,Math.floor(x/MINE_TILE_SIZE),Math.floor(y/MINE_TILE_SIZE)))return true;
    for(const solid of solids)if(x>=solid.x&&x<=solid.x+solid.w&&y>=solid.y&&y<=solid.y+solid.h)return true;
    return false;
  }

  function traceLightDistance(originX,originY,angle,length,terrain,solids,world){
    const dx=Math.cos(angle),dy=Math.sin(angle),step=LIGHTING.rayStep;
    for(let travelled=step;travelled<=length;travelled+=step){
      if(lightBlockedAt(originX+dx*travelled,originY+dy*travelled,terrain,solids,world))return Math.max(5,travelled-step*.3);
    }
    return length;
  }

  function traceLightPolygon(originX,originY,startAngle,angleSpan,rays,length,terrain,solids,world,traceOriginX=originX,traceOriginY=originY){
    const points=[];
    for(let index=0;index<=rays;index++){
      const angle=startAngle+angleSpan*index/rays,reach=traceLightDistance(traceOriginX,traceOriginY,angle,length,terrain,solids,world);
      points.push(worldToScreen(originX+Math.cos(angle)*reach,originY+Math.sin(angle)*reach));
    }
    return points;
  }

  function fillLightPolygon(target,origin,points,fillStyle){
    if(!points.length)return;
    target.beginPath();target.moveTo(origin.x,origin.y);for(const point of points)target.lineTo(point.x,point.y);target.closePath();target.fillStyle=fillStyle;target.fill();
  }

  function visibleOreLights(terrain,solids,world){
    const lights=[];
    for(const rock of currentRocks()){
      if(rock.broken||!rockIsExposed(rock)||rock.type==='stone'||rock.type==='deepstone')continue;
      const screen=worldToScreen(rock.x,rock.y),data=ROCK_TYPES[rock.type],radius=data.rare?118:data.depth2?96:84;
      if(screen.x+radius<0||screen.y+radius<0||screen.x-radius>viewWidth||screen.y-radius>viewHeight)continue;
      lights.push({worldX:rock.x,worldY:rock.y,x:screen.x,y:screen.y,color:data.edge,radius,intensity:data.rare ? .58 : data.depth2 ? .44 : .36,rare:!!data.rare});
    }
    const centerX=camera.x+viewWidth*.5,centerY=camera.y+viewHeight*.5;
    lights.sort((a,b)=>((a.worldX-centerX)**2+(a.worldY-centerY)**2)-((b.worldX-centerX)**2+(b.worldY-centerY)**2));
    lights.length=Math.min(lights.length,LIGHTING.maxOreLights);
    for(const light of lights)light.points=traceLightPolygon(light.worldX,light.worldY,-Math.PI,Math.PI*2,LIGHTING.oreRays,light.radius,terrain,solids,world);
    return lights;
  }

  function drawMineLighting(){
    if(!lightCtx||!lightCanvas||!currentMine())return;
    const terrain=currentTerrain(),solids=activeMineSolids(),world=currentWorld(),move=updateInputVector();
    const moving=Math.abs(move.x)+Math.abs(move.y)>.02,bob=moving?Math.sin(player.walk)*2:Math.sin(time*2.4)*1.2;
    const aimLength=Math.hypot(player.aimX,player.aimY)||1,dirX=player.aimX/aimLength,dirY=player.aimY/aimLength,angle=Math.atan2(dirY,dirX);
    const originWorld={x:player.x+player.facing*20,y:player.y-58+bob},traceOriginWorld={x:player.x+player.facing*8,y:player.y-12+bob},origin=worldToScreen(originWorld.x,originWorld.y);
    lightingRayChecks=0;
    const ambientPoints=traceLightPolygon(originWorld.x,originWorld.y,-Math.PI,Math.PI*2,LIGHTING.ambientRays,LIGHTING.ambientRadius,terrain,solids,world,traceOriginWorld.x,traceOriginWorld.y);
    const outerPoints=traceLightPolygon(originWorld.x,originWorld.y,angle-LIGHTING.beamHalfAngle,LIGHTING.beamHalfAngle*2,LIGHTING.beamRays,LIGHTING.beamLength,terrain,solids,world,traceOriginWorld.x,traceOriginWorld.y);
    const corePoints=traceLightPolygon(originWorld.x,originWorld.y,angle-LIGHTING.beamCoreHalfAngle,LIGHTING.beamCoreHalfAngle*2,Math.round(LIGHTING.beamRays*.7),LIGHTING.beamLength*.92,terrain,solids,world,traceOriginWorld.x,traceOriginWorld.y);
    const oreLights=visibleOreLights(terrain,solids,world);lightingOreCount=oreLights.length;

    lightCtx.setTransform(1,0,0,1,0,0);lightCtx.clearRect(0,0,lightCanvas.width,lightCanvas.height);
    lightCtx.setTransform(LIGHTING.bufferScale,0,0,LIGHTING.bufferScale,0,0);lightCtx.globalCompositeOperation='source-over';
    lightCtx.fillStyle=currentDepth===2?'rgba(1,2,4,'+LIGHTING.darknessDepth2+')':'rgba(2,4,5,'+LIGHTING.darknessDepth1+')';lightCtx.fillRect(0,0,viewWidth,viewHeight);
    lightCtx.globalCompositeOperation='destination-out';
    const ambient=lightCtx.createRadialGradient(origin.x,origin.y,0,origin.x,origin.y,LIGHTING.ambientRadius);ambient.addColorStop(0,'rgba(0,0,0,.98)');ambient.addColorStop(.52,'rgba(0,0,0,.72)');ambient.addColorStop(1,'rgba(0,0,0,0)');fillLightPolygon(lightCtx,origin,ambientPoints,ambient);
    const beamEnd={x:origin.x+dirX*LIGHTING.beamLength,y:origin.y+dirY*LIGHTING.beamLength};
    const outer=lightCtx.createLinearGradient(origin.x,origin.y,beamEnd.x,beamEnd.y);outer.addColorStop(0,'rgba(0,0,0,.44)');outer.addColorStop(.72,'rgba(0,0,0,.3)');outer.addColorStop(1,'rgba(0,0,0,0)');fillLightPolygon(lightCtx,origin,outerPoints,outer);
    const core=lightCtx.createLinearGradient(origin.x,origin.y,beamEnd.x,beamEnd.y);core.addColorStop(0,'rgba(0,0,0,.9)');core.addColorStop(.68,'rgba(0,0,0,.76)');core.addColorStop(1,'rgba(0,0,0,.08)');fillLightPolygon(lightCtx,origin,corePoints,core);
    for(const light of oreLights){
      const glow=lightCtx.createRadialGradient(light.x,light.y,1,light.x,light.y,light.radius);glow.addColorStop(0,'rgba(0,0,0,'+light.intensity+')');glow.addColorStop(.35,'rgba(0,0,0,'+(light.intensity*.62)+')');glow.addColorStop(1,'rgba(0,0,0,0)');fillLightPolygon(lightCtx,light,light.points,glow);
    }
    lightCtx.globalCompositeOperation='source-over';

    ctx.save();ctx.drawImage(lightCanvas,0,0,lightCanvas.width,lightCanvas.height,0,0,viewWidth,viewHeight);ctx.globalCompositeOperation='screen';
    const warm=ctx.createLinearGradient(origin.x,origin.y,beamEnd.x,beamEnd.y);warm.addColorStop(0,'rgba(255,218,145,.095)');warm.addColorStop(.7,'rgba(255,201,112,.045)');warm.addColorStop(1,'rgba(255,190,95,0)');fillLightPolygon(ctx,origin,corePoints,warm);
    for(const light of oreLights){
      const tint=ctx.createRadialGradient(light.x,light.y,0,light.x,light.y,light.radius);tint.addColorStop(0,colorWithAlpha(light.color,light.rare ? .26 : .18));tint.addColorStop(.34,colorWithAlpha(light.color,light.rare ? .12 : .075));tint.addColorStop(1,colorWithAlpha(light.color,0));fillLightPolygon(ctx,light,light.points,tint);
    }
    const lens=ctx.createRadialGradient(origin.x,origin.y,0,origin.x,origin.y,21);lens.addColorStop(0,'rgba(255,248,201,.95)');lens.addColorStop(.22,'rgba(255,219,139,.52)');lens.addColorStop(1,'rgba(255,192,87,0)');ctx.fillStyle=lens;ctx.fillRect(origin.x-22,origin.y-22,44,44);ctx.restore();
  }

  function updateObjectiveOcclusion(){
    const p=worldToScreen(player.x,player.y),playerX=p.x*viewZoom,playerY=p.y*viewZoom;
    const left=(viewport.clientWidth-objective.offsetWidth)/2,top=objective.offsetTop;
    const overlaps=playerX+40>left&&playerX-40<left+objective.offsetWidth&&playerY+34>top&&playerY-64<top+objective.offsetHeight;
    objective.classList.toggle('player-overlap',overlaps);
  }

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
    if(rock.requiresDrillLevel&&state.drillLevel<rock.requiresDrillLevel){
      const required=DRILLS[rock.requiresDrillLevel];rock.hit=.12;sound('empty');
      floaters.push({x:rock.x,y:rock.y-36,text:required.name.toUpperCase()+' REQUIRED',color:required.color,age:0,life:1,size:12});
      showToast(ROCK_TYPES[rock.type].label+' requires the '+required.name+'.');return;
    }
    if(rock.requiresDeepTool&&!hasDeepTool()){
      rock.hit=.12;sound('empty');floaters.push({x:rock.x,y:rock.y-36,text:'STARFORGE REQUIRED',color:'#e8c98b',age:0,life:.9,size:12});return;
    }
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
    if(currentDepth===2&&!hasDeepTool()){
      sound('empty');floaters.push({x,y:y-28,text:'STARFORGE REQUIRED',color:'#e8c98b',age:0,life:.9,size:12});showToast('Depth 2 stone requires a Starforge pickaxe.');return;
    }
    const hp=Math.max(0,terrainHpAt(terrain,col,row)-currentPower());setTerrainCell(terrain,col,row,type,hp);
    miningFeedback.terrainHitIndex=index;miningFeedback.terrainHitTime=.16;
    const visual=currentMineVisual(),tunnelMaterial=currentDepth===2?'deepstone':'stone';spawnImpact(x,y,tunnelMaterial,currentPower(),false);sound('hit',tunnelMaterial);miningKick(hp>0?2.4:4.2,hp>0?.05:.11,visual.wallEdge,hp>0?8:14);
    if(hp>0)return;
    setTerrainCell(terrain,col,row,0,0);terrain.dug.add(index);
    state.terrainDug[terrain.stateKey].push(index);
    state.mined[tunnelMaterial]++;spawnGroundDrop(tunnelMaterial,1,x,y);spawnBreak(x,y,tunnelMaterial);sound('break',tunnelMaterial);
    floaters.push({x,y:y-22,text:'TUNNEL OPEN',color:'#d8c49a',age:0,life:.72,size:11});
    const cavern=discoverCavernFromCell(terrain,index);
    const depthEntrance=discoverDepthEntranceFromCell(terrain,index);
    if(cavern){
      rings.push({x,y,age:0,life:.95,radius:32,color:visual.detail});
      floaters.push({x,y:y-48,text:'HIDDEN CHAMBER',color:visual.detail,age:0,life:1.5,size:17});
    }
    if(depthEntrance){
      rings.push({x,y,age:0,life:1.05,radius:38,color:visual.detail});
      floaters.push({x,y:y-50,text:'HIDDEN DESCENT',color:visual.detail,age:0,life:1.7,size:18});
      showAreaBanner('DEPTH 2 ENTRANCE');sound('unlock');miningKick(7,.16,visual.detail,24);
    }
    const cellKey=currentScene+':'+currentDepth+':'+index,candidates=(mineRocksByTerrainCell.get(cellKey)||[]).concat(cavern?mineRocksByCavern.get(cavern.id)||[]:[]);
    const revealed=[...new Set(candidates)].filter(rock=>!rock.broken&&rockIsExposed(rock));
    const primaryReveal=revealed.find(rock=>rock.rareFind)||revealed[0];
    if(revealed.length){
      const rock=primaryReveal,data=ROCK_TYPES[rock.type],label=rock.rareFind?'RARE '+data.label.toUpperCase():rock.depositId?data.label.toUpperCase()+' VEIN':data.label.toUpperCase()+' REVEALED';
      spawnDiscoveryBurst(rock,label);
    }
    if((cavern||revealed.length)&&!depthEntrance){
      const rock=primaryReveal,detail=rock?(rock.rareFind?' Rare '+ROCK_TYPES[rock.type].label+' waits inside.':' You struck a '+ROCK_TYPES[rock.type].label+' vein.'):' It was buried in the rock.';
      showToast((cavern?cavern.name+' discovered.':'New deposit uncovered.')+detail);
      if(!revealed.length){sound('unlock');miningKick(6,.12,visual.detail,20)}
    }
    if(depthEntrance)showToast('Hidden descent discovered. Depth 2 is open.');
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
    const bonusType=reward.kind==='crystal'?reward.type:(currentDepth===2?DEPTH2_RESOURCE_PROFILES[currentScene]:MINE_DISCOVERY_PROFILES[currentScene]).main;
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

  function spawnGroundDrop(type,amount,x,y,sourceChest,scene,sourcePocket,depth){
    if(!ROCK_TYPES[type]||amount<=0)return;
    const count=Math.max(1,Math.floor(amount));
    for(let item=0;item<count;item++){
      if(groundDrops.length>=MAX_GROUND_DROPS){
        let oldestIndex=0;
        for(let index=1;index<groundDrops.length;index++)if(groundDrops[index].age>groundDrops[oldestIndex].age)oldestIndex=index;
        discardGroundDrop(oldestIndex);
      }
      const seed=nextDropId++,angle=(seed*2.399963)%6.283,burst=34+(seed%4)*7;
      const dropScene=scene||currentScene,world=MINE_DEFINITIONS[dropScene]||WORLD;
      groundDrops.push({id:seed,type,amount:1,x:clamp(x,GROUND_DROP_EDGE_X,world.width-GROUND_DROP_EDGE_X),y:clamp(y,GROUND_DROP_EDGE_TOP,world.height-GROUND_DROP_EDGE_BOTTOM),z:12,vx:Math.cos(angle)*burst,vy:Math.sin(angle)*burst*.58,vz:92+(seed%5)*9,age:0,settled:false,sourceChest:sourceChest||null,sourcePocket:sourcePocket||null,scene:dropScene,depth:dropScene==='surface'?1:depth||currentDepth});
    }
  }

  function discardPendingDrop(drop){
    if(drop.sourceChest&&state.pendingChestLoot[drop.sourceChest]){
      const pending=state.pendingChestLoot[drop.sourceChest];pending[drop.type]=Math.max(0,(pending[drop.type]||0)-drop.amount);if(!pending[drop.type])delete pending[drop.type];if(!Object.keys(pending).length)delete state.pendingChestLoot[drop.sourceChest];
    }
    if(drop.sourcePocket&&state.pendingPocketLoot[drop.sourcePocket]){
      const pending=state.pendingPocketLoot[drop.sourcePocket];pending[drop.type]=Math.max(0,(pending[drop.type]||0)-drop.amount);if(!pending[drop.type])delete pending[drop.type];if(!Object.keys(pending).length)delete state.pendingPocketLoot[drop.sourcePocket];
    }
  }

  function discardGroundDrop(index){const drop=groundDrops[index];if(!drop)return;discardPendingDrop(drop);groundDrops.splice(index,1)}

  function lootSweepRemaining(){return Math.max(0,(state.nextLootSweepAt-Date.now())/1000)}

  function performGlobalLootSweep(announce=true){
    const cleared=groundDrops.length;groundDrops.length=0;state.pendingChestLoot={};state.pendingPocketLoot={};state.nextLootSweepAt=Date.now()+GROUND_DROP_LIFETIME*1000;
    pickupBatch.items=Object.create(null);pickupBatch.count=0;pickupBatch.quiet=0;pickupBatch.bestType=null;
    lootSweepCheck=Date.now()+250;lootSweepWarned30=false;lootSweepWarned10=false;uiDirty=true;
    if(announce)showToast(cleared?'Global cleanup cleared '+cleared+' loose items.':'Global cleanup complete.');
    saveState(true);return cleared;
  }

  function updateLootSweep(){
    const now=Date.now();if(now<lootSweepCheck)return;lootSweepCheck=now+250;
    const remaining=lootSweepRemaining();
    if(remaining<=0){performGlobalLootSweep(true);return}
    if(remaining<=10&&!lootSweepWarned10){lootSweepWarned10=true;showToast('All loose items clear in 10 seconds.');return}
    if(remaining<=LOOT_SWEEP_WARNING_SECONDS&&!lootSweepWarned30){lootSweepWarned30=true;showToast('Global loot cleanup in 30 seconds.')}
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
      if(drop.scene!==currentScene||drop.depth!==currentDepth)continue;
      if(!drop.settled){
        drop.x+=drop.vx*dt;drop.y+=drop.vy*dt;drop.z+=drop.vz*dt;drop.vz-=330*dt;drop.vx*=Math.pow(.11,dt);drop.vy*=Math.pow(.11,dt);
        if(drop.z<=0){drop.z=0;if(Math.abs(drop.vz)>28){drop.vz=-drop.vz*.27;drop.vx*=.62;drop.vy*=.62}else{drop.vz=0;drop.vx=0;drop.vy=0;drop.settled=true}}
      }
      const world=currentWorld(),safeX=clamp(drop.x,GROUND_DROP_EDGE_X,world.width-GROUND_DROP_EDGE_X),safeY=clamp(drop.y,GROUND_DROP_EDGE_TOP,world.height-GROUND_DROP_EDGE_BOTTOM);
      if(safeX!==drop.x){drop.x=safeX;drop.vx=0}if(safeY!==drop.y){drop.y=safeY;drop.vy=0}
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
      state.location.surfaceX=player.x;state.location.surfaceY=player.y;currentScene=scene;currentDepth=1;
      player.x=mine.entrance.x+85;player.y=mine.entrance.y;state.discoveredMines[scene]=true;state.mineDiscovered=state.discoveredMines.mossMine;
      showAreaBanner(mine.name);showToast(scene==='starMine'?'The stars vanish above you.':'The mountain closes behind you.');
    }else{
      const previousMine=currentMine();
      currentScene='surface';currentDepth=1;player.x=state.location.surfaceX;player.y=state.location.surfaceY;
      showAreaBanner(previousMine?previousMine.surfaceName:currentBiome().name);showToast('Back beneath the open sky.');
    }
    lastRegion=-1;updateCamera(true);uiDirty=true;sound('unlock');saveState(true);
  }

  function transitionMineDepth(depth){
    if(!currentMine()||depth!==1&&depth!==2)return false;
    const entrance=depthEntrances[currentScene];
    if(depth===2&&!state.discoveredDepthEntrances[currentScene])return false;
    releaseTouchControls();player.swing=null;player.swingCooldown=0;particles.length=0;floaters.length=0;rings.length=0;activeContext=null;
    currentDepth=depth;player.x=clamp(entrance.x+92,52,currentMine().width-52);player.y=depth===2?clamp(entrance.y+108,70,currentMine().height-58):entrance.y;
    if(depth===2){
      state.visitedDepths[currentScene]=true;
      if(!state.drillGoalScene)state.drillGoalScene=currentScene;
      showAreaBanner(MINE_DEPTH_PROFILES[currentScene].name);showToast('New materials and the Drill Forge await below.');
    }
    else{showAreaBanner(currentMine().name);showToast('Back in Depth 1.');}
    lastRegion=-1;updateCamera(true);uiDirty=true;sound('unlock');saveState(true);return true;
  }

  function contextAtPlayer(){
    const baseModule=nearestBaseModule();if(baseModule)return'base:'+baseModule.id;
    const mine=currentMine();
    if(mine){
      const depthEntrance=depthEntrances[currentScene];
      if(currentDepth===2&&distance(player.x,player.y,depthEntrance.x,depthEntrance.y)<=118)return'depthExit';
      if(currentDepth===2){
        const stations=depthStations();
        if(distance(player.x,player.y,stations.sell.x,stations.sell.y)<=stations.sell.radius)return'depthSell';
        if(distance(player.x,player.y,stations.forge.x,stations.forge.y)<=stations.forge.radius)return'drillForge';
      }
      if(currentDepth===1&&state.discoveredDepthEntrances[currentScene]&&distance(player.x,player.y,depthEntrance.x,depthEntrance.y)<=118)return'depthEntrance';
      if(currentDepth===1&&distance(player.x,player.y,mine.entrance.x,mine.entrance.y)<=118)return'mineExit';
      return null;
    }
    const chest=nearbyChest();if(chest)return'chest:'+chest.id;
    for(const scene of MINE_SCENES){
      const candidate=MINE_DEFINITIONS[scene],entrance=candidate.surfaceEntrance;
      if(candidate.unlock(state)&&distance(player.x,player.y,entrance.x,entrance.y)<=entrance.radius)return'mineEntrance:'+scene;
    }
    if(distance(player.x,player.y,STATIONS.speedShop.x,STATIONS.speedShop.y)<=STATIONS.speedShop.radius)return'speedShop';
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
    else if(activeContext==='depthEntrance')transitionMineDepth(2);
    else if(activeContext==='depthExit')transitionMineDepth(1);
    else if(activeContext==='depthSell')sellCargo(depthStations().sell);
    else if(activeContext==='drillForge')upgradeDrill();
    else if(activeContext&&activeContext.startsWith('base:')){
      const module=baseModuleById(activeContext.slice(5));
      if(module&&module.kind==='forge')upgradePickaxe();else if(module&&module.kind==='sell')sellCargo(module);else if(module&&module.kind==='storage')openInventory();
    }
    else if(activeContext&&activeContext.startsWith('chest:'))openChest(chestById(activeContext.slice(6)));
    else if(activeContext==='speedShop')buyMovementSpeed();
    else if(activeContext==='gate')unlockArea();
    else if(activeContext==='emberGate')unlockEmberdeep();
    else if(activeContext==='starfallGate')unlockStarfall();
  }

  function performSecondaryContext(){if(activeContext&&activeContext.startsWith('base:'))packBaseModule(activeContext.slice(5))}

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
    if(state.drillLevel){showToast('Your drill has replaced the Starforge pickaxe.');sound('empty');return}
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
      floaters.push({x:player.x,y:player.y+65,text:'DEPTH MASTERED',color:'#fff2b5',age:0,life:2.1,size:21,source:'starforge'});
      showToast('All three Starforge forms mastered.');
    }else{
      floaters.push({x:player.x,y:player.y+65,text:variant.name.toUpperCase(),color:variant.color,age:0,life:1.6,size:18,source:'starforge'});
      showToast(variant.name+' forged. Return here to swap styles.');
    }
    uiDirty=true;saveState();
  }

  function upgradeDrill(){
    const drill=nextDrill(),cost=drillCost();if(!drill){showToast('Deepcore Drill is fully upgraded.');sound('empty');return}
    if(!state.drillLevel&&!state.starforgeVariant){showToast('A forged Starforge pickaxe is required.');sound('empty');return}
    const missing=nextMissingDrillRequirement(cost);
    if(missing){
      showToast('Mine '+ROCK_TYPES[missing.type].label+' in '+DEPTH_ROUTE_LABELS[missing.scene]+'.');sound('empty');return;
    }
    if(state.gold<cost.gold){showToast('Need '+(cost.gold-state.gold)+' more gold.');sound('empty');return}
    state.gold-=cost.gold;for(const requirement of cost.requirements)state.cargo[requirement.type]-=requirement.amount;state.drillLevel++;settleGoldDisplay();
    const station=depthStations().forge;sound('upgrade');rings.push({x:station.x,y:station.y,age:0,life:.9,radius:30,color:drill.color});
    floaters.push({x:player.x,y:player.y-54,text:drill.name.toUpperCase(),color:drill.color,age:0,life:1.7,size:18});
    showToast(drill.name+' forged - new drill-locked materials can now be mined.');uiDirty=true;saveState(true);
  }

  function buyMovementSpeed(){
    const cost=movementSpeedCost();if(state.gold<cost){showToast('Need '+(cost-state.gold)+' more gold.');sound('empty');return false}
    const goldBefore=state.gold;state.gold-=cost;state.movementSpeedLevel++;startGoldCount(goldBefore,state.gold);
    sound('upgrade');rings.push({x:STATIONS.speedShop.x,y:STATIONS.speedShop.y,age:0,life:.72,radius:24,color:'#8ee6a7'});
    floaters.push({x:player.x,y:player.y-48,text:'MOVE SPEED '+movementSpeedMultiplier().toFixed(2)+'x',color:'#bff5c7',age:0,life:1.35,size:16});
    showToast('Permanent movement speed increased. No level cap.');uiDirty=true;saveState(true);return true;
  }

  function sellCargo(station=state.base.sell){
    const soldCargo=sellableCargo(),value=cargoValueTotal(soldCargo),protectedCargo=protectedDrillCargo();
    if(value<=0){
      const protectedCount=Object.values(protectedCargo).reduce((total,amount)=>total+amount,0);
      showToast(protectedCount?'Upgrade materials are protected for '+nextDrill().name+'.':'Your inventory is empty.');sound('empty');return;
    }
    const goldBefore=state.gold;
    state.gold+=value;state.totalGold+=value;
    startGoldCount(goldBefore,state.gold);spawnSaleMotes(soldCargo,station);
    for(const type of Object.keys(state.cargo))state.cargo[type]-=soldCargo[type]||0;
    sound('coin');floaters.push({x:station.x,y:station.y-45,text:'+'+value+' GOLD',color:'#ffd66e',age:0,life:1.35,size:18});
    const kept=Object.values(protectedCargo).reduce((total,amount)=>total+amount,0);
    showToast('Sold for '+value+' gold.'+(kept?' Drill materials kept safe.':''));uiDirty=true;saveState();
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
    if(state.emberMastery<5){showToast('Depth Mastery 5 is required.');sound('empty');return}
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

  function movePlayerBy(dx,dy){
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/PLAYER_MOVE_STEP)),stepX=dx/steps,stepY=dy/steps,world=currentWorld();
    for(let step=0;step<steps;step++){
      let nx=clamp(player.x+stepX,52,world.width-52),ny=clamp(player.y+stepY,70,world.height-58);
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
    }
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
    updateLootSweep(dt);if(!menuShade.hidden||!inventoryShade.hidden)return;
    time+=dt;
    const move=updateInputVector();
    if(Math.abs(move.x)+Math.abs(move.y)>.02){
      const aimLength=Math.hypot(move.x,move.y);if(aimLength>.05){player.aimX=move.x/aimLength;player.aimY=move.y/aimLength}
      movePlayerBy(move.x*PLAYER_SPEED*movementSpeedMultiplier()*dt,move.y*PLAYER_SPEED*movementSpeedMultiplier()*dt);
      player.walk+=dt*9;player.facing=move.x<-.06?-1:(move.x>.06?1:player.facing);
    }
    player.swingCooldown=Math.max(0,player.swingCooldown-dt);
    if(miningFocus.timer>0){
      miningFocus.timer=Math.max(0,miningFocus.timer-dt);
      if(miningFocus.timer===0&&miningFocus.streak){miningFocus.streak=0;uiDirty=true}
    }
    if(miningRush.timer>0){
      miningRush.timer=Math.max(0,miningRush.timer-dt);const second=Math.ceil(miningRush.timer);
      if(second!==miningRush.lastSecond){miningRush.lastSecond=second;uiDirty=true}
      if(miningRush.timer===0){showToast('Mining Rush ended.');uiDirty=true}
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
    updateEffects(dt);updateGoldCount(dt);updateCamera(false);updateObjectiveOcclusion();
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

  function spawnSaleMotes(soldCargo,station=state.base.sell){
    let moteIndex=0;
    for(const type of Object.keys(soldCargo)){
      const amount=soldCargo[type];if(!amount)continue;
      const count=Math.min(4,Math.max(1,Math.ceil(amount/3)));
      for(let index=0;index<count;index++)saleMotes.push({sx:player.x+(index-count/2)*8,sy:player.y-22-index*3,tx:station.x,ty:station.y-20,age:-moteIndex*.045,life:.56,color:ROCK_TYPES[type].edge,size:3+(ROCK_TYPES[type].rare?2:0)});
      moteIndex+=count;
    }
  }

  function mainGoal(){
    if((state.drillGoalScene||state.drillLevel)&&(state.starforgeVariant||state.drillLevel)){
      const drill=nextDrill(),cost=drillCost();
      if(!drill||!cost)return{title:'Deepcore Drill mastered',detail:'THE DRILL AGE IS COMPLETE'};
      const missing=nextMissingDrillRequirement(cost);
      if(missing)return{title:'Mine '+ROCK_TYPES[missing.type].label+' for '+drill.name,detail:DEPTH_ROUTE_LABELS[missing.scene]+' · '+state.cargo[missing.type]+' / '+missing.amount};
      const missingGold=Math.max(0,cost.gold-state.gold);
      if(missingGold)return{title:'Earn gold for the '+drill.name,detail:'NEED '+missingGold+' GOLD'};
      return{title:'Forge the '+drill.name,detail:'READY AT ANY DEPTH 2 DRILL FORGE'};
    }
    if(state.drillLevel)return{title:state.drillLevel===DRILLS.length-1?'Deepcore Drill mastered':'Find a Depth 2 Drill Forge',detail:''};
    if(starforgeMastered())return{title:'Find a hidden Depth 2 entrance',detail:'THE DRILL AGE AWAITS'};
    if(state.emberMastery===5&&!state.fourthUnlocked)return{title:'Open the Starfall Master Seal',detail:''};
    if(state.fourthUnlocked&&!state.discoveredFourth)return{title:'Enter Starfall Depths',detail:''};
    if(state.discoveredFourth&&state.mined.astralite===0)return{title:'Discover Astralite',detail:''};
    if(state.discoveredFourth&&state.veinsCompleted.starfall_lattice===0)return{title:'Clear the Starfall Lattice',detail:''};
    if(state.discoveredFourth&&state.mined.crownstone===0)return{title:'Find a Crownstone vein',detail:''};
    if(state.discoveredFourth&&!state.starforgeVariant)return{title:'Forge a Starfall Pickaxe',detail:''};
    if(state.discoveredFourth&&state.starforgeVariant)return{title:'Forge all three Starforge styles',detail:''};
    if(Object.values(state.mined).every(value=>value===0))return{title:'Hold MINE near a rock',detail:''};
    if(state.totalGold===0)return{title:'Sell your haul at the Sell Chest',detail:''};
    if(state.pickaxeLevel===1)return{title:'Forge an Iron Pickaxe',detail:''};
    if(state.pickaxeLevel===2)return{title:'Forge a Runed Pickaxe',detail:''};
    if(!state.areaUnlocked)return{title:'Open the Moonglass Gate',detail:''};
    if(!state.discoveredSecond)return{title:'Enter the new cavern',detail:''};
    if(state.mined.moonglass===0)return{title:'Discover Moonglass',detail:''};
    if(state.pickaxeLevel===3)return{title:'Forge a Moonglass Pickaxe',detail:''};
    if(!state.emberdeepUnlocked)return{title:'Break the Emberdeep Seal',detail:''};
    if(!state.discoveredThird)return{title:'Enter Emberdeep Foundry',detail:''};
    if(state.mined.emberstone===0)return{title:'Crack an Emberstone shell',detail:''};
    if(state.pickaxeLevel===4&&state.mined.emberstone<EMBER_PICKAXE_ORE_REQUIRED)return{title:'Mine Emberstone',detail:state.mined.emberstone+' / '+EMBER_PICKAXE_ORE_REQUIRED};
    if(state.pickaxeLevel===4)return{title:'Forge the Ember Pickaxe',detail:''};
    if(state.mined.gold+state.mined.starshard+state.mined.sunslag===0)return{title:'Hunt for a rare vein',detail:''};
    if(nextMastery()&&state.mined.sunslag<nextMastery().sunslag)return{title:'Find Sunslag',detail:state.mined.sunslag+' / '+nextMastery().sunslag};
    if(nextMastery())return{title:'Reforge Ember Mastery '+nextMastery().rank,detail:''};
    return{title:'Mine. Sell. Grow stronger.',detail:''};
  }

  function updateUI(){
    uiDirty=false;
    if(!goldTween){displayedGold=state.gold;goldValue.textContent=String(Math.floor(displayedGold))}cargoValue.textContent=String(cargoCount());
    pickaxeName.textContent=currentPickaxeName();powerValue.textContent=String(currentPower());
    game.dataset.pickaxeTier=String(state.pickaxeLevel);
    game.dataset.masteryRank=String(state.emberMastery);
    game.dataset.drillLevel=String(state.drillLevel);
    const drilling=state.drillLevel>0;
    toolKind.textContent=drilling?'YOUR DRILL':'YOUR PICKAXE';mineAction.textContent=drilling?'DRILL':'MINE';mineHint.textContent=miningRush.timer>0?'RUSH '+Math.ceil(miningRush.timer)+'s':'HOLD';mineButton.ariaLabel=drilling?'Drill nearby rock':'Mine nearby rock';
    game.dataset.rushActive=miningRush.timer>0?'true':'false';
    speedValue.textContent=(PICKAXES[1].cooldown/currentCooldown()).toFixed(1)+'x';
    const biome=currentBiome();areaName.textContent=biome.name;game.dataset.biome=biome.id;
    let progress=1,label='DEPTH MASTERED';
    if(currentMine()){
      const mine=currentMine(),cleared=mine.barriers.filter(barrier=>mineBarrierCleared(barrier.id)).length;
      if(currentDepth===2){
        const cost=drillCost();
        if(!hasDeepTool()){progress=0;label='DEPTH 2 - STARFORGE REQUIRED'}
        else if(!cost){progress=1;label='DRILL AGE MASTERED - DEEPCORE TIER 3'}
        else{
          const missing=nextMissingDrillRequirement(cost);
          progress=Math.min(1,state.gold/cost.gold,...cost.requirements.map(requirement=>state.cargo[requirement.type]/requirement.amount));
          label=missing?'NEXT DRILL - '+DEPTH_ROUTE_LABELS[missing.scene]+' - '+drillRequirementProgress(missing):'NEXT DRILL - MATERIALS READY';
        }
      }
      else{progress=cleared/mine.barriers.length;label=mine.name+' - PASSAGES '+cleared+'/'+mine.barriers.length}
    }
    else if(state.drillLevel){progress=state.drillLevel/(DRILLS.length-1);label='DRILL AGE - TIER '+state.drillLevel+'/'+(DRILLS.length-1)}
    else if(starforgeMastered()){progress=1;label='FIND DEPTH 2 - THE DRILL AGE AWAITS'}
    else if(!state.areaUnlocked){progress=Math.min(1,Math.min(state.gold/GATE_COST,state.pickaxeLevel/3));label='MOONGLASS CAVERN'}
    else if(!state.emberdeepUnlocked){progress=Math.min(1,Math.min(state.gold/EMBER_GATE_COST,state.pickaxeLevel/4));label='EMBERDEEP FOUNDRY'}
    else if(state.pickaxeLevel<PICKAXES.length-1){progress=Math.min(1,state.gold/PICKAXES[PICKAXES.length-1].cost,state.mined.emberstone/EMBER_PICKAXE_ORE_REQUIRED);label='EMBER PICKAXE '+Math.min(EMBER_PICKAXE_ORE_REQUIRED,state.mined.emberstone)+'/'+EMBER_PICKAXE_ORE_REQUIRED}
    else if(nextMastery()){
      const next=nextMastery();progress=Math.min(1,state.gold/next.gold,state.mined.sunslag/next.sunslag);label='EMBER MASTERY '+state.emberMastery+'/5 - SUNSLAG '+Math.min(next.sunslag,state.mined.sunslag)+'/'+next.sunslag;
    }else if(!state.fourthUnlocked){progress=0;label='OPEN STARFALL DEPTHS'}
    else if(!state.starforgeVariant){progress=Math.min(1,state.cargo.astralite/5,state.cargo.crownstone/1);label='STARFORGE - ASTRALITE '+Math.min(5,state.cargo.astralite)+'/5 - CROWNSTONE '+Math.min(1,state.cargo.crownstone)+'/1'}
    else{progress=Object.values(state.starforgeUnlocked).filter(Boolean).length/3;label='STARFORGE FORMS '+Object.values(state.starforgeUnlocked).filter(Boolean).length+'/3'}
    unlockFill.style.width=(progress*100)+'%';unlockLabel.textContent=label;
    objective.hidden=false;
    const goal=mainGoal();objectiveText.textContent=goal.title;objectiveDetail.textContent=goal.detail;objectiveDetail.hidden=!goal.detail;
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
    const baseContext=activeContext&&activeContext.startsWith('base:')?baseModuleById(activeContext.slice(5)):null;
    contextPanel.hidden=!activeContext;
    contextPanel.classList.toggle('starforge-open',activeContext==='starforge');
    contextPanel.classList.toggle('chest-context',!!activeContext&&(activeContext.startsWith('chest:')||baseContext&&baseContext.kind==='storage'));
    contextPanel.classList.toggle('mine-context',['mineExit','depthEntrance','depthExit','depthSell','drillForge'].includes(activeContext)||!!activeContext&&activeContext.startsWith('mineEntrance:'));
    contextButton.hidden=false;contextActions.hidden=activeContext==='starforge';contextSecondaryButton.hidden=!baseContext;starforgeChoices.hidden=activeContext!=='starforge';
    if(!activeContext)return;
    if(activeContext.startsWith('mineEntrance:')){
      const mine=MINE_DEFINITIONS[activeContext.slice(13)];
      contextEyebrow.textContent='DUNGEON ENTRANCE';contextTitle.textContent=titleCase(mine.name);contextDetail.textContent='Explore a unique mine layout, clear permanent passages and uncover richer resources.';contextButton.textContent='ENTER';contextButton.disabled=false;
    }else if(activeContext==='mineExit'){
      const mine=currentMine();contextEyebrow.textContent='MINE EXIT';contextTitle.textContent='Return to '+titleCase(mine.surfaceName);contextDetail.textContent='Your cargo and cleared passages are preserved.';contextButton.textContent='LEAVE';contextButton.disabled=false;
    }else if(activeContext==='depthEntrance'){
      contextEyebrow.textContent='HIDDEN DESCENT';contextTitle.textContent=titleCase(MINE_DEPTH_PROFILES[currentScene].name);contextDetail.textContent='Depth 2 has harder dirt, richer veins and its own persistent tunnels.';contextButton.textContent='DESCEND';contextButton.disabled=false;
    }else if(activeContext==='depthExit'){
      contextEyebrow.textContent='RETURN SHAFT';contextTitle.textContent='Return to Depth 1';contextDetail.textContent='This is the only passage between the two depths.';contextButton.textContent='CLIMB';contextButton.disabled=false;
    }else if(activeContext==='depthSell'){
      const value=cargoValueTotal(sellableCargo()),kept=protectedCargoLabel();contextEyebrow.textContent='DEPTH EXCHANGE';contextTitle.textContent=value?value+' gold ready to sell':kept?'Drill materials protected':'Sell Depth 2 Materials';contextDetail.textContent=value?(kept?'Keeping '+kept+' for '+nextDrill().name+'.':'The exchange accepts every mineral.'):kept?'Saved for '+nextDrill().name+'.':'Your inventory is empty.';contextButton.textContent=value?'SELL SAFE':kept?'PROTECTED':'EMPTY';contextButton.disabled=value<=0;
    }else if(activeContext==='drillForge'){
      const drill=nextDrill(),cost=drillCost();contextEyebrow.textContent='DRILL FORGE · TIER '+state.drillLevel+' / '+(DRILLS.length-1);
      if(!drill){contextTitle.textContent='Deepcore Drill';contextDetail.textContent='Maximum drill speed reached.';contextButton.textContent='MASTERED';contextButton.disabled=true}
      else if(!state.drillLevel&&!state.starforgeVariant){contextTitle.textContent=drill.name;contextDetail.textContent='Bring any forged Starforge pickaxe to begin the Drill Age.';contextButton.textContent='STARFORGE REQUIRED';contextButton.disabled=true}
      else{
        const missing=nextMissingDrillRequirement(cost);
        contextTitle.textContent=drill.name;contextDetail.textContent=cost.requirements.map(requirement=>drillRequirementProgress(requirement)).join(' · ')+(missing?' · '+DEPTH_ROUTE_LABELS[missing.scene]:'');
        contextButton.textContent=cost.gold+' GOLD';contextButton.disabled=!drillReady();
      }
    }else if(baseContext&&baseContext.kind==='storage'){
      const types=chestTypeCount(baseContext),total=Object.values(baseContext.items).reduce((sum,amount)=>sum+amount,0);
      contextEyebrow.textContent='STORAGE CHEST · '+types+' / '+STORAGE_CHEST_CAPACITY+' TYPES';contextTitle.textContent=total?total+' resources stored':'Empty Storage Chest';contextDetail.textContent='Open inventory to auto-sort, inspect or take resources.';contextButton.textContent='OPEN';contextButton.disabled=false;contextSecondaryButton.textContent='PACK';contextSecondaryButton.disabled=false;
    }else if(baseContext&&baseContext.kind==='sell'){
      const value=cargoValueTotal(sellableCargo()),kept=protectedCargoLabel();contextEyebrow.textContent='MOVABLE SELL CHEST';contextTitle.textContent=value?value+' gold ready to sell':kept?'Drill materials protected':'Sell Resources';contextDetail.textContent=value?(kept?'Keeping '+kept+' for '+nextDrill().name+'.':'Turn carried resources into gold.'):kept?'Saved for '+nextDrill().name+'.':'Your inventory is empty.';contextButton.textContent=value?'SELL SAFE':kept?'PROTECTED':'EMPTY';contextButton.disabled=value<=0;contextSecondaryButton.textContent='PACK';contextSecondaryButton.disabled=false;
    }else if(activeContext.startsWith('chest:')){
      const chest=chestById(activeContext.slice(6)),ready=chest&&chestRequirementMet(chest);
      if(!chest)return;
      contextEyebrow.textContent=ready?'DISCOVERED CACHE':'SEALED CACHE';contextTitle.textContent=chest.name;
      contextDetail.textContent=ready?chestRewardLabel(chest):'Requires '+chest.requires.label+' - return when your pickaxe is stronger.';
      contextButton.textContent=ready?'OPEN':'LOCKED';contextButton.disabled=!ready;
    }else if(activeContext==='speedShop'){
      const cost=movementSpeedCost(),current=movementSpeedMultiplier(),next=movementSpeedMultiplier(state.movementSpeedLevel+1);
      contextEyebrow.textContent='WAYFARER SHOP · UPGRADE '+(state.movementSpeedLevel+1);contextTitle.textContent='Movement '+current.toFixed(2)+'x → '+next.toFixed(2)+'x';contextDetail.textContent='Permanent movement speed. Unlimited upgrades with rising prices.';contextButton.textContent=cost+' GOLD';contextButton.disabled=state.gold<cost;
    }else if(baseContext&&baseContext.kind==='forge'){
      if(baseContext){contextSecondaryButton.textContent='PACK';contextSecondaryButton.disabled=false}
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
        if(!next){contextEyebrow.textContent='EMBER MASTERY 5 / 5';contextTitle.textContent='Depth Master';contextDetail.textContent=state.fourthUnlocked?'Starfall Depths is open. Astralite now yields to your pickaxe.':'The Starfall Master Seal waits east of Emberdeep.';contextButton.textContent='MASTERED';contextButton.disabled=true}
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
      contextEyebrow.textContent='STARFORGE';contextTitle.textContent=state.drillLevel?'Replaced by '+currentDrill().name:state.starforgeVariant?STARFORGE_VARIANTS[state.starforgeVariant].name:'Choose a final craft';contextDetail.textContent=state.drillLevel?'Drills are the permanent Depth 2 progression.':'Crusher hits harder. Comet strikes faster. Crownseeker finds more ore.';
      starforgeChoices.querySelectorAll('button').forEach(button=>{
        const id=button.dataset.starforge,variant=STARFORGE_VARIANTS[id],unlocked=state.starforgeUnlocked[id],selected=state.starforgeVariant===id;
        button.classList.toggle('selected',selected&&!state.drillLevel);button.disabled=!!state.drillLevel||selected;
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
    document.getElementById('rareMined').textContent=Object.entries(state.mined).filter(([type])=>ROCK_TYPES[type].rare).reduce((total,[,amount])=>total+amount,0);
    document.getElementById('veinsCleared').textContent=Object.values(state.veinsCompleted).reduce((total,value)=>total+value,0);
    document.getElementById('masteryRank').textContent=state.emberMastery+' / 5';
    document.getElementById('deepestFrontier').textContent=state.discoveredFourth?'Starfall':state.discoveredThird?'Emberdeep':state.discoveredSecond?'Moonglass':'Mossvein';
    document.getElementById('starforgeForms').textContent=Object.values(state.starforgeUnlocked).filter(Boolean).length+' / 3';
    document.getElementById('depthOreMined').textContent=Object.entries(state.mined).filter(([type])=>ROCK_TYPES[type].depth2).reduce((total,[,amount])=>total+amount,0);
    document.getElementById('drillTier').textContent=state.drillLevel+' / '+(DRILLS.length-1);
    document.getElementById('movementSpeed').textContent=movementSpeedMultiplier().toFixed(2)+'x · '+state.movementSpeedLevel;
    document.getElementById('chestsOpened').textContent=Object.values(state.openedChests).filter(Boolean).length+' / '+chests.length;
    const totalMineBarriers=MINE_SCENES.reduce((total,scene)=>total+MINE_DEFINITIONS[scene].barriers.length,0);
    document.getElementById('minePassages').textContent=Object.values(state.clearedMineBarriers).filter(Boolean).length+' / '+totalMineBarriers;
    document.getElementById('totalGold').textContent=state.totalGold;
  }

  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    ctx.save();ctx.scale(viewZoom,viewZoom);
    if(currentMine()){
      drawMineGround();drawMineTerrain();drawMineWalls();
      if(currentDepth===1)drawMineEntrance(false,currentMine());
      if(currentDepth===2||state.discoveredDepthEntrances[currentScene])drawDepthEntrance();
      if(currentDepth===2)drawDepthStations();
      drawBaseModules();drawRocks();drawEffects(false);drawGroundDrops();drawPlayer();drawEffects(true);drawMineLighting();drawWorldLabels();drawVisualGuide();
    }else{
      drawGround();drawBiomeStructure();drawDecorations();drawStations();drawSurfaceMineEntrances();drawGate();drawVeins();drawRocks();drawChests();drawWorldLabels();drawVisualGuide();drawEffects(false);drawGroundDrops();drawPlayer();drawEffects(true);
    }
    ctx.restore();
  }

  function drawVisualGuide(){
    const guide=visualGuide();if(!guide)return;
    const range=distance(player.x,player.y,guide.x,guide.y),fadeRange=guide.closeRadius+125;
    if(range<=guide.closeRadius)return;
    const proximity=clamp((range-guide.closeRadius)/(fadeRange-guide.closeRadius),0,1),p=worldToScreen(guide.x,guide.y),margin=62;
    const onScreen=p.x>=margin&&p.y>=margin&&p.x<=viewWidth-margin&&p.y<=viewHeight-margin,pulse=.5+.5*Math.sin(time*2.8);
    ctx.save();ctx.globalAlpha=(.48+.22*pulse)*(.35+.65*proximity);
    if(!onScreen){
      const centerX=viewWidth*.5,centerY=viewHeight*.5,dx=p.x-centerX,dy=p.y-centerY,length=Math.hypot(dx,dy)||1;
      const scale=Math.min((viewWidth*.5-margin)/Math.max(1,Math.abs(dx)),(viewHeight*.5-margin)/Math.max(1,Math.abs(dy)));
      const edgeX=centerX+dx*scale,edgeY=centerY+dy*scale,angle=Math.atan2(dy,dx);
      ctx.translate(edgeX,edgeY);ctx.rotate(angle);ctx.strokeStyle=guide.color;ctx.fillStyle=guide.color;ctx.shadowBlur=10+5*pulse;ctx.shadowColor=guide.color;ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';
      ctx.beginPath();ctx.moveTo(-14,-10);ctx.lineTo(1,0);ctx.lineTo(-14,10);ctx.stroke();
      ctx.globalAlpha*=.48;ctx.beginPath();ctx.moveTo(-28,-8);ctx.lineTo(-17,0);ctx.lineTo(-28,8);ctx.stroke();ctx.restore();return;
    }
    ctx.translate(p.x,p.y-4);ctx.globalCompositeOperation='lighter';
    const glow=ctx.createRadialGradient(0,0,2,0,0,58+8*pulse);glow.addColorStop(0,'rgba(255,249,205,.42)');glow.addColorStop(.35,'rgba(255,224,135,.16)');glow.addColorStop(1,'rgba(255,214,110,0)');ctx.fillStyle=glow;ctx.fillRect(-72,-72,144,144);
    const beam=ctx.createLinearGradient(0,-82,0,18);beam.addColorStop(0,'rgba(255,246,199,0)');beam.addColorStop(.62,'rgba(255,235,166,.08)');beam.addColorStop(1,'rgba(255,237,170,.28)');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(-7-pulse*3,-80);ctx.lineTo(7+pulse*3,-80);ctx.lineTo(20,16);ctx.lineTo(-20,16);ctx.closePath();ctx.fill();
    ctx.strokeStyle=guide.color;ctx.fillStyle='#fff8d7';ctx.shadowBlur=12+8*pulse;ctx.shadowColor=guide.color;ctx.lineWidth=2.5;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.moveTo(0,-12);ctx.lineTo(0,12);ctx.stroke();
    ctx.globalAlpha*=.72;ctx.beginPath();ctx.moveTo(-9,-39);ctx.lineTo(0,-29);ctx.lineTo(9,-39);ctx.stroke();ctx.restore();
  }


  function isMossveinVisual(mine){return !!mine&&String(mine.style).startsWith('moss')}
  function isRootwoundProduction(){return currentScene==='mossMine'&&currentDepth===2}
  function isMoonglassProduction(){return currentScene==='moonMine'&&currentDepth===1}
  function isPrismaticProduction(){return currentScene==='moonMine'&&currentDepth===2}
  function activeMoonProductionArt(){return isPrismaticProduction()?PRISMATIC_ART:isMoonglassProduction()?MOONGLASS_ART:null}
  function mineVisualPass(){return isPrismaticProduction()?'prismatic-production-assets-v1':isMoonglassProduction()?'moonglass-production-assets-v1':isRootwoundProduction()?'rootwound-production-assets-v1':isMossveinVisual(currentMineVisual())?'mossvein-production-art-v2':'legacy'}

  function visualNoise(x,y,salt=0){
    let value=Math.imul((x|0)+salt*101,374761393)^Math.imul((y|0)-salt*53,668265263);
    value=Math.imul(value^(value>>>13),1274126177);return((value^(value>>>16))>>>0)/4294967295;
  }

  function drawMossveinFloorArt(mine,deep){
    const rootwound=deep&&currentScene==='mossMine',image=rootwound?ROOTWOUND_ART.floor:MOSSVEIN_ART.floor;if(!imageReady(image))return false;
    const pattern=(rootwound?ROOTWOUND_ART.floorPattern:MOSSVEIN_ART.floorPattern)||(typeof ctx.createPattern==='function'?ctx.createPattern(image,'repeat'):null);if(!pattern)return false;
    if(rootwound)ROOTWOUND_ART.floorPattern=pattern;else MOSSVEIN_ART.floorPattern=pattern;ctx.save();ctx.globalAlpha=rootwound?1:.72;ctx.fillStyle=pattern;
    ctx.fillRect(camera.x-8,camera.y-8,viewWidth+16,viewHeight+16);ctx.restore();return true;
  }

  function drawMossveinFloorBase(mine){
    const deep=currentDepth===2,rootwound=deep&&currentScene==='mossMine'&&imageReady(ROOTWOUND_ART.floor),base=ctx.createLinearGradient(0,camera.y,0,camera.y+viewHeight);
    base.addColorStop(0,deep?'#1b1713':'#211f19');base.addColorStop(1,deep?'#100e0c':'#151712');
    ctx.fillStyle=base;ctx.fillRect(0,0,mine.width,mine.height);
    const hasArt=drawMossveinFloorArt(mine,deep);
    const ambient=ctx.createRadialGradient(player.x,player.y,35,player.x,player.y,540);
    ambient.addColorStop(0,deep?'rgba(184,119,58,.2)':'rgba(202,149,77,.21)');
    ambient.addColorStop(.42,deep?'rgba(104,65,35,.08)':'rgba(104,84,51,.09)');ambient.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ambient;ctx.fillRect(camera.x-80,camera.y-80,viewWidth+160,viewHeight+160);
    if(hasArt){ctx.fillStyle=rootwound?'rgba(8,5,3,.08)':deep?'rgba(11,8,6,.2)':'rgba(12,15,11,.1)';ctx.fillRect(camera.x-80,camera.y-80,viewWidth+160,viewHeight+160)}
  }

  function drawMossveinFloorDetail(mine){
    const deep=currentDepth===2,spacing=148,startX=Math.max(0,Math.floor(camera.x/spacing)-1)*spacing,endX=Math.min(mine.width,camera.x+viewWidth+spacing);
    const startY=Math.max(0,Math.floor(camera.y/spacing)-1)*spacing,endY=Math.min(mine.height,camera.y+viewHeight+spacing);
    for(let gridY=startY;gridY<=endY;gridY+=spacing)for(let gridX=startX;gridX<=endX;gridX+=spacing){
      const gx=gridX/spacing,gy=gridY/spacing,n=visualNoise(gx,gy,currentDepth+2),n2=visualNoise(gy,gx,17);
      const x=gridX+24+n*96,y=gridY+20+n2*96;
      ctx.save();ctx.translate(x,y);ctx.rotate((n-.5)*1.15);
      if(n>.62){
        ctx.fillStyle=deep?'rgba(103,68,39,.18)':'rgba(73,101,66,.18)';
        ctx.beginPath();ctx.moveTo(-26,-3);ctx.quadraticCurveTo(-12,-16,11,-10);ctx.quadraticCurveTo(31,-4,24,10);ctx.quadraticCurveTo(2,17,-24,8);ctx.closePath();ctx.fill();
        ctx.fillStyle=deep?'rgba(190,124,60,.17)':'rgba(116,151,88,.2)';
        for(let leaf=0;leaf<3;leaf++){ctx.beginPath();ctx.ellipse(-11+leaf*10,-2+(leaf%2)*5,7,2.8,leaf*.48,0,Math.PI*2);ctx.fill()}
      }else{
        ctx.fillStyle=deep?'rgba(102,77,55,.27)':'rgba(105,111,91,.23)';ctx.strokeStyle=deep?'rgba(181,124,72,.16)':'rgba(164,159,123,.14)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(-13,-4);ctx.lineTo(-4,-11);ctx.lineTo(14,-5);ctx.lineTo(11,7);ctx.lineTo(-9,9);ctx.closePath();ctx.fill();ctx.stroke();
        if(n<.3){ctx.fillStyle=deep?'rgba(134,93,54,.18)':'rgba(59,75,56,.22)';ctx.beginPath();ctx.ellipse(18,11,19,7,.25,0,Math.PI*2);ctx.fill()}
      }
      ctx.restore();
    }
    const crackSpacing=226,startCrackY=Math.max(0,Math.floor(camera.y/crackSpacing)-1)*crackSpacing;
    ctx.strokeStyle=deep?'rgba(161,105,61,.19)':'rgba(109,124,91,.15)';ctx.lineWidth=1.35;ctx.lineCap='round';
    for(let y=startCrackY;y<camera.y+viewHeight+crackSpacing;y+=crackSpacing){
      const band=Math.floor(y/crackSpacing),startCrackX=Math.floor(camera.x/crackSpacing-1)*crackSpacing;
      for(let x=startCrackX;x<camera.x+viewWidth+crackSpacing;x+=crackSpacing){
        const anchor=x+visualNoise(x/crackSpacing,band,9)*96;
        ctx.beginPath();ctx.moveTo(anchor,y);ctx.lineTo(anchor+18,y-8);ctx.lineTo(anchor+31,y+2);ctx.lineTo(anchor+52,y-13);ctx.stroke();
      }
    }
  }

  function mossveinConcealedCells(terrain){
    const cacheKey=terrain.caverns.map(cavern=>cavernIsDiscovered(cavern.id)?'1':'0').join('')+(terrain.depthEntrance&&state.discoveredDepthEntrances[currentScene]?'1':'0');
    if(terrain._mossConcealedKey===cacheKey&&terrain._mossConcealedCells)return terrain._mossConcealedCells;
    const concealed=new Set();
    for(const cavern of terrain.caverns)if(!cavernIsDiscovered(cavern.id))for(const index of cavern.cells)concealed.add(index);
    if(terrain.depthEntrance&&!state.discoveredDepthEntrances[currentScene])for(const index of terrain.depthEntrance.cells)concealed.add(index);
    terrain._mossConcealedKey=cacheKey;terrain._mossConcealedCells=concealed;return concealed;
  }

  function mossveinVisualSolidAt(terrain,concealed,col,row){
    if(col<0||row<0||col>=terrain.cols||row>=terrain.rows)return false;
    return !!terrainTypeAt(terrain,col,row)||concealed.has(row*terrain.cols+col);
  }

  function mineralHintAtTerrainCell(terrain,concealed,col,row){
    if(!terrainTypeAt(terrain,col,row))return null;
    const index=row*terrain.cols+col,key=terrain.scene+':'+terrain.depth+':'+index;
    const candidates=(mineRocksByTerrainCell.get(key)||[]).filter(rock=>!rock.broken&&!rock.barrierId&&!rockIsExposed(rock));
    if(!candidates.length)return null;
    const sides=[
      !mossveinVisualSolidAt(terrain,concealed,col,row-1),
      !mossveinVisualSolidAt(terrain,concealed,col+1,row),
      !mossveinVisualSolidAt(terrain,concealed,col,row+1),
      !mossveinVisualSolidAt(terrain,concealed,col-1,row)
    ].map((open,side)=>open?side:-1).filter(side=>side>=0);
    if(!sides.length)return null;
    const rock=candidates.find(item=>ROCK_TYPES[item.type].rare)||candidates[0];return{index,rock,sides};
  }

  function currentMineralHints(){
    const terrain=currentTerrain(),mine=currentMine();if(!terrain||!isMossveinVisual(mine)&&currentScene!=='moonMine')return[];
    const concealed=mossveinConcealedCells(terrain),hints=[];
    for(const rock of currentRocks()){
      if(rock.broken||rock.barrierId||rockIsExposed(rock))continue;
      const cell=terrainCellAt(terrain,rock.x,rock.y),hint=cell&&mineralHintAtTerrainCell(terrain,concealed,cell.col,cell.row);
      if(hint&&hint.rock.id===rock.id)hints.push(hint);
    }
    return hints;
  }

  function drawMossveinTerrainTexture(deep){
    const spacing=126,startX=Math.floor(camera.x/spacing-1)*spacing,endX=camera.x+viewWidth+spacing;
    const startY=Math.floor(camera.y/spacing-1)*spacing,endY=camera.y+viewHeight+spacing;
    for(let gy=startY;gy<=endY;gy+=spacing)for(let gx=startX;gx<=endX;gx+=spacing){
      const cx=gx+visualNoise(gx/spacing,gy/spacing,31)*96,cy=gy+visualNoise(gy/spacing,gx/spacing,37)*94;
      const n=visualNoise(gx/spacing,gy/spacing,43),w=52+n*46,h=29+n*25;
      ctx.save();ctx.translate(cx,cy);ctx.rotate((n-.5)*.7);
      ctx.fillStyle=deep?(n>.5?'rgba(141,91,48,.2)':'rgba(80,57,40,.24)'):(n>.5?'rgba(126,111,72,.2)':'rgba(67,76,57,.24)');
      ctx.beginPath();ctx.moveTo(-w*.55,-h*.08);ctx.quadraticCurveTo(-w*.26,-h*.58,w*.18,-h*.42);ctx.lineTo(w*.55,-h*.04);ctx.quadraticCurveTo(w*.28,h*.52,-w*.18,h*.46);ctx.closePath();ctx.fill();
      ctx.strokeStyle=deep?'rgba(211,145,77,.12)':'rgba(185,174,122,.12)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-w*.38,0);ctx.quadraticCurveTo(0,-h*.35,w*.38,-h*.05);ctx.stroke();
      if(!deep&&n>.72){ctx.fillStyle='rgba(91,135,70,.28)';ctx.beginPath();ctx.ellipse(-w*.12,-h*.2,18,4.5,-.15,0,Math.PI*2);ctx.fill()}
      ctx.restore();
    }
    ctx.strokeStyle=deep?'rgba(203,132,69,.095)':'rgba(181,166,111,.085)';ctx.lineWidth=3;ctx.lineCap='round';
    const bandStart=Math.floor(camera.y/310-1)*310;
    for(let y=bandStart;y<camera.y+viewHeight+310;y+=310){const drift=visualNoise(y/310,8,51)*65;ctx.beginPath();ctx.moveTo(camera.x-60,y+drift);ctx.bezierCurveTo(camera.x+viewWidth*.3,y-32+drift,camera.x+viewWidth*.7,y+38+drift,camera.x+viewWidth+60,y-4+drift);ctx.stroke()}
  }

  function drawRootwoundTerrainTexture(){
    const image=ROOTWOUND_ART.floor;if(!imageReady(image))return false;
    const pattern=ROOTWOUND_ART.floorPattern||(typeof ctx.createPattern==='function'?ctx.createPattern(image,'repeat'):null);if(!pattern)return false;
    ROOTWOUND_ART.floorPattern=pattern;ctx.save();ctx.translate(-camera.x,-camera.y);ctx.globalAlpha=.46;ctx.fillStyle=pattern;ctx.fillRect(camera.x-64,camera.y-64,viewWidth+128,viewHeight+128);ctx.globalAlpha=1;ctx.fillStyle='rgba(18,10,7,.48)';ctx.fillRect(camera.x-64,camera.y-64,viewWidth+128,viewHeight+128);ctx.restore();return true;
  }

  function cutMossveinCorner(x,y,corner,deep){
    const size=12;ctx.fillStyle=deep?'#1b1612':'#1a231b';ctx.beginPath();
    if(corner==='tl'){ctx.moveTo(x,y);ctx.lineTo(x+size,y);ctx.quadraticCurveTo(x+3,y+3,x,y+size)}
    else if(corner==='tr'){ctx.moveTo(x+MINE_TILE_SIZE,y);ctx.lineTo(x+MINE_TILE_SIZE-size,y);ctx.quadraticCurveTo(x+MINE_TILE_SIZE-3,y+3,x+MINE_TILE_SIZE,y+size)}
    else if(corner==='br'){ctx.moveTo(x+MINE_TILE_SIZE,y+MINE_TILE_SIZE);ctx.lineTo(x+MINE_TILE_SIZE-size,y+MINE_TILE_SIZE);ctx.quadraticCurveTo(x+MINE_TILE_SIZE-3,y+MINE_TILE_SIZE-3,x+MINE_TILE_SIZE,y+MINE_TILE_SIZE-size)}
    else{ctx.moveTo(x,y+MINE_TILE_SIZE);ctx.lineTo(x+size,y+MINE_TILE_SIZE);ctx.quadraticCurveTo(x+3,y+MINE_TILE_SIZE-3,x,y+MINE_TILE_SIZE-size)}
    ctx.closePath();ctx.fill();
  }

  function drawMossveinEdge(x,y,side,noise,deep){
    const bend=(noise-.5)*12;ctx.beginPath();
    if(side==='top'){ctx.moveTo(x-3,y+1);ctx.quadraticCurveTo(x+MINE_TILE_SIZE*.5,y+bend,x+MINE_TILE_SIZE+3,y+1)}
    else if(side==='right'){ctx.moveTo(x+MINE_TILE_SIZE-1,y-3);ctx.quadraticCurveTo(x+MINE_TILE_SIZE+bend,y+MINE_TILE_SIZE*.5,x+MINE_TILE_SIZE-1,y+MINE_TILE_SIZE+3)}
    else if(side==='bottom'){ctx.moveTo(x+MINE_TILE_SIZE+3,y+MINE_TILE_SIZE-1);ctx.quadraticCurveTo(x+MINE_TILE_SIZE*.5,y+MINE_TILE_SIZE-bend,x-3,y+MINE_TILE_SIZE-1)}
    else{ctx.moveTo(x+1,y+MINE_TILE_SIZE+3);ctx.quadraticCurveTo(x-bend,y+MINE_TILE_SIZE*.5,x+1,y-3)}
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(0,2,1,.68)';ctx.lineWidth=15;ctx.stroke();
    ctx.strokeStyle=deep?'rgba(48,30,20,.72)':'rgba(25,30,25,.7)';ctx.lineWidth=3;ctx.stroke();
  }

  function drawMossveinWallArt(terrain,concealed,visible,deep){
    const image=deep&&isRootwoundProduction()?ROOTWOUND_ART.wall:MOSSVEIN_ART.wall;if(!imageReady(image))return false;
    const placements=[],used=new Set();
    for(const cell of visible){
      if(!cell.actual)continue;
      const {col,row}=cell,open=[
        !mossveinVisualSolidAt(terrain,concealed,col,row-1),
        !mossveinVisualSolidAt(terrain,concealed,col+1,row),
        !mossveinVisualSolidAt(terrain,concealed,col,row+1),
        !mossveinVisualSolidAt(terrain,concealed,col-1,row)
      ];
      for(let side=0;side<4;side++){
        if(!open[side])continue;
        const key=side%2===0?side+':'+row+':'+Math.floor(col/2):side+':'+col+':'+Math.floor(row/2);
        if(used.has(key))continue;used.add(key);placements.push({col,row,side});
      }
    }
    ctx.save();ctx.beginPath();
    for(const cell of visible){if(!cell.actual)continue;const x=cell.col*MINE_TILE_SIZE-camera.x,y=cell.row*MINE_TILE_SIZE-camera.y;ctx.rect(x-10,y-10,MINE_TILE_SIZE+20,MINE_TILE_SIZE+20)}
    ctx.clip();ctx.globalAlpha=deep?1:.98;
    for(const item of placements){
      const n=visualNoise(item.col,item.row,181),rootwound=deep&&isRootwoundProduction(),width=rootwound?176+n*24:164+n*22,height=width*(image.naturalHeight/image.naturalWidth);
      let x=(item.col+.5)*MINE_TILE_SIZE-camera.x,y=(item.row+.5)*MINE_TILE_SIZE-camera.y,rotation=0;
      if(item.side===0){y-=MINE_TILE_SIZE*.36;rotation=Math.PI}
      else if(item.side===1){x+=MINE_TILE_SIZE*.36;rotation=-Math.PI*.5}
      else if(item.side===2){y+=MINE_TILE_SIZE*.36}
      else{x-=MINE_TILE_SIZE*.36;rotation=Math.PI*.5}
      ctx.save();ctx.translate(x,y);ctx.rotate(rotation+(n-.5)*.05);if(n>.52)ctx.scale(-1,1);ctx.drawImage(image,-width*.5,-height*.48,width,height);ctx.restore();
    }
    ctx.restore();return true;
  }

  function drawMossveinDamage(x,y,damage,noise){
    if(damage<=0)return;const stage=Math.max(1,Math.min(3,Math.ceil(damage*3))),cx=x+MINE_TILE_SIZE*.5,cy=y+MINE_TILE_SIZE*.5;
    ctx.strokeStyle='#17130e';ctx.globalAlpha=.62+.1*stage;ctx.lineWidth=1.5+stage*.75;ctx.lineCap='round';ctx.beginPath();
    ctx.moveTo(cx,cy);ctx.lineTo(x+7+noise*9,y+5);ctx.moveTo(cx,cy);ctx.lineTo(x+MINE_TILE_SIZE-6,y+12+noise*12);
    if(stage>=2){ctx.moveTo(cx,cy);ctx.lineTo(x+11,y+MINE_TILE_SIZE-5);ctx.moveTo(cx-2,cy-2);ctx.lineTo(x+5,y+25)}
    if(stage>=3){ctx.moveTo(cx,cy);ctx.lineTo(x+MINE_TILE_SIZE-5,y+MINE_TILE_SIZE-6);ctx.moveTo(cx+6,cy+4);ctx.lineTo(x+MINE_TILE_SIZE-3,y+30)}ctx.stroke();ctx.globalAlpha=1;
  }

  function drawMossveinTarget(x,y){
    const pulse=.5+.5*Math.sin(time*5);ctx.save();ctx.translate(x+MINE_TILE_SIZE*.5,y+MINE_TILE_SIZE*.5);
    ctx.strokeStyle='#f1ca73';ctx.lineWidth=2.2;ctx.lineCap='round';ctx.shadowBlur=8+5*pulse;ctx.shadowColor='#e4b75d';ctx.globalAlpha=.58+.28*pulse;
    ctx.beginPath();ctx.moveTo(-13,-5);ctx.lineTo(-4,-10);ctx.lineTo(2,-2);ctx.lineTo(12,-8);ctx.moveTo(-5,12);ctx.lineTo(1,3);ctx.lineTo(11,7);ctx.stroke();ctx.restore();
  }

  function drawMossveinMineralHint(x,y,side,rock){
    const rootwoundImage=isRootwoundProduction()?(rock.type==='rootiron'&&imageReady(ROOTWOUND_ART.rootironWall)?ROOTWOUND_ART.rootironWall:ROOTWOUND_ART.nodes[rock.type]):null;
    if(imageReady(rootwoundImage)){
      ctx.save();ctx.translate(x+MINE_TILE_SIZE*.5,y+MINE_TILE_SIZE*.5);ctx.rotate(side*Math.PI*.5);
      ctx.beginPath();ctx.rect(-MINE_TILE_SIZE*.5,-MINE_TILE_SIZE*.5,MINE_TILE_SIZE,MINE_TILE_SIZE);ctx.clip();
      const maxHeight=rock.type==='rootiron'?74:58,scale=maxHeight/rootwoundImage.naturalHeight,width=rootwoundImage.naturalWidth*scale,height=rootwoundImage.naturalHeight*scale;
      ctx.drawImage(rootwoundImage,-width*.5,-MINE_TILE_SIZE*.58,width,height);ctx.restore();return;
    }
    const production=MINERAL_ART[rock.type];
    if(production&&production.wall){
      const image=production.wall;if(imageReady(image)){
        ctx.save();ctx.translate(x+MINE_TILE_SIZE*.5,y+MINE_TILE_SIZE*.5);ctx.rotate(side*Math.PI*.5);
        ctx.beginPath();ctx.rect(-MINE_TILE_SIZE*.5,-MINE_TILE_SIZE*.5,MINE_TILE_SIZE,MINE_TILE_SIZE);ctx.clip();ctx.globalAlpha=.88;
        const width=20,height=31;ctx.drawImage(image,-width*.5,-MINE_TILE_SIZE*.5,width,height);ctx.restore();
      }
      return;
    }
    const data=ROCK_TYPES[rock.type],rare=!!data.rare,seed=visualNoise(rock.id,side,211),bend=(seed-.5)*5;
    ctx.save();ctx.translate(x+MINE_TILE_SIZE*.5,y+MINE_TILE_SIZE*.5);ctx.rotate(side*Math.PI*.5);ctx.scale(.8,.8);
    ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    ctx.moveTo(-17,-24);ctx.bezierCurveTo(-15+bend,-20,-12,-15,-7,-13);ctx.bezierCurveTo(-2,-11,0,-7,6,-6);ctx.quadraticCurveTo(10,-5,14,-1);
    ctx.moveTo(-8,-13);ctx.quadraticCurveTo(-3,-19,4+bend*.4,-19);ctx.moveTo(3,-7);ctx.quadraticCurveTo(8,-12,14,-10+bend*.25);
    ctx.strokeStyle='rgba(3,5,4,.92)';ctx.lineWidth=rare?8:7;ctx.stroke();
    ctx.strokeStyle=data.edge;ctx.lineWidth=rare?3.2:2.65;ctx.shadowColor=data.edge;ctx.shadowBlur=rare?7:3;ctx.globalAlpha=rare?.78:.66;ctx.stroke();ctx.shadowBlur=0;
    const pockets=[[-14,-21,4.2],[-8,-14,3.5],[-1,-10,4.4],[5,-7,3.4],[4,-18,3.2],[12,-9,2.8]];
    for(let chip=0;chip<pockets.length;chip++){
      const pocket=pockets[chip],noise=visualNoise(rock.id+chip*19,side,227),size=pocket[2]*(.82+noise*.38);
      ctx.save();ctx.translate(pocket[0]+(noise-.5)*3,pocket[1]+(visualNoise(chip,rock.id,229)-.5)*2);ctx.rotate((noise-.5)*1.1);
      ctx.fillStyle=data.accent;ctx.strokeStyle=data.edge;ctx.lineWidth=rare?1.55:1.15;ctx.globalAlpha=rare?.86:.7;
      ctx.beginPath();ctx.moveTo(-size*.75,-size*.42);ctx.lineTo(-size*.12,-size);ctx.lineTo(size*.82,-size*.28);ctx.lineTo(size*.62,size*.68);ctx.lineTo(-size*.38,size*.88);ctx.lineTo(-size,size*.15);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle=data.edge;ctx.globalAlpha=.58;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-size*.18,-size*.72);ctx.lineTo(size*.18,size*.48);ctx.stroke();ctx.restore();
    }
    ctx.restore();
  }

  function drawMossveinTerrain(mine,terrain,startCol,endCol,startRow,endRow,target){
    const deep=currentDepth===2,concealed=mossveinConcealedCells(terrain),visible=[];
    for(let row=startRow;row<=endRow;row++)for(let col=startCol;col<=endCol;col++){
      const index=row*terrain.cols+col;if(mossveinVisualSolidAt(terrain,concealed,col,row))visible.push({index,col,row,actual:!!terrainTypeAt(terrain,col,row)});
    }
    ctx.save();ctx.fillStyle=deep?'#211710':'#171b17';ctx.beginPath();
    for(const cell of visible){const x=cell.col*MINE_TILE_SIZE-camera.x,y=cell.row*MINE_TILE_SIZE-camera.y;ctx.rect(x-.7,y-.7,MINE_TILE_SIZE+1.4,MINE_TILE_SIZE+1.4)}
    ctx.fill();ctx.clip();if(!(deep&&isRootwoundProduction()&&drawRootwoundTerrainTexture()))drawMossveinTerrainTexture(deep);ctx.restore();
    for(const cell of visible){
      if(!cell.actual)continue;
      const {index,col,row}=cell,x=col*MINE_TILE_SIZE-camera.x,y=row*MINE_TILE_SIZE-camera.y;
      const top=!mossveinVisualSolidAt(terrain,concealed,col,row-1),right=!mossveinVisualSolidAt(terrain,concealed,col+1,row),bottom=!mossveinVisualSolidAt(terrain,concealed,col,row+1),left=!mossveinVisualSolidAt(terrain,concealed,col-1,row);
      if(top&&left)cutMossveinCorner(x,y,'tl',deep);if(top&&right)cutMossveinCorner(x,y,'tr',deep);if(bottom&&right)cutMossveinCorner(x,y,'br',deep);if(bottom&&left)cutMossveinCorner(x,y,'bl',deep);
      const noise=visualNoise(col,row,deep?67:61);if(top)drawMossveinEdge(x,y,'top',noise,deep);if(right)drawMossveinEdge(x,y,'right',1-noise,deep);if(bottom)drawMossveinEdge(x,y,'bottom',visualNoise(row,col,71),deep);if(left)drawMossveinEdge(x,y,'left',visualNoise(row,col,73),deep);
      drawMossveinDamage(x,y,1-terrainHpAt(terrain,col,row)/terrain.maxHp,noise);
      if(miningFeedback.terrainHitIndex===index&&miningFeedback.terrainHitTime>0){ctx.globalAlpha=miningFeedback.terrainHitTime/.16*.18;ctx.fillStyle=mine.wallEdge;ctx.fillRect(x+2,y+2,MINE_TILE_SIZE-4,MINE_TILE_SIZE-4);ctx.globalAlpha=1}
      if(target&&target.index===index)drawMossveinTarget(x,y);
    }
    drawMossveinWallArt(terrain,concealed,visible,deep);
    for(const cell of visible){
      if(!cell.actual)continue;const hint=mineralHintAtTerrainCell(terrain,concealed,cell.col,cell.row);if(!hint)continue;
      const x=cell.col*MINE_TILE_SIZE-camera.x,y=cell.row*MINE_TILE_SIZE-camera.y;
      for(const side of hint.sides)drawMossveinMineralHint(x,y,side,hint.rock);
    }
  }

  function drawMossveinSolidWall(mine,wall,p){
    ctx.save();ctx.translate(p.x,p.y);const deep=currentDepth===2,base=ctx.createLinearGradient(0,0,wall.w,wall.h);
    base.addColorStop(0,deep?'#3b2c21':'#33382e');base.addColorStop(1,deep?'#1b1511':'#1b211b');ctx.fillStyle=base;ctx.fillRect(0,0,wall.w,wall.h);
    ctx.beginPath();ctx.rect(0,0,wall.w,wall.h);ctx.clip();const spacing=92;
    for(let y=-40;y<wall.h+60;y+=spacing)for(let x=-40;x<wall.w+60;x+=spacing){
      const n=visualNoise(x/spacing,y/spacing,83),w=66+n*42,h=42+n*30;ctx.save();ctx.translate(x+n*55,y+visualNoise(y/spacing,x/spacing,89)*52);ctx.rotate((n-.5)*.6);
      ctx.fillStyle=deep?'rgba(127,82,47,.32)':'rgba(94,105,79,.3)';ctx.beginPath();ctx.moveTo(-w*.5,0);ctx.quadraticCurveTo(-w*.2,-h*.55,w*.25,-h*.38);ctx.lineTo(w*.55,0);ctx.quadraticCurveTo(w*.18,h*.5,-w*.3,h*.38);ctx.closePath();ctx.fill();
      ctx.strokeStyle=deep?'rgba(202,139,77,.2)':'rgba(170,161,112,.18)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-w*.35,0);ctx.quadraticCurveTo(0,-h*.28,w*.35,-.04*h);ctx.stroke();
      if(!deep&&n>.66){ctx.fillStyle='rgba(91,139,69,.3)';ctx.beginPath();ctx.ellipse(0,-h*.2,22,5,.1,0,Math.PI*2);ctx.fill()}ctx.restore();
    }
    ctx.restore();ctx.save();ctx.translate(p.x,p.y);ctx.strokeStyle=deep?'#9d6b43':'#716d50';ctx.globalAlpha=.7;ctx.lineWidth=4;ctx.strokeRect(2,2,wall.w-4,wall.h-4);ctx.restore();
  }

  function productionFloorPattern(art){
    if(!art||!imageReady(art.floor))return null;
    if(!art.floorPattern&&typeof ctx.createPattern==='function')art.floorPattern=ctx.createPattern(art.floor,'repeat');
    return art.floorPattern;
  }

  function drawMoonProductionFloor(mine){
    const art=activeMoonProductionArt(),pattern=productionFloorPattern(art),deep=isPrismaticProduction();
    ctx.fillStyle=deep?'#09161b':'#0d2024';ctx.fillRect(0,0,mine.width,mine.height);
    if(pattern){ctx.save();ctx.fillStyle=pattern;ctx.globalAlpha=deep?.92:.96;ctx.fillRect(0,0,mine.width,mine.height);ctx.globalAlpha=1;ctx.fillStyle=deep?'rgba(7,7,19,.24)':'rgba(5,16,20,.12)';ctx.fillRect(0,0,mine.width,mine.height);ctx.restore()}
    else if(art&&imageReady(art.floor)){const tileX=Math.floor(camera.x/art.floor.naturalWidth)*art.floor.naturalWidth,tileY=Math.floor(camera.y/art.floor.naturalHeight)*art.floor.naturalHeight;ctx.drawImage(art.floor,tileX,tileY,art.floor.naturalWidth,art.floor.naturalHeight)}
    if(!deep&&imageReady(MOONGLASS_ART.routeMarker)){
      const route=[[350,1180,0],[535,700,-.62],[790,700,0],[1055,500,-.38],[1320,350,-.2],[1530,350,0]];
      for(const [x,y,rotation] of route){const width=108,height=width*(MOONGLASS_ART.routeMarker.naturalHeight/MOONGLASS_ART.routeMarker.naturalWidth);ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.globalAlpha=.9;ctx.drawImage(MOONGLASS_ART.routeMarker,-width*.5,-height*.5,width,height);ctx.restore()}
    }
  }

  function moonProductionWallHintImage(rock){
    if(isPrismaticProduction())return PRISMATIC_ART.wallHints[rock.type]||null;
    if(isMoonglassProduction())return MOONGLASS_ART.wallHints[rock.type]||null;
    return null;
  }

  function drawMoonProductionWallHint(x,y,side,rock){
    const image=moonProductionWallHintImage(rock);if(!imageReady(image)){drawMossveinMineralHint(x,y,side,rock);return}
    ctx.save();ctx.translate(x+MINE_TILE_SIZE*.5,y+MINE_TILE_SIZE*.5);ctx.rotate(side*Math.PI*.5);
    ctx.beginPath();ctx.rect(-MINE_TILE_SIZE*.5,-MINE_TILE_SIZE*.5,MINE_TILE_SIZE,MINE_TILE_SIZE);ctx.clip();
    const maxHeight=rock.type==='lunacore'||rock.type==='phasecrystal'||rock.type==='starshard'?76:70,scale=maxHeight/image.naturalHeight,width=image.naturalWidth*scale,height=image.naturalHeight*scale;
    ctx.drawImage(image,-width*.5,-MINE_TILE_SIZE*.59,width,height);ctx.restore();
  }

  function drawMoonProductionWallArt(terrain,concealed,visible,art){
    const image=art&&art.wall;if(!imageReady(image))return false;
    const placements=[],used=new Set();
    for(const cell of visible){
      if(!cell.actual)continue;const {col,row}=cell,open=[!mossveinVisualSolidAt(terrain,concealed,col,row-1),!mossveinVisualSolidAt(terrain,concealed,col+1,row),!mossveinVisualSolidAt(terrain,concealed,col,row+1),!mossveinVisualSolidAt(terrain,concealed,col-1,row)];
      for(let side=0;side<4;side++){if(!open[side])continue;const key=side%2===0?side+':'+row+':'+Math.floor(col/2):side+':'+col+':'+Math.floor(row/2);if(used.has(key))continue;used.add(key);placements.push({col,row,side})}
    }
    ctx.save();ctx.beginPath();for(const cell of visible){if(!cell.actual)continue;ctx.rect(cell.col*MINE_TILE_SIZE-camera.x-10,cell.row*MINE_TILE_SIZE-camera.y-10,MINE_TILE_SIZE+20,MINE_TILE_SIZE+20)}ctx.clip();
    for(const item of placements){
      const n=visualNoise(item.col,item.row,isPrismaticProduction()?307:281),width=174+n*26,height=width*(image.naturalHeight/image.naturalWidth);let x=(item.col+.5)*MINE_TILE_SIZE-camera.x,y=(item.row+.5)*MINE_TILE_SIZE-camera.y,rotation=0;
      if(item.side===0){y-=MINE_TILE_SIZE*.36;rotation=Math.PI}else if(item.side===1){x+=MINE_TILE_SIZE*.36;rotation=-Math.PI*.5}else if(item.side===2)y+=MINE_TILE_SIZE*.36;else{x-=MINE_TILE_SIZE*.36;rotation=Math.PI*.5}
      ctx.save();ctx.translate(x,y);ctx.rotate(rotation+(n-.5)*.045);if(n>.53)ctx.scale(-1,1);ctx.drawImage(image,-width*.5,-height*.48,width,height);ctx.restore();
    }
    ctx.restore();return true;
  }

  function drawMoonProductionTarget(x,y,color){
    const pulse=.5+.5*Math.sin(time*5);ctx.save();ctx.translate(x+MINE_TILE_SIZE*.5,y+MINE_TILE_SIZE*.5);ctx.strokeStyle=color;ctx.lineWidth=2.2;ctx.lineCap='round';ctx.shadowBlur=8+5*pulse;ctx.shadowColor=color;ctx.globalAlpha=.58+.28*pulse;
    ctx.beginPath();ctx.moveTo(-13,-5);ctx.lineTo(-4,-10);ctx.lineTo(2,-2);ctx.lineTo(12,-8);ctx.moveTo(-5,12);ctx.lineTo(1,3);ctx.lineTo(11,7);ctx.stroke();ctx.restore();
  }

  function drawMoonProductionTerrain(mine,terrain,startCol,endCol,startRow,endRow,target){
    const art=activeMoonProductionArt(),pattern=productionFloorPattern(art),concealed=mossveinConcealedCells(terrain),visible=[];
    for(let row=startRow;row<=endRow;row++)for(let col=startCol;col<=endCol;col++){const index=row*terrain.cols+col;if(mossveinVisualSolidAt(terrain,concealed,col,row))visible.push({index,col,row,actual:!!terrainTypeAt(terrain,col,row)})}
    ctx.save();ctx.fillStyle=isPrismaticProduction()?'#101225':'#10272d';ctx.beginPath();for(const cell of visible)ctx.rect(cell.col*MINE_TILE_SIZE-camera.x-.7,cell.row*MINE_TILE_SIZE-camera.y-.7,MINE_TILE_SIZE+1.4,MINE_TILE_SIZE+1.4);ctx.fill();ctx.clip();
    if(pattern){ctx.save();ctx.translate(-camera.x,-camera.y);ctx.fillStyle=pattern;ctx.globalAlpha=isPrismaticProduction()?.7:.76;ctx.fillRect(camera.x-64,camera.y-64,viewWidth+128,viewHeight+128);ctx.globalAlpha=1;ctx.fillStyle=isPrismaticProduction()?'rgba(8,5,24,.57)':'rgba(4,22,29,.52)';ctx.fillRect(camera.x-64,camera.y-64,viewWidth+128,viewHeight+128);ctx.restore()}ctx.restore();
    for(const cell of visible){
      if(!cell.actual)continue;const {index,col,row}=cell,x=col*MINE_TILE_SIZE-camera.x,y=row*MINE_TILE_SIZE-camera.y,noise=visualNoise(col,row,isPrismaticProduction()?293:271);
      drawMossveinDamage(x,y,1-terrainHpAt(terrain,col,row)/terrain.maxHp,noise);
      if(miningFeedback.terrainHitIndex===index&&miningFeedback.terrainHitTime>0){ctx.globalAlpha=miningFeedback.terrainHitTime/.16*.2;ctx.fillStyle=mine.wallEdge;ctx.fillRect(x+2,y+2,MINE_TILE_SIZE-4,MINE_TILE_SIZE-4);ctx.globalAlpha=1}
      if(target&&target.index===index)drawMoonProductionTarget(x,y,mine.detail);
    }
    drawMoonProductionWallArt(terrain,concealed,visible,art);
    for(const cell of visible){if(!cell.actual)continue;const hint=mineralHintAtTerrainCell(terrain,concealed,cell.col,cell.row);if(!hint)continue;const x=cell.col*MINE_TILE_SIZE-camera.x,y=cell.row*MINE_TILE_SIZE-camera.y;for(const side of hint.sides)drawMoonProductionWallHint(x,y,side,hint.rock)}
  }

  function drawMoonSolidWall(wall,p){
    const art=MOONGLASS_ART,pattern=productionFloorPattern(art),image=art.wall;ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='#0b1b20';ctx.fillRect(0,0,wall.w,wall.h);
    if(pattern){ctx.save();ctx.globalAlpha=.64;ctx.fillStyle=pattern;ctx.fillRect(0,0,wall.w,wall.h);ctx.globalAlpha=1;ctx.fillStyle='rgba(3,15,20,.52)';ctx.fillRect(0,0,wall.w,wall.h);ctx.restore()}
    if(imageReady(image)){
      ctx.beginPath();ctx.rect(0,0,wall.w,wall.h);ctx.clip();const width=184,height=width*(image.naturalHeight/image.naturalWidth),step=92;
      for(let x=0;x<=wall.w;x+=step){ctx.save();ctx.translate(x,4);ctx.rotate(Math.PI);ctx.drawImage(image,-width*.5,-height*.48,width,height);ctx.restore();ctx.save();ctx.translate(x,wall.h-4);ctx.drawImage(image,-width*.5,-height*.48,width,height);ctx.restore()}
      for(let y=0;y<=wall.h;y+=step){ctx.save();ctx.translate(4,y);ctx.rotate(Math.PI*.5);ctx.drawImage(image,-width*.5,-height*.48,width,height);ctx.restore();ctx.save();ctx.translate(wall.w-4,y);ctx.rotate(-Math.PI*.5);ctx.drawImage(image,-width*.5,-height*.48,width,height);ctx.restore()}
    }
    ctx.restore();
  }

  function drawMoonBarrier(barrier,p,locked){
    const image=MOONGLASS_ART.barriers[barrier.id];if(!imageReady(image))return false;
    const height=barrier.h+28,width=height*(image.naturalWidth/image.naturalHeight);ctx.save();ctx.translate(p.x+barrier.w*.5,p.y+barrier.h*.5);ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(0,barrier.h*.5-3,Math.min(92,width*.43),14,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=locked?1:.88;ctx.drawImage(image,-width*.5,-height*.5,width,height);ctx.globalAlpha=1;
    ctx.fillStyle='rgba(4,8,10,.9)';ctx.fillRect(-86,-barrier.h*.5-35,172,24);ctx.strokeStyle=locked?'#8ceef0':'#d8b9ff';ctx.lineWidth=1;ctx.strokeRect(-86,-barrier.h*.5-35,172,24);ctx.fillStyle=locked?'#bdf8f5':'#ead8ff';ctx.textAlign='center';ctx.font='900 9px Georgia';ctx.fillText(locked?PICKAXES[barrier.requiresPickaxe].name.toUpperCase()+' REQUIRED':'BREAK: '+barrier.label.toUpperCase(),0,-barrier.h*.5-19);ctx.restore();return true;
  }

  function drawMineGround(){
    const mine=currentMineVisual(),moonProduction=!!activeMoonProductionArt();ctx.fillStyle=mine.floor;ctx.fillRect(0,0,viewWidth,viewHeight);
    const origin=worldToScreen(0,0);
    ctx.save();ctx.translate(origin.x,origin.y);
    if(isMossveinVisual(mine))drawMossveinFloorBase(mine);
    else if(moonProduction)drawMoonProductionFloor(mine);
    else{
      ctx.fillStyle=mine.floor;ctx.fillRect(0,0,mine.width,mine.height);
      const glowX=mine.width*.78,glowY=mine.height*.5,glow=ctx.createRadialGradient(glowX,glowY,40,glowX,glowY,Math.max(mine.width,mine.height)*.38);
      glow.addColorStop(0,mine.style==='ember'?'rgba(255,91,34,.18)':mine.style==='moon'?'rgba(92,226,225,.14)':mine.style==='star'?'rgba(163,145,255,.15)':'rgba(166,118,45,.17)');glow.addColorStop(1,'rgba(10,12,14,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,mine.width,mine.height);
    }
    if(isMossveinVisual(mine)){if(!(isRootwoundProduction()&&imageReady(ROOTWOUND_ART.floor)))drawMossveinFloorDetail(mine)}
    else if(!moonProduction){
      ctx.strokeStyle=mine.style==='ember'?'rgba(255,127,69,.055)':mine.style==='star'?'rgba(190,195,255,.05)':mine.style==='moon'?'rgba(115,224,220,.055)':'rgba(198,174,112,.055)';ctx.lineWidth=1;
      for(let x=0;x<=mine.width;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,mine.height);ctx.stroke()}
      for(let y=0;y<=mine.height;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(mine.width,y);ctx.stroke()}
    }
    if(moonProduction){
      // The complete Moonglass/Prismatic floor and route are production PNGs.
    }else if(currentDepth===2&&!isRootwoundProduction()){
      ctx.strokeStyle=mine.wallEdge;ctx.globalAlpha=.12;ctx.lineWidth=5;
      for(let y=180;y<mine.height;y+=310){ctx.beginPath();ctx.moveTo(40,y);ctx.bezierCurveTo(mine.width*.28,y-70,mine.width*.68,y+75,mine.width-40,y-15);ctx.stroke()}
      ctx.globalAlpha=1;
    }else if(mine.style==='moss'){
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
      ctx.save();ctx.translate(cavern.x,cavern.y);
      const pocket=moonProduction?activeMoonProductionArt().pocket:DISCOVERY_ART.crystalPocket,claimed=!!state.claimedPocketRewards[cavern.reward.id];let pocketHeight=Math.min(cavern.ry*1.72,cavern.rx*1.84*(pocket&&pocket.naturalHeight?pocket.naturalHeight/pocket.naturalWidth:.559));
      if(imageReady(pocket)){
        const pocketWidth=pocketHeight*(pocket.naturalWidth/pocket.naturalHeight);ctx.globalAlpha=claimed?.46:1;ctx.shadowColor=mine.detail;ctx.shadowBlur=claimed?4:13;ctx.drawImage(pocket,-pocketWidth/2,-pocketHeight/2,pocketWidth,pocketHeight);ctx.shadowBlur=0;
      }
      ctx.globalAlpha=1;const labelY=-pocketHeight/2-9;ctx.fillStyle='rgba(5,8,7,.84)';ctx.fillRect(-68,labelY-10,136,19);ctx.fillStyle=mine.detail;ctx.textAlign='center';ctx.font='900 9px Georgia';ctx.fillText(cavern.name.toUpperCase(),0,labelY+3);ctx.restore();
      drawPocketReward(cavern,origin);
    }
    ctx.restore();
  }

  function drawPocketReward(cavern,origin){
    const mine=currentMineVisual(),reward=cavern.reward,claimed=!!state.claimedPocketRewards[reward.id];
    if(reward.kind==='crystal'||reward.kind==='motherlode')return;
    const x=origin.x+cavern.x,y=origin.y+cavern.y+30;if(x<-70||y<-70||x>viewWidth+70||y>viewHeight+70)return;
    const moonArt=activeMoonProductionArt(),production=moonArt?moonArt.rewards[reward.kind]:currentScene==='mossMine'&&MOSSVEIN_REWARD_ART[reward.kind];
    if(imageReady(production)){
      if(claimed)return;
      const maxWidth=reward.kind==='shrine'?120:94,maxHeight=reward.kind==='shrine'?118:76,scale=Math.min(maxWidth/production.naturalWidth,maxHeight/production.naturalHeight),width=production.naturalWidth*scale,height=production.naturalHeight*scale;
      ctx.save();ctx.translate(cavern.x,cavern.y+30);ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(0,35,width*.36,10,0,0,Math.PI*2);ctx.fill();
      if(reward.kind==='shrine'){ctx.shadowColor=mine.detail;ctx.shadowBlur=12}
      ctx.drawImage(production,-width*.5,40-height,width,height);ctx.shadowBlur=0;ctx.fillStyle=mine.detail;ctx.textAlign='center';ctx.font='900 8px Georgia';ctx.fillText(reward.label,0,54);ctx.restore();return;
    }
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
    ctx.fillStyle=mine.dirt||mine.wall;ctx.fillRect(x-.5,y-.5,MINE_TILE_SIZE+1,MINE_TILE_SIZE+1);
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
    const mine=currentMineVisual(),terrain=currentTerrain();if(!mine||!terrain)return;
    const startCol=Math.max(0,Math.floor(camera.x/MINE_TILE_SIZE)-1),endCol=Math.min(terrain.cols-1,Math.ceil((camera.x+viewWidth)/MINE_TILE_SIZE)+1);
    const startRow=Math.max(0,Math.floor(camera.y/MINE_TILE_SIZE)-1),endRow=Math.min(terrain.rows-1,Math.ceil((camera.y+viewHeight)/MINE_TILE_SIZE)+1);
    const target=nearestTerrainCell(MINING_RANGE);
    if(isMossveinVisual(mine)){drawMossveinTerrain(mine,terrain,startCol,endCol,startRow,endRow,target);return}
    if(activeMoonProductionArt()){drawMoonProductionTerrain(mine,terrain,startCol,endCol,startRow,endRow,target);return}
    for(let row=startRow;row<=endRow;row++)for(let col=startCol;col<=endCol;col++){
      const index=row*terrain.cols+col,type=terrainTypeAt(terrain,col,row);if(!type)continue;
      drawMineTerrainCell(mine,index,col,row,1-terrainHpAt(terrain,col,row)/terrain.maxHp,target&&target.index===index);
    }
    for(const cavern of terrain.caverns){
      if(cavernIsDiscovered(cavern.id))continue;
      for(const index of cavern.cells){
        const col=index%terrain.cols,row=Math.floor(index/terrain.cols);if(col<startCol||col>endCol||row<startRow||row>endRow)continue;
        drawMineTerrainCell(mine,index,col,row,0,false);
      }
    }
    if(terrain.depthEntrance&&!state.discoveredDepthEntrances[currentScene]){
      for(const index of terrain.depthEntrance.cells){
        const col=index%terrain.cols,row=Math.floor(index/terrain.cols);if(col<startCol||col>endCol||row<startRow||row>endRow)continue;
        drawMineTerrainCell(mine,index,col,row,0,false);
      }
    }
  }

  function drawMineWalls(){
    if(currentDepth===2)return;
    const mine=currentMine();
    for(const wall of mine.solids){
      const p=worldToScreen(wall.x,wall.y);if(p.x>viewWidth+60||p.y>viewHeight+60||p.x+wall.w< -60||p.y+wall.h< -60)continue;
      if(mine.style==='moss'){drawMossveinSolidWall(mine,wall,p);continue}
      if(mine.style==='moon'){drawMoonSolidWall(wall,p);continue}
      ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle=mine.style==='star'?'#050610':'#0e1110';ctx.fillRect(0,0,wall.w,wall.h);ctx.fillStyle=mine.wall;ctx.strokeStyle=mine.wallEdge;ctx.lineWidth=2;
      for(let x=12;x<wall.w;x+=48)for(let y=12;y<wall.h;y+=44){const jitter=((x+y)*.13)%7;ctx.beginPath();ctx.moveTo(x-10,y+12);ctx.lineTo(x+jitter,y-8);ctx.lineTo(x+25,y-3);ctx.lineTo(x+32,y+17);ctx.lineTo(x+8,y+24);ctx.closePath();ctx.fill();ctx.stroke();if(mine.style==='ember'){ctx.fillStyle='#d86635';ctx.beginPath();ctx.arc(x+8,y+7,2,0,Math.PI*2);ctx.fill();ctx.fillStyle=mine.wall}else if(mine.style==='moon'){ctx.strokeStyle='rgba(113,227,223,.45)';ctx.beginPath();ctx.moveTo(x+2,y+18);ctx.lineTo(x+18,y-2);ctx.stroke();ctx.strokeStyle=mine.wallEdge}else if(mine.style==='star'&&((x+y)%3<1)){ctx.fillStyle='#cdd2ff';ctx.fillRect(x+5,y+4,1.5,1.5);ctx.fillStyle=mine.wall}}
      ctx.restore();
    }
    for(const barrier of mine.barriers){
      if(mineBarrierCleared(barrier.id))continue;
      const p=worldToScreen(barrier.x,barrier.y),locked=state.pickaxeLevel<barrier.requiresPickaxe;
      if(currentScene==='moonMine'&&drawMoonBarrier(barrier,p,locked))continue;
      ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(10,12,9,.68)';ctx.fillRect(0,0,barrier.w,barrier.h);
      ctx.strokeStyle=locked?'#98784a':mine.accent;ctx.globalAlpha=.55;ctx.lineWidth=3;ctx.setLineDash([9,7]);ctx.strokeRect(5,5,barrier.w-10,barrier.h-10);ctx.setLineDash([]);ctx.globalAlpha=1;
      ctx.fillStyle='rgba(7,9,7,.88)';ctx.fillRect(-34,-32,barrier.w+68,24);ctx.strokeStyle='#7e673b';ctx.lineWidth=1;ctx.strokeRect(-34,-32,barrier.w+68,24);
      ctx.fillStyle=locked?'#cfb985':'#f0d58d';ctx.textAlign='center';ctx.font='900 9px Georgia';ctx.fillText(locked?PICKAXES[barrier.requiresPickaxe].name.toUpperCase()+' REQUIRED':'BREAK: '+barrier.label.toUpperCase(),barrier.w*.5,-16);ctx.restore();
    }
  }

  function drawSurfaceMineEntrances(){for(const scene of MINE_SCENES){const mine=MINE_DEFINITIONS[scene];if(mine.unlock(state))drawMineEntrance(true,mine)}}

  function drawDepthEntrance(){
    const entrance=depthEntrances[currentScene],mine=currentMineVisual(),p=worldToScreen(entrance.x,entrance.y),selected=activeContext===(currentDepth===2?'depthExit':'depthEntrance');
    if(p.x<-110||p.y<-110||p.x>viewWidth+110||p.y>viewHeight+110)return;
    const production=currentScene==='mossMine'?ROOTWOUND_ART.shaft:currentScene==='moonMine'?PRISMATIC_ART.shaft:null;
    if(imageReady(production)){
      const maxWidth=158,maxHeight=138,scale=Math.min(maxWidth/production.naturalWidth,maxHeight/production.naturalHeight),assetWidth=production.naturalWidth*scale,assetHeight=production.naturalHeight*scale;
      ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(0,35,62,19,0,0,Math.PI*2);ctx.fill();ctx.drawImage(production,-assetWidth*.5,40-assetHeight,assetWidth,assetHeight);
      ctx.fillStyle=mine.detail;ctx.textAlign='center';ctx.font='900 10px Georgia';ctx.fillText(currentDepth===2?'RETURN TO DEPTH 1':'DESCEND TO DEPTH 2',0,67);
      if(selected){ctx.strokeStyle=mine.detail;ctx.globalAlpha=.75;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,5,76+Math.sin(time*4)*2,0,Math.PI*2);ctx.stroke()}ctx.restore();return;
    }
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.72)';ctx.beginPath();ctx.ellipse(0,12,52,37,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=mine.wallEdge;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,12,54,39,0,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='#b88b52';ctx.lineWidth=4;for(const x of [-18,18]){ctx.beginPath();ctx.moveTo(x,-23);ctx.lineTo(x,43);ctx.stroke()}
    ctx.lineWidth=3;for(let y=-14;y<=34;y+=12){ctx.beginPath();ctx.moveTo(-18,y);ctx.lineTo(18,y);ctx.stroke()}
    ctx.fillStyle=mine.detail;ctx.textAlign='center';ctx.font='900 10px Georgia';ctx.fillText(currentDepth===2?'RETURN TO DEPTH 1':'DESCEND TO DEPTH 2',0,69);
    if(selected){ctx.strokeStyle=mine.detail;ctx.globalAlpha=.75;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,10,70+Math.sin(time*4)*2,0,Math.PI*2);ctx.stroke()}
    ctx.restore();
  }

  function drawMineEntrance(surface,mine){
    const entrance=surface?mine.surfaceEntrance:mine.entrance,p=worldToScreen(entrance.x,entrance.y),selected=activeContext===(surface?'mineEntrance:'+mine.id:'mineExit');
    if(p.x<-120||p.y<-150||p.x>viewWidth+120||p.y>viewHeight+150)return;
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(0,42,66,20,0,0,Math.PI*2);ctx.fill();
    const production=MINE_ENTRANCE_ART[mine.id];
    if(imageReady(production)){
      const maxWidth=174,maxHeight=148,scale=Math.min(maxWidth/production.naturalWidth,maxHeight/production.naturalHeight),assetWidth=production.naturalWidth*scale,assetHeight=production.naturalHeight*scale;
      ctx.drawImage(production,-assetWidth*.5,45-assetHeight,assetWidth,assetHeight);
      ctx.fillStyle=mine.detail;ctx.textAlign='center';ctx.font='900 10px Georgia';ctx.fillText(surface?mine.name:'RETURN TO '+mine.surfaceName.replace('MOSSVEIN ','').replace('MOONGLASS ','').replace('EMBERDEEP ','').replace('STARFALL ',''),0,65);
      if(selected){ctx.strokeStyle='#f0d58d';ctx.globalAlpha=.75;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,4,82+Math.sin(time*4)*2,0,Math.PI*2);ctx.stroke()}
      ctx.restore();return;
    }
    ctx.fillStyle='#34372d';ctx.strokeStyle='#80734f';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-58,39);ctx.lineTo(-49,-22);ctx.quadraticCurveTo(0,-86,49,-22);ctx.lineTo(58,39);ctx.closePath();ctx.fill();ctx.stroke();
    const darkness=ctx.createRadialGradient(0,6,5,0,6,48);darkness.addColorStop(0,'#030403');darkness.addColorStop(1,'#151711');ctx.fillStyle=darkness;ctx.beginPath();ctx.moveTo(-39,36);ctx.lineTo(-33,-15);ctx.quadraticCurveTo(0,-58,33,-15);ctx.lineTo(39,36);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#9c7136';ctx.lineWidth=5;for(const x of [-34,34]){ctx.beginPath();ctx.moveTo(x,35);ctx.lineTo(x,-14);ctx.stroke()}ctx.beginPath();ctx.arc(0,-9,34,Math.PI,Math.PI*2);ctx.stroke();
    ctx.fillStyle=mine.detail;ctx.textAlign='center';ctx.font='900 10px Georgia';ctx.fillText(surface?mine.name:'RETURN TO '+mine.surfaceName.replace('MOSSVEIN ','').replace('MOONGLASS ','').replace('EMBERDEEP ','').replace('STARFALL ',''),0,61);
    if(selected){ctx.strokeStyle='#f0d58d';ctx.globalAlpha=.75;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,4,72+Math.sin(time*4)*2,0,Math.PI*2);ctx.stroke()}
    ctx.restore();
  }

  function drawSurfaceMoonglassGround(){
    const image=SURFACE_ART.moonglassGround;if(!imageReady(image))return false;
    const pattern=SURFACE_ART.moonglassGroundPattern||(typeof ctx.createPattern==='function'?ctx.createPattern(image,'repeat'):null);SURFACE_ART.moonglassGroundPattern=pattern;
    ctx.save();ctx.translate(-camera.x,-camera.y);if(pattern){ctx.fillStyle=pattern;ctx.fillRect(WORLD.gateX,0,WORLD.emberGateX-WORLD.gateX,WORLD.height)}else ctx.drawImage(image,WORLD.gateX,0,WORLD.emberGateX-WORLD.gateX,WORLD.height);ctx.fillStyle='rgba(4,26,31,.12)';ctx.fillRect(WORLD.gateX,0,WORLD.emberGateX-WORLD.gateX,WORLD.height);ctx.restore();return true;
  }

  function drawSurfaceProductionAt(image,x,y,maxWidth,maxHeight,flip=false,alpha=1){
    if(!imageReady(image))return;const p=worldToScreen(x,y);if(p.x<-maxWidth||p.y<-maxHeight||p.x>viewWidth+maxWidth||p.y>viewHeight+maxHeight)return;
    const scale=Math.min(maxWidth/image.naturalWidth,maxHeight/image.naturalHeight),width=image.naturalWidth*scale,height=image.naturalHeight*scale;ctx.save();ctx.translate(p.x,p.y);if(flip)ctx.scale(-1,1);ctx.globalAlpha=alpha;ctx.drawImage(image,-width*.5,-height,width,height);ctx.restore();
  }

  function drawMoonglassSurfaceProductionDecor(){
    if(!imageReady(SURFACE_ART.moonglassGround))return;
    const clusters=[[1175,220,94,78,false,.88],[1165,825,96,78,true,.86],[1435,185,106,84,true,.9],[1775,210,112,88,false,.86],[2110,330,104,82,true,.88],[1350,1210,112,88,true,.82],[1885,1170,116,90,false,.84],[2160,930,100,80,false,.82]];
    for(const [x,y,w,h,flip,alpha] of clusters)drawSurfaceProductionAt(SURFACE_ART.moonglassCrystals,x,y,w,h,flip,alpha);
    drawSurfaceProductionAt(SURFACE_ART.moonglassBloomBed,1665,572,286,126,false,.96);
  }

  function drawGround(){
    ctx.fillStyle='#273228';ctx.fillRect(0,0,viewWidth,viewHeight);
    const cavernStart=worldToScreen(WORLD.gateX,0).x,emberStart=worldToScreen(WORLD.emberGateX,0).x,starfallStart=worldToScreen(WORLD.starfallGateX,0).x,moonProduction=imageReady(SURFACE_ART.moonglassGround);
    if(imageReady(SURFACE_ART.mossveinGround)){
      const origin=worldToScreen(0,0);ctx.drawImage(SURFACE_ART.mossveinGround,origin.x,origin.y,WORLD.gateX,WORLD.height);
    }
    ctx.fillStyle='#14282b';ctx.fillRect(cavernStart,0,emberStart-cavernStart,viewHeight);
    if(moonProduction)drawSurfaceMoonglassGround();
    ctx.fillStyle='#261817';ctx.fillRect(emberStart,0,starfallStart-emberStart,viewHeight);
    ctx.fillStyle='#17172a';ctx.fillRect(starfallStart,0,viewWidth-starfallStart,viewHeight);
    const emberBlend=ctx.createLinearGradient(emberStart-110,0,emberStart+110,0);emberBlend.addColorStop(0,'#14282b');emberBlend.addColorStop(1,'#261817');ctx.fillStyle=emberBlend;ctx.fillRect(emberStart-110,0,220,viewHeight);
    const starfallBlend=ctx.createLinearGradient(starfallStart-120,0,starfallStart+120,0);starfallBlend.addColorStop(0,'#261817');starfallBlend.addColorStop(1,'#17172a');ctx.fillStyle=starfallBlend;ctx.fillRect(starfallStart-120,0,240,viewHeight);
    const legacyGridStart=moonProduction?emberStart:cavernStart;ctx.save();ctx.beginPath();ctx.rect(legacyGridStart,0,viewWidth-legacyGridStart,viewHeight);ctx.clip();ctx.translate(-camera.x%80,-camera.y%80);ctx.strokeStyle='rgba(190,205,165,.045)';ctx.lineWidth=1;
    for(let x=-80;x<viewWidth+80;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,viewHeight+80);ctx.stroke()}
    for(let y=-80;y<viewHeight+80;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(viewWidth+80,y);ctx.stroke()}
    ctx.restore();
    if(!moonProduction){ctx.fillStyle='rgba(75,174,177,.08)';ctx.fillRect(cavernStart,0,emberStart-cavernStart,viewHeight)}
    ctx.fillStyle='rgba(222,76,35,.07)';ctx.fillRect(emberStart,0,starfallStart-emberStart,viewHeight);
    ctx.fillStyle='rgba(154,164,255,.075)';ctx.fillRect(starfallStart,0,viewWidth-starfallStart,viewHeight);
  }

  function drawBiomeStructure(){
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    if(!imageReady(SURFACE_ART.moonglassGround)){
      const moonCenter=worldToScreen(1650,670),moonGlow=ctx.createRadialGradient(moonCenter.x,moonCenter.y,20,moonCenter.x,moonCenter.y,360);
      moonGlow.addColorStop(0,'rgba(87,224,221,.12)');moonGlow.addColorStop(.58,'rgba(74,132,146,.055)');moonGlow.addColorStop(1,'rgba(44,82,90,0)');ctx.fillStyle=moonGlow;ctx.fillRect(moonCenter.x-370,moonCenter.y-370,740,740);
      ctx.strokeStyle='rgba(138,231,229,.15)';ctx.lineWidth=3;for(const radius of [190,285]){ctx.beginPath();ctx.arc(moonCenter.x,moonCenter.y,radius,Math.PI*.1,Math.PI*.9);ctx.stroke()}
    }

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
    drawMoonglassSurfaceProductionDecor();
    if(!imageReady(SURFACE_ART.moonglassGround)){
      ctx.save();const veins=[[1080,140,1100,450],[1220,110,1340,280],[1880,80,2010,300],[1500,980,1670,1210]];
      ctx.lineWidth=5;ctx.strokeStyle='rgba(105,226,220,.22)';ctx.shadowBlur=12;ctx.shadowColor='#4bd9dd';for(const vein of veins){const a=worldToScreen(vein[0],vein[1]),b=worldToScreen(vein[2],vein[3]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo((a.x+b.x)*.5+20,(a.y+b.y)*.5-15);ctx.lineTo(b.x,b.y);ctx.stroke()}ctx.restore();
    }
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
      if(wx<WORLD.gateX)continue;
      if(imageReady(SURFACE_ART.moonglassGround)&&wx<WORLD.emberGateX)continue;
      if(p.x<-30||p.y<-30||p.x>viewWidth+30||p.y>viewHeight+30)continue;
      ctx.fillStyle=i%3?'rgba(18,24,18,.48)':'rgba(111,127,92,.17)';ctx.beginPath();ctx.ellipse(p.x,p.y,18+(i%4)*6,7+(i%3)*3,(i*.7)%3,0,Math.PI*2);ctx.fill();
    }
    drawBiomeDetails();
  }

  function drawBiomeDetails(){
    ctx.save();
    if(!imageReady(SURFACE_ART.moonglassGround))for(let i=0;i<15;i++){
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
    drawBaseModules();drawSpeedShop();if(state.fourthUnlocked)drawStarforge();
  }

  function drawBaseModules(){
    for(const module of allBaseModules()){
      if(!moduleIsHere(module))continue;
      if(module.kind==='sell')drawSellStation(module);else if(module.kind==='forge')drawForge(module);else drawStorageChest(module);
    }
  }

  function drawDepthStations(){
    const stations=depthStations(),mine=currentMineVisual(),production=currentScene==='mossMine'?ROOTWOUND_ART:currentScene==='moonMine'?PRISMATIC_ART:null;
    if(production&&imageReady(production.sellStation)&&imageReady(production.drillForge)){
      for(const [kind,station,image,label] of [['sell',stations.sell,production.sellStation,'ORE EXCHANGE'],['forge',stations.forge,production.drillForge,'DRILL FORGE']]){
        const p=worldToScreen(station.x,station.y);if(p.x<-100||p.y<-100||p.x>viewWidth+100||p.y>viewHeight+100)continue;
        const maxWidth=132,maxHeight=116,scale=Math.min(maxWidth/image.naturalWidth,maxHeight/image.naturalHeight),assetWidth=image.naturalWidth*scale,assetHeight=image.naturalHeight*scale,selected=activeContext===(kind==='sell'?'depthSell':'drillForge');
        ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(0,38,54,17,0,0,Math.PI*2);ctx.fill();ctx.drawImage(image,-assetWidth*.5,43-assetHeight,assetWidth,assetHeight);
        if(selected){ctx.strokeStyle=mine.detail;ctx.globalAlpha=.72;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,3,66+Math.sin(time*4)*2,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
        ctx.fillStyle=mine.detail;ctx.textAlign='center';ctx.font='900 8px Georgia';ctx.fillText(label,0,57);ctx.restore();
      }
      return;
    }
    let p=worldToScreen(stations.sell.x,stations.sell.y);
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(0,28,45,15,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3d3327';ctx.strokeStyle=mine.detail;ctx.lineWidth=2;ctx.fillRect(-31,-13,62,38);ctx.strokeRect(-31,-13,62,38);ctx.fillStyle=mine.detail;ctx.textAlign='center';ctx.font='900 8px Georgia';ctx.fillText('EXCHANGE',0,9);ctx.restore();
    p=worldToScreen(stations.forge.x,stations.forge.y);ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(0,31,48,16,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#202827';ctx.strokeStyle=currentDrill()?currentDrill().color:mine.detail;ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-38,-24,76,52,8);ctx.fill();ctx.stroke();
    ctx.save();ctx.rotate(time*.5);ctx.strokeStyle=currentDrill()?currentDrill().color:mine.detail;ctx.lineWidth=4;for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(28,0);ctx.stroke()}ctx.restore();ctx.fillStyle='#0c1110';ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();ctx.fillStyle=mine.detail;ctx.textAlign='center';ctx.font='900 8px Georgia';ctx.fillText('DRILL FORGE',0,44);ctx.restore();
  }

  function drawProductionWorldAsset(image,maxWidth,maxHeight,bottom){
    if(!imageReady(image))return false;
    const scale=Math.min(maxWidth/image.naturalWidth,maxHeight/image.naturalHeight),width=image.naturalWidth*scale,height=image.naturalHeight*scale;
    ctx.drawImage(image,-width*.5,bottom-height,width,height);return true;
  }

  function drawSellStation(station){
    const p=worldToScreen(station.x,station.y);if(p.x<-100||p.y<-100||p.x>viewWidth+100||p.y>viewHeight+100)return;
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,32,70,22,0,0,Math.PI*2);ctx.fill();
    if(drawProductionWorldAsset(STARTER_ART.sellStation,150,130,42)){ctx.restore();return}
    ctx.fillStyle='#52341f';ctx.fillRect(-45,-15,88,44);ctx.fillStyle='#9f6d35';ctx.fillRect(-52,-22,102,12);ctx.fillStyle='#c7a35d';ctx.fillRect(-33,-7,64,7);
    ctx.fillStyle='#d7c4a0';ctx.beginPath();ctx.arc(-23,-31,13,0,Math.PI*2);ctx.arc(1,-34,16,0,Math.PI*2);ctx.arc(27,-29,11,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#161d17';ctx.font='900 9px Georgia';ctx.textAlign='center';ctx.fillText('ASSAY',0,15);ctx.restore();
  }

  function drawForge(station){
    const p=worldToScreen(station.x,station.y);if(p.x<-100||p.y<-100||p.x>viewWidth+100||p.y>viewHeight+100)return;
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,37,65,20,0,0,Math.PI*2);ctx.fill();
    if(drawProductionWorldAsset(STARTER_ART.forgeStation,150,132,45)){ctx.restore();return}
    ctx.fillStyle='#3a3f39';ctx.fillRect(-43,-20,86,53);ctx.fillStyle='#222a24';ctx.fillRect(-30,-9,60,30);
    const glow=ctx.createRadialGradient(0,5,2,0,5,35);glow.addColorStop(0,'#fff09b');glow.addColorStop(.35,'#ef7c2f');glow.addColorStop(1,'rgba(190,55,15,0)');ctx.fillStyle=glow;ctx.fillRect(-38,-33,76,76);
    ctx.fillStyle='#f18b35';ctx.beginPath();ctx.moveTo(-20,19);ctx.lineTo(0,-18);ctx.lineTo(22,19);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#d2bb82';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(32,-25);ctx.lineTo(51,22);ctx.stroke();ctx.restore();
  }

  function drawStorageChest(chest){
    const p=worldToScreen(chest.x,chest.y);if(p.x<-90||p.y<-90||p.x>viewWidth+90||p.y>viewHeight+90)return;
    const types=chestTypeCount(chest),selected=activeContext==='base:'+chest.id;
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(0,25,48,15,0,0,Math.PI*2);ctx.fill();
    if(selected){ctx.strokeStyle='#d7e5b1';ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,48,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
    if(drawProductionWorldAsset(STARTER_ART.storageChest,104,78,34)){ctx.fillStyle='#e9d9a6';ctx.strokeStyle='rgba(5,8,6,.9)';ctx.lineWidth=3;ctx.textAlign='center';ctx.font='900 8px Georgia';ctx.strokeText(types+'/'+STORAGE_CHEST_CAPACITY,0,45);ctx.fillText(types+'/'+STORAGE_CHEST_CAPACITY,0,45);ctx.restore();return}
    ctx.fillStyle='#51371f';ctx.strokeStyle='#d1a85b';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-37,-15,74,40,6);ctx.fill();ctx.stroke();ctx.fillStyle='#9d6a35';ctx.fillRect(-38,-17,76,12);ctx.fillStyle='#e4c16d';ctx.fillRect(-7,-18,14,24);ctx.fillStyle='#161b16';ctx.textAlign='center';ctx.font='900 8px Georgia';ctx.fillText(types+'/'+STORAGE_CHEST_CAPACITY,0,17);ctx.restore();
  }

  function drawSpeedShop(){
    const p=worldToScreen(STATIONS.speedShop.x,STATIONS.speedShop.y);if(p.x<-100||p.y<-100||p.x>viewWidth+100||p.y>viewHeight+100)return;
    const selected=activeContext==='speedShop',pulse=1+Math.sin(time*3)*.025;
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(pulse,pulse);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,34,62,18,0,0,Math.PI*2);ctx.fill();
    if(selected){ctx.strokeStyle='#c8f6cd';ctx.globalAlpha=.65;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,52,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
    if(drawProductionWorldAsset(STARTER_ART.wayfarerShop,142,130,45)){ctx.restore();return}
    ctx.fillStyle='#284631';ctx.strokeStyle='#8ed9a1';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-43,-24,86,55,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='#182a1d';ctx.fillRect(-33,-14,66,34);ctx.strokeStyle='#c8f6cd';ctx.lineWidth=5;ctx.lineCap='round';
    for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*-20,-5);ctx.lineTo(side*5,-5);ctx.lineTo(side*19,-17);ctx.stroke()}
    ctx.fillStyle='#d8f4d7';ctx.textAlign='center';ctx.font='900 8px Georgia';ctx.fillText(movementSpeedMultiplier().toFixed(2)+'x',0,16);ctx.restore();
  }

  function drawStarforge(){
    const p=worldToScreen(STATIONS.starforge.x,STATIONS.starforge.y);if(p.x<-100||p.y<-100||p.x>viewWidth+100||p.y>viewHeight+100)return;
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(0,34,68,20,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#282943';ctx.strokeStyle='#abb5ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-45,23);ctx.lineTo(-35,-18);ctx.lineTo(0,-34);ctx.lineTo(35,-18);ctx.lineTo(45,23);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.save();ctx.rotate(time*.28);ctx.strokeStyle='#d8dcff';ctx.globalAlpha=.72;for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(0,-29);ctx.stroke()}ctx.restore();
    const variant=currentStarforge();ctx.fillStyle=variant?variant.color:'#f0d9ff';ctx.shadowBlur=12;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(10,0);ctx.lineTo(0,20);ctx.lineTo(-10,0);ctx.closePath();ctx.fill();ctx.restore();
  }

  function drawGroundDrops(){
    const sweepRemaining=lootSweepRemaining();
    for(const drop of groundDrops){
      if(drop.scene!==currentScene||drop.depth!==currentDepth)continue;
      const p=worldToScreen(drop.x,drop.y),data=ROCK_TYPES[drop.type];if(p.x<-40||p.y<-55||p.x>viewWidth+40||p.y>viewHeight+40)continue;
      const fade=sweepRemaining<8?sweepRemaining/8:1,bob=drop.settled?Math.sin(time*3.2+drop.id)*2:0,size=data.rare?9:7;
      ctx.save();ctx.globalAlpha=fade;ctx.translate(p.x,p.y-drop.z+bob);ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(0,drop.z-bob+7,size+5,4,0,0,Math.PI*2);ctx.fill();
      const production=STARTER_ART.drops[drop.type];
      if(imageReady(production)){
        const maxWidth=drop.type==='stone'?30:32,maxHeight=27,scale=Math.min(maxWidth/production.naturalWidth,maxHeight/production.naturalHeight),assetWidth=production.naturalWidth*scale,assetHeight=production.naturalHeight*scale;
        ctx.shadowBlur=drop.type==='gold'?8:drop.type==='copper'?4:2;ctx.shadowColor=data.edge;ctx.drawImage(production,-assetWidth*.5,-assetHeight*.72,assetWidth,assetHeight);ctx.shadowBlur=0;
        if(drop.amount>1){ctx.fillStyle='#fff2c8';ctx.strokeStyle='rgba(0,0,0,.8)';ctx.lineWidth=3;ctx.textAlign='center';ctx.font='900 9px Georgia';ctx.strokeText('x'+drop.amount,0,-assetHeight*.72-4);ctx.fillText('x'+drop.amount,0,-assetHeight*.72-4)}ctx.restore();continue;
      }
      ctx.shadowBlur=data.rare?11:5;ctx.shadowColor=data.edge;ctx.fillStyle=data.color;ctx.strokeStyle=data.edge;ctx.lineWidth=1.5;ctx.rotate(time*(data.rare?.55:.3)+drop.id);
      ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.78,-size*.15);ctx.lineTo(size*.52,size);ctx.lineTo(-size*.62,size*.72);ctx.lineTo(-size,-size*.2);ctx.closePath();ctx.fill();ctx.stroke();ctx.rotate(-(time*(data.rare?.55:.3)+drop.id));ctx.shadowBlur=0;
      if(drop.amount>1){ctx.fillStyle='#fff2c8';ctx.strokeStyle='rgba(0,0,0,.8)';ctx.lineWidth=3;ctx.textAlign='center';ctx.font='900 9px Georgia';ctx.strokeText('x'+drop.amount,0,-size-6);ctx.fillText('x'+drop.amount,0,-size-6)}ctx.restore();
    }
  }

  function drawGate(){
    drawGateAt(WORLD.gateX,state.areaUnlocked,'#68e8e5','#202720','#576358',STARTER_ART.moonglassGate);
    drawGateAt(WORLD.emberGateX,state.emberdeepUnlocked,'#ff7747','#2b1b18','#75412c',state.emberdeepUnlocked?STARTER_ART.emberdeepGateOpen:STARTER_ART.emberdeepSeal);
    drawGateAt(WORLD.starfallGateX,state.fourthUnlocked,'#c7caff','#1d1e31','#5e6081');
  }

  function drawGateAt(x,open,glowColor,stoneColor,braceColor,production=null){
    const p=worldToScreen(x,WORLD.gateY);if(p.x<-130||p.x>viewWidth+130)return;
    ctx.save();ctx.translate(p.x,p.y);
    if(imageReady(production)){
      ctx.fillStyle='rgba(0,0,0,.36)';ctx.beginPath();ctx.ellipse(0,65,72,18,0,0,Math.PI*2);ctx.fill();drawProductionWorldAsset(production,168,158,72);
      if(!(open&&production===STARTER_ART.emberdeepGateOpen)){ctx.strokeStyle=open?glowColor+'55':glowColor;ctx.lineWidth=open?2:6;ctx.shadowBlur=open?5:17;ctx.shadowColor=glowColor;ctx.globalAlpha=open?.36:.92;ctx.beginPath();ctx.moveTo(0,-26);ctx.lineTo(0,55);ctx.stroke();ctx.globalAlpha=1;ctx.shadowBlur=0}ctx.restore();return;
    }
    ctx.fillStyle=stoneColor;ctx.fillRect(-28,-190,56,145);ctx.fillRect(-28,45,56,145);
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
      const topY=Math.min(...vein.positions.map(position=>position[1]))-112,labelPoint=worldToScreen(center.x,topY);
      const status=active?Math.ceil(vein.timer)+'s  '+vein.brokenRockIds.size+'/'+vein.positions.length:vein.status==='completed'?'CLEARED':vein.status==='failed'?'COOLED':'BONUS VEIN';
      ctx.globalAlpha=active?1:.78;ctx.fillStyle='rgba(6,9,7,.84)';ctx.fillRect(labelPoint.x-69,labelPoint.y-17,138,31);
      ctx.strokeStyle=vein.color;ctx.lineWidth=1;ctx.strokeRect(labelPoint.x-69,labelPoint.y-17,138,31);
      ctx.textAlign='center';ctx.fillStyle=vein.color;ctx.font='900 9px Georgia';ctx.fillText(vein.label,labelPoint.x,labelPoint.y-4);
      ctx.fillStyle='#eee4bd';ctx.font='800 7px Arial';ctx.fillText(status,labelPoint.x,labelPoint.y+8);ctx.restore();
    }
  }

  function drawRockBody(rock,data){
    if(['emberstone','sunslag','magmaite','furnaceheart','infernium'].includes(rock.type)){
      ctx.fillStyle=data.color;ctx.strokeStyle=data.edge;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-37,19);ctx.lineTo(-40,-7);ctx.lineTo(-23,-31);ctx.lineTo(5,-38);ctx.lineTo(33,-23);ctx.lineTo(41,4);ctx.lineTo(26,27);ctx.lineTo(-13,29);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=data.accent;ctx.beginPath();ctx.moveTo(-23,-29);ctx.lineTo(3,-37);ctx.lineTo(-2,-3);ctx.lineTo(-33,6);ctx.closePath();ctx.fill();
      ctx.strokeStyle=ROCK_TYPES[rock.type].rare?'#ffe197':data.edge;ctx.lineWidth=3;ctx.shadowBlur=8;ctx.shadowColor=ctx.strokeStyle;
      ctx.beginPath();ctx.moveTo(-17,-15);ctx.lineTo(-3,-3);ctx.lineTo(9,-22);ctx.moveTo(-3,-3);ctx.lineTo(17,15);ctx.lineTo(29,5);ctx.moveTo(-3,-3);ctx.lineTo(-20,15);ctx.stroke();ctx.shadowBlur=0;
      return;
    }
    if(['moonglass','starshard','astralite','crownstone','ambercore','prismite','lunacore','voidglass','singularity','phasecrystal'].includes(rock.type)){
      const side=rock.type==='starshard'?-1:1;
      ctx.fillStyle=data.accent;ctx.strokeStyle=data.edge;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-34,23);ctx.lineTo(-27,-11);ctx.lineTo(-12,-28);ctx.lineTo(-4,21);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=data.color;ctx.beginPath();ctx.moveTo(-11,23);ctx.lineTo(-5,-37);ctx.lineTo(12,-23);ctx.lineTo(18,23);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=data.accent;ctx.beginPath();ctx.moveTo(13,23);ctx.lineTo(18,-18);ctx.lineTo(34,-5);ctx.lineTo(30,24);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.globalAlpha=.42;ctx.fillStyle=data.edge;ctx.beginPath();ctx.moveTo(-3,-32);ctx.lineTo(4,-25);ctx.lineTo(8,12);ctx.lineTo(1,5);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
      if(side<0){ctx.strokeStyle='#fff3ff';ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(-26,-8);ctx.lineTo(-17,8);ctx.stroke();ctx.globalAlpha=1}
      if(['crownstone','lunacore','singularity'].includes(rock.type)){
        ctx.strokeStyle='#fff2ff';ctx.lineWidth=2;ctx.globalAlpha=.72;ctx.beginPath();ctx.moveTo(-20,-5);ctx.lineTo(-7,-22);ctx.lineTo(1,-8);ctx.lineTo(12,-25);ctx.lineTo(23,-5);ctx.stroke();ctx.globalAlpha=1;
      }
      return;
    }
    ctx.beginPath();ctx.moveTo(-33,22);ctx.lineTo(-39,-1);ctx.lineTo(-21,-29);ctx.lineTo(3,-39);ctx.lineTo(29,-27);ctx.lineTo(40,-2);ctx.lineTo(29,25);ctx.closePath();ctx.fillStyle=data.color;ctx.fill();ctx.strokeStyle=data.edge;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=data.accent;ctx.beginPath();ctx.moveTo(-21,-27);ctx.lineTo(2,-37);ctx.lineTo(-1,-5);ctx.lineTo(-32,5);ctx.closePath();ctx.fill();
  }

  function drawMineralNodeAsset(rock){
    const rootwoundNode=isRootwoundProduction()?ROOTWOUND_ART.nodes[rock.type]:null;
    if(rootwoundNode){
      if(imageReady(rootwoundNode)){
        const maxWidth=rock.type==='burrowsteel'?86:82,maxHeight=78,scale=Math.min(maxWidth/rootwoundNode.naturalWidth,maxHeight/rootwoundNode.naturalHeight),width=rootwoundNode.naturalWidth*scale,height=rootwoundNode.naturalHeight*scale;
        ctx.drawImage(rootwoundNode,-width*.5,-height*.56,width,height);
      }
      return true;
    }
    const moonNode=isPrismaticProduction()?PRISMATIC_ART.nodes[rock.type]:(isMoonglassProduction()||currentScene==='surface')?MOONGLASS_ART.nodes[rock.type]:null;
    if(moonNode){
      if(imageReady(moonNode)){
        const maxWidth=ROCK_TYPES[rock.type].rare?88:84,maxHeight=80,scale=Math.min(maxWidth/moonNode.naturalWidth,maxHeight/moonNode.naturalHeight),width=moonNode.naturalWidth*scale,height=moonNode.naturalHeight*scale;
        ctx.drawImage(moonNode,-width*.5,-height*.56,width,height);
      }
      return true;
    }
    const production=MINERAL_ART[rock.type];if(!production)return false;
    const image=production.node;if(imageReady(image)){
      const maxWidth=92*MINERAL_NODE_RENDER_SCALE,maxHeight=82*MINERAL_NODE_RENDER_SCALE,scale=Math.min(maxWidth/image.naturalWidth,maxHeight/image.naturalHeight),width=image.naturalWidth*scale,height=image.naturalHeight*scale;
      ctx.drawImage(image,-width*.5,-height*.56,width,height);
    }
    return true;
  }

  function drawChests(){
    for(const chest of chests){
      const p=worldToScreen(chest.x,chest.y);if(p.x<-75||p.y<-80||p.x>viewWidth+75||p.y>viewHeight+80)continue;
      const biome=BIOMES.find(item=>item.id===chest.biome),opened=!!state.openedChests[chest.id],ready=chestRequirementMet(chest);
      const selected=activeContext==='chest:'+chest.id,pulse=1+Math.sin(time*2.4+chest.tier)*.018;
      ctx.save();ctx.translate(p.x,p.y);ctx.scale(pulse,pulse);
      ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(0,25,35,12,0,0,Math.PI*2);ctx.fill();
      if(selected&&!opened){ctx.strokeStyle=ready?'#ffe19a':'#8d8570';ctx.globalAlpha=.72;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,3,43,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
      const moonChest=MOONGLASS_SURFACE_CHEST_ART[chest.id],production=moonChest?(opened?moonChest.open:moonChest.closed):chest.biome==='mossvein'?(opened?STARTER_ART.treasureOpen:STARTER_ART.treasureClosed):null;
      if(imageReady(production)){
        ctx.globalAlpha=opened?0.72:ready?1:.58;drawProductionWorldAsset(production,104,88,35);ctx.globalAlpha=1;
        if(!opened&&!ready){ctx.fillStyle='rgba(8,9,8,.86)';ctx.strokeStyle='#8d846e';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-35,11,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#bdb49c';ctx.font='900 10px Georgia';ctx.textAlign='center';ctx.fillText(String(chest.requires.pickaxeLevel||'S'),0,-31)}
        if(!opened&&ready){const sparkle=.45+.35*Math.sin(time*3.1+chest.tier);ctx.strokeStyle='#fff0b1';ctx.globalAlpha=sparkle;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(38,-28);ctx.lineTo(38,-12);ctx.moveTo(30,-20);ctx.lineTo(46,-20);ctx.stroke();ctx.globalAlpha=1}ctx.restore();continue;
      }
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
      if(target&&target.id===rock.id){ctx.strokeStyle=data.edge;ctx.globalAlpha=.5;ctx.lineWidth=2;ctx.lineCap='round';for(let corner=0;corner<4;corner++){ctx.save();ctx.rotate(corner*Math.PI*.5);ctx.beginPath();ctx.moveTo(29,-29);ctx.lineTo(39,-29);ctx.lineTo(39,-19);ctx.stroke();ctx.restore()}ctx.globalAlpha=1}
      ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(0,24,37,13,0,0,Math.PI*2);ctx.fill();
      const hitScale=rock.hit>0?1+rock.hit*.22:1;ctx.scale(hitScale,1/hitScale);
      const assetNode=drawMineralNodeAsset(rock);
      if(!assetNode){
        drawRockBody(rock,data);
        const damageStage=Math.min(3,Math.ceil((rock.shell>0?1-rock.shell/rock.maxShell:1-rock.hp/rock.maxHp)*3));
        ctx.strokeStyle=damageStage>=2?'rgba(25,18,14,.88)':data.edge;ctx.lineWidth=damageStage>=3?4:3;ctx.globalAlpha=damageStage?1:.38;
        ctx.beginPath();ctx.moveTo(-9,-27);ctx.lineTo(4,-7);ctx.lineTo(22,-19);
        if(damageStage>=1){ctx.moveTo(4,-7);ctx.lineTo(13,18)}
        if(damageStage>=2){ctx.moveTo(4,-7);ctx.lineTo(-17,8);ctx.lineTo(-26,21);ctx.moveTo(13,18);ctx.lineTo(27,11)}
        if(damageStage>=3){ctx.moveTo(-17,8);ctx.lineTo(-29,-4);ctx.moveTo(13,18);ctx.lineTo(5,29);ctx.moveTo(22,-19);ctx.lineTo(31,-8)}
        ctx.stroke();ctx.globalAlpha=1;
        if(rock.shell>0){ctx.strokeStyle=data.edge;ctx.globalAlpha=.5;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-2,39,Math.PI*.08,Math.PI*.92);ctx.stroke();ctx.globalAlpha=1}
        if(['moonglass','starshard','astralite','crownstone','ambercore','prismite','lunacore','voidglass','singularity','phasecrystal'].includes(rock.type)){
          ctx.strokeStyle=data.edge;ctx.lineWidth=2;ctx.globalAlpha=.58;ctx.beginPath();ctx.moveTo(-5,-34);ctx.lineTo(2,14);ctx.moveTo(19,-15);ctx.lineTo(24,16);ctx.stroke();ctx.globalAlpha=1;
        }
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

  function playerRenderPose(){
    const drilling=state.drillLevel>0,activeDrill=drilling&&(!!player.swing||input.mineHeld);
    if(drilling){
      const pulse=activeDrill?Math.sin(time*72):0,recoil=activeDrill?.55+Math.sin(time*34)*.22:0;
      return{toolAngle:0,armAngle:0,armX:-recoil,armY:pulse*.18,bodyAngle:activeDrill?-.006+Math.sin(time*34)*.002:0,bodyY:0,active:activeDrill};
    }
    if(!player.swing)return{toolAngle:-.2,armAngle:0,armX:0,armY:0,bodyAngle:0,bodyY:0,active:false};
    const t=clamp(player.swing.elapsed/player.swing.duration,0,1),idle=-.2,windup=-1.08,strike=.58;
    let toolAngle,drive;
    if(t<.18){const u=easeOut(t/.18);toolAngle=idle+(windup-idle)*u;drive=-u}
    else if(t<.38){const u=easeInOut((t-.18)/.2);toolAngle=windup+(strike-windup)*u;drive=-1+u*2}
    else{const u=easeOut((t-.38)/.62);toolAngle=strike+(idle-strike)*u;drive=1-u}
    return{toolAngle,armAngle:(toolAngle-idle)*.16,armX:drive*1.6,armY:-Math.abs(drive)*.55,bodyAngle:drive*.034,bodyY:-Math.sin(t*Math.PI)*.7,active:true};
  }

  function drawPlayerBaseWithoutGrip(body,bodyX,bodyY,scale,crop){
    ctx.drawImage(body,0,0,body.naturalWidth,crop.y,bodyX,bodyY,body.naturalWidth*scale,crop.y*scale);
    ctx.drawImage(body,0,crop.y,crop.x,crop.h,bodyX,bodyY+crop.y*scale,crop.x*scale,crop.h*scale);
    const rightX=crop.x+crop.w,rightWidth=body.naturalWidth-rightX;
    ctx.drawImage(body,rightX,crop.y,rightWidth,crop.h,bodyX+rightX*scale,bodyY+crop.y*scale,rightWidth*scale,crop.h*scale);
    const lowerY=crop.y+crop.h,lowerHeight=body.naturalHeight-lowerY;
    ctx.drawImage(body,0,lowerY,body.naturalWidth,lowerHeight,bodyX,bodyY+lowerY*scale,body.naturalWidth*scale,lowerHeight*scale);
  }

  function drawPlayer(){
    const p=worldToScreen(player.x,player.y),moving=Math.abs(updateInputVector().x)+Math.abs(updateInputVector().y)>.02,bob=moving?Math.sin(player.walk)*2:Math.sin(time*2.4)*1.2,pose=playerRenderPose();
    ctx.save();ctx.translate(p.x,p.y+bob);ctx.scale(player.facing,1);
    ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(0,29,34,12,0,0,Math.PI*2);ctx.fill();
    if(state.drillLevel>0){
      const body=PLAYER_ART.drillCharacters[currentPlayerToolKey()];
      if(imageReady(body)){
        const height=PLAYER_RENDER_CONTRACT.drillCompositeHeight,width=height*(body.naturalWidth/body.naturalHeight),bottom=PLAYER_RENDER_CONTRACT.bodyBottom;
        ctx.save();ctx.translate(pose.armX,pose.armY);ctx.translate(0,bottom-2);ctx.rotate(pose.bodyAngle);ctx.translate(0,-(bottom-2));ctx.drawImage(body,-width*.5,bottom-height,width,height);ctx.restore();
      }
      ctx.restore();return;
    }
    const body=PLAYER_ART.base;
    if(imageReady(body)){
      const bodyHeight=PLAYER_RENDER_CONTRACT.bodyHeight,scale=bodyHeight/body.naturalHeight,bodyWidth=body.naturalWidth*scale,bodyX=-bodyWidth*.5,bodyY=PLAYER_RENDER_CONTRACT.bodyBottom-bodyHeight,crop=PLAYER_RENDER_CONTRACT.gripCrop,pivot=PLAYER_RENDER_CONTRACT.gripPivot,grip=PLAYER_RENDER_CONTRACT.gripPoint;
      ctx.save();ctx.translate(0,PLAYER_RENDER_CONTRACT.bodyBottom-2);ctx.rotate(pose.bodyAngle);ctx.translate(0,-(PLAYER_RENDER_CONTRACT.bodyBottom-2)+pose.bodyY);
      drawPlayerBaseWithoutGrip(body,bodyX,bodyY,scale,crop);
      const pivotX=bodyX+(crop.x+pivot.x)*scale,pivotY=bodyY+(crop.y+pivot.y)*scale,gripX=(grip.x-pivot.x)*scale,gripY=(grip.y-pivot.y)*scale;
      ctx.save();ctx.translate(pivotX+pose.armX,pivotY+pose.armY);ctx.rotate(pose.armAngle);
      drawPlayerToolLayer(pose,gripX,gripY);
      ctx.drawImage(body,crop.x,crop.y,crop.w,crop.h,-pivot.x*scale,-pivot.y*scale,crop.w*scale,crop.h*scale);
      ctx.restore();ctx.restore();
    }
    ctx.restore();
  }

  function drawPlayerToolLayer(pose,gripX,gripY){
    const key=currentPlayerToolKey(),asset=PLAYER_ART.tools[key],config=PLAYER_TOOL_RENDER[key];
    if(!config||!imageReady(asset))return;
    const width=config.width,height=width*(asset.naturalHeight/asset.naturalWidth);
    ctx.save();ctx.translate(gripX,gripY);ctx.rotate(pose.toolAngle-pose.armAngle);
    ctx.drawImage(asset,-width*config.pivotX,-height*config.pivotY,width,height);
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
    const baseLabels=allBaseModules().filter(module=>moduleIsHere(module)).map(module=>[module.kind==='sell'?'SELL CHEST':module.kind==='forge'?'FORGE':'STORAGE CHEST',module.x,module.y-65,module.kind==='forge'?'#f2a35d':module.kind==='sell'?'#e9cb82':'#a9d7a9']);
    const labels=(mine?(currentDepth===2?[]:mine.labels.slice()):[['WAYFARER SHOP',STATIONS.speedShop.x,STATIONS.speedShop.y-75,'#a9efb6']]).concat(baseLabels);
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
    if(event.code==='Escape'){if(!inventoryShade.hidden)closeInventory();else if(!menuShade.hidden)menuShade.hidden=true}
  });
  window.addEventListener('keyup',event=>{input.keys.delete(event.code);if(event.code==='Space'){input.mineHeld=false;mineButton.classList.remove('active')}});
  window.addEventListener('blur',()=>{input.keys.clear();releaseTouchControls()});
  window.addEventListener('pagehide',()=>{releaseTouchControls();saveState(true)});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){releaseTouchControls();saveState(true);if(backgroundMusic&&!backgroundMusic.paused)backgroundMusic.pause()}
    else if(musicStarted)startBackgroundMusic();
  });
  contextButton.addEventListener('click',performContext);
  contextSecondaryButton.addEventListener('click',performSecondaryContext);
  starforgeChoices.addEventListener('click',event=>{const button=event.target.closest('[data-starforge]');if(button&&!button.disabled){unlockAudio();forgeStarVariant(button.dataset.starforge)}});
  inventoryButton.addEventListener('click',()=>{unlockAudio();menuShade.hidden=true;openInventory()});inventoryCloseButton.addEventListener('click',closeInventory);
  autoSortButton.addEventListener('click',autoSortResources);buyChestButton.addEventListener('click',buyStorageChest);
  baseModuleList.addEventListener('click',event=>{const place=event.target.closest('[data-base-place]'),pack=event.target.closest('[data-base-pack]'),take=event.target.closest('[data-chest-take]');if(place)placeBaseModule(place.dataset.basePlace);else if(pack)packBaseModule(pack.dataset.basePack);else if(take)takeAllFromChest(take.dataset.chestTake)});
  inventoryShade.addEventListener('pointerdown',event=>{if(event.target===inventoryShade)closeInventory()});
  menuButton.addEventListener('click',()=>{unlockAudio();inventoryShade.hidden=true;menuShade.hidden=false;updateLedger()});resumeButton.addEventListener('click',()=>menuShade.hidden=true);
  resetButton.addEventListener('click',()=>{if(window.confirm('Reset all Ever Deeper progress?'))resetProgress()});
  menuShade.addEventListener('pointerdown',event=>{if(event.target===menuShade)menuShade.hidden=true});
  window.addEventListener('resize',resize,{passive:true});

  window.__everDeeperTest={
    snapshot:()=>JSON.parse(JSON.stringify({
      build:BUILD,state,scene:currentScene,depth:currentDepth,assetVersion:ASSET_VERSION,music:{asset:MUSIC_PATH.split('?')[0],volume:MUSIC_VOLUME,loop:true,started:musicStarted},assetRendering:{stone:['node'],copper:['wall','node'],gold:['wall','node']},entranceAssetRendering:{mossMine:true,moonMine:true},surfaceAssetRendering:{mossveinGround:true,legacyMossveinGrid:false,legacyMossveinPath:false,legacyMossveinDecorations:false},starterRendering:{sellStation:STARTER_PATHS.sellStation,forgeStation:STARTER_PATHS.forgeStation,storageChest:STARTER_PATHS.storageChest,wayfarerShop:STARTER_PATHS.wayfarerShop,treasureClosed:STARTER_PATHS.treasureClosed,treasureOpen:STARTER_PATHS.treasureOpen,groundDrops:DROP_PATHS,legacyCanvasStations:false,legacyMossveinChests:false,legacyStarterDrops:false},rootwoundRendering:{floor:ROOTWOUND_PATHS.floor,wall:ROOTWOUND_PATHS.wall,nodes:['rootiron','deepstone','ambercore','burrowsteel'],rootironWall:ROOTWOUND_PATHS.rootironWall,shaft:ROOTWOUND_PATHS.shaft,sellStation:ROOTWOUND_PATHS.sellStation,drillForge:ROOTWOUND_PATHS.drillForge,legacyFloorDecorations:false,legacyTerrainTexture:false,legacyDepthShaft:false,legacyDepthStations:false,legacyResourceNodes:false},
      surfaceMoonglassRendering:{ground:SURFACE_MOONGLASS_PATHS.ground,crystals:SURFACE_MOONGLASS_PATHS.crystals,bloomBed:SURFACE_MOONGLASS_PATHS.bloomBed,entrance:MINE_ENTRANCE_PATHS.moonMine,emberdeepSeal:STARTER_PATHS.emberdeepSeal,emberdeepGateOpen:STARTER_PATHS.emberdeepGateOpen,chests:{crystalCache:{closed:SURFACE_MOONGLASS_PATHS.crystalCacheClosed,open:SURFACE_MOONGLASS_PATHS.crystalCacheOpen},reliquary:{closed:SURFACE_MOONGLASS_PATHS.reliquaryClosed,open:SURFACE_MOONGLASS_PATHS.reliquaryOpen}},legacyGrid:false,legacyDecorations:false,legacyChests:false,legacyEntrance:false,legacyEmberdeepSeal:false},
      moonglassRendering:{surfaceGround:SURFACE_MOONGLASS_PATHS.ground,surfaceCrystals:SURFACE_MOONGLASS_PATHS.crystals,bloomBed:SURFACE_MOONGLASS_PATHS.bloomBed,entrance:MINE_ENTRANCE_PATHS.moonMine,emberdeepSeal:STARTER_PATHS.emberdeepSeal,emberdeepGateOpen:STARTER_PATHS.emberdeepGateOpen,chests:{crystalCache:{closed:SURFACE_MOONGLASS_PATHS.crystalCacheClosed,open:SURFACE_MOONGLASS_PATHS.crystalCacheOpen},reliquary:{closed:SURFACE_MOONGLASS_PATHS.reliquaryClosed,open:SURFACE_MOONGLASS_PATHS.reliquaryOpen}},floor:MOONGLASS_PATHS.floor,wall:MOONGLASS_PATHS.wall,routeMarker:MOONGLASS_PATHS.routeMarker,pocket:MOONGLASS_PATHS.pocket,cache:MOONGLASS_PATHS.cache,shrine:MOONGLASS_PATHS.shrine,nodes:{moonglass:MOONGLASS_PATHS.moonglassNode,starshard:MOONGLASS_PATHS.starshardNode},wallHints:{moonglass:MOONGLASS_PATHS.moonglassWall,starshard:MOONGLASS_PATHS.starshardWall},barriers:{moon_prism_gate:MOONGLASS_PATHS.prismFault,moon_star_lock:MOONGLASS_PATHS.starGeode},drops:{moonglass:DROP_PATHS.moonglass,starshard:DROP_PATHS.starshard},legacySurfaceDecorations:false,legacyMineFloor:false,legacyMineTerrain:false,legacyMineWalls:false,legacyBarriers:false,legacyPocketRewards:false,legacyResourceNodes:false},
      prismaticRendering:{floor:PRISMATIC_PATHS.floor,wall:PRISMATIC_PATHS.wall,shaft:PRISMATIC_PATHS.shaft,sellStation:PRISMATIC_PATHS.sellStation,drillForge:PRISMATIC_PATHS.drillForge,pocket:PRISMATIC_PATHS.pocket,cache:PRISMATIC_PATHS.cache,shrine:PRISMATIC_PATHS.shrine,nodes:{prismite:PRISMATIC_PATHS.prismiteNode,deepstone:ROOTWOUND_PATHS.deepstone,lunacore:PRISMATIC_PATHS.lunacoreNode,phasecrystal:PRISMATIC_PATHS.phasecrystalNode},wallHints:{prismite:PRISMATIC_PATHS.prismiteWall,deepstone:PRISMATIC_PATHS.deepstoneWall,lunacore:PRISMATIC_PATHS.lunacoreWall,phasecrystal:PRISMATIC_PATHS.phasecrystalWall},drops:{deepstone:DROP_PATHS.deepstone,prismite:DROP_PATHS.prismite,lunacore:DROP_PATHS.lunacore,phasecrystal:DROP_PATHS.phasecrystal},legacyFloorDecorations:false,legacyTerrainTexture:false,legacyDepthShaft:false,legacyDepthStations:false,legacyPocketRewards:false,legacyResourceNodes:false},
      discoveryRendering:{crystalPocketAsset:'assets/mossvein/magic-crystal-pocket.png',cacheAsset:MOSSVEIN_REWARD_PATHS.cache,shrineAsset:MOSSVEIN_REWARD_PATHS.shrine,legacyCavernRings:false,legacyMossveinPocketRewards:false,biomeGlow:true},characterRendering:{baseAsset:'assets/characters/miner-b.png',activeToolKey:currentPlayerToolKey(),activeRenderAsset:state.drillLevel?PLAYER_DRILL_CHARACTER_PATHS[currentPlayerToolKey()]:PLAYER_TOOL_PATHS[currentPlayerToolKey()],toolLayerCount:Object.keys(PLAYER_TOOL_PATHS).length,drillCompositeCount:Object.keys(PLAYER_DRILL_CHARACTER_PATHS).length,gripCrop:PLAYER_RENDER_CONTRACT.gripCrop,gripPivot:PLAYER_RENDER_CONTRACT.gripPivot,gripPoint:PLAYER_RENDER_CONTRACT.gripPoint,layeredTools:PLAYER_RENDER_CONTRACT.layeredTools,animatedGrip:PLAYER_RENDER_CONTRACT.animatedGrip,bodyReaction:PLAYER_RENDER_CONTRACT.bodyReaction,sharedGripAnchor:PLAYER_RENDER_CONTRACT.sharedGripAnchor,fullDrillComposites:PLAYER_RENDER_CONTRACT.fullDrillComposites,legacyDrillLimbCrops:PLAYER_RENDER_CONTRACT.legacyDrillLimbCrops,legacyCanvasCharacter:PLAYER_RENDER_CONTRACT.legacyCanvasCharacter,legacyCanvasTools:PLAYER_RENDER_CONTRACT.legacyCanvasTools},mineralNodeRenderScale:MINERAL_NODE_RENDER_SCALE,
      starterGateRendering:{moonglassGate:STARTER_PATHS.moonglassGate,legacyStarterGate:false},
      effectivePickaxe:{name:currentPickaxeName(),power:currentPower(),cooldown:currentCooldown(),shellPower:currentShellPower(),bonusYield:currentBonusYieldChance(),emberstoneHits:armoredHitsRequired('emberstone',currentPower(),currentShellPower()),sunslagHits:armoredHitsRequired('sunslag',currentPower(),currentShellPower()),astraliteHits:armoredHitsRequired('astralite',currentPower(),currentShellPower()),depthMainHits:currentMine()&&currentDepth===2?armoredHitsRequired(DEPTH2_RESOURCE_PROFILES[currentScene].main,currentPower(),currentShellPower()):null},
      goal:mainGoal(),guide:(()=>{const guide=visualGuide();return guide?{...guide,distance:distance(player.x,player.y,guide.x,guide.y),visible:distance(player.x,player.y,guide.x,guide.y)>guide.closeRadius}:null})(),markerStyle:{bonusVeinRings:false},toolMode:state.drillLevel?'drill':'pickaxe',protectedCargo:protectedDrillCargo(),sellableCargo:sellableCargo(),movement:{level:state.movementSpeedLevel,multiplier:movementSpeedMultiplier(),nextCost:movementSpeedCost()},miningRush:{...miningRush},lootSweep:{remaining:lootSweepRemaining(),nextAt:state.nextLootSweepAt},
      player:{x:player.x,y:player.y,aimX:player.aimX,aimY:player.aimY},camera:{x:camera.x,y:camera.y,viewWidth,viewHeight},biome:currentBiome().id,
      lighting:{enabled:!!currentMine()&&!!lightCtx,technique:'low-resolution-raycast-lightmap',occlusion:true,bufferScale:LIGHTING.bufferScale,bufferWidth:lightCanvas?lightCanvas.width:0,bufferHeight:lightCanvas?lightCanvas.height:0,darkness:currentDepth===2?LIGHTING.darknessDepth2:LIGHTING.darknessDepth1,beamLength:LIGHTING.beamLength,beamHalfAngle:LIGHTING.beamHalfAngle,maxOreLights:LIGHTING.maxOreLights,oreLights:currentMine()?lightingOreCount:0,rayChecks:currentMine()?lightingRayChecks:0},
      mine:currentMine()?{
        id:currentMine().id,name:currentMineVisual().name,depth:currentDepth,width:currentMine().width,height:currentMine().height,style:currentMineVisual().style,visualPass:mineVisualPass(),dirt:currentMineVisual().dirt,floor:currentMineVisual().floor,solids:currentDepth===1?currentMine().solids:[],solidCount:currentDepth===1?currentMine().solids.length:0,barrierIds:currentDepth===1?currentMine().barriers.map(barrier=>barrier.id):[],labels:currentDepth===1?currentMine().labels.map(label=>label[0]):[],
        depthEntrance:{...depthEntrances[currentScene],discovered:!!state.discoveredDepthEntrances[currentScene],boundaryIndex:mineTerrain[currentScene][1].depthEntrance?[...mineTerrain[currentScene][1].depthEntrance.boundary][0]:null},depthStations:currentDepth===2?depthStations():null,depthResources:currentDepth===2?{...DEPTH2_RESOURCE_PROFILES[currentScene]}:null,
        terrain:{tileSize:MINE_TILE_SIZE,chunkCells:MINE_CHUNK_CELLS,maxHp:currentTerrain().maxHp,totalChunks:Math.ceil(currentTerrain().cols/MINE_CHUNK_CELLS)*Math.ceil(currentTerrain().rows/MINE_CHUNK_CELLS),activeChunks:currentTerrain().chunks.size,cellCount:currentTerrain().cols*currentTerrain().rows,solidCells:terrainSolidCellCount(currentTerrain()),dugCells:state.terrainDug[currentTerrain().stateKey].length,target:nearestTerrainCell(MINING_RANGE),mineralHints:currentMineralHints().map(hint=>({rockId:hint.rock.id,type:hint.rock.type,index:hint.index,sides:hint.sides.slice()}))},
        discovery:{caverns:currentTerrain().caverns.map(cavern=>({id:cavern.id,name:cavern.name,x:cavern.x,y:cavern.y,rx:cavern.rx,ry:cavern.ry,cellCount:cavern.cells.length,boundaryIndex:[...cavern.boundary][0],discovered:cavernIsDiscovered(cavern.id),reward:{...cavern.reward,claimed:!!state.claimedPocketRewards[cavern.reward.id]}})),deposits:discoveriesFor(currentScene,currentDepth).deposits.map(deposit=>({id:deposit.id,type:deposit.type,size:deposit.positions.length,rareFind:!!deposit.rareFind,cavernId:deposit.cavernId||null,pocketRewardId:deposit.pocketRewardId||null,requiresDrillLevel:deposit.requiresDrillLevel||0,drillGated:!!deposit.drillGated}))}
      }:null,
      focus:miningFocus,
      rocks:rocks.map(rock=>({id:rock.id,type:rock.type,x:rock.x,y:rock.y,scene:rock.scene,depth:rock.depth||1,barrierId:rock.barrierId,requiredPickaxe:rock.requiredPickaxe,requiresDeepTool:rock.requiresDeepTool,requiresDrillLevel:rock.requiresDrillLevel||0,veinId:rock.veinId,depositId:rock.depositId,cavernId:rock.cavernId,rareFind:rock.rareFind,pocketRewardId:rock.pocketRewardId,hp:rock.hp,shell:rock.shell,broken:rock.broken,exposed:rockIsExposed(rock)})),
      veins:veins.map(vein=>({id:vein.id,status:vein.status,timer:vein.timer,broken:vein.brokenRockIds.size,total:vein.positions.length})),
      chests:chests.map(chest=>({id:chest.id,name:chest.name,x:chest.x,y:chest.y,ready:chestRequirementMet(chest),opened:!!state.openedChests[chest.id]})),
      groundDrops:groundDrops.map(drop=>({id:drop.id,type:drop.type,amount:drop.amount,x:drop.x,y:drop.y,z:drop.z,age:drop.age,settled:drop.settled,scene:drop.scene,depth:drop.depth,sourceChest:drop.sourceChest,sourcePocket:drop.sourcePocket})),feedback:{floaters:floaters.map(item=>item.text),pickupCount:pickupBatch.count,particleCount:particles.length,shake:miningFeedback.shake,flash:miningFeedback.flash,hitStop:miningFeedback.hitStop,terrainHitIndex:miningFeedback.terrainHitIndex,lastDiscovery:miningFeedback.lastDiscovery,lastDepositBeat:miningFeedback.lastDepositBeat,lastPocketReward:miningFeedback.lastPocketReward},activeContext
    })),
    reset:resetProgress,
    startMusic:()=>{startBackgroundMusic();return backgroundMusic?{src:backgroundMusic.src,volume:backgroundMusic.volume,loop:backgroundMusic.loop,paused:backgroundMusic.paused}:null},
    setPosition:(x,y)=>{const world=currentWorld();player.x=clamp(Number(x),52,world.width-52);player.y=clamp(Number(y),70,world.height-58);updateCamera(true);uiDirty=true},
    setAim:(x,y)=>{const length=Math.hypot(Number(x)||0,Number(y)||0);if(length){player.aimX=Number(x)/length;player.aimY=Number(y)/length;player.facing=player.aimX<0?-1:1}},
    sampleHeadlampRay:()=>{const angle=Math.atan2(player.aimY,player.aimX);return traceLightDistance(player.x+player.facing*8,player.y-12,angle,LIGHTING.beamLength,currentTerrain(),activeMineSolids(),currentWorld())},
    setSwingProgress:value=>{const progress=clamp(Number(value)||0,0,1);player.swing={elapsed:progress,duration:1,hit:false,precision:false,target:'rock'};return{...playerRenderPose()}},
    clearSwing:()=>{player.swing=null;return{...playerRenderPose()}},
    mineOnce:()=>{if(player.swingCooldown>0)update(player.swingCooldown+.001);if(startSwing(true)){update(currentCooldown());update(.021);return true}return false},
    step:seconds=>update(clamp(Number(seconds)||0,0,2)),
    setTimeScale:value=>{timeScale=clamp(Number(value)||1,.25,12)},
    restoreRocks:()=>{for(const rock of rocks){rock.broken=!!(rock.barrierId&&state.clearedMineBarriers[rock.barrierId]||rock.pocketRewardId&&state.claimedPocketRewards[rock.pocketRewardId]);rock.hp=rock.maxHp;rock.shell=rock.maxShell;rock.respawn=rock.broken?Infinity:0;rock.glintActive=0;rock.bonusYield=0}resetVeins();uiDirty=true},
    restoreTerrain:()=>{for(const scene of MINE_SCENES){for(const depth of [1,2]){state.terrainDug[terrainStateKey(scene,depth)]=[];for(const cavern of discoveriesFor(scene,depth).caverns){state.discoveredCaverns[cavern.id]=false;state.claimedPocketRewards[cavern.reward.id]=false;delete state.pendingPocketLoot[cavern.reward.id]}}state.discoveredDepthEntrances[scene]=false;state.visitedDepths[scene]=false}for(const rock of mineRocks)if(rock.pocketRewardId){rock.broken=false;rock.respawn=0;rock.hp=rock.maxHp;rock.shell=rock.maxShell}currentDepth=1;rebuildMineTerrain();uiDirty=true},
    mineTerrainCell:index=>{hitTerrain(Number(index));return terrainTypeAt(currentTerrain(),Number(index)%currentTerrain().cols,Math.floor(Number(index)/currentTerrain().cols))},
    primePrecision:()=>{const rock=nearestRock(MINING_RANGE);if(rock){rock.glintActive=.72;return rock.id}return null},
    grantCargo:(type,amount)=>{if(Object.prototype.hasOwnProperty.call(state.cargo,type)){state.cargo[type]+=Math.max(0,Number(amount)||0);uiDirty=true}},
    grantMined:(type,amount)=>{if(Object.prototype.hasOwnProperty.call(state.mined,type)){state.mined[type]+=Math.max(0,Number(amount)||0);uiDirty=true}},
    breakVeinRock:(veinId,index)=>{const candidates=rocks.filter(rock=>rock.veinId===veinId);const rock=candidates[Math.max(0,Math.min(candidates.length-1,Number(index)||0))];if(rock&&!rock.broken){rock.shell=0;rock.hp=0;breakRock(rock);return rock.id}return null},
    breakDepositRock:(depositId,index)=>{const candidates=rocks.filter(rock=>rock.depositId===depositId);const rock=candidates[Math.max(0,Math.min(candidates.length-1,Number(index)||0))];if(rock&&!rock.broken){rock.shell=0;rock.hp=0;breakRock(rock);return rock.id}return null},
    hitDepositRock:(depositId,index)=>{const candidates=rocks.filter(rock=>rock.depositId===depositId);const rock=candidates[Math.max(0,Math.min(candidates.length-1,Number(index)||0))];if(!rock||rock.broken)return null;const before={hp:rock.hp,shell:rock.shell};hitRock(rock,false);return{id:rock.id,type:rock.type,before,after:{hp:rock.hp,shell:rock.shell},requiresDrillLevel:rock.requiresDrillLevel||0}},
    claimPocketReward:id=>{const terrain=currentTerrain(),cavern=terrain&&terrain.caverns.find(item=>item.reward.id===id);return claimPocketReward(cavern)},
    renderOnce:draw,
    grantGold:amount=>{state.gold+=Math.max(0,Number(amount)||0);uiDirty=true},
    buyMovementSpeed:()=>buyMovementSpeed(),
    activateMiningRush:()=>activateMiningRush(),
    openInventory:()=>openInventory(),
    autoSort:()=>autoSortResources(),
    buyStorageChest:()=>buyStorageChest(),
    placeBaseModule:id=>placeBaseModule(id),
    packBaseModule:id=>packBaseModule(id),
    takeAllFromChest:id=>takeAllFromChest(id),
    setPickaxeLevel:level=>{state.pickaxeLevel=clamp(Math.floor(Number(level)||1),1,PICKAXES.length-1);if(state.pickaxeLevel<PICKAXES.length-1){state.emberMastery=0;state.starforgeVariant=null}uiDirty=true},
    setDrillLevel:level=>{state.drillLevel=clamp(Math.floor(Number(level)||0),0,DRILLS.length-1);uiDirty=true},
    unlockAllAreas:()=>{state.areaUnlocked=true;state.discoveredSecond=true;state.emberdeepUnlocked=true;state.discoveredThird=true;uiDirty=true},
    unlockStarfall:()=>{state.fourthUnlocked=true;state.discoveredFourth=true;uiDirty=true},
    spawnGroundDrops:(type,amount,x=player.x+80,y=player.y)=>spawnGroundDrop(type,amount,x,y),
    collectGroundDrops:()=>{for(const drop of groundDrops)if(drop.scene===currentScene&&drop.depth===currentDepth){drop.x=player.x;drop.y=player.y;drop.z=0;drop.settled=true}updateGroundDrops(.001);uiDirty=true},
    expireGroundDrops:()=>performGlobalLootSweep(false),
    forceGlobalLootSweep:()=>performGlobalLootSweep(false),
    forgeStarVariant:id=>forgeStarVariant(id),
    setStarforgeVariant:id=>{if(STARFORGE_VARIANTS[id]){state.starforgeUnlocked[id]=true;state.starforgeVariant=id;state.pickaxeLevel=PICKAXES.length-1;state.emberMastery=EMBER_MASTERY.length-1;uiDirty=true;return true}return false},
    upgradeDrill:()=>upgradeDrill(),
    sellCargo:()=>sellCargo(),
    enterMine:(scene='mossMine')=>transitionScene(scene),
    exitMine:()=>transitionScene('surface'),
    clearMineBarrier:id=>{const barrier=mineBarrierById(id);if(!barrier)return false;state.clearedMineBarriers[id]=true;for(const rock of mineRocks)if(rock.barrierId===id){rock.broken=true;rock.respawn=Infinity}uiDirty=true;return true},
    discoverCavern:id=>{const terrain=currentTerrain(),cavern=terrain&&terrain.caverns.find(item=>item.id===id);if(!cavern)return false;state.discoveredCaverns[cavern.id]=true;uiDirty=true;return true},
    discoverDepthEntrance:()=>{const entrance=currentTerrain()&&currentTerrain().depthEntrance;if(!entrance)return false;for(const index of entrance.boundary){while(terrainTypeAt(currentTerrain(),index%currentTerrain().cols,Math.floor(index/currentTerrain().cols)))hitTerrain(index);break}return !!state.discoveredDepthEntrances[currentScene]},
    enterDepth:()=>transitionMineDepth(2),
    exitDepth:()=>transitionMineDepth(1),
    openChest:id=>openChest(chestById(id)),
    interact:performContext,
    save:()=>saveState(true)
  };

  resize();updateUI();saveState(true);requestAnimationFrame(frame);
})();
