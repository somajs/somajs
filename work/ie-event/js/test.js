var app = new soma.core.Application();
var COMMANDS_LIST = {
	My_EVENT: "myEvent"
};

function log( value )
{
     if( window["console"] ) {
         console.log( value );
         return;
     }
    if( typeof value == "object" )  {
        var _v = value;
        value = "";
        for( var i in _v )
        {
            value += i + " : " + _v[i] + "<br>";
        }
    }
    $("output").set( "html",  $("output").get("html") +  "<br>" + value );
}


var MyCommand = new Class({
	Extends: soma.core.controller.Command,
	execute: function(event) {
        log( "execute command");
	}
});

app.addCommand(COMMANDS_LIST.My_EVENT, MyCommand);

var MyWire = new Class({
	Extends: soma.core.wire.Wire,
	init: function(event) {
        log( 'init wire');
		this.addEventListener(COMMANDS_LIST.My_EVENT, this.handler );
	},
	handler: function(event) {
		event.preventDefault();
        log( "handler: " + event.type + ", parameters.prop1:" + event.parameters.prop1 );
	}
});

app.addWire("myWire", new MyWire());

var MyView = new Class({
	Extends: soma.View,
	button: null,
	init: function() {
		this.button = document.getElementById('bt');
		//this.button.attachEvent('onclick', this.clickHandler.bind(this));
        $(this.button).addEvent( "click", this.clickHandler.bind( this ) );
	},
	clickHandler: function(event) {
		this.dispatchEvent( new soma.Event( COMMANDS_LIST.My_EVENT, {prop1:"value1", prop2:"value2"}, true, true  ) );

	}
});

app.addView("myView", new MyView());


