const {test,expect}=require('@playwright/test');

async function freshGame(page){
  await page.goto('/');
  await page.waitForFunction(()=>window.__deepforgeTest);
  await page.evaluate(()=>window.__deepforgeTest.reset());
  await page.evaluate(()=>window.__deepforgeTest.setTimeScale(12));
}

async function mineCopper(page,count){
  for(let index=0;index<count;index++){
    await page.evaluate(()=>{
      window.__deepforgeTest.restoreRocks();
      window.__deepforgeTest.setPosition(790,300);
    });
    await page.keyboard.down('Space');
    await page.waitForTimeout(430);
    await page.keyboard.up('Space');
  }
}

async function useStation(page,x,y){
  await page.evaluate(({x,y})=>window.__deepforgeTest.setPosition(x,y),{x,y});
  await expect(page.locator('#contextPanel')).toBeVisible();
  await page.locator('#contextButton').click();
}

test('complete mining progression reaches Moonglass Cavern',async({page})=>{
  await freshGame(page);

  await mineCopper(page,5);
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.cargo.copper).toBeGreaterThanOrEqual(5);

  await useStation(page,205,250);
  await useStation(page,455,250);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.pickaxeLevel).toBe(2);
  expect(snapshot.state.gold).toBeGreaterThanOrEqual(0);

  await mineCopper(page,12);
  await useStation(page,205,250);
  await useStation(page,455,250);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.pickaxeLevel).toBe(3);
  expect(snapshot.state.mined.copper).toBeGreaterThanOrEqual(17);

  await mineCopper(page,18);
  await useStation(page,205,250);
  await useStation(page,1045,650);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.areaUnlocked).toBe(true);

  await page.evaluate(()=>window.__deepforgeTest.setPosition(1220,650));
  await expect(page.locator('#areaName')).toHaveText('MOONGLASS CAVERN');
  await page.evaluate(()=>{
    window.__deepforgeTest.restoreRocks();
    window.__deepforgeTest.setPosition(1240,350);
  });
  await page.keyboard.down('Space');
  await page.waitForTimeout(250);
  await page.keyboard.up('Space');
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.mined.moonglass).toBeGreaterThanOrEqual(1);
  await expect(page.locator('#objectiveText')).toHaveText('Forge a Moonglass Pickaxe');
});

test('Moonglass progression unlocks Emberdeep and its armored ore',async({page},testInfo)=>{
  await freshGame(page);
  await page.evaluate(()=>window.__deepforgeTest.grantGold(1000));
  await useStation(page,455,250);
  await useStation(page,455,250);
  await useStation(page,1045,650);
  await page.evaluate(()=>{
    window.__deepforgeTest.restoreRocks();
    window.__deepforgeTest.setPosition(1300,350);
  });
  await page.keyboard.down('Space');
  await page.waitForTimeout(260);
  await page.keyboard.up('Space');
  await useStation(page,455,250);

  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.pickaxeLevel).toBe(4);
  expect(snapshot.state.areaUnlocked).toBe(true);

  await useStation(page,2175,650);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.emberdeepUnlocked).toBe(true);

  await page.evaluate(()=>{
    window.__deepforgeTest.restoreRocks();
    window.__deepforgeTest.setPosition(2380,335);
  });
  await expect(page.locator('#areaName')).toHaveText('EMBERDEEP FOUNDRY');
  await page.keyboard.down('Space');
  await page.waitForTimeout(520);
  await page.keyboard.up('Space');
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.mined.emberstone).toBeGreaterThanOrEqual(1);
  await expect(page.locator('#objectiveText')).toHaveText('Sell your haul at the assay cart');
  await useStation(page,205,250);
  await expect(page.locator('#objectiveText')).toContainText('Mine Emberstone');
  await page.evaluate(()=>{
    window.__deepforgeTest.setPosition(455,250);
    window.__deepforgeTest.interact();
  });
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.pickaxeLevel).toBe(4);
  await page.evaluate(()=>window.__deepforgeTest.grantMined('emberstone',11));
  await expect(page.locator('#objectiveText')).toHaveText('Forge the Ember Pickaxe');
  await page.evaluate(()=>window.__deepforgeTest.grantGold(650));
  await useStation(page,455,250);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.pickaxeLevel).toBe(5);
  await page.evaluate(()=>{
    window.__deepforgeTest.restoreRocks();
    window.__deepforgeTest.setPosition(2700,650);
  });
  await page.waitForTimeout(2400);
  await page.screenshot({path:testInfo.outputPath('emberdeep-foundry.png'),fullPage:true});
  await page.evaluate(()=>window.__deepforgeTest.save());
  await page.reload();
  await page.waitForFunction(()=>window.__deepforgeTest);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.emberdeepUnlocked).toBe(true);
  expect(snapshot.state.pickaxeLevel).toBe(5);
});

