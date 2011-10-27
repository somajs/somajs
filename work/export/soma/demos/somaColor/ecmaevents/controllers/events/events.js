var ColorEvent = new Class
({
	Extends: soma.Event,
	
	initialize: function( type, color )
	{
		if( color !== undefined && color !== null ) {
			this.addProp( "color", color);
		}
		return this.parent( type, true, true );
	}
});
var MoveEvent = new Class
({
	Extends: soma.Event,

	initialize: function( type, coords )
	{
		if( coords !== undefined && coords !== null ) {
			this.addProp( "coords", coords );
		}
		return this.parent( type, true, true );
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
		if( tweenData !== undefined && tweenData !== null ) {
			this.addProp( "tweenData", tweenData );
		}
		return this.parent( type, true, true );
	}
});