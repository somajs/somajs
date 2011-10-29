function d()
{
	console.log( arguments );
}


var SOMA_STAGE_ID = "somaStage";



function initTestScenario()
{

	/**
	 * test core framework interface for commands, models and views
	 */
	var suiteCoreTests = new YUITest.TestSuite("SuiteCoreTests");
	suiteCoreTests.add( new CommandTest() );
	suiteCoreTests.add( new ViewTest() );
	suiteCoreTests.add( new WireTest() );
	suiteCoreTests.add( new ModelTest() );


	/**
	 * test framework players event flows
	 */
	var suiteCoreInvocationTests = new YUITest.TestSuite("SuiteCoreInvocationTests");
	suiteCoreInvocationTests.add( new InvocationTest() );


	/**
	 * test framework sequencer
	 */
	//var suiteSequenceTests = new YUITest.TestSuite("SuiteSequenceTests");




	//new UnitTestBuilder( [suiteCoreInvocationTests], false, false);
	new UnitTestBuilder( [ suiteCoreTests, suiteCoreInvocationTests ], true, false );
}

