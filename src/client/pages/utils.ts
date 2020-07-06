import {formatNumNice} from '../utils/format';

export function createBinLabels(bins: any[], isInt): string[] {
  const labels: string[] = [];
  bins.forEach((bin, i) => {
    let precision = 3;
    const isLast = i === bins.length - 1;

    // If the bin only contains a single number, just render that number
    if (isInt && bin.x0 === bin.x1 - 1) {
      labels.push(formatNumNice(bin.x0, precision));
      return;
    }

    // Otherwise render a range
    let x0;
    let x1;
    do {
      x0 = formatNumNice(bin.x0, precision);
      const range = bin.x1 - bin.x0;
      x1 = formatNumNice(
        isInt && range >= 1 && range < 5 && !isLast ? bin.x1 - 1 : bin.x1,
        precision,
      );
      precision++;
    } while (x0 === x1);
    labels.push(`${x0} - ${x1}`);
  });
  return labels;
}

export function createSimpleBinLabels(bins: any[]): string[] {
  return bins.map((bin: any) => {
    const min = bin[0];
    const max = bin[bin.length - 1];
    return min === max ? String(min) : `${min} - ${max}`;
  });
}

export function isProbablyYearField(name: string, min: number, max: number) {
  const nameLower = name.toLowerCase();
  const nameMatch = nameLower.includes('year') || nameLower.includes('yr');
  const rangeMatch = min > 1500 && max < 2100;
  return nameMatch && rangeMatch;
}
