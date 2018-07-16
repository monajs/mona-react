import reactDom from './ReactDom'
import Util from '../util'
import Constant from '../constant'

export default class ReactUpdater {
	constructor (instance) {
		this.componentInstance = instance
		this.length = this.componentInstance.childrenInstance.length
	}
	
	addList = []
	delList = []
	replaceList = []
	updateList = []
	listChange = []
	listMove = []
	listAdd = []
	listDel = []
	
	// 实例对比
	// 未加载的节点以空节点的形式存在子节点实例中
	// this.componentInstance.length === newInstance.childrenInstance.length
	compareInstance (newInstance) {
		this.componentInstance.childrenInstance.forEach((v, i) => {
			this.compare(v, newInstance.childrenInstance[i])
		})
	}
	
	compare (prev, next) {
		// 两个都是列表
		if (Util.isArray(prev) && Util.isArray(next)) {
			let nextKeys = next.map((v) => {
				return v.key
			})
			let prevObj = {}
			prev.forEach((v, i) => {
				let index = nextKeys.indexOf(v.key)
				if (index < 0) {
					//删除节点
					this.listChange.push({
						type: 'del',
						prevList: prev,
						item: v
					})
					return
				}
				prevObj[v.key] = v
			})
			
			//prevKeys;
			let referKeys = prev.map((v) => {
				return v.key
			})
			let currentInstance
			next.forEach((v, i) => {
				let index = referKeys.indexOf(v.key)
				// if (index === 0) {
				// 	referKeys = referKeys.slice(1)
				// 	return
				// }
				
				if (index < 0) {
					this.listChange.push({
						type: 'add',
						index: i,
						prevList: prev,
						beforeItem: currentInstance,
						item: v
					})
					currentInstance = v
					return
				}
				
				this.listChange.push({
					type: 'move',
					index: i,
					prevList: prev,
					beforeItem: currentInstance,
					item: prevObj[v.key]
				})
				referKeys.splice(index, 1)
				currentInstance = prevObj[v.key]
			})
			return
		}
		// 一个列表一个不是列表
		if ((!Util.isArray(prev) && Util.isArray(next)) || (Util.isArray(prev) && !Util.isArray(next))) {
			return
		}
		
		// 两个空节点 或者相同的文本节点
		if (prev.nodeType === Constant.EMPTY_NODE && next.nodeType === Constant.EMPTY_NODE || prev.currentElement === next.currentElement) {
			return
		}
		
		// 文本节点更新
		if (prev.nodeType === Constant.TEXT_NODE && next.nodeType === Constant.TEXT_NODE) {
			this.replaceList.push({
				prev: prev,
				next: next
			})
		}
		
		// key改变
		if ((prev.key || next.key) && prev.key != next.key) {
			this.delList.push({
				prev: prev,
				next: next
			})
			this.addList.push({
				prev: prev,
				next: next
			})
		}
		
		//添加
		if (prev.nodeType === Constant.EMPTY_NODE && next.nodeType !== Constant.EMPTY_NODE) {
			this.addList.push({
				prev: prev,
				next: next
			})
			return
		}
		
		//删除
		if (next.nodeType === Constant.EMPTY_NODE && prev.nodeType !== Constant.EMPTY_NODE) {
			this.delList.push({
				prev: prev,
				next: next
			})
			return
		}
		
		//类型修改
		if (prev.nodeType != next.nodeType
			|| (prev.nodeType == Constant.REACT_NODE && prev.currentElement.type !== next.currentElement.type)
			|| (prev.childrenInstance && next.childrenInstance && prev.childrenInstance.length != next.childrenInstance.length)
		) {
			this.replaceList.push({
				prev: prev,
				next: next
			})
			return
		}
		
		//更新
		if (!Util.isEqual(next.currentElement.props, prev.currentElement.props)) {
			this.updateList.push({
				prev: prev,
				next: next
			})
		}
	}
	
	clear () {
		this.addList = []
		this.delList = []
		this.replaceList = []
		this.updateList = []
		this.listChange = []
		this.listMove = []
		this.listAdd = []
		this.listDel = []
	}
	
