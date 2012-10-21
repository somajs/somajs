var start = "{{";
var end = "}}";

var obj = {
	test1:"String 1",
	test2:"String 2",
	test3: {
		obj: {
			val: "val3"
		}
	},
	functions: {
		getClass: function(){ return "myClass4"; },
		fn1: function(){ return "fn string returned"; },
		fn2: function(p1, p2){ return "fn string returned with: " + p1 + " " + p2; }
	},
	cl:"myClass",
	cl2:"myClass2",
	cl3:"myClass3",
	checked: "checked",
	items: [{name:"zero"}, {name:"one"}, {name:"two"}]
};

// find pattern {{var}}
var reg1 = new RegExp(start +"(.*?)" + end, "gm"); // or ([^}]*)
// find var in pattern {{var}}
var reg2 = new RegExp(start +"|" + end, "gm");
// find repeat info
var reg3 = /(.*)\s+in\s+(.*)/;
// find function
var reg4 = /(.*)\((.*)\)/;
// params to array
var reg5 = /,\s+|,|\s+,\s+/;

function isArray(value) {
	return toString.apply(value) == '[object Array]';
}

function getProp(obj, val) {
	var parts = val.split('.');
	var val = obj;
	for (var i=0; i<parts.length; i++) {
		var fp = parts[i].match(reg4);
		if (fp) {
			var f = fp[1];
			var p = fp[2];
			if (typeof val[f] !== 'function') return undefined;
			if (p && p !== "") {
				p = p.replace(/\"/gi, "");
				p = p.replace(/\'/gi, "");
				var params = p.split(reg5);
			}
			return val[f].apply(this, params);
		}
		else {
			if (!val[parts[i]]) return undefined;
			val = val[parts[i]];
		}
	}
	return val;
}

function rep(el, obj) {

	console.log('-- start-- ', el);

	// text
	var str = el.innerHTML;
	if (str) {
		var matches = str.match(reg1);
		if (matches) {
			for (var i=0; i<matches.length; i++) {
				var path = matches[i].replace(reg2, "");
				var val = getProp(obj, path);
				if (val) str = str.replace(matches[i], val);
			}
		}
		el.innerHTML = str;
	}

	// attribute
	if (el.attributes) {
		for (var attr, i=0, attrs=el.attributes, l=attrs.length; i<l; i++) {
			attr = attrs.item(i);
			var nn = attr.nodeName;
			var nv = attr.nodeValue;
			if (nn === "data-repeat") {
				// repeat attribute
				var matches = nv.match(reg3);
				if (matches.length === 3) {
					var itVar = matches[1];
					var itPath = matches[2];
					var itSource = getProp(obj, itPath);
					// clone node
					if (isArray(itSource)) {
						for (var k=0; k<itSource.length; k++) {
							var o = {};
							o[itVar] = itSource[k];
							var newNode = el.cloneNode(true);
							newNode.removeAttribute('data-repeat');
							el.parentNode.appendChild(newNode);
							rep(newNode, o);
						}
						el.parentNode.removeChild(el);
					}
				}
			}
			else {
				// normal attribute
				var matches = nn.match(reg1);
				if (matches) {
					for (var i=0; i<matches.length; i++) {
						var path = matches[i].replace(reg2, "");
						var val = getProp(obj, path);
						if (val) nn = nn.replace(matches[i], val);
					}
				}
				var matches = nv.match(reg1);
				if (matches) {
					for (var i=0; i<matches.length; i++) {
						var path = matches[i].replace(reg2, "");
						var val = getProp(obj, path);
						if (val) nv = nv.replace(matches[i], val);
					}
				}
				el.setAttribute(nn, nv);
			}
		}
	}

	if (el.childNodes.length > 0) {
		for (var i=0; i<el.childNodes.length; i++) {
			rep(el.childNodes[i], obj);
		}
	}

}

rep(document.getElementById("ct"), obj);



