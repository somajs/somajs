from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
var Navigation = function(router, dispatcher) {

  // setup routes and dispatch views ids

  router.on('/home', function() {
    dispatchRoute('home');
  });

  router.on('/page1', function() {
    dispatchRoute('page1');
  });

  router.on('/page2', function() {
    dispatchRoute('page2');
  });

  // show default view
  if (router.getRoute()[0] === '') {
    dispatchRoute('home');
  }

  // in this demo, all routes could have been handled with this single regex route
  // router.on(/.*/, function() {
  //   dispatchRoute(router.getRoute()[0]);
  // });

  function dispatchRoute(id) {
    dispatcher.dispatch('show-view', id);
  }

};

var View = function(target, dispatcher) {
  dispatcher.addEventListener('show-view', function(event) {
    target.style.display = target.className.indexOf(event.params) === -1 ? 'none' : 'block';
  });
}

var Application = soma.Application.extend({
  init: function() {
    // create the Director router and make it available through the framework
    this.injector.mapValue('router', new Router().init());
    // create mediators for the views (DOM Element)
    this.mediators.create(View, document.querySelectorAll('.view'))
  },
  start: function() {
    // instantiate Navigation to start the app
    this.injector.createInstance(Navigation);
  }
});

var app = new Application();
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
