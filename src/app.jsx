import React, { Component, version } from 'react'

// React.setEnv('development')
import { render } from 'react-dom'

class App2 extends Component {
	render () {
		const { children } = this.props
		return (
			<div>{children}</div>
		)
	}
}

class App extends Component {
	state = {
		list: ['a', 'b', 'c', 'd', 'c'],
		title: '杨玺测试',
		size: 5
	}
	
	componentWillMount () {
	}
	
	componentDidMount () {
	}
	
	onClick () {
		this.setState({
			list: ['c', 'b', 'f', 'd', 'f'],
			dis: !this.state.dis,
			size: this.state.size += 1
		})
	}
	
	render () {
		const { children } = this.props
		return (
			<div onClick={this.onClick.bind(this)} title={this.state.title}>
				<If condition={!this.state.dis}>
					{children}
				</If>
				<Choose>
					<When condition={this.state.dis}>
						<div>div测试</div>
					</When>
					<Otherwise>
						<App2>div2</App2>
					</Otherwise>
				</Choose>
				<If condition={this.state.dis}>
					up
				</If>
				<For each="item" of={this.state.list}>
					<div className="klass" key={item} id={item}>{item}</div>
				</For>
				<If condition={this.state.dis}>
					down
				</If>
				<If condition={this.state.dis}>
					down2
				</If>
				yangxi
			</div>
		)
	}
}

let a = (
	<div>
		<div>原生节点</div>
		文本
		<App>
			子元素
		</App>
	</div>
)
render(a, document.getElementById('appWrapper'))

