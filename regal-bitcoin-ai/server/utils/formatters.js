export function money(value) {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function compact(value) {
  return Number(value || 0).toLocaleString('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  });
}

export function pctString(value) {
  const n = Number(value || 0);
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

export function parseMagnitude(valStr) {
  if (!valStr) return 0;
  const clean = String(valStr).toLowerCase().replace(/[$,]/g, '').trim();
  if (clean.endsWith('k')) return parseFloat(clean) * 1_000;
  if (clean.endsWith('m')) return parseFloat(clean) * 1_000_000;
  return parseFloat(clean);
}
