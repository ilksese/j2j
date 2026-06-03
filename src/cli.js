const { convert } = require('./convert');

const USAGE = `Usage: npx j5tj <file> [--output=<path>] [--dry-run]

Convert JSON5/JSONC/JSON files to strict JSON.

Options:
  --output=<path>   Write output to specified file
  --dry-run         Print result to stdout without writing
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

  if (!opts.file) {
    console.error('[ERROR] No input file specified.');
    console.error(USAGE);
    return 1;
  }

  return convert(opts.file, opts);
}

module.exports = { run };