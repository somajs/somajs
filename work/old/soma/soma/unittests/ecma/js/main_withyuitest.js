/**
 * Created by IntelliJ IDEA.
 * User: Henry
 * Date: 13.01.2011
 * Time: 00:52:41
 * To change this template use File | Settings | File Templates.
 */

window.addEvent( "load", testStartup );

function d()
{
	if ( window["console"] && Browser.name == "firefox" ) {
		console.log.apply( null, arguments );
	}
}


function testStartup()
{
	new UnitTestTest();
	
	//document.id( "btnParallel" ).addEvent( "mouseenter", testHover );

	//YAHOO.util.UserAction.mouseover( document.id("btnParallel") );

	//YAHOO.util.UserAction.mouseout.delay( 3000, YAHOO.util.UserAction, [ document.id("btnParallel") ] );


	//YAHOO.util.UserAction.click.delay( 1000, YAHOO.util.UserAction, [ document.id("btnParallel") ] );

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
	Extends: soma.core.Core,


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
		//this.fireCoreEvent(  CommandEventList.STARTUP, ["eins", "zwei", "drei"] );
		this.dispatchEvent( new soma.Event( CommandEventList.STARTUP ) );
	}
});







(function(){
   PyrTestCase = new Class
	({
		Extends: YUITest.TestCase
		,wasSetup: false
		,Assert: YUITest.Assert
		,assertEquals: YUITest.Assert.areEqual
		,assertTrue: YUITest.Assert.isTrue
		,assertFalse: YUITest.Assert.isFalse
		,assertNaN: YUITest.Assert.isNaN
		,assertNotNaN: YUITest.Assert.isNotNaN
		,assertNull: YUITest.Assert.isNull
		,assertUndefined: YUITest.Assert.isUndefined
		,assertNotUndefined: YUITest.Assert.isNotUndefined
		,fail: YUITest.Assert.fail
	});
})();



var BaseTest = new Class
({
	Extends: PyrTestCase,

	name: "BaseTest Testcase",

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

	tearDown: function()
	{
		
	},

	testStartCommandIsRegistered : function () {
		this.assertTrue( somaTestApp.hasCommand( CommandEventList.STARTUP ) );
	},

	testColorCommandEventsAreRegistered: function()
	{
		console.time("test time");
		this.assertTrue( somaTestApp.hasCommand( CommandEventList.COLOR_CHANGE ) );
	 	this.assertTrue( somaTestApp.hasCommand( CommandEventList.COLORDATA_LOAD ) );
	 	this.assertTrue( somaTestApp.hasCommand( CommandEventList.COLORDATA_UPDATED ) );
		//YAHOO.util.UserAction.click( document.id( "btnParallel" ) );
	}

});


var NextTest = new Class
({
   	Extends:PyrTestCase,

	name: "NextTest Testcase",
	
	testSomething: function()
	{
		this.assertTrue( true );
	},
	testAnotherThing: function()
	{
		this.assertTrue( false, "arschficken" );
	}


});


(function() {

	UnitTestTest = new Class
	({
		initialize: function()
	   {
			d("init Suite");
			var suite = new YUITest.TestSuite("TestSuite Name");
			suite.add( new BaseTest() );
			suite.add( new NextTest() );
			//var logger = new YAHOO.tool.TestLogger( null, {verboseOutput:true});
			//logger.hideCategory("info");


			YUITest.TestRunner.add( suite );
			YUITest.TestRunner.subscribe( YUITest.TestRunner.TEST_SUITE_COMPLETE_EVENT, this.completeListener.bind(this) );
			YUITest.TestRunner.subscribe( YUITest.TestRunner.TEST_PASS_EVENT, this.passListener.bind(this) );
			YUITest.TestRunner.subscribe( YUITest.TestRunner.TEST_CASE_BEGIN_EVENT, this.caseStartListener.bind(this) );
			YUITest.TestRunner.subscribe( YUITest.TestRunner.TEST_CASE_COMPLETE_EVENT, this.caseCompleteListener.bind(this) );
			YUITest.TestRunner.subscribe( YUITest.TestRunner.TEST_FAIL_EVENT, this.failListener.bind(this) );
			YUITest.TestRunner.run();

	   },
		caseStartListener: function( e )
		{
			console.time( "time" );
			console.groupCollapsed( "TESTCASE: " + e.testCase.name );

		},
		caseCompleteListener: function( e )
		{
			//console.timeEnd( "time" );
			console.info( "		RESULTS: ", "Tests: " + e.results.total , " | Passed: " + e.results.failed, " | Failed:" + e.results.failed,  " | time: " + e.results.duration+"ms " );
			console.groupEnd();
		},
		completeListener: function( e )
		{
			var resultsXML = e.results;
		},
		passListener: function( e )
		{
			console.info( "PASSED:", e.testCase.name + " :: " + e.testName );
		},
		failListener: function( e )
		{
			console.warn( "FAILED: " + e.testName,  "(`"+e.error.message+"`) " + " - " + e.error.name + " (Expected:" + e.error.expected+")" );
			//console.groupCollapsed ( "FAIL DETAIL: ", e.error  );

			//console.groupEnd();
		}
	});
})();


