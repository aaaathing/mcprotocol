// npx webpack --config nosyncfiles/mcprotocol/webpack.config.js

const path = require('path');
const webpack = require('webpack');

module.exports = {
  //This property defines where the application starts
  entry:'./nosyncfiles/mcprotocol/index.js',

  //This property defines the file path and the file name which will be used for deploying the bundled file
  output:{
    path: path.join(__dirname, '/dist'),
    filename: 'mcProtocol.js'
  },

	performance: {
    maxEntrypointSize: 1.5e6,
    maxAssetSize: 1.5e6
  },

  //Setup loaders
  module: {
    rules: [
			{
				test: /\.m?js/,
				resolve: {
					fullySpecified: false
				}
			},
    ],
  },
	optimization: {
		minimize: false
 	},

	resolve:{
		alias:{
			express: false,
			fs: 'memfs',
      net: path.resolve(__dirname, 'vendor/browser.js'),
		},
		fallback: {
      zlib: require.resolve('browserify-zlib'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      events: require.resolve('events/'),
      assert: require.resolve('assert/'),
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      constants: require.resolve('constants-browserify'),
      os: require.resolve('os-browserify/browser'),
      http: require.resolve('http-browserify'),
      https: require.resolve('https-browserify'),
      timers: require.resolve('timers-browserify'),
      child_process: false,
      perf_hooks: path.resolve(__dirname, 'vendor/perf_hooks_replacement.js'),
      dns: path.resolve(__dirname, 'vendor/dns.js'),
      process: path.join(__dirname, 'vendor/process.js'),
			"vm": require.resolve("vm-browserify"),
			"querystring": require.resolve("querystring-es3"),
    }
	},

  // Setup plugin to use a HTML file for serving bundled js files
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /minecraft-data\/data.js$/,
      path.resolve(__dirname, 'asyncdata.js')
    ),
		new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
		new webpack.ProvidePlugin({
			Buffer: ['buffer', 'Buffer'],
		}),
  ]
}

// 