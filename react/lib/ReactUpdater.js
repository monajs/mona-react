import Constant from '../constant'
import reactDom from './ReactDom'
import ReactInstantiate from './ReactInstantiate'
import Util from '../util'

//更新类型
let UPDATE_TYPES = {
	MOVE: 1,
	REMOVE: 2,
	INSERT: 3,
	REPLACE: 4,
	UPDATE: 5
}

export default class ReactUpdater {
	changeList = []
	hasChange = false
	
	constructor (instance) {
		this.instance = instance
	}
	
	clear () {
		this.changeList = []
	}
	
	// 节点对比
	// 返回节点对比结果
	compare (newInstance) {
		
		let childrenChange = false
		let selfChange = this.compareInstance(this.instance, newInstance)
		let nodeType = this.instance.nodeType
		this.isReactNode = nodeType == Constant.REACT_NODE
		
		if ((!selfChange || selfChange == 'update') && (nodeType == Constant.NATIVE_NODE || this.isReactNode)) {
			
			if (this.listCompare(this.instance.childrenInstance, newInstance.childrenInstance)) {
				childrenChange = true
			}
		}
		if (this.isReactNode && childrenChange && !selfChange) {
			this.changeList.push({
				prev: this.instance,
				next: newInstance,
				type: UPDATE_TYPES.UPDATE
			})
		}
		this.hasChange = selfChange || childrenChange
		return this.hasChange
	}
	
	// 节点对比
	// 处理节点变更数组
	compareInstance (prev, next, list) {
		if (!prev && !next) {
			return
		}
		
		// 两个空节点 或者相同的文本节点
		if (prev.nodeType === Constant.EMPTY_NODE && next.nodeType === Constant.EMPTY_NODE || prev.currentElement === next.currentElement) {
			return false
		}
		
		let updater = {
			isSelf: true,
			list: list,
			prev: prev,
			next: next,
			type: UPDATE_TYPES.REPLACE
		}
		
		// 删除或添加，可认为是节点的替换
		if (prev.nodeType === Constant.EMPTY_NODE || next.nodeType === Constant.EMPTY_NODE) {
			this.changeList.push({
				...updater
			})
			return 'replace'
		}
		
		//文本节点更新
		if (prev.nodeType === Constant.TEXT_NODE && next.nodeType === Constant.TEXT_NODE && prev.currentElement !== next.currentElement) {
			this.changeList.push({
				...updater
			})
			return 'replace'
		}
		
		//修改key
		if ((prev.key || next.key) && prev.key !== next.key) {
			this.changeList.push({
				...updater
			})
			return 'replace'
		}
		
		//类型修改
		if (prev.nodeType !== next.nodeType || (prev.currentElement.type !== next.currentElement.type)
		) {
			this.changeList.push({
				...updater
			})
			return 'replace'
		}
		
		//节点更新
		if (this.updateCheck(prev, next, list)) {
			return 'update'
		}
		
		return false
	}
	
	// list 节点对比
	listCompare (prev, next) {
		if (!prev && !next) {
			return false
		}
		let hasChange = false
		let nextObj = {}
		let prevObj = {}
		
		let nextKeys = next.map((v) => {
			nextObj[v.key] = v
			return v.key
		})
		
		let prevReferKeys = []
		let prevKeys = []
		prev.forEach((v) => {
			prevObj[v.key] = v
			prevKeys.push(v.key)
			
			//移除
			if (nextKeys.indexOf(v.key) < 0) {
				hasChange = true
				this.changeList.push({
					list: prev,
					prev: v,
					type: UPDATE_TYPES.REMOVE
				})
				return
			}
			prevReferKeys.push(v.key)
		})
		let currentInstance
		next.forEach((v) => {
			//未变
			let index = prevReferKeys.indexOf(v.key)
			if (index === 0) {
				let arrL = 0
				arrL += Util.isArray(prevObj[v.key]) ? 1 : 0
				arrL += Util.isArray(v) ? 1 : 0
				
				if (arrL === 2) {
					if (this.listCompare(prevObj[v.key], v)) {
						hasChange = true
					}
				} else if (arrL === 1) {
					this.changeList.push({
						list: prev,
						prev: prevObj[v.key],
						next: v,
						type: UPDATE_TYPES.REPLACE
					})
					hasChange = true
				} else {
					//component对比
					if (prevObj[v.key].compareComponent(v)) {
						hasChange = true
					}
				}
				prevReferKeys = prevReferKeys.slice(1)
				currentInstance = prevObj[v.key]
				return
			}
			
			//新增
			if (prevKeys.indexOf(v.key) < 0) {
				
				this.changeList.push({
					list: prev,
					next: v,
					beforeItem: currentInstance,
					type: UPDATE_TYPES.INSERT
				})
				currentInstance = v
				hasChange = true
				
				return
			}
			
			//移动
			this.changeList.push({
				type: UPDATE_TYPES.MOVE,
				list: prev,
				prev: prevObj[v.key],
				beforeItem: currentInstance
			})
			
			if (Util.isArray(prevObj[v.key]) && Util.isArray(v)) {
				if (this.listCompare(prevObj[v.key], v)) {
					hasChange = true
				}
			} else if (Util.isArray(prevObj[v.key])) {
				this.changeList.push({
					list: prev,
					prev: prevObj[v.key],
					next: v,
					type: UPDATE_TYPES.REPLACE
				})
				hasChange = true
			} else {
				//component对比
				if (prevObj[v.key].compareComponent(v)) {
					hasChange = true
				}
			}
			
			hasChange = true
			
			prevReferKeys.splice(index, 1)
			currentInstance = prevObj[v.key]
		})
		return hasChange
	}
	
