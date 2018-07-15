import Util from '../util'
import Constant from '../constant'

// 只包含原生节点的创建
// react节点在实例化后返回原生节点
// 提供节点类型判断
class ReactDom {
	create (element) {
		if (this.isEmptyNode(element)) {
			return this.createEmptyNode(element)
		}
		// 文本节点
		if (this.isTextNode(element)) {
			return this.createTextNode(element)
		}
		// 浏览器节点
		if (this.isNativeNode(element)) {
			return this.createNode(element)
		}
	}
	
	// 按照渲染方式的不同划分为四种类型
	getElementType (element) {
		if (this.isEmptyNode(element)) {
			return Constant.EMPTY_NODE
		}
		// 文本节点
		if (this.isTextNode(element)) {
			return Constant.TEXT_NODE
		}
		// 浏览器节点
		if (this.isNativeNode(element)) {
			return Constant.NATIVE_NODE
		}
		// react节点
		if (this.isReactNode(element)) {
			return Constant.REACT_NODE
		}
	}
	
	isNativeNode (element) {
		return typeof element === 'object' && typeof element.type === 'string'
	}
	
	isTextNode (element) {
		return typeof element === 'string' || typeof element === 'number'
	}
	
	isEmptyNode (element) {
		return element === null || element === false
	}
	
	isReactNode (element) {
		return typeof element === 'object' && typeof element.type === 'function'
	}
	
	createEmptyNode () {
		return null
	}
	
	// 文本节点
	createTextNode (element) {
		let node = document.createTextNode(element)
		return node
	}
	
	// 原生节点
	createNode (element) {
		let node = document.createElement(element.type.toLowerCase())
		return node
	}
	
	// 加到父节点最前
	nodeBefore (newEl, parentEl) {
		let firstChild = parentEl.firstChild
		if (firstChild) {
			this.nodeInsertBefore(newEl, firstChild)
		} else {
			parentEl.appendChild(newEl)
		}
	}
	
	// 加到父节点最后
	nodeAfter (newEl, parentEl) {
		parentEl.appendChild(newEl)
	}
	
	// 节点删除
	nodeRemove (oldEl) {
		let parentEl = oldEl.parentNode
		parentEl.removeChild(oldEl)
	}
	
	// 节点替换
	nodeReplace (newEl, oldEl) {
		let parentEl = oldEl.parentNode
		parentEl.replaceChild(newEl, oldEl)
	}
	
	// 节点插入节点前
	nodeInsertBefore (newEl, targetEl) {
		let parentEl = targetEl.parentNode
		parentEl.insertBefore(newEl, targetEl)
	}
	
	// 节点插入节点后
	nodeInsertAfter (newEl, targetEl) {
		let parentEl = targetEl.parentNode
		if (parentEl.lastChild == targetEl) {
			parentEl.appendChild(newEl)
		} else {
			parentEl.insertBefore(newEl, targetEl.nextSibling)
		}
	}
	
}

export default new ReactDom
