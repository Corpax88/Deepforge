const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync(require('node:path').join(__dirname,'..','script.js'),'utf8');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const latest=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'..','version.json'),'utf8'));
const repositoryRoot=require('node:path').join(__dirname,'..');
const retiredBrand=['deep','forge'].join('');
const excludedAuditDirectories=new Set(['.git','node_modules','playwright-report','test-results']);
function auditBrandRemoval(directory){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    if(entry.isDirectory()&&excludedAuditDirectories.has(entry.name))continue;
    const absolute=require('node:path').join(directory,entry.name),relative=require('node:path').relative(repositoryRoot,absolute);
    assert.ok(!relative.toLowerCase().includes(retiredBrand),'retired brand remains in path: '+relative);
    if(entry.isDirectory())auditBrandRemoval(absolute);
    else if(entry.isFile())assert.ok(!fs.readFileSync(absolute).toString('latin1').toLowerCase().includes(retiredBrand),'retired brand remains in file: '+relative);
  }
}
auditBrandRemoval(repositoryRoot);
assert.doesNotMatch(source,/drawPlayerDrillLayer|drawPlayerCropAtGrip|offhandCrop|drillRearAnchor|assets\/tools\/drill-/);
assert.match(source,/fullDrillComposites:true,legacyDrillLimbCrops:false/);
assert.equal(latest.version,'02613');
assert.match(html,/version\.json\?t=/);
assert.match(html,/cache:'no-store'/);
assert.match(html,/style\.css\?v=02613/);
assert.match(html,/script\.js\?v=02613/);
assert.match(html,/assets\/branding\/ever-deeper-logo\.png\?v=02613/);
assert.match(html,/<title>Ever Deeper<\/title>/);
assert.match(source,/MUSIC_PATH='assets\/audio\/ever-deeper-drift-loop\.mp3\?v='/);
assert.match(source,/backgroundMusic\.loop=true/);
assert.match(source,/backgroundMusic\.volume=MUSIC_VOLUME/);
const musicAsset=fs.readFileSync(require('node:path').join(__dirname,'..','assets/audio/ever-deeper-drift-loop.mp3'));
assert.ok(musicAsset.length>100000&&musicAsset.length<2000000,'background music must stay within the mobile audio budget');
const logoAsset=fs.readFileSync(require('node:path').join(__dirname,'..','assets/branding/ever-deeper-logo.png'));
assert.equal(logoAsset.toString('ascii',1,4),'PNG');assert.equal(logoAsset[25],6,'logo must use RGBA');assert.ok(logoAsset.length<300000,'logo exceeds mobile asset budget');
function assertPng(relative,width,height,{alpha=true,maxBytes=250000}={}){
  const png=fs.readFileSync(require('node:path').join(repositoryRoot,relative));
  assert.equal(png.toString('ascii',1,4),'PNG',relative+' must be a PNG');
  assert.equal(png.readUInt32BE(16),width,relative+' has the wrong width');
  assert.equal(png.readUInt32BE(20),height,relative+' has the wrong height');
  const preservesAlpha=[4,6].includes(png[25])||png.includes(Buffer.from('tRNS'));
  assert.equal(preservesAlpha,alpha,relative+(alpha?' must preserve transparency':' must be fully opaque'));
  assert.ok(png.length<maxBytes,relative+' exceeds its '+maxBytes+' byte mobile budget');
}
const playerAssets=['assets/characters/miner-b.png','assets/characters/miner-b-drill-burrower.png','assets/characters/miner-b-drill-pulse.png','assets/characters/miner-b-drill-deepcore.png','assets/tools/pickaxe-worn.png','assets/tools/pickaxe-iron.png','assets/tools/pickaxe-runed.png','assets/tools/pickaxe-moonglass.png','assets/tools/pickaxe-ember.png','assets/tools/starforge-crusher.png','assets/tools/starforge-swift.png','assets/tools/starforge-prospector.png'];
for(const relative of playerAssets){const path=require('node:path').join(__dirname,'..',relative),png=fs.readFileSync(path);assert.equal(png.toString('ascii',1,4),'PNG');assert.equal(png[25],6,relative+' must use RGBA');assert.ok(png.length<250000,relative+' exceeds mobile asset budget')}
const pocketAsset=fs.readFileSync(require('node:path').join(__dirname,'..','assets/mossvein/magic-crystal-pocket.png'));
assert.equal(pocketAsset.toString('ascii',1,4),'PNG');assert.ok([4,6].includes(pocketAsset[25])||pocketAsset.includes(Buffer.from('tRNS')),'crystal pocket must preserve alpha');assert.ok(pocketAsset.length<250000,'crystal pocket exceeds mobile asset budget');
const starterProductionAssets=['assets/surface/assay-station.png','assets/surface/forge-station.png','assets/surface/storage-chest.png','assets/surface/wayfarer-shop.png','assets/surface/treasure-cache-closed.png','assets/surface/treasure-cache-open.png','assets/surface/moonglass-gate.png','assets/surface/mossvein-mine-path.png','assets/mossvein/buried-cache.png','assets/mossvein/mining-rush-shrine.png','assets/drops/stone-drop.png','assets/drops/copper-drop.png','assets/drops/gold-drop.png'];
for(const relative of starterProductionAssets){const png=fs.readFileSync(require('node:path').join(__dirname,'..',relative));assert.equal(png.toString('ascii',1,4),'PNG');assert.ok([4,6].includes(png[25])||png.includes(Buffer.from('tRNS')),relative+' must preserve transparency');assert.ok(png.length<180000,relative+' exceeds mobile asset budget')}
assertPng('assets/surface/mossvein-mine-path.png',768,341,{maxBytes:100000});
assertPng('assets/surface/mossvein-ground.png',768,886,{alpha:false,maxBytes:450000});
for(const biome of ['mossvein','moonglass','emberdeep','starfall'])assertPng('assets/surface/road-'+biome+'.png',1024,341,{maxBytes:100000});
const rootwoundAssets=['floor.png','wall.png','rootiron-node.png','deepstone-node.png','ambercore-node.png','burrowsteel-node.png','rootiron-wall.png','depth-shaft.png','sell-station.png','drill-forge.png'];
for(const name of rootwoundAssets){const png=fs.readFileSync(require('node:path').join(__dirname,'..','assets/rootwound',name));assert.equal(png.toString('ascii',1,4),'PNG');assert.ok(png.length<250000,name+' exceeds mobile asset budget');if(name!=='floor.png')assert.ok([4,6].includes(png[25])||png.includes(Buffer.from('tRNS')),name+' must preserve transparency')}
const moonglassSurfaceAssets={
  'assets/surface/moonglass-ground.png':[512,512,{alpha:false,maxBytes:220000}],
  'assets/surface/moonglass-gate-mark.png':[512,341,{maxBytes:100000}],
  'assets/entrances/depth-work-lamp.png':[512,358,{maxBytes:100000}],
  'assets/surface/moonglass-crystals.png':[512,256,{maxBytes:100000}],
  'assets/surface/moonglass-bloom-bed.png':[640,280,{maxBytes:120000}],
  'assets/surface/crystal-cache-closed.png':[384,334,{maxBytes:120000}],
  'assets/surface/crystal-cache-open.png':[384,350,{maxBytes:120000}],
  'assets/surface/moonglass-reliquary-closed.png':[384,334,{maxBytes:120000}],
  'assets/surface/moonglass-reliquary-open.png':[384,350,{maxBytes:120000}],
  'assets/surface/emberdeep-seal.png':[512,470,{maxBytes:180000}],
  'assets/entrances/moonglass-entrance.png':[512,466,{maxBytes:180000}]
};
const moonglassMineAssets={
  'assets/moonglass/floor.png':[512,512,{alpha:false,maxBytes:220000}],
  'assets/moonglass/wall.png':[512,366,{maxBytes:150000}],
  'assets/moonglass/moonglass-node.png':[512,466,{maxBytes:180000}],
  'assets/moonglass/moonglass-wall.png':[341,512,{maxBytes:100000}],
  'assets/moonglass/starshard-node.png':[512,512,{maxBytes:180000}],
  'assets/moonglass/starshard-wall.png':[341,512,{maxBytes:100000}],
  'assets/moonglass/crystal-pocket.png':[640,358,{maxBytes:180000}],
  'assets/moonglass/buried-cache.png':[384,273,{maxBytes:120000}],
  'assets/moonglass/mining-rush-shrine.png':[459,512,{maxBytes:150000}],
  'assets/moonglass/prismatic-fault.png':[384,512,{maxBytes:120000}],
  'assets/moonglass/starbound-geode.png':[384,512,{maxBytes:120000}],
  'assets/moonglass/route-marker.png':[512,256,{maxBytes:120000}]
};
const prismaticAssets={
  'assets/prismatic/floor.png':[512,512,{alpha:false,maxBytes:220000}],
  'assets/prismatic/wall.png':[512,366,{maxBytes:120000}],
  'assets/prismatic/prismite-node.png':[512,466,{maxBytes:180000}],
  'assets/prismatic/prismite-wall.png':[341,512,{maxBytes:100000}],
  'assets/prismatic/lunacore-node.png':[512,512,{maxBytes:180000}],
  'assets/prismatic/lunacore-wall.png':[341,512,{maxBytes:100000}],
  'assets/prismatic/phasecrystal-node.png':[512,466,{maxBytes:180000}],
  'assets/prismatic/phasecrystal-wall.png':[341,512,{maxBytes:100000}],
  'assets/prismatic/deepstone-wall.png':[341,512,{maxBytes:100000}],
  'assets/prismatic/depth-portal.png':[512,444,{maxBytes:180000}],
  'assets/prismatic/sell-station.png':[512,455,{maxBytes:180000}],
  'assets/prismatic/drill-forge.png':[512,512,{maxBytes:180000}],
  'assets/prismatic/crystal-pocket.png':[640,358,{maxBytes:180000}],
  'assets/prismatic/buried-cache.png':[384,273,{maxBytes:120000}],
  'assets/prismatic/mining-rush-shrine.png':[459,512,{maxBytes:150000}]
};
const moonglassDropAssets={
  'assets/drops/moonglass-drop.png':[256,256,{maxBytes:60000}],
  'assets/drops/starshard-drop.png':[256,256,{maxBytes:60000}],
  'assets/drops/deepstone-drop.png':[256,256,{maxBytes:60000}],
  'assets/drops/prismite-drop.png':[256,256,{maxBytes:60000}],
  'assets/drops/lunacore-drop.png':[256,256,{maxBytes:60000}],
  'assets/drops/phasecrystal-drop.png':[256,256,{maxBytes:60000}]
};
for(const [relative,[assetWidth,assetHeight,options]] of Object.entries({...moonglassSurfaceAssets,...moonglassMineAssets,...prismaticAssets,...moonglassDropAssets}))assertPng(relative,assetWidth,assetHeight,options);
const storage=new Map();

