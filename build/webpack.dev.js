const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const config = require('./webpack.base')
const appConf = require('./app.conf')
const webpackServerConf = require('./webpack.server.js')
const webpackServer = require('webpack-dev-server')
const OpenBrowserPlugin = require('open-browser-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

Object.assign(config.output, {
	filename: '[name].js',
	chunkFilename: '[id].js',
	publicPath: '/'
})

config.devtool = 'eval-source-map'

config.entry.app.unshift('webpack-dev-server/client?http://' + appConf.serverName + ':' + appConf.port + '/', 'webpack/hot/dev-server')

config.module.rules = config.module.rules.concat([
	{
		test: /\.(less|css)$/,
		use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
	},
	{
		test: /\.(js|jsx)$/,
		use: ['react-hot-loader', 'babel-loader'],
		exclude: /node_modules/
	}
])

var appWebPath = 'http://' + appConf.serverName + ':' + appConf.port

config.plugins = (config.plugins || []).concat([
	new webpack.HotModuleReplacementPlugin(),
	new webpack.NoEmitOnErrorsPlugin(),
	new ExtractTextPlugin({
		fallback: 'style-loader',
		filename: '[name].css'
	}),
	new HtmlWebpackPlugin({
		filename: 'index.html',
		template: 'src/index.html'
	}),
	// new CopyWebpackPlugin([{
	// 	from: 'src/static',
	// 	to: 'goods'
	// }]),
	
	new webpack.DefinePlugin({
		DEBUG: true
	}),
	new OpenBrowserPlugin({ url: appWebPath })
])

var compiler = webpack(config)
var ws = new webpackServer(compiler, webpackServerConf)
ws.listen(appConf.port, appConf.serverName)


