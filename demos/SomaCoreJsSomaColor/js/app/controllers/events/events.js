var ColorEvent = new Class
({
	Extends: soma.Event,

	initialize: function( type, color )
	{
		return this.parent( type, {color:color}, true, true );
	}
});
var MoveEvent = new Class
({
	Extends: soma.Event,

	initialize: function( type, coords )
	{
		return this.parent( type, {coords:coords}, true, true );
	}
});
var ChainEvent = new Class
({
	Extends: soma.Event,

	initialize: function( type )
	{
		return this.parent( type, null, true, true );
	}
});
var TweenEvent = new Class
({
	Extends: soma.Event,

	initialize: function( type, tweenData )
	{
		return this.parent( type, {tweenData:tweenData}, true, true );
	}
});