import Head from 'next/head';
import Main from './main';

export default function AppContainer() {
  return (
    <div className="container">
      <Head>
        <title>vcli</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main />
      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
            Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }
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

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
