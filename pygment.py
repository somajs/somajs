from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
// create shortcut extend method
Person.extend = function (obj) {
  return soma.inherit(Person, obj);
};
// create "child class" using the extend shortcut
var Man = Person.extend({

});
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
