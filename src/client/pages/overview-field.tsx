// @ts-ignore
import {bin, quantileSorted} from 'd3-array';
import {useMemo} from 'react';
import {DataTypes} from '../types';
import {formatNumNice} from '../utils/format';
import DataContainer, {NULL} from './data-container';
import {OverviewHistogram} from './overview-histogram';

interface Props {
  data: DataContainer;
  col: number;
}

const TYPE_LABELS: Record<DataTypes, string> = {
  [DataTypes.date]: 'Date',
  [DataTypes.num]: 'Num',
  [DataTypes.text]: 'Text',
};

const BIN_AFTER = 10;

export default function OverviewField(props: Props) {
  const {data, col} = props;
  const header = data.getHeader();
  const rows = data.getRows();
  const types = data.getTypes();
  const field = header[col];

  const {chartData, min, max, mean, p50, p95, nulls, uniques} = useMemo(() => {
    const type = types[col];
    let val;

    let min = null;
    let max = null;
    let total = 0;
    let mean = null;
    let p50 = null;
    let p95 = null;
    let nulls = 0;
    const isNum = type === DataTypes.num;

    // First collect & count unique values (detect  min/max at the same time)
    const uniqueCounts = {};
    for (let i = 0; i < rows.length; i++) {
      val = rows[i][col];
      if (val == undefined || val === 'null') {
        val = NULL;
        nulls++;
      }

      if (!uniqueCounts[val]) {
        uniqueCounts[val] = 0;
      }
      uniqueCounts[val]++;
    }

    const numUniques = Object.keys(uniqueCounts).length;

    let chartData = Object.keys(uniqueCounts).map((key) => {
      return {label: key, value: uniqueCounts[key]};
    });

    if (isNum) {
      // Numeric stats
      const sorted = [];
      rows.forEach((d) => {
        const val = d[col];
        if (typeof val === 'number') {
          total += val;
          sorted.push(val);
        }
      });
      sorted.sort((a, b) => a - b);

      min = sorted[0];
      max = sorted[sorted.length - 1];
      mean = total / sorted.length;
      p50 = quantileSorted(sorted, 0.5);
      p95 = quantileSorted(sorted, 0.95);

      // Do we need to bin the numbers?
      if (numUniques > BIN_AFTER && min !== null && max !== null) {
        const binner = bin().domain([min, max]).thresholds(10);
        const binned = binner(sorted);

        chartData = [];
        binned.forEach((bin) => {
          chartData.push({
            label: `${bin.x0} - ${bin.x1}`,
            value: bin.length,
          });
        });
      }
    } else {
      chartData.sort((a, b) => b.value - a.value);
    }

    return {chartData, min, max, mean, p50, p95, nulls, uniques: numUniques};
  }, [col, header, rows, types]);

  return (
    <>
      <div className="root">
        <div className="header">
          <h3 className="title">{field}</h3>
          <div className="stats">
            <Stat name="type" val={TYPE_LABELS[types[col]]} />
            <Stat name="null" val={nulls} />
            <Stat name="uniq" val={uniques} />
            {types[col] === DataTypes.num && (
              <>
                <Stat name="mean" val={mean} />
                <Stat name="min" val={min} />
                <Stat name="max" val={max} />
                <Stat name="p50" val={p50} />
                <Stat name="p95" val={p95} />
              </>
            )}
          </div>
        </div>
        <div className="chart">
          <OverviewHistogram data={chartData} />
        </div>
      </div>
      <style jsx>{`
        .root {
          display: flex;
          flex-direction: column;
          background-color: white;
          box-shadow: rgba(67, 90, 111, 0.3) 0px 0px 1px, rgba(67, 90, 111, 0.47) 0px 4px 10px -4px;
          min-width: 300px;
          height: 300px;
        }
        .header {
          padding: 10px;
          flex: 0 0 auto;
        }
        .title {
          margin: 0;
        }
        .stats {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }
        .chart {
          flex: 1 1 auto;
          display: flex;
          align-items: stretch;
        }
      `}</style>
    </>
  );
}

interface StatProps {
  name: string;
  val: number | string;
}

function Stat(props: StatProps) {
  const {name, val} = props;
  return (
    <div className="stat">
      <div className="stat-name">{name}</div>
      <div className="stat-val" title={String(val)}>
        {typeof val === 'number' ? formatNumNice(val) : val}
      </div>
      <style jsx>{`
        .stat {
          display: inline-flex;
          align-items: center;
          margin: 4px 12px 0 0;
        }
        .stat-name {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--n6);
          margin-right: 6px;
        }
        .stat-val {
          font-size: 13px;
          color: var(--n8);
        }
      `}</style>
    </div>
  );
}
