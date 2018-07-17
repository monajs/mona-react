import path from 'path'

export default {
	entry: {
		app: ['../react/index.jsx']
	},
	output: {
		path: path.resolve(__dirname, '../lib'),
		publicPath: '/',
		filename: 'react.min.js'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				use: ['babel-loader'],
				exclude: /node_modules/
			}
		]
	}
}
