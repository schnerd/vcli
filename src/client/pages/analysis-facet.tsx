import {AnalysisChart} from './analysis-chart';

interface Props {
  facet?: string;
  data: Record<string, number | null>;
}

export default function AnalysisFacet(props: Props) {
  const {facet, data} = props;
  return (
    <>
      <div className="root">
        {facet != undefined && <h3 className="name">{facet || '[empty]'}</h3>}
        <div className="chart">
          <AnalysisChart data={data} />
        </div>
      </div>
      <style jsx>{`
        .root {
          background: #fff;
          box-shadow: rgba(67, 90, 111, 0.3) 0px 0px 1px, rgba(67, 90, 111, 0.47) 0px 4px 10px -4px;
          min-width: 300px;
          height: 300px;
          overflow-y: auto;
        }
        .name {
          padding: 10px;
          margin: 0;
        }
      `}</style>
    </>
  );
}
