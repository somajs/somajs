var StartCommand = new Class
({
	Extends: pyroma.core.controller.Command,

	execute: function( type, data )
	{
		console.log( "StartCommand::execute():", type, data );
		this.addWire( ColorWire.NAME, new ColorWire() );
		this.fireEvent( CommandEventList.COLORDATA_LOAD );
	}
});
