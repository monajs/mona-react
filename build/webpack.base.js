var path = require('path')
var webpack = require('webpack')

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
			'src': path.resolve(__dirname, '../src'),
			'classnames': path.resolve('./node_modules/classnames'),
			'autoprefixer': path.resolve('./node_modules/autoprefixer'),
			'react': path.resolve(__dirname, '../react'),
			'react-dom': path.resolve(__dirname, '../reactDom')
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
