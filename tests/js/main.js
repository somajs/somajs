var CommandEventList =
{
	STARTUP: "startup",
	TEST_INSTANCE: "cases.core.testInstance"
};


function initTestScenario()
{

	/**
	 * test core framework interface for commands, models and views
	 */
	var suiteCoreTests = new YUITest.TestSuite("SuiteCoreTests");
	suiteCoreTests.add( new FacadeTests() );
	suiteCoreTests.add( new CommandTest() );
	suiteCoreTests.add( new ViewTest() );
	suiteCoreTests.add( new WireTest() );
	suiteCoreTests.add( new ModelTest() );
    suiteCoreTests.add( new AutobindTest() );


	/**
	 * test framework players event flows
	 */
	var suiteInvocationTests = new YUITest.TestSuite("SuiteInvocationTests");
	suiteInvocationTests.add( new InvocationTest() );

	/**
	 * test framework async
	 */
	var suiteInvocationAsyncTests = new YUITest.TestSuite("SuiteInvocationAsyncTests");
	suiteInvocationAsyncTests.add( new InvocationAsyncTest() );


	/**
	 * test framework sequencer
	 */
	var suiteSequenceTests = new YUITest.TestSuite("SuiteSequenceTests");
	suiteSequenceTests.add( new SequenceTest() );

	/**
	 * test framework dispatcher
	 */
	var suiteDispatcherTests = new YUITest.TestSuite("DispatcherTests");
	suiteDispatcherTests.add( new DispatcherTest() );

	/**
	 * test framework wrappers
	 */
	var suiteWrappersTests = new YUITest.TestSuite("SomaViewTests");
	suiteWrappersTests.add( new SomaViewTests() );
	suiteWrappersTests.add( new SomaEventTests() );



	//new UnitTestBuilder( [suiteCoreTests], false, false );
	//new UnitTestBuilder( [  suiteSequenceTests ], false, false );
	//new UnitTestBuilder( [  suiteSequenceTests ], false, false );
	new UnitTestBuilder( [
		suiteCoreTests,
		suiteInvocationTests,
		suiteInvocationAsyncTests,
		suiteSequenceTests,
		suiteDispatcherTests,
		suiteWrappersTests
	], true, false );


}

