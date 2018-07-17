import Util from '../util'
import Constant from '../constant'
import DOMPropertyConfig from './DOMPropertyConfig'

// 只包含原生节点的创建
// react节点在实例化后返回原生节点
// 提供节点类型判断
class ReactDom {
	domType = {}
	
	create (element) {
		if (this.isEmptyNode(element)) {
			return this.createEmptyNode(element)
		}
		//文本节点
		if (this.isTextNode(element)) {
			return this.createTextNode(element)
		}
		//浏览器节点
		if (this.isNativeNode(element)) {
			return this.createNode(element)
		}
	}
	
	//按照渲染方式的不同划分为四种类型
	getElementType (element) {
		if (this.isEmptyNode(element)) {
			return Constant.EMPTY_NODE
		}
		//文本节点
		if (this.isTextNode(element)) {
			return Constant.TEXT_NODE
		}
		//浏览器节点
		if (this.isNativeNode(element)) {
			return Constant.NATIVE_NODE
		}
		//react节点
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
		return element === null || element === false || Util.isUndefined(element)
	}
	
	isReactNode (element) {
		return typeof element === 'object' && typeof element.type === 'function'
	}
	
	createEmptyNode () {
		return null
	}
	
	//文本节点
	createTextNode (element) {
		let node = document.createTextNode(element)
		return node
	}
	
	//原生节点
	createNode (element) {
		let type = element.type.toLowerCase()
		if (this.domType[type]) {
			return this.domType[type].cloneNode(false)
		}
		this.domType[type] = document.createElement(type)
		return this.domType[type].cloneNode(false)
	}
	
	//加到父节点最前
	nodeBefore (newEl, parentEl) {
		let firstChild = parentEl.firstChild
		if (firstChild) {
			this.nodeInsertBefore(newEl, firstChild)
		} else {
			parentEl.appendChild(newEl)
		}
	}
	
	//加到父节点最后
	nodeAfter (newEl, parentEl) {
		parentEl.appendChild(newEl)
	}
	
	//节点删除
	nodeRemove (oldEl) {
		let parentEl = oldEl.parentNode
		parentEl.removeChild(oldEl)
	}
	
	//节点替换
	nodeReplace (newEl, oldEl) {
		let parentEl = oldEl.parentNode
		parentEl.replaceChild(newEl, oldEl)
	}
	
	//节点插入节点前
	nodeInsertBefore (newEl, targetEl) {
		let parentEl = targetEl.parentNode
		parentEl.insertBefore(newEl, targetEl)
	}
	
	//节点插入节点后
	nodeInsertAfter (newEl, targetEl) {
		let parentEl = targetEl.parentNode
		if (parentEl.lastChild == targetEl) {
			parentEl.appendChild(newEl)
		} else {
			parentEl.insertBefore(newEl, targetEl.nextSibling)
		}
	}
	
	prefixList = [
		'transform',
		'transition'
	]
	cssNumber = [
		'column-count',
		'fill-opacity',
		'font-weight',
		'line-height',
		'opacity',
		'order',
		'orphans',
		'widows',
		'z-index',
		'zoom'
	]
	
	//将样式对象转化为可使用的样式对象
	parseStyleObj (data) {
		let _data = {}
		Object.keys(data).forEach((v) => {
			Util.upperToLine(v)
			let name = Util.upperToLine(v)
			let val = data[v]
			if (typeof(val) === 'number' && this.cssNumber.indexOf(name) < 0) {
				val = val + 'px'
			}
			_data[name] = val
			if (this.prefixList.indexOf(name) >= 0) {
				_data['-webkit-' + name] = val
			}
		})
		return _data
	}
	
	styleObjStringify (styleObj) {
		if (!styleObj || Object.keys(styleObj).length === 0) {
			return ''
		}
		return Object.keys(styleObj).map((v) => {
			return v + ':' + styleObj[v]
		}).join(';')
	}
	
