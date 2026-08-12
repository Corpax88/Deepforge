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
  await expect(page.locator('#objectiveText')).toHaveText('Sell your haul at the Sell Chest');
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
  await expect(page.locator('#objectiveText')).toHaveText('Sell your haul at the Sell Chest');

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

test('one global five-minute cleanup clears loose items from every map',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    const api=window.__deepforgeTest;api.spawnGroundDrops('copper',2,900,500);api.enterMine('mossMine');api.spawnGroundDrops('stone',3,280,650);
  });
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.groundDrops).toHaveLength(5);
  expect(snapshot.groundDrops.some(drop=>drop.scene==='surface')).toBe(true);
  expect(snapshot.groundDrops.some(drop=>drop.scene==='mossMine')).toBe(true);
  expect(await page.evaluate(()=>window.__deepforgeTest.forceGlobalLootSweep())).toBe(5);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.groundDrops).toHaveLength(0);
  expect(snapshot.lootSweep.remaining).toBeGreaterThan(299);
});

test('restorative shrines grant temporary Mining Rush instead of full Focus',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>window.__deepforgeTest.enterMine('mossMine'));
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  const normalCooldown=snapshot.effectivePickaxe.cooldown,shrine=snapshot.mine.discovery.caverns.find(cavern=>cavern.reward.kind==='shrine');
  expect(shrine).toBeTruthy();
  await page.evaluate(shrineData=>{
    const api=window.__deepforgeTest;api.mineTerrainCell(shrineData.boundaryIndex);api.mineTerrainCell(shrineData.boundaryIndex);api.setPosition(shrineData.x,shrineData.y);api.claimPocketReward(shrineData.reward.id);
  },shrine);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.miningRush.timer).toBeGreaterThan(29);
  expect(snapshot.focus.streak).toBe(0);
  expect(snapshot.effectivePickaxe.cooldown).toBeLessThan(normalCooldown);
  await expect(page.locator('#mineHint')).toContainText('RUSH');
});

test('Wayfarer Shop sells persistent movement speed with no level cap',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{const api=window.__deepforgeTest;api.grantGold(100000000);api.setPosition(730,220)});
  await expect(page.locator('#contextPanel')).toBeVisible();
  await expect(page.locator('#contextTitle')).toContainText('Movement');
  const before=await page.evaluate(()=>window.__deepforgeTest.snapshot().movement);
  await page.locator('#contextButton').click();
  await page.evaluate(()=>{for(let level=1;level<40;level++)window.__deepforgeTest.buyMovementSpeed();window.__deepforgeTest.save()});
  let movement=await page.evaluate(()=>window.__deepforgeTest.snapshot().movement);
  expect(movement.level).toBe(40);expect(movement.multiplier).toBeGreaterThan(before.multiplier);expect(movement.nextCost).toBeGreaterThan(before.nextCost);
  await page.reload();await page.waitForFunction(()=>window.__deepforgeTest);movement=await page.evaluate(()=>window.__deepforgeTest.snapshot().movement);
  expect(movement.level).toBe(40);expect(movement.multiplier).toBeCloseTo(3.8);
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
  await expect(page.locator('#objectiveText')).toHaveText('Find a hidden Depth 2 entrance');
  await expect(page.locator('#unlockLabel')).toHaveText('FIND DEPTH 2 - THE DRILL AGE AWAITS');
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

test('pickaxe-gated treasure chest opens into physical loot and persists',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>window.__deepforgeTest.setPosition(885,205));
  await expect(page.locator('#contextTitle')).toHaveText('Ironbound Chest');
  await expect(page.locator('#contextDetail')).toContainText('Requires Iron Pickaxe');
  await expect(page.locator('#contextButton')).toHaveText('LOCKED');
  await expect(page.locator('#contextButton')).toBeDisabled();

  await page.evaluate(()=>window.__deepforgeTest.setPickaxeLevel(2));
  await expect(page.locator('#contextButton')).toHaveText('OPEN');
  await expect(page.locator('#contextButton')).toBeEnabled();
  await page.locator('#contextButton').click();

  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.openedChests.moss_ironbound).toBe(true);
  expect(snapshot.groundDrops.filter(drop=>drop.sourceChest==='moss_ironbound')).toHaveLength(6);
  expect(snapshot.state.pendingChestLoot.moss_ironbound).toEqual({copper:5,gold:1});

  await page.evaluate(()=>window.__deepforgeTest.save());
  await page.reload();
  await page.waitForFunction(()=>window.__deepforgeTest);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.openedChests.moss_ironbound).toBe(true);
  expect(snapshot.groundDrops.filter(drop=>drop.sourceChest==='moss_ironbound')).toHaveLength(6);

  await page.evaluate(()=>window.__deepforgeTest.collectGroundDrops());
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.cargo.copper).toBe(5);
  expect(snapshot.state.cargo.gold).toBe(1);
  expect(snapshot.state.pendingChestLoot.moss_ironbound).toBeUndefined();
});

