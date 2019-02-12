import ReactMount from 'react/lib/ReactMount'

export default class ReactDom {
	render = ReactMount.render
	findDOMNode = ReactMount.findDOMNode
	unmountComponentAtNode = ReactMount.unmountComponentAtNode
}

module.exports = new ReactDom