function createElement(id){
  const classes=new Set();
  return{
    id,textContent:'',hidden:false,style:{},dataset:{},disabled:false,
    classList:{add:value=>classes.add(value),remove:value=>classes.delete(value),toggle:(value,force)=>force===undefined?(classes.has(value)?classes.delete(value):classes.add(value)):force?classes.add(value):classes.delete(value),contains:value=>classes.has(value)},
    addEventListener(){},setAttribute(name,value){this[name]=String(value)},setPointerCapture(){},contains(){return true},querySelector(){return null},
    getBoundingClientRect(){return{left:0,top:0,width:390,height:700,right:390,bottom:700}}
  };
}

function createRuntime(){
  const elements=new Map();
  const element=id=>{if(!elements.has(id))elements.set(id,createElement(id));return elements.get(id)};
  const gradient={addColorStop(){}};
  const drawCalls=[];
  const canvasContext=new Proxy({}, {get:(_target,key)=>key==='createLinearGradient'||key==='createRadialGradient'?()=>gradient:key==='measureText'?()=>({width:0}):key==='drawImage'?(image,...args)=>drawCalls.push({src:image.src||'[canvas]',args}):()=>{},set:()=>true});
  element('gameCanvas').getContext=()=>canvasContext;
  const document={hidden:false,getElementById:element,addEventListener(){},createElement:tag=>tag==='canvas'?{width:1,height:1,src:'[lightmap]',getContext:()=>canvasContext}:createElement('dynamic-'+tag)};
  const window={devicePixelRatio:2,addEventListener(){},confirm:()=>true};
  class TestAudio{constructor(src){this.src=src;this.volume=1;this.loop=false;this.paused=true;this.preload='';this.playsInline=false}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}}
  class TestImage{constructor(){this.complete=true;this.naturalWidth=512;this.naturalHeight=512;this.decoding='async';this.onload=null;this._src=''}set src(value){this._src=value;if(value.includes('magic-crystal-pocket')){this.naturalWidth=640;this.naturalHeight=358}else if(value.includes('miner-b-drill-burrower')){this.naturalWidth=348;this.naturalHeight=512}else if(value.includes('miner-b-drill-pulse')){this.naturalWidth=361;this.naturalHeight=512}else if(value.includes('miner-b-drill-deepcore')){this.naturalWidth=354;this.naturalHeight=512}else if(value.includes('miner-b')){this.naturalWidth=315;this.naturalHeight=512}else this.naturalWidth=512;queueMicrotask(()=>this.onload&&this.onload())}get src(){return this._src}}
  const browserStorage={
    get length(){return storage.size},key:index=>Array.from(storage.keys())[index]??null,
    getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)
  };
  const context={
    window,document,console,
    localStorage:browserStorage,
    requestAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},
    navigator:{vibrate:()=>true},Image:TestImage,Audio:TestAudio
  };
  window.window=window;window.document=document;window.localStorage=context.localStorage;window.requestAnimationFrame=context.requestAnimationFrame;
  vm.runInContext(source,vm.createContext(context),{filename:'script.js'});
  return{api:window.__everDeeperTest,elements,drawCalls};
}

