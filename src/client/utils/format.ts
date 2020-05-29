import {format as d3Format} from 'd3-format';

export function formatNumNice(n: number): string {
  let abbrev;
  const abs = Math.abs(n);
  if (abs >= 1e12) {
    n /= 1e12;
    abbrev = 'T';
  } else if (abs >= 1e9) {
    n /= 1e9;
    abbrev = 'B';
  } else if (abs >= 1e6) {
    n /= 1e6;
    abbrev = 'M';
  } else if (abs >= 1e3) {
    n /= 1e3;
    abbrev = 'K';
  }

  const str = String(Number(n.toPrecision(3)));
  return abbrev ? `${str}${abbrev}` : str;
}

const addCommas = d3Format(',.0f');
const fourSigfigs = d3Format(',.4~r');

export function formatNum(n: number): string {
  if (n > 1e4) {
    return addCommas(n);
  }
  return fourSigfigs(n);
}
