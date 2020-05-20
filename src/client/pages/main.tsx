import {useFetchData} from './use-fetch-data';

export default function Main() {
  const {data, isLoading, error} = useFetchData();

  let body = null;
  if (isLoading) {
    body = 'Loading...';
  } else if (error) {
    body = `error: ${error.toString()}`;
  } else if (data) {
    let header = data.getHeader();
    let stats = data.getStats();
    body = (
      <div className="stats">
        {header.map((f, i) => {
          let stat = stats[i];
          return (
            <div key={f} className="stat">
              <h3>{f}</h3>
              <div>
                {
                  Object.keys(stat).map((v) => (
                    <div key={v}>
                      {v}: {stat[v]}
                    </div>
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>
    )
  }

  return (
    <div className="container">
      <main>
        {body}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        :global(.stats) {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        :global(.stat) {
          height: 300px;
          overflow-y: auto;
          margin: 20px;
        }
      `}</style>
    </div>
  )
}
