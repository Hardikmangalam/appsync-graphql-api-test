/**
 * COMMON WEBPACK CONFIGURATION
 */

const path = require('path');
// const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const IS_BUILD_SOURCE_MAP = true;

const webPackConfigs = options => ({
  mode: options.mode,
  entry: options.entry,
  output: Object.assign(
    {
      // Compile into js/build.js
      path: path.resolve(process.cwd(), 'build'),
      publicPath: '/',
    },
    options.output,
  ), // Merge with env dependent settings
  optimization: options.optimization,
  module: {
    rules: [
      {
        test: /\.js$/, // Transform all .js files required somewhere with Babel
        exclude: [
          path.resolve(process.cwd(), 'node_modules'),
          path.resolve(process.cwd(), 'amplify'),
        ],
        use: {
          loader: 'babel-loader',
          options: options.babelQuery,
        },
      },
      // {
      //   test: /\.m?js/,
      //   resolve: {
      //     fullySpecified: false,
      //   },
      // },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader:
              options.mode === 'development'
                ? 'style-loader'
                : MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: IS_BUILD_SOURCE_MAP,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: IS_BUILD_SOURCE_MAP,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: IS_BUILD_SOURCE_MAP,
            },
          },
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2|otf)$/,
        exclude: /images/,
        use: 'file-loader',
        type: 'asset/resource',
      },
      {
        test: /\.svg$/,
        type: 'asset',
        use: 'svgo-loader',
      },
      {
        test: /\.(ico|webp|jpg|png|gif|jpeg|mp3|wav)$/,
        use: [
          {
            loader: 'url-loader?name=/images/[name].[ext]',
            options: {
              // Inline files smaller than 10 kB
              // limit: 1024000,
              esModule: false,
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                enabled: false,
                // NOTE: mozjpeg is disabled as it causes errors in some Linux environments
                // Try enabling it in your environment by switching the config to:
                // enabled: true,
                // progressive: true,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 7,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
            },
          },
        ],
      },
      // {
      //   test: /\.svg$/,
      //   include: /sprite/,
      //   use: 'svg-sprite-loader',
      // },
      // {
      //   test: /\.svg$/,
      //   use: 'url-loader',
      //   exclude: /sprite/,
      // },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      {
        test: /\.(mp4|webm)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
          },
        },
      },
      {
        test: /\.mp3$/,
        loader: 'file-loader',
        // query: {
        //   name: '[name].[hash:8].[ext]',
        // },
      },
    ],
  },
  plugins: options.plugins.concat([
    // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
    // inside your code for any environment checks; Terser will automatically
    // drop any unreachable code.
    new Dotenv(),
  ]),
  resolve: {
    modules: ['src', 'node_modules'],
    alias: {
      moment$: 'moment/moment.js',
    },
    extensions: ['.js', '.jsx', '.react.js'],
    mainFields: ['browser', 'main', 'jsnext:main'],
    fallback: {
      path: require.resolve('path-browserify'),
      process: require.resolve('process/browser'),
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      child_process: false,
      fs: false,
      http2: false,
      tls: require.resolve('tls-browserify'),
      // net: require.resolve('net-browserify'),
      net: false,
      zlib: require.resolve('browserify-zlib'),
    },
  },
  devtool: false,
  target: 'web', // Make web variables accessible to webpack, e.g. window
  performance: options.performance || {},
});

module.exports = webPackConfigs;