test('deeper chest tiers require their matching progression milestone',async({page})=>{
  await freshGame(page);
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.chests.find(chest=>chest.id==='moon_reliquary').ready).toBe(false);
  expect(snapshot.chests.find(chest=>chest.id==='ember_vault').ready).toBe(false);
  expect(snapshot.chests.find(chest=>chest.id==='star_coffer').ready).toBe(false);

  await page.evaluate(()=>window.__deepforgeTest.setPickaxeLevel(4));
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.chests.find(chest=>chest.id==='moon_reliquary').ready).toBe(true);
  expect(snapshot.chests.find(chest=>chest.id==='ember_vault').ready).toBe(false);

  await page.evaluate(()=>window.__deepforgeTest.setPickaxeLevel(5));
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.chests.find(chest=>chest.id==='ember_vault').ready).toBe(true);
  expect(snapshot.chests.find(chest=>chest.id==='star_coffer').ready).toBe(false);

  await page.evaluate(()=>{
    window.__deepforgeTest.grantCargo('astralite',6);
    window.__deepforgeTest.grantCargo('crownstone',1);
    window.__deepforgeTest.forgeStarVariant('crusher');
  });
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.chests.find(chest=>chest.id==='star_coffer').ready).toBe(true);
});

test('treasure chest interaction remains readable on iPhone',async({page},testInfo)=>{
  await freshGame(page);
  await page.evaluate(()=>window.__deepforgeTest.setPosition(600,1110));
  await expect(page.locator('#contextTitle')).toHaveText("Miner's Supply Chest");
  const layout=await page.evaluate(()=>(
    {
      width:document.documentElement.clientWidth,
      scrollWidth:document.documentElement.scrollWidth,
      panel:document.getElementById('contextPanel').getBoundingClientRect().toJSON(),
      button:document.getElementById('contextButton').getBoundingClientRect().toJSON()
    }
  ));
  expect(layout.scrollWidth).toBe(layout.width);
  expect(layout.panel.left).toBeGreaterThanOrEqual(0);
  expect(layout.panel.right).toBeLessThanOrEqual(layout.width);
  expect(layout.button.right).toBeLessThanOrEqual(layout.width);
  await page.screenshot({path:testInfo.outputPath('treasure-chest-iphone.png'),fullPage:true});
});

test('Mossvein Mine supports entry, gated passages, persistence, and exit',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>window.__deepforgeTest.setPosition(165,690));
  await expect(page.locator('#contextTitle')).toHaveText('Mossvein Mine');
  await page.locator('#contextButton').click();

  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.scene).toBe('mossMine');
  expect(snapshot.biome).toBe('mossMine');
  expect(snapshot.state.mineDiscovered).toBe(true);

  await page.evaluate(()=>{
    window.__deepforgeTest.setTimeScale(1);
    window.__deepforgeTest.setPosition(570,640);
  });
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(650);
  await page.keyboard.up('ArrowRight');
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.player.x).toBeLessThan(610);

  await page.evaluate(()=>{
    window.__deepforgeTest.setTimeScale(12);
    window.__deepforgeTest.setPosition(555,640);
  });
  await page.keyboard.down('Space');
  await page.waitForTimeout(1200);
  await page.keyboard.up('Space');
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.clearedMineBarriers.outer_rubble).toBe(true);

  await page.evaluate(()=>window.__deepforgeTest.setPosition(1160,640));
  const ironBefore=await page.evaluate(()=>window.__deepforgeTest.snapshot().rocks.filter(rock=>rock.barrierId==='iron_seam').map(rock=>rock.hp));
  await page.keyboard.down('Space');
  await page.waitForTimeout(300);
  await page.keyboard.up('Space');
  const ironLocked=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(ironLocked.rocks.filter(rock=>rock.barrierId==='iron_seam').map(rock=>rock.hp)).toEqual(ironBefore);

  await page.evaluate(()=>window.__deepforgeTest.setPickaxeLevel(2));
  await page.keyboard.down('Space');
  await page.waitForTimeout(1000);
  await page.keyboard.up('Space');
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.clearedMineBarriers.iron_seam).toBe(true);

  await page.evaluate(()=>{window.__deepforgeTest.setPosition(1535,1010);window.__deepforgeTest.save()});
  await page.reload();
  await page.waitForFunction(()=>window.__deepforgeTest);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.scene).toBe('mossMine');
  expect(snapshot.state.clearedMineBarriers.outer_rubble).toBe(true);
  expect(snapshot.state.clearedMineBarriers.iron_seam).toBe(true);

  await page.evaluate(()=>window.__deepforgeTest.setPosition(145,640));
  await expect(page.locator('#contextTitle')).toHaveText('Return to Mossvein Quarry');
  await page.locator('#contextButton').click();
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.scene).toBe('surface');
  expect(snapshot.biome).toBe('mossvein');
});

