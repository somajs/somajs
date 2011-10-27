


var InvocationTest = new Class
({
	Extends: PyrTestCase,

	name: "InvocationTest",

	soma: null,

	somaViewTestObj: null,

	domtreeTestNode: null,

	setUp: function()
	{
		this.soma = new soma.core.Core();
		//this.somaViewTestObj = this.soma.addView(  );
	}

	,tearDown: function()
	{

	}

	,testCommandInvocationFromViewObject: function()
	{
		this.assertTrue( false );
	}

	,testCommandInvocationFromDisplayObjectNotRegisteredAsViewInSoma: function()
	{
		this.assertTrue( false );
	}

});



