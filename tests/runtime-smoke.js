const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync(require('node:path').join(__dirname,'..','script.js'),'utf8');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
assert.match(html,/style\.css\?v=0174/);
assert.match(html,/script\.js\?v=0174/);
const storage=new Map();

function createElement(id){
  const classes=new Set();
  return{
    id,textContent:'',hidden:false,style:{},dataset:{},disabled:false,
    classList:{add:value=>classes.add(value),remove:value=>classes.delete(value),toggle:(value,force)=>force===undefined?(classes.has(value)?classes.delete(value):classes.add(value)):force?classes.add(value):classes.delete(value),contains:value=>classes.has(value)},
    addEventListener(){},setPointerCapture(){},contains(){return true},querySelector(){return null},
    getBoundingClientRect(){return{left:0,top:0,width:390,height:700,right:390,bottom:700}}
  };
}

function createRuntime(){
  const elements=new Map();
  const element=id=>{if(!elements.has(id))elements.set(id,createElement(id));return elements.get(id)};
  const gradient={addColorStop(){}};
  const canvasContext=new Proxy({}, {get:(_target,key)=>key==='createLinearGradient'||key==='createRadialGradient'?()=>gradient:key==='measureText'?()=>({width:0}):()=>{},set:()=>true});
  element('gameCanvas').getContext=()=>canvasContext;
  const document={hidden:false,getElementById:element,addEventListener(){}};
  const window={devicePixelRatio:2,addEventListener(){},confirm:()=>true};
  const context={
    window,document,console,
    localStorage:{getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)},
    requestAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},
    navigator:{vibrate:()=>true}
  };
  window.window=window;window.document=document;window.localStorage=context.localStorage;window.requestAnimationFrame=context.requestAnimationFrame;
  vm.runInContext(source,vm.createContext(context),{filename:'script.js'});
  return{api:window.__deepforgeTest,elements};
}

let runtime=createRuntime();
let api=runtime.api;
assert.equal(api.snapshot().build.version,'0.17.4');
assert.equal(api.snapshot().build.name,'REFINED MINERAL NODES');
assert.equal(runtime.elements.get('buildVersion').textContent,'v0.17.4');
assert.equal(JSON.stringify(api.snapshot().assetRendering),JSON.stringify({copper:['wall','node'],gold:['wall','node']}));
assert.equal(api.snapshot().mineralNodeRenderScale,.85);
let openingGuide=api.snapshot().guide;
assert.equal(openingGuide.kind,'rock');assert.equal(openingGuide.scene,'surface');assert.equal(openingGuide.visible,true);
api.setPosition(openingGuide.x,openingGuide.y);assert.equal(api.snapshot().guide.visible,false);
assert.equal(api.snapshot().markerStyle.bonusVeinRings,false);api.reset();

api.unlockAllAreas();api.unlockStarfall();api.enterMine('starMine');
let fallenPocket=api.snapshot().mine.discovery.caverns.find(item=>item.name==='Fallen Pocket');
api.mineTerrainCell(fallenPocket.boundaryIndex);api.mineTerrainCell(fallenPocket.boundaryIndex);
api.setPosition(fallenPocket.x,fallenPocket.y);
assert.doesNotThrow(()=>api.renderOnce());
api.claimPocketReward(fallenPocket.reward.id);
assert.equal(api.snapshot().state.claimedPocketRewards[fallenPocket.reward.id],true);
api.exitMine();

api.enterMine('mossMine');
assert.equal(api.snapshot().mine.visualPass,'mossvein-production-art-v2');
api.setPosition(180,503);api.setAim(.899,-.438);
let before=api.snapshot(),target=before.mine.terrain.target;
assert.ok(target);
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
api.setPosition(cacheCavern.x,cacheCavern.y);api.claimPocketReward(cacheCavern.reward.id);api.save();
after=api.snapshot();
assert.equal(after.mine.discovery.caverns.find(item=>item.id===cacheCavern.id).reward.claimed,true);
assert.equal(after.feedback.lastPocketReward.kind,'cache');
assert.ok(Object.values(after.state.cargo).reduce((total,amount)=>total+amount,0)>cargoBefore||after.groundDrops.some(drop=>drop.sourcePocket===cacheCavern.reward.id));

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
console.log('Runtime smoke passed: progression, guidance, movable base, 20-type storage, auto-sort, Mining Rush, global loot cleanup, rendering, and save reload.');
