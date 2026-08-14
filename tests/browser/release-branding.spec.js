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
  await expect(logo).toHaveAttribute('src','assets/branding/ever-deeper-logo.png?v=02614');
  const logoState=await logo.evaluate(image=>({complete:image.complete,width:image.naturalWidth,height:image.naturalHeight,bounds:image.getBoundingClientRect().toJSON()}));
  expect(logoState).toMatchObject({complete:true,width:800,height:297});
  expect(logoState.bounds.width).toBeGreaterThanOrEqual(124);
  expect(logoState.bounds.right).toBeLessThanOrEqual(await page.evaluate(()=>innerWidth));

  await expect(page.locator('#buildVersion')).toHaveText('v0.26.14');
  await expect(page.locator('#menuBuildVersion')).toHaveText('EVER DEEPER v0.26.14 · ROAD JUNCTION BLEND');
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
    build:{version:'0.26.14',name:'ROAD JUNCTION BLEND'},
    music:'assets/audio/ever-deeper-drift-loop.mp3',
    retiredMarkup:false,
    retiredStorage:false,
    currentStorage:true
  });
});
