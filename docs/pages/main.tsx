import Header from './header';
import Hero from './hero';
// @ts-ignore
import Content from './content.mdx';

export default function Main() {
  return (
    <div className="main">
      <Header />
      <Hero />
      <div className="container-fluid content-wrap markdown-body">
        <Content />
      </div>
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
        }
      `}</style>
      <style jsx>{`
        .content-wrap {
          max-width: 700px;
        }
      `}</style>
    </div>
  );
}
