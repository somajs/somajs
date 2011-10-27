/*
document.id("test").addEventListener( "click", testListener, true );
document.id("test").addEventListener( "testEvent", testListener, true );
document.id( "testOuter1" ).addEventListener( "click", testListener, true );

var e = document.createEvent("HTMLEvents");
e.initEvent(
	"testEvent",
	false,
	true
)
console.log( e );
document.id("test").dispatchEvent( e );
*/