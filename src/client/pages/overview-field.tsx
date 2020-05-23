import {bin, quantileSorted} from 'd3-array';
import {useMemo} from 'react';
import {formatNumNice} from '../utils/format';
import DataContainer, {DataTypes, NULL} from './data-container';
import {Histogram} from './histogram';

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
  let header = data.getHeader();
  let rows = data.getRows();
  let types = data.getTypes();
  let field = header[col];

  const {chartData, min, max, mean, p50, p95, nulls} = useMemo(() => {
    let type = types[col];
    let val;

    let min = null;
    let max = null;
    let total = 0;
    let mean = null;
    let p50 = null;
    let p95 = null;
    let nulls = 0;
    let isNum = type === DataTypes.num;
    let isDate = type === DataTypes.date;

    // First collect & count unique values (detect  min/max at the same time)
    let uniqueCounts = {};
    for (let i = 0; i < rows.length; i++) {
      val = rows[i][col];
      if (val == undefined) {
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
      const sorted = rows
        .map((d) => {
          let val = d[col];
          if (typeof val === 'number') {
            total += val;
            return val;
          }
          return null;
        })
        .sort((a, b) => a - b);

      const firstNumIndex = sorted.findIndex((d) => typeof d === 'number');
      const sortedNums = sorted.slice(firstNumIndex);
      min = sortedNums[0];
      max = sortedNums[sortedNums.length - 1];
      mean = total / sortedNums.length;
      p50 = quantileSorted(sortedNums, 0.5);
      p95 = quantileSorted(sortedNums, 0.95);

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

    return {chartData, min, max, mean, p50, p95, nulls};
  }, [col, header, rows, types]);

  return (
    <>
      <div className="root">
        <div className="header">
          <h3 className="title">{field}</h3>
          <div className="stats">
            <div className="stat">
              <div className="stat-name">type</div>
              <div className="stat-val">{TYPE_LABELS[types[col]]}</div>
            </div>
            <div className="stat">
              <div className="stat-name">nulls</div>
              <div className="stat-val">{formatNumNice(nulls)}</div>
            </div>
            {types[col] === DataTypes.num && (
              <>
                <div className="stat">
                  <div className="stat-name">min</div>
                  <div className="stat-val">{formatNumNice(min)}</div>
                </div>
                <div className="stat">
                  <div className="stat-name">max</div>
                  <div className="stat-val">{formatNumNice(max)}</div>
                </div>
                <div className="stat">
                  <div className="stat-name">mean</div>
                  <div className="stat-val">{formatNumNice(mean)}</div>
                </div>
                <div className="stat">
                  <div className="stat-name">p50</div>
                  <div className="stat-val">{formatNumNice(p50)}</div>
                </div>
                <div className="stat">
                  <div className="stat-name">p95</div>
                  <div className="stat-val">{formatNumNice(p95)}</div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="chart">
          <Histogram data={chartData} />
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
        .chart {
          flex: 1 1 auto;
          display: flex;
          align-items: stretch;
        }
      `}</style>
    </>
  );
}