let runtime=createRuntime();
let api=runtime.api;
assert.equal(api.snapshot().build.version,'0.26.13');
assert.equal(api.snapshot().build.name,'PATH CONNECTIONS');
assert.equal(runtime.elements.get('buildVersion').textContent,'v0.26.13');
assert.equal(api.snapshot().assetVersion,'02613');
assert.equal(JSON.stringify(api.snapshot().music),JSON.stringify({asset:'assets/audio/ever-deeper-drift-loop.mp3',volume:1,loop:true,started:false,enabled:true,effectsEnabled:true}));
assert.equal(JSON.stringify(api.startMusic()),JSON.stringify({src:'assets/audio/ever-deeper-drift-loop.mp3?v=02613',volume:1,loop:true,paused:false}));
assert.equal(api.setAudioSetting('music',false),false);assert.equal(api.snapshot().music.enabled,false);assert.equal(api.snapshot().music.started,false);
assert.equal(api.setAudioSetting('effects',false),false);assert.equal(api.snapshot().music.effectsEnabled,false);
assert.equal(api.setAudioSetting('music',true),true);assert.equal(api.setAudioSetting('effects',true),true);
assert.equal(JSON.stringify(api.snapshot().assetRendering),JSON.stringify({stone:['node'],copper:['wall','node'],gold:['wall','node']}));
assert.equal(JSON.stringify(api.snapshot().entranceAssetRendering),JSON.stringify({mossMine:true,moonMine:true}));
assert.equal(JSON.stringify(api.snapshot().surfaceAssetRendering),JSON.stringify({mossveinGround:true,mainRoad:{mossvein:'assets/surface/road-mossvein.png',moonglass:'assets/surface/road-moonglass.png',emberdeep:'assets/surface/road-emberdeep.png',starfall:'assets/surface/road-starfall.png'},seamlessBiomeRoad:true,roadCrossfadeWidth:80,mossveinMineApproach:'assets/surface/mossvein-mine-path.png',mossveinMineApproachBounds:{x:125,y:728,w:700,h:200},mossveinMinePosition:{x:180,y:830},branchUnderMainRoad:true,naturalCaveOverlap:true,naturalRoadOverlap:true,legacyBakedMainRoad:false,legacyMossveinGrid:false,legacyMossveinPath:false,legacyMossveinDecorations:false}));
assert.equal(JSON.stringify(api.snapshot().starterRendering),JSON.stringify({sellStation:'assets/surface/assay-station.png',forgeStation:'assets/surface/forge-station.png',storageChest:'assets/surface/storage-chest.png',wayfarerShop:'assets/surface/wayfarer-shop.png',treasureClosed:'assets/surface/treasure-cache-closed.png',treasureOpen:'assets/surface/treasure-cache-open.png',groundDrops:{stone:'assets/drops/stone-drop.png',copper:'assets/drops/copper-drop.png',gold:'assets/drops/gold-drop.png',moonglass:'assets/drops/moonglass-drop.png',starshard:'assets/drops/starshard-drop.png',deepstone:'assets/drops/deepstone-drop.png',prismite:'assets/drops/prismite-drop.png',lunacore:'assets/drops/lunacore-drop.png',phasecrystal:'assets/drops/phasecrystal-drop.png'},legacyCanvasStations:false,legacyMossveinChests:false,legacyStarterDrops:false}));
assert.equal(JSON.stringify(api.snapshot().starterGateRendering),JSON.stringify({moonglassGate:'assets/surface/moonglass-gate.png',moonglassGateMark:'assets/surface/moonglass-gate-mark.png',animatedMoonglassTransition:true,openWorldGatesRemoved:true,legacyStarterGate:false}));
assert.equal(JSON.stringify(api.snapshot().rootwoundRendering),JSON.stringify({floor:'assets/rootwound/floor.png',wall:'assets/rootwound/wall.png',nodes:['rootiron','deepstone','ambercore','burrowsteel'],rootironWall:'assets/rootwound/rootiron-wall.png',shaft:'assets/rootwound/depth-shaft.png',sellStation:'assets/rootwound/sell-station.png',drillForge:'assets/rootwound/drill-forge.png',legacyFloorDecorations:false,legacyTerrainTexture:false,legacyDepthShaft:false,legacyDepthStations:false,legacyResourceNodes:false}));
const expectedMoonglassRendering={surfaceGround:'assets/surface/moonglass-ground.png',surfaceCrystals:'assets/surface/moonglass-crystals.png',bloomBed:'assets/surface/moonglass-bloom-bed.png',entrance:'assets/entrances/moonglass-entrance.png',gateMark:'assets/surface/moonglass-gate-mark.png',emberdeepSeal:'assets/surface/emberdeep-seal.png',openBoundaryGatesRemoved:true,animatedGateTransition:true,smoothMossveinBlend:true,backgroundCrystalsDistinct:true,chests:{crystalCache:{closed:'assets/surface/crystal-cache-closed.png',open:'assets/surface/crystal-cache-open.png'},reliquary:{closed:'assets/surface/moonglass-reliquary-closed.png',open:'assets/surface/moonglass-reliquary-open.png'}},floor:'assets/moonglass/floor.png',wall:'assets/moonglass/wall.png',routeMarker:'assets/moonglass/route-marker.png',pocket:'assets/moonglass/crystal-pocket.png',cache:'assets/moonglass/buried-cache.png',shrine:'assets/moonglass/mining-rush-shrine.png',nodes:{moonglass:'assets/moonglass/moonglass-node.png',starshard:'assets/moonglass/starshard-node.png'},wallHints:{moonglass:'assets/moonglass/moonglass-wall.png',starshard:'assets/moonglass/starshard-wall.png'},barriers:{moon_prism_gate:'assets/moonglass/prismatic-fault.png',moon_star_lock:'assets/moonglass/starbound-geode.png'},drops:{moonglass:'assets/drops/moonglass-drop.png',starshard:'assets/drops/starshard-drop.png'},legacySurfaceDecorations:false,legacyMineFloor:false,legacyMineTerrain:false,legacyMineWalls:false,legacyBarriers:false,legacyPocketRewards:false,legacyResourceNodes:false};
const expectedPrismaticRendering={floor:'assets/prismatic/floor.png',wall:'assets/prismatic/wall.png',shaft:'assets/prismatic/depth-portal.png',sellStation:'assets/prismatic/sell-station.png',drillForge:'assets/prismatic/drill-forge.png',pocket:'assets/prismatic/crystal-pocket.png',cache:'assets/prismatic/buried-cache.png',shrine:'assets/prismatic/mining-rush-shrine.png',nodes:{prismite:'assets/prismatic/prismite-node.png',deepstone:'assets/rootwound/deepstone-node.png',lunacore:'assets/prismatic/lunacore-node.png',phasecrystal:'assets/prismatic/phasecrystal-node.png'},wallHints:{prismite:'assets/prismatic/prismite-wall.png',deepstone:'assets/prismatic/deepstone-wall.png',lunacore:'assets/prismatic/lunacore-wall.png',phasecrystal:'assets/prismatic/phasecrystal-wall.png'},drops:{deepstone:'assets/drops/deepstone-drop.png',prismite:'assets/drops/prismite-drop.png',lunacore:'assets/drops/lunacore-drop.png',phasecrystal:'assets/drops/phasecrystal-drop.png'},legacyFloorDecorations:false,legacyTerrainTexture:false,legacyDepthShaft:false,legacyDepthStations:false,legacyPocketRewards:false,legacyResourceNodes:false};
assert.equal(JSON.stringify(api.snapshot().moonglassRendering),JSON.stringify(expectedMoonglassRendering));
assert.equal(JSON.stringify(api.snapshot().prismaticRendering),JSON.stringify(expectedPrismaticRendering));
assert.equal(JSON.stringify(api.snapshot().discoveryRendering),JSON.stringify({crystalPocketAsset:'assets/mossvein/magic-crystal-pocket.png',cacheAsset:'assets/mossvein/buried-cache.png',shrineAsset:'assets/mossvein/mining-rush-shrine.png',legacyCavernRings:false,legacyMossveinPocketRewards:false,biomeGlow:true}));
assert.equal(JSON.stringify(api.snapshot().bonusVeinRendering),JSON.stringify({worldLabels:false,textPrompts:false,sleepingCracks:true,movingReadyPulse:true,radialTimer:true,completionBurst:true}));
assert.doesNotMatch(source,/vein\.label|BONUS VEIN|COOLED/);
assert.equal(JSON.stringify(api.snapshot().characterRendering),JSON.stringify({baseAsset:'assets/characters/miner-b.png',activeToolKey:'pickaxe-worn',activeRenderAsset:'assets/tools/pickaxe-worn.png',toolLayerCount:8,drillCompositeCount:3,gripCrop:{x:246,y:307,w:69,h:101},gripPivot:{x:14,y:24},gripPoint:{x:42,y:50},layeredTools:true,animatedGrip:true,bodyReaction:true,sharedGripAnchor:true,fullDrillComposites:true,legacyDrillLimbCrops:false,legacyCanvasCharacter:false,legacyCanvasTools:false}));
function assertRendered(drawCalls,paths){for(const path of paths)assert.ok(drawCalls.some(call=>call.src.includes(path)),path+' must render')}
function renderAt(testRuntime,testApi,x,y,paths){testApi.setPosition(x,y);testRuntime.drawCalls.length=0;testApi.renderOnce();assertRendered(testRuntime.drawCalls,paths)}
function terrainIndexForRock(snapshot,rock){const cols=Math.ceil(snapshot.mine.width/snapshot.mine.terrain.tileSize);return Math.floor(rock.y/snapshot.mine.terrain.tileSize)*cols+Math.floor(rock.x/snapshot.mine.terrain.tileSize)}
function exposeRock(testApi,rock,maxHits=8){for(let hit=0;hit<maxHits&&!testApi.snapshot().rocks.find(item=>item.id===rock.id).exposed;hit++)testApi.mineTerrainCell(terrainIndexForRock(testApi.snapshot(),rock));assert.equal(testApi.snapshot().rocks.find(item=>item.id===rock.id).exposed,true,rock.type+' test node must be exposed')}

