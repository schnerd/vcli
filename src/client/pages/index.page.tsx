import Head from 'next/head'
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
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        :root {
          --n1: #F9F9FB;
          --n2: #F5F6F7;
          --n3: #EDF0F2;
          --n4: #E4E7EB;
          --n5: #C7CED4;
          --n6: #A6B1BB;
          --n7: #7B8B9A;
          --n8: #66788A;
          --n9: #425A70;
          --n10: #234361;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
