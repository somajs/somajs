from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<div select="SelectMediator"></div>
<div choose="ChooseMediator"></div>
<div pick="PickMediator"></div>

<script>

var SelectMediator = function(target) {
  target.innerHTML = "I'm a mediator, my name is: SelectMediator";
};

var ChooseMediator = function(target) {
  target.innerHTML = "I'm a mediator, my name is: ChooseMediator";
};

var PickMediator = function(target) {
  target.innerHTML = "I'm a mediator, my name is: PickMediator";
};

var Application = soma.Application.extend({
  init: function() {
    // set mediator mapping
    this.mediators.describe('select').map('SelectMediator', SelectMediator);
    this.mediators.describe('choose').map('ChooseMediator', ChooseMediator);
    this.mediators.describe('pick').map('PickMediator', PickMediator);
    // observe an element
    this.mediators.observe(document.body);
  }
});

var app = new Application();

</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