const storageBeforeMoonglassRendering=new Map(storage),productionRuntime=createRuntime(),productionApi=productionRuntime.api;
productionApi.reset();
const surfaceRoadRocks=productionApi.snapshot().rocks.filter(rock=>rock.scene==='surface');
assert.equal(surfaceRoadRocks.some(rock=>rock.y>=620&&rock.y<=830),false,'main road must remain clear of resource nodes');
assert.equal(surfaceRoadRocks.some(rock=>rock.x>=100&&rock.x<=825&&rock.y>=730&&rock.y<=960),false,'Mossvein branch road must remain clear of resource nodes');
assert.equal(surfaceRoadRocks.some(rock=>Math.hypot(rock.x-1450,rock.y-850)<125),false,'Moonglass entrance must remain clear of resource nodes');
assert.equal(JSON.stringify(surfaceRoadRocks.filter(rock=>rock.veinId==='moonglass_bloom').map(rock=>[rock.x,rock.y])),JSON.stringify([[1593,504],[1665,504],[1742,504]]),'Moonglass Bloom nodes must align with the three platform sockets');
renderAt(productionRuntime,productionApi,180,830,['assets/surface/mossvein-mine-path.png','assets/surface/road-mossvein.png','assets/entrances/mossvein-entrance.png']);
renderAt(productionRuntime,productionApi,1500,720,['assets/surface/road-moonglass.png']);
renderAt(productionRuntime,productionApi,2600,720,['assets/surface/road-emberdeep.png']);
renderAt(productionRuntime,productionApi,3700,720,['assets/surface/road-starfall.png']);
renderAt(productionRuntime,productionApi,2175,650,['assets/surface/moonglass-ground.png','assets/surface/emberdeep-seal.png']);
productionApi.startMoonglassGateTransition();
renderAt(productionRuntime,productionApi,1110,650,['assets/surface/moonglass-gate.png','assets/surface/moonglass-gate-mark.png']);
assert.equal(JSON.stringify(productionApi.snapshot().moonglassGateTransition),JSON.stringify({active:true,progress:0}));
productionApi.step(.7);
renderAt(productionRuntime,productionApi,1110,650,['assets/surface/moonglass-gate.png','assets/surface/moonglass-gate-mark.png','assets/entrances/moonglass-entrance.png']);
assert.ok(productionApi.snapshot().moonglassGateTransition.progress>0&&productionApi.snapshot().moonglassGateTransition.progress<1);
productionApi.step(1.2);
renderAt(productionRuntime,productionApi,1110,650,['assets/surface/moonglass-gate-mark.png','assets/entrances/moonglass-entrance.png']);
assert.equal(JSON.stringify(productionApi.snapshot().moonglassGateTransition),JSON.stringify({active:false,progress:1}));
assert.ok(!productionRuntime.drawCalls.some(call=>call.src.includes('assets/surface/moonglass-gate.png')),'the sunk Moonglass gate must leave only its ground mark');
productionApi.unlockAllAreas();productionApi.setPickaxeLevel(4);
renderAt(productionRuntime,productionApi,1450,850,['assets/surface/moonglass-ground.png','assets/surface/moonglass-crystals.png','assets/surface/moonglass-gate-mark.png','assets/entrances/moonglass-entrance.png']);
assert.ok(!productionRuntime.drawCalls.some(call=>call.src.includes('assets/surface/moonglass-gate.png')),'opened Moonglass boundary gate must disappear');
renderAt(productionRuntime,productionApi,1665,500,['assets/surface/moonglass-ground.png','assets/surface/moonglass-bloom-bed.png']);
renderAt(productionRuntime,productionApi,2175,650,['assets/surface/moonglass-ground.png']);
assert.ok(!productionRuntime.drawCalls.some(call=>call.src.includes('assets/surface/emberdeep-seal.png')),'opened Emberdeep boundary gate must disappear');
renderAt(productionRuntime,productionApi,1285,1110,['assets/surface/crystal-cache-closed.png']);productionApi.openChest('moon_cache');renderAt(productionRuntime,productionApi,1285,1110,['assets/surface/crystal-cache-open.png']);
renderAt(productionRuntime,productionApi,2070,215,['assets/surface/moonglass-reliquary-closed.png']);productionApi.openChest('moon_reliquary');renderAt(productionRuntime,productionApi,2070,215,['assets/surface/moonglass-reliquary-open.png']);
productionApi.spawnGroundDrops('moonglass',1,1285,1110);productionApi.spawnGroundDrops('starshard',1,1285,1110);renderAt(productionRuntime,productionApi,1285,1110,['assets/drops/moonglass-drop.png','assets/drops/starshard-drop.png']);productionApi.forceGlobalLootSweep();

productionApi.setStarforgeVariant('swift');productionApi.enterMine('moonMine');
assert.equal(productionApi.snapshot().mine.visualPass,'moonglass-production-assets-v1');
renderAt(productionRuntime,productionApi,150,1180,['assets/moonglass/floor.png','assets/entrances/moonglass-entrance.png']);
renderAt(productionRuntime,productionApi,535,690,['assets/moonglass/floor.png','assets/moonglass/wall.png','assets/moonglass/route-marker.png','assets/moonglass/prismatic-fault.png','assets/moonglass/moonglass-node.png']);
renderAt(productionRuntime,productionApi,1055,500,['assets/moonglass/starbound-geode.png']);
let productionSnapshot=productionApi.snapshot(),buriedMoonglass=productionSnapshot.rocks.find(rock=>rock.scene==='moonMine'&&rock.depth===1&&rock.type==='moonglass'&&rock.depositId&&!rock.cavernId&&!rock.exposed);
assert.ok(buriedMoonglass);const moonCols=Math.ceil(productionSnapshot.mine.width/productionSnapshot.mine.terrain.tileSize),moonIndex=terrainIndexForRock(productionSnapshot,buriedMoonglass);
for(const neighbor of [moonIndex-1,moonIndex+1,moonIndex-moonCols,moonIndex+moonCols]){productionApi.mineTerrainCell(neighbor);if(productionApi.snapshot().mine.terrain.mineralHints.some(hint=>hint.rockId===buriedMoonglass.id))break}
assert.ok(productionApi.snapshot().mine.terrain.mineralHints.some(hint=>hint.rockId===buriedMoonglass.id));renderAt(productionRuntime,productionApi,buriedMoonglass.x,buriedMoonglass.y,['assets/moonglass/moonglass-wall.png']);
exposeRock(productionApi,buriedMoonglass);renderAt(productionRuntime,productionApi,buriedMoonglass.x,buriedMoonglass.y,['assets/moonglass/moonglass-node.png']);
const moonCacheCavern=productionApi.snapshot().mine.discovery.caverns.find(cavern=>cavern.reward.kind==='cache');productionApi.mineTerrainCell(moonCacheCavern.boundaryIndex);renderAt(productionRuntime,productionApi,moonCacheCavern.x,moonCacheCavern.y,['assets/moonglass/crystal-pocket.png','assets/moonglass/buried-cache.png']);
const moonShrineCavern=productionApi.snapshot().mine.discovery.caverns.find(cavern=>cavern.reward.kind==='shrine');productionApi.mineTerrainCell(moonShrineCavern.boundaryIndex);renderAt(productionRuntime,productionApi,moonShrineCavern.x,moonShrineCavern.y,['assets/moonglass/crystal-pocket.png','assets/moonglass/mining-rush-shrine.png']);

assert.equal(productionApi.discoverDepthEntrance(),true);assert.equal(productionApi.enterDepth(),true);productionApi.setDrillLevel(2);productionSnapshot=productionApi.snapshot();
assert.equal(productionSnapshot.mine.visualPass,'prismatic-production-assets-v1');
assert.equal(JSON.stringify(productionSnapshot.mine.depthResources),JSON.stringify({main:'prismite',secondary:'deepstone',rare:'lunacore'}));
assert.ok(productionSnapshot.mine.discovery.deposits.some(deposit=>deposit.type==='phasecrystal'&&deposit.drillGated&&deposit.requiresDrillLevel===2));
renderAt(productionRuntime,productionApi,productionSnapshot.mine.depthEntrance.x,productionSnapshot.mine.depthEntrance.y,['assets/prismatic/floor.png','assets/prismatic/wall.png','assets/prismatic/depth-portal.png','assets/prismatic/sell-station.png','assets/prismatic/drill-forge.png']);
const buriedPrismite=productionSnapshot.rocks.find(rock=>rock.scene==='moonMine'&&rock.depth===2&&rock.type==='prismite'&&rock.depositId&&!rock.cavernId&&!rock.exposed),prismaticCols=Math.ceil(productionSnapshot.mine.width/productionSnapshot.mine.terrain.tileSize),prismiteIndex=terrainIndexForRock(productionSnapshot,buriedPrismite);
for(const neighbor of [prismiteIndex-1,prismiteIndex+1,prismiteIndex-prismaticCols,prismiteIndex+prismaticCols]){productionApi.mineTerrainCell(neighbor);productionApi.mineTerrainCell(neighbor);if(productionApi.snapshot().mine.terrain.mineralHints.some(hint=>hint.rockId===buriedPrismite.id))break}
assert.ok(productionApi.snapshot().mine.terrain.mineralHints.some(hint=>hint.rockId===buriedPrismite.id));renderAt(productionRuntime,productionApi,buriedPrismite.x,buriedPrismite.y,['assets/prismatic/prismite-wall.png']);
for(const [type,path] of [['prismite','assets/prismatic/prismite-node.png'],['deepstone','assets/rootwound/deepstone-node.png'],['lunacore','assets/prismatic/lunacore-node.png'],['phasecrystal','assets/prismatic/phasecrystal-node.png']]){const rock=productionApi.snapshot().rocks.find(item=>item.scene==='moonMine'&&item.depth===2&&item.type===type&&item.depositId&&!item.cavernId&&!item.broken);assert.ok(rock,type+' production node is missing');exposeRock(productionApi,rock);renderAt(productionRuntime,productionApi,rock.x,rock.y,[path])}
const prismaticCache=productionApi.snapshot().mine.discovery.caverns.find(cavern=>cavern.reward.kind==='cache');productionApi.mineTerrainCell(prismaticCache.boundaryIndex);productionApi.mineTerrainCell(prismaticCache.boundaryIndex);renderAt(productionRuntime,productionApi,prismaticCache.x,prismaticCache.y,['assets/prismatic/crystal-pocket.png','assets/prismatic/buried-cache.png']);
const prismaticShrine=productionApi.snapshot().mine.discovery.caverns.find(cavern=>cavern.reward.kind==='shrine');productionApi.mineTerrainCell(prismaticShrine.boundaryIndex);productionApi.mineTerrainCell(prismaticShrine.boundaryIndex);renderAt(productionRuntime,productionApi,prismaticShrine.x,prismaticShrine.y,['assets/prismatic/crystal-pocket.png','assets/prismatic/mining-rush-shrine.png']);
for(const type of ['deepstone','prismite','lunacore','phasecrystal'])productionApi.spawnGroundDrops(type,1,productionApi.snapshot().player.x,productionApi.snapshot().player.y);productionRuntime.drawCalls.length=0;productionApi.renderOnce();assertRendered(productionRuntime.drawCalls,['assets/drops/deepstone-drop.png','assets/drops/prismite-drop.png','assets/drops/lunacore-drop.png','assets/drops/phasecrystal-drop.png']);
storage.clear();for(const [key,value] of storageBeforeMoonglassRendering)storage.set(key,value);

