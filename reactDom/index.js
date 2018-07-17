import ReactMount from 'react/lib/ReactMount'
import Constant from 'react/constant'

export default class ReactDom {
	version = Constant.VERSION
	render = ReactMount.render
	findDOMNode = ReactMount.findDOMNode
	unmountComponentAtNode = ReactMount.unmountComponentAtNode
}

module.exports = new ReactDom
