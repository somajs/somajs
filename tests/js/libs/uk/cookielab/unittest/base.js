/**
 * @author Henry Schmieder
 * 
 */

(function() {
	UnitTestBuilder = new Class
	({
		passed: 0,
		failed: 0,
		cases:0,
		showCollapsed: false,
		showOnlyFailed: false,

		currentSuiteNum:0,
		allPassed:0,
		allFailed:0,
		suiteCount:0,
		
		/**
		 *
		 * @param {Array} suites
		 * @param {Boolean} showCollapsed
		 * @param {Boolean} showOnlyFailed
		 */
		initialize: function( suites, showCollapsed, showOnlyFailed )
		{
			if( !( suites instanceof Array ) ) {
				throw new Error( "UnitTestBuilder constructor has to be given an array of suite objects" );
			}
			this.showCollapsed = showCollapsed != undefined && showCollapsed === true ? true : false;
			this.showOnlyFailed = showOnlyFailed != undefined && showOnlyFailed === true ? true : false;
			for( var i=0; i<suites.length; i++ )
			{
				  YUITest.TestRunner.add( suites[i] );
			}

			this.suiteCount = suites.length;

			YUITest.TestRunner.subscribe( YUITest.TestRunner.TEST_SUITE_BEGIN_EVENT, this.suiteBeginListener.bind(this) );
			YUITest.TestRunner.subscribe( YUITest.TestRunner.TEST_SUITE_COMPLETE_EVENT, this.completeListener.bind(this) );
			YUITest.TestRunner.subscribe( YUITest.TestRunner.TEST_PASS_EVENT, this.passListener.bind(this) );
			YUITest.TestRunner.subscribe( YUITest.TestRunner.TEST_CASE_BEGIN_EVENT, this.caseStartListener.bind(this) );
			YUITest.TestRunner.subscribe( YUITest.TestRunner.TEST_CASE_COMPLETE_EVENT, this.caseCompleteListener.bind(this) );
			YUITest.TestRunner.subscribe( YUITest.TestRunner.TEST_FAIL_EVENT, this.failListener.bind(this) );
			YUITest.TestRunner.run();
		},

		suiteBeginListener: function( e )
		{
		    if( e.testSuite.name.match(/^yuitests/) ) return;
			console.log( "############################ " + e.testSuite.name + " ################################### " );
			console.group();
		},

		caseStartListener: function( e )
		{
			console.time( "time" );
			var meth = this.showCollapsed ? "groupCollapsed" : "group";
			console[meth]( "TESTCASE: " + e.testCase.name );
			this.cases++;

		},
		caseCompleteListener: function( e )
		{
			console.groupEnd();
		},
		completeListener: function( e )
		{
			if( e.results.name.match(/^yuitests/) ) return;
			var meth;
			if( this.failed > 0 ) {
				meth = "error";
			}else{
				meth = "info";
			}
			var resultsXML = e.results;
			var assertions = this.failed + this.passed;
			console.groupEnd();
			console[meth]( "\n+++++++++++++++++++++++++++++++ RESULTS ++++++++++++++++++++++++++++++++++++++\nCases:"+ this.cases + " | Assertions:" + assertions + " | Passed:" + this.passed + " | Failed:" + this.failed + "\n++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n\n\n" );
			this.allPassed += this.passed;
			this.allFailed += this.failed;
			this.failed = 0;
			this.passed = 0;
			this.cases = 0;

		},
		passListener: function( e )
		{
			if( !this.showOnlyFailed ) {
				console.info( "OK:",  e.testName );
			}
			this.passed++;
		},
		failListener: function( e )
		{
			console.error( "FAILED: " +  e.testName + " (`"+e.error.message+"`) " + " - " + e.error.name + " (Given:" + e.error.expected+")" );
			this.failed++;
			//console.groupCollapsed ( "FAIL DETAIL: ", e.error  );
			//console.trace();
		}
	});
})();


(function(){
	PyrTestCase = new Class
	({
		Extends: YUITest.TestCase
		,wasSetup: false
		,Assert: YUITest.Assert
		,ArrayAssert: YUITest.ArrayAssert
		,ObjectAssert: YUITest.ObjectAssert
		,assertEquals: function( expected, actual, message )
		{
			return YUITest.Assert.areEqual( expected, actual, message );
		}
		,assertTrue: function( actual, message )
		{
			return YUITest.Assert.isTrue( actual, message );
		}
		,assertFalse: function( actual, message )
		{
			return YUITest.Assert.isFalse( actual, message );
		}
		,assertInstanceOf: function( expected, actual, message )
		{
			return YUITest.Assert.isInstanceOf( expected, actual, message );
		}
		,assertTypeOf: function( expectedType, actualValue, message )
		{
			return YUITest.Assert.isTypeOf( expectedType, actualValue, message );
		}
		,assertHasProperty: function( propertyName, object, message )
		{
			return YUITest.ObjectAssert.hasKey( propertyName, object, message );
		}
		,assertNull: function( actual, message )
		{
			return YUITest.Assert.isNull( actual, message );
		}
		,assertUndefined: function( actual, message )
		{
			return YUITest.Assert.isUndefined( actual, message );
		}
		,assertNaN: function( actual, message )
		{
			return YUITest.Assert.isNaN( actual, message );
		}
		,assertNotNaN: function( actual, message )
		{
			return YUITest.Assert.isNotNaN( actual, message );
		}
		,assertNotUndefined: function( actual, message )
		{
			return YUITest.Assert.isNotUndefined( actual, message );
		}
		,fail: YUITest.Assert.fail

	});
	
})();