test('clearing a connected ore vein grants its completion bonus',async({page},testInfo)=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.breakVeinRock('copper_run',0);
    window.__deepforgeTest.setPosition(945,1025);
  });
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  let vein=snapshot.veins.find(item=>item.id==='copper_run');
  expect(vein.status).toBe('active');
  expect(vein.broken).toBe(1);
  await expect(page.locator('#objectiveText')).toContainText('COPPER RUN 1/3');

  await page.evaluate(()=>{
    window.__deepforgeTest.breakVeinRock('copper_run',1);
    window.__deepforgeTest.breakVeinRock('copper_run',2);
    window.__deepforgeTest.collectGroundDrops();
  });
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  vein=snapshot.veins.find(item=>item.id==='copper_run');
  expect(vein.status).toBe('completed');
  expect(snapshot.state.veinsCompleted.copper_run).toBe(1);
  expect(snapshot.state.cargo.copper).toBeGreaterThanOrEqual(6);
  expect(snapshot.state.mined.copper).toBeGreaterThanOrEqual(6);
  await page.screenshot({path:testInfo.outputPath('copper-bonus-vein.png'),fullPage:true});
});

test('precision strikes crack Emberstone shell faster than held mining',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.setTimeScale(1);
    window.__deepforgeTest.setPosition(2380,335);
  });
  await page.keyboard.down('Space');
  await page.waitForTimeout(780);
  await page.keyboard.up('Space');
  await page.waitForTimeout(820);
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  const heldShell=snapshot.rocks.find(rock=>rock.type==='emberstone').shell;

  await page.evaluate(()=>{
    window.__deepforgeTest.restoreRocks();
    window.__deepforgeTest.primePrecision();
  });
  const mine=page.locator('#mineButton');
  await mine.dispatchEvent('pointerdown',{pointerId:41,pointerType:'touch'});
  await mine.dispatchEvent('pointerup',{pointerId:41,pointerType:'touch'});
  await page.waitForTimeout(780);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  const precisionShell=snapshot.rocks.find(rock=>rock.type==='emberstone').shell;
  expect(precisionShell).toBeLessThan(heldShell);
});

test('a fresh precision press deals a heavy hit without breaking hold mining',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.setTimeScale(1);
    window.__deepforgeTest.setPosition(250,500);
    window.__deepforgeTest.primePrecision();
  });
  const mine=page.locator('#mineButton');
  await mine.dispatchEvent('pointerdown',{pointerId:21,pointerType:'touch'});
  await mine.dispatchEvent('pointerup',{pointerId:21,pointerType:'touch'});
  await page.waitForTimeout(850);
  const snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  const stone=snapshot.rocks.find(rock=>rock.id===1);
  expect(snapshot.state.precisionHits).toBe(1);
  expect(snapshot.focus.streak).toBe(1);
  expect(stone.hp).toBe(1);
  await expect(page.locator('#focusMeter')).toBeVisible();
  await expect(page.locator('#focusCount')).toHaveText('1/5');
});

test('rare ore is counted and sells for its full value',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.grantCargo('gold',1);
    window.__deepforgeTest.grantCargo('starshard',1);
    window.__deepforgeTest.setPosition(205,250);
  });
  await expect(page.locator('#cargoValue')).toHaveText('2');
  await page.locator('#contextButton').click();
  const snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.gold).toBe(102);
  expect(Object.values(snapshot.state.cargo).reduce((sum,value)=>sum+value,0)).toBe(0);
  await expect(page.locator('#goldValue')).toHaveText('102');
});

