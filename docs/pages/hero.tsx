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
          <div className="video">
            <video controls autoPlay loop muted width="1022" height="736">
              <source src="/product-demo.mp4" type="video/mp4" />
              Sorry, your browser doesn&apos;t support embedded videos.
            </video>
          </div>
          <div className="beta">
            <span className="beta-tag">Beta</span> vcli is beta software, please{' '}
            <a href="https://github.com/schnerd/vcli/issues" target="_blank" rel="noreferrer">
              report any issues
            </a>{' '}
            you experience.
          </div>
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
          background-position: 36% -120px;
          background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI0OCIgaGVpZ2h0PSI1NjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGN4PSIxMDAlIiBjeT0iMCUiIGZ4PSIxMDAlIiBmeT0iMCUiIHI9IjExMi44MzUlIiBncmFkaWVudFRyYW5zZm9ybT0ic2NhbGUoLS45NTY2NSAtMSkgcm90YXRlKC02Mi40MDYgLS4wMjMgMS42ODgpIiBpZD0iYSI+PHN0b3Agc3RvcC1jb2xvcj0iIzEwNzBDQSIgb2Zmc2V0PSIwJSIvPjxzdG9wIHN0b3AtY29sb3I9IiMxMDcwQ0EiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIxMDAlIi8+PC9yYWRpYWxHcmFkaWVudD48cmFkaWFsR3JhZGllbnQgY3g9IjEwMCUiIGN5PSIwJSIgZng9IjEwMCUiIGZ5PSIwJSIgcj0iMTQ2LjA0OCUiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLS4zNDIzNSAuNjg0NyAtLjkzOTU3IC0uMjQ5NDkgMS4zNDIgLS42ODUpIiBpZD0iYiI+PHN0b3Agc3RvcC1jb2xvcj0iIzEwNzBDQSIgb2Zmc2V0PSIwJSIvPjxzdG9wIHN0b3AtY29sb3I9IiMxMDcwQ0EiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIxMDAlIi8+PC9yYWRpYWxHcmFkaWVudD48cmFkaWFsR3JhZGllbnQgY3g9IjEwMCUiIGN5PSIwJSIgZng9IjEwMCUiIGZ5PSIwJSIgcj0iMTEyLjQ5MiUiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLS40NDQ0OCAuODg4OTUgLS44OTU4IC0uNDQxMDggMS40NDQgLS44ODkpIiBpZD0iYyI+PHN0b3Agc3RvcC1jb2xvcj0iIzEwNzBDQSIgb2Zmc2V0PSIwJSIvPjxzdG9wIHN0b3AtY29sb3I9IiMxMDcwQ0EiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIxMDAlIi8+PC9yYWRpYWxHcmFkaWVudD48cmFkaWFsR3JhZGllbnQgY3g9IjEwMCUiIGN5PSIwJSIgZng9IjEwMCUiIGZ5PSIwJSIgcj0iMTEyLjU1NyUiIGdyYWRpZW50VHJhbnNmb3JtPSJzY2FsZSgtMSAtLjk5MTY1KSByb3RhdGUoLTYzLjYyNyAwIDEuNjEyKSIgaWQ9ImQiPjxzdG9wIHN0b3AtY29sb3I9IiMxMDcwQ0EiIG9mZnNldD0iMCUiLz48c3RvcCBzdG9wLWNvbG9yPSIjMTA3MENBIiBzdG9wLW9wYWNpdHk9IjAiIG9mZnNldD0iMTAwJSIvPjwvcmFkaWFsR3JhZGllbnQ+PHJhZGlhbEdyYWRpZW50IGN4PSIxMDAlIiBjeT0iMCUiIGZ4PSIxMDAlIiBmeT0iMCUiIHI9IjExMi40NDQlIiBncmFkaWVudFRyYW5zZm9ybT0ic2NhbGUoLS45NzI0NyAtMSkgcm90YXRlKC02Mi43OSAtLjAxNCAxLjY2MikiIGlkPSJlIj48c3RvcCBzdG9wLWNvbG9yPSIjMTA3MENBIiBvZmZzZXQ9IjAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iIzEwNzBDQSIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjEwMCUiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48ZyBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9Im5vbmUiIG9wYWNpdHk9Ii41NDciPjxwYXRoIGZpbGw9InVybCgjYSkiIG9wYWNpdHk9Ii40OTMiIHRyYW5zZm9ybT0icm90YXRlKDkxIDU3OC43NjQgMzI0Ljc5MikiIGQ9Ik0zNjQuNzggNDEwLjIwNmwzNDQuMTgtMTg1LjU0IDExNC42MjMgNDM4LjkxNS00NTguODAzLTcuNjMzeiIvPjxwYXRoIGZpbGw9InVybCgjYikiIG9wYWNpdHk9Ii40OTMiIHRyYW5zZm9ybT0icm90YXRlKC0zOSA0OTQuMjU4IDYwMi4wMDQpIiBkPSJNNDg1LjYzIDMyNS4xM2wzNDUuNTY1LTE4My4yNzcgMTE1LjI3NyA0NTguMDYtOTIuMDUzIDE4Ny4wMTMtMzc4LjA0LTI5Ny42ODd6Ii8+PHBhdGggZmlsbD0idXJsKCNjKSIgb3BhY2l0eT0iLjQ5MyIgdHJhbnNmb3JtPSJyb3RhdGUoMiAzNzU3LjcyNiAtMzU3Ny43MjIpIiBkPSJNNTUxLjI0IDI4OC40NDRsMzQ3LjEwMy0xODUuNTM5IDEyOC4xMzIgNDc4Ljg5LTQ3NS4yMzQtNDcuNjA4eiIvPjxwYXRoIGZpbGw9InVybCgjZCkiIG9wYWNpdHk9Ii40OTMiIHRyYW5zZm9ybT0icm90YXRlKDM4IDQyMS44NzcgODYuMzQpIiBkPSJNMTQzLjc2IDMzMS4yNzNMNDQ1LjA1NiA5NS44NzRsMTI3Ljg5NyA0NzktNDc1LTQ3LjcxOHoiLz48cGF0aCBmaWxsPSJ1cmwoI2UpIiBvcGFjaXR5PSIuNDkzIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTc4IDEwOTkuODU3IDM1NS43ODIpIiBkPSJNMTA1MC4wNTUgMTUyLjkzMmwyNTIuMjEyIDMwLjM0MyAxMjcuODk3IDQ3OS01MjMuNzY0LTE3LjUxeiIvPjwvZz48L3N2Zz4=');
          background-repeat: no-repeat;
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
          width: 800px;
          background: rgb(0, 40, 51);
          margin: 0 auto;
          display: flex;
          max-width: 100%;
          border-radius: 5px;
          overflow: hidden;
          box-shadow: rgba(67, 90, 111, 0.3) 0px 0px 1px, rgba(67, 90, 111, 0.47) 0px 4px 10px -4px;
        }
        video {
          max-width: 100%;
          width: 100%;
          height: 100%;
        }

        .beta {
          text-align: center;
          color: var(--n7);
          font-size: 14px;
          margin-top: 30px;
        }
        .beta-tag {
          background: #ec4c47;
          color: white;
          font-size: 10px;
          line-height: 1;
          white-space: nowrap;
          text-transform: uppercase;
          padding: 2px 5px 3px;
          border-radius: 3px;
          font-weight: bold;
          letter-spacing: 1px;
          margin-right: 5px;
        }

        /* Mobile styles */
        @media (max-width: 800px) {
          h1 {
            font-size: 36px;
          }
          h4 {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}
