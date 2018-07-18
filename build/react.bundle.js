const path = require('path')
const fs = require('fs-extra')
const webpack = require('webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const config = {
	cache: true,
	entry: {
		app: ['./react/index.js']
	},
	output: {
		path: path.resolve(__dirname, '../lib'),
		publicPath: '/',
		filename: 'react.min.js'
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		modules: [
			path.resolve(__dirname, '../src')
		],
		alias: {
			'src': path.resolve(__dirname, '../src')
		}
	},
	resolveLoader: {
		modules: ['node_modules']
	},
	plugins: [
		new webpack.DefinePlugin({
			DEBUG: false,
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		new UglifyJSPlugin({
			compress: {
				warnings: false
			}
		}),
		//想看包文件的情况，可以打开
		// new BundleAnalyzerPlugin()
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				use: ['babel-loader'],
				exclude: /node_modules/
			}
		]
	}
}

fs.remove(path.resolve(__dirname, '../assets'))
console.log('react.min.js已删除')
console.log('开始打包')

webpack(config, (err, stats) => {
	console.log(err)
	console.log('打包成功')
	console.log('[webpack]', stats.toString({}))
})
