import ReactElement from './lib/ReactElement'
import Component from './lib/ReactComponent'
import Children from './lib/ReactChildren'
import Constant from './constant'

class React {
	version = Constant.VERSION
	Component = Component
	Children = Children
	createElement = ReactElement.createElement
}

module.exports = new React
