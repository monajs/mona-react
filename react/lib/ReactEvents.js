class ReactEvents {
	eventsMap = {
		onClick: 'click'
	}
	
	register (node, props, preProps, delegateNode) {
		if (!props) {
			return
		}
		Object.keys(props).forEach((v) => {
			let e = this.eventsMap[v]
			if (e) {
				if (!delegateNode) {
					delegateNode = node
				}
				delegateNode.addEventListener(e, () => {
					props[v]()
				}, false)
			}
		})
	}
}

export default new ReactEvents
