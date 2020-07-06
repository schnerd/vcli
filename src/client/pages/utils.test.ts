import {createBinLabels} from './utils';

function makeBins(ranges: number[][]) {
  return ranges.map((r) => {
    return {x0: r[0], x1: r[1]};
  });
}

describe('createBinLabels', () => {
  test('should handle singular numbers', () => {
    const bins = makeBins([
      [0, 2],
      [2, 4],
      [4, 6],
      [6, 8],
      [8, 10],
      [10, 12],
      [12, 14],
      [14, 15],
    ]);
    const labels = createBinLabels(bins, true);
    expect(labels).toEqual([
      '0 - 1',
      '2 - 3',
      '4 - 5',
      '6 - 7',
      '8 - 9',
      '10 - 11',
      '12 - 13',
      '14',
    ]);
  });

  test('should handle thousands ranges', () => {
    const bins = makeBins([
      [0, 1000],
      [1000, 2000],
      [2000, 3000],
      [3000, 4000],
      [4000, 5000],
      [5000, 6000],
      [6000, 7000],
      [7000, 8000],
      [8000, 9000],
      [9000, 10000],
      [10000, 11000],
      [11000, 12000],
      [12000, 13000],
      [13000, 14000],
      [14000, 14137],
    ]);
    const labels = createBinLabels(bins, true);
    expect(labels).toEqual([
      '0 - 1K',
      '1K - 2K',
      '2K - 3K',
      '3K - 4K',
      '4K - 5K',
      '5K - 6K',
      '6K - 7K',
      '7K - 8K',
      '8K - 9K',
      '9K - 10K',
      '10K - 11K',
      '11K - 12K',
      '12K - 13K',
      '13K - 14K',
      '14K - 14.1K',
    ]);
  });

  test('should handle millions ranges', () => {
    const bins = makeBins([
      [0, 1000000],
      [1000000, 2000000],
      [2000000, 3000000],
      [3000000, 4000000],
      [4000000, 5000000],
      [5000000, 6000000],
      [6000000, 7000000],
      [7000000, 7103086],
    ]);
    const labels = createBinLabels(bins, true);
    expect(labels).toEqual([
      '0 - 1M',
      '1M - 2M',
      '2M - 3M',
      '3M - 4M',
      '4M - 5M',
      '5M - 6M',
      '6M - 7M',
      '7M - 7.1M',
    ]);
  });

  test('should handle precision increases', () => {
    const bins = makeBins([
      [0, 0.00002],
      [0.00002, 0.00004],
      [0.00004, 0.00006],
      [0.00006, 0.00008],
    ]);
    const labels = createBinLabels(bins, true);
    expect(labels).toEqual([
      '0 - 0.00002',
      '0.00002 - 0.00004',
      '0.00004 - 0.00006',
      '0.00006 - 0.00008',
    ]);
  });
});
