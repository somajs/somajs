from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<div class="app">
  <h1>{{content.title}}</h1>
  <div data-repeat="item in content.items">{{$index}} - {{item}}</div>
</div>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
