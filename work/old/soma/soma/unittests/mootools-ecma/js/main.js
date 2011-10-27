function d()
{
	console.log( arguments );
}


function initTestScenario()
{

	var suiteCoreTests = new YUITest.TestSuite("SuiteCoreTests");
	suiteCoreTests.add( new CommandTest() );
	suiteCoreTests.add( new ViewTest() );
	suiteCoreTests.add( new WireTest() );
	suiteCoreTests.add( new ModelTest() );

	var suiteCoreInvocationTests = new YUITest.TestSuite("SuiteCoreInvocationTests");
	suiteCoreInvocationTests.add( new InvocationTest() );
	
	//var suiteSequenceTests = new YUITest.TestSuite("SuiteSequenceTests"); 



	//new UnitTestBuilder( [suiteCoreTests], false, false );
	new UnitTestBuilder( [suiteCoreTests, suiteCoreInvocationTests], false, false );
}

