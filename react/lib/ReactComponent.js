export default class ReactComponent {
	
	constructor (props) {
		this.props = props
	}
	
	setState (data, callback) {
		if (!this.state) {
			this.state = {}
		}
		// let prevState = Object.assign({}, this.state)
		Object.assign(this.state, data)
		this._reactInternalInstance.receiveComponent(null, callback)
	}
}
