var fs = require('fs');

module.exports = function(grunt) {

	var screenFiles = [];

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		requirejs: {
			compile: {
				options: {
					uglify:{
						mangle: false
					},
					optimize: "uglify",
					appDir: "./source",
					dir: './build',
					baseUrl: "./",
					skipDirOptimize: true,
					findNestedDependencies: true,
					"paths": {
						"views": "js/app/views",
						"models": "js/app/models",
						"libs": "js/libs",
						"text": "js/libs/require-text",
						"image": "js/libs/require-image",
						"css": "js/libs/require-css",
						"normalize": "js/libs/normalize"
					},
					map: {
						'*': {
							css: 'js/libs/require-css'
						}
					},
					"modules": [
						{
							"name": "js/app/main",
							"include": [
								"libs/soma-template",
								"models/model",
								"views/view"
							],
							"exclude": []
						},
						{
							"name": "modules/module1/main",
							"include": [
								"modules/module1/main",
								"modules/module1/js/model",
								"text!modules/module1/partials/module.html",
								"image!modules/module1/images/nature.jpg",
								"image!images/nature2.jpg",
								"css!modules/module1/styles/styles.css"
							],
							"exclude": []
						},
						{
							"name": "modules/module2/main",
							"include": [
								"modules/module2/main",
								"modules/module2/model",
								"text!modules/module2/module.html",
								"image!modules/module2/nature.jpg",
								"image!images/nature3.jpg",
								"css!modules/module2/styles.css"
							],
							"exclude": []
						},
						{
							"name": "modules/module3/main",
							"include": [
								"modules/module3/main",
								"modules/module3/model",
								"text!modules/module3/module.html"
							],
							"exclude": []
						}
					],
					"shim": {
						"libs/soma-template": {
							"exports": "soma-template"
						},
						"models/model": {
							"exports": "widgets.Model"
						},
						"views/view": {
							"exports": "widgets.View"
						},
						"modules/module2/main": {
							"exports": "widgets.Module2"
						},
						"modules/module2/model": {
							"exports": "widgets.Model2"
						},
						"text!modules/module2/module.html": {
							"exports": "html"
						},
						"image!modules/module2/nature.jpg": {
							"exports": "img"
						},
						"image!images/nature3.jpg": {
							"exports": "external-img"
						},
						"css!modules/module2/styles.css": {
							"exports": "styles"
						}
					}
				}
			}
//			compileCss: {
//				options: {
////					optimizeCss: "standard.keepLines",
//					cssIn: "./source/mobile/assets/styles/site.css",
//					out: "./build/public/mobile/assets/styles/site.css"
//				}
//			}
		}
//		cssmin: {
//			compress: {
//				files: {
//					"./build/public/mobile/assets/styles/site.css": ["./build/public/mobile/assets/styles/site.css"]
//				}
//			}
//		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	// Default task(s).
	grunt.registerTask('default', ['requirejs']);
//	grunt.registerTask('default', ['optimize', 'cssmin']);
//
//	grunt.registerTask('optimize', 'optimize', function () {
//		var done = this.async();
//		var screenPath = './source/mobile/assets/js/app/views/screens';
//		fs.readdir(screenPath, function(err, files) {
//			if (err) {
//				console.log('/GruntFile.js (optimize task) --> Error reading the files in ' + screenPath);
//			}
//			else {
//				var screenFiles = [];
//				var modules = grunt.config('requirejs.compile.options.modules');
//				for (var i= 0, l=files.length; i<l; i++) {
//					var name = files[i];
//					if (name.indexOf('.js') !== -1) {
//						modules.push({
//							name: 'views/screens/' + files[i].replace('.js', ''),
//							exclude: [
//								'app/common'
//							]
//						});
//					}
//				}
//				grunt.config('requirejs.compile.options.modules', modules);
//				grunt.task.run('requirejs');
//				done();
//			}
//		});
//	});

}