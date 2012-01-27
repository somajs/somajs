console.log('------ FROM test-native.js ----------------');
//
//var SomaApp = function(){
//	soma.core.Application.call(this);
//};
//SomaApp.prototype = new soma.core.Application();
//SomaApp.prototype.constructor = SomaApp;
//soma.extend(SomaApp.prototype, {
//	init: function() {
//		console.log('init');
//	}
//});
//
//var app = new SomaApp();
//
//var WireExample = function(){};
//WireExample.prototype = new soma.core.wire.Wire;
//WireExample.prototype.constructor = WireExample;
//soma.extend(WireExample.prototype, {
//	init: function() {
//		console.log('init wire');
//	}
//});
//app.addWire("wire", new WireExample());
//
//var ModelExample = function(){};
//ModelExample.prototype = new soma.core.model.Model;
//ModelExample.prototype.constructor = ModelExample;
//soma.extend(ModelExample.prototype, {
//	init: function() {
//		console.log('init model');
//	}
//});
//app.addModel("model", new ModelExample());
//
//var ViewExample = function(){};
//ViewExample.prototype = new soma.View;
//ViewExample.prototype.constructor = ViewExample;
//soma.extend(ViewExample.prototype, {
//	init: function() {
//		console.log('init view');
//	}
//});
//app.addView("view", new ViewExample());
//
//var CommandExample = function(){};
//CommandExample.prototype = new soma.core.controller.Command();
//CommandExample.prototype.constructor = CommandExample;
//soma.extend(CommandExample.prototype, {
//	execute: function() {
//		console.log('execute command');
//	}
//});
//
//app.addCommand("eventType", CommandExample);
//app.dispatchEvent(new soma.Event("eventType"));
//document.body.dispatchEvent(new soma.Event("eventType"));
//var div = document.createElement("div");
//document.body.appendChild(div);
//div.dispatchEvent(new soma.Event("eventType"));
//
//console.log('------ FROM test-native.js (test compact) ----------------');
//
//var AppCompact = function() {
//	soma.core.Application.call(this);
//};
//AppCompact.prototype = new soma.core.Application();
//AppCompact.prototype.constructor = AppCompact;
//soma.extend(AppCompact.prototype, {
//	init: function() {
//		console.log("init");
//	}
//});
//
//new AppCompact();
