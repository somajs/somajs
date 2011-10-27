function d()
{
	console.log( arguments );
}


var SOMA_STAGE_ID = "somaStage";
var SOMA_TESTSPRITE_ID = "testSprite";
var SOMA_INSTANCE_ELEMENT_ID = "somaInstanceElememnt";




function injectTestDomStructure()
{
  	var stage = new Element("div", {id:SOMA_STAGE_ID} );
	var sprite = new Element( "div", {id:"testSprite"} );
	var instanceElement = new Element( "div", { id:"somaInstanceElememnt" } );
	stage.adopt( instanceElement.adopt( sprite ) );
	document.body.adopt( stage  );
}


function destroyTestDomStructure()
{
	document.id(SOMA_STAGE_ID).destroy();
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
	
	var suiteSequenceTests = new YUITest.TestSuite("SuiteSequenceTests");

	new UnitTestBuilder( [suiteCoreInvocationTests], false, false);
	//new UnitTestBuilder( [ suiteCoreTests, suiteCoreInvocationTests ], true, false );
}

