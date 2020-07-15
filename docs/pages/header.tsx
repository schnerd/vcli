import {FiGithub} from 'react-icons/fi';

export default function Header() {
  return (
    <header>
      <div className="container-lg">
        <div className="header-inner">
          <div className="header-left">
            <a href="/" className="logo">
              <svg width={48} viewBox="0 0 425 216" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <path
                    d="M242.2 215.1c-15.8 0-29.7-3.2-41.7-9.6-12-6.4-21.25-15.45-27.75-27.15S163 153.1 163 137.7c0-15.2 3.3-28.65 9.9-40.35 6.6-11.7 15.85-20.8 27.75-27.3s25.65-9.75 41.25-9.75c21.6 0 40.3 7.6 56.1 22.8L277.6 105c-4.4-4.4-9.7-7.85-15.9-10.35-6.2-2.5-12.6-3.75-19.2-3.75-13.6 0-24.65 4.35-33.15 13.05-8.5 8.7-12.75 19.95-12.75 33.75 0 14 4.25 25.3 12.75 33.9 8.5 8.6 19.55 12.9 33.15 12.9 7.2 0 14-1.3 20.4-3.9 6.4-2.6 11.8-6.4 16.2-11.4l20.7 22.5c-8.2 8-17 13.9-26.4 17.7-9.4 3.8-19.8 5.7-31.2 5.7zM318.8 1.8h33.6v210h-33.6V1.8zm83.5 39.6c-6.2 0-11.3-1.95-15.3-5.85-4-3.9-6-8.75-6-14.55 0-6.2 2-11.25 6-15.15 4-3.9 9.1-5.85 15.3-5.85 6.4 0 11.65 1.95 15.75 5.85 4.1 3.9 6.15 8.95 6.15 15.15 0 5.8-2.05 10.65-6.15 14.55-4.1 3.9-9.35 5.85-15.75 5.85zm-16.8 22.2h33.6v148.2h-33.6V63.6z"
                    fill="#234361"
                  />
                  <path
                    fill="#1070CA"
                    fillRule="nonzero"
                    d="M125.7 63.6h36L99 211.8H63L0 63.6h36.6l20.7 50.7L81 177l24-62.7z"
                  />
                </g>
              </svg>
            </a>
          </div>
          <div className="header-center">
            <nav>
              <a className="nav-link" href="#Install">
                Install
              </a>
              <a className="nav-link" href="#Usage">
                Usage
              </a>
              <a className="nav-link" href="#Examples">
                Examples
              </a>
            </nav>
          </div>
          <div className="header-right">
            <a
              href="https://github.com/schnerd/vcli"
              title="Github"
              className="nav-link github-link"
              target="_blank"
              rel="noreferrer"
            >
              <FiGithub size={24} />
            </a>
          </div>
        </div>
      </div>
      <style jsx>{`
        header {
          background: #fff;
          border-bottom: 1px solid var(--n4);
          padding: 0.8rem 1rem;
        }
        .header-inner {
          display: flex;
          align-items: center;
        }
        .header-left {
          flex: 0 1 100px;
          display: flex;
          align-items: center;
        }
        .header-center {
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .header-right {
          flex: 0 1 100px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .logo {
          display: flex;
        }
        .logo svg {
          height: 100%;
        }
        nav {
          padding: 0 20px;
          display: flex;
          align-items: center;
        }
        .nav-link {
          font-size: 18px;
          color: var(--n7);
          transition: color 0.2s;
        }
        .nav-link:hover {
          text-decoration: none;
          color: var(--b9);
        }
        .nav-link:not(:first-child) {
          margin-left: 40px;
        }
        .github-link {
          display: flex;
        }
      `}</style>
    </header>
  );
}
