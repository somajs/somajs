/**
 * Created by IntelliJ IDEA.
 * User: Henry
 * Date: 13.01.2011
 * Time: 00:52:41
 * To change this template use File | Settings | File Templates.
 */
var domreadyFired = false;
window.addEvent( "load", testStartup );

function d()
{
	if ( window["console"] && Browser.name == "firefox" ) {
		console.log.apply( null, arguments );
	}
}


function testStartup()
{
	if( !domreadyFired ) {
		domreadyFired = true;
		new UnitTestTest();
	}


	//document.id( "btnParallel" ).addEvent( "mouseenter", testHover );

	//YAHOO.util.UserAction.mouseover( document.id("btnParallel") );

	//YAHOO.util.UserAction.mouseout.delay( 3000, YAHOO.util.UserAction, [ document.id("btnParallel") ] );


	//YAHOO.util.UserAction.click.delay( 1000, YAHOO.util.UserAction, [ document.id("btnParallel") ] );



}


function testHover()
{
	d("testhover");
}


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



var SomaTestApp = new Class
({
	Extends: pyroma.core.Core,


	registerCommands: function()
	{
		this.addCommand( CommandEventList.STARTUP, StartCommand );
		this.addCommand( CommandEventList.CHAIN_CHAIN, ParallelTestCommand );
		
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
		this.fireCoreEvent(  CommandEventList.STARTUP, ["eins", "zwei", "drei"] );
	}
});







(function(r){
   r["PyrTestCase"] = new Class
	({
		Extends: YAHOO.tool.TestCase
		,wasSetup: false
		,Assert: YAHOO.util.Assert
		,assertEquals: YAHOO.util.Assert.areEqual
		,assertTrue: YAHOO.util.Assert.isTrue
		,assertFalse: YAHOO.util.Assert.isFalse
		,assertNaN: YAHOO.util.Assert.isNaN
		,assertNotNaN: YAHOO.util.Assert.isNotNaN
		,assertNull: YAHOO.util.Assert.isNull
		,assertUndefined: YAHOO.util.Assert.isUndefined
		,assertNotUndefined: YAHOO.util.Assert.isNotUndefined
		,fail: YAHOO.util.Assert.fail
	});
})(window);



var BaseTest = new Class
({
	Extends: PyrTestCase,

	name: "TestCase Name",

	initialize: function()
	{
		console.log("init BaseTEst");
	},
	setUp: function()
	{
		if( this.wasSetup ) {
			return;
		}
		somaTestApp = new SomaTestApp();
		this.wasSetup = true;	
	},

	testStartCommandIsRegistered : function () {
		this.assertTrue( somaTestApp.hasCommand( CommandEventList.STARTUP ) );
	},
	
	testColorCommandEventsAreRegistered: function()
	{

	  	(function() {
			this.resume();
		}).bind(this).delay( 2000 );
		this.wait();
		this.assertTrue( somaTestApp.hasCommand( CommandEventList.COLOR_CHANGE ) );
	 	this.assertTrue( somaTestApp.hasCommand( CommandEventList.COLORDATA_LOAD ) );
	 	this.assertTrue( somaTestApp.hasCommand( CommandEventList.COLORDATA_UPDATED ) );
		YAHOO.util.UserAction.click( document.id( "btnParallel" ) );
	}

});



var t = new Class( BaseTest );


var UnitTestTest = new Class
({
	initialize: function()
   {
		d("init Suite");
	    var suite = new YAHOO.tool.TestSuite("TestSuite Name");
		suite.add( new BaseTest() );

		var logger = new YAHOO.tool.TestLogger( null, {verboseOutput:true});
	    logger.hideCategory("info");
	   
		YAHOO.tool.TestRunner.add( suite );
	    YAHOO.tool.TestRunner.subscribe( YAHOO.tool.TestRunner.TEST_SUITE_COMPLETE_EVENT, this.completeListener.bind(this) );
		YAHOO.tool.TestRunner.run();



   },
	/**
	 *
	 * @param {} e
	 */
	completeListener: function( e )
	{
		//console.log( e.results );
	}

});

