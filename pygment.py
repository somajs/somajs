from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
dispatcher.dispatchEvent(new soma.Event('some-event'));
dispatcher.dispatchEvent(new soma.Event('some-event', {data:"some parameters"}));
</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