test('forge explains the concrete mining improvement',async({page},testInfo)=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.grantGold(40);
    window.__deepforgeTest.grantCargo('copper',1);
    window.__deepforgeTest.setPosition(205,250);
  });
  await page.locator('#contextButton').click();
  await page.evaluate(()=>window.__deepforgeTest.setPosition(455,250));
  await expect(page.locator('#contextDetail')).toContainText('STONE 3 -> 2 HITS');
  await page.screenshot({path:testInfo.outputPath('forge-comparison.png'),fullPage:true});
});

test('mobile HUD fits and touch mining works',async({page},testInfo)=>{
  await freshGame(page);
  await page.evaluate(()=>window.__deepforgeTest.setPosition(790,300));
  const mine=page.locator('#mineButton');
  await mine.dispatchEvent('pointerdown',{pointerId:9,pointerType:'touch',clientX:340,clientY:650});
  await page.waitForTimeout(460);
  await mine.dispatchEvent('pointerup',{pointerId:9,pointerType:'touch',clientX:340,clientY:650});

  const snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.cargo.copper).toBeGreaterThanOrEqual(1);
  const layout=await page.evaluate(()=>({
    scrollWidth:document.documentElement.scrollWidth,
    clientWidth:document.documentElement.clientWidth,
    mine:document.getElementById('mineButton').getBoundingClientRect().toJSON(),
    joystick:document.getElementById('joystick').getBoundingClientRect().toJSON(),
    footer:document.querySelector('.progress-bar').getBoundingClientRect().toJSON()
  }));
  expect(layout.scrollWidth).toBe(layout.clientWidth);
  expect(layout.mine.right).toBeLessThanOrEqual(layout.clientWidth);
  expect(layout.joystick.left).toBeGreaterThanOrEqual(0);
  expect(layout.footer.bottom).toBeLessThanOrEqual((await page.viewportSize()).height);
  await page.screenshot({path:testInfo.outputPath('deepforge-iphone.png'),fullPage:true});
});

test('mobile controls suppress browser gestures without sticking input',async({page})=>{
  await freshGame(page);
  const gesturePolicy=await page.evaluate(()=>(
    {
      html:getComputedStyle(document.documentElement).touchAction,
      body:getComputedStyle(document.body).touchAction,
      game:getComputedStyle(document.getElementById('game')).touchAction,
      mine:getComputedStyle(document.getElementById('mineButton')).touchAction,
      selectable:getComputedStyle(document.body).userSelect,
      contextMenuAllowed:document.getElementById('game').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true})),
      doubleClickAllowed:document.getElementById('gameCanvas').dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true}))
    }
  ));
  expect(gesturePolicy).toMatchObject({html:'none',body:'none',game:'none',mine:'none',selectable:'none',contextMenuAllowed:false,doubleClickAllowed:false});

  await page.evaluate(()=>window.__deepforgeTest.setPosition(740,300));
  const mine=page.locator('#mineButton');
  for(let index=0;index<2;index++){
    await mine.dispatchEvent('pointerdown',{pointerId:70+index,pointerType:'touch'});
    await mine.dispatchEvent('pointerup',{pointerId:70+index,pointerType:'touch'});
  }
  await page.waitForTimeout(250);
  await expect(mine).not.toHaveClass(/active/);
  const snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.totalSwings).toBeGreaterThanOrEqual(1);
});

test('progress persists after refresh',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.grantGold(200);
    window.__deepforgeTest.setPosition(455,250);
  });
  await page.locator('#contextButton').click();
  await page.evaluate(()=>window.__deepforgeTest.save());
  await page.reload();
  await page.waitForFunction(()=>window.__deepforgeTest);
  const snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.pickaxeLevel).toBe(2);
  expect(snapshot.state.gold).toBe(170);
});

test('Ember Mastery enforces both Sunslag and gold requirements',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.unlockAllAreas();
    window.__deepforgeTest.setPickaxeLevel(5);
    window.__deepforgeTest.setPosition(455,250);
  });
  await expect(page.locator('#contextTitle')).toHaveText('Tempered');
  await expect(page.locator('#contextButton')).toBeDisabled();
  await expect(page.locator('#contextDetail')).toContainText('SUNSLAG 0 / 1');

  await page.evaluate(()=>window.__deepforgeTest.grantGold(450));
  await expect(page.locator('#contextButton')).toBeDisabled();
  await page.evaluate(()=>window.__deepforgeTest.grantMined('sunslag',1));
  await expect(page.locator('#contextButton')).toBeEnabled();
  await page.locator('#contextButton').click();

  const snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.emberMastery).toBe(1);
  expect(snapshot.state.gold).toBe(0);
  expect(snapshot.effectivePickaxe).toMatchObject({power:38,cooldown:.215,shellPower:.85,sunslagHits:4});
  await expect(page.locator('#pickaxeName')).toHaveText('Ember Pickaxe +1');
});

