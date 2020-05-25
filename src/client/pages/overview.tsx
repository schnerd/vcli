import DataContainer, {DataTypes} from './data-container';
import OverviewField from './overview-field';

interface Props {
  data: DataContainer;
}

const TYPE_LABELS: Record<DataTypes, string> = {
  [DataTypes.date]: 'Date',
  [DataTypes.num]: 'Num',
  [DataTypes.text]: 'Text',
};

export default function Overview(props: Props) {
  const {data} = props;
  let header = data.getHeader();
  return (
    <>
      <div className="root">
        {header.map((f, i) => {
          return <OverviewField key={header[i]} data={data} col={i} />;
        })}
      </div>
      <style jsx>{`
        .root {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          grid-gap: 10px;
          padding: 10px;
        }
      `}</style>
    </>
  );
}