test('Mossvein Mine remains readable on an iPhone viewport',async({page},testInfo)=>{
  await freshGame(page);
  await page.evaluate(()=>window.__deepforgeTest.enterMine());
  await page.evaluate(()=>window.__deepforgeTest.setPosition(555,640));
  await expect(page.locator('#areaName')).toHaveText('MOSSVEIN MINE');
  await expect(page.locator('#objectiveText')).toHaveText('Hold MINE near a rock');
  await page.screenshot({path:testInfo.outputPath('mossvein-mine-mobile.png'),fullPage:true});
  await page.evaluate(()=>window.__deepforgeTest.setPosition(145,640));
  await expect(page.locator('#contextTitle')).toHaveText('Return to Mossvein Quarry');
  const layout=await page.evaluate(()=>{
    const panel=document.querySelector('#contextPanel').getBoundingClientRect();
    return{scrollWidth:document.documentElement.scrollWidth,width:innerWidth,panel:{left:panel.left,right:panel.right,bottom:panel.bottom},height:innerHeight};
  });
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width);
  expect(layout.panel.left).toBeGreaterThanOrEqual(0);
  expect(layout.panel.right).toBeLessThanOrEqual(layout.width);
  expect(layout.panel.bottom).toBeLessThanOrEqual(layout.height);
});

test('every unlocked surface biome leads to its own mine layout',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.unlockAllAreas();
    window.__deepforgeTest.unlockStarfall();
    window.__deepforgeTest.setPickaxeLevel(5);
  });

  const cases=[
    {scene:'moonMine',surface:[1225,720],title:'Moonglass Labyrinth',resource:'moonglass',style:'moon'},
    {scene:'emberMine',surface:[2340,650],title:'Emberdeep Works',resource:'emberstone',style:'ember'},
    {scene:'starMine',surface:[3450,690],title:'Starfall Hollow',resource:'astralite',style:'star'}
  ];
  const signatures=new Set();

  for(const mine of cases){
    await page.evaluate(([x,y])=>window.__deepforgeTest.setPosition(x,y),mine.surface);
    await expect(page.locator('#contextTitle')).toHaveText(mine.title);
    await page.locator('#contextButton').click();
    await expect(page.locator('#areaName')).toHaveText(mine.title.toUpperCase());

    const snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
    expect(snapshot.scene).toBe(mine.scene);
    expect(snapshot.mine.style).toBe(mine.style);
    expect(snapshot.mine.barrierIds).toHaveLength(2);
    expect(snapshot.rocks.some(rock=>rock.scene===mine.scene&&rock.type===mine.resource)).toBe(true);
    signatures.add([snapshot.mine.width,snapshot.mine.height,snapshot.mine.solidCount,snapshot.mine.labels.join('|')].join(':'));

    await page.evaluate(()=>window.__deepforgeTest.exitMine());
    expect((await page.evaluate(()=>window.__deepforgeTest.snapshot())).scene).toBe('surface');
  }

  expect(signatures.size).toBe(cases.length);
});