	//获取列表中最后一个原生节点  arrDeep:是否深入数组节点
	getLastNativeNode (list, arrDeep = true) {
		if (!list || list.length === 0) {
			return false
		}
		let lastChild = list[list.length - 1]
		let nativeNode
		
		//数组
		if (Util.isArray(lastChild)) {
			nativeNode = this.getLastNativeNode(lastChild, false)
			if (nativeNode) {
				return nativeNode
			}
		}
		
		//包含子节点
		if (arrDeep && lastChild && lastChild.childrenInstance) {
			nativeNode = this.getLastNativeNode(lastChild.childrenInstance)
			if (nativeNode) {
				return nativeNode
			}
		}
		
		if (lastChild && lastChild.getNativeNode) {
			nativeNode = lastChild.getNativeNode()
			
			if (nativeNode) {
				return nativeNode
			}
		}
		return this.getLastNativeNode(list.slice(0, list.length - 1))
	}
	
	insertAfter (node, instance, index) {
		let clist = instance.childrenInstance
		let maxIndex = clist.length - 1
		let parentNode = instance.parentNode
		
		if (index == 0) {
			reactDom.nodeBefore(node, parentNode)
			return
		}
		if (index < maxIndex) {
			let list = instance.childrenInstance.slice(0, index)
			if (list.length > 0) {
				let lastChild = this.getLastNativeNode(list)
				if (lastChild) {
					reactDom.nodeInsertAfter(node, lastChild)
				} else {
					reactDom.nodeBefore(node, parentNode)
				}
				return
			}
			reactDom.nodeBefore(node, parentNode)
			return
		}
		if (index == maxIndex) {
			reactDom.nodeAfter(node, parentNode)
		}
	}
	
	listUpdate () {
		let clist = this.componentInstance.childrenInstance
		this.listChange.forEach((v) => {
			if (v.type === 'del') {
				let index = v.prevList.indexOf(v.item)
				v.prevList.splice(index, 1)
				reactDom.nodeRemove(v.item.getNativeNode())
				return
			}
			if (v.type === 'add') {
				let node = v.item.mount()
				v.prevList.splice(v.index, 0, v.item)
				if (!v.beforeItem) {
					let index = clist.indexOf(v.prevList)
					this.insertAfter(node, this.componentInstance, index)
				} else {
					reactDom.nodeInsertAfter(node, v.beforeItem.getNativeNode())
				}
				return
			}
			if (v.type === 'move') {
				let node = v.item.getNativeNode()
				let i = v.prevList.indexOf(v.item)
				v.prevList.splice(i, 1)
				v.prevList.splice(v.index, 0, v.item)
				
				if (!v.beforeItem) {
					let index = clist.indexOf(v.prevList)
					this.insertAfter(node, this.componentInstance, index)
				} else {
					reactDom.nodeInsertAfter(node, v.beforeItem.getNativeNode())
				}
			}
		})
	}
	
	run () {
		let clist = this.componentInstance.childrenInstance
		
		//列表更新
		this.listUpdate()
		
		//添加  已考虑数组混合的情况
		this.addList.forEach((v) => {
			let node = v.next.mount()
			let index = clist.indexOf(v.prev)
			this.insertAfter(node, this.componentInstance, index)
			this.componentInstance.childrenInstance.splice(index, 1, v.next)
		})
		
		//更新
		this.updateList.forEach((v) => {
			v.prev.updateComponent(v.next.currentElement)
			v.prev.receiveComponent(v.next)
		})
		
		//替换
		this.replaceList.forEach((v) => {
			let index = clist.indexOf(v.prev)
			let node = v.next.mount()
			this.componentInstance.childrenInstance.splice(index, 1, v.next)
			reactDom.nodeReplace(node, v.prev.getNativeNode())
		})
		
		//删除
		this.delList.forEach((v) => {
			let index = clist.indexOf(v.prev)
			this.componentInstance.childrenInstance.splice(index, 1, v.next)
			reactDom.nodeRemove(v.prev.getNativeNode())
		})
		
		this.clear()
	}
}
