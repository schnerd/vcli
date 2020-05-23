export function formatNumNice(n: number): string {
  let abbrev;
  if (n >= 1e6) {
    n = n / 1e6;
    abbrev = 'm';
  } else if (n >= 1e3) {
    n = n / 1e3;
    abbrev = 'k';
  }

  let str = String(Number(n.toPrecision(3)));
  return abbrev ? `${str}${abbrev}` : str;
}
