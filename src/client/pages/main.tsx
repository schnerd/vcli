import clsx from 'clsx';
import {useCallback, useState} from 'react';
import {useSetRecoilState} from 'recoil';
import Analysis from './analysis';
import Overview from './overview';
import {Tooltip, tooltipVisibleState} from './tooltip';
import {useFetchData} from './use-fetch-data';
import {VcliLogo} from './vcli-logo';

enum Page {
  overview,
  analysis,
}

export default function Main() {
  const {data, chartConfig, file, isLoading, error} = useFetchData();
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

  const setTooltipVisible = useSetRecoilState(tooltipVisibleState);
  const handleSetPage = useCallback(
    (page: Page) => {
      setPage(page);
      setTooltipVisible(false);
    },
    [setTooltipVisible],
  );

  return (
    <div className="container">
      <header>
        <div className="header-items">
          <div className="logo" title="vcli">
            <VcliLogo />
          </div>
          <div className="pipe">|</div>
          <div className="nav">
            <button
              className={clsx('nav-item', page === Page.overview && 'nav-sel')}
              onClick={() => handleSetPage(Page.overview)}
            >
              Overview
            </button>
            <button
              className={clsx('nav-item', page === Page.analysis && 'nav-sel')}
              onClick={() => handleSetPage(Page.analysis)}
            >
              Analysis
            </button>
          </div>
          <div className="pipe">|</div>
          <div className="source">
            {file === undefined ? '' : file || 'Showing data from stdin'}
          </div>
        </div>
      </header>
      <main>{body}</main>
      <Tooltip />

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
        .header-items {
          display: flex;
          align-items: center;
        }
        .logo {
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 4px;
          color: var(--n10);
          margin-top: 2px;
        }
        .source {
          font-size: 14px;
          font-weight: 500;
          line-height: 1;
        }
        .pipe {
          color: #a6b1bb;
          margin: 0 10px;
        }

        .nav {
          display: flex;
          flex-direction: row;
          align-items: center;
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
          background-color: var(--b3);
        }
        .nav-item.nav-sel {
          background-color: var(--b9);
          color: var(--n1);
        }

        main {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
