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
  await expect(logo).toHaveAttribute('src','assets/branding/ever-deeper-logo.png?v=0290');
  const logoState=await logo.evaluate(image=>({complete:image.complete,width:image.naturalWidth,height:image.naturalHeight,bounds:image.getBoundingClientRect().toJSON()}));
  expect(logoState).toMatchObject({complete:true,width:800,height:297});
  expect(logoState.bounds.width).toBeGreaterThanOrEqual(124);
  expect(logoState.bounds.right).toBeLessThanOrEqual(await page.evaluate(()=>innerWidth));

  await expect(page.locator('#buildVersion')).toHaveText('v0.29.0');
  await expect(page.locator('#menuBuildVersion')).toHaveText('EVER DEEPER v0.29.0 · PREMIUM WALK CYCLE');
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
    build:{version:'0.29.0',name:'PREMIUM WALK CYCLE'},
    music:'assets/audio/ever-deeper-drift-loop.mp3',
    retiredMarkup:false,
    retiredStorage:false,
    currentStorage:true
  });
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
