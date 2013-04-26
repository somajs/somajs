from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
var EditorModel = function(dispatcher) {
  dispatcher.addEventListener('logout', function(event) {
    console.log("Logout event received in EditorModel");
    if (!this.fileSaved) {
      console.log('Interupt logout command');
      event.preventDefault();
    }
  });
};

var LogoutCommand = function() {
  this.execute = function(event) {
    console.log("Logout user");
  }
};

var EditorApplication = soma.Application.extend({
  init: function() {
    this.commands.add("logout", LogoutCommand);
    this.injector.createInstance(EditorModel);
  },
  start: function() {
    // dispatch a cancelable event
    // dispatch(eventType, parameters, bubbles, cancelable)
    this.dispatcher.dispatch("logout", null, false, true);
  }
});

var app = new EditorApplication();
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