api.setPosition(455,350);runtime.drawCalls.length=0;api.renderOnce();
for(const asset of ['assay-station.png','forge-station.png','storage-chest.png','wayfarer-shop.png'])assert.ok(runtime.drawCalls.some(call=>call.src.includes(asset)),asset+' must render in the starter place');
for(const type of ['stone','copper','gold'])api.spawnGroundDrops(type,1,455,350);
runtime.drawCalls.length=0;api.renderOnce();for(const type of ['stone','copper','gold'])assert.ok(runtime.drawCalls.some(call=>call.src.includes(type+'-drop.png')),type+' drop asset must render');
api.setPickaxeLevel(2);api.setPosition(980,205);runtime.drawCalls.length=0;api.renderOnce();assert.ok(runtime.drawCalls.some(call=>call.src.includes('treasure-cache-closed.png')));
api.openChest('moss_ironbound');assert.equal(api.snapshot().state.openedChests.moss_ironbound,true);runtime.drawCalls.length=0;api.renderOnce();assert.ok(runtime.drawCalls.some(call=>call.src.includes('treasure-cache-open.png')));api.reset();
api.setPosition(1045,650);runtime.drawCalls.length=0;api.renderOnce();assert.ok(runtime.drawCalls.some(call=>call.src.includes('moonglass-gate.png')));api.reset();
const pickaxeKeys=['pickaxe-worn','pickaxe-iron','pickaxe-runed','pickaxe-moonglass','pickaxe-ember'];
function assertPickaxeLayers(key){runtime.drawCalls.length=0;api.renderOnce();assert.equal(runtime.drawCalls.filter(call=>call.src.includes('assets/characters/miner-b.png')).length,5);const tools=runtime.drawCalls.filter(call=>call.src.includes('assets/tools/'));assert.equal(tools.length,1);assert.ok(tools[0].src.includes(key+'.png'))}
function assertDrillComposite(key){runtime.drawCalls.length=0;api.renderOnce();const composites=runtime.drawCalls.filter(call=>call.src.includes('assets/characters/miner-b-drill-'));assert.equal(composites.length,1);assert.ok(composites[0].src.includes(key+'.png'));assert.equal(runtime.drawCalls.filter(call=>call.src.includes('assets/characters/miner-b.png')).length,0);assert.equal(runtime.drawCalls.filter(call=>call.src.includes('assets/tools/')).length,0)}
for(let level=1;level<=5;level++){api.setDrillLevel(0);api.setPickaxeLevel(level);assert.equal(api.snapshot().characterRendering.activeToolKey,pickaxeKeys[level-1]);assertPickaxeLayers(pickaxeKeys[level-1])}
for(const variant of ['crusher','swift','prospector']){api.setDrillLevel(0);api.setStarforgeVariant(variant);assert.equal(api.snapshot().characterRendering.activeToolKey,'starforge-'+variant);assertPickaxeLayers('starforge-'+variant)}
for(const [level,key] of [[1,'drill-burrower'],[2,'drill-pulse'],[3,'drill-deepcore']]){api.setDrillLevel(level);assert.equal(api.snapshot().characterRendering.activeToolKey,key);assert.equal(api.snapshot().characterRendering.activeRenderAsset,'assets/characters/miner-b-'+key+'.png');assertDrillComposite(key)}
api.setDrillLevel(0);api.setPickaxeLevel(1);
let pose=api.clearSwing();assert.equal(JSON.stringify(pose),JSON.stringify({toolAngle:-.2,armAngle:0,armX:0,armY:0,bodyAngle:0,bodyY:0,active:false}));
pose=api.setSwingProgress(.18);assert.ok(pose.toolAngle<-.99);assert.ok(pose.armAngle<-.12);assert.ok(pose.armX<0);assert.ok(pose.bodyAngle<0);assertPickaxeLayers('pickaxe-worn');
pose=api.setSwingProgress(.38);assert.ok(pose.toolAngle>.5);assert.ok(pose.armAngle>.1);assert.ok(pose.armX>0);assert.ok(pose.bodyAngle>0);assertPickaxeLayers('pickaxe-worn');
api.setDrillLevel(3);pose=api.setSwingProgress(.2);assert.equal(pose.toolAngle,0);assert.ok(pose.armX<0);assert.equal(pose.active,true);assertDrillComposite('drill-deepcore');
api.clearSwing();api.setDrillLevel(0);
api.reset();
assert.equal(api.snapshot().mineralNodeRenderScale,.85);
assert.equal(api.snapshot().lighting.enabled,false);
let openingGuide=api.snapshot().guide;
assert.equal(openingGuide.kind,'rock');assert.equal(openingGuide.scene,'surface');assert.equal(openingGuide.visible,true);
api.setPosition(openingGuide.x,openingGuide.y);assert.equal(api.snapshot().guide.visible,false);
assert.equal(api.snapshot().markerStyle.bonusVeinRings,false);api.reset();

api.unlockAllAreas();api.unlockStarfall();api.enterMine('starMine');
let fallenPocket=api.snapshot().mine.discovery.caverns.find(item=>item.name==='Fallen Pocket');
api.mineTerrainCell(fallenPocket.boundaryIndex);api.mineTerrainCell(fallenPocket.boundaryIndex);
api.setPosition(fallenPocket.x,fallenPocket.y);
runtime.drawCalls.length=0;assert.doesNotThrow(()=>api.renderOnce());
assert.equal(runtime.drawCalls.filter(call=>call.src.includes('assets/mossvein/magic-crystal-pocket.png')).length,1);
api.claimPocketReward(fallenPocket.reward.id);
assert.equal(api.snapshot().state.claimedPocketRewards[fallenPocket.reward.id],true);
api.exitMine();

