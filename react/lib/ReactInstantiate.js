import reactDom from './ReactDom'
import ReactUpdater from './ReactUpdater'
import Constant from '../constant'
import Util from '../util'

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
	instanceChildren (child, owner) {
		let childrenInstance = []
		// 为每一个节点添加唯一key
		child.forEach((v, i) => {
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
	
	// 节点检查，适用react节点
	receiveComponent (newInstance) {
		if (this.componentObj && Util.isFun(this.componentObj.shouldcomponentupdate) && !this.componentObj.shouldcomponentupdate()) {
			return
		}
		
		//react节点检测更新
		if (this.nodeType === Constant.REACT_NODE) {
			let element = this.componentObj.render()
			let newComponentInstance = new ReactInstantiate(element)
			this.componentInstance.receiveComponent(newComponentInstance)
			return
		}
		
		if (!this.reactUpdater) {
			this.reactUpdater = new ReactUpdater(this)
		}
		
		this.reactUpdater.compareInstance(newInstance)
		
		console.log(this.reactUpdater)
		
		this.reactUpdater.run()
	}
}
