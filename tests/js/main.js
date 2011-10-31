function d()
{
	console.log( arguments );
}


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
	var suiteSequenceTests = new YUITest.TestSuite("SuiteSequenceTests");
	suiteSequenceTests.add( new SequenceTest() );



	new UnitTestBuilder( [suiteCoreInvocationTests], false, false );
	//new UnitTestBuilder( [ suiteCoreTests, suiteCoreInvocationTests, suiteSequenceTests ], false, false );
	//new UnitTestBuilder( [  suiteSequenceTests ], false, false );
}

