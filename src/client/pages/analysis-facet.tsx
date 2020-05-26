import {ChartFieldsMeta, DataPoint} from '../types';
import {AnalysisChart} from './analysis-chart';

interface Props {
  data: DataPoint[];
  facet?: string;
  fields: ChartFieldsMeta;
}

export default function AnalysisFacet(props: Props) {
  const {facet, fields, data} = props;

  return (
    <>
      <div className="root">
        {facet != undefined && <h3 className="name">{facet || '[empty]'}</h3>}
        <div className="chart">
          <AnalysisChart data={data} fields={fields} />
        </div>
      </div>
      <style jsx>{`
        .root {
          background: #fff;
          box-shadow: rgba(67, 90, 111, 0.3) 0px 0px 1px, rgba(67, 90, 111, 0.47) 0px 4px 10px -4px;
          min-width: 300px;
          height: 300px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .name {
          padding: 10px 10px 0 10px;
          margin: 0;
          flex: 0 0 auto;
        }
        .chart {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
      `}</style>
    </>
  );
}
