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
		this.nodeType = reactDom.getElementType()
		// 节点实例化数据结构
		this.childrenInstance = this.instanceChildren()
		console.log(this.childrenInstance)
	}
	
	// 递归实例化所有节点
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
}
