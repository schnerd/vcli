import { Bar } from '@nivo/bar';
import {useMemo} from 'react';
import {NULL, Stats} from './data-container';

interface Props {
  stats: Stats;
}

const keys = ['value'];
const margin =  { top: 50, right: 130, bottom: 50, left: 60 };
const axisLeft: any= {
  tickSize: 5,
  tickPadding: 5,
  tickRotation: 0,
  legend: 'food',
  legendPosition: 'middle',
  legendOffset: -40
};
const axisBottom: any =         {
  tickSize: 5,
  tickPadding: 5,
  tickRotation: 0,
  legend: 'country',
  legendPosition: 'middle',
  legendOffset: 32
};

export function StatChart(props: Props) {
  const {stats} = props;

  const chartData = useMemo(() => {
    const data = Object.keys(stats).map(key => {
      return {
        label: key === NULL ? 'NULL' : key,
        value: stats[key],
      };
    });
    return data;
  }, [stats]);

  let height = Math.max(chartData.length * 14 + 20, 300);

  return (
      <Bar
        width={300}
        height={height}
        data={chartData}
        layout="horizontal"
        keys={keys}
        indexBy="label"
        margin={margin}
        padding={0.3}
        axisTop={null}
        axisRight={null}
        enableGridY={false}
        enableGridX={true}
        labelSkipWidth={12}
        labelSkipHeight={12}
        animate={false}
      />
  );
}