test('all five Ember Mastery ranks improve mining and persist',async({page},testInfo)=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.unlockAllAreas();
    window.__deepforgeTest.setPickaxeLevel(5);
    window.__deepforgeTest.grantMined('sunslag',15);
    window.__deepforgeTest.grantGold(8650);
    window.__deepforgeTest.setPosition(455,250);
  });

  let previousPower=31;
  let previousCooldown=.23;
  const expectedSunslagHits=[4,3,2,2,1];
  for(let rank=1;rank<=5;rank++){
    await expect(page.locator('#contextButton')).toBeEnabled();
    await page.locator('#contextButton').click();
    const snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
    expect(snapshot.state.emberMastery).toBe(rank);
    expect(snapshot.effectivePickaxe.power).toBeGreaterThan(previousPower);
    expect(snapshot.effectivePickaxe.cooldown).toBeLessThan(previousCooldown);
    expect(snapshot.effectivePickaxe.sunslagHits).toBe(expectedSunslagHits[rank-1]);
    expect(snapshot.effectivePickaxe.bonusYield).toBeGreaterThan(.22);
    previousPower=snapshot.effectivePickaxe.power;
    previousCooldown=snapshot.effectivePickaxe.cooldown;
  }

  await expect(page.locator('#contextButton')).toBeDisabled();
  await expect(page.locator('#contextButton')).toHaveText('MASTERED');
  await expect(page.locator('#unlockLabel')).toHaveText('OPEN STARFALL DEPTHS');
  await expect(page.locator('#powerValue')).toHaveText('128');
  await page.screenshot({path:testInfo.outputPath('ember-mastery-complete.png'),fullPage:true});

  await page.evaluate(()=>window.__deepforgeTest.save());
  await page.reload();
  await page.waitForFunction(()=>window.__deepforgeTest);
  const persisted=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(persisted.state.emberMastery).toBe(5);
  expect(persisted.effectivePickaxe).toMatchObject({power:128,cooldown:.155,shellPower:1.5,sunslagHits:1});
});

test('Deepforge Master breaks Sunslag shell and core with one normal swing',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.unlockAllAreas();
    window.__deepforgeTest.setPickaxeLevel(5);
    window.__deepforgeTest.grantMined('sunslag',15);
    window.__deepforgeTest.grantGold(8650);
    window.__deepforgeTest.setPosition(455,250);
  });
  for(let rank=1;rank<=5;rank++)await page.locator('#contextButton').click();

  await page.evaluate(()=>{
    window.__deepforgeTest.restoreRocks();
    window.__deepforgeTest.setPosition(3000,1080);
  });
  const mine=page.locator('#mineButton');
  await mine.dispatchEvent('pointerdown',{pointerId:55,pointerType:'touch'});
  await mine.dispatchEvent('pointerup',{pointerId:55,pointerType:'touch'});
  await page.waitForTimeout(250);

  const snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  const sunslag=snapshot.rocks.find(rock=>rock.type==='sunslag');
  expect(sunslag.broken).toBe(true);
  expect(snapshot.state.mined.sunslag).toBeGreaterThan(15);
});

