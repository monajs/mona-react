class Util {
	forEach (v, fun) {
		Array.prototype.forEach.call(v, fun)
	}
	
	isFun (v) {
		return v instanceof Function
	}
	
	isArray (v) {
		return v instanceof Array
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
	
	//对比
	toString (a) {
		return String(a)
	}
	
	eq (a, b) {
		if (a === b) return a !== 0 || 1 / a === 1 / b
		if (a === null || b === null) return false
		if (a !== a) return b !== b
		let type = typeof a
		if (type !== 'function' && type !== 'object' && typeof b !== 'object') return false
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
			if (typeof a !== 'object' || typeof b !== 'object') return false
			
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
				if (!(this.has(b, key) && this.eq(a[key], b[key]))) return false
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
}

export default new Util
