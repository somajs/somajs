from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
// plugin to add callbacks when the dom is ready
var ReadyPlugin = function(instance) {
  // ready function to add callbacks when the DOM is loaded (https://github.com/ded/domready)
  var ready=function(){function l(b){for(k=1;b=a.shift();)b()}var b,a=[],c=!1,d=document,e=d.documentElement,f=e.doScroll,g="DOMContentLoaded",h="addEventListener",i="onreadystatechange",j="readyState",k=/^loade|c/.test(d[j]);return d[h]&&d[h](g,b=function(){d.removeEventListener(g,b,c),l()},c),f&&d.attachEvent(i,b=function(){/^c/.test(d[j])&&(d.detachEvent(i,b),l())}),f?function(b){self!=top?k?b():a.push(b):function(){try{e.doScroll("left")}catch(a){return setTimeout(function(){ready(b)},50)}b()}()}:function(b){k?b():a.push(b)}}();
  // add the ready function to the prototype of the soma.js application for a direct use
  instance.constructor.prototype.ready = ready;
};

// auto-registration, the plugin will be instantiated automatically by soma.js
if (soma.plugins && soma.plugins.add) {
  soma.plugins.add(ReadyPlugin);
}

// view
var View = function(target, instance) {
  instance.ready(function() {
    target.innerHTML = 'DOM is loaded';
  });
};

var Application = soma.Application.extend({
  init: function() {
    // use the plugin
    this.ready(function() {
      console.log('DOM READY');
    });
  },
  start: function() {
    // create a view
    this.mediators.create(View, document.querySelector('.report'));
  }
});

var app = new Application();
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
