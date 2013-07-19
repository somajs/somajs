(function() {

	define([
		'image!modules/module3/nature.jpg',
		'image!images/nature2.jpg',
		'css!modules/module3/styles.css'
	], function(image, externalImage, css) {

		console.log('REQUIRED', image, externalImage, css);

		var Module3 = function(target, modelText) {

			console.log('[module3] created', target, modelText, image, externalImage);

			target.appendChild(image.cloneNode(true));

			var template = soma.template.create(target);
			var scope = template.scope;

			scope.img = externalImage.src;

			template.render();

		};

		return Module3;

	});

})();
