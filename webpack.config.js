// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = 'style-loader';

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
  },
  plugins: [
    new Dotenv(),
    // new HtmlWebpackPlugin({
    //   template: './public/index.html',
    // }),

    new HtmlWebpackPlugin({
      template: 'src/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: false,
        minifyCSS: true,
        minifyURLs: true,
      },
      inject: true,
    }),

    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader',
        exclude: [
          path.resolve(process.cwd(), 'node_modules'),
          path.resolve(process.cwd(), 'amplify'),
        ],
        options: {
          presets: ['@babel/env', '@babel/preset-react'],
          plugins: [
            [
              '@babel/plugin-transform-runtime',
              {
                helpers: false,
                regenerator: true,
              },
            ],
          ],
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(eot|ttf|woff|woff2|otf)$/,
        exclude: /images/,
        use: 'url-loader',
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
              limit: 1024000,
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
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      {
        test: /\.(mp4|webm|mp3)$/,
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
      },
      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      net: false,
      fs: false,
      tls: false,
    },
  },
  performance: {
    maxAssetSize: 7000000,
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
