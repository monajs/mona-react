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
			
			Util.log('节点实例：', instance)
			const node = instance.mount(null, true)
			Util.log('节点挂载生成的dom：', node)
			container.appendChild(node)
		}
	}
}

