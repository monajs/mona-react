import React from './index'

class Util {
	//解决像NodeList这样，不是数组的循环问题
	forEach (v, fun) {
		Array.prototype.forEach.call(v, fun)
	}
	
	isUndefined (v) {
		return typeof(v) === 'undefined'
	}
	
	isFun (v) {
		return v instanceof Function
	}
	
	isArray (v) {
		return v instanceof Array
	}
	
	upperToLine (v) {
		return v.replace(/[A-Z]/g, function (w) {return '-' + w.toLowerCase()})
	}
	
	//删除数组元素
	arrayDelete (array, val) {
		let index = array.indexOf(val)
		if (index < 0) {
			return
		}
		array.splice(index, 1)
	}
	
	toArray (v) {
		if (this.isArray(v)) {
			return v
		}
		if (v) {
			return [v]
		}
		return []
	}
	
	arrayFlat (v) {
		if (!v) {
			return []
		}
		if (this.isArray(v)) {
			let a = []
			v.forEach((arr) => {
				if (this.isArray(arr)) {
					a = a.concat(this.arrayFlat(arr))
				} else {
					a.push(arr)
				}
			})
			return a
		}
		return [v]
	}
	
	//对比
	toString (a) {
		return String(a)
	}
	
	eq (a, b) {
		if (a === b) return a !== 0 || 1 / a === 1 / b
		if (a == null || b == null) return false
		if (a !== a) return b !== b
		let type = typeof a
		if (type !== 'function' && type !== 'object' && typeof b != 'object') return false
		return this.deepEq(a, b)
	}
	
	deepEq (a, b) {
		let className = this.toString(a)
		if (className !== this.toString(b)) return false
		switch (className) {
			case '[object RegExp]':
			case '[object String]':
				return '' + a === '' + b
			case '[object Number]':
				if (+a !== +a) return +b !== +b
				return +a === 0 ? 1 / +a === 1 / b : +a === +b
			case '[object Date]':
			case '[object Boolean]':
				return +a === +b
			case '[object Symbol]':
				return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b)
		}
		
		let areArrays = className === '[object Array]'
		if (!areArrays) {
			if (typeof a != 'object' || typeof b != 'object') return false
			
			let aCtor = a.constructor, bCtor = b.constructor
			if (aCtor !== bCtor && !(this.isFun(aCtor) && aCtor instanceof aCtor &&
					this.isFun(bCtor) && bCtor instanceof bCtor)
				&& ('constructor' in a && 'constructor' in b)) {
				return false
			}
		}
		if (areArrays) {
			length = a.length
			if (length !== b.length) return false
			while (length--) {
				if (!this.eq(a[length], b[length])) return false
			}
		} else {
			let keys = Object.keys(a), key
			length = keys.length
			if (Object.keys(b).length !== length) return false
			while (length--) {
				key = keys[length]
				//由于babel对es6解析的原因，function对比一直返回false，因此先去除function对比
				if (this.isFun(a[key]) && this.isFun(b[key])) {
				} else {
					if (!(this.has(b, key) && this.eq(a[key], b[key]))) return false
				}
			}
		}
		return true
	};
	
	has (obj, key) {
		return obj.hasOwnProperty(key)
	}
	
	isEqual (a, b) {
		return this.eq(a, b)
	};
	
	getDomInstance (dom) {
		if (!dom) {
			return null
		}
		if (dom.__reactInternalInstance$) {
			return dom.__reactInternalInstance$
		}
		return null
	}
	
	getDomOwner (dom) {
		let instance = this.getDomInstance(dom)
		if (!instance) {
			return null
		}
		return instance._currentElement._owner
	}
	
	getReactDom (dom) {
		if (!dom) {
			return null
		}
		let owner = this.getDomOwner(dom)
		if (!owner) {
			return null
		}
		return owner._instance
	};
	
	log () {
		if (React.env !== 'development') {
			return
		}
		
		Function.prototype.apply.call(console.log, console, arguments)
	}
}

export default new Util
