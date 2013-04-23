from pygments import highlight
from pygments.lexers import HtmlLexer
from pygments.formatters import HtmlFormatter

code = """<div id="target">{{name}}</div>
<script type="text/javascript">
	var target = document.getElementById("target");
	var template = soma.template.create(target);
</script>
"""

print highlight(code, HtmlLexer(), HtmlFormatter())