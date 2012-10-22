$('.switch').click(function() {
	if (obj === obj1) obj = obj2;
	else obj = obj1;
	compile();
});

//---------------------

var start = "{{";
var end = "}}";

var obj1 = {
	img: "assets/img0.jpg",
	imgrep: [
		"img",
		"img"
	],
	hideValue: true,
	showValue: true,
	link: "www.google.com",
	test1:"String 1 [v1]",
	test2:"String 2 [v1]",
	test3: {
		obj: {
			val: "val3 [v1]",
			cl: "myClass3"
		}
	},
	params: {
		param1: "p1.p1",
		param2: "p2.p2"
	},
	functions: {
		getClass: function(){ return "myClass4"; },
		getClassParam: function(p1, p2){ return p1 === "p1.p1" && p2 === "p2.p2" ? "myClass5" : undefined; },
		fn1: function(){ return "fn string returned [v1]"; },
		fn2: function(p1, p2){ return "fn string returned with: " + p1 + " " + p2 + " [v1]"; },
		fnParam: function(p1, p2){ return p1 === "p1.p1" && p2 === "p2.p2" ? "fn value [v1]" : undefined; },
		checked: function() { return "checked"; },
		hideFn: function(){ return true; },
		showFn: function(){ return true; }
	},
	cl:"myClass",
	cl2:"myClass2",
	checked: "checked",
	items: [{name:"zero [v1]", deep:{other:"1 [v1]"}}, {name:"one [v1]", deep:{other:"2 [v1]"}}, {name:"two [v1]", deep:{other:"3 [v1]"}}],
	arr:["zero [v1]", "one [v1]", "two [v1]"],
	obj: {
		title: "object containing arrays",
		data: [1, 2, 3]
	},
	l0: [
			[
				["0-0-1 [v1]", "0-0-1 [v1]", "0-0-2 [v1]"],
				["0-1-1 [v1]", "0-1-1 [v1]", "0-1-2 [v1]"],
				["0-2-1 [v1]", "0-2-1 [v1]", "0-2-2 [v1]"]
			],
			[
				["1-0-1 [v1]", "1-0-1 [v1]", "1-0-2 [v1]"],
				["1-1-1 [v1]", "1-1-1 [v1]", "1-1-2 [v1]"],
				["1-2-1 [v1]", "1-2-1 [v1]", "1-2-2 [v1]"]
			],
			[
				["2-0-1 [v1]", "2-0-1 [v1]", "2-0-2 [v1]"],
				["2-1-1 [v1]", "2-1-1 [v1]", "2-1-2 [v1]"],
				["2-2-1 [v1]", "2-2-1 [v1]", "2-2-2 [v1]"]
			]
	]
};

var obj2 = {
	img: "assets/img1.jpg",
	imgrep: [
		"img",
		"img"
	],
	hideValue: true,
	showValue: true,
	link: "http://www.google.com/",
	test1:"String 1 [v2]",
	test2:"String 2 [v2]",
	test3: {
		obj: {
			val: "val3 [v2]",
			cl: "myClass3"
		}
	},
	params: {
		param1: "p1.p1",
		param2: "p2.p2"
	},
	functions: {
		getClass: function(){ return "myClass4"; },
		getClassParam: function(p1, p2){ return p1 === "p1.p1" && p2 === "p2.p2" ? "myClass6" : undefined; },
		fn1: function(){ return "fn string returned [v2]"; },
		fn2: function(p1, p2){ return "fn string returned with: " + p1 + " " + p2 + " [v2]"; },
		fnParam: function(p1, p2){ return p1 === "p1.p1" && p2 === "p2.p2" ? "fn value [v2]" : undefined; },
		checked: function() { return "checked"; },
		hideFn: function(){ return true; },
		showFn: function(){ return true; }
	},
	cl:"myClass",
	cl2:"myClass2",
	checked: "checked",
	items: [{name:"zero [v2]", deep:{other:"1 [v2]"}}, {name:"one [v2]", deep:{other:"2 [v2]"}}, {name:"two [v2]", deep:{other:"3 [v2]"}}],
	arr:["zero [v2]", "one [v2]", "two [v2]"],
	obj: {
		title: "object containing arrays",
		data: [1, 2, 3]
	},
	l0: [
		[
			["0-0-1 [v2]", "0-0-1 [v2]", "0-0-2 [v2]"],
			["0-1-1 [v2]", "0-1-1 [v2]", "0-1-2 [v2]"],
			["0-2-1 [v2]", "0-2-1 [v2]", "0-2-2 [v2]"]
		],
		[
			["1-0-1 [v2]", "1-0-1 [v2]", "1-0-2 [v2]"],
			["1-1-1 [v2]", "1-1-1 [v2]", "1-1-2 [v2]"],
			["1-2-1 [v2]", "1-2-1 [v2]", "1-2-2 [v2]"]
		],
		[
			["2-0-1 [v2]", "2-0-1 [v2]", "2-0-2 [v2]"],
			["2-1-1 [v2]", "2-1-1 [v2]", "2-1-2 [v2]"],
			["2-2-1 [v2]", "2-2-1 [v2]", "2-2-2 [v2]"]
		]
	]
};

