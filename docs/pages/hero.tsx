export default function Hero() {
  return (
    <div className="root">
      <div className="blob"></div>
      <div className="container-lg">
        <div className="hero-content">
          <h1>
            Super charge your command
            <br />
            line data wrangling
          </h1>
          <h4>
            vcli helps you quickly visualize CSV data
            <br />
            from files, APIs, and other programs
          </h4>
          <div className="video"></div>
        </div>
      </div>
      <style jsx>{`
        .root {
          text-align: center;
          position: relative;
        }
        .blob {
          position: absolute;
          top: 0;
          left: 0%;
          right: 0%;
          bottom: 0%;
          background-position: 50% -180px;
          background-image: url("data:image/svg+xml;charset=utf8,%3Csvg width='1020' height='708' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M859.754 3.533c94.63 3.222 161.577 110.825 159.646 215.206-1.931 104.381-72.098 204.897-123.596 295.103-51.5 90.85-84.33 171.391-144.197 189.432-59.223 18.042-146.127-26.417-215.65-50.257-70.167-23.196-122.31-25.773-213.076-34.15-90.766-7.732-219.513-21.263-278.736-85.051-59.867-63.789-49.567-178.48-21.243-294.458C50.582 124.023 96.932 7.399 182.548.956c85.616-6.444 211.144 97.938 334.74 99.226C641.53 101.472 764.483.312 859.755 3.533z' fill='%231070CA' fill-rule='nonzero' opacity='.203'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-size: ;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          padding: 60px 0;
          margin: 0 auto;
        }
        h1 {
          margin: 0;
          font-size: 56px;
        }
        h4 {
          margin: 20px 0 40px;
          font-size: 24px;
          color: var(--n7);
          font-weight: 500;
          line-height: 1.4;
        }
        .video {
          width: 600px;
          height: 440px;
          background: var(--n3);
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
