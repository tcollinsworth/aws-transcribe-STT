const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const fs = require('fs')
const NodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  target: 'web', // 'node12.20', //webpack 5
  devtool: 'inline-source-map',
  entry: {
    mainpage: './src/main.js',
    // TODO share common modules, axios, uuid, etc. with
    // https://webpack.js.org/guides/code-splitting/
    // util: [
    //   // './util/css/html-root.css',
    //   './src/util/alert-modal.js',
    //   './src/util/axios-helper.js',
    //   './src/util/convert-object-to-map.js',
    //   './src/util/error-handlers.js',
    //   './src/util/gql-error-intercept.js',
    //   './src/util/remove-nulls.js',
    //   './src/util/url-helper.js',
    //   './src/util/visibility-helper.js',
    // ]
    // vendor: [
    //   'eventemitter2',
    // ]
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'app/dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(gif|png|jpg|jpeg|svg|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: './[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      // favicon: 'src/main-page/favicon.ico',
      filename: 'index.html',
      template: 'src/index.html',
      chunks: ['vendor', 'mainpage'],
    }),
    new NodePolyfillWebpackPlugin({
      polyfills: [
        'buffer',
      ],
    }),
  ],
  // resolve: {
  //   alias: {
  //     Util: path.resolve(__dirname, 'src/util/'),
  //   },
  // },
  devServer: {
    open: true,
    compress: true,
    host: 'localhost',
    port: 9000,
    hot: true,
    static: path.join(__dirname, 'app/dist'),
    devMiddleware: {
      index: 'index.html',
    },
    // headers: {
    //   "Access-Control-Allow-Origin": "*",
    //   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    //   "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    // },
    https: {
      key: fs.readFileSync('https-test-cert/server.key'),
      cert: fs.readFileSync('https-test-cert/server.crt'),
      ca: fs.readFileSync('https-test-cert/rootCA.pem'),
    },
  },
  performance: { hints: false },
}
