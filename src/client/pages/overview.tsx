import DataContainer from './data-container';
import {StatChart} from './stat-chart';

interface Props {
  data: DataContainer;
}

export default function Overview(props: Props) {
  const {data} = props;
  let header = data.getHeader();
  let stats = data.getStats();

  return (
    <>
      <div className="stats">
        {header.map((f, i) => {
          let stat = stats[i];
          return (
            <div key={f} className="stat">
              <h3 className="stat-title">{f}</h3>
              <div className="stat-chart">
                <StatChart stats={stat} />
              </div>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          grid-gap: 10px;
          padding: 10px;
        }

        .stat {
          padding: 10px;
          background-color: white;
          box-shadow: rgba(67, 90, 111, 0.3) 0px 0px 1px, rgba(67, 90, 111, 0.47) 0px 4px 10px -4px;
        }
        .stat-title {
          margin: 0;
        }
        .stat-chart {
          min-width: 300px;
          height: 300px;
          overflow-y: auto;
        }
      `}</style>
    </>
  );
}
