import {format as d3Format} from 'd3-format';

export function formatNumNice(n: number, precision = 3): string {
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

  const preciseNum = Number(n.toPrecision(precision));
  let str = String(preciseNum);

  // Handle edge cases so 999,999 doesn't become 1000K, 1,999 => 2K, etc.
  if (Math.abs(preciseNum).toExponential()[0] !== Math.abs(n).toExponential()[0]) {
    str = toPrecisionNoRounding(n, precision);
  }

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

export function toPrecisionNoRounding(n, precision) {
  let numSigFigs = 0;
  const final = [];
  let foundNonZero = false;
  const str = String(n);
  for (let i = 0; i < str.length; i++) {
    if (/\d/.test(str[i]) && (str[i] !== '0' || foundNonZero)) {
      foundNonZero = true;
      numSigFigs++;
    }
    final.push(str[i]);
    if (numSigFigs >= precision) {
      break;
    }
  }
  return final.join('');
}
