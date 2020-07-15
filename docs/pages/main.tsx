import Header from './header';
import Hero from './hero';
// @ts-ignore
import Content from './content.mdx';
import Footer from './footer';

export default function Main() {
  return (
    <div className="main">
      <Header />
      <Hero />
      <div className="container-fluid content-wrap markdown-body">
        <Content />
      </div>
      <Footer />
      <style jsx global>{`
        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4,
        .markdown-body h5,
        .markdown-body h6 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.25;
        }

        .markdown-body h1 {
          font-size: 32px;
        }

        .markdown-body h2 {
          font-size: 24px;
        }

        .markdown-body h3 {
          font-size: 20px;
        }

        .markdown-body h4 {
          font-size: 16px;
        }

        .markdown-body h5 {
          font-size: 14px;
        }

        .markdown-body h6 {
          font-size: 12px;
        }

        .markdown-body p {
          margin-top: 0;
          margin-bottom: 10px;
          line-height: 1.5;
        }

        .markdown-body code,
        .markdown-body pre {
          font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
          font-size: 12px;
        }
        .markdown-body pre {
          margin-top: 0;
          margin-bottom: 16px;
          word-wrap: normal;
          padding: 16px;
          overflow: auto;
          font-size: 85%;
          line-height: 1.45;
          background-color: #f6f8fa;
          border-radius: 3px;
        }
        .markdown-body pre > code {
          background-color: initial;
          border-radius: 3px;
          border: 0;
          display: inline;
          line-height: inherit;
          margin: 0;
          overflow: visible;
          padding: 0;
          white-space: pre;
          word-break: normal;
          word-wrap: normal;
        }

        .markdown-body ol,
        .markdown-body ul {
          padding-left: 2em;
        }

        .markdown-body ol ol,
        .markdown-body ol ul,
        .markdown-body ul ol,
        .markdown-body ul ul {
          margin-top: 0;
          margin-bottom: 0;
        }

        .markdown-body li {
          word-wrap: break-all;
        }

        .markdown-body li > p {
          margin-top: 16px;
        }

        .markdown-body li + li {
          margin-top: 0.25em;
        }
      `}</style>
      <style jsx>{`
        .content-wrap {
          max-width: 800px;
        }
      `}</style>
    </div>
  );
}
