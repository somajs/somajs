module.exports = function(grunt) {
	grunt.initConfig({
		concat: {
			dist: {
				src: [
					'libs/infuse.js',
					'libs/soma-events.js',
					'src/prefix.js',
					'src/helpers.js',
					'src/utils.js',
					'src/core.js',
					'src/suffix.js'
				],
				dest: 'build/soma.js'
			}
		}
	});
}