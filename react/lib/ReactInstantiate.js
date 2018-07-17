import reactDom from './ReactDom'
import ReactUpdater from './ReactUpdater'
import Constant from '../constant'
import Util from '../util'
import ValueData from '../data'

export default class ReactInstantiate {
	constructor (element, key, owner) {
		// react节点
		this.currentElement = element
		// 节点唯一key
		this.key = key
		// 节点类型
		this.nodeType = reactDom.getElementType(element)
		if (this.nodeType === Constant.REACT_NODE || this.nodeType === Constant.NATIVE_NODE) {
			!this.currentElement._owner && (this.currentElement._owner = owner)
			
			// TODO 优化合并到instanceChildren中去
			if (this.currentElement.props.children) {
				this.currentElement.props.children = Util.toArray(this.currentElement.props.children)
				this.currentElement.props.children.forEach((v, i) => {
					if (null !== v && typeof v === 'object') {
						if (!v._owner) {
							v._owner = owner
						}
						v.key = v.key ? v.key : i + ''
					}
				})
			}
			
			const child = Util.toArray(this.currentElement.props.children)
			// 节点实例化数据结构
			this.childrenInstance = this.instanceChildren(child, owner)
		}
	}
	
	// 递归实例化所有节点，忽略react组件节点
	instanceChildren (children, owner) {
		let childrenInstance = []
		// 为每一个节点添加唯一key
		
		const uniqueChild = this.checkChildren(children)
		uniqueChild && (children = uniqueChild)
		children.forEach((v, i) => {
			let key = '$mona_' + i
			if (null !== v && typeof v === 'object' && v.key) {
				key = v.key
			}
			
			if (Util.isArray(v)) {
				let cIns = this.instanceChildren(v, owner)
				cIns.parentList = childrenInstance
				cIns.parentInstance = this
				cIns.key = key
				childrenInstance.push(cIns)
			} else {
				let cIns = new ReactInstantiate(v, key)
				cIns.parentList = childrenInstance
				cIns.parentInstance = this
				childrenInstance.push(cIns)
			}
		})
		
		return childrenInstance
	}
	
	// 检查children中key的唯一性
	// 返回去重的带唯一key的数组
	checkChildren (children) {
		let childrenList = Util.getUniqueList(children)
		if (childrenList.length === children.length) {
			return
		}
		console.error(ValueData.keyNeedMsg)
		return childrenList
	}
	
	// 挂载节点
	// 返回生成的dom信息
	mount (parentNode) {
		if (this.nodeType === Constant.EMPTY_NODE) {
			return null
		}
		
		if (this.nodeType === Constant.REACT_NODE) {
			this.nativeNode = this.mountComponent()
			if (parentNode) {
				this.nativeNode && parentNode.appendChild(this.nativeNode)
				this.mountComplete(parentNode)
			}
			return this.nativeNode
		}
		
		// 实例未被创建成浏览器节点
		if (!this.nativeNode) {
			this.nativeNode = reactDom.create(this.currentElement)
			// 将react的节点属性转化成原生识别的节点属性
			if (this.nodeType === Constant.NATIVE_NODE && this.currentElement.props) {
				reactDom.parse(this.nativeNode, this.currentElement.props)
			}
			this.refToOwner(this)
		}
		
		this.nativeNode['__reactInstance'] = {
			_currentElement: this.currentElement,
			_instance: this
		}
		
		// 创建子节点nativeNode并插入父级节点
		if (this.childrenInstance && this.childrenInstance.length > 0) {
			let children = ReactInstantiate.mountChildren(this.childrenInstance)
			children && this.nativeNode.appendChild(children)
		}
		
		if (parentNode) {
			this.nativeNode && parentNode.appendChild(this.nativeNode)
			// 挂载结束
			this.mountComplete(parentNode)
		}
		
		return this.nativeNode
	}
	
	// 挂载component
	// 返回component对应的dom信息
	mountComponent () {
		this.componentObj = new this.currentElement.type(this.currentElement.props)
		// componentDidMount生命周期钩子函数执行点
		this.componentObj.componentWillMount && this.componentObj.componentWillMount()
		
		// component对应的虚拟节点dom
		const componentElement = this.componentObj.render()
		
		this.componentObj._reactInternalInstance = this
		
		this._instance = this.componentObj // 存储节点_owner
		
		// 获取虚拟节点对应的实例对象
		this.componentInstance = new ReactInstantiate(componentElement, null, this)
		this.componentInstance.parentInstance = this
		// 节点挂载
		const nativeNode = this.componentInstance.mount()
		
		this.refToOwner(this)
		return nativeNode
	}
	
	// 挂载子节点
	// 返回子节点实例的nativeNode
	static mountChildren (children) {
		if (!children) {
			return
		}
		if (!Util.isArray(children)) {
			return children.mount()
		}
		// 创建临时虚拟节点
		let virtualDom = document.createDocumentFragment()
		children.forEach((v) => {
			if (Util.isArray(v)) {
				const node = ReactInstantiate.mountChildren(v)
				virtualDom.appendChild(node)
			} else {
				const node = v.mount()
				node && virtualDom.appendChild(node)
			}
		})
		return virtualDom
	}
	
	// 挂载结束后的执行函数
	// 更改挂载状态
	// 执行生命周期钩子函数
	mountComplete (parentNode) {
		this.parentNode = parentNode
		// 挂载完成的状态
		this.hasMount = true
		if (this.nodeType === Constant.REACT_NODE) {
			this.componentInstance.mountComplete(parentNode)
			// componentDidMount生命周期钩子函数执行点
			this.componentObj.componentDidMount && this.componentObj.componentDidMount()
		} else {
			ReactInstantiate.childrenMountComplete(this.childrenInstance, this.nativeNode)
		}
	}
	
