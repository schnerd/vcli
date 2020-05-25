import clsx from 'clsx';
import {useState} from 'react';
import Analysis from './analysis';
import Overview from './overview';
import {useFetchData} from './use-fetch-data';

enum Page {
  overview,
  analysis,
}

export default function Main() {
  const {data, isLoading, error} = useFetchData();
  const [page, setPage] = useState(Page.overview);

  let body = null;
  if (isLoading) {
    body = 'Loading...';
  } else if (error) {
    body = `error: ${error.toString()}`;
  } else if (data) {
    if (page === Page.overview) {
      body = <Overview data={data} />;
    } else {
      body = <Analysis data={data} />;
    }
  }

  return (
    <div className="container">
      <header>
        <h1 className="title">
          <span className="vcli">vcli</span>
          <span className="pipe">|</span>Showing data from stdin
        </h1>
        <div className="nav">
          <button
            className={clsx('nav-item', page === Page.overview && 'nav-sel')}
            onClick={() => setPage(Page.overview)}
          >
            Overview
          </button>
          <button
            className={clsx('nav-item', page === Page.analysis && 'nav-sel')}
            onClick={() => setPage(Page.analysis)}
          >
            Analysis
          </button>
        </div>
      </header>
      <main>{body}</main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
          color: var(--n9);
          background: var(--n2);
        }

        header {
          background: #fff;
          display: flex;
          flex-direction: row;
          align-items: center;
          border-bottom: 1px solid var(--n4);
          padding: 0.8rem 1rem;
        }
        .title {
          font-size: 14px;
          margin: 0;
          font-weight: 500;
        }
        .vcli {
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 4px;
          color: var(--n10);
        }
        .pipe {
          color: #a6b1bb;
          margin: 0 10px;
        }

        .nav {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin-left: 20px;
        }
        .nav-item {
          border: none;
          background: transparent;
          color: var(--n10);
          cursor: pointer;
          font-weight: 500;
          font-size: 12px;
          line-height: 1;
          outline: none;
          padding: 5px 8px 6px;
          border-radius: 3px;
          transition: 0.3s background-color, 0.3s color;
        }
        .nav-item:not(:first-child) {
          margin-left: 10px;
        }
        .nav-item:not(.nav-sel):hover {
          background-color: var(--n3);
        }
        .nav-item.nav-sel {
          background-color: var(--n10);
          color: var(--n1);
        }

        main {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
