# 轻量版UI框架 mona-react

与 React 的语法完全一致，方便大家快速的上手，可以参考 React 的文档库进行使用。
> 体积非常的小！！！

[![npm](https://img.shields.io/npm/v/@monajs/react.svg?style=flat-square)](https://www.npmjs.com/package/@monajs/react) [![npm](https://img.shields.io/npm/dt/@monajs/react.svg?style=flat-square)](https://www.npmjs.com/package/@monajs/react)

## 联系我
> 微信：599321378

## 使用场景

* 当你开发的组件或者 sdk 有跨框架的需求时，可以考虑使用。
* 当你需要开发的功能非常的独立且简单，需要潜入到其他的应用中时，可以考虑使用

## 安装
```bash
npm i @monajs/react --save-dev
```

## 使用方式

```js
import React, { Component, version } from 'react'
import { render } from 'react/reactDom'
import Test from '../test'

class App extends Component {
	test = null
	componentDidMount () {
		this.test = new Test()
	}

	click = () => {
		this.test.show()
	}

	render () {
		return (
			<div onClick={this.click}>123</div>
		)
	}
}

render(<App />, document.getElementById('appWrapper'))
```
