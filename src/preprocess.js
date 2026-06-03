function preprocessJSON5(text) {
  let result = '';
  let i = 0;

  while (i < text.length) {
    if (text[i] === '/' && text[i + 1] === '/') {
      i += 2;
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (text[i] === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (text[i] === '"') {
      const start = i;
      i++;
      while (i < text.length && !(text[i] === '"' && text[i - 1] !== '\\')) i++;
      i++;
      result += text.slice(start, i);
      continue;
    }
    if (text[i] === "'") {
      result += '"';
      i++;
      while (i < text.length && !(text[i] === "'" && text[i - 1] !== '\\')) {
        if (text[i] === '"' && text[i - 1] !== '\\') {
          result += '\\"';
        } else if (text[i] === '\\' && text[i + 1] === "'") {
          result += "'";
          i += 2;
          continue;
        } else {
          result += text[i];
        }
        i++;
      }
      result += '"';
      i++;
      continue;
    }
    result += text[i];
    i++;
  }

  result = result.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

  result = result.replace(/,(\s*[}\]])/g, '$1');

  result = result.replace(/0x([0-9a-fA-F]+)/g, (_, hex) => String(parseInt(hex, 16)));

  result = result.replace(/([^.\d])(\.\d+)/g, '$10$2');

  result = result.replace(/[+-]\s*Infinity\b/g, 'null');
  result = result.replace(/\b(Infinity)\b/g, 'null');
  result = result.replace(/\b(NaN)\b/g, 'null');

  return result;
}

function preprocessJSONC(text) {
  let result = '';
  let i = 0;

  while (i < text.length) {
    if (text[i] === '/' && text[i + 1] === '/') {
      i += 2;
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (text[i] === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (text[i] === '"') {
      const start = i;
      i++;
      while (i < text.length && !(text[i] === '"' && text[i - 1] !== '\\')) i++;
      i++;
      result += text.slice(start, i);
      continue;
    }
    result += text[i];
    i++;
  }

  result = result.replace(/,(\s*[}\]])/g, '$1');
  return result;
}

function preprocessJSON(text) {
  return text;
}

module.exports = { preprocessJSON5, preprocessJSONC, preprocessJSON };