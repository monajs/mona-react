import ReactMount from 'react/lib/ReactMount'
import Constant from 'react/constant'

export default class ReactDom {
	render = ReactMount.render
	version = Constant.VERSION
}

module.exports = new ReactDom
