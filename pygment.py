from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<div data-mediator="FirstNameMediator|firstname"></div>
<div data-mediator="LastNameMediator|lastname"></div>
<div data-mediator="AgeMediator|age"></div>

<script>

var FirstNameMediator = function(target, data) {
  target.innerHTML = "I'm a mediator, my first name is: " + data;
};

var LastNameMediator = function(target, data) {
  target.innerHTML =  "I'm a mediator, my last name is: " + data;
};

var AgeMediator = function(target, data) {
  target.innerHTML = "I'm a mediator, my age is: " +  data;
};

var Application = soma.Application.extend({
  init: function() {
    var person = {
      firstname: 'John',
      lastname: 'Doe',
      age: '31',
    };
    // set mediator mapping
    this.mediators.map('FirstNameMediator', FirstNameMediator, person);
    this.mediators.map('LastNameMediator', LastNameMediator, person);
    this.mediators.map('AgeMediator', AgeMediator, person);
    // observe an element
    this.mediators.observe(document.body);
  }
});

var app = new Application();

</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