test('all mine layouts remain readable and distinct across viewports',async({page},testInfo)=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.unlockAllAreas();
    window.__deepforgeTest.unlockStarfall();
    window.__deepforgeTest.setPickaxeLevel(5);
  });

  const cases=[
    {scene:'moonMine',position:[790,700]},
    {scene:'emberMine',position:[1080,680]},
    {scene:'starMine',position:[1260,725]}
  ];
  for(const mine of cases){
    await page.evaluate(scene=>window.__deepforgeTest.enterMine(scene),mine.scene);
    await page.evaluate(([x,y])=>window.__deepforgeTest.setPosition(x,y),mine.position);
    const layout=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,canvas:document.getElementById('gameCanvas').getBoundingClientRect().toJSON()}));
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width);
    expect(layout.canvas.width).toBeGreaterThan(0);
    expect(layout.canvas.height).toBeGreaterThan(0);
    await page.screenshot({path:testInfo.outputPath(mine.scene+'-layout.png'),fullPage:true});
    await page.evaluate(()=>window.__deepforgeTest.exitMine());
  }
});

test('mine nodes never respawn inside permanent walls',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.unlockAllAreas();
    window.__deepforgeTest.unlockStarfall();
  });

  for(const scene of ['mossMine','moonMine','emberMine','starMine']){
    await page.evaluate(mineScene=>window.__deepforgeTest.enterMine(mineScene),scene);
    const blockedNodes=await page.evaluate(()=>{
      const snapshot=window.__deepforgeTest.snapshot();
      return snapshot.rocks
        .filter(rock=>rock.scene===snapshot.scene&&!rock.barrierId)
        .filter(rock=>snapshot.mine.solids.some(solid=>
          rock.x>=solid.x&&rock.x<=solid.x+solid.w&&
          rock.y>=solid.y&&rock.y<=solid.y+solid.h
        ))
        .map(rock=>({id:rock.id,type:rock.type,x:rock.x,y:rock.y}));
    });
    expect(blockedNodes).toEqual([]);
    await page.evaluate(()=>window.__deepforgeTest.exitMine());
  }
});

test('every new mine passage can be cleared with the intended pickaxe',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.unlockAllAreas();
    window.__deepforgeTest.unlockStarfall();
    window.__deepforgeTest.setPickaxeLevel(5);
  });
  const cases=[
    {scene:'moonMine',mineTime:900,barriers:[['moon_prism_gate',435,695],['moon_star_lock',955,505]]},
    {scene:'emberMine',mineTime:1200,barriers:[['ember_bulkhead',455,625],['ember_crucible_lock',1165,452]]},
    {scene:'starMine',mineTime:3000,barriers:[['star_bridge_lock',800,725],['star_crown_lock',1550,460]]}
  ];

  for(const mine of cases){
    await page.evaluate(scene=>window.__deepforgeTest.enterMine(scene),mine.scene);
    for(const [barrier,x,y] of mine.barriers){
      await page.evaluate(([px,py])=>window.__deepforgeTest.setPosition(px,py),[x,y]);
      await page.keyboard.down('Space');
      await page.waitForTimeout(mine.mineTime);
      await page.keyboard.up('Space');
      expect((await page.evaluate(()=>window.__deepforgeTest.snapshot())).state.clearedMineBarriers[barrier]).toBe(true);
    }
    await page.evaluate(()=>window.__deepforgeTest.exitMine());
  }
});

test('mine terrain can be excavated into a persistent player-made tunnel',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.enterMine('mossMine');
    window.__deepforgeTest.setAim(1,0);
  });
  const before=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(before.mine.terrain.cellCount).toBeGreaterThan(1000);
  expect(before.mine.terrain.target).not.toBeNull();

  await page.keyboard.down('Space');
  await page.waitForTimeout(420);
  await page.keyboard.up('Space');
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.mine.terrain.dugCells).toBeGreaterThan(0);
  expect(snapshot.state.mined.stone).toBeGreaterThan(0);

  const dug=snapshot.mine.terrain.dugCells;
  await page.evaluate(()=>window.__deepforgeTest.save());
  await page.reload();
  await page.waitForFunction(()=>window.__deepforgeTest);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.scene).toBe('mossMine');
  expect(snapshot.mine.terrain.dugCells).toBe(dug);
});

test('expanded mine depths use lazy terrain chunks and a following camera',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>window.__deepforgeTest.enterMine('mossMine'));
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.build).toEqual({version:'0.10.0',name:'RESOURCE INVENTORY & MOVABLE BASE'});
  expect(snapshot.mine.height).toBeGreaterThanOrEqual(5000);
  expect(snapshot.mine.terrain.chunkCells).toBe(16);
  expect(snapshot.mine.terrain.activeChunks).toBeLessThan(snapshot.mine.terrain.totalChunks);

  await page.evaluate(()=>window.__deepforgeTest.setPosition(960,4300));
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.camera.y).toBeGreaterThan(3500);
  expect(snapshot.player.y).toBe(4300);
  expect(snapshot.mine.terrain.target).not.toBeNull();
  expect(snapshot.mine.terrain.activeChunks).toBeLessThan(snapshot.mine.terrain.totalChunks);
});

