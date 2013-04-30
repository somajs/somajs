from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
// plugin to retrieve the mouse coordinates
var OrientationPlugin = function(dispatcher) {
  // hold current orientation
  var orientation = detectDeviceOrientation();
  // add listener to detect orientation change
  window.addEventListener('orientationchange', handler);
  // store the new orientation and dispatch an event
  function handler(event) {
    orientation = detectDeviceOrientation();
    dispatcher.dispatch('orientation', orientation);
  }
  // return the orientation, portait or landscape
  function detectDeviceOrientation(){
    switch(window.orientation) {
			case 90:
			case -90:
				return 'lanscape';
			break;

			case 0:
			case 180:
			default:
				return 'portait';
		}
	}
  // return plugin API
  // getOrientation returns either landscape or portait
  // dispose removes the listener
  return {
    getOrientation: function() {
      return orientation;
    },
    dispose: function() {
      window.removeEventListener('orientationchange', handler);
    }
  }
};

// view
var View = function(target, dispatcher, orientation) {
  // display the orientation when the view is created
  updateOrientation(orientation.getOrientation());
  // listen to the event dispatched by the plugin
  dispatcher.addEventListener('orientation', function(event) {
    // display the orientation when a change happened
    updateOrientation(event.params);
  })
  // display the orientation in the DOM Element
  function updateOrientation(value) {
    target.innerHTML = 'Current orientation: ' + value;
  }
};

var Application = soma.Application.extend({
  init: function() {
    // create the plugin
    var plugin = this.createPlugin(OrientationPlugin);
    // create a mapping rule
    this.injector.mapValue('orientation', plugin);
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
