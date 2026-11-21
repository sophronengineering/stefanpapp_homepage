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
    assert.ok(html.includes('/ai-engineering'));
    assert.ok(html.includes('/worldview'));
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
    assert.ok(html.includes('Work with me'));
  });

  it('index.html contains social proof section', () => {
    const html = readFileSync('dist/index.html', 'utf-8');
    assert.ok(html.includes('social-proof'));
  });

  it('generates ai-engineering page', () => {
    assert.ok(existsSync('dist/ai-engineering/index.html'));
  });

  it('ai-engineering contains service blocks', () => {
    const html = readFileSync('dist/ai-engineering/index.html', 'utf-8');
    assert.ok(html.includes('Consulting'));
    assert.ok(html.includes('Integration'));
    assert.ok(html.includes('Training'));
  });

  it('links to a single LinkedIn profile URL on every page', () => {
    for (const page of ['index', 'ai-engineering', 'data-transformations', 'leadership', 'contact', 'investments', 'worldview']) {
      const file = page === 'index' ? 'dist/index.html' : `dist/${page}/index.html`;
      const html = readFileSync(file, 'utf-8');
      const urls = new Set(html.match(/https:\/\/www\.linkedin\.com\/in\/[\w-]+/g) ?? []);
      assert.ok(urls.size <= 1 && [...urls].every((u) => u === 'https://www.linkedin.com/in/stefanpapp'), `${page}: ${[...urls]}`);
    }
  });

  it('generates data-transformations page', () => {
    assert.ok(existsSync('dist/data-transformations/index.html'));
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

  it('generates leadership page', () => {
    assert.ok(existsSync('dist/leadership/index.html'));
  });

  it('generates investments page', () => {
    assert.ok(existsSync('dist/investments/index.html'));
  });

  it('investments page contains only the investing-for-programmers text', () => {
    const html = readFileSync('dist/investments/index.html', 'utf-8');
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    assert.ok(main.includes('I wrote investing for programmers'));
    assert.ok(main.includes('once the data confirms in numbers what I see as a qualitative advantage, I invest.'));
    for (const gone of ['Portfolio', 'Stackform', 'Avg Realized Return', 'Past performance', 'small checks']) {
      assert.ok(!main.includes(gone), `investments still contains "${gone}"`);
    }
  });

  it('makes no angel-investing claims', () => {
    for (const file of ['dist/index.html', 'dist/contact/index.html', 'dist/investments/index.html']) {
      const html = readFileSync(file, 'utf-8');
      for (const claim of ['Angel Investments', 'pre-seed', 'seed checks', 'back founders', 'earliest stages']) {
        assert.ok(!html.includes(claim), `${file} still contains "${claim}"`);
      }
    }
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
    const files = ['dist/index.html', 'dist/sitemap-index.xml', 'dist/sitemap-0.xml', 'dist/robots.txt'];
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
