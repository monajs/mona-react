import ReactElement from './lib/ReactElement'
import Component from './lib/ReactComponent'
import Children from './lib/ReactChildren'
import Constant from './constant'

class React {
	env = 'production'
	VERSION = Constant.VERSION
	Component = Component
	Children = Children
	createElement = ReactElement.createElement
	cloneElement = ReactElement.cloneElement
	
	setEnv (env) {
		this.env = env
	}
}

module.exports = new React
