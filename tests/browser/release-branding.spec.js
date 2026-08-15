const {test,expect}=require('@playwright/test');

test('Ever Deeper release branding is complete and mobile-safe',async({page})=>{
  await page.goto('/');
  await page.waitForFunction(()=>window.__everDeeperTest);

  await expect(page).toHaveTitle('Ever Deeper');
  await expect(page.locator('meta[name="application-name"]')).toHaveAttribute('content','Ever Deeper');
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute('content','Ever Deeper');
  await expect(page.locator('main')).toHaveAttribute('aria-label','Ever Deeper mining game');

  const logo=page.locator('.brand-logo');
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute('alt','Ever Deeper');
  await expect(logo).toHaveAttribute('src','assets/branding/ever-deeper-logo.png?v=0340');
  const logoState=await logo.evaluate(image=>({complete:image.complete,width:image.naturalWidth,height:image.naturalHeight,bounds:image.getBoundingClientRect().toJSON()}));
  expect(logoState).toMatchObject({complete:true,width:800,height:297});
  expect(logoState.bounds.width).toBeGreaterThanOrEqual(124);
  expect(logoState.bounds.right).toBeLessThanOrEqual(await page.evaluate(()=>innerWidth));

  await expect(page.locator('#buildVersion')).toHaveText('v0.34.0');
  await expect(page.locator('#menuBuildVersion')).toHaveText('EVER DEEPER v0.34.0 · DEEPGLASS PREMIUM');
  await expect(page.locator('#toolIcon')).toHaveAttribute('src','assets/tools/pickaxe-worn.png?v=0340');
  await expect(page.locator('#mineToolIcon')).toHaveAttribute('src','assets/tools/pickaxe-worn.png?v=0340');
  await page.evaluate(()=>window.__everDeeperTest.dismissStartMenu());
  await page.evaluate(()=>window.__everDeeperTest.setPosition(455,250));
  await expect(page.locator('#contextPanel')).toBeVisible();
  await expect(page.locator('#contextIconImage')).toHaveAttribute('src',/assets\/surface\/forge-station\.png\?v=0340$/);
  const release=await page.evaluate(()=>{
    const api=window.__everDeeperTest;
    api.reset();api.save();
    const retired=['deep','forge'].join('');
    return{
      build:api.snapshot().build,
      music:api.snapshot().music.asset,
      retiredMarkup:document.documentElement.innerHTML.toLowerCase().includes(retired),
      retiredStorage:Object.keys(localStorage).some(key=>key.toLowerCase().includes(retired)),
      currentStorage:localStorage.getItem('everDeeperPrototypeV2')!==null
    };
  });
  expect(release).toEqual({
    build:{version:'0.34.0',name:'DEEPGLASS PREMIUM'},
    music:'assets/audio/ever-deeper-drift-loop.mp3',
    retiredMarkup:false,
    retiredStorage:false,
    currentStorage:true
  });
});

test('all resource symbols use the shared production drop assets',async({page})=>{
  await page.goto('/');
  await page.waitForFunction(()=>window.__everDeeperTest);
  const contract=await page.evaluate(()=>window.__everDeeperTest.snapshot().resourceRendering);
  expect(Object.keys(contract.paths)).toHaveLength(21);
  expect(contract).toMatchObject({completeResourceSet:true,sharedWorldAndUiAssets:true,transparentBoundsNormalized:true,nodeAssetCoverage:true,objectiveIcons:true,inventoryIcons:true,storageIcons:true,recipeIcons:true,ledgerIcons:true,croppedGroundDrops:true,legacyCanvasResourceSymbols:false,legacyCanvasResourceDrops:false});
  const decoded=await page.evaluate(paths=>Promise.all(Object.values(paths).map(src=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve({src,width:image.naturalWidth,height:image.naturalHeight});image.onerror=()=>resolve({src,width:0,height:0});image.src=src}))),contract.paths);
  expect(decoded.every(asset=>asset.width===256&&asset.height>=194)).toBe(true);
  await page.evaluate(()=>{const api=window.__everDeeperTest;api.reset();api.grantCargo('stone',1);api.sellCargo();api.unlockAllAreas();api.grantGold(100);api.setPickaxeLevel(4);api.grantMined('moonglass',1);api.grantMined('emberstone',1);api.grantCargo('emberstone',7);api.step(.001);api.openInventory()});
  await expect(page.locator('#objectiveRequirements [data-resource="emberstone"] img')).toHaveAttribute('src',/emberstone-drop\.png/);
  await expect(page.locator('#inventoryGrid [data-resource="emberstone"] img')).toHaveAttribute('src',/emberstone-drop\.png/);
  await expect(page.locator('.resource.gold [data-resource="gold"] img')).toHaveAttribute('src',/gold-drop\.png/);
  expect(await page.locator('.resource-gem').count()).toBe(0);
});

