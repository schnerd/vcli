import Head from 'next/head';
import Main from './main';

export default function AppContainer() {
  return (
    <>
      <Head>
        <title>vcli</title>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Head>
      <Main />
      <style jsx global>{`
        :root {
          --n1: #f9f9fb;
          --n2: #f5f6f7;
          --n3: #edf0f2;
          --n4: #e4e7eb;
          --n5: #c7ced4;
          --n6: #a6b1bb;
          --n7: #7b8b9a;
          --n8: #66788a;
          --n9: #425a70;
          --n10: #234361;

          --b1: #f7f9fd;
          --b2: #f1f7fc;
          --b3: #e9f2fa;
          --b4: #ddebf7;
          --b5: #b7d4ef;
          --b6: #8fbce6;
          --b7: #579ad9;
          --b8: #3d8bd4;
          --b9: #1070ca;
          --b10: #084b8a;
        }

        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
            Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
          color: var(--n9);
        }

        a,
        a:visited {
          color: var(--b9);
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }

        * {
          box-sizing: border-box;
        }

        /*** Containers (borrowed from bootstrap)
     https://getbootstrap.com/docs/4.5/layout/overview/#containers ***/
        .container {
          width: 100%;
          padding-right: 15px;
          padding-left: 15px;
          margin-right: auto;
          margin-left: auto;
        }

        @media (min-width: 576px) {
          .container {
            max-width: 540px;
          }
        }

        @media (min-width: 768px) {
          .container {
            max-width: 720px;
          }
        }

        @media (min-width: 992px) {
          .container {
            max-width: 960px;
          }
        }

        .container-fluid,
        .container-sm,
        .container-md,
        .container-lg {
          width: 100%;
          padding-right: 15px;
          padding-left: 15px;
          margin-right: auto;
          margin-left: auto;
        }

        @media (min-width: 576px) {
          .container,
          .container-sm {
            max-width: 540px;
          }
        }

        @media (min-width: 768px) {
          .container,
          .container-sm,
          .container-md {
            max-width: 720px;
          }
        }

        @media (min-width: 992px) {
          .container,
          .container-sm,
          .container-md,
          .container-lg {
            max-width: 960px;
          }
        }
      `}</style>
    </>
  );
}