	//更新检测
	updateCheck (prev, next, list) {
		let prevProps = Object.assign({}, prev.currentElement.props)
		let nextProps = Object.assign({}, next.currentElement.props)
		delete(prevProps.children)
		delete(nextProps.children)
		
		let propsChange = !Util.isEqual(nextProps, prevProps)
		//更新
		if (propsChange) {
			this.changeList.push({
				isSelf: true,
				list: prev,
				prev: prev,
				next: next,
				type: UPDATE_TYPES.UPDATE
			})
			
			return true
		}
		return false
		
	}
	
	getLastIWithNode (list) {
		if (list.length === 0) {
			return false
		}
		let lastI = list[list.length - 1]
		let node = lastI.getNativeNode()
		if (node) {
			return lastI
		}
		return this.getLastIWithNode(list.slice(0, list.length - 1))
	}
	
	getFlatChildrenInstance (instance) {
		return this.getChildrenInstance(instance.childrenInstance)
	}
	
	getChildrenInstance (child) {
		if (!child) {
			return []
		}
		let li = []
		child.forEach((v) => {
			if (Util.isArray(v)) {
				li = li.concat(this.getChildrenInstance(v))
			} else {
				li.push(v)
			}
		})
		return li
	}
	
	getLastNode (list, beforeItem) {
		let flatChild
		if (beforeItem) {
			let beforeNode = beforeItem.getNativeNode()
			if (beforeNode) {
				return {
					beforeNode: beforeNode
				}
			}
			let l = list.slice(0, list.indexOf(beforeItem))
			let child = this.getChildrenInstance(l)
			let ins = this.getLastIWithNode(child)
			
			if (!ins && list.parentList) {
				ins = this.getLastIWithNode(this.getChildrenInstance(list.parentList))
			}
			if (ins) {
				return {
					beforeNode: ins.getNativeNode()
				}
			}
			return {
				parentNode: beforeItem.parentNode
			}
		} else {
			//创建临时item
			let tempListItem = { temp: '' }
			list.unshift(tempListItem)
			let child = this.getFlatChildrenInstance(this.instance)
			flatChild = child.slice(0, child.indexOf(tempListItem))
			list.shift()
		}
		let lastinstance = this.getLastIWithNode(flatChild)
		
		if (!lastinstance) {
			return {
				parentNode: this.instance.getNativeNode()
			}
		}
		return {
			beforeNode: lastinstance.getNativeNode()
		}
	}
	
	//插入到index最后节点
	insertAfter (node, beforeItem, list) {
		let beforeInfo = this.getLastNode(list, beforeItem)
		
		if (beforeInfo.beforeNode) {
			reactDom.nodeInsertAfter(node, beforeInfo.beforeNode)
			return beforeInfo.beforeNode.parentNode
		}
		if (beforeInfo.parentNode) {
			reactDom.nodeBefore(node, beforeInfo.parentNode)
			return beforeInfo.parentNode
		}
	}
	
	renderInsertChange () {
		this.insertList.forEach((v) => {
			if (!v.list) {
				v.list = v.prev.parentList
			}
			
			let nodeChange = v.isSelf || !this.isReactNode
			if (v.next.nodeType !== Constant.EMPTY_NODE && nodeChange) {
				let child = ReactInstantiate.mountChildren(v.next)
				let parentNode = this.insertAfter(child, v.beforeItem, v.list)
				ReactInstantiate.childrenMountComplete(v.next, parentNode)
			}
			if (v.next.nodeType === Constant.EMPTY_NODE) {
				v.next.parentNode = this.instance.getNativeNode()
			}
			
			v.next.parentList = v.list
			if (v.beforeItem) {
				let index = v.list.indexOf(v.beforeItem)
				v.list.splice(index + 1, 0, v.next)
			} else {
				v.list.unshift(v.next)
			}
		})
	}
	
