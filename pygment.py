from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
var Navigation = function() {};
Navigation.prototype.showScreen = function(id) {
  console.log('Display screen:', id);
}

var Command = function(navigation) {
  this.execute = function(event) {
    console.log("Command executed with parameter:", event.params);
    navigation.showScreen(event.params);
  }
};

var MyApplication = soma.Application.extend({
  init: function() {
    this.commands.add("show-screen", Command);
  },
  start: function() {
    this.injector.mapClass("navigation", Navigation, true);
    this.dispatcher.dispatch("show-screen", "home");
  }
});

var app = new MyApplication();
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
