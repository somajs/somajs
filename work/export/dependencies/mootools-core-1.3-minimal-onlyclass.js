/*
---
MooTools: the javascript framework

web build:
 - http://mootools.net/core/58f64dfefa42b08cb566c95a6244e613

packager build:
 - packager build Core/Class

copyrights:
  - [MooTools](http://mootools.net)

licenses:
  - [MIT License](http://mootools.net/license.txt)
...
*/
(function(){this.MooTools={version:"1.3",build:"a3eed692dd85050d80168ec2c708efe901bb7db3"};var n=this.typeOf=function(i){if(i==null){return"null";}if(i.$family){return i.$family();
}if(i.nodeName){if(i.nodeType==1){return"element";}if(i.nodeType==3){return(/\S/).test(i.nodeValue)?"textnode":"whitespace";}}else{if(typeof i.length=="number"){if(i.callee){return"arguments";
}if("item" in i){return"collection";}}}return typeof i;};var h=this.instanceOf=function(s,i){if(s==null){return false;}var r=s.$constructor||s.constructor;
while(r){if(r===i){return true;}r=r.parent;}return s instanceof i;};var f=this.Function;var o=true;for(var j in {toString:1}){o=null;}if(o){o=["hasOwnProperty","valueOf","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","constructor"];
}f.prototype.overloadSetter=function(r){var i=this;return function(t,s){if(t==null){return this;}if(r||typeof t!="string"){for(var u in t){i.call(this,u,t[u]);
}if(o){for(var v=o.length;v--;){u=o[v];if(t.hasOwnProperty(u)){i.call(this,u,t[u]);}}}}else{i.call(this,t,s);}return this;};};f.prototype.overloadGetter=function(r){var i=this;
return function(t){var u,s;if(r||typeof t!="string"){u=t;}else{if(arguments.length>1){u=arguments;}}if(u){s={};for(var v=0;v<u.length;v++){s[u[v]]=i.call(this,u[v]);
}}else{s=i.call(this,t);}return s;};};f.prototype.extend=function(i,r){this[i]=r;}.overloadSetter();f.prototype.implement=function(i,r){this.prototype[i]=r;
}.overloadSetter();var m=Array.prototype.slice;f.from=function(i){return(n(i)=="function")?i:function(){return i;};};Array.from=function(i){if(i==null){return[];
}return(a.isEnumerable(i)&&typeof i!="string")?(n(i)=="array")?i:m.call(i):[i];};Number.from=function(r){var i=parseFloat(r);return isFinite(i)?i:null;
};String.from=function(i){return i+"";};f.implement({hide:function(){this.$hidden=true;return this;},protect:function(){this.$protected=true;return this;
}});var a=this.Type=function(t,s){if(t){var r=t.toLowerCase();var i=function(u){return(n(u)==r);};a["is"+t]=i;if(s!=null){s.prototype.$family=(function(){return r;
}).hide();}}if(s==null){return null;}s.extend(this);s.$constructor=a;s.prototype.$constructor=s;return s;};var e=Object.prototype.toString;a.isEnumerable=function(i){return(i!=null&&typeof i.length=="number"&&e.call(i)!="[object Function]");
};var p={};var q=function(i){var r=n(i.prototype);return p[r]||(p[r]=[]);};var b=function(s,w){if(w&&w.$hidden){return this;}var r=q(this);for(var t=0;
t<r.length;t++){var v=r[t];if(n(v)=="type"){b.call(v,s,w);}else{v.call(this,s,w);}}var u=this.prototype[s];if(u==null||!u.$protected){this.prototype[s]=w;
}if(this[s]==null&&n(w)=="function"){l.call(this,s,function(i){return w.apply(i,m.call(arguments,1));});}return this;};var l=function(i,s){if(s&&s.$hidden){return this;
}var r=this[i];if(r==null||!r.$protected){this[i]=s;}return this;};a.implement({implement:b.overloadSetter(),extend:l.overloadSetter(),alias:function(i,r){b.call(this,i,this.prototype[r]);
}.overloadSetter(),mirror:function(i){q(this).push(i);return this;}});new a("Type",a);var d=function(r,v,t){var s=(v!=Object),z=v.prototype;if(s){v=new a(r,v);
}for(var w=0,u=t.length;w<u;w++){var A=t[w],y=v[A],x=z[A];if(y){y.protect();}if(s&&x){delete z[A];z[A]=x.protect();}}if(s){v.implement(z);}return d;};d("String",String,["charAt","charCodeAt","concat","indexOf","lastIndexOf","match","quote","replace","search","slice","split","substr","substring","toLowerCase","toUpperCase"])("Array",Array,["pop","push","reverse","shift","sort","splice","unshift","concat","join","slice","indexOf","lastIndexOf","filter","forEach","every","map","some","reduce","reduceRight"])("Number",Number,["toExponential","toFixed","toLocaleString","toPrecision"])("Function",f,["apply","call","bind"])("RegExp",RegExp,["exec","test"])("Object",Object,["create","defineProperty","defineProperties","keys","getPrototypeOf","getOwnPropertyDescriptor","getOwnPropertyNames","preventExtensions","isExtensible","seal","isSealed","freeze","isFrozen"])("Date",Date,["now"]);
Object.extend=l.overloadSetter();Date.extend("now",function(){return +(new Date);});new a("Boolean",Boolean);Number.prototype.$family=function(){return isFinite(this)?"number":"null";
}.hide();Number.extend("random",function(r,i){return Math.floor(Math.random()*(i-r+1)+r);});Object.extend("forEach",function(i,s,t){for(var r in i){if(i.hasOwnProperty(r)){s.call(t,i[r],r,i);
}}});Object.each=Object.forEach;Array.implement({forEach:function(t,u){for(var s=0,r=this.length;s<r;s++){if(s in this){t.call(u,this[s],s,this);}}},each:function(i,r){Array.forEach(this,i,r);
return this;}});var k=function(i){switch(n(i)){case"array":return i.clone();case"object":return Object.clone(i);default:return i;}};Array.implement("clone",function(){var r=this.length,s=new Array(r);
while(r--){s[r]=k(this[r]);}return s;});var g=function(r,i,s){switch(n(s)){case"object":if(n(r[i])=="object"){Object.merge(r[i],s);}else{r[i]=Object.clone(s);
}break;case"array":r[i]=s.clone();break;default:r[i]=s;}return r;};Object.extend({merge:function(y,t,s){if(n(t)=="string"){return g(y,t,s);}for(var x=1,r=arguments.length;
x<r;x++){var u=arguments[x];for(var w in u){g(y,w,u[w]);}}return y;},clone:function(i){var s={};for(var r in i){s[r]=k(i[r]);}return s;},append:function(v){for(var u=1,s=arguments.length;
u<s;u++){var r=arguments[u]||{};for(var t in r){v[t]=r[t];}}return v;}});["Object","WhiteSpace","TextNode","Collection","Arguments"].each(function(i){new a(i);
});var c=Date.now();String.extend("uniqueID",function(){return(c++).toString(36);});})();Array.implement({invoke:function(a){var b=Array.slice(arguments,1);
return this.map(function(c){return c[a].apply(c,b);});},every:function(c,d){for(var b=0,a=this.length;b<a;b++){if((b in this)&&!c.call(d,this[b],b,this)){return false;
}}return true;},filter:function(d,e){var c=[];for(var b=0,a=this.length;b<a;b++){if((b in this)&&d.call(e,this[b],b,this)){c.push(this[b]);}}return c;},clean:function(){return this.filter(function(a){return a!=null;
});},indexOf:function(c,d){var a=this.length;for(var b=(d<0)?Math.max(0,a+d):d||0;b<a;b++){if(this[b]===c){return b;}}return -1;},map:function(d,e){var c=[];
for(var b=0,a=this.length;b<a;b++){if(b in this){c[b]=d.call(e,this[b],b,this);}}return c;},some:function(c,d){for(var b=0,a=this.length;b<a;b++){if((b in this)&&c.call(d,this[b],b,this)){return true;
}}return false;},associate:function(c){var d={},b=Math.min(this.length,c.length);for(var a=0;a<b;a++){d[c[a]]=this[a];}return d;},link:function(c){var a={};
for(var e=0,b=this.length;e<b;e++){for(var d in c){if(c[d](this[e])){a[d]=this[e];delete c[d];break;}}}return a;},contains:function(a,b){return this.indexOf(a,b)!=-1;
},append:function(a){this.push.apply(this,a);return this;},getLast:function(){return(this.length)?this[this.length-1]:null;},getRandom:function(){return(this.length)?this[Number.random(0,this.length-1)]:null;
},include:function(a){if(!this.contains(a)){this.push(a);}return this;},combine:function(c){for(var b=0,a=c.length;b<a;b++){this.include(c[b]);}return this;
},erase:function(b){for(var a=this.length;a--;){if(this[a]===b){this.splice(a,1);}}return this;},empty:function(){this.length=0;return this;},flatten:function(){var d=[];
for(var b=0,a=this.length;b<a;b++){var c=typeOf(this[b]);if(c=="null"){continue;}d=d.concat((c=="array"||c=="collection"||c=="arguments"||instanceOf(this[b],Array))?Array.flatten(this[b]):this[b]);
}return d;},pick:function(){for(var b=0,a=this.length;b<a;b++){if(this[b]!=null){return this[b];}}return null;},hexToRgb:function(b){if(this.length!=3){return null;
}var a=this.map(function(c){if(c.length==1){c+=c;}return c.toInt(16);});return(b)?a:"rgb("+a+")";},rgbToHex:function(d){if(this.length<3){return null;}if(this.length==4&&this[3]==0&&!d){return"transparent";
}var b=[];for(var a=0;a<3;a++){var c=(this[a]-0).toString(16);b.push((c.length==1)?"0"+c:c);}return(d)?b:"#"+b.join("");}});String.implement({test:function(a,b){return((typeOf(a)=="regexp")?a:new RegExp(""+a,b)).test(this);
},contains:function(a,b){return(b)?(b+this+b).indexOf(b+a+b)>-1:this.indexOf(a)>-1;},trim:function(){return this.replace(/^\s+|\s+$/g,"");},clean:function(){return this.replace(/\s+/g," ").trim();
},camelCase:function(){return this.replace(/-\D/g,function(a){return a.charAt(1).toUpperCase();});},hyphenate:function(){return this.replace(/[A-Z]/g,function(a){return("-"+a.charAt(0).toLowerCase());
});},capitalize:function(){return this.replace(/\b[a-z]/g,function(a){return a.toUpperCase();});},escapeRegExp:function(){return this.replace(/([-.*+?^${}()|[\]\/\\])/g,"\\$1");
},toInt:function(a){return parseInt(this,a||10);},toFloat:function(){return parseFloat(this);},hexToRgb:function(b){var a=this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
return(a)?a.slice(1).hexToRgb(b):null;},rgbToHex:function(b){var a=this.match(/\d{1,3}/g);return(a)?a.rgbToHex(b):null;},substitute:function(a,b){return this.replace(b||(/\\?\{([^{}]+)\}/g),function(d,c){if(d.charAt(0)=="\\"){return d.slice(1);
}return(a[c]!=null)?a[c]:"";});}});Function.extend({attempt:function(){for(var b=0,a=arguments.length;b<a;b++){try{return arguments[b]();}catch(c){}}return null;
}});Function.implement({attempt:function(a,c){try{return this.apply(c,Array.from(a));}catch(b){}return null;},bind:function(c){var a=this,b=(arguments.length>1)?Array.slice(arguments,1):null;
return function(){if(!b&&!arguments.length){return a.call(c);}if(b&&arguments.length){return a.apply(c,b.concat(Array.from(arguments)));}return a.apply(c,b||arguments);
};},pass:function(b,c){var a=this;if(b!=null){b=Array.from(b);}return function(){return a.apply(c,b||arguments);};},delay:function(b,c,a){return setTimeout(this.pass(a,c),b);
},periodical:function(c,b,a){return setInterval(this.pass(a,b),c);}});Number.implement({limit:function(b,a){return Math.min(a,Math.max(b,this));},round:function(a){a=Math.pow(10,a||0).toFixed(a<0?-a:0);
return Math.round(this*a)/a;},times:function(b,c){for(var a=0;a<this;a++){b.call(c,a,this);}},toFloat:function(){return parseFloat(this);},toInt:function(a){return parseInt(this,a||10);
}});Number.alias("each","times");(function(b){var a={};b.each(function(c){if(!Number[c]){a[c]=function(){return Math[c].apply(null,[this].concat(Array.from(arguments)));
};}});Number.implement(a);})(["abs","acos","asin","atan","atan2","ceil","cos","exp","floor","log","max","min","pow","sin","sqrt","tan"]);(function(){var a=this.Class=new Type("Class",function(h){if(instanceOf(h,Function)){h={initialize:h};
}var g=function(){e(this);if(g.$prototyping){return this;}this.$caller=null;var i=(this.initialize)?this.initialize.apply(this,arguments):this;this.$caller=this.caller=null;
return i;}.extend(this).implement(h);g.$constructor=a;g.prototype.$constructor=g;g.prototype.parent=c;return g;});var c=function(){if(!this.$caller){throw new Error('The method "parent" cannot be called.');
}var g=this.$caller.$name,h=this.$caller.$owner.parent,i=(h)?h.prototype[g]:null;if(!i){throw new Error('The method "'+g+'" has no parent.');}return i.apply(this,arguments);
};var e=function(g){for(var h in g){var j=g[h];switch(typeOf(j)){case"object":var i=function(){};i.prototype=j;g[h]=e(new i);break;case"array":g[h]=j.clone();
break;}}return g;};var b=function(g,h,j){if(j.$origin){j=j.$origin;}var i=function(){if(j.$protected&&this.$caller==null){throw new Error('The method "'+h+'" cannot be called.');
}var l=this.caller,m=this.$caller;this.caller=m;this.$caller=i;var k=j.apply(this,arguments);this.$caller=m;this.caller=l;return k;}.extend({$owner:g,$origin:j,$name:h});
return i;};var f=function(h,i,g){if(a.Mutators.hasOwnProperty(h)){i=a.Mutators[h].call(this,i);if(i==null){return this;}}if(typeOf(i)=="function"){if(i.$hidden){return this;
}this.prototype[h]=(g)?i:b(this,h,i);}else{Object.merge(this.prototype,h,i);}return this;};var d=function(g){g.$prototyping=true;var h=new g;delete g.$prototyping;
return h;};a.implement("implement",f.overloadSetter());a.Mutators={Extends:function(g){this.parent=g;this.prototype=d(g);},Implements:function(g){Array.from(g).each(function(j){var h=new j;
for(var i in h){f.call(this,i,h[i],true);}},this);}};})();