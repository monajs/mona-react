const path = require('path')
const webpack = require('webpack')

module.exports = {
	cache: true,
	entry: {
		app: ['./src/app.jsx']
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		publicPath: '/',
		filename: '[name].js'
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		modules: [
			path.resolve(__dirname, '../node_modules'),
			path.resolve(__dirname, '../src')
		],
		alias: {
			'react': path.resolve(__dirname, '../react')
		}
	},
	resolveLoader: {
		modules: ['node_modules']
	},
	plugins: [
		new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/)
	],
	module: {
		rules: []
	}
}
