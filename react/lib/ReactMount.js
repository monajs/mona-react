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
			
			Util.log(instance)
			let node = instance.mount(null, true)
			container.appendChild(node)
		}
	}
}

