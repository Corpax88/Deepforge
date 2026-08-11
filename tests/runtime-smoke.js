const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync(require('node:path').join(__dirname,'..','script.js'),'utf8');
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
assert.equal(api.snapshot().build.version,'0.5.0');
assert.equal(api.snapshot().build.name,'MINING SATISFACTION');
assert.equal(runtime.elements.get('buildVersion').textContent,'v0.5.0');

api.enterMine('mossMine');
api.setPosition(180,503);api.setAim(.899,-.438);
let before=api.snapshot(),target=before.mine.terrain.target;
assert.ok(target);
api.mineTerrainCell(target.index);
let after=api.snapshot();
assert.equal(after.mine.terrain.target.index,target.index);
assert.ok(after.mine.terrain.target.hp<target.hp);
assert.equal(after.feedback.terrainHitIndex,target.index);
assert.ok(after.feedback.shake>0);
assert.ok(after.feedback.particleCount>0&&after.feedback.particleCount<=260);

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
console.log('Runtime smoke passed: targeting, feedback, discovery, particle cap, and save reload.');
