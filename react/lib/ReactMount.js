import ReactInstantiate from './ReactInstantiate'
import Util from '../util'

export default class ReactMount {
	static render (nextElement, container, callback) {
		if (Util.isArray(nextElement)) {
			nextElement.forEach(v => {
				ReactMount.render(v, container, callback)
			})
		} else {
			const instance = new ReactInstantiate(nextElement, null, true)
			Util.log('实例化节点:', instance)
			container.innerHTML = ''
			const nativeNode = instance.mount(container)
			Util.log('挂载创建的dom:', nativeNode)
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

