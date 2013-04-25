from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
this.injector.mapClass("config", Config, true);
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
