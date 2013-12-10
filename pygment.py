from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<div data-mediator="Mediator"></div>
<div data-mediator="Mediator"></div>
<div data-mediator="Mediator"></div>
<script>
var Mediator = function(target) {
  target.innerHTML = "I'm a DOM Element with a mediator.";
};
var Application = soma.Application.extend({
  init: function() {
    // set mediator mapping
    this.mediators.map('Mediator', Mediator);
    // observe an element
    this.mediators.observe(document.body);
  }
});
var app = new Application();
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
