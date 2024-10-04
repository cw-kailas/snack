const path = require('path');
const withSass = require('next-transpile-modules')(['@oxygen/core']);
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      require('remark-autolink-headings'),
      require('remark-emoji'),
      require('remark-images'),
      require('remark-slug'),
      require('remark-unwrap-images'),
    ],
  },
});

const IS_PROD = process.env.NODE_ENV === 'production';

let extensions = [];
let cssThemeFilePath = '';

if (process.env.THEME === 'mobility') {
  extensions = [
    '.mobility.js',
    '.mjs',
    '.js',
    '.jsx',
    '.json',
    '.mobility.module.scss',
    '.module.scss',
  ];
  cssThemeFilePath = '../packages/theme/scss/_mobility-theme.scss';
} else if (process.env.THEME === 'cartrade') {
  extensions = [
    '.cartrade.js',
    '.mjs',
    '.js',
    '.jsx',
    '.json',
    '.cartrade.module.scss',
    '.module.scss',
  ];
  cssThemeFilePath = '../packages/theme/scss/_cartrade-theme.scss';
} else if (process.env.THEME === 'bikewale') {
  extensions = [
    '.bikewale.js',
    '.mjs',
    '.js',
    '.jsx',
    '.json',
    '.bikewale.module.scss',
    '.module.scss',
  ];
  cssThemeFilePath = '../packages/theme/scss/_oxygen-theme.scss';
} else {
  extensions = [
    '.oxygen.js',
    '.mjs',
    '.js',
    '.jsx',
    '.json',
    '.oxygen.module.scss',
    '.module.scss',
  ];
  cssThemeFilePath = '../packages/theme/scss/_oxygen-theme.scss';
}

module.exports = withMDX(
  withSass({
    reactStrictMode: true,
    cssModules: true,
    cssLoaderOptions: {
      localIdentName: '[hash:base64:5]',
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      config.resolve.alias['~@oxygen/theme/utils$'] = path.resolve(__dirname, cssThemeFilePath);
      config.resolve.alias['snack-sdk'] = path.resolve(__dirname, '../../../packages/snack-sdk');
      config.resolve.alias['vm2'] = false;
      config.resolve.extensions = extensions;

      console.log(IS_PROD, process.env.THEME);

      return config;
    },
    pageExtensions: ['js', 'jsx', 'md', 'mdx'],
    assetPrefix: IS_PROD ? '/docs' : '',
  }),
);
