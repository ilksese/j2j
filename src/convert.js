const fs = require('fs');
const path = require('path');
const { preprocessJSON5, preprocessJSONC, preprocessJSON } = require('./preprocess');

function detectType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json5') return 'json5';
  if (ext === '.jsonc') return 'jsonc';
  return 'json';
}

function convert(filePath, opts) {
  const resolvedPath = path.resolve(filePath);

  let text;
  try {
    text = fs.readFileSync(resolvedPath, 'utf-8');
  } catch (err) {
    console.error(`[ERROR] Cannot read file: ${resolvedPath}`);
    return 1;
  }

  const type = detectType(filePath);
  let processed;
  try {
    if (type === 'json5') processed = preprocessJSON5(text);
    else if (type === 'jsonc') processed = preprocessJSONC(text);
    else processed = preprocessJSON(text);
  } catch (err) {
    console.error(`[ERROR] Preprocessing failed: ${err.message}`);
    return 1;
  }

  let parsed;
  try {
    parsed = JSON.parse(processed);
  } catch (err) {
    if (type === 'json') {
      try {
        processed = preprocessJSON5(text);
        parsed = JSON.parse(processed);
      } catch {
        const msg = err.message;
        console.error(`[ERROR] Invalid JSON content: ${msg}`);
        return 1;
      }
    } else {
      const msg = err.message;
      console.error(`[ERROR] Invalid ${type.toUpperCase()} content: ${msg}`);
      return 1;
    }
  }

  const output = opts.minify
    ? JSON.stringify(parsed) + '\n'
    : JSON.stringify(parsed, null, 2) + '\n';

  if (opts.dryRun) {
    process.stdout.write(output);
    return 0;
  }

  const outputPath = opts.output
    ? path.resolve(opts.output)
    : path.resolve(path.dirname(resolvedPath), path.basename(resolvedPath, path.extname(resolvedPath)) + '.json');

  try {
    fs.writeFileSync(outputPath, output, 'utf-8');
    console.log(`Written to ${outputPath}`);
  } catch (err) {
    console.error(`[ERROR] Cannot write to: ${outputPath}`);
    return 1;
  }

  return 0;
}

function convertText(text, opts) {
  let processed;
  let parsed;

  try {
    processed = preprocessJSON(text);
    parsed = JSON.parse(processed);
  } catch {
    try {
      processed = preprocessJSON5(text);
      parsed = JSON.parse(processed);
    } catch {
      try {
        processed = preprocessJSONC(text);
        parsed = JSON.parse(processed);
      } catch (err) {
        console.error(`[ERROR] Invalid content: ${err.message}`);
        return 1;
      }
    }
  }

  const output = opts.minify
    ? JSON.stringify(parsed) + '\n'
    : JSON.stringify(parsed, null, 2) + '\n';

  if (opts.dryRun || !opts.output) {
    process.stdout.write(output);
    return 0;
  }

  const outputPath = path.resolve(opts.output);
  try {
    fs.writeFileSync(outputPath, output, 'utf-8');
    console.log(`Written to ${outputPath}`);
  } catch (err) {
    console.error(`[ERROR] Cannot write to: ${outputPath}`);
    return 1;
  }

  return 0;
}

module.exports = { convert, convertText };