from pygments import highlight
from pygments.lexers import HtmlDjangoLexer
from pygments.formatters import HtmlFormatter

code = """<script>
var Terran = function(unit, character, world, weapon) {

};
// create a terran without dependency injection
var terran = new Terran(
  new MarineUnit(new HumanLife(), new HumanBehavior(), new HumanResistance(), new HumanUtilities()),
  new JimRaynorCharacter(new JimRaynorHistory()),
  new BraxisWorld(new Weather()),
  new LaserWeapon(new LaserBullet(), new LaserResistance())
);
// create a terran with dependency injection
var terran = injector.createInstance(Terran);

</script>
"""

print highlight(code, HtmlDjangoLexer(), HtmlFormatter())
