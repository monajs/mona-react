'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// this.props.children 的值有三种可能：如果当前组件没有子节点，它就是 undefined
// 如果有一个子节点，数据类型是 object
// 如果有多个子节点，数据类型就是 array
// 用作处理React的children
var ReactChildren = function () {
	function ReactChildren() {
		_classCallCheck(this, ReactChildren);
	}

	_createClass(ReactChildren, [{
		key: 'map',
		value: function map(children, fun) {
			return _util2.default.arrayFlat(children).map(fun);
		}
	}, {
		key: 'forEach',
		value: function forEach(children, fun) {
			return _util2.default.arrayFlat(children).forEach(fun);
		}
	}, {
		key: 'count',
		value: function count(children) {
			return _util2.default.arrayFlat(children).length();
		}
	}, {
		key: 'only',
		value: function only(children) {}
	}, {
		key: 'toArray',
		value: function toArray(children) {
			return _util2.default.arrayFlat(children);
		}
	}]);

	return ReactChildren;
}();

exports.default = new ReactChildren();