const chalk = require('chalk')
require('console.table')
const fs = require('fs')
const path = require('path')
const deepExtend = require('deep-extend')

function log (message = '', type, timestamp = true) {
	const date = new Date()
	const hours = date.getHours()
	const minutes = date.getMinutes()
	const seconds = date.getSeconds()
	
	console.log(timestamp ? chalk.gray(`[${hours}:${minutes}:${seconds}]`) : '', type ? chalk[type](message) : message)
}

log.success = (message) => {
	log(message, 'green')
}

log.error = (message, error) => {
	log(message, 'red')
	error && console.error(error)
}

log.info = (message) => {
	log(message, 'yellow')
}

log.line = (num = 1) => {
	console.log(' '.padEnd(num, '\n'))
}

log.table = (list) => {
	list = list.map(item => {
		let firstKey = true
		for (const key in item) {
			if (firstKey) {
				item[key] = chalk.cyan(item[key])
			} else {
				item[key] = chalk.gray(item[key])
			}
			firstKey = false
		}
		
		return item
	})
	console.table(list)
}

// 获取配置
function getConfig (configPath) {
	try {
		fs.accessSync(configPath, fs.constants.F_OK | fs.constants.W_OK)
	} catch (error) {
		return {}
	}
	return require(configPath)
}

module.exports = {
	log,
	getConfig,
	// 保存配置
	saveConfig (config, configPath) {
		let originalConfig = getConfig(configPath)
		config = deepExtend(originalConfig, config)
		const stream = fs.createWriteStream(configPath)
		stream.end(JSON.stringify(config, null, '  '))
	}
}