test('achievement reliquaries settle before FIFO dismissal and persist full records',async({page})=>{
  await page.goto('/');
  await page.waitForFunction(()=>window.__everDeeperTest);
  const catalog=await page.evaluate(()=>{const achievements=window.__everDeeperTest.snapshot().achievements;return{total:achievements.total,ids:achievements.definitions.map(definition=>definition.id),assets:achievements.definitions.map(definition=>definition.asset),count:achievements.count}});
  expect(catalog.total).toBe(50);expect(new Set(catalog.ids).size).toBe(50);expect(catalog.count).toBe(0);expect(catalog.assets.every((asset,index)=>asset===`assets/achievements/${catalog.ids[index]}.png`)).toBe(true);
  expect(new Set(catalog.assets).size).toBe(50);
  const decodedAssets=await page.evaluate(paths=>Promise.all(paths.map(async src=>{const image=new Image();image.src=src;try{await image.decode();return{src,width:image.naturalWidth,height:image.naturalHeight,decoded:true}}catch{return{src,width:0,height:0,decoded:false}}})),catalog.assets);
  expect(decodedAssets).toHaveLength(50);expect(decodedAssets.every(asset=>asset.decoded&&asset.width===512&&asset.height===512)).toBe(true);

  await page.evaluate(()=>{const api=window.__everDeeperTest;api.dismissStartMenu();api.grantMined('stone',1);api.evaluateAchievements()});
  const popup=page.locator('#achievementPopup');await expect(popup).toBeVisible();await expect(popup).toHaveAttribute('data-achievement','first_chip');await expect(popup).toHaveAttribute('data-settled','false');
  await popup.dispatchEvent('click');expect(await page.evaluate(()=>window.__everDeeperTest.snapshot().achievements.active)).toBe('first_chip');
  await page.waitForFunction(()=>window.__everDeeperTest.snapshot().achievements.settled);await expect(popup).toHaveAttribute('data-settled','true');await popup.click();await expect(popup).toBeHidden();

  await page.evaluate(()=>{const api=window.__everDeeperTest;api.setPickaxeLevel(3);api.evaluateAchievements()});await expect(popup).toHaveAttribute('data-achievement','ironbound');
  let fifo=await page.evaluate(()=>window.__everDeeperTest.snapshot().achievements);expect(fifo.queue).toEqual(['ironbound','rune_ready']);expect(fifo.settled).toBe(false);
  await page.waitForFunction(()=>window.__everDeeperTest.snapshot().achievements.settled);await popup.click();await expect(popup).toHaveAttribute('data-achievement','rune_ready');
  await page.waitForFunction(()=>window.__everDeeperTest.snapshot().achievements.settled);await popup.click();await expect(popup).toBeHidden();

  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('everDeeperAchievementsV1')));expect(Object.keys(stored.records)).toEqual(['first_chip','ironbound','rune_ready']);
  for(const record of Object.values(stored.records)){expect(record).toEqual(expect.objectContaining({reason:expect.any(String),scene:'surface',depth:1,order:expect.any(Number),acknowledged:true}));expect(Number.isFinite(Date.parse(record.timestamp))).toBe(true)}
  await page.reload();await page.waitForFunction(()=>window.__everDeeperTest);await page.locator('#startAchievementsButton').click();await expect(page.locator('#achievementCount')).toHaveText('3 / 50 UNLOCKED');await expect(page.locator('.achievement-entry')).toHaveCount(50);await expect(page.locator('.achievement-entry.unlocked')).toHaveCount(3);await expect(page.locator('[data-achievement="first_chip"] .achievement-copy p')).toContainText('first resource');await expect(page.locator('[data-achievement="first_chip"] .achievement-copy span')).toContainText(/EARNED/);
});

