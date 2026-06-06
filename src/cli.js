const fs = require('fs');
const { convert, convertText } = require('./convert');

const USAGE = `Usage: npx @ryucode/j2j <file> [--output=<path>] [--dry-run] [--minify]

   or: npx @ryucode/j2j --pipeline [--output=<path>] [--dry-run] [--minify]

Convert JSON5/JSONC/JSON files to strict JSON.

Options:
  --output=<path>   Write output to specified file
  --dry-run         Print result to stdout without writing
  --minify          Output JSON as a single line (no formatting)
  --pipeline        Read input from stdin instead of a file
  --help            Show this help message
`;

function run(args) {
  const opts = {};

  for (const arg of args) {
    if (arg === '--help') {
      console.log(USAGE);
      return 0;
    }
    if (arg === '--dry-run') {
      opts.dryRun = true;
      continue;
    }
    if (arg === '--minify') {
      opts.minify = true;
      continue;
    }
    if (arg === '--pipeline') {
      opts.pipeline = true;
      continue;
    }
    if (arg.startsWith('--output=')) {
      opts.output = arg.slice('--output='.length);
      continue;
    }
    if (arg.startsWith('--')) {
      console.error(`[ERROR] Unknown option: ${arg}`);
      return 1;
    }
    opts.file = arg;
  }

  if (opts.pipeline) {
    let text;
    try {
      text = fs.readFileSync(0, 'utf-8');
    } catch (err) {
      console.error('[ERROR] Cannot read from stdin');
      return 1;
    }
    return convertText(text, opts);
  }

  if (!opts.file) {
    console.error('[ERROR] No input file specified.');
    console.error(USAGE);
    return 1;
  }

  return convert(opts.file, opts);
}

module.exports = { run };