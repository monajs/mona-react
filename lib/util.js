'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = function () {
	function Util() {
		_classCallCheck(this, Util);
	}

	_createClass(Util, [{
		key: 'forEach',

		//解决像NodeList这样，不是数组的循环问题
		value: function forEach(v, fun) {
			Array.prototype.forEach.call(v, fun);
		}
	}, {
		key: 'isUndefined',
		value: function isUndefined(v) {
			return typeof v === 'undefined';
		}
	}, {
		key: 'isFun',
		value: function isFun(v) {
			return v instanceof Function;
		}
	}, {
		key: 'isArray',
		value: function isArray(v) {
			return v instanceof Array;
		}
	}, {
		key: 'upperToLine',
		value: function upperToLine(v) {
			return v.replace(/[A-Z]/g, function (w) {
				return '-' + w.toLowerCase();
			});
		}

		//删除数组元素

	}, {
		key: 'arrayDelete',
		value: function arrayDelete(array, val) {
			var index = array.indexOf(val);
			if (index < 0) {
				return;
			}
			array.splice(index, 1);
		}
	}, {
		key: 'toArray',
		value: function toArray(v) {
			if (this.isArray(v)) {
				return v;
			}
			if (v) {
				return [v];
			}
			return [];
		}
	}, {
		key: 'arrayFlat',
		value: function arrayFlat(v) {
			var _this = this;

			if (!v) {
				return [];
			}
			if (this.isArray(v)) {
				var a = [];
				v.forEach(function (arr) {
					if (_this.isArray(arr)) {
						a = a.concat(_this.arrayFlat(arr));
					} else {
						a.push(arr);
					}
				});
				return a;
			}
			return [v];
		}

		//对比

	}, {
		key: 'toString',
		value: function toString(a) {
			return String(a);
		}
	}, {
		key: 'eq',
		value: function eq(a, b) {
			if (a === b) return a !== 0 || 1 / a === 1 / b;
			if (a == null || b == null) return false;
			if (a !== a) return b !== b;
			var type = typeof a === 'undefined' ? 'undefined' : _typeof(a);
			if (type !== 'function' && type !== 'object' && (typeof b === 'undefined' ? 'undefined' : _typeof(b)) != 'object') return false;
			return this.deepEq(a, b);
		}
	}, {
		key: 'deepEq',
		value: function deepEq(a, b) {
			var className = this.toString(a);
			if (className !== this.toString(b)) return false;
			switch (className) {
				case '[object RegExp]':
				case '[object String]':
					return '' + a === '' + b;
				case '[object Number]':
					if (+a !== +a) return +b !== +b;
					return +a === 0 ? 1 / +a === 1 / b : +a === +b;
				case '[object Date]':
				case '[object Boolean]':
					return +a === +b;
				case '[object Symbol]':
					return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
			}

			var areArrays = className === '[object Array]';
			if (!areArrays) {
				if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) != 'object' || (typeof b === 'undefined' ? 'undefined' : _typeof(b)) != 'object') return false;

				var aCtor = a.constructor,
				    bCtor = b.constructor;
				if (aCtor !== bCtor && !(this.isFun(aCtor) && aCtor instanceof aCtor && this.isFun(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
					return false;
				}
			}
			if (areArrays) {
				length = a.length;
				if (length !== b.length) return false;
				while (length--) {
					if (!this.eq(a[length], b[length])) return false;
				}
			} else {
				var keys = Object.keys(a),
				    key = void 0;
				length = keys.length;
				if (Object.keys(b).length !== length) return false;
				while (length--) {
					key = keys[length];
					//由于babel对es6解析的原因，function对比一直返回false，因此先去除function对比
					if (this.isFun(a[key]) && this.isFun(b[key])) {} else {
						if (!(this.has(b, key) && this.eq(a[key], b[key]))) return false;
					}
				}
			}
			return true;
		}
	}, {
		key: 'has',
		value: function has(obj, key) {
			return obj.hasOwnProperty(key);
		}
	}, {
		key: 'isEqual',
		value: function isEqual(a, b) {
			return this.eq(a, b);
		}
	}, {
		key: 'getDomInstance',
		value: function getDomInstance(dom) {
			if (!dom) {
				return null;
			}
			if (dom.__reactInternalInstance$) {
				return dom.__reactInternalInstance$;
			}
			return null;
		}
	}, {
		key: 'getDomOwner',
		value: function getDomOwner(dom) {
			var instance = this.getDomInstance(dom);
			if (!instance) {
				return null;
			}
			return instance._currentElement._owner;
		}
	}, {
		key: 'getReactDom',
		value: function getReactDom(dom) {
			if (!dom) {
				return null;
			}
			var owner = this.getDomOwner(dom);
			if (!owner) {
				return null;
			}
			return owner._instance;
		}
	}, {
		key: 'log',
		value: function log() {
			if (_index2.default.env !== 'development') {
				return;
			}

			console.log('--Mona');
			Function.prototype.apply.call(console.log, console, arguments);
		}

		// 获取key唯一的list

	}, {
		key: 'getUniqueList',
		value: function getUniqueList(list) {
			var keyList = [];
			var resList = [];
			list.forEach(function (v, i) {
				if (v && v.key) {
					if (keyList.indexOf(v.key) === -1) {
						keyList.push(v.key);
						// TODO 优化push方式，直接从数组删除，效率很更高
						resList.push(v);
					}
				} else {
					resList.push(v);
				}
			});
			return resList;
		}
	}]);

	return Util;
}();

exports.default = new Util();