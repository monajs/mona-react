'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constant = require('../constant');

var _constant2 = _interopRequireDefault(_constant);

var _ReactDom = require('./ReactDom');

var _ReactDom2 = _interopRequireDefault(_ReactDom);

var _ReactInstantiate = require('./ReactInstantiate');

var _ReactInstantiate2 = _interopRequireDefault(_ReactInstantiate);

var _util = require('../util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//更新类型
var UPDATE_TYPES = {
	MOVE: 1,
	REMOVE: 2,
	INSERT: 3,
	REPLACE: 4,
	UPDATE: 5
};

var ReactUpdater = function () {
	function ReactUpdater(instance) {
		_classCallCheck(this, ReactUpdater);

		this.changeList = [];
		this.hasChange = false;

		this.instance = instance;
	}

	_createClass(ReactUpdater, [{
		key: 'clear',
		value: function clear() {
			this.changeList = [];
		}

		// 节点对比
		// 返回节点对比结果

	}, {
		key: 'compare',
		value: function compare(newInstance) {

			var childrenChange = false;
			var selfChange = this.compareInstance(this.instance, newInstance);
			var nodeType = this.instance.nodeType;
			this.isReactNode = nodeType == _constant2.default.REACT_NODE;

			if ((!selfChange || selfChange == 'update') && (nodeType == _constant2.default.NATIVE_NODE || this.isReactNode)) {

				if (this.listCompare(this.instance.childrenInstance, newInstance.childrenInstance)) {
					childrenChange = true;
				}
			}
			if (this.isReactNode && childrenChange && !selfChange) {
				this.changeList.push({
					prev: this.instance,
					next: newInstance,
					type: UPDATE_TYPES.UPDATE
				});
			}
			this.hasChange = selfChange || childrenChange;
			return this.hasChange;
		}

		// 节点对比
		// 处理节点变更数组

	}, {
		key: 'compareInstance',
		value: function compareInstance(prev, next, list) {
			if (!prev && !next) {
				return;
			}

			// 两个空节点 或者相同的文本节点
			if (prev.nodeType === _constant2.default.EMPTY_NODE && next.nodeType === _constant2.default.EMPTY_NODE || prev.currentElement === next.currentElement) {
				return false;
			}

			var updater = {
				isSelf: true,
				list: list,
				prev: prev,
				next: next,
				type: UPDATE_TYPES.REPLACE

				// 删除或添加，可认为是节点的替换
			};if (prev.nodeType === _constant2.default.EMPTY_NODE || next.nodeType === _constant2.default.EMPTY_NODE) {
				this.changeList.push(_extends({}, updater));
				return 'replace';
			}

			//文本节点更新
			if (prev.nodeType === _constant2.default.TEXT_NODE && next.nodeType === _constant2.default.TEXT_NODE && prev.currentElement !== next.currentElement) {
				this.changeList.push(_extends({}, updater));
				return 'replace';
			}

			//修改key
			if ((prev.key || next.key) && prev.key !== next.key) {
				this.changeList.push(_extends({}, updater));
				return 'replace';
			}

			//类型修改
			if (prev.nodeType !== next.nodeType || prev.currentElement.type !== next.currentElement.type) {
				this.changeList.push(_extends({}, updater));
				return 'replace';
			}

			//节点更新
			if (this.updateCheck(prev, next, list)) {
				return 'update';
			}

			return false;
		}

		// list 节点对比

	}, {
		key: 'listCompare',
		value: function listCompare(prev, next) {
			var _this = this;

			if (!prev && !next) {
				return false;
			}
			var hasChange = false;
			var nextObj = {};
			var prevObj = {};

			var nextKeys = next.map(function (v) {
				nextObj[v.key] = v;
				return v.key;
			});

			var prevReferKeys = [];
			var prevKeys = [];
			prev.forEach(function (v) {
				prevObj[v.key] = v;
				prevKeys.push(v.key);

				//移除
				if (nextKeys.indexOf(v.key) < 0) {
					hasChange = true;
					_this.changeList.push({
						list: prev,
						prev: v,
						type: UPDATE_TYPES.REMOVE
					});
					return;
				}
				prevReferKeys.push(v.key);
			});
			var currentInstance = void 0;
			next.forEach(function (v) {
				//未变
				var index = prevReferKeys.indexOf(v.key);
				if (index === 0) {
					var arrL = 0;
					arrL += _util2.default.isArray(prevObj[v.key]) ? 1 : 0;
					arrL += _util2.default.isArray(v) ? 1 : 0;

					if (arrL === 2) {
						if (_this.listCompare(prevObj[v.key], v)) {
							hasChange = true;
						}
					} else if (arrL === 1) {
						_this.changeList.push({
							list: prev,
							prev: prevObj[v.key],
							next: v,
							type: UPDATE_TYPES.REPLACE
						});
						hasChange = true;
					} else {
						//component对比
						if (prevObj[v.key].compareComponent(v)) {
							hasChange = true;
						}
					}
					prevReferKeys = prevReferKeys.slice(1);
					currentInstance = prevObj[v.key];
					return;
				}

				//新增
				if (prevKeys.indexOf(v.key) < 0) {

					_this.changeList.push({
						list: prev,
						next: v,
						beforeItem: currentInstance,
						type: UPDATE_TYPES.INSERT
					});
					currentInstance = v;
					hasChange = true;

					return;
				}

				//移动
				_this.changeList.push({
					type: UPDATE_TYPES.MOVE,
					list: prev,
					prev: prevObj[v.key],
					beforeItem: currentInstance
				});

				if (_util2.default.isArray(prevObj[v.key]) && _util2.default.isArray(v)) {
					if (_this.listCompare(prevObj[v.key], v)) {
						hasChange = true;
					}
				} else if (_util2.default.isArray(prevObj[v.key])) {
					_this.changeList.push({
						list: prev,
						prev: prevObj[v.key],
						next: v,
						type: UPDATE_TYPES.REPLACE
					});
					hasChange = true;
				} else {
					//component对比
					if (prevObj[v.key].compareComponent(v)) {
						hasChange = true;
					}
				}

				hasChange = true;

				prevReferKeys.splice(index, 1);
				currentInstance = prevObj[v.key];
			});
			return hasChange;
		}

		//更新检测

	}, {
		key: 'updateCheck',
		value: function updateCheck(prev, next, list) {
			var prevProps = _extends({}, prev.currentElement.props);
			var nextProps = _extends({}, next.currentElement.props);
			delete prevProps.children;
			delete nextProps.children;

			var propsChange = !_util2.default.isEqual(nextProps, prevProps);
			//更新
			if (propsChange) {
				this.changeList.push({
					isSelf: true,
					list: prev,
					prev: prev,
					next: next,
					type: UPDATE_TYPES.UPDATE
				});

				return true;
			}
			return false;
		}
	}, {
		key: 'getLastIWithNode',
		value: function getLastIWithNode(list) {
			if (list.length === 0) {
				return false;
			}
			var lastI = list[list.length - 1];
			var node = lastI.getNativeNode();
			if (node) {
				return lastI;
			}
			return this.getLastIWithNode(list.slice(0, list.length - 1));
		}
	}, {
		key: 'getFlatChildrenInstance',
		value: function getFlatChildrenInstance(instance) {
			return this.getChildrenInstance(instance.childrenInstance);
		}
	}, {
		key: 'getChildrenInstance',
		value: function getChildrenInstance(child) {
			var _this2 = this;

			if (!child) {
				return [];
			}
			var li = [];
			child.forEach(function (v) {
				if (_util2.default.isArray(v)) {
					li = li.concat(_this2.getChildrenInstance(v));
				} else {
					li.push(v);
				}
			});
			return li;
		}
	}, {
		key: 'getLastNode',
		value: function getLastNode(list, beforeItem) {
			var flatChild = void 0;
			if (beforeItem) {
				var beforeNode = beforeItem.getNativeNode();
				if (beforeNode) {
					return {
						beforeNode: beforeNode
					};
				}
				var l = list.slice(0, list.indexOf(beforeItem));
				var child = this.getChildrenInstance(l);
				var ins = this.getLastIWithNode(child);

				if (!ins && list.parentList) {
					ins = this.getLastIWithNode(this.getChildrenInstance(list.parentList));
				}
				if (ins) {
					return {
						beforeNode: ins.getNativeNode()
					};
				}
				return {
					parentNode: beforeItem.parentNode
				};
			} else {
				//创建临时item
				var tempListItem = { temp: '' };
				list.unshift(tempListItem);
				var _child = this.getFlatChildrenInstance(this.instance);
				flatChild = _child.slice(0, _child.indexOf(tempListItem));
				list.shift();
			}
			var lastinstance = this.getLastIWithNode(flatChild);

			if (!lastinstance) {
				return {
					parentNode: this.instance.getNativeNode()
				};
			}
			return {
				beforeNode: lastinstance.getNativeNode()
			};
		}

		//插入到index最后节点

	}, {
		key: 'insertAfter',
		value: function insertAfter(node, beforeItem, list) {
			var beforeInfo = this.getLastNode(list, beforeItem);

			if (beforeInfo.beforeNode) {
				_ReactDom2.default.nodeInsertAfter(node, beforeInfo.beforeNode);
				return beforeInfo.beforeNode.parentNode;
			}
			if (beforeInfo.parentNode) {
				_ReactDom2.default.nodeBefore(node, beforeInfo.parentNode);
				return beforeInfo.parentNode;
			}
		}
	}, {
		key: 'renderInsertChange',
		value: function renderInsertChange() {
			var _this3 = this;

			this.insertList.forEach(function (v) {
				if (!v.list) {
					v.list = v.prev.parentList;
				}

				var nodeChange = v.isSelf || !_this3.isReactNode;
				if (v.next.nodeType !== _constant2.default.EMPTY_NODE && nodeChange) {
					var child = _ReactInstantiate2.default.mountChildren(v.next);
					var parentNode = _this3.insertAfter(child, v.beforeItem, v.list);
					_ReactInstantiate2.default.childrenMountComplete(v.next, parentNode);
				}
				if (v.next.nodeType === _constant2.default.EMPTY_NODE) {
					v.next.parentNode = _this3.instance.getNativeNode();
				}

				v.next.parentList = v.list;
				if (v.beforeItem) {
					var index = v.list.indexOf(v.beforeItem);
					v.list.splice(index + 1, 0, v.next);
				} else {
					v.list.unshift(v.next);
				}
			});
		}
	}, {
		key: 'renderUpdateList',
		value: function renderUpdateList() {
			this.updateList.forEach(function (v) {
				v.prev.updateComponent(v.next);
			});
		}
	}, {
		key: 'renderMoveList',
		value: function renderMoveList() {
			var _this4 = this;

			this.moveList.forEach(function (v) {
				if (!v.list) {
					v.list = v.prev.parentList;
				}

				if (v.isSelf || !_this4.isReactNode) {
					var node = v.prev.getNativeNode();
					if (node) {
						_this4.insertAfter(node, v.beforeItem, v.list);
					}
				}

				var prevIndex = v.list.indexOf(v.prev);
				v.list.splice(prevIndex, 1);

				v.prev.parentList = v.list;
				if (v.beforeItem) {
					var index = v.list.indexOf(v.beforeItem);
					v.list.splice(index, 0, v.prev);
				} else {
					v.list.unshift(v.prev);
				}
			});
		}
	}, {
		key: 'renderRemoveList',
		value: function renderRemoveList() {
			var _this5 = this;

			this.removeList.forEach(function (v) {
				if (!v.list) {
					v.list = v.prev.parentList;
				}
				if (v.isSelf || !_this5.isReactNode) {
					if (_util2.default.isArray(v.prev)) {
						_ReactInstantiate2.default.unmountChildren(v.prev);
					} else {
						v.prev.willUnmount();
						var prevNode = v.prev.getNativeNode();
						if (prevNode) {
							_ReactDom2.default.nodeRemove(prevNode);
						}
						v.prev.unmount();
					}
				}

				var index = v.list.indexOf(v.prev);
				v.list.splice(index, 1);
			});
		}

		//react节点的render更新,貌似只有替换节点的情况,其他的都是更新，其中删除或添加也算是替换

	}, {
		key: 'reactComponentChange',
		value: function reactComponentChange(v) {
			v.prev.parentInstance.componentInstance = v.next;
			if (v.next.nodeType !== _constant2.default.EMPTY_NODE) {
				var child = _ReactInstantiate2.default.mountChildren(v.next);
				v.prev.parentInstance.parentNode.appendChild(child);
				_ReactInstantiate2.default.childrenMountComplete(v.next, v.prev.parentInstance.parentNode);
			}
			if (v.prev.nodeType !== _constant2.default.EMPTY_NODE) {
				v.prev.willUnmount();
				var prevNode = v.prev.getNativeNode();
				if (prevNode) {
					_ReactDom2.default.nodeRemove(prevNode);
				}
				v.prev.unmount();
			}
		}
	}, {
		key: 'renderReplaceList',
		value: function renderReplaceList() {
			var _this6 = this;

			this.replaceList.forEach(function (v) {
				if (!v.list) {
					v.list = v.prev.parentList;
				}
				if (!v.list && v.prev.parentInstance) {
					return _this6.reactComponentChange(v);
				}

				if (v.next.nodeType !== _constant2.default.EMPTY_NODE && (v.isSelf || !_this6.isReactNode)) {
					var child = _ReactInstantiate2.default.mountChildren(v.next);
					var parentNode = _this6.insertAfter(child, v.prev, v.list);
					_ReactInstantiate2.default.childrenMountComplete(v.next, parentNode);
				}
				if (v.next.nodeType === _constant2.default.EMPTY_NODE) {
					v.next.parentNode = v.prev.parentNode;
				}
				v.next.parentList = v.list;
				var prevIndex = v.list.indexOf(v.prev);
				v.list.splice(prevIndex, 0, v.next);
				_this6.removeList.push({
					isSelf: v.isSelf,
					list: v.list,
					prev: v.prev,
					next: v.next
				});
			});
		}

		//渲染更新

	}, {
		key: 'renderChange',
		value: function renderChange() {
			var _this7 = this;

			if (this.changeList.length === 0) {
				return;
			}
			this.moveList = [];
			this.removeList = [];
			this.insertList = [];
			this.updateList = [];
			this.replaceList = [];

			this.changeList.forEach(function (v) {
				v.type === UPDATE_TYPES.MOVE && _this7.moveList.push(v);
				v.type === UPDATE_TYPES.REMOVE && _this7.removeList.push(v);
				v.type === UPDATE_TYPES.INSERT && _this7.insertList.push(v);
				v.type === UPDATE_TYPES.UPDATE && _this7.updateList.push(v);
				v.type === UPDATE_TYPES.REPLACE && _this7.replaceList.push(v);
			});

			this.renderInsertChange();
			this.renderUpdateList();
			this.renderMoveList();
			this.renderReplaceList();
			this.renderRemoveList();
		}
	}, {
		key: 'runChildren',
		value: function runChildren(child) {
			var _this8 = this;

			if (_util2.default.isArray(child)) {
				child.forEach(function (v) {
					_this8.runChildren(v);
				});
			} else {
				child && child.reactUpdater && child.reactUpdater.run();
			}
		}

		//执行更新

	}, {
		key: 'run',
		value: function run() {
			this.renderChange();
			if (this.instance.nodeType !== _constant2.default.REACT_NODE) {
				this.runChildren(this.instance.childrenInstance);
			}
			this.clear();
		}
	}]);

	return ReactUpdater;
}();

exports.default = ReactUpdater;