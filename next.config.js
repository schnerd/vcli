const withMDX = require('@next/mdx')();

module.exports = withMDX({
  pageExtensions: ['page.tsx'],
  poweredByHeader: false,
});
