'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //创建react 节点


var _constant = require('../constant');

var _constant2 = _interopRequireDefault(_constant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ReactElement = function () {
	function ReactElement() {
		_classCallCheck(this, ReactElement);
	}

	_createClass(ReactElement, [{
		key: 'createElement',

		//创建react 节点对象
		value: function createElement(type, config, children) {
			var _ref = config || {},
			    key = _ref.key,
			    ref = _ref.ref,
			    __self = _ref.__self,
			    __source = _ref.__source,
			    eleProps = _objectWithoutProperties(_ref, ['key', 'ref', '__self', '__source']);

			var props = _extends({}, eleProps);

			var childrenLength = arguments.length - 2;
			if (childrenLength === 1) {
				props.children = children;
			} else if (childrenLength > 1) {
				var childArray = [];
				for (var i = 0; i < childrenLength; i++) {
					childArray.push(arguments[i + 2]);
				}
				props.children = childArray;
			}
			if (type && type.defaultProps) {
				props = _extends({}, type.defaultProps, props);
			}

			return {
				$$typeof: _constant2.default.REACT_ELEMENT_TYPE,
				type: type,
				key: key || null,
				ref: ref || null,
				props: props
			};
		}
	}, {
		key: 'cloneElement',
		value: function cloneElement(element, props) {
			var _props = _extends({}, element.props, props);
			return _extends({}, element, { props: _props });
		}
	}]);

	return ReactElement;
}();

exports.default = new ReactElement();