	//dom信息绑定
	parse (node, props) {
		if (!props) {
			return
		}
		let propKeys = Object.keys(props)
		
		//className
		if (Util.has(props, 'className')) {
			if (props.className) {
				node.className = props.className
			}
			Util.arrayDelete(propKeys, 'className')
		}
		
		//style
		if (Util.has(props, 'style')) {
			let style = this.parseStyleObj(props.style)
			node.setAttribute('style', this.styleObjStringify(style))
			Util.arrayDelete(propKeys, 'style')
		}
		
		//defaultValue
		if (Util.has(props, 'defaultValue')) {
			node.setAttribute('value', props.defaultValue)
			Util.arrayDelete(propKeys, 'defaultValue')
		}
		
		//dangerouslySetInnerHTML
		if (Util.has(props, 'dangerouslySetInnerHTML')) {
			if (!props.dangerouslySetInnerHTML || !props.dangerouslySetInnerHTML.__html) {
				return
			}
			node.innerHTML = props.dangerouslySetInnerHTML.__html
			Util.arrayDelete(propKeys, 'dangerouslySetInnerHTML')
		}
		
		propKeys.forEach((v) => {
			let val = props[v]
			if (Util.isUndefined(val)) {
				return
				//val = true;
			}
			
			if (DOMPropertyConfig.isProperty(v)) {
				let attr = Util.upperToLine(v)
				if (v === 'htmlFor') {
					attr = 'for'
				}
				if (val === false) {
					node.removeAttribute(attr)
					return
				}
				if (val === true) {
					node.setAttribute(attr, 'true')
				} else {
					node.setAttribute(attr, val)
				}
				return
			}
			
			//data-*
			if (/^data-.+/.test(v) || /^aria-.+/.test(v)) {
				node.setAttribute(v, val)
				return
			}
			
			//事件绑定
			let e = DOMPropertyConfig.getEventName(v)
			if (e) {
				if (Util.isFun(val)) {
					node.addEventListener(e, (ev) => {
						val()
					}, false)
				}
			}
		})
	}
	
	propsChange (node, prevProps, props) {
		if (!props) {
			return
		}
		let propKeys = Object.keys(props)
		
		//className
		if (Util.has(props, 'className')) {
			if (prevProps.className !== props.className) {
				node.className = props.className
			}
			Util.arrayDelete(propKeys, 'className')
		}
		
		//style
		if (Util.has(props, 'style')) {
			let style = this.parseStyleObj(props.style)
			let styleStr = this.styleObjStringify(style)
			let oldStyle = node.getAttribute('style')
			if (styleStr !== oldStyle) {
				node.setAttribute('style', this.styleObjStringify(style))
			}
			Util.arrayDelete(propKeys, 'style')
		}
		
		//defaultValue
		if (Util.has(props, 'defaultValue')) {
			Util.arrayDelete(propKeys, 'defaultValue')
		}
		
		//dangerouslySetInnerHTML
		if (Util.has(props, 'dangerouslySetInnerHTML')) {
			if (!props.dangerouslySetInnerHTML || !props.dangerouslySetInnerHTML.__html) {
				return
			}
			if (props.dangerouslySetInnerHTML.__html !== node.innerHTML) {
				node.innerHTML = props.dangerouslySetInnerHTML.__html
			}
			Util.arrayDelete(propKeys, 'dangerouslySetInnerHTML')
		}
		
		propKeys.forEach((v) => {
			if (props[v] === prevProps[v]) {
				return
			}
			
			let val = props[v]
			if (Util.isUndefined(val)) {
				//val = true;
				return
			}
			
			if (DOMPropertyConfig.isProperty(v)) {
				let attr = Util.upperToLine(v)
				if (v === 'htmlFor') {
					attr = 'for'
				}
				if (val === false) {
					node.removeAttribute(attr)
					return
				}
				if (val === true) {
					node.setAttribute(attr, 'true')
				} else {
					node.setAttribute(attr, val)
				}
				return
			}
			
			//data-*
			if (/^data-.+/.test(v) || /^aria-.+/.test(v)) {
				node.setAttribute(v, val)
				return
			}
			
			// TODO
			////事件绑定   事件绑定优化后期可做
			//let e = DOMPropertyConfig.getEventName(v);
			//if(e){
			//if(Util.isFun(val)){
			//node.addEventListener(e,(ev)=>{
			//val();
			//},false)
			//}
			/**}*/
		})
		
	}
	
}

export default new ReactDom