test('the exact build version is always visible in the game HUD',async({page})=>{
  await freshGame(page);
  await expect(page.locator('#buildVersion')).toHaveText('v0.10.0');
  await page.locator('#menuButton').click();
  await expect(page.locator('#menuBuildVersion')).toHaveText('DEEPFORGE v0.10.0 · RESOURCE INVENTORY & MOVABLE BASE');
});

test('one text-free visual guide leads to the next action and fades nearby',async({page})=>{
  await freshGame(page);
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.guide).toEqual(expect.objectContaining({kind:'rock',scene:'surface',visible:true}));
  expect(snapshot.markerStyle.bonusVeinRings).toBe(false);
  await page.evaluate(guide=>window.__deepforgeTest.setPosition(guide.x,guide.y),snapshot.guide);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.guide.visible).toBe(false);
  await page.evaluate(()=>{window.__deepforgeTest.grantMined('stone',1);window.__deepforgeTest.grantCargo('stone',1)});
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.guide).toEqual(expect.objectContaining({kind:'sell',scene:'surface'}));
  await expect(page.locator('#objectiveText')).toHaveText('Sell your haul at the Sell Chest');
});

test('each mine hides one persistent random entrance to a contrasting Depth 2',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{window.__deepforgeTest.unlockAllAreas();window.__deepforgeTest.unlockStarfall()});
  for(const scene of ['mossMine','moonMine','emberMine','starMine']){
    await page.evaluate(sceneId=>window.__deepforgeTest.enterMine(sceneId),scene);
    let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
    expect(snapshot.depth).toBe(1);
    expect(snapshot.mine.depthEntrance).toMatchObject({scene,discovered:false});
    expect(snapshot.mine.depthEntrance.boundaryIndex).not.toBeNull();
    expect(snapshot.mine.dirt).not.toBe(snapshot.mine.floor);
    const entrance={x:snapshot.mine.depthEntrance.x,y:snapshot.mine.depthEntrance.y};
    expect(await page.evaluate(()=>window.__deepforgeTest.discoverDepthEntrance())).toBe(true);
    expect(await page.evaluate(()=>window.__deepforgeTest.enterDepth())).toBe(true);
    snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
    expect(snapshot.depth).toBe(2);
    expect(snapshot.mine.terrain.maxHp).toBeGreaterThan(8);
    expect(snapshot.mine.dirt).not.toBe(snapshot.mine.floor);
    expect(snapshot.mine.discovery.deposits.length).toBeGreaterThanOrEqual(14);
    expect(snapshot.mine.discovery.deposits.every(deposit=>Object.values(snapshot.mine.depthResources).includes(deposit.type))).toBe(true);
    expect(snapshot.mine.depthStations).toEqual(expect.objectContaining({sell:expect.any(Object),forge:expect.any(Object)}));
    expect(snapshot.mine.depthEntrance).toMatchObject({...entrance,discovered:true});
    expect(await page.evaluate(()=>window.__deepforgeTest.exitDepth())).toBe(true);
    await page.evaluate(()=>window.__deepforgeTest.exitMine());
  }
});

