const { merge } = require('webpack-merge')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssPresetEnv = require('postcss-preset-env')
const cssnano = require('cssnano')

const common = require('./webpack.common.js')
const { graphConfig, uiConfig } = require('./src/graphing/config')

const config = require('./src/config')
const { publicUrl } = config()

const main = ['./src/site.js']
const scssVariables = [`$publicUrl: '${publicUrl}';`]

Object.entries(graphConfig).forEach(function ([key, value]) {
  scssVariables.push(`$${key}: ${value}px;`)
})

Object.entries(uiConfig).forEach(function ([key, value]) {
  scssVariables.push(`$${key}: ${value}px;`)
})

module.exports = merge(common, {
  mode: 'production',
  entry: { main },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { importLoaders: 1, modules: 'global', url: false },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  postcssPresetEnv({ browsers: 'last 2 versions' }),
                  cssnano({
                    preset: ['default', { discardComments: { removeAll: true } }],
                  }),
                ],
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              additionalData: scssVariables.join('\n'),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.ENVIRONMENT': JSON.stringify('production'),
    }),
  ],
})
