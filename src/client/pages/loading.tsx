export function Loading() {
  return (
    <>
      <div className="root">
        <img src="/vcli-loader.svg" width="430" height="220" />
        <h2>Crunching data...</h2>
      </div>
      <style jsx>{`
        .root {
          padding: 20px;
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        img {
          width: 86px;
          height: auto;
          opacity: 0.5;
        }
        h2 {
          display: block;
          margin: 10px 0 0 5px;
          font-size: 16px;
          font-weight: 400;
          color: var(--n7);
          line-height: 1;
        }
      `}</style>
    </>
  );
}