test('drill-gated materials route progression back through earlier Depth 2 mines',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    const api=window.__deepforgeTest;api.unlockAllAreas();api.unlockStarfall();api.enterMine('mossMine');api.discoverDepthEntrance();api.enterDepth();api.setStarforgeVariant('swift');
  });
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  const starforgeCooldown=snapshot.effectivePickaxe.cooldown;
  expect(snapshot.mine.depthResources).toEqual({main:'rootiron',secondary:'deepstone',rare:'ambercore'});
  const mossGate=snapshot.mine.discovery.deposits.find(deposit=>deposit.type==='burrowsteel');
  expect(mossGate).toEqual(expect.objectContaining({requiresDrillLevel:1,drillGated:true}));
  expect(snapshot.state.drillGoalScene).toBe('mossMine');
  await expect(page.locator('#objectiveText')).toHaveText('Mine Rootiron for Burrower Drill');
  await expect(page.locator('#objectiveDetail')).toContainText('ROOTWOUND DEPTHS');
  const lockedHit=await page.evaluate(id=>window.__deepforgeTest.hitDepositRock(id,0),mossGate.id);
  expect(lockedHit.after).toEqual(lockedHit.before);

  await page.evaluate(()=>{const api=window.__deepforgeTest;api.grantGold(1200);api.grantCargo('rootiron',8);api.grantCargo('ambercore',1);api.grantCargo('copper',3);api.sellCargo()});
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.cargo).toEqual(expect.objectContaining({rootiron:8,ambercore:1,copper:0}));
  await expect(page.locator('#objectiveDetail')).toHaveText('READY AT ANY DEPTH 2 DRILL FORGE');
  await page.evaluate(()=>window.__deepforgeTest.upgradeDrill());
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.drillLevel).toBe(1);expect(snapshot.effectivePickaxe.name).toBe('Burrower Drill');expect(snapshot.effectivePickaxe.cooldown).toBeLessThan(starforgeCooldown);
  expect(snapshot.toolMode).toBe('drill');
  await expect(page.locator('#mineAction')).toHaveText('DRILL');
  await expect(page.locator('#objectiveText')).toHaveText('Mine Burrowsteel for Pulse Drill');
  const unlockedHit=await page.evaluate(id=>window.__deepforgeTest.hitDepositRock(id,0),mossGate.id);
  expect(unlockedHit.after).not.toEqual(unlockedHit.before);

  await page.evaluate(()=>{const api=window.__deepforgeTest;api.grantGold(3200);api.grantCargo('burrowsteel',12);api.upgradeDrill();api.exitDepth();api.exitMine();api.enterMine('moonMine');api.discoverDepthEntrance();api.enterDepth()});
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.drillLevel).toBe(2);expect(snapshot.effectivePickaxe.name).toBe('Pulse Drill');
  const moonGate=snapshot.mine.discovery.deposits.find(deposit=>deposit.type==='phasecrystal');
  expect(moonGate).toEqual(expect.objectContaining({requiresDrillLevel:2,drillGated:true}));
  await expect(page.locator('#objectiveText')).toHaveText('Mine Phase Crystal for Deepcore Drill');
  await expect(page.locator('#objectiveDetail')).toContainText('PRISMATIC DEPTHS');
  const moonHit=await page.evaluate(id=>window.__deepforgeTest.hitDepositRock(id,0),moonGate.id);
  expect(moonHit.after).not.toEqual(moonHit.before);
  await page.evaluate(()=>{const api=window.__deepforgeTest;api.grantCargo('phasecrystal',10);api.exitDepth();api.exitMine();api.enterMine('emberMine');api.discoverDepthEntrance();api.enterDepth()});
  await expect(page.locator('#objectiveText')).toHaveText('Mine Infernium for Deepcore Drill');
  await expect(page.locator('#objectiveDetail')).toContainText('MOLTEN DEPTHS');
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  const emberGate=snapshot.mine.discovery.deposits.find(deposit=>deposit.type==='infernium');
  expect(emberGate).toEqual(expect.objectContaining({requiresDrillLevel:2,drillGated:true}));
  await page.evaluate(()=>{const api=window.__deepforgeTest;api.grantCargo('infernium',10);api.grantGold(7200);api.upgradeDrill();api.save()});
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.drillLevel).toBe(3);expect(snapshot.effectivePickaxe.name).toBe('Deepcore Drill');
  await expect(page.locator('#objectiveText')).toHaveText('Deepcore Drill mastered');
  await page.reload();await page.waitForFunction(()=>window.__deepforgeTest);snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.drillLevel).toBe(3);expect(snapshot.effectivePickaxe.name).toBe('Deepcore Drill');
});
test('terrain strikes produce weighted mining feedback without changing targeting',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.enterMine('mossMine');
    window.__deepforgeTest.setPosition(180,503);
    window.__deepforgeTest.setAim(.899,-.438);
  });
  const target=await page.evaluate(()=>window.__deepforgeTest.snapshot().mine.terrain.target.index);
  await page.evaluate(()=>window.__deepforgeTest.mineOnce());
  const snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.feedback.terrainHitIndex).toBe(target);
  expect(snapshot.feedback.particleCount).toBeGreaterThan(0);
  expect(snapshot.feedback.shake).toBe(0);
  expect(snapshot.feedback.flash).toBe(0);
  expect(snapshot.feedback.hitStop).toBeGreaterThan(0);
  expect(snapshot.mine.terrain.target.index).toBe(target);
});

