'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../util');

var _util2 = _interopRequireDefault(_util);

var _constant = require('../constant');

var _constant2 = _interopRequireDefault(_constant);

var _DOMPropertyConfig = require('./DOMPropertyConfig');

var _DOMPropertyConfig2 = _interopRequireDefault(_DOMPropertyConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 只包含原生节点的创建
// react节点在实例化后返回原生节点
// 提供节点类型判断
var ReactDom = function () {
	function ReactDom() {
		_classCallCheck(this, ReactDom);

		this.domType = {};
		this.prefixList = ['transform', 'transition'];
		this.cssNumber = ['column-count', 'fill-opacity', 'font-weight', 'line-height', 'opacity', 'order', 'orphans', 'widows', 'z-index', 'zoom'];
	}

	_createClass(ReactDom, [{
		key: 'create',
		value: function create(element) {
			if (this.isEmptyNode(element)) {
				return this.createEmptyNode(element);
			}
			//文本节点
			if (this.isTextNode(element)) {
				return this.createTextNode(element);
			}
			//浏览器节点
			if (this.isNativeNode(element)) {
				return this.createNode(element);
			}
		}

		//按照渲染方式的不同划分为四种类型

	}, {
		key: 'getElementType',
		value: function getElementType(element) {
			if (this.isEmptyNode(element)) {
				return _constant2.default.EMPTY_NODE;
			}
			//文本节点
			if (this.isTextNode(element)) {
				return _constant2.default.TEXT_NODE;
			}
			//浏览器节点
			if (this.isNativeNode(element)) {
				return _constant2.default.NATIVE_NODE;
			}
			//react节点
			if (this.isReactNode(element)) {
				return _constant2.default.REACT_NODE;
			}
		}
	}, {
		key: 'isNativeNode',
		value: function isNativeNode(element) {
			return (typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object' && typeof element.type === 'string';
		}
	}, {
		key: 'isTextNode',
		value: function isTextNode(element) {
			return typeof element === 'string' || typeof element === 'number';
		}
	}, {
		key: 'isEmptyNode',
		value: function isEmptyNode(element) {
			return element === null || element === false || _util2.default.isUndefined(element);
		}
	}, {
		key: 'isReactNode',
		value: function isReactNode(element) {
			return (typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object' && typeof element.type === 'function';
		}
	}, {
		key: 'createEmptyNode',
		value: function createEmptyNode() {
			return null;
		}

		//文本节点

	}, {
		key: 'createTextNode',
		value: function createTextNode(element) {
			var node = document.createTextNode(element);
			return node;
		}

		//原生节点

	}, {
		key: 'createNode',
		value: function createNode(element) {
			var type = element.type.toLowerCase();
			if (this.domType[type]) {
				return this.domType[type].cloneNode(false);
			}
			this.domType[type] = document.createElement(type);
			return this.domType[type].cloneNode(false);
		}

		//加到父节点最前

	}, {
		key: 'nodeBefore',
		value: function nodeBefore(newEl, parentEl) {
			var firstChild = parentEl.firstChild;
			if (firstChild) {
				this.nodeInsertBefore(newEl, firstChild);
			} else {
				parentEl.appendChild(newEl);
			}
		}

		//加到父节点最后

	}, {
		key: 'nodeAfter',
		value: function nodeAfter(newEl, parentEl) {
			parentEl.appendChild(newEl);
		}

		//节点删除

	}, {
		key: 'nodeRemove',
		value: function nodeRemove(oldEl) {
			var parentEl = oldEl.parentNode;
			parentEl.removeChild(oldEl);
		}

		//节点替换

	}, {
		key: 'nodeReplace',
		value: function nodeReplace(newEl, oldEl) {
			var parentEl = oldEl.parentNode;
			parentEl.replaceChild(newEl, oldEl);
		}

		//节点插入节点前

	}, {
		key: 'nodeInsertBefore',
		value: function nodeInsertBefore(newEl, targetEl) {
			var parentEl = targetEl.parentNode;
			parentEl.insertBefore(newEl, targetEl);
		}

		//节点插入节点后

	}, {
		key: 'nodeInsertAfter',
		value: function nodeInsertAfter(newEl, targetEl) {
			var parentEl = targetEl.parentNode;
			if (parentEl.lastChild == targetEl) {
				parentEl.appendChild(newEl);
			} else {
				parentEl.insertBefore(newEl, targetEl.nextSibling);
			}
		}
	}, {
		key: 'parseStyleObj',


		//将样式对象转化为可使用的样式对象
		value: function parseStyleObj(data) {
			var _this = this;

			var _data = {};
			Object.keys(data).forEach(function (v) {
				_util2.default.upperToLine(v);
				var name = _util2.default.upperToLine(v);
				var val = data[v];
				if (typeof val === 'number' && _this.cssNumber.indexOf(name) < 0) {
					val = val + 'px';
				}
				_data[name] = val;
				if (_this.prefixList.indexOf(name) >= 0) {
					_data['-webkit-' + name] = val;
				}
			});
			return _data;
		}
	}, {
		key: 'styleObjStringify',
		value: function styleObjStringify(styleObj) {
			if (!styleObj || Object.keys(styleObj).length === 0) {
				return '';
			}
			return Object.keys(styleObj).map(function (v) {
				return v + ':' + styleObj[v];
			}).join(';');
		}

		//dom信息绑定

	}, {
		key: 'parse',
		value: function parse(node, props) {
			if (!props) {
				return;
			}
			var propKeys = Object.keys(props);

			//className
			if (_util2.default.has(props, 'className')) {
				if (props.className) {
					node.className = props.className;
				}
				_util2.default.arrayDelete(propKeys, 'className');
			}

			//style
			if (_util2.default.has(props, 'style')) {
				var style = this.parseStyleObj(props.style);
				node.setAttribute('style', this.styleObjStringify(style));
				_util2.default.arrayDelete(propKeys, 'style');
			}

			//defaultValue
			if (_util2.default.has(props, 'defaultValue')) {
				node.setAttribute('value', props.defaultValue);
				_util2.default.arrayDelete(propKeys, 'defaultValue');
			}

			//dangerouslySetInnerHTML
			if (_util2.default.has(props, 'dangerouslySetInnerHTML')) {
				if (!props.dangerouslySetInnerHTML || !props.dangerouslySetInnerHTML.__html) {
					return;
				}
				node.innerHTML = props.dangerouslySetInnerHTML.__html;
				_util2.default.arrayDelete(propKeys, 'dangerouslySetInnerHTML');
			}

			propKeys.forEach(function (v) {
				var val = props[v];
				if (_util2.default.isUndefined(val)) {
					return;
					//val = true;
				}

				if (_DOMPropertyConfig2.default.isProperty(v)) {
					var attr = _util2.default.upperToLine(v);
					if (v === 'htmlFor') {
						attr = 'for';
					}
					if (val === false) {
						node.removeAttribute(attr);
						return;
					}
					if (val === true) {
						node.setAttribute(attr, 'true');
					} else {
						node.setAttribute(attr, val);
					}
					return;
				}

				//data-*
				if (/^data-.+/.test(v) || /^aria-.+/.test(v)) {
					node.setAttribute(v, val);
					return;
				}

				//事件绑定
				var e = _DOMPropertyConfig2.default.getEventName(v);
				if (e) {
					if (_util2.default.isFun(val)) {
						node.addEventListener(e, function (ev) {
							val();
						}, false);
					}
				}
			});
		}
	}, {
		key: 'propsChange',
		value: function propsChange(node, prevProps, props) {
			if (!props) {
				return;
			}
			var propKeys = Object.keys(props);

			//className
			if (_util2.default.has(props, 'className')) {
				if (prevProps.className !== props.className) {
					node.className = props.className;
				}
				_util2.default.arrayDelete(propKeys, 'className');
			}

			//style
			if (_util2.default.has(props, 'style')) {
				var style = this.parseStyleObj(props.style);
				var styleStr = this.styleObjStringify(style);
				var oldStyle = node.getAttribute('style');
				if (styleStr !== oldStyle) {
					node.setAttribute('style', this.styleObjStringify(style));
				}
				_util2.default.arrayDelete(propKeys, 'style');
			}

			//defaultValue
			if (_util2.default.has(props, 'defaultValue')) {
				_util2.default.arrayDelete(propKeys, 'defaultValue');
			}

			//dangerouslySetInnerHTML
			if (_util2.default.has(props, 'dangerouslySetInnerHTML')) {
				if (!props.dangerouslySetInnerHTML || !props.dangerouslySetInnerHTML.__html) {
					return;
				}
				if (props.dangerouslySetInnerHTML.__html !== node.innerHTML) {
					node.innerHTML = props.dangerouslySetInnerHTML.__html;
				}
				_util2.default.arrayDelete(propKeys, 'dangerouslySetInnerHTML');
			}

			propKeys.forEach(function (v) {
				if (props[v] === prevProps[v]) {
					return;
				}

				var val = props[v];
				if (_util2.default.isUndefined(val)) {
					//val = true;
					return;
				}

				if (_DOMPropertyConfig2.default.isProperty(v)) {
					var attr = _util2.default.upperToLine(v);
					if (v === 'htmlFor') {
						attr = 'for';
					}
					if (val === false) {
						node.removeAttribute(attr);
						return;
					}
					if (val === true) {
						node.setAttribute(attr, 'true');
					} else {
						node.setAttribute(attr, val);
					}
					return;
				}

				//data-*
				if (/^data-.+/.test(v) || /^aria-.+/.test(v)) {
					node.setAttribute(v, val);
					return;
				}

				// TODO
				////事件绑定   事件绑定优化后期可做
				//let e = DOMPropertyConfig.getEventName(v);
				//if(e){
				//if(Util.isFun(val)){
				//node.addEventListener(e,(ev)=>{
				//val();
				//},false)
				//}
				/**}*/
			});
		}
	}]);

	return ReactDom;
}();

exports.default = new ReactDom();