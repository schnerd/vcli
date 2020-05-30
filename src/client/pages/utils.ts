import {formatNumNice} from '../utils/format';

export function createBinLabels(bins: any[]): string[] {
  const labels: string[] = [];
  bins.forEach((bin) => {
    let precision = 3;
    let x0;
    let x1;
    do {
      x0 = formatNumNice(bin.x0, precision);
      x1 = formatNumNice(bin.x1, precision);
      precision++;
    } while (x0 === x1);
    labels.push(`${x0} - ${x1}`);
  });
  return labels;
}

export function createSimpleBinLabels(bins: any[]): string[] {
  return bins.map((bin: any) => `${bin.x0} - ${bin.x1}`);
}

export function isProbablyYearField(name: string, min: number, max: number) {
  const nameLower = name.toLowerCase();
  const nameMatch = nameLower.includes('year') || nameLower.includes('yr');
  const rangeMatch = min > 1500 && max < 2100;
  return nameMatch && rangeMatch;
}