const storageBeforeLighting=new Map(storage),lightingRuntime=createRuntime(),lightingApi=lightingRuntime.api;lightingApi.enterMine('mossMine');
let glowingRock=lightingApi.snapshot().rocks.find(rock=>rock.scene==='mossMine'&&rock.depth===1&&rock.type!=='stone'&&rock.type!=='deepstone'&&!rock.cavernId&&!rock.broken);
assert.ok(glowingRock);const lightMine=lightingApi.snapshot().mine,lightCols=Math.ceil(lightMine.width/lightMine.terrain.tileSize),lightIndex=Math.floor(glowingRock.y/lightMine.terrain.tileSize)*lightCols+Math.floor(glowingRock.x/lightMine.terrain.tileSize);
for(let hit=0;hit<8;hit++)lightingApi.mineTerrainCell(lightIndex);glowingRock=lightingApi.snapshot().rocks.find(rock=>rock.id===glowingRock.id);assert.equal(glowingRock.exposed,true);lightingApi.setPosition(glowingRock.x,glowingRock.y);lightingApi.renderOnce();
const caveLighting=lightingApi.snapshot().lighting;
assert.equal(JSON.stringify({enabled:caveLighting.enabled,technique:caveLighting.technique,occlusion:caveLighting.occlusion,bufferScale:caveLighting.bufferScale,maxOreLights:caveLighting.maxOreLights,maxNaturalLights:caveLighting.maxNaturalLights}),JSON.stringify({enabled:true,technique:'low-resolution-raycast-lightmap',occlusion:true,bufferScale:.34,maxOreLights:16,maxNaturalLights:22}));
assert.ok(caveLighting.bufferWidth>0&&caveLighting.bufferHeight>0);assert.ok(caveLighting.oreLights>0&&caveLighting.oreLights<=16);assert.ok(caveLighting.naturalLights>0&&caveLighting.naturalLights<=22);assert.ok(caveLighting.sources.some(source=>source.kind==='rockOre'));assert.ok(caveLighting.rayChecks>0);
assert.ok(caveLighting.hierarchy.stone<caveLighting.hierarchy.rockOre&&caveLighting.hierarchy.rockOre<caveLighting.hierarchy.wallOre);
assert.ok(caveLighting.hierarchy.wallOre<caveLighting.hierarchy.depthLamp&&caveLighting.hierarchy.depthLamp<caveLighting.hierarchy.bonusCrystalCollected&&caveLighting.hierarchy.bonusCrystalCollected<caveLighting.hierarchy.bonusCrystal);
const naturallyLitStone=lightingApi.snapshot().rocks.find(rock=>rock.scene==='mossMine'&&rock.depth===1&&rock.type==='stone'&&!rock.broken&&!rock.barrierId);assert.ok(naturallyLitStone);exposeRock(lightingApi,naturallyLitStone);lightingApi.setPosition(naturallyLitStone.x,naturallyLitStone.y);lightingApi.renderOnce();const stoneLight=lightingApi.snapshot().lighting.sources.find(source=>source.kind==='stone');assert.ok(stoneLight);assert.equal(stoneLight.intensity,caveLighting.hierarchy.stone);
let wallOre=lightingApi.snapshot().rocks.find(rock=>rock.scene==='mossMine'&&rock.depth===1&&rock.depositId&&!rock.cavernId&&!rock.exposed&&!rock.broken);assert.ok(wallOre);const wallCols=Math.ceil(lightMine.width/lightMine.terrain.tileSize),wallIndex=Math.floor(wallOre.y/lightMine.terrain.tileSize)*wallCols+Math.floor(wallOre.x/lightMine.terrain.tileSize);for(const neighbor of [wallIndex-1,wallIndex+1,wallIndex-wallCols,wallIndex+wallCols]){lightingApi.mineTerrainCell(neighbor);lightingApi.mineTerrainCell(neighbor);if(lightingApi.snapshot().mine.terrain.mineralHints.some(hint=>hint.rockId===wallOre.id))break}assert.ok(lightingApi.snapshot().mine.terrain.mineralHints.some(hint=>hint.rockId===wallOre.id));lightingApi.setPosition(wallOre.x,wallOre.y);lightingApi.renderOnce();const wallLight=lightingApi.snapshot().lighting.sources.find(source=>source.kind==='wallOre');assert.ok(wallLight);assert.ok(wallLight.intensity>=caveLighting.hierarchy.wallOre);
const lightingBenchmarkStarted=process.hrtime.bigint();for(let frame=0;frame<90;frame++)lightingApi.renderOnce();const lightingAverageMs=Number(process.hrtime.bigint()-lightingBenchmarkStarted)/1e6/90;assert.ok(lightingAverageMs<16.7,'lighting render budget exceeded: '+lightingAverageMs.toFixed(2)+'ms');
const litCache=lightingApi.snapshot().mine.discovery.caverns.find(cavern=>cavern.reward.kind==='cache');for(let hit=0;hit<4&&!lightingApi.snapshot().mine.discovery.caverns.find(cavern=>cavern.id===litCache.id).discovered;hit++)lightingApi.mineTerrainCell(litCache.boundaryIndex);lightingApi.setPosition(litCache.x,litCache.y);lightingApi.renderOnce();
let bonusLight=lightingApi.snapshot().lighting.sources.find(source=>source.kind==='bonusCrystal');assert.ok(bonusLight);assert.equal(bonusLight.intensity,caveLighting.hierarchy.bonusCrystal);assert.equal(lightingApi.claimPocketReward(litCache.reward.id),true);lightingApi.renderOnce();
bonusLight=lightingApi.snapshot().lighting.sources.find(source=>source.kind==='bonusCrystalCollected');assert.ok(bonusLight);assert.equal(bonusLight.intensity,caveLighting.hierarchy.bonusCrystalCollected);
assert.equal(lightingApi.discoverDepthEntrance(),true);const litEntrance=lightingApi.snapshot().mine.depthEntrance;lightingApi.setPosition(litEntrance.x,litEntrance.y);lightingRuntime.drawCalls.length=0;lightingApi.renderOnce();const lampLight=lightingApi.snapshot().lighting.sources.find(source=>source.kind==='depthLamp');assert.ok(lampLight);assert.equal(lampLight.intensity,caveLighting.hierarchy.depthLamp);assert.equal(lightingApi.snapshot().lighting.depthLampAsset,'assets/entrances/depth-work-lamp.png');assertRendered(lightingRuntime.drawCalls,['assets/entrances/depth-work-lamp.png']);
storage.clear();for(const [key,value] of storageBeforeLighting)storage.set(key,value);
api.enterMine('mossMine');
assert.equal(api.snapshot().mine.visualPass,'mossvein-production-art-v2');
api.setPosition(180,503);api.setAim(.899,-.438);
let before=api.snapshot(),target=before.mine.terrain.target;
assert.ok(target);
assert.ok(api.sampleHeadlampRay()<caveLighting.beamLength);
api.mineTerrainCell(target.index);
let after=api.snapshot();
assert.equal(after.mine.terrain.target.index,target.index);
assert.ok(after.mine.terrain.target.hp<target.hp);
assert.equal(after.feedback.terrainHitIndex,target.index);
assert.equal(after.feedback.shake,0);
assert.equal(after.feedback.flash,0);
assert.ok(after.feedback.particleCount>0&&after.feedback.particleCount<=260);

const buriedMineral=after.rocks.find(rock=>rock.scene==='mossMine'&&rock.depth===1&&rock.depositId&&!rock.cavernId&&!rock.exposed);
assert.ok(buriedMineral);
const buriedCol=Math.floor(buriedMineral.x/48),buriedRow=Math.floor(buriedMineral.y/48),buriedIndex=buriedRow*after.mine.terrain.cellCount/(Math.ceil(after.mine.height/48))+buriedCol;
for(const neighbor of [buriedIndex-1,buriedIndex+1,buriedIndex-Math.ceil(after.mine.width/48),buriedIndex+Math.ceil(after.mine.width/48)]){
  api.mineTerrainCell(neighbor);api.mineTerrainCell(neighbor);
  if(api.snapshot().mine.terrain.mineralHints.some(hint=>hint.rockId===buriedMineral.id))break;
}
after=api.snapshot();const seam=after.mine.terrain.mineralHints.find(hint=>hint.rockId===buriedMineral.id);
assert.ok(seam);assert.equal(seam.type,buriedMineral.type);assert.ok(seam.sides.length>=1);assert.equal(after.rocks.find(rock=>rock.id===buriedMineral.id).exposed,false);

const deposit=after.mine.discovery.deposits.find(item=>!item.rareFind);
for(let index=0;index<deposit.size;index++)api.breakDepositRock(deposit.id,index);
after=api.snapshot();
assert.equal(after.feedback.lastDepositBeat.id,deposit.id);
assert.equal(after.feedback.lastDepositBeat.type,deposit.type);
assert.equal(after.feedback.lastDepositBeat.broken,deposit.size);
assert.equal(after.feedback.lastDepositBeat.total,deposit.size);
assert.equal(after.feedback.lastDepositBeat.jackpot,true);
assert.ok(after.feedback.floaters.includes('VEIN CLEARED!'));
assert.ok(after.feedback.particleCount<=260);

