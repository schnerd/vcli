export function Loading() {
  return (
    <>
      <div className="root">
        <div className="lds-grid">
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
        <h2>Loading...</h2>
      </div>
      <style jsx>{`
        .root {
          padding: 20px;
          display: flex;
          align-items: center;
        }
        .lds-grid {
          display: grid;
          position: relative;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr 1fr;
          font-size: 3px;
          width: 10em;
          height: 10em;
          grid-gap: 1em;
        }
        .lds-grid div {
          background: var(--b9);
          animation: lds-grid 1.2s linear infinite;
        }
        .lds-grid div:nth-child(1) {
          animation-delay: 0s;
        }
        .lds-grid div:nth-child(2) {
          animation-delay: -0.4s;
        }
        .lds-grid div:nth-child(3) {
          animation-delay: -0.8s;
        }
        .lds-grid div:nth-child(4) {
          animation-delay: -0.4s;
        }
        .lds-grid div:nth-child(5) {
          animation-delay: -0.8s;
        }
        .lds-grid div:nth-child(6) {
          animation-delay: -1.2s;
        }
        .lds-grid div:nth-child(7) {
          animation-delay: -0.8s;
        }
        .lds-grid div:nth-child(8) {
          animation-delay: -1.2s;
        }
        .lds-grid div:nth-child(9) {
          animation-delay: -1.6s;
        }
        @keyframes lds-grid {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        h2 {
          margin: 0 0 0 12px;
          font-size: 18px;
          font-weight: 500;
          color: var(--n7);
          line-height: 1;
        }
      `}</style>
    </>
  );
}
