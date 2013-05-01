;(function(sniply, undefined) {

	'use strict';

	sniply.utils = sniply.utils || {};

	sniply.utils.uuid = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b;}

	sniply.utils.target = function(event) {
		return event.currentTarget ? event.currentTarget : event.srcElement;
	};

	sniply.utils.equals = function(o1, o2) {
		if (o1 === o2) return true;
		if (o1 === null || o2 === null) return false;
		if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
		var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
		if (t1 == t2) {
			if (t1 == 'object') {
				if (isArray(o1)) {
					if ((length = o1.length) == o2.length) {
						for(key=0; key<length; key++) {
							if (!equals(o1[key], o2[key])) return false;
						}
						return true;
					}
				} else if (isDate(o1)) {
					return isDate(o2) && o1.getTime() == o2.getTime();
				} else {
					if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2)) return false;
					keySet = {};
					for(key in o1) {
						if (key.charAt(0) !== '$' && !isFunction(o1[key]) && !equals(o1[key], o2[key])) {
							return false;
						}
						keySet[key] = true;
					}
					for(key in o2) {
						if (!keySet[key] && key.charAt(0) !== '$' && !isFunction(o2[key])) return false;
					}
					return true;
				}
			}
		}
		return false;
	};

	if (!('trim' in String.prototype)) {
		String.prototype.trim= function() {
			return this.replace(/^\s+/, '').replace(/\s+$/, '');
		};
	}
	if (!('indexOf' in Array.prototype)) {
		Array.prototype.indexOf= function(find, i /*opt*/) {
			if (i===undefined) i= 0;
			if (i<0) i+= this.length;
			if (i<0) i= 0;
			for (var n= this.length; i<n; i++)
				if (i in this && this[i]===find)
					return i;
			return -1;
		};
	}
	if (!('lastIndexOf' in Array.prototype)) {
		Array.prototype.lastIndexOf= function(find, i /*opt*/) {
			if (i===undefined) i= this.length-1;
			if (i<0) i+= this.length;
			if (i>this.length-1) i= this.length-1;
			for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
				if (i in this && this[i]===find)
					return i;
			return -1;
		};
	}
	if (!('forEach' in Array.prototype)) {
		Array.prototype.forEach= function(action, that /*opt*/) {
			for (var i= 0, n= this.length; i<n; i++)
				if (i in this)
					action.call(that, this[i], i, this);
		};
	}
	if (!('map' in Array.prototype)) {
		Array.prototype.map= function(mapper, that /*opt*/) {
			var other= new Array(this.length);
			for (var i= 0, n= this.length; i<n; i++)
				if (i in this)
					other[i]= mapper.call(that, this[i], i, this);
			return other;
		};
	}
	if (!('filter' in Array.prototype)) {
		Array.prototype.filter= function(filter, that /*opt*/) {
			var other= [], v;
			for (var i=0, n= this.length; i<n; i++)
				if (i in this && filter.call(that, v= this[i], i, this))
					other.push(v);
			return other;
		};
	}
	if (!('every' in Array.prototype)) {
		Array.prototype.every= function(tester, that /*opt*/) {
			for (var i= 0, n= this.length; i<n; i++)
				if (i in this && !tester.call(that, this[i], i, this))
					return false;
			return true;
		};
	}
	if (!('some' in Array.prototype)) {
		Array.prototype.some= function(tester, that /*opt*/) {
			for (var i= 0, n= this.length; i<n; i++)
				if (i in this && tester.call(that, this[i], i, this))
					return true;
			return false;
		};
	}

})(this['sniply'] = this['sniply'] || {});