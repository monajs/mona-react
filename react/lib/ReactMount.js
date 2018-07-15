import ReactInstantiate from './ReactInstantiate'

class ReactMount {
	render (nextElement, container, callback) {
		let instance = new ReactInstantiate(nextElement, null, true)
		console.log(instance)
		let node = instance.mount(null, true)
		container.appendChild(node)
	}
	
	//根据实例化节点数挂载、更新、卸载节点
	update () {
	}
	
	unmountComponentAtNode () {
	}
}

export default new ReactMount
