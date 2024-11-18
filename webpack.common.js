'use strict'

const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')
const path = require('path')
const buildPath = path.resolve(__dirname, 'dist')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const NODE_ENV = process.env.NODE_ENV;
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(__dirname, `.env.${NODE_ENV}`) })
const config = require('./src/config')
const { publicUrl } = config()

const common = ['./src/common.js']

const plugins = [
  new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
  new HtmlWebpackPlugin({
    template: './src/index.html',
    chunks: ['main'],
    inject: 'body',
    templateParameters: {
      PUBLIC_URL: publicUrl,
    },
  }),
  new Dotenv({
    path: `./.env.${NODE_ENV}`,
  }),
  // @todo: move to .env
  new webpack.DefinePlugin({
    'process.env.CLIENT_ID': JSON.stringify(process.env.CLIENT_ID),
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.ENABLE_GOOGLE_AUTH': JSON.stringify(process.env.ENABLE_GOOGLE_AUTH),
    'process.env.GTM_ID': JSON.stringify(process.env.GTM_ID),
    'process.env.RINGS': JSON.stringify(process.env.RINGS),
    'process.env.QUADRANTS': JSON.stringify(process.env.QUADRANTS),
    'process.env.ADOBE_LAUNCH_SCRIPT_URL': JSON.stringify(process.env.ADOBE_LAUNCH_SCRIPT_URL),
  }),
]

module.exports = {
  context: __dirname,
  entry: {
    common: common,
  },
  output: {
    path: buildPath,
    publicPath: publicUrl,
    filename: '[name].[contenthash].js',
    assetModuleFilename: 'images/[name][ext]',
    clean: true
  },
  resolve: {
    extensions: ['.js', '.ts'],
    fallback: {
      fs: false,
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico|svg)$/,
        exclude: /node_modules/,
        type: 'asset/resource',
      },
      {
        test: require.resolve('jquery'),
        loader: 'expose-loader',
        options: { exposes: ['$', 'jQuery'] },
      },
    ],
  },

  plugins,

  devServer: {
    port: process.env.PORT || 8000
  },
}
