// @ts-ignore d3 types dont have bin()
import {bin, max, mean, median, min, quantile, sum} from 'd3-array';
import {useCallback, useMemo, useState} from 'react';
import Select, {ValueType} from 'react-select';
import {useRecoilState} from 'recoil';

import {ChartFieldsMeta, DataPoint, DataTypes, DateAggType, NumAggType} from '../types';
import AnalysisFacet from './analysis-facet';
import {analysisConfigState} from './analysis-state';
import DataContainer, {DataRow, NULL} from './data-container';
import {FieldSelect, FieldSelectOption, selectStyleProps} from './field-select';
import {useSelectOption} from './use-select-option';
import {createBinLabels, createSimpleBinLabels, isProbablyYearField} from './utils';

interface Props {
  data: DataContainer;
}

type RowsGroupedByFacet = Record<string, DataRow[]>;
interface FacetObj {
  key: string;
  values: Array<DataPoint>;
}

interface DateAggOption {
  value: DateAggType;
  label: string;
}
const DATE_AGG_OPTIONS: DateAggOption[] = [
  {
    value: DateAggType.year,
    label: 'Year',
  },
  {
    value: DateAggType.month,
    label: 'Month',
  },
  {
    value: DateAggType.day,
    label: 'Day',
  },
];

interface NumAggOption {
  value: NumAggType;
  label: string;
}
const NUM_AGG_OPTIONS: NumAggOption[] = [
  {
    value: NumAggType.first,
    label: 'First',
  },
  {
    value: NumAggType.count,
    label: 'Count',
  },
  {
    value: NumAggType.min,
    label: 'Min',
  },
  {
    value: NumAggType.max,
    label: 'Max',
  },
  {
    value: NumAggType.sum,
    label: 'Sum',
  },
  {
    value: NumAggType.mean,
    label: 'Mean',
  },
  {
    value: NumAggType.median,
    label: 'Median',
  },
  {
    value: NumAggType.p5,
    label: 'P5',
  },
  {
    value: NumAggType.p95,
    label: 'P95',
  },
];

const HIDE_FACETS_AFTER = 50;

const noNumOptionsMessage = () => 'No numeric fields found';

