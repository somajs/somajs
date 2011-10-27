/**
 * @author Henry Schmieder
 */



/** @type PyCore **/
var core;


core = PyCorePyrrad.create( "http://localhost", "http://localhost" );
core.registerPackages(
	[
		
	]
);




function d()
{
	if ( window["console"] && Browser.name == "firefox" ) {
		console.log.apply( null, arguments );
	}
}


window.addEvent( "domready", function() { new PyromaApp( "somaAppShell" ); } );



var CommandEventList =
{
	STARTUP: "startup",
	COLORDATA_LOAD: "colordata.load",
	COLORDATA_UPDATED: "colordata.updated",
	COLOR_CHANGE: "color.change",
	CHAIN_CHAIN: "chain.chain",
	ASYNC_CALL: "async.call",
	ASYNC_CHAIN: "async.chain",
	SEQUENCE_STOP_ALL: "sequence.stopall",
	TWEENSEQUENCE_SEQUENCE: "tweensequence.sequence",
	TWEEN_TWEEN: "tween.tween",
	MOVEVIEW_MOVE: "moveview.move"
	
};





/** @class */
var PyromaApp = new Class
( {
		Extends: soma.core.Core,


		registerCommands: function()
		{
			this.addCommand( CommandEventList.STARTUP, StartCommand );
			this.addCommand( CommandEventList.CHAIN_CHAIN, ParallelTestCommand );
			this.addCommand( CommandEventList.TWEENSEQUENCE_SEQUENCE, TweenSequenceCommand );
			this.addCommand( CommandEventList.TWEEN_TWEEN, TweenCommand );
			this.addCommand( CommandEventList.ASYNC_CALL, AsyncCommand );
			this.addCommand( CommandEventList.ASYNC_CHAIN, SequenceTestCommand );
			this.addCommand( CommandEventList.SEQUENCE_STOP_ALL, SequenceStopCommand );
			this.addEventListener( CommandEventList.STARTUP, function() { console.log( "catch that command trigger from outside the framework"); }, false );
		},
	
		registerModels: function()
		{
			
		},
		registerWires: function()
		{
			
		},
		registerViews: function()
		{
		
		},
		init: function()
		{
			//this.dispatchEventShort(  CommandEventList.STARTUP );

			this.dispatchEvent( new soma.Event( CommandEventList.STARTUP ) );
		}
} );



