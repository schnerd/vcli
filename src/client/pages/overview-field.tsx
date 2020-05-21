import {useMemo} from 'react';
import {bin} from 'd3-array';
import DataContainer, {DataTypes, NULL} from './data-container';
import {StatChart} from './stat-chart';

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

  const {chartData} = useMemo(() => {
    let type = types[col];
    let val;

    let min = null;
    let max = null;
    let isNum = type === DataTypes.num;
    let isDate = type === DataTypes.date;

    // First collect & count unique values (detect  min/max at the same time)
    let uniqueCounts = {};
    for (let i = 0; i < rows.length; i++) {
      val = rows[i][col];
      if (val == undefined) {
        val = NULL;
      }

      if (!uniqueCounts[val]) {
        uniqueCounts[val] = 0;
      }
      uniqueCounts[val]++;

      if (isNum) {
        val = parseFloat(val);
        if (!Number.isNaN(val)) {
          if (min === null || val < min) {
            min = val;
          }
          if (max === null || val > max) {
            max = val;
          }
        }
      }
    }

    const numUniques = Object.keys(uniqueCounts).length;

    let chartData = Object.keys(uniqueCounts).map((key) => {
      return {label: key, value: uniqueCounts[key]};
    });

    // Do we need to bin the numbers?
    if (isNum && numUniques > BIN_AFTER && min !== null && max !== null) {
      const binner = bin()
        .domain([min, max])
        .value((d) => parseFloat(d[col]))
        .thresholds(10);
      const binned = binner(rows);

      chartData = [];
      binned.reverse().forEach((bin) => {
        chartData.push({
          label: `${bin.x0} - ${bin.x1}`,
          value: bin.length,
        });
      });
    }

    return {chartData};
  }, [col, header, rows, types]);

  return (
    <>
      <div className="root">
        <div className="header">
          <h3 className="title">{field}</h3>
          <div>{TYPE_LABELS[types[col]]}</div>
        </div>
        <div className="chart">
          <StatChart data={chartData} />
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
        .chart {
          overflow-y: auto;
          flex: 1 1 auto;
        }
      `}</style>
    </>
  );
}