test('connected discovery veins build to a clear jackpot finish',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>window.__deepforgeTest.enterMine('mossMine'));
  const deposit=await page.evaluate(()=>window.__deepforgeTest.snapshot().mine.discovery.deposits.find(item=>!item.rareFind));
  for(let index=0;index<deposit.size;index++)await page.evaluate(([id,rockIndex])=>window.__deepforgeTest.breakDepositRock(id,rockIndex),[deposit.id,index]);
  const feedback=await page.evaluate(()=>window.__deepforgeTest.snapshot().feedback);
  expect(feedback.lastDepositBeat).toEqual({id:deposit.id,type:deposit.type,broken:deposit.size,total:deposit.size,jackpot:true});
  expect(feedback.floaters).toContain('VEIN CLEARED!');
  expect(feedback.particleCount).toBeGreaterThanOrEqual(28);
});

test('held movement targets the first blocking terrain cell instead of skipping deeper',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.enterMine('mossMine');
    window.__deepforgeTest.setPosition(180,503);
    window.__deepforgeTest.setAim(.899,-.438);
  });

  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  const firstTarget=snapshot.mine.terrain.target;
  expect(firstTarget).not.toBeNull();
  expect(firstTarget.index).toBe(364);

  await page.evaluate(()=>window.__deepforgeTest.mineOnce());
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.mine.terrain.target.index).toBe(firstTarget.index);
  expect(snapshot.mine.terrain.target.hp).toBeLessThan(firstTarget.hp);
});

test('terrain hits trigger bounded satisfaction feedback without changing targeting',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.enterMine('mossMine');
    window.__deepforgeTest.setPosition(180,503);
    window.__deepforgeTest.setAim(.899,-.438);
  });
  const before=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  const target=before.mine.terrain.target;
  await page.evaluate(index=>window.__deepforgeTest.mineTerrainCell(index),target.index);
  const after=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(after.feedback.shake).toBe(0);
  expect(after.feedback.flash).toBe(0);
  expect(after.feedback.terrainHitIndex).toBe(target.index);
  expect(after.feedback.particleCount).toBeGreaterThan(0);
  expect(after.feedback.particleCount).toBeLessThanOrEqual(260);
  expect(after.mine.terrain.target.index).toBe(target.index);
});

test('resources stay hidden until tunneling exposes their terrain cell',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.enterMine('mossMine');
    window.__deepforgeTest.setPosition(315,936);
    window.__deepforgeTest.setAim(1,0);
  });
  let copper=await page.evaluate(()=>window.__deepforgeTest.snapshot().rocks.find(rock=>rock.scene==='mossMine'&&rock.type==='copper'&&rock.x===465));
  expect(copper.exposed).toBe(false);

  await page.keyboard.down('Space');
  await page.waitForTimeout(1100);
  await page.keyboard.up('Space');
  copper=await page.evaluate(()=>window.__deepforgeTest.snapshot().rocks.find(rock=>rock.scene==='mossMine'&&rock.type==='copper'&&rock.x===465));
  expect(copper.exposed).toBe(true);
});

test('Discovery Pass builds deep connected ore veins and rare finds in every mine',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{
    window.__deepforgeTest.unlockAllAreas();
    window.__deepforgeTest.unlockStarfall();
  });
  for(const scene of ['mossMine','moonMine','emberMine','starMine']){
    await page.evaluate(sceneId=>window.__deepforgeTest.enterMine(sceneId),scene);
    const snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
    const veins=snapshot.mine.discovery.deposits.filter(deposit=>!deposit.rareFind&&!deposit.pocketRewardId);
    const rareFinds=snapshot.mine.discovery.deposits.filter(deposit=>deposit.rareFind);
    expect(snapshot.mine.discovery.caverns.length).toBeGreaterThanOrEqual(6);
    expect(veins.length).toBeGreaterThanOrEqual(10);
    expect(veins.every(deposit=>deposit.size>=4&&deposit.size<=10)).toBe(true);
    expect(rareFinds).toHaveLength(2);
    const generated=snapshot.rocks.filter(rock=>rock.scene===scene&&rock.depositId);
    expect(generated.some(rock=>rock.y>1500)).toBe(true);
    expect(generated.filter(rock=>rock.rareFind).every(rock=>!rock.exposed)).toBe(true);
    await page.evaluate(()=>window.__deepforgeTest.exitMine());
  }
});

