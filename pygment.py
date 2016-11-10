from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
var soma = require('soma.js');
var template = require('soma-template');
soma.plugins.add(template.Plugin);
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
