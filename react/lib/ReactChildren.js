import Util from '../util'

// this.props.children 的值有三种可能：如果当前组件没有子节点，它就是 undefined
// 如果有一个子节点，数据类型是 object
// 如果有多个子节点，数据类型就是 array
// 用作处理React的children
class ReactChildren {
	map (children, fun) {
		return Util.arrayFlat(children).map(fun)
	}
	
	forEach (children, fun) {
		return Util.arrayFlat(children).forEach(fun)
	}
	
	count (children) {
		return Util.arrayFlat(children).length()
	}
	
	only (children) {}
	
	toArray (children) {
		return Util.arrayFlat(children)
	}
}

export default new ReactChildren
