//创建react 节点
import Constant from '../constant'

class ReactElement {
	//创建react 节点对象
	createElement (type, config, children) {
		const { key, ref, __self, __source, ...eleProps } = config || {}
		
		let props = Object.assign({}, eleProps)
		
		let childrenLength = arguments.length - 2
		if (childrenLength === 1) {
			props.children = children
		} else if (childrenLength > 1) {
			let childArray = []
			for (let i = 0; i < childrenLength; i++) {
				childArray.push(arguments[i + 2])
			}
			props.children = childArray
		}
		if (type && type.defaultProps) {
			props = Object.assign({}, type.defaultProps, props)
		}
		
		return {
			$$typeof: Constant.REACT_ELEMENT_TYPE,
			type: type,
			key: key || null,
			ref: ref || null,
			props: props
		}
	}
	
	cloneElement (element, props) {
		let _props = Object.assign({}, element.props, props)
		return Object.assign({}, element, { props: _props })
	}
}

export default new ReactElement
