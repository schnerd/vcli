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

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
