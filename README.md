# @ryucode/j2j

Convert JSON5/JSONC/JSON files to strict JSON.

## Usage

```bash
npx @ryucode/j2j file.json5
npx @ryucode/j2j file.jsonc --dry-run
npx @ryucode/j2j config.json --output=config-strict.json
```

## Options

| Option | Description |
|--------|-------------|
| `--output=<path>` | Write output to specified file |
| `--dry-run` | Print result to stdout without writing |
| `--help` | Show help message |

## Supported Formats

- `.json5` — Comments, trailing commas, single quotes, unquoted keys, hex/leading-decimal numbers, Infinity/NaN
- `.jsonc` — Comments, trailing commas
- `.json` — Validate and reformat