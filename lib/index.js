'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ReactElement = require('./lib/ReactElement');

var _ReactElement2 = _interopRequireDefault(_ReactElement);

var _ReactComponent = require('./lib/ReactComponent');

var _ReactComponent2 = _interopRequireDefault(_ReactComponent);

var _ReactChildren = require('./lib/ReactChildren');

var _ReactChildren2 = _interopRequireDefault(_ReactChildren);

var _constant = require('./constant');

var _constant2 = _interopRequireDefault(_constant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var React = function () {
	function React() {
		_classCallCheck(this, React);

		this.version = _constant2.default.VERSION;
		this.Component = _ReactComponent2.default;
		this.Children = _ReactChildren2.default;
		this.createElement = _ReactElement2.default.createElement;
		this.cloneElement = _ReactElement2.default.cloneElement;
		this.env = 'production';
	}

	_createClass(React, [{
		key: 'setEnv',
		value: function setEnv(env) {
			this.env = env;
		}
	}]);

	return React;
}();

module.exports = new React();