test('Ember Mastery 5 opens Starfall Depths and its new resource loop persists',async({page},testInfo)=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.unlockAllAreas();
    window.__deepforgeTest.setPickaxeLevel(5);
    window.__deepforgeTest.grantMined('sunslag',15);
    window.__deepforgeTest.grantGold(8650);
    window.__deepforgeTest.setPosition(3295,650);
  });

  await expect(page.locator('#contextTitle')).toHaveText('Starfall Depths');
  await expect(page.locator('#contextButton')).toBeDisabled();
  await expect(page.locator('#contextButton')).toHaveText('LOCKED 0/5');

  await page.evaluate(()=>window.__deepforgeTest.setPosition(455,250));
  for(let rank=1;rank<=5;rank++)await page.locator('#contextButton').click();
  await page.evaluate(()=>window.__deepforgeTest.setPosition(3295,650));
  await expect(page.locator('#contextButton')).toBeEnabled();
  await expect(page.locator('#contextButton')).toHaveText('OPEN');
  await page.locator('#contextButton').click();

  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.fourthUnlocked).toBe(true);

  await page.evaluate(()=>{
    window.__deepforgeTest.restoreRocks();
    window.__deepforgeTest.setPosition(3505,320);
  });
  await expect(page.locator('#areaName')).toHaveText('STARFALL DEPTHS');
  const mine=page.locator('#mineButton');
  for(let swing=0;swing<3;swing++){
    await mine.dispatchEvent('pointerdown',{pointerId:160+swing,pointerType:'touch'});
    await mine.dispatchEvent('pointerup',{pointerId:160+swing,pointerType:'touch'});
    await page.waitForTimeout(70);
  }
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.discoveredFourth).toBe(true);
  expect(snapshot.state.mined.astralite).toBeGreaterThanOrEqual(1);
  await expect(page.locator('#objectiveText')).toHaveText('Clear the Starfall Lattice');

  await page.evaluate(()=>{
    window.__deepforgeTest.breakVeinRock('starfall_lattice',0);
    window.__deepforgeTest.breakVeinRock('starfall_lattice',1);
    window.__deepforgeTest.breakVeinRock('starfall_lattice',2);
    window.__deepforgeTest.collectGroundDrops();
  });
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.veinsCompleted.starfall_lattice).toBe(1);
  expect(snapshot.state.cargo.crownstone).toBeGreaterThanOrEqual(1);
  await page.screenshot({path:testInfo.outputPath('starfall-depths.png'),fullPage:true});

  await page.evaluate(()=>window.__deepforgeTest.save());
  await page.reload();
  await page.waitForFunction(()=>window.__deepforgeTest);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.fourthUnlocked).toBe(true);
  expect(snapshot.state.discoveredFourth).toBe(true);
  expect(snapshot.state.mined.astralite).toBeGreaterThanOrEqual(1);
  expect(snapshot.state.cargo.crownstone).toBeGreaterThanOrEqual(1);
});

test('mined resources land in the world, require pickup, and expire cleanly',async({page},testInfo)=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.setPosition(650,300);
    window.__deepforgeTest.spawnGroundDrops('copper',3,740,300);
  });
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.groundDrops).toHaveLength(3);
  expect(snapshot.groundDrops.every(drop=>drop.amount===1)).toBe(true);
  expect(snapshot.state.cargo.copper).toBe(0);
  await page.waitForTimeout(180);
  await page.screenshot({path:testInfo.outputPath('ground-loot.png'),fullPage:true});

  await page.evaluate(()=>window.__deepforgeTest.collectGroundDrops());
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.groundDrops.length).toBe(0);
  expect(snapshot.state.cargo.copper).toBe(3);

  await page.evaluate(()=>{
    window.__deepforgeTest.setTimeScale(0);
    window.__deepforgeTest.spawnGroundDrops('copper',1,900,500);
  });
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.groundDrops[0].z).toBeGreaterThan(7);
  const airborneDrop=snapshot.groundDrops[0];
  await page.evaluate(drop=>window.__deepforgeTest.setPosition(drop.x,drop.y),airborneDrop);
  await page.waitForTimeout(35);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.groundDrops.length).toBe(0);
  expect(snapshot.state.cargo.copper).toBe(4);

  await page.evaluate(()=>{
    window.__deepforgeTest.setTimeScale(1);
    window.__deepforgeTest.spawnGroundDrops('copper',2,900,500);
    window.__deepforgeTest.expireGroundDrops();
  });
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.groundDrops.length).toBe(0);
});

