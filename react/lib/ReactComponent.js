import Events from '../events'

export default class ReactComponent {
	__events = new Events
	
	constructor (props) {
		this.props = props
	}
	
	setState (data, callback) {
		if (!this.state) {
			this.state = {}
		}
		Object.assign(this.state, data)
		this.__events.emit('stateChange', this.state)
	}
}
