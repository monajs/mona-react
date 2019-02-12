'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ReactMount = require('react/lib/ReactMount');

var _ReactMount2 = _interopRequireDefault(_ReactMount);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ReactDom = function ReactDom() {
	_classCallCheck(this, ReactDom);

	this.render = _ReactMount2.default.render;
	this.findDOMNode = _ReactMount2.default.findDOMNode;
	this.unmountComponentAtNode = _ReactMount2.default.unmountComponentAtNode;
};

exports.default = ReactDom;


module.exports = new ReactDom();