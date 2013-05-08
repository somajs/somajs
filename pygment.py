from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
bower install soma.js
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