	// 递归通知子节点更改挂载结束的状态
	// 执行子节点生命周期钩子函数
	static childrenMountComplete (children, parentNode) {
		if (!children) {
			return
		}
		if (!Util.isArray(children)) {
			return children.mountComplete(parentNode)
		}
		if (children.length === 0) {
			return
		}
		children.forEach((v) => {
			if (Util.isArray(v)) {
				children.parentNode = parentNode
				ReactInstantiate.childrenMountComplete(v, parentNode)
			} else {
				v.mountComplete(parentNode)
			}
		})
	}
	
	// 获取原生的节点
	getNativeNode () {
		if (this.componentInstance) {
			return this.componentInstance.getNativeNode()
		}
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
				v.mount(parentNode)
			}
		})
	}
	
	//卸载节点
	static unmountChildren (child) {
		child.forEach((v) => {
			if (Util.isArray(v)) {
				ReactInstantiate.unmountChildren(v)
			} else {
				v.willUnmount()
				let node = v.getNativeNode()
				if (node) {
					reactDom.nodeRemove(node)
				}
				v.unmount()
			}
		})
	}
	
	//将子元素转为一维数组
	static deepReactChild (child, fun) {
		if (!child) {
			return
		}
		if (!Util.isArray(child) && child.nodeType === Constant.REACT_NODE) {
			return fun(child)
		}
		if (child.length === 0) {
			return
		}
		child.forEach((v) => {
			if (Util.isArray(v)) {
				ReactInstantiate.deepReactChild(v, fun)
			} else {
				return fun(v)
			}
		})
	}
	
	willUnmount () {
		if (this.componentObj && this.componentObj.componentWillUnmount) {
			this.componentObj.componentWillUnmount()
		}
		this.childWillUnmount()
	}
	
	childWillUnmount () {
		if (this.componentInstance) {
			this.componentInstance.willUnmount()
		} else {
			ReactInstantiate.deepReactChild(this.childrenInstance, (v) => {
				v.willUnmount()
			})
		}
	}
	
	//卸载节点信息,事件消息等
	unmount () {
		if (this.nodeType === Constant.REACT_NODE || this.nodeType === Constant.NATIVE_NODE) {
			if (this.currentElement.ref && this.currentElement._owner) {
				let ownerObj = this.currentElement._owner.componentObj
				let oldRef = ownerObj.refs[this.currentElement.ref]
				let nodeOrI = this.componentObj || this.nativeNode
				if (oldRef && oldRef === nodeOrI) {
					delete(ownerObj.refs[this.currentElement.ref])
				}
			}
		}
		if (this.componentInstance) {
			this.componentInstance.unmount()
		} else {
			ReactInstantiate.deepReactChild(this.childrenInstance, (v) => {
				v.unmount()
			})
		}
	}
	
	// 识别节点的ref属性, 并返回dom信息
	// 是react节点的化返回component实例信息，否则返回节点原生信息
	refToOwner (instance) {
		if ((instance.nodeType === Constant.REACT_NODE || instance.nodeType === Constant.NATIVE_NODE )
			&& instance.currentElement.ref && instance.currentElement._owner) {
			let ownerObj = instance.currentElement._owner.componentObj
			
			ownerObj.refs = ownerObj.refs || {}
			ownerObj.refs[instance.currentElement.ref] = instance.componentObj || instance.nativeNode
		}
	}
	
	// native节点更新
	updateComponent (next) {
		// 更新提示
		if (this.componentObj && this.componentObj.componentWillReceiveProps) {
			this.componentObj.componentWillReceiveProps(next.currentElement.props)
		}
		let prevProps = this.currentElement.props
		if (this.nodeType === Constant.REACT_NODE) {
			// componentWillUpdate生命周期钩子函数执行点
			this.componentObj.componentWillUpdate && this.componentObj.componentWillUpdate(next.currentElement.props)
			
			this.currentElement.props = next.currentElement.props
			this.childrenInstance = next.childrenInstance
			this.componentObj.props = this.currentElement.props
			
			let hasChange = this.receiveComponent()
			// componentDidMount生命周期钩子函数执行点
			this.componentObj.componentDidUpdate && this.componentObj.componentDidUpdate(prevProps)
		} else {
			this.currentElement.props = next.currentElement.props
			reactDom.propsChange(this.nativeNode, prevProps, this.currentElement.props)
		}
	}
	
	//节点对比
	compareComponent (newInstance) {
		!this.reactUpdater && (this.reactUpdater = new ReactUpdater(this))
		this.reactUpdater.clear()
		return this.reactUpdater.compare(newInstance)
	}
	
	//存储渲染回调
	receiveComponentCallbacks = []
	
	//节点diff
	receiveComponent (newInstance, callback) {
		if (this.nodeType === Constant.REACT_NODE && !this.hasMount) {
			return
		}
		if (this.componentObj && Util.isFun(this.componentObj.shouldcomponentupdate) && !this.componentObj.shouldcomponentupdate()) {
			return
		}
		
		if (Util.isFun(callback)) {
			this.receiveComponentCallbacks.push(callback)
		}
		
		//react节点检测更新
		if (!newInstance && this.nodeType === Constant.REACT_NODE) {
			
			let element = this.componentObj.render()
			let newComponentInstance = new ReactInstantiate(element, null, this)
			return this.componentInstance.receiveComponent(newComponentInstance, callback)
		}
		let hasChange = this.compareComponent(newInstance)
		
		if (hasChange) {
			this.reactUpdater.run()
		}
		this.receiveComponentCallbacks.forEach(v => v)
		this.receiveComponentCallbacks = []
		return hasChange
	}
}
