import reactDom from './ReactDom'
import Constant from '../constant'
import Util from '../util'
import ValueData from '../data'

export default class ReactInstantiate {
	constructor (element, key) {
		// react节点
		this.currentElement = element
		// 节点唯一key
		this.key = key
		// 节点类型
		this.nodeType = reactDom.getElementType(element)
		// 节点实例化数据结构
		this.childrenInstance = this.instanceChildren()
	}
	
	// 递归实例化所有节点，忽略react组件节点
	instanceChildren () {
		if (this.nodeType === Constant.EMPTY_NODE || this.nodeType === Constant.TEXT_NODE || !this.currentElement.props || !this.currentElement.props.children) {
			return
		}
		
		let child = Util.toArray(this.currentElement.props.children)
		let childrenInstance = []
		// 为每一个节点添加唯一key
		child.forEach((v, i) => {
			let key = null
			if (null !== v && typeof v === 'object' && v.key) {
				key = '__@_' + v.key
			}
			if (Util.isArray(v)) {
				let c = []
				v.forEach((item, index) => {
					let itemKey = '__$_' + i + '_' + index
					if (null !== v && typeof v === 'object') {
						if (!item.key) {
							console.error(ValueData.keyNeedMsg)
						} else {
							itemKey = '__@_' + i + '_' + item.key
						}
					}
					c.push(new ReactInstantiate(item, itemKey))
				})
				childrenInstance.push(c)
			} else {
				childrenInstance.push(new ReactInstantiate(v, key))
			}
		})
		return childrenInstance
	}
	
	// 挂载节点
	mount (parentNode) {
		if (this.nodeType === Constant.EMPTY_NODE) {
			return null
		}
		
		if (this.nodeType === Constant.REACT_NODE) {
			let componentObj = new this.currentElement.type(this.currentElement.props)
			// 获取react render()出来的真实节点信息
			let componentElement = componentObj.render()
			if (!componentElement) {
				return null
			}
			// component实例
			this.componentObj = componentObj
			this.componentElement = componentElement
			// 监听setState方法
			this.componentObj.__events.on('stateChange', () => {
				// this.receiveComponent()
				// TODO
			})
			this.componentInstance = new ReactInstantiate(componentElement, null)
			return this.componentInstance.mount(parentNode)
		}
		
		if (!this.nativeNode) {
			this.nativeNode = reactDom.create(this.currentElement)
			// 事件绑定
			// TODO
			if (parentNode) {
				this.parentNode = parentNode
				parentNode.appendChild(this.nativeNode)
			}
		}
		
		this.nativeNode['__reactInstance'] = {
			_currentElement: this.currentElement
		}
		
		this.mountChildren(this.nativeNode)
		return this.nativeNode
	}
	
	// 挂载子节点
	mountChildren (parentNode) {
		if (!this.childrenInstance || this.childrenInstance.length === 0) {
			return
		}
		this.childrenInstance.forEach((v) => {
			if (Util.isArray(v)) {
				v.forEach((child) => {
					child.mount(parentNode)
				})
			} else {
				console.log(parentNode)
				v.mount(parentNode)
			}
		})
	}
}
