'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ReactInstantiate = require('./ReactInstantiate');

var _ReactInstantiate2 = _interopRequireDefault(_ReactInstantiate);

var _util = require('../util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ReactMount = function () {
	function ReactMount() {
		_classCallCheck(this, ReactMount);
	}

	_createClass(ReactMount, null, [{
		key: 'render',
		value: function render(nextElement, container, callback) {
			// 支持传递数组dom节点
			// 目前没有这个场景
			// 先留个坑
			if (_util2.default.isArray(nextElement)) {
				nextElement.forEach(function (v) {
					ReactMount.render(v, container, callback);
				});
			} else {
				var instance = new _ReactInstantiate2.default(nextElement, null, true);
				_util2.default.log('实例化节点:', instance);
				container.innerHTML = '';
				var nativeNode = instance.mount(container);
				_util2.default.log('挂载创建的dom:', nativeNode);
			}
		}
	}, {
		key: 'unmountComponentAtNode',
		value: function unmountComponentAtNode(node) {
			if (!(node instanceof Node)) {
				return;
			}
			_util2.default.forEach(node.children, function (v) {
				var ins = _util2.default.getDomInstance(v);
				if (ins) {
					ins._instance.willUnmount();
					reactDom.nodeRemove(v);
					ins._instance.unmount();
				}
			});
		}
	}, {
		key: 'findDOMNode',
		value: function findDOMNode(componentOrElement) {
			if (!componentOrElement) {
				return;
			}
			if (componentOrElement instanceof Node) {
				return componentOrElement;
			}
			return componentOrElement._reactInternalInstance.getNativeNode();
		}
	}]);

	return ReactMount;
}();

exports.default = ReactMount;