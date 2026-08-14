const {test,expect}=require('@playwright/test');

test('caves use an occluded mobile lightmap with colored ore lights',async({page})=>{
  await page.goto('/');
  await page.waitForFunction(()=>window.__everDeeperTest);

  const result=await page.evaluate(()=>{
    const api=window.__everDeeperTest;api.reset();api.enterMine('mossMine');
    let snapshot=api.snapshot(),glowingRock=snapshot.rocks.find(rock=>rock.scene==='mossMine'&&rock.depth===1&&rock.type!=='stone'&&rock.type!=='deepstone'&&!rock.cavernId&&!rock.broken);
    const columns=Math.ceil(snapshot.mine.width/snapshot.mine.terrain.tileSize),cellIndex=Math.floor(glowingRock.y/snapshot.mine.terrain.tileSize)*columns+Math.floor(glowingRock.x/snapshot.mine.terrain.tileSize);
    for(let hit=0;hit<8;hit++)api.mineTerrainCell(cellIndex);api.setPosition(glowingRock.x,glowingRock.y);api.renderOnce();const oreLights=api.snapshot().lighting.oreLights;
    api.setPosition(180,503);api.setAim(.899,-.438);api.renderOnce();
    snapshot=api.snapshot();const target=snapshot.mine.terrain.target;
    for(let index=0;index<12;index++)api.renderOnce();const samples=[];
    for(let index=0;index<30;index++){const started=performance.now();api.renderOnce();samples.push(performance.now()-started)}
    samples.sort((a,b)=>a-b);
    return{
      lighting:api.snapshot().lighting,
      oreLights,
      target:!!target,
      blockedDistance:api.sampleHeadlampRay(),
      averageMs:samples.reduce((total,value)=>total+value,0)/samples.length,
      p95Ms:samples[Math.floor(samples.length*.95)]
    };
  });

  expect(result.target).toBe(true);
  expect(result.blockedDistance).toBeLessThan(result.lighting.beamLength);
  expect(result.lighting).toMatchObject({enabled:true,technique:'low-resolution-raycast-lightmap',occlusion:true,bufferScale:.34,maxOreLights:16});
  expect(result.lighting.rayChecks).toBeGreaterThan(0);
  expect(result.oreLights).toBeGreaterThan(0);
  expect(result.oreLights).toBeLessThanOrEqual(16);
  expect(result.averageMs).toBeLessThan(25);
  expect(result.p95Ms).toBeLessThan(40);
});