var obj = obj1;

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
// param is string
var reg6 = /('|")(.*)('|")/;
// find double quote
var reg7 = /\"/g;
// find single quote
var reg8 = /\'/g;


function isArray(value) {
	return toString.apply(value) === '[object Array]';
}

function getProp(obj, val) {
	var fnParts = val.match(reg4);
	var parts;
	if (fnParts) {
		// has path in
		parts = fnParts[1].split('.');
		parts[1] += '(' + fnParts[2] + ')'
	}
	else {
		parts = val.split('.');
	}
	var val = obj;
	for (var i=0; i<parts.length; i++) {
		var fp = parts[i].match(reg4);
		if (fp) {
			var f = fp[1];
			var p = fp[2];
			if (typeof val[f] !== 'function') return undefined;
			if (p && p !== "") {
				var params = [];
				if (p.match(reg6)) {
					// string
					p = p.replace(reg7, "");
					p = p.replace(reg8, "");
					params = p.split(reg5);
				}
				else {
					// value
					var pp = p.split(reg5);
					for (var k=0; k<pp.length; k++) {
						params.push(getProp(obj, pp[k]));
					}
				}
			}
			var fnVal = val[f].apply(this, params);
			if (!fnVal) return undefined;
			return fnVal;
		}
		else {
			if (!val[parts[i]]) return undefined;
			val = val[parts[i]];
		}
	}
	return val;
}

function rep(el, obj, index) {

	// comment
	if (el.nodeName === "#comment") {
		return;
	}

	// skip
	if (el.getAttribute && el.getAttribute('data-skip') !== null) {
		return;
	}

//	console.log('-- start-- ', el);

	// text
	var str = el.nodeValue;
	if (str) {
		var matches = str.match(reg1);
		if (matches) {
			for (var i=0; i<matches.length; i++) {
				var path = matches[i].replace(reg2, "");
				var val = getProp(obj, path);
				if (val) str = str.replace(matches[i], val);
				if (path === "index" && index !== undefined) {
					str = str.replace(matches[i], index);
				}
			}
		}
		el.nodeValue = str;
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
					if (isArray(itSource)) {
						for (var k=0; k<itSource.length; k++) {
							var o1 = {};
							o1[itVar] = itSource[k];
							var newNode = el.cloneNode(true);
							newNode.removeAttribute('data-repeat');
							el.parentNode.appendChild(newNode);
							rep(newNode, o1, k);
						}
						el.parentNode.removeChild(el);
					}
					else if (typeof itSource === 'object') {
						for (var o in itSource) {
							var o2 = {};
							o2[itVar] = itSource;
							var newNode = el.cloneNode(true);
							newNode.removeAttribute('data-repeat');
							el.parentNode.appendChild(newNode);
							rep(newNode, o2);
						}
						el.parentNode.removeChild(el);
					}
				}
			}
			else if (nn === "data-src") {
				// src attribute
				var matches = nv.match(reg1);
				if (matches) {
					for (var i=0; i<matches.length; i++) {
						var path = matches[i].replace(reg2, "");
						var val = getProp(obj, path);
						if (val) nv = nv.replace(matches[i], val);
						if (path === "index" && index !== undefined) {
							nv = nv.replace(matches[i], index);
						}
					}
					el.setAttribute("src", nv);
					el.removeAttribute("data-src");
				}
			}
			else if (nn === "data-href") {
				// src attribute
				var matches = nv.match(reg1);
				if (matches) {
					for (var i=0; i<matches.length; i++) {
						var path = matches[i].replace(reg2, "");
						var val = getProp(obj, path);
						if (val) nv = nv.replace(matches[i], val);
						if (path === "index" && index !== undefined) {
							nv = nv.replace(matches[i], index);
						}
					}
					el.setAttribute("href", nv);
					el.removeAttribute("data-href");
				}
			}
			else if (nn === "data-show") {
				// src attribute
				var matches = nv.match(reg1);
				if (matches) {
					for (var i=0; i<matches.length; i++) {
						var path = matches[i].replace(reg2, "");
						var val = getProp(obj, path);
						if (val) el.style.display = "block";
					}
					el.removeAttribute("data-show");
				}
			}
			else if (nn === "data-hide") {
				// src attribute
				var matches = nv.match(reg1);
				if (matches) {
					for (var i=0; i<matches.length; i++) {
						var path = matches[i].replace(reg2, "");
						var val = getProp(obj, path);
						if (val) el.style.display = "none";
					}
					el.removeAttribute("data-hide");
				}
			}
			else {
				// normal attribute (node name)
				var matches = nn.match(reg1);
				if (matches) {
					for (var i=0; i<matches.length; i++) {
						var path = matches[i].replace(reg2, "");
						var val = getProp(obj, path);
						if (val) nn = nn.replace(matches[i], val);
						el.removeAttribute(matches[i]);
					}

				}
				// normal attribute (node value)
				var matches = nv.match(reg1);
				if (matches) {
					for (var i=0; i<matches.length; i++) {
						var path = matches[i].replace(reg2, "");
						if (path === "index" && index !== undefined) {
							nv = nv.replace(matches[i], index);
						}
						else {
							var val = getProp(obj, path);
							if (val !== undefined) {
								nv = nv.replace(matches[i], val);
							}
							else {
								nv = nv.replace(matches[i], "");
							}
						}
					}
				}
				el.setAttribute(nn, nv);
			}
		}
	}

	if (el.childNodes.length > 0) {
		if (el.getAttribute && el.getAttribute('data-repeat')) {
			return;
		}
		for (var i=0; i<el.childNodes.length; i++) {
			var child = el.childNodes[i];
			rep(child, obj, index);
		}
	}

}

var time;

var cache = {};

function compile() {
	time = new Date().getTime();
	var element = document.getElementById("ct");
	if (!cache.element) {
		cache.element = element;
		cache.clone = document.getElementById("tpl").innerHTML;
		cache.element.innerHTML = cache.clone;
	}
	else {
		cache.element.innerHTML = cache.clone;
	}
	rep(element, obj);
	$('.time').html("Time elapsed: " + (new Date().getTime() - time) + " ms");
}

compile();



