var ColorEvent = soma.Event.extend({
	constructor: function( type, color )
	{
		return soma.Event.call(this, type, {color:color}, true, true);
	}
});

var MoveEvent = soma.Event.extend({
	constructor: function( type, coords )
	{
		return soma.Event.call(this, type, {coords:coords}, true, true );
	}
});

var ChainEvent = soma.Event.extend({
	constructor: function( type )
	{
		return soma.Event.call(this, type, null, true, true );
	}
});
var TweenEvent = soma.Event.extend({
	constructor: function( type, tweenData )
	{
		return soma.Event.call(this, type, {tweenData:tweenData}, true, true );
	}
});