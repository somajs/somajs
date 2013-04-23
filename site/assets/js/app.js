;(function(ns, _gaq, undefined) {

	var ios = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );

	var clicked = false;
	var elements = $('a[name]');

	$('a').click(function() {
		var href = $(this).attr('href');
		if (href && href !== '#') {
			var category = href.indexOf('#') !== -1 ? 'menu' : 'link';
			var link = href.replace(/^#/, '');
			if (_gaq) {
				_gaq.push(['_trackEvent', category, link]);
			}
		}
	});

	$('nav > ul > li').click(function() {
		clicked = true;
		$('nav > ul > li > ul').addClass('hidden');
		$('ul', $(this)).removeClass('hidden');
	});

	$(window).scroll(function() {
		// vars
		if ($(window).width() < 960) return;

		var heightWindow = $(window).height();
		var position = $(document).scrollTop();
		var current;
		// reset
		$('nav a').removeClass('current');
		if (!clicked) $('nav > ul > li > ul').addClass('hidden');
		var i = elements.length, l = 0;
		while (--i >= 0) {
			if (position > $(elements[i]).offset().top - 150) {
				current = $(elements[i]);
				break;
			}
		}
		// assign
		var currentName = current.attr('name');
		var a = $('nav li a[href="#' + currentName + '"]');
		a.parents('ul').removeClass('hidden');
		a.addClass('current');
		a.parents('li').find('ul').removeClass('hidden');
		clicked = false;
		// ios fix
		// http://stackoverflow.com/questions/11297641/mobile-webkit-reflow-issue
		if (ios) setTimeout(forceReflow, 0);
	});

	function forceReflow(elem){
		elem = elem || document.documentElement;

		// force a reflow by increasing size 1px
		var width = elem.style.width,
			px = elem.offsetWidth+1;

		elem.style.width = px+'px';

		setTimeout(function(){
			// undo resize, unfortunately forces another reflow
			elem.style.width = width;
			elem = null;
		}, 0);
	};

})(this['ns'] = this['ns'] || {}, _gaq);
