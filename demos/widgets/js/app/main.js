(function(global) {

    global.widgets = global.widgets || {};

	var Application = soma.Application.extend({
		constructor: function(element) {
			this.element = element;
			soma.Application.call(this);
		},
		init: function() {

			var loader = new soma.module.Module({
				urlArgs: '',
				paths: {
					views: 'js/app/views',
					models: 'js/app/models',
					libs: 'js/libs',
					text: 'js/libs/require-text',
					image: 'js/libs/require-image'
				}
//				shim: {
//					'modules/module2/main': {
//						exports: 'widgets.Module2'
//					},
//					'modules/module2/model': {
//						exports: 'widgets.Model2'
//					}
//				}
//				modules: [
//					{
//						name: 'main',
//						include: [
//							'libs/soma-template',
//							'models/model',
//							'views/view'
//						]
//					},
//					{
//						name: 'module1',
//						include: [
//							'modules/module1/main'
//						]
//					}
//				]
			});
//
//			module.add('main', [
//				'libs/soma-template',
//				'models/model',
//				'views/view'
//			]);
//
//			module.add('module1', [
//				'modules/module1/main',
//				'modules/module1/model',
//				'text!modules/module1/module.html'
//			]);
//
//			module.add('module2', [
//				'modules/module2/main',
//				'modules/module2/model',
//				'text!modules/module2/module.html'
//			]);

			loader.add('main', {
				'soma-template': 'libs/soma-template',
				'widgets.Model': 'models/model',
				'widgets.View': 'views/view'
			});

			loader.add('module1', [
				'modules/module1/main',
				'modules/module1/model',
				'text!modules/module1/module.html',
				'image!modules/module1/nature.jpg',
				'image!images/nature2.jpg'
			]);

			loader.add('module2', {
				'widgets.Module2': 'modules/module2/main',
				'widgets.Model2': 'modules/module2/model',
				'html': 'text!modules/module2/module.html',
				'img': 'image!modules/module2/nature.jpg',
				'external-img': 'image!images/nature3.jpg'
			});

//			module.add('module2', [
//				'modules/module2/main',
//				'modules/module2/model',
//				'text!modules/module2/module.html'
//			]);

			console.log(loader.print());

			loader.load('main', function(template, Model, View) {
				console.log('main module loaded');
				this.createPlugin(template.Plugin);
				this.injector.mapClass('model', Model, true);
				this.createTemplate(View, this.element);
			}.bind(this));

			this.injector.mapValue('module', loader);

		}
	});

	var app = new Application(document.querySelector('.app'));

})(this);


//{
//	urlArgs: '',
//		baseUrl: './assets/js',
//	paths: {
//	    // libs
//	    soma: ' ./libs/soma',
//		template: './libs/soma-template',
//		preloadjs: './libs/preloadjs-0.3.0.min',
//		classlist: './libs/class-list.min',
//		text: './libs/require-text',
//		css: './libs/require-css',
//		modernizr: './libs/modernizr',
//		skyboxui: './libs/skybox-ui',
//		reqwest: './libs/reqwest',
//		fastbutton: './libs/fastbutton',
//		slider: './libs/slider',
//		// app paths
//		utils: './app/utils',
//		wires: './app/wires',
//		views: './app/views',
//		commands: './app/commands',
//		models: './app/models',
//		constants: './app/constants',
//		services: './app/services',
//		components: './app/components',
//		vo: './app/vo',
//		partials: '../partials',
//		json: '../json',
//		styles: '../styles'
//},
//	shim: {
//		'template': {
//			deps: ['soma']
//		},
//		'modernizr': {
//			exports: 'Modernizr'
//		}
//	}
//}