// @ts-ignore
import {bin, quantileSorted} from 'd3-array';
import {useCallback, useMemo, useRef, useState} from 'react';
import {DataTypes} from '../types';
import {formatNumNice} from '../utils/format';
import DataContainer, {NULL} from './data-container';
import {OverviewHistogram} from './overview-histogram';
import {createBinLabels, createSimpleBinLabels, isProbablyYearField} from './utils';
import {useForceUpdate} from '../utils/use-force-update';
import {OutliersButton} from './outliers-button';

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

  const hasOutliers = useRef<boolean>(false);
  const chopOutliersRef = useRef<null | boolean>(null);
  const chopOutliersMemoBuster = chopOutliersRef.current === null ? true : chopOutliersRef.current;

  const {chartData, min, max, mean, p50, p95, nulls, uniques} = useMemo(() => {
    const type = types[col];
    const colName = header[col];
    let val;

    let min = null;
    let max = null;
    let total = 0;
    let mean = null;
    let p50 = null;
    let p95 = null;
    let nulls = 0;
    const isNum = type === DataTypes.num;
    let isInt = isNum;

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

    let chartData;

    if (isNum) {
      // Numeric stats
      let sorted = [];
      rows.forEach((d) => {
        const val = d[col];
        if (typeof val === 'number') {
          total += val;
          if (isInt && val % 1 !== 0) {
            isInt = false;
          }
          sorted.push(val);
        }
      });
      sorted.sort((a, b) => a - b);

      min = sorted[0];
      max = sorted[sorted.length - 1];
      mean = total / sorted.length;
      p50 = quantileSorted(sorted, 0.5);
      p95 = quantileSorted(sorted, 0.95);

      const bucketSize = (max - min) / 8;
      const l20 = min + bucketSize * 2;
      const l80 = max - bucketSize * 2;
      let binningMin = min;
      let binningMax = max;
      let numUniqueForBinning = numUniques;

      if (chopOutliersRef.current !== false) {
        if (p50 < l20) {
          // Significantly left skewed, chop top 1%
          const splitPoint = Math.ceil(sorted.length * 0.99);
          const removed = sorted.slice(splitPoint);
          sorted = sorted.slice(0, splitPoint);
          binningMax = sorted[sorted.length - 1];

          removed.forEach((n) => {
            if (uniqueCounts[n] !== undefined && n !== binningMax) {
              delete uniqueCounts[n];
            }
          });
          numUniqueForBinning = Object.keys(uniqueCounts).length;
          hasOutliers.current = true;
          chopOutliersRef.current = true;
        } else if (p50 > l80) {
          // Significantly right skewed, chop bottom 1%
          const splitPoint = Math.floor(sorted.length * 0.01);
          const removed = sorted.slice(0, splitPoint);
          sorted = sorted.slice(splitPoint);
          binningMin = sorted[0];

          removed.forEach((n) => {
            if (uniqueCounts[n] !== undefined && n !== binningMin) {
              delete uniqueCounts[n];
            }
          });
          numUniqueForBinning = Object.keys(uniqueCounts).length;
          hasOutliers.current = true;
          chopOutliersRef.current = true;
        } else {
          chopOutliersRef.current = false;
        }
      }

      // Do we need to bin the numbers?
      if (numUniqueForBinning > BIN_AFTER && min !== null && max !== null) {
        const binner = bin().domain([binningMin, binningMax]).thresholds(BIN_AFTER);
        const binned = binner(sorted);

        // Maybe we should parse years as "date" type instead?
        const isYear = isProbablyYearField(colName, min, max);
        const binLabels = isYear ? createSimpleBinLabels(binned) : createBinLabels(binned, isInt);

        chartData = [];
        binned.forEach((bin, i) => {
          chartData.push({
            label: binLabels[i],
            value: bin.length,
          });
        });
      } else {
        chartData = Object.keys(uniqueCounts)
          .map((key) => {
            return {label: key, value: uniqueCounts[key]};
          })
          .sort((a, b) => Number(a.label) - Number(b.label));
      }
    } else {
      chartData = Object.keys(uniqueCounts)
        .map((key) => {
          return {label: key, value: uniqueCounts[key]};
        })
        .sort((a, b) => b.value - a.value);
    }

    return {
      chartData,
      min,
      max,
      mean,
      p50,
      p95,
      nulls,
      uniques: numUniques,
    };
  }, [col, header, rows, types, chopOutliersMemoBuster]);

  const forceUpdate = useForceUpdate();

  const handleToggleChop = useCallback(() => {
    chopOutliersRef.current = !chopOutliersRef.current;
    forceUpdate();
  }, [forceUpdate]);

  const isNum = types[col] === DataTypes.num;

  return (
    <>
      <div className="root">
        <div className="header">
          <div className="header-top">
            <h3 className="title">{field}</h3>
            {hasOutliers.current && (
              <div className="chop">
                <OutliersButton enabled={chopOutliersRef.current} onClick={handleToggleChop} />
              </div>
            )}
          </div>
          <div className="stats">
            <Stat name="type" val={TYPE_LABELS[types[col]]} />
            <Stat name="null" val={nulls} />
            <Stat name="uniq" val={uniques} />
            {isNum && (
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
        .header-top {
          display: flex;
          align-items: center;
        }
        .title {
          margin: 0;
          flex: 1 1 auto;
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