test('Deepcore routes the final expedition through Starfall and into Voidstar',async({page})=>{
  await page.goto('/');
  await page.waitForFunction(()=>window.__everDeeperTest);
  const route=await page.evaluate(()=>{
    const api=window.__everDeeperTest;
    api.reset();api.unlockAllAreas();api.unlockStarfall();api.setPickaxeLevel(5);api.setDrillLevel(3);
    const surface=api.snapshot();
    api.enterMine('starMine');const searching=api.snapshot();
    api.discoverDepthEntrance();const descent=api.snapshot();
    api.enterDepth();const voidstar=api.snapshot();
    return{
      surface:{goal:surface.goal,guide:surface.guide&&{kind:surface.guide.kind,destination:surface.guide.destination}},
      searching:{goal:searching.goal,guide:searching.guide},
      descent:{goal:descent.goal,guide:descent.guide&&{kind:descent.guide.kind,scene:descent.guide.scene,depth:descent.guide.depth}},
      voidstar:{goal:voidstar.goal,guide:voidstar.guide&&{kind:voidstar.guide.kind,resource:voidstar.guide.resource},visualPass:voidstar.mine.visualPass}
    };
  });
  expect(route.surface).toEqual({goal:{title:'Enter Starfall Hollow',detail:'THE FINAL DESCENT AWAITS'},guide:{kind:'mine-entrance',destination:'starMine'}});
  expect(route.searching).toEqual({goal:{title:'Find the hidden Voidstar entrance',detail:'DIG DEEPER'},guide:null});
  expect(route.descent).toEqual({goal:{title:'Enter Voidstar Depths',detail:'DEEPCORE DRILL READY'},guide:{kind:'depth-entrance',scene:'starMine',depth:1}});
  expect(route.voidstar).toEqual({goal:{title:'Mine a Singularity Core',detail:'THE FINAL DISCOVERY'},guide:{kind:'rock',resource:'singularity'},visualPass:'voidstar-production-assets-v1'});
});

