/**
 * @jest-environment jsdom
 */
import {RecoilRoot} from 'recoil';
import {range} from 'd3-array';
import {render} from '@testing-library/react';
import DataContainer from './data-container';
import Analysis from './analysis';
import {analysisConfigState, AnalysisConfigStateType} from './analysis-state';
import {NumAggType} from '../types';

test('should handle empty bins', async () => {
  const data: Array<Array<string | number>> = range(1000).map((_, i) => [i, i * 2]);
  // Splice out a big chunk in the middle
  data.splice(399, 102);
  data.unshift(['x', 'y']);

  const dc = new DataContainer(data);

  const configState: AnalysisConfigStateType = {
    x: 0,
    y: 1,
    yAgg: NumAggType.mean,
    dateAgg: null,
    facet: null,
  };

  const {container} = render(
    <RecoilRoot initializeState={(snap) => snap.set(analysisConfigState, configState)}>
      <Analysis data={dc} />
    </RecoilRoot>,
  );

  const bars = container.querySelectorAll('.bar');
  expect(bars.length).toBe(10);
  bars.forEach((el, index) => {
    const height = parseFloat(el.getAttribute('height'));
    if (index === 4) {
      expect(height).toBe(0);
    } else {
      expect(height).toBeGreaterThan(0);
    }
  });
});
