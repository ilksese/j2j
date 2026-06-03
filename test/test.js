const { strict: assert } = require('assert');
const fs = require('fs');
const path = require('path');
const { convert } = require('../src/convert');

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

function captureOutput(fn) {
  const chunks = [];
  const origWrite = process.stdout.write;
  process.stdout.write = (chunk) => { chunks.push(chunk); return true; };
  try {
    const exitCode = fn();
    return { exitCode, output: chunks.join('') };
  } finally {
    process.stdout.write = origWrite;
  }
}

// --- Dry-run tests ---

test('dry-run: basic.json5 produces expected JSON', () => {
  const fixture = path.join(FIXTURES_DIR, 'basic.json5');
  const expected = fs.readFileSync(path.join(FIXTURES_DIR, 'basic.expected.json'), 'utf-8');
  const { exitCode, output } = captureOutput(() => convert(fixture, { dryRun: true }));
  assert.equal(exitCode, 0);
  assert.equal(output, expected);
});

test('dry-run: comments.json5 strips comments', () => {
  const fixture = path.join(FIXTURES_DIR, 'comments.json5');
  const expected = fs.readFileSync(path.join(FIXTURES_DIR, 'comments.expected.json'), 'utf-8');
  const { exitCode, output } = captureOutput(() => convert(fixture, { dryRun: true }));
  assert.equal(exitCode, 0);
  assert.equal(output, expected);
});

test('dry-run: trailing-comma.json5 removes trailing commas', () => {
  const fixture = path.join(FIXTURES_DIR, 'trailing-comma.json5');
  const expected = fs.readFileSync(path.join(FIXTURES_DIR, 'trailing-comma.expected.json'), 'utf-8');
  const { exitCode, output } = captureOutput(() => convert(fixture, { dryRun: true }));
  assert.equal(exitCode, 0);
  assert.equal(output, expected);
});

test('dry-run: single-quotes.json5 converts to double quotes', () => {
  const fixture = path.join(FIXTURES_DIR, 'single-quotes.json5');
  const expected = fs.readFileSync(path.join(FIXTURES_DIR, 'single-quotes.expected.json'), 'utf-8');
  const { exitCode, output } = captureOutput(() => convert(fixture, { dryRun: true }));
  assert.equal(exitCode, 0);
  assert.equal(output, expected);
});

test('dry-run: unquoted-keys.json5 quotes keys', () => {
  const fixture = path.join(FIXTURES_DIR, 'unquoted-keys.json5');
  const expected = fs.readFileSync(path.join(FIXTURES_DIR, 'unquoted-keys.expected.json'), 'utf-8');
  const { exitCode, output } = captureOutput(() => convert(fixture, { dryRun: true }));
  assert.equal(exitCode, 0);
  assert.equal(output, expected);
});

test('dry-run: numbers.json5 normalizes number formats', () => {
  const fixture = path.join(FIXTURES_DIR, 'numbers.json5');
  const expected = fs.readFileSync(path.join(FIXTURES_DIR, 'numbers.expected.json'), 'utf-8');
  const { exitCode, output } = captureOutput(() => convert(fixture, { dryRun: true }));
  assert.equal(exitCode, 0);
  assert.equal(output, expected);
});

test('dry-run: valid.json passes through unchanged', () => {
  const fixture = path.join(FIXTURES_DIR, 'valid.json');
  const expected = fs.readFileSync(path.join(FIXTURES_DIR, 'valid.expected.json'), 'utf-8');
  const { exitCode, output } = captureOutput(() => convert(fixture, { dryRun: true }));
  assert.equal(exitCode, 0);
  assert.equal(output, expected);
});

test('dry-run: valid.jsonc strips comments and trailing commas', () => {
  const fixture = path.join(FIXTURES_DIR, 'valid.jsonc');
  const expected = fs.readFileSync(path.join(FIXTURES_DIR, 'valid.expected.jsonc'), 'utf-8');
  const { exitCode, output } = captureOutput(() => convert(fixture, { dryRun: true }));
  assert.equal(exitCode, 0);
  assert.equal(output, expected);
});

test('dry-run: empty-array.json5 passes through', () => {
  const fixture = path.join(FIXTURES_DIR, 'empty-array.json5');
  const expected = fs.readFileSync(path.join(FIXTURES_DIR, 'empty-array.expected.json'), 'utf-8');
  const { exitCode, output } = captureOutput(() => convert(fixture, { dryRun: true }));
  assert.equal(exitCode, 0);
  assert.equal(output, expected);
});

// --- File output tests ---

test('write: --output writes to custom path', () => {
  const tmpDir = fs.mkdtempSync('/tmp/j2j-test-');
  const src = path.join(FIXTURES_DIR, 'basic.json5');
  const out = path.join(tmpDir, 'custom.json');
  const expected = fs.readFileSync(path.join(FIXTURES_DIR, 'basic.expected.json'), 'utf-8');
  const origWrite = process.stdout.write;
  process.stdout.write = () => true;
  try {
    const exitCode = convert(src, { output: out });
    assert.equal(exitCode, 0);
    const actual = fs.readFileSync(out, 'utf-8');
    assert.equal(actual, expected);
  } finally {
    process.stdout.write = origWrite;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// --- Error tests ---

test('dry-run: minify produces single-line JSON', () => {
  const fixture = path.join(FIXTURES_DIR, 'basic.json5');
  const { exitCode, output } = captureOutput(() => convert(fixture, { dryRun: true, minify: true }));
  assert.equal(exitCode, 0);
  assert.equal(output, '{"name":"JSON5","version":1,"items":[1,2,3],"nested":{"active":true}}\n');
});

test('error: non-existent file returns exit code 1', () => {
  const origErr = process.stderr.write;
  process.stderr.write = () => true;
  try {
    const exitCode = convert('/nonexistent/path.json5', {});
    assert.equal(exitCode, 1);
  } finally {
    process.stderr.write = origErr;
  }
});

test('error: invalid JSON5 returns exit code 1', () => {
  const fixture = path.join(FIXTURES_DIR, 'bad.json5');
  const origErr = process.stderr.write;
  process.stderr.write = () => true;
  try {
    const exitCode = convert(fixture, { dryRun: true });
    assert.equal(exitCode, 1);
  } finally {
    process.stderr.write = origErr;
  }
});

// --- JSON fallback tests ---

test('fallback: .json with unquoted keys falls back to JSON5 preprocessing', () => {
  const tmpDir = fs.mkdtempSync('/tmp/j2j-test-');
  const src = path.join(tmpDir, 'unquoted.json');
  fs.writeFileSync(src, '{ name: "ryuu" }', 'utf-8');
  const { exitCode, output } = captureOutput(() => convert(src, { dryRun: true }));
  assert.equal(exitCode, 0);
  assert.equal(output, '{\n  "name": "ryuu"\n}\n');
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('fallback: .json with invalid content still returns exit code 1', () => {
  const tmpDir = fs.mkdtempSync('/tmp/j2j-test-');
  const src = path.join(tmpDir, 'broken.json');
  fs.writeFileSync(src, '{ broken: , }', 'utf-8');
  const origErr = process.stderr.write;
  process.stderr.write = () => true;
  try {
    const exitCode = convert(src, { dryRun: true });
    assert.equal(exitCode, 1);
  } finally {
    process.stderr.write = origErr;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});