	renderUpdateList () {
		this.updateList.forEach((v) => {
			v.prev.updateComponent(v.next)
		})
	}
	
	renderMoveList () {
		this.moveList.forEach((v) => {
			if (!v.list) {
				v.list = v.prev.parentList
			}
			
			if (v.isSelf || !this.isReactNode) {
				let node = v.prev.getNativeNode()
				if (node) {
					this.insertAfter(node, v.beforeItem, v.list)
				}
			}
			
			let prevIndex = v.list.indexOf(v.prev)
			v.list.splice(prevIndex, 1)
			
			v.prev.parentList = v.list
			if (v.beforeItem) {
				let index = v.list.indexOf(v.beforeItem)
				v.list.splice(index, 0, v.prev)
			} else {
				v.list.unshift(v.prev)
			}
		})
	}
	
	renderRemoveList () {
		this.removeList.forEach((v) => {
			if (!v.list) {
				v.list = v.prev.parentList
			}
			if (v.isSelf || !this.isReactNode) {
				if (Util.isArray(v.prev)) {
					ReactInstantiate.unmountChildren(v.prev)
				} else {
					v.prev.willUnmount()
					let prevNode = v.prev.getNativeNode()
					if (prevNode) {
						reactDom.nodeRemove(prevNode)
					}
					v.prev.unmount()
				}
			}
			
			let index = v.list.indexOf(v.prev)
			v.list.splice(index, 1)
		})
	}
	
	//react节点的render更新,貌似只有替换节点的情况,其他的都是更新，其中删除或添加也算是替换
	reactComponentChange (v) {
		v.prev.parentInstance.componentInstance = v.next
		if (v.next.nodeType !== Constant.EMPTY_NODE) {
			let child = ReactInstantiate.mountChildren(v.next)
			v.prev.parentInstance.parentNode.appendChild(child)
			ReactInstantiate.childrenMountComplete(v.next, v.prev.parentInstance.parentNode)
		}
		if (v.prev.nodeType !== Constant.EMPTY_NODE) {
			v.prev.willUnmount()
			let prevNode = v.prev.getNativeNode()
			if (prevNode) {
				reactDom.nodeRemove(prevNode)
			}
			v.prev.unmount()
		}
	}
	
	renderReplaceList () {
		this.replaceList.forEach((v) => {
			if (!v.list) {
				v.list = v.prev.parentList
			}
			if (!v.list && v.prev.parentInstance) {
				return this.reactComponentChange(v)
			}
			
			if (v.next.nodeType !== Constant.EMPTY_NODE && (v.isSelf || !this.isReactNode)) {
				let child = ReactInstantiate.mountChildren(v.next)
				let parentNode = this.insertAfter(child, v.prev, v.list)
				ReactInstantiate.childrenMountComplete(v.next, parentNode)
			}
			if (v.next.nodeType === Constant.EMPTY_NODE) {
				v.next.parentNode = v.prev.parentNode
			}
			v.next.parentList = v.list
			let prevIndex = v.list.indexOf(v.prev)
			v.list.splice(prevIndex, 0, v.next)
			this.removeList.push({
				isSelf: v.isSelf,
				list: v.list,
				prev: v.prev,
				next: v.next
			})
		})
	}
	
	//渲染更新
	renderChange () {
		
		if (this.changeList.length === 0) {
			return
		}
		this.moveList = []
		this.removeList = []
		this.insertList = []
		this.updateList = []
		this.replaceList = []
		
		this.changeList.forEach((v) => {
			v.type === UPDATE_TYPES.MOVE && this.moveList.push(v)
			v.type === UPDATE_TYPES.REMOVE && this.removeList.push(v)
			v.type === UPDATE_TYPES.INSERT && this.insertList.push(v)
			v.type === UPDATE_TYPES.UPDATE && this.updateList.push(v)
			v.type === UPDATE_TYPES.REPLACE && this.replaceList.push(v)
		})
		
		this.renderInsertChange()
		this.renderUpdateList()
		this.renderMoveList()
		this.renderReplaceList()
		this.renderRemoveList()
	}
	
	runChildren (child) {
		if (Util.isArray(child)) {
			child.forEach((v) => {
				this.runChildren(v)
			})
		} else {
			child && child.reactUpdater && child.reactUpdater.run()
		}
	}
	
	//执行更新
	run () {
		this.renderChange()
		if (this.instance.nodeType !== Constant.REACT_NODE) {
			this.runChildren(this.instance.childrenInstance)
		}
		this.clear()
	}
}
