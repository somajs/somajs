var ColorEvent = new Class
({
	Extends: soma.Event,

	initialize: function( type, color )
	{
		return this.parent( type, true, true, {color:color} );
	}
});
var MoveEvent = new Class
({
	Extends: soma.Event,

	initialize: function( type, coords )
	{
		return this.parent( type, true, true, {coords:coords} );
	}
});
var ChainEvent = new Class
({
	Extends: soma.Event,

	initialize: function( type )
	{
		return this.parent( type, true, true );
	}
});
var TweenEvent = new Class
({
	Extends: soma.Event,

	initialize: function( type, tweenData )
	{
		return this.parent( type, true, true, {tweenData:tweenData} );
	}
});