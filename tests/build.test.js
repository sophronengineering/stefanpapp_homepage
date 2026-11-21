import { readFileSync, existsSync } from 'fs';
import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'child_process';

describe('Build output', () => {
  before(() => {
    const result = spawnSync('npx', ['astro', 'build'], { stdio: 'pipe' });
    if (result.status !== 0) {
      throw new Error(`Build failed: ${result.stderr?.toString()}`);
    }
  });

  it('generates index.html', () => {
    assert.ok(existsSync('dist/index.html'));
  });

  it('index.html contains meta description', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('<meta name="description"'));
  });

  it('index.html contains og:title', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('og:title'));
  });

  it('index.html contains skip-to-content link', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('skip-to-content'));
  });

  it('index.html contains cookie consent', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('cookie-consent'));
  });

  it('index.html contains nav element', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('<nav'));
  });

  it('index.html contains all nav links', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('/worldview'));
    assert.ok(html.includes('/investments'));
    assert.ok(html.includes('/about-stefan'));
    assert.ok(html.includes('/contact'));
  });

  it('index.html contains footer element', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('<footer'));
  });

  it('index.html contains social links', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('linkedin'));
    assert.ok(html.includes('github'));
  });

  it('index.html contains hero split section', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('hero-split'));
  });

  it('index.html contains both CTAs', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('Read my thinking'));
    assert.ok(html.includes('See my investments'));
  });

  it('index.html contains social proof section', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('social-proof'));
  });

  it('generates about-stefan page', () => {
    assert.ok(existsSync('dist/about-stefan/index.html'));
  });

  it('about-stefan carries the real track record and recommendations', () => {
    const html = readFileSync('dist/about-stefan/index.html', 'utf-8');
    for (const text of ['Track record', 'Sophron Engineering', 'Hagenberg Software GmbH', 'Michael Wolfrath', 'Matthias Bidlingmeyer']) {
      assert.ok(html.includes(text), `about-stefan is missing "${text}"`);
    }
  });

  it('home page shows the live social proof stats', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    for (const text of ['Years in Engineering Leadership', 'Engineers Led', 'Companies Advised', 'Angel Investments']) {
      assert.ok(html.includes(text), `home is missing "${text}"`);
    }
    assert.ok(!html.includes('Avg Realized Return'));
    assert.ok(!html.includes('Successful Exits'));
  });

  it('links to a single LinkedIn profile URL on every page', () => {
    for (const page of ['index.html', 'about-stefan/index.html', 'contact/index.html', 'investments/index.html', 'worldview/index.html']) {
      const html = readFileSync(`dist/${page}`, 'utf-8');
      const urls = new Set(html.match(/https:\/\/www\.linkedin\.com\/in\/[\w-]+/g) ?? []);
      assert.deepStrictEqual([...urls], ['https://www.linkedin.com/in/stefanpapp'], page);
    }
  });

  it('does not generate or link the retired pages', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    for (const slug of ['ai-engineering', 'data-transformations', 'leadership']) {
      assert.ok(!existsSync(`dist/${slug}/index.html`), `${slug} page should be gone`);
      assert.ok(!html.includes(`href="/${slug}"`), `home still links to /${slug}`);
    }
  });

  it('generates worldview page', () => {
    assert.ok(existsSync('dist/worldview/index.html'));
  });

  it('worldview contains accordion sections', () => {
    const html = readFileSync('dist/worldview/index.html', 'utf-8');
    assert.ok(html.includes('libertarianism'));
    assert.ok(html.includes('growth-culture'));
    assert.ok(html.includes('cats'));
    assert.ok(html.includes('aria-expanded'));
  });

  it('generates investments page', () => {
    assert.ok(existsSync('dist/investments/index.html'));
  });

  it('investments page contains disclaimer', () => {
    const html = readFileSync('dist/investments/index.html', 'utf-8');
    assert.ok(html.includes('Past performance'));
  });

  it('generates contact page', () => {
    assert.ok(existsSync('dist/contact/index.html'));
  });

  it('contact page contains form with required fields', () => {
    const html = readFileSync('dist/contact/index.html', 'utf-8');
    assert.ok(html.includes('<form'));
    assert.ok(html.includes('formspree'));
    assert.ok(html.includes('name="name"'));
    assert.ok(html.includes('name="email"'));
  });

  it('uses the live domain for canonical, JSON-LD, sitemap and robots URLs', () => {
    const files = ['dist/index.html', 'dist/about-stefan/index.html', 'dist/sitemap-index.xml', 'dist/sitemap-0.xml', 'dist/robots.txt'];
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      assert.ok(!content.includes('stefanpapp.com'), `${file} references the unregistered stefanpapp.com`);
    }
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('<link rel="canonical" href="https://stefanpapp.vercel.app/"'));
    assert.ok(readFileSync('dist/robots.txt', 'utf-8').includes('Sitemap: https://stefanpapp.vercel.app/sitemap-index.xml'));
  });

  it('generates 404 page', () => {
    assert.ok(existsSync('dist/404.html'));
  });
});
