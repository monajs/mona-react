import ReactElement from './lib/ReactElement'
import Component from './lib/ReactComponent'
import Constant from './constant'

class React {
	version = Constant.VERSION
	Component = Component
	createElement = ReactElement.createElement;
}

module.exports = new React
