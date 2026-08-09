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

  const WORLD={width:4480,height:1280,gateX:1110,emberGateX:2240,starfallGateX:3360,gateY:650,gateHalfGap:118};
  const SAVE_KEY='deepforgePrototypeV1';
  const GATE_COST=120;
  const EMBER_GATE_COST=360;
  const EMBER_PICKAXE_ORE_REQUIRED=12;
  const GROUND_DROP_LIFETIME=300;
  const GROUND_DROP_PICKUP_RADIUS=48;
  const MAX_GROUND_DROPS=160;
  const EMBER_MASTERY=[
    {rank:0,power:31,cooldown:.23,gold:0,sunslag:0,label:'Awakened',shellPower:.72,bonusYield:.22,precisionDelay:1},
    {rank:1,power:38,cooldown:.215,gold:450,sunslag:1,label:'Tempered',shellPower:.85,bonusYield:.27,precisionDelay:.96},
    {rank:2,power:46,cooldown:.20,gold:850,sunslag:3,label:'Kindled',shellPower:1,bonusYield:.32,precisionDelay:.92},
    {rank:3,power:66,cooldown:.185,gold:1450,sunslag:6,label:'Blazing',shellPower:1.15,bonusYield:.38,precisionDelay:.88},
    {rank:4,power:92,cooldown:.17,gold:2300,sunslag:10,label:'Infernal',shellPower:1.3,bonusYield:.45,precisionDelay:.82},
    {rank:5,power:128,cooldown:.155,gold:3600,sunslag:15,label:'Deepforge Master',shellPower:1.5,bonusYield:.55,precisionDelay:.75}
  ];
  const MINING_RANGE=116;
  const PLAYER_SPEED=295;
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
  let activeContext=null,uiDirty=true,lastSavedSnapshot='',lastRegion=-1,nextDropId=1;

  const input={keys:new Set(),moveX:0,moveY:0,joystickPointer:null,minePointers:new Set(),mineHeld:false};
  const camera={x:0,y:0};
  const player={x:330,y:690,radius:23,facing:1,walk:0,swing:null,swingCooldown:0,hitRockId:null};
  const miningFocus={streak:0,timer:0};
  const state=loadState();
  let displayedGold=state.gold,goldTween=null;
  const rocks=ROCK_LAYOUT.concat(VEIN_ROCK_LAYOUT).map((entry,index)=>({
    id:index+1,type:entry[0],x:entry[1],y:entry[2],hp:ROCK_TYPES[entry[0]].hp,maxHp:ROCK_TYPES[entry[0]].hp,
    shell:ROCK_TYPES[entry[0]].shell||0,maxShell:ROCK_TYPES[entry[0]].shell||0,
    veinId:entry[3]||null,respawn:0,hit:0,broken:false,seed:(index*47)%97,glintTimer:1.5+(index%5)*.48,glintActive:0,bonusYield:0
  }));
  const veins=VEIN_DEFINITIONS.map(definition=>({...definition,status:'idle',timer:0,displaySecond:-1,brokenRockIds:new Set()}));

  function defaultState(){
    return{
      gold:0,pickaxeLevel:1,emberMastery:0,areaUnlocked:false,discoveredSecond:false,emberdeepUnlocked:false,discoveredThird:false,fourthUnlocked:false,discoveredFourth:false,
      cargo:{stone:0,copper:0,moonglass:0,gold:0,starshard:0,emberstone:0,sunslag:0,astralite:0,crownstone:0},
      mined:{stone:0,copper:0,moonglass:0,gold:0,starshard:0,emberstone:0,sunslag:0,astralite:0,crownstone:0},
      veinsCompleted:{copper_run:0,moonglass_bloom:0,ember_fault:0,starfall_lattice:0},
      starforgeVariant:null,starforgeUnlocked:{crusher:false,swift:false,prospector:false},
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
      base.starforgeVariant=base.starforgeUnlocked[raw.starforgeVariant]?raw.starforgeVariant:null;
      base.totalGold=Math.max(0,Number(raw.totalGold)||0);
      base.totalSwings=Math.max(0,Number(raw.totalSwings)||0);
      base.precisionHits=Math.max(0,Number(raw.precisionHits)||0);
      return base;
    }catch(error){return defaultState()}
  }

  function saveState(force){
    try{
      const snapshot=JSON.stringify(state);
      if(force||snapshot!==lastSavedSnapshot){localStorage.setItem(SAVE_KEY,snapshot);lastSavedSnapshot=snapshot}
    }catch(error){}
  }

  function resetProgress(){
    const fresh=defaultState();
    Object.keys(fresh).forEach(key=>state[key]=fresh[key]);
    for(const rock of rocks){rock.hp=rock.maxHp;rock.shell=rock.maxShell;rock.broken=false;rock.respawn=0;rock.hit=0;rock.glintActive=0;rock.glintTimer=1.4+(rock.id%5)*.45;rock.bonusYield=0}
    resetVeins();groundDrops.length=0;nextDropId=1;
    player.x=330;player.y=690;player.swing=null;player.swingCooldown=0;
    miningFocus.streak=0;miningFocus.timer=0;saleMotes.length=0;goldTween=null;displayedGold=0;
    activeContext=null;menuShade.hidden=true;uiDirty=true;saveState(true);showToast('A fresh vein awaits.');
  }

  function resize(){
    const rect=viewport.getBoundingClientRect();
    width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    viewZoom=width<=620?.82:.86;
    viewWidth=width/viewZoom;viewHeight=height/viewZoom;
    dpr=Math.min(2,window.devicePixelRatio||1);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    updateCamera(true);
  }

  function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
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
  function resetVeins(){for(const vein of veins){vein.status='idle';vein.timer=0;vein.displaySecond=-1;vein.brokenRockIds.clear()}}

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

  function sound(kind,resourceType){
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
    }else if(kind==='upgrade'){
      playTone(250,510,.28,.1,'triangle');playTone(440,900,.32,.065,'sine',.08);
    }else if(kind==='unlock'){
      playTone(155,390,.52,.12,'sine');playTone(245,680,.58,.065,'triangle',.09);
    }else if(kind==='vein'){
      playTone(210,520,.22,.1,'triangle');playTone(420,980,.34,.07,'sine',.06);playTone(720,1320,.2,.04,'triangle',.16);
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
    areaBanner.dataset.area=name==='STARFALL DEPTHS'?'starfall':name==='EMBERDEEP FOUNDRY'?'ember':'moonglass';
    areaBanner.classList.add('show');clearTimeout(bannerTimer);
    bannerTimer=setTimeout(()=>areaBanner.classList.remove('show'),2200);
  }

  function worldToScreen(x,y){return{x:x-camera.x,y:y-camera.y}}
  function screenToWorld(x,y){return{x:x/viewZoom+camera.x,y:y/viewZoom+camera.y}}

  function updateCamera(immediate){
    const targetX=clamp(player.x-viewWidth*.5,0,Math.max(0,WORLD.width-viewWidth));
    const targetY=clamp(player.y-viewHeight*.5,0,Math.max(0,WORLD.height-viewHeight));
    if(immediate){camera.x=targetX;camera.y=targetY;return}
    camera.x+=(targetX-camera.x)*.105;camera.y+=(targetY-camera.y)*.105;
  }

  function nearestRock(range){
    let best=null,bestDistance=Infinity;
    for(const rock of rocks){
      if(rock.broken)continue;
      const d=distance(player.x,player.y,rock.x,rock.y);
      if(d<bestDistance&&d<=range){bestDistance=d;best=rock}
    }
    return best;
  }

  function startSwing(manualPress){
    if(player.swing||player.swingCooldown>0)return false;
    const rock=nearestRock(MINING_RANGE);
    if(!rock){sound('empty');if(!input.mineHeld)showToast('Move closer to a rock.');player.swingCooldown=.16;return false}
    const precision=!!manualPress&&rock.glintActive>0;
    if(precision){
      rock.glintActive=0;rock.glintTimer=(2.3+Math.random()*1.7)*currentPrecisionDelay();rock.bonusYield=1;
      miningFocus.streak=Math.min(5,miningFocus.streak+1);miningFocus.timer=7;
      if(miningFocus.streak===5)floaters.push({x:player.x,y:player.y-62,text:'FOCUS MAX',color:'#ffe69a',age:0,life:1.05,size:15});
      uiDirty=true;
    }else if(manualPress&&miningFocus.streak){
      miningFocus.streak=0;miningFocus.timer=0;uiDirty=true;
    }
    player.facing=rock.x>=player.x?1:-1;player.hitRockId=rock.id;
    player.swing={elapsed:0,duration:currentCooldown(),hit:false,precision};
    state.totalSwings++;uiDirty=true;return true;
  }

  function hitRock(rock,precision){
    if(!rock||rock.broken)return;
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
    if(precision){state.precisionHits++;floaters.push({x:rock.x,y:rock.y-37,text:'PRECISION!',color:'#fff2a6',age:0,life:.9,size:14})}
    if(rock.shell<=0&&rock.hp<=0)breakRock(rock);
  }

  function breakRock(rock){
    const vein=rock.veinId?veinById(rock.veinId):null;
    rock.broken=true;rock.respawn=vein?vein.respawn:ROCK_TYPES[rock.type].respawn;
    const yieldAmount=1+rock.bonusYield+(Math.random()<currentBonusYieldChance()?1:0);
    state.mined[rock.type]+=yieldAmount;spawnGroundDrop(rock.type,yieldAmount,rock.x,rock.y);
    sound('break',rock.type);spawnBreak(rock.x,rock.y,rock.type);rock.bonusYield=0;
    floaters.push({x:rock.x,y:rock.y-22,text:'DROP x'+yieldAmount,color:ROCK_TYPES[rock.type].edge,age:0,life:.9,size:13});
    if(vein)registerVeinBreak(vein,rock);
    uiDirty=true;saveState();
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
      state.mined[type]+=amount;rewards.push('DROP x'+amount+' '+ROCK_TYPES[type].label);
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
    const data=ROCK_TYPES[type];
    const count=precision?11:6;
    for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*(precision?225:160),vy:-45-Math.random()*(precision?175:125),age:0,life:.35+Math.random()*.22,size:2+Math.random()*(precision?5:4),color:i%2?data.edge:data.accent,gravity:310});
    floaters.push({x,y:y-14,text:String(damage),color:'#fff2b3',age:0,life:.62,size:13});
    rings.push({x,y,age:0,life:precision?.38:.24,radius:precision?17:12,color:data.edge});
  }

  function spawnBreak(x,y,type){
    const data=ROCK_TYPES[type];
    for(let i=0;i<15;i++)particles.push({x,y,vx:(Math.random()-.5)*250,vy:-70-Math.random()*190,age:0,life:.55+Math.random()*.35,size:3+Math.random()*6,color:i%3?data.color:data.edge,gravity:340});
    rings.push({x,y,age:0,life:.45,radius:18,color:data.edge});
  }

  function spawnGroundDrop(type,amount,x,y){
    if(!ROCK_TYPES[type]||amount<=0)return;
    const count=Math.max(1,Math.floor(amount));
    for(let item=0;item<count;item++){
      if(groundDrops.length>=MAX_GROUND_DROPS){
        let oldestIndex=0;
        for(let index=1;index<groundDrops.length;index++)if(groundDrops[index].age>groundDrops[oldestIndex].age)oldestIndex=index;
        groundDrops.splice(oldestIndex,1);
      }
      const seed=nextDropId++,angle=(seed*2.399963)%6.283,burst=34+(seed%4)*7;
      groundDrops.push({id:seed,type,amount:1,x,y,z:12,vx:Math.cos(angle)*burst,vy:Math.sin(angle)*burst*.58,vz:92+(seed%5)*9,age:0,settled:false});
    }
  }

  function collectGroundDrop(drop){
    state.cargo[drop.type]+=drop.amount;
    floaters.push({x:drop.x,y:drop.y-22,text:'+'+drop.amount+' '+ROCK_TYPES[drop.type].label,color:ROCK_TYPES[drop.type].edge,age:0,life:1.05,size:14});
    rings.push({x:drop.x,y:drop.y,age:0,life:.25,radius:8,color:ROCK_TYPES[drop.type].edge});
    sound('pickup',drop.type);uiDirty=true;
  }

  function updateGroundDrops(dt){
    let collected=false;
    for(let index=groundDrops.length-1;index>=0;index--){
      const drop=groundDrops[index];drop.age+=dt;
      if(drop.age>=GROUND_DROP_LIFETIME){groundDrops.splice(index,1);continue}
      if(!drop.settled){
        drop.x+=drop.vx*dt;drop.y+=drop.vy*dt;drop.z+=drop.vz*dt;drop.vz-=330*dt;drop.vx*=Math.pow(.11,dt);drop.vy*=Math.pow(.11,dt);
        if(drop.z<=0){drop.z=0;if(Math.abs(drop.vz)>28){drop.vz=-drop.vz*.27;drop.vx*=.62;drop.vy*=.62}else{drop.vz=0;drop.vx=0;drop.vy=0;drop.settled=true}}
      }
      if(distance(player.x,player.y,drop.x,drop.y)<=GROUND_DROP_PICKUP_RADIUS){collectGroundDrop(drop);groundDrops.splice(index,1);collected=true}
    }
    if(collected)saveState();
  }

  function contextAtPlayer(){
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
    if(activeContext==='sell')sellCargo();
    else if(activeContext==='forge')upgradePickaxe();
    else if(activeContext==='gate')unlockArea();
    else if(activeContext==='emberGate')unlockEmberdeep();
    else if(activeContext==='starfallGate')unlockStarfall();
  }

  function canForgeStarVariant(id){const variant=STARFORGE_VARIANTS[id];return !!variant&&Object.entries(variant.cost).every(([type,amount])=>state.cargo[type]>=amount)}

  function forgeStarVariant(id){
    const variant=STARFORGE_VARIANTS[id];if(!variant)return;
    if(state.starforgeUnlocked[id]){
      state.starforgeVariant=id;showToast(variant.name+' equipped.');sound('upgrade');uiDirty=true;saveState();return;
    }
    if(!canForgeStarVariant(id)){showToast('Need '+Object.entries(variant.cost).map(([type,amount])=>amount+' '+ROCK_TYPES[type].label).join(' + ')+'.');sound('empty');return}
    for(const [type,amount] of Object.entries(variant.cost))state.cargo[type]-=amount;
    state.starforgeUnlocked[id]=true;state.starforgeVariant=id;
    sound('upgrade');rings.push({x:STATIONS.starforge.x,y:STATIONS.starforge.y,age:0,life:.9,radius:26,color:variant.color});
    floaters.push({x:player.x,y:player.y-52,text:variant.name.toUpperCase(),color:variant.color,age:0,life:1.6,size:18});
    showToast(variant.name+' forged. Return here to swap styles.');uiDirty=true;saveState();
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

  function update(dt){
    if(!menuShade.hidden)return;
    time+=dt;
    const move=updateInputVector();
    if(Math.abs(move.x)+Math.abs(move.y)>.02){
      let nx=player.x+move.x*PLAYER_SPEED*dt,ny=player.y+move.y*PLAYER_SPEED*dt;
      nx=clamp(nx,52,WORLD.width-52);ny=clamp(ny,70,WORLD.height-58);
      if(!state.areaUnlocked&&player.x<WORLD.gateX&&nx>WORLD.gateX-36)nx=WORLD.gateX-36;
      if(!state.areaUnlocked&&player.x>WORLD.gateX&&nx<WORLD.gateX+36)nx=WORLD.gateX+36;
      if(!state.emberdeepUnlocked&&player.x<WORLD.emberGateX&&nx>WORLD.emberGateX-36)nx=WORLD.emberGateX-36;
      if(!state.emberdeepUnlocked&&player.x>WORLD.emberGateX&&nx<WORLD.emberGateX+36)nx=WORLD.emberGateX+36;
      if(!state.fourthUnlocked&&player.x<WORLD.starfallGateX&&nx>WORLD.starfallGateX-36)nx=WORLD.starfallGateX-36;
      if(!state.fourthUnlocked&&player.x>WORLD.starfallGateX&&nx<WORLD.starfallGateX+36)nx=WORLD.starfallGateX+36;
      player.x=nx;player.y=ny;player.walk+=dt*9;player.facing=move.x<-.06?-1:(move.x>.06?1:player.facing);
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
        player.swing.hit=true;hitRock(rocks.find(rock=>rock.id===player.hitRockId),player.swing.precision);
      }
      if(player.swing.elapsed>=player.swing.duration){player.swing=null;player.swingCooldown=.02}
    }
    if(input.mineHeld&&!player.swing&&player.swingCooldown<=0)startSwing(false);
    const miningTarget=nearestRock(MINING_RANGE);
    for(const rock of rocks){
      rock.hit=Math.max(0,rock.hit-dt);
      if(rock.broken){
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
    updateVeins(dt);updateGroundDrops(dt);
    updateEffects(dt);updateGoldCount(dt);updateCamera(false);
    const region=player.x>WORLD.starfallGateX?3:player.x>WORLD.emberGateX?2:player.x>WORLD.gateX?1:0;
    if(region!==lastRegion){lastRegion=region;uiDirty=true}
    const nextContext=contextAtPlayer();
    if(nextContext!==activeContext){activeContext=nextContext;uiDirty=true}
    if(!state.discoveredSecond&&player.x>WORLD.gateX+100){state.discoveredSecond=true;showAreaBanner('MOONGLASS CAVERN');sound('unlock');uiDirty=true;saveState()}
    if(!state.discoveredThird&&player.x>WORLD.emberGateX+100){state.discoveredThird=true;showAreaBanner('EMBERDEEP FOUNDRY');sound('unlock');uiDirty=true;saveState()}
    if(!state.discoveredFourth&&player.x>WORLD.starfallGateX+100){state.discoveredFourth=true;showAreaBanner('STARFALL DEPTHS');sound('unlock');uiDirty=true;saveState()}
    if(uiDirty)updateUI();
  }

  function updateEffects(dt){
    for(const particle of particles){particle.age+=dt;particle.x+=particle.vx*dt;particle.y+=particle.vy*dt;particle.vy+=particle.gravity*dt;particle.vx*=Math.pow(.08,dt)}
    for(const floater of floaters){floater.age+=dt;floater.y-=35*dt}
    for(const ring of rings)ring.age+=dt;
    for(const mote of saleMotes)mote.age+=dt;
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
    areaName.textContent=player.x>WORLD.starfallGateX?'STARFALL DEPTHS':player.x>WORLD.emberGateX?'EMBERDEEP FOUNDRY':player.x>WORLD.gateX?'MOONGLASS CAVERN':'MOSSVEIN QUARRY';
    let progress=1,label='DEEPFORGE MASTERED';
    if(!state.areaUnlocked){progress=Math.min(1,Math.min(state.gold/GATE_COST,state.pickaxeLevel/3));label='MOONGLASS CAVERN'}
    else if(!state.emberdeepUnlocked){progress=Math.min(1,Math.min(state.gold/EMBER_GATE_COST,state.pickaxeLevel/4));label='EMBERDEEP FOUNDRY'}
    else if(state.pickaxeLevel<PICKAXES.length-1){progress=Math.min(1,state.gold/PICKAXES[PICKAXES.length-1].cost,state.mined.emberstone/EMBER_PICKAXE_ORE_REQUIRED);label='EMBER PICKAXE '+Math.min(EMBER_PICKAXE_ORE_REQUIRED,state.mined.emberstone)+'/'+EMBER_PICKAXE_ORE_REQUIRED}
    else if(nextMastery()){
      const next=nextMastery();progress=Math.min(1,state.gold/next.gold,state.mined.sunslag/next.sunslag);label='EMBER MASTERY '+state.emberMastery+'/5 - SUNSLAG '+Math.min(next.sunslag,state.mined.sunslag)+'/'+next.sunslag;
    }else if(!state.fourthUnlocked){progress=0;label='OPEN STARFALL DEPTHS'}
    else if(!state.starforgeVariant){progress=Math.min(1,state.cargo.astralite/5,state.cargo.crownstone/1);label='STARFORGE - ASTRALITE '+Math.min(5,state.cargo.astralite)+'/5 - CROWNSTONE '+Math.min(1,state.cargo.crownstone)+'/1'}
    else label=currentStarforge().name.toUpperCase()+' ACTIVE';
    unlockFill.style.width=(progress*100)+'%';unlockLabel.textContent=label;
    const activeVein=veins.find(vein=>vein.status==='active');
    if(activeVein)objectiveText.textContent=activeVein.label+' '+activeVein.brokenRockIds.size+'/'+activeVein.positions.length+' - '+Math.ceil(activeVein.timer)+'s';
    else if(state.emberMastery===5&&!state.fourthUnlocked)objectiveText.textContent='Open the Starfall Master Seal';
    else if(state.fourthUnlocked&&!state.discoveredFourth)objectiveText.textContent='Enter Starfall Depths';
    else if(state.discoveredFourth&&state.mined.astralite===0)objectiveText.textContent='Discover Astralite';
    else if(state.discoveredFourth&&state.veinsCompleted.starfall_lattice===0)objectiveText.textContent='Clear the Starfall Lattice';
    else if(state.discoveredFourth&&state.mined.crownstone===0)objectiveText.textContent='Find a Crownstone vein';
    else if(state.discoveredFourth&&!state.starforgeVariant)objectiveText.textContent='Forge a Starfall Pickaxe';
    else if(state.discoveredFourth)objectiveText.textContent=currentStarforge().name+' - master your new style';
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
    contextButton.hidden=activeContext==='starforge';starforgeChoices.hidden=activeContext!=='starforge';
    if(!activeContext)return;
    if(activeContext==='sell'){
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
    document.getElementById('totalGold').textContent=state.totalGold;
  }

  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    ctx.save();ctx.scale(viewZoom,viewZoom);
    drawGround();drawDecorations();drawStations();drawGate();drawVeins();drawRocks();drawEffects(false);drawGroundDrops();drawPlayer();drawEffects(true);drawWorldLabels();
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

  function drawRocks(){
    const target=nearestRock(MINING_RANGE);
    for(const rock of rocks){
      if(rock.broken)continue;
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
    for(const particle of particles){const p=worldToScreen(particle.x,particle.y),t=particle.age/particle.life;ctx.save();ctx.globalAlpha=1-t;ctx.fillStyle=particle.color;ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(particle.vy,particle.vx));ctx.fillRect(-particle.size*.5,-particle.size*.5,particle.size*1.7,particle.size);ctx.restore()}
    for(const mote of saleMotes){
      if(mote.age<0)continue;const t=easeInOut(mote.age/mote.life),wx=mote.sx+(mote.tx-mote.sx)*t,wy=mote.sy+(mote.ty-mote.sy)*t-Math.sin(t*Math.PI)*32,p=worldToScreen(wx,wy);
      ctx.save();ctx.globalAlpha=Math.sin(Math.min(1,t)*Math.PI)*.75+.2;ctx.fillStyle=mote.color;ctx.shadowBlur=7;ctx.shadowColor=mote.color;ctx.beginPath();ctx.arc(p.x,p.y,mote.size,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    for(const floater of floaters){const p=worldToScreen(floater.x,floater.y),t=floater.age/floater.life;ctx.save();ctx.globalAlpha=Math.min(1,(1-t)*2.4);ctx.fillStyle=floater.color;ctx.strokeStyle='rgba(3,5,3,.8)';ctx.lineWidth=3;ctx.textAlign='center';ctx.font='900 '+floater.size+'px Georgia';ctx.strokeText(floater.text,p.x,p.y);ctx.fillText(floater.text,p.x,p.y);ctx.restore()}
  }

  function drawWorldLabels(){
    const labels=[['ASSAY CART',STATIONS.sell.x,STATIONS.sell.y-75,'#e9cb82'],['FORGE',STATIONS.forge.x,STATIONS.forge.y-75,'#f2a35d']];
    if(state.fourthUnlocked)labels.push(['STARFORGE',STATIONS.starforge.x,STATIONS.starforge.y-73,'#d9dcff']);
    if(!state.areaUnlocked)labels.push(['MOONGLASS GATE',WORLD.gateX-58,WORLD.gateY-215,'#9ce7e6']);
    if(state.areaUnlocked&&!state.emberdeepUnlocked)labels.push(['EMBERDEEP SEAL',WORLD.emberGateX-58,WORLD.gateY-215,'#ff9a68']);
    if(state.emberdeepUnlocked&&!state.fourthUnlocked)labels.push(['STARFALL MASTER SEAL',WORLD.starfallGateX-65,WORLD.gateY-215,'#d6d8ff']);
    ctx.save();ctx.textAlign='center';ctx.font='900 10px Georgia';
    for(const label of labels){const p=worldToScreen(label[1],label[2]);if(p.x<0||p.x>viewWidth||p.y<0||p.y>viewHeight)continue;ctx.fillStyle='rgba(5,8,5,.72)';ctx.fillRect(p.x-56,p.y-11,112,20);ctx.fillStyle=label[3];ctx.fillText(label[0],p.x,p.y+3)}ctx.restore();
  }

  function frame(timestamp){
    const raw=Math.min(.05,Math.max(0,(timestamp-lastFrame)/1000||0));lastFrame=timestamp;
    update(raw*timeScale);draw();requestAnimationFrame(frame);
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
  window.addEventListener('pagehide',releaseTouchControls);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseTouchControls()});
  contextButton.addEventListener('click',performContext);
  starforgeChoices.addEventListener('click',event=>{const button=event.target.closest('[data-starforge]');if(button&&!button.disabled){unlockAudio();forgeStarVariant(button.dataset.starforge)}});
  menuButton.addEventListener('click',()=>{unlockAudio();menuShade.hidden=false;updateLedger()});resumeButton.addEventListener('click',()=>menuShade.hidden=true);
  resetButton.addEventListener('click',()=>{if(window.confirm('Reset all Deepforge prototype progress?'))resetProgress()});
  menuShade.addEventListener('pointerdown',event=>{if(event.target===menuShade)menuShade.hidden=true});
  window.addEventListener('resize',resize,{passive:true});

  window.__deepforgeTest={
    snapshot:()=>JSON.parse(JSON.stringify({state,effectivePickaxe:{name:currentPickaxeName(),power:currentPower(),cooldown:currentCooldown(),shellPower:currentShellPower(),bonusYield:currentBonusYieldChance(),emberstoneHits:armoredHitsRequired('emberstone',currentPower(),currentShellPower()),sunslagHits:armoredHitsRequired('sunslag',currentPower(),currentShellPower()),astraliteHits:armoredHitsRequired('astralite',currentPower(),currentShellPower())},player:{x:player.x,y:player.y},focus:miningFocus,rocks:rocks.map(rock=>({id:rock.id,type:rock.type,veinId:rock.veinId,hp:rock.hp,shell:rock.shell,broken:rock.broken})),veins:veins.map(vein=>({id:vein.id,status:vein.status,timer:vein.timer,broken:vein.brokenRockIds.size,total:vein.positions.length})),groundDrops:groundDrops.map(drop=>({id:drop.id,type:drop.type,amount:drop.amount,x:drop.x,y:drop.y,z:drop.z,age:drop.age,settled:drop.settled})),activeContext})),
    reset:resetProgress,
    setPosition:(x,y)=>{player.x=clamp(Number(x),52,WORLD.width-52);player.y=clamp(Number(y),70,WORLD.height-58);updateCamera(true);uiDirty=true},
    setTimeScale:value=>{timeScale=clamp(Number(value)||1,.25,12)},
    restoreRocks:()=>{for(const rock of rocks){rock.broken=false;rock.hp=rock.maxHp;rock.shell=rock.maxShell;rock.respawn=0;rock.glintActive=0;rock.bonusYield=0}resetVeins();uiDirty=true},
    primePrecision:()=>{const rock=nearestRock(MINING_RANGE);if(rock){rock.glintActive=.72;return rock.id}return null},
    grantCargo:(type,amount)=>{if(Object.prototype.hasOwnProperty.call(state.cargo,type)){state.cargo[type]+=Math.max(0,Number(amount)||0);uiDirty=true}},
    grantMined:(type,amount)=>{if(Object.prototype.hasOwnProperty.call(state.mined,type)){state.mined[type]+=Math.max(0,Number(amount)||0);uiDirty=true}},
    breakVeinRock:(veinId,index)=>{const candidates=rocks.filter(rock=>rock.veinId===veinId);const rock=candidates[Math.max(0,Math.min(candidates.length-1,Number(index)||0))];if(rock&&!rock.broken){rock.shell=0;rock.hp=0;breakRock(rock);return rock.id}return null},
    grantGold:amount=>{state.gold+=Math.max(0,Number(amount)||0);uiDirty=true},
    setPickaxeLevel:level=>{state.pickaxeLevel=clamp(Math.floor(Number(level)||1),1,PICKAXES.length-1);if(state.pickaxeLevel<PICKAXES.length-1)state.emberMastery=0;uiDirty=true},
    unlockAllAreas:()=>{state.areaUnlocked=true;state.discoveredSecond=true;state.emberdeepUnlocked=true;state.discoveredThird=true;uiDirty=true},
    unlockStarfall:()=>{state.fourthUnlocked=true;state.discoveredFourth=true;uiDirty=true},
    spawnGroundDrops:(type,amount,x=player.x+80,y=player.y)=>spawnGroundDrop(type,amount,x,y),
    collectGroundDrops:()=>{for(const drop of groundDrops){drop.x=player.x;drop.y=player.y;drop.z=0;drop.settled=true}updateGroundDrops(.001);uiDirty=true},
    expireGroundDrops:()=>{for(const drop of groundDrops)drop.age=GROUND_DROP_LIFETIME;updateGroundDrops(.001)},
    forgeStarVariant:id=>forgeStarVariant(id),
    interact:performContext,
    save:()=>saveState(true)
  };

  resize();updateUI();requestAnimationFrame(frame);
})();