api.restoreTerrain();
before=api.snapshot();
const cacheCavern=before.mine.discovery.caverns.find(item=>item.reward.kind==='cache');
assert.ok(before.mine.discovery.caverns.every(item=>['cache','crystal','motherlode','shrine'].includes(item.reward.kind)));
const cargoBefore=Object.values(before.state.cargo).reduce((total,amount)=>total+amount,0);
api.mineTerrainCell(cacheCavern.boundaryIndex);api.mineTerrainCell(cacheCavern.boundaryIndex);
api.setPosition(cacheCavern.x,cacheCavern.y);runtime.drawCalls.length=0;api.renderOnce();assert.ok(runtime.drawCalls.some(call=>call.src.includes('assets/mossvein/buried-cache.png')));
api.claimPocketReward(cacheCavern.reward.id);api.save();
after=api.snapshot();
assert.equal(after.mine.discovery.caverns.find(item=>item.id===cacheCavern.id).reward.claimed,true);
assert.equal(after.feedback.lastPocketReward.kind,'cache');
assert.ok(Object.values(after.state.cargo).reduce((total,amount)=>total+amount,0)>cargoBefore||after.groundDrops.some(drop=>drop.sourcePocket===cacheCavern.reward.id));
const shrineCavern=after.mine.discovery.caverns.find(item=>item.reward.kind==='shrine');
api.mineTerrainCell(shrineCavern.boundaryIndex);api.mineTerrainCell(shrineCavern.boundaryIndex);api.setPosition(shrineCavern.x,shrineCavern.y);runtime.drawCalls.length=0;api.renderOnce();assert.ok(runtime.drawCalls.some(call=>call.src.includes('assets/mossvein/mining-rush-shrine.png')));

const motherlodeCavern=after.mine.discovery.caverns.find(item=>item.reward.kind==='motherlode');
api.mineTerrainCell(motherlodeCavern.boundaryIndex);api.mineTerrainCell(motherlodeCavern.boundaryIndex);
const motherlodeDeposit=api.snapshot().mine.discovery.deposits.find(item=>item.pocketRewardId===motherlodeCavern.reward.id);
for(let index=0;index<motherlodeDeposit.size;index++)api.breakDepositRock(motherlodeDeposit.id,index);
after=api.snapshot();
assert.equal(after.state.claimedPocketRewards[motherlodeCavern.reward.id],true);
assert.equal(after.feedback.lastPocketReward.kind,'motherlode');
assert.ok(after.rocks.filter(rock=>rock.pocketRewardId===motherlodeCavern.reward.id).every(rock=>rock.broken));

before=api.snapshot();
const rareFind=before.rocks.find(rock=>rock.scene==='mossMine'&&rock.rareFind);
const cavern=before.mine.discovery.caverns.find(item=>item.id===rareFind.cavernId);
api.mineTerrainCell(cavern.boundaryIndex);api.mineTerrainCell(cavern.boundaryIndex);api.save();
after=api.snapshot();
assert.equal(after.mine.discovery.caverns.find(item=>item.id===cavern.id).discovered,true);
assert.equal(after.rocks.find(rock=>rock.id===rareFind.id).exposed,true);
assert.equal(after.feedback.lastDiscovery.type,rareFind.type);
assert.equal(after.feedback.lastDiscovery.rare,true);
assert.ok(after.feedback.particleCount<=260);

runtime=createRuntime();
after=runtime.api.snapshot();
assert.equal(after.scene,'mossMine');
assert.equal(after.state.discoveredCaverns[cavern.id],true);
assert.equal(after.state.claimedPocketRewards[cacheCavern.reward.id],true);

api=runtime.api;api.restoreTerrain();
before=api.snapshot();
const hiddenDescent={...before.mine.depthEntrance};
assert.equal(hiddenDescent.discovered,false);
assert.ok(hiddenDescent.boundaryIndex>=0);
assert.notEqual(before.mine.dirt,before.mine.floor);
assert.equal(api.discoverDepthEntrance(),true);
after=api.snapshot();
assert.equal(after.state.discoveredDepthEntrances.mossMine,true);
assert.equal(api.enterDepth(),true);
after=api.snapshot();
assert.equal(after.depth,2);
assert.equal(after.mine.depth,2);
assert.equal(after.mine.name,'ROOTWOUND DEPTHS');
assert.equal(after.mine.visualPass,'rootwound-production-assets-v1');
runtime.drawCalls.length=0;api.renderOnce();
for(const asset of ['wall.png','depth-shaft.png','sell-station.png','drill-forge.png'])assert.ok(runtime.drawCalls.some(call=>call.src.includes('assets/rootwound/'+asset)),asset+' must render in Rootwound');
assert.equal(after.mine.terrain.maxHp,320);
assert.notEqual(after.mine.dirt,after.mine.floor);
assert.ok(after.mine.discovery.deposits.length>before.mine.discovery.deposits.length);
assert.ok(after.rocks.filter(rock=>rock.scene==='mossMine'&&rock.depth===2&&rock.depositId).length>0);
assert.equal(after.mine.depthResources.main,'rootiron');assert.equal(after.mine.depthResources.secondary,'deepstone');assert.equal(after.mine.depthResources.rare,'ambercore');
const mossGate=after.mine.discovery.deposits.find(deposit=>deposit.type==='burrowsteel');
assert.ok(mossGate);assert.equal(mossGate.requiresDrillLevel,1);assert.equal(mossGate.drillGated,true);
assert.ok(after.mine.discovery.deposits.every(deposit=>['rootiron','deepstone','ambercore','burrowsteel'].includes(deposit.type)));
assert.ok(after.rocks.filter(rock=>rock.scene==='mossMine'&&rock.depth===2&&rock.depositId).every(rock=>rock.requiresDeepTool));
assert.ok(after.mine.depthStations.sell&&after.mine.depthStations.forge);

const depthAim=after.mine.depthEntrance.x<after.mine.width/2?1:-1;api.setPosition(after.mine.depthEntrance.x+depthAim*185,after.mine.depthEntrance.y);api.setAim(depthAim,0);before=api.snapshot();target=before.mine.terrain.target;assert.ok(target);
api.mineTerrainCell(target.index);assert.equal(api.snapshot().mine.terrain.target.hp,target.hp);
api.setStarforgeVariant('swift');
const starforgeCooldown=api.snapshot().effectivePickaxe.cooldown;
api.mineTerrainCell(target.index);assert.ok(api.snapshot().mine.terrain.target.hp<target.hp);
after=api.snapshot();assert.equal(after.state.drillGoalScene,'mossMine');assert.equal(after.goal.title,'Mine Rootiron for Burrower Drill');assert.ok(after.goal.detail.includes('ROOTWOUND DEPTHS'));
assert.equal(after.guide.kind,'rock');assert.equal(after.guide.resource,'rootiron');assert.equal(after.guide.scene,'mossMine');assert.equal(after.guide.depth,2);
let gatedHit=api.hitDepositRock(mossGate.id,0);assert.deepEqual(gatedHit.after,gatedHit.before);
const lockedGoal=JSON.stringify(after.goal);assert.equal(api.exitDepth(),true);api.setPosition(720,900);assert.equal(JSON.stringify(api.snapshot().goal),lockedGoal);assert.equal(api.enterDepth(),true);
api.grantGold(1200);api.grantCargo('rootiron',8);api.grantCargo('ambercore',1);api.grantCargo('copper',3);
after=api.snapshot();assert.equal(after.goal.detail,'READY AT ANY DEPTH 2 DRILL FORGE');assert.equal(after.protectedCargo.rootiron,8);assert.equal(after.protectedCargo.ambercore,1);assert.equal(after.sellableCargo.copper,3);
api.sellCargo();after=api.snapshot();assert.equal(after.state.cargo.rootiron,8);assert.equal(after.state.cargo.ambercore,1);assert.equal(after.state.cargo.copper,0);
assert.equal(after.guide.kind,'drill-forge');assert.equal(after.guide.scene,'mossMine');assert.equal(after.guide.depth,2);
const drillForge=api.snapshot().mine.depthStations.forge;api.setPosition(drillForge.x,drillForge.y);api.upgradeDrill();after=api.snapshot();
assert.equal(after.state.drillLevel,1);assert.equal(after.effectivePickaxe.name,'Burrower Drill');assert.ok(after.effectivePickaxe.cooldown<starforgeCooldown);assert.equal(after.toolMode,'drill');assert.equal(after.goal.title,'Mine Burrowsteel for Pulse Drill');
gatedHit=api.hitDepositRock(mossGate.id,0);assert.notDeepEqual(gatedHit.after,gatedHit.before);
assert.equal(api.snapshot().feedback.hitStop,0);
api.grantGold(3200);api.grantCargo('burrowsteel',12);api.grantCargo('copper',2);api.sellCargo();after=api.snapshot();
assert.equal(after.state.cargo.burrowsteel,12);assert.equal(after.state.cargo.copper,0);assert.equal(after.goal.detail,'READY AT ANY DEPTH 2 DRILL FORGE');
api.upgradeDrill();after=api.snapshot();assert.equal(after.state.drillLevel,2);assert.equal(after.effectivePickaxe.name,'Pulse Drill');assert.equal(after.goal.title,'Mine Phase Crystal for Deepcore Drill');api.save();
assert.equal(after.guide.kind,'depth-exit');assert.equal(after.guide.scene,'mossMine');assert.equal(after.guide.depth,2);

