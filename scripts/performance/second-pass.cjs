/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser checks. */
const assert = require('node:assert/strict');
const path = require('node:path');
const config = require('./config.json');
const { chromium } = require(path.join(process.argv[2], 'node_modules/playwright'));
const productionUrl = 'https://moiz-ansari.vercel.app/';

async function verifyForm(page) {
  const form = page.locator('#contact form');
  const name = form.getByLabel('Your Name');
  const email = form.getByLabel('Email');
  const message = form.getByLabel('Message');
  const submit = form.getByRole('button');
  let posts = 0;
  let response;
  let respond;
  await page.route('https://api.emailjs.com/**', async route => {
    if (route.request().method() !== 'POST') {
      await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST, OPTIONS' } });
      return;
    }
    posts++;
    await response;
    await route.fulfill({ status: posts === 1 ? 500 : 200, body: posts === 1 ? 'Mock failure' : 'OK', headers: { 'access-control-allow-origin': '*' } });
  });

  assert.equal(await name.getAttribute('autocomplete'), 'name');
  assert.equal(await email.getAttribute('type'), 'email');
  assert.equal(await email.getAttribute('autocomplete'), 'email');
  for (const field of [name, email, message]) assert.notEqual(await field.getAttribute('required'), null);
  await name.fill('   ');
  await email.fill('bad-address');
  await message.fill('   ');
  await submit.click();
  for (const field of [name, email, message]) {
    assert.equal(await field.getAttribute('aria-invalid'), 'true');
    assert(await field.evaluate(element => element.ownerDocument.getElementById(element.getAttribute('aria-describedby'))?.textContent));
  }
  assert(await name.evaluate(element => element === document.activeElement));
  assert(await name.evaluate(element => {
    const headerBottom = document.querySelector('header').getBoundingClientRect().bottom;
    return element.getBoundingClientRect().top >= headerBottom + 16;
  }), 'Error focus should leave room for the floating label below the sticky header');
  assert.equal(posts, 0);

  await name.fill('Portfolio test');
  await email.fill('portfolio@example.invalid');
  await message.fill('This message uses a mocked transport.');
  response = new Promise(resolve => { respond = resolve; });
  await submit.click();
  await page.getByRole('status').filter({ hasText: 'Sending your message.' }).waitFor();
  await form.evaluate(element => {
    element.dispatchEvent(new SubmitEvent('submit', { cancelable: true, bubbles: true }));
    element.dispatchEvent(new SubmitEvent('submit', { cancelable: true, bubbles: true }));
  });
  respond();
  await page.getByRole('alert').filter({ hasText: 'Failed to send message' }).waitFor();
  assert.equal(posts, 1);
  assert.equal(await name.inputValue(), 'Portfolio test');
  assert.equal(await email.inputValue(), 'portfolio@example.invalid');
  assert.equal(await message.inputValue(), 'This message uses a mocked transport.');
  await submit.click();
  await page.getByRole('status').filter({ hasText: 'Your message was sent.' }).waitFor();
  assert.equal(posts, 2);
  for (const field of [name, email, message]) assert.equal(await field.inputValue(), '');
}

