from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
var Config = function() {
  console.log("Config instantiated");
};

var Model = function(config) {
  console.log("Model instantiated with a config injected:", config);
};

var Command = function(model) {
  this.execute = function() {
    console.log("Command executed with a model injected:", model);
  }
};

// mapping rule: map the string "config" to the function Config
this.injector.mapClass("config", Config, true);
// mapping rule: map the string "model" to the function Model
this.injector.mapClass("model", Model, true);
// command mapped to an event
this.commands.add("some-event", Command);
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