export default function Analysis(props: Props) {
  const {data} = props;
  const types = data.getTypes();
  const header = data.getHeader();
  const rows = data.getRows();

  const [config, setConfig] = useRecoilState(analysisConfigState);
  const {x, y, yAgg, dateAgg, facet} = config;

  const [showAllFacets, setShowAllFacets] = useState<boolean>(false);

  const yAggOption = useSelectOption(NUM_AGG_OPTIONS, yAgg);
  const dateAggOption = useSelectOption(DATE_AGG_OPTIONS, dateAgg);

  const onChangeX = useCallback(
    (v: number) => {
      setConfig({...config, x: v});
    },
    [config, setConfig],
  );
  const onChangeY = useCallback(
    (v: number) => {
      setConfig({...config, y: v});
    },
    [config, setConfig],
  );
  const onChangeYAgg = useCallback(
    (v: ValueType<NumAggOption>) => {
      setConfig({...config, yAgg: v ? (v as NumAggOption).value : null});
    },
    [config, setConfig],
  );
  const onChangeDateAgg = useCallback(
    (v: ValueType<DateAggOption>) => {
      setConfig({...config, dateAgg: v ? (v as DateAggOption).value : null});
    },
    [config, setConfig],
  );
  const onChangeFacet = useCallback(
    (v: number) => {
      setConfig({...config, facet: v});
    },
    [config, setConfig],
  );

  const allFieldOptions = useMemo((): FieldSelectOption[] => {
    return header.map(
      (f, i): FieldSelectOption => {
        return {
          value: i,
          label: f,
          type: types[i],
        };
      },
    );
  }, [header, types]);

  const numFieldOptions = useMemo((): FieldSelectOption[] => {
    return allFieldOptions.filter((v) => v.type === DataTypes.num);
  }, [allFieldOptions]);

  const facetedRows: RowsGroupedByFacet = useMemo(() => {
    if (facet === null) {
      return {'': rows};
    }
    const ret: Record<string, DataRow[]> = {};
    rows.forEach((row) => {
      let facetValue = row[facet];
      if (facetValue == undefined) {
        facetValue = NULL;
      }
      if (!ret[facetValue]) {
        ret[facetValue] = [];
      }
      ret[facetValue].push(row);
    });
    return ret;
  }, [rows, facet]);

  const facets: FacetObj[] | null = useMemo(() => {
    if (x === null || y === null) {
      return null;
    }

    const xIsNum = types[x] === DataTypes.num;
    const xIsDate = types[x] === DataTypes.date;
    const xIsText = types[x] === DataTypes.text;

    const validFacets = [];
    const xAccessor = (row: DataRow): any => row[x];
    const yAccessor = (row: DataRow): any => row[y];

    Object.keys(facetedRows).forEach((facetKey) => {
      const rows = facetedRows[facetKey];
      let groupedByX = {};
      let hasNonNullValue = false;
      let isInt = xIsNum;

      // Aggregate rows by x-value
      rows.forEach((row) => {
        let xValue = row[x];
        // eslint-disable-next-line no-eq-null
        if (xValue == null) {
          return;
        }

        // Handle date value binning
        if (xIsDate) {
          const d = new Date(xValue);
          if (Number.isNaN(d.getTime())) {
            return;
          }
          // Aggregate into right x bucket
          d.setHours(0, 0, 0, 0);
          if (dateAgg === DateAggType.month) {
            d.setDate(1);
          } else if (dateAgg === DateAggType.year) {
            d.setMonth(0, 1);
          }
          xValue = d.getTime();
        }
        if (isInt && (xValue as number) % 1 !== 0) {
          isInt = false;
        }

        hasNonNullValue = true;

        if (!groupedByX[xValue]) {
          groupedByX[xValue] = [];
        }
        groupedByX[xValue].push(row);
      });

      // Handle binning of numeric x-axis values
      if (xIsNum && Object.keys(groupedByX).length > 10 && hasNonNullValue) {
        const binned = bin().value(xAccessor).thresholds(10)(rows);

        // Maybe we should parse years as "date" type instead?
        const min = binned[0].x0;
        const max = binned[binned.length - 1].x1;
        const isYear = isProbablyYearField(header[x], min, max);
        const binLabels = isYear ? createSimpleBinLabels(binned) : createBinLabels(binned, isInt);

        groupedByX = {};
        binned.forEach((bin, i) => {
          groupedByX[binLabels[i]] = bin;
        });
      }

      const groupedByXArray = [];
      Object.keys(groupedByX).forEach((xKey) => {
        const xRows = groupedByX[xKey];
        const value = (function () {
          if (yAgg === NumAggType.count) {
            return xRows.length;
          }
          if (xRows.length === 0) {
            return null;
          }
          switch (yAgg) {
            case NumAggType.min:
              return min(xRows, yAccessor);
            case NumAggType.max:
              return max(xRows, yAccessor);
            case NumAggType.mean:
              return mean(xRows, yAccessor);
            case NumAggType.sum:
              return sum(xRows, yAccessor);
            case NumAggType.median:
              return median(xRows, yAccessor);
            case NumAggType.p5:
              return quantile(xRows, 0.05, yAccessor);
            case NumAggType.p95:
              return quantile(xRows, 0.95, yAccessor);
            case NumAggType.first:
            default:
              return yAccessor(xRows[0]);
          }
        })();

        if (xIsDate) {
          const d = new Date(Number(xKey));
          groupedByXArray.push({label: d, value: value});
        } else {
          groupedByXArray.push({label: xKey, value});
        }
      });

      if (hasNonNullValue) {
        if (xIsText) {
          // Sort by greatest value first
          groupedByXArray.sort((a, b) => b.value - a.value);
        }
        validFacets.push({key: facetKey, values: groupedByXArray});
      }
    });

    return validFacets;
  }, [header, facetedRows, x, y, yAgg, dateAgg, types]);

  const nFacets = facets ? Object.keys(facets).length : 1;
  const hiddenFacets = nFacets - HIDE_FACETS_AFTER;

  const facetsShown = useMemo(() => {
    if (!facets || showAllFacets) {
      return facets;
    }
    return facets.slice(0, HIDE_FACETS_AFTER);
  }, [facets, showAllFacets]);

  const fieldsMeta = useMemo((): ChartFieldsMeta => {
    return {
      x: {
        index: x,
        type: types[x],
        dateAgg,
      },
      y: {
        index: y,
        type: types[y],
      },
    };
  }, [x, y, dateAgg, types]);

  return (
    <>
      <div className="root">
        <div className="config">
          <div className="config-option">
            <div className="config-name">X-Axis</div>
            <div className="config-control">
              <div className="field-select-wrapper">
                <FieldSelect options={allFieldOptions} value={x} onChange={onChangeX} />
              </div>
              {x !== null && types[x] === DataTypes.date && (
                <div className="agg-select-wrapper">
                  <Select
                    options={DATE_AGG_OPTIONS}
                    value={dateAggOption}
                    placeholder="Agg"
                    onChange={onChangeDateAgg}
                    {...selectStyleProps}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="config-option">
            <div className="config-name">Y-Axis</div>
            <div className="config-control">
              <div className="field-select-wrapper">
                <FieldSelect
                  options={numFieldOptions}
                  value={y}
                  onChange={onChangeY}
                  noOptionsMessage={noNumOptionsMessage}
                />
              </div>
              {y !== null && (
                <div className="agg-select-wrapper">
                  <Select
                    options={NUM_AGG_OPTIONS}
                    value={yAggOption == null ? NUM_AGG_OPTIONS[0] : yAggOption}
                    placeholder="Agg"
                    onChange={onChangeYAgg}
                    {...selectStyleProps}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="config-option">
            <div className="config-name">Facet By</div>
            <div className="config-control">
              <div className="field-select-wrapper">
                <FieldSelect
                  options={allFieldOptions}
                  value={facet}
                  onChange={onChangeFacet}
                  isClearable
                />
              </div>
            </div>
          </div>
        </div>
        <div className="charts">
          {facetsShown ? (
            facet === null ? (
              <div className="charts-single">
                <AnalysisFacet fields={fieldsMeta} data={facetsShown[0].values} />
              </div>
            ) : (
              <>
                <div className="charts-grid">
                  {facetsShown.map((f) => {
                    return (
                      <AnalysisFacet
                        key={f.key}
                        facet={f.key}
                        fields={fieldsMeta}
                        data={f.values}
                      />
                    );
                  })}
                </div>
                {!showAllFacets && nFacets > HIDE_FACETS_AFTER && (
                  <button className="show-more-facets-btn" onClick={() => setShowAllFacets(true)}>
                    Show {hiddenFacets} more facet{hiddenFacets === 1 ? '' : 's'}
                  </button>
                )}
              </>
            )
          ) : (
            <div className="intro">
              <svg width="17" height="15" xmlns="http://www.w3.org/2000/svg">
                <g fill="none">
                  <path
                    fill="currentColor"
                    d="M12 6l-1.42 1.42L7 3.83V13h10v2H5V3.83L1.42 7.42 0 6l6-6z"
                  />
                </g>
              </svg>
              <div className="intro-text">Select some fields to begin analysis</div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .root {
          padding: 10px;
        }

        .config {
          display: flex;
          align-items: flex-start;
          position: relative;
          /* Select dropdown should appear above charts */
          z-index: 3;
        }
        .config-option {
          flex: 0 0 auto;
          margin: 0 10px 10px 0;
        }
        .config-name {
          color: var(--n7);
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
          padding-left: 4px;
        }
        .config-control {
          display: flex;
          align-items: center;
        }
        .field-select-wrapper {
          width: 160px;
        }
        .agg-select-wrapper {
          width: 100px;
          margin-left: 5px;
        }

        .charts {
        }
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
          grid-gap: 10px;
        }

        .show-more-facets-btn {
          border: none;
          background: transparent;
          color: var(--b9);
          cursor: pointer;
          text-align: center;
          font-size: 16px;
          font-weight: 600;
          line-height: 1;
          outline: none;
          padding: 20px 20px 14px;
          border-radius: 3px;
          transition: 0.3s color;
          width: 100%;
        }
        .show-more-facets-btn:hover {
          color: var(--b7);
        }

        .intro {
          padding: 8px 10px;
          display: flex;
          align-items: flex-start;
          color: var(--n7);
        }
        .intro-text {
          margin: 4px 8px;
          font-weight: 500;
          font-size: 16px;
        }
      `}</style>
    </>
  );
}
