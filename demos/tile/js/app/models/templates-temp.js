angular.module('templates-main', ['tile-item.tpl.html']);

angular.module('tile-item.tpl.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('tile-item.tpl.html',
    '<div data-id="{{data.id}}">\n' +
    '	{{data.title}}\n' +
    '	<img data-src="{{data.img}}" />\n' +
    '	<button data-click="remove()"></button>\n' +
    '</div>\n' +
    '');
}]);
