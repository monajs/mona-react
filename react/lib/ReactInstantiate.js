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
			let key = i + ''
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
	mount (parentNode) {
		if (this.nodeType === Constant.EMPTY_NODE) {
			return null
		}
		
		if (this.nodeType === Constant.REACT_NODE) {
			let componentObj = new this.currentElement.type(this.currentElement.props)
			// component实例
			this.componentObj = componentObj
			this.componentObj._reactInternalInstance = this
			this.componentObj.componentWillMount && this.componentObj.componentWillMount()
			// 获取react render()出来的真实节点信息
			let componentElement = componentObj.render()
			if (!componentElement) {
				return null
			}
			this.componentElement = componentElement
			this.componentInstance = new ReactInstantiate(this.componentElement, null)
			let node = this.componentInstance.mount(parentNode)
			this.componentObj.componentDidMount && this.componentObj.componentDidMount()
			return node
		}
		
		if (!this.nativeNode) {
			this.nativeNode = reactDom.create(this.currentElement)
			// 事件绑定
			if (this.nodeType === Constant.NATIVE_NODE && this.currentElement.props) {
				reactDom.parse(this.nativeNode, this.currentElement.props)
			}
			if (parentNode) {
				this.parentNode = parentNode
				parentNode.appendChild(this.nativeNode)
			}
		}
		
		this.nativeNode['__reactInstance'] = {
			_currentElement: this.currentElement,
			_instance: this
		}
		
		this.mountChildren(this.nativeNode)
		return this.nativeNode
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