test('premium walk sheets are clean, directional, lazy, and reduced-motion safe',async({page})=>{
  await page.goto('/');
  await page.waitForFunction(()=>window.__everDeeperTest);
  const initialWalkRequests=await page.evaluate(()=>performance.getEntriesByType('resource').map(entry=>entry.name).filter(name=>name.includes('-walk.png')).map(name=>name.split('/').pop().split('?')[0]));
  expect(initialWalkRequests).toEqual(['miner-b-walk.png']);

  const motion=await page.evaluate(()=>{
    const api=window.__everDeeperTest,rows={down:0,left:1,right:2,up:3},vectors={down:[0,1],left:[-1,0],right:[1,0],up:[0,-1]},samples=[];
    api.reset();api.setPosition(600,700);
    for(const direction of Object.keys(rows)){
      api.setMoveVector(...vectors[direction]);api.step(.08);const player=api.snapshot().player;samples.push({direction:player.direction,moving:player.moving,frame:player.walkFrame,distance:player.walkDistance,row:rows[player.direction]});api.stopMove();api.step(.001);
    }
    return{samples,contract:api.snapshot().characterRendering,stateKeys:Object.keys(api.snapshot().state)};
  });
  expect(motion.samples.map(sample=>sample.direction)).toEqual(['down','left','right','up']);
  expect(motion.samples.every(sample=>sample.moving&&sample.frame>=0&&sample.frame<6&&sample.distance>0)).toBe(true);
  expect(motion.contract.walkGrid).toEqual({columns:6,rows:4,cellSize:256,directions:['down','left','right','up']});
  expect(motion.contract).toMatchObject({directionalWalk:true,distanceDrivenWalk:true,holsteredWalkTools:true,lazyDrillWalkSheets:true,staticMiningFallback:true});
  expect(motion.stateKeys).not.toEqual(expect.arrayContaining(['walkFrame','walkDistance','direction','moving']));

  await page.evaluate(()=>{window.__everDeeperTest.setDrillLevel(2);window.__everDeeperTest.renderOnce()});
  await page.waitForFunction(()=>performance.getEntriesByType('resource').some(entry=>entry.name.includes('miner-b-drill-pulse-walk.png')));
  const activeDrill=await page.evaluate(()=>window.__everDeeperTest.snapshot().characterRendering.activeWalkAsset);
  expect(activeDrill).toBe('assets/characters/miner-b-drill-pulse-walk.png');

  const sheets=['miner-b-walk.png','miner-b-drill-burrower-walk.png','miner-b-drill-pulse-walk.png','miner-b-drill-deepcore-walk.png'];
  const qa=await page.evaluate(async names=>{
    const results=[];
    for(const name of names){
      const image=new Image();image.src='assets/characters/'+name;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);const pixels=context.getImageData(0,0,canvas.width,canvas.height).data,frames=[];
      for(let row=0;row<4;row++)for(let col=0;col<6;col++){
        let alphaPixels=0,borderAlpha=0,bottom=-1,hash=2166136261;
        for(let y=0;y<256;y++)for(let x=0;x<256;x++){
          const offset=(((row*256+y)*canvas.width)+(col*256+x))*4,alpha=pixels[offset+3];
          if(alpha>12){alphaPixels++;bottom=Math.max(bottom,y)}
          if(!x||x===255||!y||y===255)borderAlpha=Math.max(borderAlpha,alpha);
          if(x%8===0&&y%8===0){hash^=pixels[offset];hash=Math.imul(hash,16777619);hash^=pixels[offset+1];hash=Math.imul(hash,16777619);hash^=pixels[offset+2];hash=Math.imul(hash,16777619);hash^=alpha;hash=Math.imul(hash,16777619)}
        }
        frames.push({alphaPixels,borderAlpha,bottom,hash:hash>>>0});
      }
      results.push({name,width:image.naturalWidth,height:image.naturalHeight,frames});
    }
    return results;
  },sheets);
  for(const sheet of qa){expect([sheet.width,sheet.height]).toEqual([1536,1024]);expect(sheet.frames).toHaveLength(24);expect(sheet.frames.every(frame=>frame.alphaPixels>4000&&frame.borderAlpha===0&&frame.bottom>=246&&frame.bottom<=250)).toBe(true);for(let row=0;row<4;row++)expect(new Set(sheet.frames.slice(row*6,row*6+6).map(frame=>frame.hash)).size).toBe(6)}

  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>window.__everDeeperTest);
  const reduced=await page.evaluate(()=>{const api=window.__everDeeperTest;api.reset();api.setPosition(600,700);const before=api.snapshot().player.x;api.setMoveVector(1,0);api.step(.08);const snapshot=api.snapshot();return{before,after:snapshot.player.x,frame:snapshot.player.walkFrame,reduced:snapshot.characterRendering.reducedMotion}});
  expect(reduced).toEqual(expect.objectContaining({frame:0,reduced:true}));expect(reduced.after).toBeGreaterThan(reduced.before);
});
