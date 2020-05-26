import {max, mean, median, min, quantile, sum} from 'd3-array';
import mapValues from 'lodash/mapValues';
import {useRouter} from 'next/router';
import {useCallback, useMemo, useState} from 'react';
import Select, {ValueType} from 'react-select';
import {DataPoint} from '../types';
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

let HIDE_FACETS_AFTER = 50;

export default function Analysis(props: Props) {
  const {data} = props;
  const types = data.getTypes();
  const header = data.getHeader();
  const rows = data.getRows();

  const query = useRouter().query;

  let initialX = typeof header[Number(query.x)] === 'string' ? Number(query.x) : null;
  let initialY = typeof header[Number(query.y)] === 'string' ? Number(query.y) : null;
  let initialYAgg: AggType | null = AggType[Number(query.yAgg)] ? Number(query.yAgg) : null;
  let initialFacet = typeof header[Number(query.facet)] === 'string' ? Number(query.facet) : null;

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

  const facetedRows: RowsGroupedByFacet = useMemo(() => {
    if (facet === null) {
      return {'': rows};
    }
    let ret: Record<string, DataRow[]> = {};
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

    let final = [];
    let yAccessor = (row: DataRow) => row[y];

    Object.keys(facetedRows).forEach((facetKey) => {
      let rows = facetedRows[facetKey];
      let groupedByX = {};
      let hasNonNullValue = false;
      // Aggregate rows by x-value
      rows.forEach((row) => {
        const xValue = row[x];
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

      let groupedByXArray = [];
      Object.keys(groupedByX).forEach((xKey) => {
        const xRows = groupedByX[xKey];
        if (!shouldShowAgg && xRows.length > 1) {
          shouldShowAgg = true;
        }
        let value = (function () {
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

  let nFacets = facets ? Object.keys(facets).length : 1;
  let hiddenFacets = nFacets - HIDE_FACETS_AFTER;

  const facetsShown = useMemo(() => {
    if (!facets || showAllFacets) {
      return facets;
    }
    return facets.slice(0, HIDE_FACETS_AFTER);
  }, [facets, showAllFacets]);

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
                {/* TODO only allow numeric fields for y axis */}
                <FieldSelect options={allFieldOptions} value={y} onChange={onChangeY} />
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
            facet != null ? (
              <>
                <div className="charts-grid">
                  {facetsShown.map((f) => {
                    return <AnalysisFacet key={f.key} facet={f.key} data={f.values} />;
                  })}
                </div>
                {!showAllFacets && nFacets > HIDE_FACETS_AFTER && (
                  <button className="show-more-facets-btn" onClick={() => setShowAllFacets(true)}>
                    Show {hiddenFacets} more facet{hiddenFacets === 1 ? '' : 's'}
                  </button>
                )}
              </>
            ) : (
              <div className="charts-single">
                <AnalysisFacet data={facetsShown[0].values} />
              </div>
            )
          ) : (
            <div />
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
      `}</style>
    </>
  );
}
