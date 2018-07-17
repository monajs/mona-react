import ReactInstantiate from './ReactInstantiate'
import Util from '../util'

export default class ReactMount {
	static render (nextElement, container, callback) {
		// 支持传递数组dom节点
		// 目前没有这个场景
		// 先留个坑
		if (Util.isArray(nextElement)) {
			nextElement.forEach(v => {
				ReactMount.render(v, container, callback)
			})
		} else {
			let instance = new ReactInstantiate(nextElement, null, true)
			container.innerHTML = ''
			instance.mount(container)
		}
	}
	
	static unmountComponentAtNode (node) {
		if (!(node instanceof Node)) {
			return
		}
		Util.forEach(node.children, (v) => {
			let ins = Util.getDomInstance(v)
			if (ins) {
				ins._instance.willUnmount()
				reactDom.nodeRemove(v)
				ins._instance.unmount()
			}
		})
	}
	
	static findDOMNode (componentOrElement) {
		if (!componentOrElement) {
			return
		}
		if (componentOrElement instanceof Node) {
			return componentOrElement
		}
		return componentOrElement._reactInternalInstance.getNativeNode()
	};
}

