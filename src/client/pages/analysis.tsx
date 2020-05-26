import {max, mean, median, min, quantile, sum} from 'd3-array';
import {useRouter} from 'next/router';
import {useCallback, useMemo, useState} from 'react';
import Select, {ValueType} from 'react-select';
import {ChartFieldsMeta, DataPoint, DataTypes} from '../types';
import AnalysisFacet from './analysis-facet';
import DataContainer, {DataRow, NULL} from './data-container';
import {FieldSelect, FieldSelectOption, selectComponents, selectTheme} from './field-select';
import {useSelectOption} from './use-select-option';

interface Props {
  data: DataContainer;
}

type RowsGroupedByFacet = Record<string, DataRow[]>;
interface FacetObj {
  key: string;
  values: Array<DataPoint>;
}

enum AggType {
  first,
  min,
  max,
  sum,
  mean,
  median,
  p5,
  p95,
}

interface AggOption {
  value: AggType;
  label: string;
}
const AGG_OPTIONS: AggOption[] = [
  {
    value: AggType.first,
    label: 'First',
  },
  {
    value: AggType.min,
    label: 'Min',
  },
  {
    value: AggType.max,
    label: 'Max',
  },
  {
    value: AggType.sum,
    label: 'Sum',
  },
  {
    value: AggType.mean,
    label: 'Mean',
  },
  {
    value: AggType.median,
    label: 'Median',
  },
  {
    value: AggType.p5,
    label: 'P5',
  },
  {
    value: AggType.p95,
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

  const query = useRouter().query;

  const initialX = typeof header[Number(query.x)] === 'string' ? Number(query.x) : null;
  const initialY = typeof header[Number(query.y)] === 'string' ? Number(query.y) : null;
  const initialYAgg: AggType | null = AggType[Number(query.yAgg)] ? Number(query.yAgg) : null;
  const initialFacet = typeof header[Number(query.facet)] === 'string' ? Number(query.facet) : null;

  const [x, setX] = useState<number | null>(initialX);
  const [y, setY] = useState<number | null>(initialY);
  const [yAgg, setYAgg] = useState<number | null>(initialYAgg);
  const [facet, setFacet] = useState<number | null>(initialFacet);
  const [showAllFacets, setShowAllFacets] = useState<boolean>(false);

  const yAggOption = useSelectOption(AGG_OPTIONS, yAgg);

  const onChangeX = useCallback((v: number) => {
    setX(v);
  }, []);
  const onChangeY = useCallback((v: number) => {
    setY(v);
  }, []);
  const onChangeYAgg = useCallback((v: ValueType<AggOption>) => {
    setYAgg(v ? (v as AggOption).value : null);
  }, []);
  const onChangeFacet = useCallback((v: number) => {
    setFacet(v);
  }, []);

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

  let shouldShowAgg = yAgg !== null && yAgg !== AggType.first;

  const facets: FacetObj[] | null = useMemo(() => {
    if (x === null || y === null) {
      return null;
    }

    const final = [];
    const yAccessor = (row: DataRow) => row[y];

    Object.keys(facetedRows).forEach((facetKey) => {
      const rows = facetedRows[facetKey];
      const groupedByX = {};
      let hasNonNullValue = false;
      // Aggregate rows by x-value
      rows.forEach((row) => {
        const xValue = row[x];
        // eslint-disable-next-line no-eq-null
        if (xValue == null) {
          return;
        }
        hasNonNullValue = true;
        // TODO binning for nums/dates?
        if (!groupedByX[xValue]) {
          groupedByX[xValue] = [];
        }
        groupedByX[xValue].push(row);
      });

      const groupedByXArray = [];
      Object.keys(groupedByX).forEach((xKey) => {
        const xRows = groupedByX[xKey];
        if (!shouldShowAgg && xRows.length > 1) {
          shouldShowAgg = true;
        }
        const value = (function () {
          switch (yAgg) {
            case AggType.min:
              return min(xRows, yAccessor);
            case AggType.max:
              return max(xRows, yAccessor);
            case AggType.mean:
              return mean(xRows, yAccessor);
            case AggType.sum:
              return sum(xRows, yAccessor);
            case AggType.median:
              return median(xRows, yAccessor);
            case AggType.p5:
              return quantile(xRows, 0.05, yAccessor);
            case AggType.p95:
              return quantile(xRows, 0.95, yAccessor);
            case AggType.first:
            default:
              return yAccessor(xRows[0]);
          }
        })();

        groupedByXArray.push({label: xKey, value: value});
      });

      if (hasNonNullValue) {
        // Sort by greatest value first (TODO only if x-axis is text)
        groupedByXArray.sort((a, b) => b.value - a.value);
        final.push({key: facetKey, values: groupedByXArray});
      }
    });

    return final;
  }, [facetedRows, x, y, yAgg]);

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
      },
      y: {
        index: y,
        type: types[y],
      },
    };
  }, [x, y, types]);

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
              {shouldShowAgg && (
                <div className="agg-select-wrapper">
                  <Select
                    options={AGG_OPTIONS}
                    value={yAggOption}
                    placeholder="Agg"
                    theme={selectTheme}
                    components={selectComponents}
                    onChange={onChangeYAgg}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="config-option">
            <div className="config-name">Facet By</div>
            <div className="config-control">
              <div className="field-select-wrapper">
                <FieldSelect options={allFieldOptions} value={facet} onChange={onChangeFacet} />
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
