from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
var TitleView = function(target, dispatcher, titleValue) {
  // titleValue has been injected when creating the mediator
  target.innerHTML = titleValue;
};

var Application = soma.Application.extend({
  init: function() {
    // data that will be injected into the mediator
    var mediatorData = {
      titleValue: 'This is a title'
    };
    // create a mediator that represents a DOM Element
    this.mediators.create(TitleView, document.getElementById('title'), mediatorData);
  }
});

var app = new Application();
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
