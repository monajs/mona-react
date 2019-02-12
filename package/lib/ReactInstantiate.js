'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ReactDom = require('./ReactDom');

var _ReactDom2 = _interopRequireDefault(_ReactDom);

var _ReactUpdater = require('./ReactUpdater');

var _ReactUpdater2 = _interopRequireDefault(_ReactUpdater);

var _constant = require('../constant');

var _constant2 = _interopRequireDefault(_constant);

var _util = require('../util');

var _util2 = _interopRequireDefault(_util);

var _data = require('../data');

var _data2 = _interopRequireDefault(_data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ReactInstantiate = function () {
	function ReactInstantiate(element, key, owner) {
		_classCallCheck(this, ReactInstantiate);

		this.receiveComponentCallbacks = [];

		// react节点
		this.currentElement = element;
		// 节点唯一key
		this.key = key;
		// 节点类型
		this.nodeType = _ReactDom2.default.getElementType(element);
		if (this.nodeType === _constant2.default.REACT_NODE || this.nodeType === _constant2.default.NATIVE_NODE) {
			!this.currentElement._owner && (this.currentElement._owner = owner);

			if (this.currentElement.props.children) {
				this.currentElement.props.children = _util2.default.toArray(this.currentElement.props.children);
				this.currentElement.props.children.forEach(function (v, i) {
					if (null !== v && (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object') {
						if (!v._owner) {
							v._owner = owner;
						}
						v.key = v.key ? v.key : i + '';
					}
				});
			}

			var child = _util2.default.toArray(this.currentElement.props.children);
			// 节点实例化数据结构
			this.childrenInstance = this.instanceChildren(child, owner);
		}
	}

	// 递归实例化所有节点，忽略react组件节点


	_createClass(ReactInstantiate, [{
		key: 'instanceChildren',
		value: function instanceChildren(children, owner) {
			var _this = this;

			var childrenInstance = [];
			// 为每一个节点添加唯一key

			var uniqueChild = this.checkChildren(children);
			uniqueChild && (children = uniqueChild);
			children.forEach(function (v, i) {
				var key = '$mona_' + i;
				if (null !== v && (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' && v.key) {
					key = v.key;
				}

				if (_util2.default.isArray(v)) {
					var cIns = _this.instanceChildren(v, owner);
					cIns.parentList = childrenInstance;
					cIns.parentInstance = _this;
					cIns.key = key;
					childrenInstance.push(cIns);
				} else {
					var _cIns = new ReactInstantiate(v, key);
					_cIns.parentList = childrenInstance;
					_cIns.parentInstance = _this;
					childrenInstance.push(_cIns);
				}
			});

			return childrenInstance;
		}

		// 检查children中key的唯一性
		// 返回去重的带唯一key的数组

	}, {
		key: 'checkChildren',
		value: function checkChildren(children) {
			var childrenList = _util2.default.getUniqueList(children);
			if (childrenList.length === children.length) {
				return;
			}
			console.error(_data2.default.keyNeedMsg);
			return childrenList;
		}

		// 挂载节点
		// 返回生成的dom信息

	}, {
		key: 'mount',
		value: function mount(parentNode) {
			if (this.nodeType === _constant2.default.EMPTY_NODE) {
				return null;
			}

			if (this.nodeType === _constant2.default.REACT_NODE) {
				this.nativeNode = this.mountComponent();
				if (parentNode) {
					this.nativeNode && parentNode.appendChild(this.nativeNode);
					this.mountComplete(parentNode);
				}
				return this.nativeNode;
			}

			// 实例未被创建成浏览器节点
			if (!this.nativeNode) {
				this.nativeNode = _ReactDom2.default.create(this.currentElement);
				// 将react的节点属性转化成原生识别的节点属性
				if (this.nodeType === _constant2.default.NATIVE_NODE && this.currentElement.props) {
					_ReactDom2.default.parse(this.nativeNode, this.currentElement.props);
				}
				this.refToOwner(this);
			}

			this.nativeNode['__reactInstance'] = {
				_currentElement: this.currentElement,
				_instance: this

				// 创建子节点nativeNode并插入父级节点
			};if (this.childrenInstance && this.childrenInstance.length > 0) {
				var children = ReactInstantiate.mountChildren(this.childrenInstance);
				children && this.nativeNode.appendChild(children);
			}

			if (parentNode) {
				this.nativeNode && parentNode.appendChild(this.nativeNode);
				// 挂载结束
				this.mountComplete(parentNode);
			}

			return this.nativeNode;
		}

		// 挂载component
		// 返回component对应的dom信息

	}, {
		key: 'mountComponent',
		value: function mountComponent() {
			this.componentObj = new this.currentElement.type(this.currentElement.props);
			// componentDidMount生命周期钩子函数执行点
			this.componentObj.componentWillMount && this.componentObj.componentWillMount();

			// component对应的虚拟节点dom
			var componentElement = this.componentObj.render();

			this.componentObj._reactInternalInstance = this;

			this._instance = this.componentObj; // 存储节点_owner

			// 获取虚拟节点对应的实例对象
			this.componentInstance = new ReactInstantiate(componentElement, null, this);
			this.componentInstance.parentInstance = this;
			// 节点挂载
			var nativeNode = this.componentInstance.mount();

			this.refToOwner(this);
			return nativeNode;
		}

		// 挂载子节点
		// 返回子节点实例的nativeNode

	}, {
		key: 'mountComplete',


		// 挂载结束后的执行函数
		// 更改挂载状态
		// 执行生命周期钩子函数
		value: function mountComplete(parentNode) {
			this.parentNode = parentNode;
			// 挂载完成的状态
			this.hasMount = true;
			if (this.nodeType === _constant2.default.REACT_NODE) {
				this.componentInstance.mountComplete(parentNode);
				// componentDidMount生命周期钩子函数执行点
				this.componentObj.componentDidMount && this.componentObj.componentDidMount();
			} else {
				ReactInstantiate.childrenMountComplete(this.childrenInstance, this.nativeNode);
			}
		}

		// 递归通知子节点更改挂载结束的状态
		// 执行子节点生命周期钩子函数

	}, {
		key: 'getNativeNode',


		// 获取原生的节点
		value: function getNativeNode() {
			if (this.componentInstance) {
				return this.componentInstance.getNativeNode();
			}
			return this.nativeNode;
		}

		// 挂载子节点

	}, {
		key: 'mountChildren',
		value: function mountChildren(parentNode) {
			if (!this.childrenInstance || this.childrenInstance.length === 0) {
				return;
			}
			this.childrenInstance.forEach(function (v) {
				if (_util2.default.isArray(v)) {
					v.forEach(function (child) {
						child.mount(parentNode);
					});
				} else {
					v.mount(parentNode);
				}
			});
		}

		//卸载节点

	}, {
		key: 'willUnmount',
		value: function willUnmount() {
			if (this.componentObj && this.componentObj.componentWillUnmount) {
				this.componentObj.componentWillUnmount();
			}
			this.childWillUnmount();
		}
	}, {
		key: 'childWillUnmount',
		value: function childWillUnmount() {
			if (this.componentInstance) {
				this.componentInstance.willUnmount();
			} else {
				ReactInstantiate.deepReactChild(this.childrenInstance, function (v) {
					v.willUnmount();
				});
			}
		}

		//卸载节点信息,事件消息等

	}, {
		key: 'unmount',
		value: function unmount() {
			if (this.nodeType === _constant2.default.REACT_NODE || this.nodeType === _constant2.default.NATIVE_NODE) {
				if (this.currentElement.ref && this.currentElement._owner) {
					var ownerObj = this.currentElement._owner.componentObj;
					var oldRef = ownerObj.refs[this.currentElement.ref];
					var nodeOrI = this.componentObj || this.nativeNode;
					if (oldRef && oldRef === nodeOrI) {
						delete ownerObj.refs[this.currentElement.ref];
					}
				}
			}
			if (this.componentInstance) {
				this.componentInstance.unmount();
			} else {
				ReactInstantiate.deepReactChild(this.childrenInstance, function (v) {
					v.unmount();
				});
			}
		}

		// 识别节点的ref属性, 并返回dom信息
		// 是react节点的化返回component实例信息，否则返回节点原生信息

	}, {
		key: 'refToOwner',
		value: function refToOwner(instance) {
			if ((instance.nodeType === _constant2.default.REACT_NODE || instance.nodeType === _constant2.default.NATIVE_NODE) && instance.currentElement.ref && instance.currentElement._owner) {
				var ownerObj = instance.currentElement._owner.componentObj;

				ownerObj.refs = ownerObj.refs || {};
				ownerObj.refs[instance.currentElement.ref] = instance.componentObj || instance.nativeNode;
			}
		}

		// native节点更新

	}, {
		key: 'updateComponent',
		value: function updateComponent(next) {
			// 更新提示
			if (this.componentObj && this.componentObj.componentWillReceiveProps) {
				this.componentObj.componentWillReceiveProps(next.currentElement.props);
			}
			var prevProps = this.currentElement.props;
			if (this.nodeType === _constant2.default.REACT_NODE) {
				// componentWillUpdate生命周期钩子函数执行点
				this.componentObj.componentWillUpdate && this.componentObj.componentWillUpdate(next.currentElement.props);

				this.currentElement.props = next.currentElement.props;
				this.childrenInstance = next.childrenInstance;
				this.componentObj.props = this.currentElement.props;

				var hasChange = this.receiveComponent();
				// componentDidMount生命周期钩子函数执行点
				this.componentObj.componentDidUpdate && this.componentObj.componentDidUpdate(prevProps);
			} else {
				this.currentElement.props = next.currentElement.props;
				_ReactDom2.default.propsChange(this.nativeNode, prevProps, this.currentElement.props);
			}
		}

		//节点对比

	}, {
		key: 'compareComponent',
		value: function compareComponent(newInstance) {
			!this.reactUpdater && (this.reactUpdater = new _ReactUpdater2.default(this));
			this.reactUpdater.clear();
			return this.reactUpdater.compare(newInstance);
		}

		//存储渲染回调

	}, {
		key: 'receiveComponent',


		//节点diff
		value: function receiveComponent(newInstance, callback) {
			if (this.nodeType === _constant2.default.REACT_NODE && !this.hasMount) {
				return;
			}
			if (this.componentObj && _util2.default.isFun(this.componentObj.shouldcomponentupdate) && !this.componentObj.shouldcomponentupdate()) {
				return;
			}

			if (_util2.default.isFun(callback)) {
				this.receiveComponentCallbacks.push(callback);
			}

			//react节点检测更新
			if (!newInstance && this.nodeType === _constant2.default.REACT_NODE) {

				var element = this.componentObj.render();
				var newComponentInstance = new ReactInstantiate(element, null, this);
				return this.componentInstance.receiveComponent(newComponentInstance, callback);
			}
			var hasChange = this.compareComponent(newInstance);

			if (hasChange) {
				this.reactUpdater.run();
			}
			this.receiveComponentCallbacks.forEach(function (v) {
				return v;
			});
			this.receiveComponentCallbacks = [];
			return hasChange;
		}
	}], [{
		key: 'mountChildren',
		value: function mountChildren(children) {
			if (!children) {
				return;
			}
			if (!_util2.default.isArray(children)) {
				return children.mount();
			}
			// 创建临时虚拟节点
			var virtualDom = document.createDocumentFragment();
			children.forEach(function (v) {
				if (_util2.default.isArray(v)) {
					var node = ReactInstantiate.mountChildren(v);
					virtualDom.appendChild(node);
				} else {
					var _node = v.mount();
					_node && virtualDom.appendChild(_node);
				}
			});
			return virtualDom;
		}
	}, {
		key: 'childrenMountComplete',
		value: function childrenMountComplete(children, parentNode) {
			if (!children) {
				return;
			}
			if (!_util2.default.isArray(children)) {
				return children.mountComplete(parentNode);
			}
			if (children.length === 0) {
				return;
			}
			children.forEach(function (v) {
				if (_util2.default.isArray(v)) {
					children.parentNode = parentNode;
					ReactInstantiate.childrenMountComplete(v, parentNode);
				} else {
					v.mountComplete(parentNode);
				}
			});
		}
	}, {
		key: 'unmountChildren',
		value: function unmountChildren(child) {
			child.forEach(function (v) {
				if (_util2.default.isArray(v)) {
					ReactInstantiate.unmountChildren(v);
				} else {
					v.willUnmount();
					var node = v.getNativeNode();
					if (node) {
						_ReactDom2.default.nodeRemove(node);
					}
					v.unmount();
				}
			});
		}

		//将子元素转为一维数组

	}, {
		key: 'deepReactChild',
		value: function deepReactChild(child, fun) {
			if (!child) {
				return;
			}
			if (!_util2.default.isArray(child) && child.nodeType === _constant2.default.REACT_NODE) {
				return fun(child);
			}
			if (child.length === 0) {
				return;
			}
			child.forEach(function (v) {
				if (_util2.default.isArray(v)) {
					ReactInstantiate.deepReactChild(v, fun);
				} else {
					return fun(v);
				}
			});
		}
	}]);

	return ReactInstantiate;
}();

exports.default = ReactInstantiate;