test('breaking into a hidden chamber reveals its rare find and persists discovery',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>window.__deepforgeTest.enterMine('mossMine'));
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  const rareFind=snapshot.rocks.find(rock=>rock.scene==='mossMine'&&rock.rareFind);
  const cavern=snapshot.mine.discovery.caverns.find(item=>item.id===rareFind.cavernId);
  expect(cavern.discovered).toBe(false);
  expect(rareFind.exposed).toBe(false);

  await page.evaluate(index=>{
    window.__deepforgeTest.mineTerrainCell(index);
    window.__deepforgeTest.mineTerrainCell(index);
    window.__deepforgeTest.save();
  },cavern.boundaryIndex);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.mine.discovery.caverns.find(item=>item.id===cavern.id).discovered).toBe(true);
  expect(snapshot.rocks.find(rock=>rock.id===rareFind.id).exposed).toBe(true);
  expect(snapshot.feedback.lastDiscovery).toMatchObject({type:rareFind.type,rare:true});
  expect(snapshot.feedback.particleCount).toBeLessThanOrEqual(260);

  await page.reload();
  await page.waitForFunction(()=>window.__deepforgeTest);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.discoveredCaverns[cavern.id]).toBe(true);
  expect(snapshot.rocks.find(rock=>rock.id===rareFind.id).exposed).toBe(true);
});

test('every hidden pocket contains a persistent useful reward',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>window.__deepforgeTest.enterMine('mossMine'));
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.mine.discovery.caverns.every(cavern=>cavern.reward&&['cache','crystal','motherlode','shrine'].includes(cavern.reward.kind))).toBe(true);
  const cache=snapshot.mine.discovery.caverns.find(cavern=>cavern.reward.kind==='cache');
  await page.evaluate(cavern=>{
    window.__deepforgeTest.mineTerrainCell(cavern.boundaryIndex);
    window.__deepforgeTest.mineTerrainCell(cavern.boundaryIndex);
    window.__deepforgeTest.setPosition(cavern.x,cavern.y);
    window.__deepforgeTest.step(.1);
    window.__deepforgeTest.save();
  },cache);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.claimedPocketRewards[cache.reward.id]).toBe(true);
  expect(snapshot.feedback.lastPocketReward).toMatchObject({id:cache.reward.id,kind:'cache'});
  expect(snapshot.feedback.shake).toBe(0);
  expect(snapshot.feedback.flash).toBe(0);
  await page.reload();await page.waitForFunction(()=>window.__deepforgeTest);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.claimedPocketRewards[cache.reward.id]).toBe(true);
});

test('resource inventory auto-sorts and the base moves between maps without loss',async({page})=>{
  await freshGame(page);
  await page.evaluate(()=>{window.__deepforgeTest.grantCargo('stone',12);window.__deepforgeTest.grantCargo('copper',7)});
  await page.locator('#inventoryButton').click();
  await expect(page.locator('#inventoryShade')).toBeVisible();
  await expect(page.locator('#inventoryGrid')).toContainText('Stone');
  await expect(page.locator('#inventoryGrid')).toContainText('Copper');
  await page.locator('#autoSortButton').click();
  let snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.cargo.stone+snapshot.state.cargo.copper).toBe(0);
  expect(snapshot.state.base.chests[0].items.stone).toBe(12);
  expect(snapshot.state.base.chests[0].items.copper).toBe(7);
  await page.locator('#inventoryCloseButton').click();

  await page.evaluate(()=>window.__deepforgeTest.setPosition(455,250));
  await expect(page.locator('#contextSecondaryButton')).toBeVisible();
  await page.locator('#contextSecondaryButton').click();
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());expect(snapshot.state.base.forge.packed).toBe(true);
  await page.evaluate(()=>window.__deepforgeTest.enterMine('mossMine'));
  await page.locator('#inventoryButton').click();
  await page.locator('[data-base-place="forge"]').click();
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.base.forge).toMatchObject({scene:'mossMine',depth:1,packed:false});
  await page.evaluate(()=>window.__deepforgeTest.save());await page.reload();await page.waitForFunction(()=>window.__deepforgeTest);
  snapshot=await page.evaluate(()=>window.__deepforgeTest.snapshot());
  expect(snapshot.state.base.forge.scene).toBe('mossMine');expect(snapshot.state.base.chests[0].items.stone).toBe(12);
});