runtime=createRuntime();api=runtime.api;after=api.snapshot();
assert.equal(after.scene,'mossMine');assert.equal(after.depth,2);assert.equal(after.mine.depthEntrance.x,hiddenDescent.x);assert.equal(after.mine.depthEntrance.y,hiddenDescent.y);
assert.equal(after.state.discoveredDepthEntrances.mossMine,true);assert.equal(after.state.drillLevel,2);
assert.equal(api.exitDepth(),true);assert.equal(api.snapshot().guide.kind,'mine-exit');api.exitMine();api.unlockAllAreas();api.unlockStarfall();
assert.equal(api.snapshot().guide.kind,'mine-entrance');assert.equal(api.snapshot().guide.destination,'moonMine');

api.enterMine('moonMine');if(!api.snapshot().mine.depthEntrance.discovered)assert.equal(api.discoverDepthEntrance(),true);assert.equal(api.enterDepth(),true);
after=api.snapshot();const moonGate=after.mine.discovery.deposits.find(deposit=>deposit.type==='phasecrystal');
assert.ok(moonGate);assert.equal(moonGate.requiresDrillLevel,2);gatedHit=api.hitDepositRock(moonGate.id,0);assert.notDeepEqual(gatedHit.after,gatedHit.before);
api.grantCargo('phasecrystal',10);api.grantCargo('copper',2);api.sellCargo();after=api.snapshot();
assert.equal(after.state.cargo.phasecrystal,10);assert.equal(after.state.cargo.copper,0);assert.equal(after.goal.title,'Mine Infernium for Deepcore Drill');
assert.equal(api.exitDepth(),true);api.exitMine();

api.enterMine('emberMine');if(!api.snapshot().mine.depthEntrance.discovered)assert.equal(api.discoverDepthEntrance(),true);assert.equal(api.enterDepth(),true);
after=api.snapshot();const emberGate=after.mine.discovery.deposits.find(deposit=>deposit.type==='infernium');
assert.ok(emberGate);assert.equal(emberGate.requiresDrillLevel,2);gatedHit=api.hitDepositRock(emberGate.id,0);assert.notDeepEqual(gatedHit.after,gatedHit.before);
api.grantCargo('infernium',10);api.grantGold(7200);after=api.snapshot();assert.equal(after.goal.detail,'READY AT ANY DEPTH 2 DRILL FORGE');
api.upgradeDrill();after=api.snapshot();assert.equal(after.state.drillLevel,3);assert.equal(after.effectivePickaxe.name,'Deepcore Drill');assert.equal(after.goal.title,'Deepcore Drill mastered');api.save();

runtime=createRuntime();api=runtime.api;after=api.snapshot();assert.equal(after.state.drillLevel,3);assert.equal(after.effectivePickaxe.name,'Deepcore Drill');
assert.equal(api.exitDepth(),true);api.exitMine();
const gatedByScene={mossMine:'burrowsteel',moonMine:'phasecrystal',emberMine:'infernium'};
for(const scene of ['mossMine','moonMine','emberMine','starMine']){
  api.enterMine(scene);before=api.snapshot();
  assert.equal(before.mine.depthEntrance.scene,scene);assert.notEqual(before.mine.dirt,before.mine.floor);
  if(!before.mine.depthEntrance.discovered)assert.equal(api.discoverDepthEntrance(),true);
  assert.equal(api.enterDepth(),true);after=api.snapshot();
  assert.equal(after.depth,2);assert.ok(after.mine.terrain.maxHp>=320);
  assert.ok(after.mine.discovery.deposits.every(deposit=>Object.values(after.mine.depthResources).includes(deposit.type)||deposit.drillGated));
  if(gatedByScene[scene])assert.ok(after.mine.discovery.deposits.some(deposit=>deposit.type===gatedByScene[scene]));
  else assert.equal(after.mine.discovery.deposits.some(deposit=>deposit.drillGated),false);
  assert.notEqual(after.mine.dirt,after.mine.floor);assert.doesNotThrow(()=>api.renderOnce());
  assert.equal(api.exitDepth(),true);api.exitMine();
}

const movementBefore=api.snapshot().movement;
api.grantGold(10000000);
for(let level=0;level<25;level++)assert.equal(api.buyMovementSpeed(),true);
after=api.snapshot();assert.equal(after.movement.level,movementBefore.level+25);assert.ok(after.movement.multiplier>movementBefore.multiplier);assert.ok(after.movement.nextCost>movementBefore.nextCost);
const normalCooldown=after.effectivePickaxe.cooldown;api.activateMiningRush();after=api.snapshot();assert.equal(after.miningRush.timer,30);assert.ok(after.effectivePickaxe.cooldown<normalCooldown);
api.spawnGroundDrops('copper',1,-500,-500);after=api.snapshot();let edgeDrop=after.groundDrops.at(-1);assert.equal(edgeDrop.x,56);assert.equal(edgeDrop.y,76);api.forceGlobalLootSweep();
api.enterMine('mossMine');before=api.snapshot();api.spawnGroundDrops('stone',1,999999,999999);after=api.snapshot();edgeDrop=after.groundDrops.at(-1);assert.equal(edgeDrop.x,before.mine.width-56);assert.equal(edgeDrop.y,before.mine.height-64);api.forceGlobalLootSweep();api.exitMine();
after=api.snapshot();const dropsBefore=after.groundDrops.length;api.spawnGroundDrops('copper',2,800,500);api.enterMine('mossMine');api.spawnGroundDrops('stone',3,280,650);assert.equal(api.snapshot().groundDrops.length,dropsBefore+5);
assert.equal(api.forceGlobalLootSweep(),dropsBefore+5);after=api.snapshot();assert.equal(after.groundDrops.length,0);assert.ok(after.lootSweep.remaining>299);api.save();
runtime=createRuntime();after=runtime.api.snapshot();assert.equal(after.movement.level,movementBefore.level+25);assert.ok(after.movement.multiplier>1);
api=runtime.api;api.reset();before=api.snapshot();
assert.equal(before.state.base.chests.length,1);assert.equal(before.state.base.chests[0].packed,false);assert.equal(Object.values(before.state.base.chests[0].items).reduce((total,amount)=>total+amount,0),0);
for(const type of Object.keys(before.state.cargo))api.grantCargo(type,1);
api.grantCargo('rootiron',8);api.grantCargo('ambercore',1);
assert.equal(api.autoSort(),20);after=api.snapshot();
assert.equal(Object.values(after.state.base.chests[0].items).filter(amount=>amount>0).length,20);assert.equal(Object.values(after.state.cargo).reduce((total,amount)=>total+amount,0),10);
api.grantGold(1000);assert.equal(api.buyStorageChest(),true);after=api.snapshot();
const secondChest=after.state.base.chests[1];assert.equal(secondChest.packed,true);assert.equal(api.placeBaseModule(secondChest.id),true);assert.equal(api.autoSort(),1);after=api.snapshot();assert.equal(Object.values(after.state.cargo).reduce((total,amount)=>total+amount,0),9);
const forge={...after.state.base.forge};api.setPosition(forge.x,forge.y);assert.equal(api.packBaseModule('forge'),true);api.enterMine('mossMine');assert.equal(api.placeBaseModule('forge'),true);after=api.snapshot();assert.equal(after.state.base.forge.scene,'mossMine');assert.equal(after.state.base.forge.packed,false);
const movedChest={...after.state.base.chests[1]};api.exitMine();api.setPosition(movedChest.x,movedChest.y);assert.equal(api.packBaseModule(movedChest.id),true);api.enterMine('mossMine');assert.equal(api.placeBaseModule(movedChest.id),true);api.save();
runtime=createRuntime();after=runtime.api.snapshot();assert.equal(after.state.base.forge.scene,'mossMine');assert.equal(after.state.base.chests.find(chest=>chest.id===movedChest.id).scene,'mossMine');assert.equal(Object.values(after.state.base.chests[0].items).reduce((total,amount)=>total+amount,0),20);
const migrationState={...after.state,gold:424242};
storage.clear();storage.set('retiredMiningPrototypeSave',JSON.stringify(migrationState));runtime=createRuntime();after=runtime.api.snapshot();
assert.equal(after.state.gold,424242);assert.equal(storage.has('retiredMiningPrototypeSave'),false);assert.equal(storage.has('everDeeperPrototypeV2'),true);
console.log('Runtime smoke passed: Ever Deeper branding, Moonglass/Prismatic production rendering, save migration, progression, guidance, movable base, lighting, and reload. Light pass '+lightingAverageMs.toFixed(2)+'ms average.');