async function verifyCards(page) {
  for (const section of ['education', 'projects']) {
    const button = page.locator('#' + section).getByRole('button', { name: /details for/i }).first();
    let focused = false;
    for (let index = 0; index < 35 && !focused; index++) {
      await page.keyboard.press('Tab');
      focused = await button.evaluate(element => element === document.activeElement);
    }
    assert(focused, section + ' disclosure was unreachable by Tab');
    assert(await button.evaluate(element => {
      const outline = getComputedStyle(element, '::after');
      return element.matches(':focus-visible') && outline.outlineStyle !== 'none' && parseFloat(outline.outlineWidth) >= 2;
    }));
    const controls = await button.getAttribute('aria-controls');
    const isInert = () => button.evaluate((element, id) => document.getElementById(id)?.inert, controls);
    assert.equal(await isInert(), true);
    await page.keyboard.press('Enter');
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    assert.equal(await isInert(), false);
    await page.keyboard.press('Space');
    assert.equal(await button.getAttribute('aria-expanded'), 'false');
    assert.equal(await isInert(), true);
    assert(await button.evaluate(element => element === document.activeElement));
  }
  await page.keyboard.press('Tab');
  const source = page.locator('#projects').getByRole('link', { name: 'Source' }).first();
  assert(await source.evaluate(element => element === document.activeElement));
  assert.match(await source.getAttribute('href'), /^https:\/\/github\.com\//);
}

async function verifyNavigation(page, mobile) {
  for (const reduced of ['reduce', 'no-preference']) {
    await page.emulateMedia({ reducedMotion: reduced });
    if (reduced === 'reduce') {
      const pad = page.getByRole('region', { name: 'Notepad page' });
      await pad.getByRole('heading', { name: 'About Me:' }).waitFor();
      await page.waitForTimeout(3200);
      assert.match(await pad.innerText(), /About Me:/);
      const next = page.getByRole('button', { name: 'Next notepad page' });
      for (const heading of ['Design Principles:', 'What I Can Build:', 'Favorite Quote:']) {
        await next.click();
        await pad.getByRole('heading', { name: heading }).waitFor();
      }
      await page.getByRole('button', { name: 'Previous notepad page' }).click();
      await pad.getByRole('heading', { name: 'What I Can Build:' }).waitFor();
    }

    const check = async (control, id) => {
      await page.evaluate(() => { window.scrollTest = null; });
      await control.click();
      assert.deepEqual(await page.evaluate(() => window.scrollTest), {
        id, behavior: reduced === 'reduce' ? 'instant' : 'smooth',
      });
      await page.waitForFunction(target => {
        const bounds = document.getElementById(target).getBoundingClientRect();
        return bounds.top < innerHeight && bounds.bottom > 60;
      }, id);
    };
    for (const [name, id] of [['EXP', 'experience'], ['Skills', 'skills'], ['Education', 'education'], ['Projects', 'projects'], ['Contact', 'contact'], ['About', 'about']]) {
      if (mobile) await page.getByRole('button', { name: 'Open navigation menu' }).click();
      await check(page.locator('header').getByRole('link', { name, exact: true }), id);
    }
    await check(page.getByRole('button', { name: 'View Work →' }), 'projects');
    await check(page.getByRole('link', { name: 'Back to top' }), 'about');
    await check(page.getByRole('button', { name: 'Get in Touch', exact: true }), 'contact');
  }
}

async function verifyMetadata(page) {
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  assert.equal(canonical, productionUrl);
  assert.match(await page.title(), /Moiz Ansari.*Backend Development/);
  assert.match(await page.locator('meta[name="description"]').getAttribute('content'), /GPU-accelerated/);
  const image = new URL('social-preview.jpg', productionUrl);
  assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), image.href);
  assert.equal(await page.locator('meta[name="twitter:image"]').getAttribute('content'), image.href);
  const preview = await page.request.get(config.url + image.pathname);
  assert.equal(preview.status(), 200);
  assert.match(preview.headers()['content-type'], /image\/jpeg/);
  const dimensions = await page.evaluate(async url => {
    const image = new Image();
    image.src = url;
    await image.decode();
    return [image.naturalWidth, image.naturalHeight];
  }, image.pathname);
  assert.deepEqual(dimensions, [1200, 630]);
  const sitemap = await (await page.request.get(config.url + '/sitemap.xml')).text();
  assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]), [productionUrl]);
  const robots = await (await page.request.get(config.url + '/robots.txt')).text();
  assert(robots.includes(new URL('sitemap.xml', productionUrl).href));
  await page.goto(config.url + '/style-guide');
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
  assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
}

async function main() {
  const browser = await chromium.launch({ executablePath: config.chromePath, headless: config.headless });
  try {
    for (const mobile of [false, true]) {
      for (const theme of ['paper', 'chalkboard']) {
        const context = await browser.newContext({
          viewport: mobile ? { width: 360, height: 800 } : { width: 1440, height: 900 },
          isMobile: mobile,
          hasTouch: mobile,
        });
        await context.addInitScript(theme => {
          localStorage.setItem('paper-portfolio-theme', theme);
          const scrollIntoView = Element.prototype.scrollIntoView;
          Element.prototype.scrollIntoView = function (options) {
            if (this.id) window.scrollTest = { id: this.id, behavior: options?.behavior };
            return scrollIntoView.call(this, options);
          };
        }, theme);
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(config.url, { waitUntil: 'networkidle' });
        assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
        await verifyCards(page);
        await verifyNavigation(page, mobile);
        await verifyForm(page);
        if (!mobile && theme === 'paper') await verifyMetadata(page);
        assert.deepEqual(errors, []);
        await context.close();
        console.log((mobile ? 'Mobile' : 'Desktop') + ' ' + theme + ' passed');
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