test('Starforge crafts and swaps three distinct endgame pickaxes',async({page},testInfo)=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.unlockAllAreas();
    window.__deepforgeTest.unlockStarfall();
    window.__deepforgeTest.setPickaxeLevel(5);
    window.__deepforgeTest.grantCargo('astralite',17);
    window.__deepforgeTest.grantCargo('crownstone',4);
    window.__deepforgeTest.setPosition(3505,155);
  });
  await expect(page.locator('#contextPanel')).toBeVisible();
  await expect(page.locator('#contextPanel')).toHaveClass(/starforge-open/);

  const crusher=page.locator('[data-starforge="crusher"]');
  const swift=page.locator('[data-starforge="swift"]');
  const prospector=page.locator('[data-starforge="prospector"]');
  await crusher.click();
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.starforgeVariant).toBe('crusher');
  const crusherStats=snapshot.effectivePickaxe;

  await swift.click();
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.starforgeVariant).toBe('swift');
  expect(snapshot.effectivePickaxe.cooldown).toBeLessThan(crusherStats.cooldown);
  expect(snapshot.effectivePickaxe.power).toBeLessThan(crusherStats.power);

  await prospector.click();
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.starforgeVariant).toBe('prospector');
  expect(snapshot.effectivePickaxe.bonusYield).toBeGreaterThan(crusherStats.bonusYield);
  await expect(page.locator('#pickaxeName')).toHaveText('Crownseeker');
  await page.screenshot({path:testInfo.outputPath('starforge-choices.png'),fullPage:true});

  await page.evaluate(()=>window.__deepforgeTest.save());
  await page.reload();
  await page.waitForFunction(()=>window.__deepforgeTest);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.starforgeVariant).toBe('prospector');
  expect(snapshot.state.starforgeUnlocked).toEqual({crusher:true,swift:true,prospector:true});
  await expect(page.locator('#objectiveText')).toHaveText('Deepforge mastered - every Starforge form forged');
  await expect(page.locator('#unlockLabel')).toHaveText('DEEPFORGE MASTERED - 3/3 STARFORGE FORMS');
});

test('all four regions expose a distinct biome identity without changing the world flow',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>window.__deepforgeTest.unlockAllAreas());
  await page.evaluate(()=>window.__deepforgeTest.unlockStarfall());
  const regions=[
    [500,'mossvein','MOSSVEIN QUARRY'],[1500,'moonglass','MOONGLASS CAVERN'],
    [2600,'emberdeep','EMBERDEEP FOUNDRY'],[3800,'starfall','STARFALL DEPTHS']
  ];
  for(const [x,id,name] of regions){
    await page.evaluate(position=>window.__deepforgeTest.setPosition(position,650),x);
    await page.waitForTimeout(35);
    expect(await page.evaluate(()=>window.__deepforgeTest.snapshot().biome)).toBe(id);
    await expect(page.locator('#game')).toHaveAttribute('data-biome',id);
    await expect(page.locator('#areaName')).toHaveText(name);
  }
});

test('rapid physical pickups aggregate feedback while preserving every resource',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.spawnGroundDrops('copper',5,330,690);
    window.__deepforgeTest.collectGroundDrops();
  });
  await page.waitForTimeout(20);
  const snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.cargo.copper).toBe(5);
  expect(snapshot.groundDrops).toHaveLength(0);
  expect(snapshot.feedback.floaters.filter(text=>text==='+5 COPPER')).toHaveLength(1);
});

test('Ember Mastery remains readable on an iPhone viewport',async({page},testInfo)=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.unlockAllAreas();
    window.__deepforgeTest.setPickaxeLevel(5);
    window.__deepforgeTest.grantMined('sunslag',3);
    window.__deepforgeTest.grantGold(1300);
    window.__deepforgeTest.setPosition(455,250);
  });
  await page.locator('#contextButton').click();
  const layout=await page.evaluate(()=>(
    {
      width:document.documentElement.clientWidth,
      scrollWidth:document.documentElement.scrollWidth,
      panel:document.getElementById('contextPanel').getBoundingClientRect().toJSON(),
      button:document.getElementById('contextButton').getBoundingClientRect().toJSON(),
      footer:document.querySelector('.progress-bar').getBoundingClientRect().toJSON()
    }
  ));
  expect(layout.scrollWidth).toBe(layout.width);
  expect(layout.panel.left).toBeGreaterThanOrEqual(0);
  expect(layout.panel.right).toBeLessThanOrEqual(layout.width);
  expect(layout.button.right).toBeLessThanOrEqual(layout.width);
  expect(layout.footer.right).toBeLessThanOrEqual(layout.width);
  await page.screenshot({path:testInfo.outputPath('ember-mastery-iphone.png'),fullPage:true});
});
