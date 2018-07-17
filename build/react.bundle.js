import config from './react.config.js'
import webpack from 'webpack'

webpack(config, (error) => {
	if (error) {
		console.log('[Compile ERROR]:', error)
	}
	// TODO 打包结束回调
})
