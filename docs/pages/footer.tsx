export default function Footer() {
  return (
    <footer className="container-lg">
      <div>
        <a href="https://github.com/schnerd/vcli/tree/master/docs">Edit these docs on Github</a>
      </div>
      <div>
        Created by{' '}
        <a href="https://twitter.com/dschnr" target="_blank" rel="noreferrer">
          @dschnr
        </a>
      </div>
      <style jsx>{`
        footer {
          text-align: center;
          color: var(--n6);
          margin-top: 30px;
          padding: 40px 0;
        }
        footer a {
          color: var(--n6);
          text-decoration: underline;
        }

        /* Mobile styles */
        @media (max-width: 576px) {
          footer {
            display: block;
          }
          footer > div + div {
            margin-top: 8px;
          }
        }
        @media (min-width: 577px) {
          footer {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          footer > div + div {
            margin-left: 20px;
          }
        }
      `}</style>
    </footer>
  );
}
