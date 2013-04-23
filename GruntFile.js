module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-shell');

	grunt.initConfig({
		pkg:'<json:package.json>',
		shell: {
			delete_build_folder: {
				command: 'rm -r build/',
				stdout: true
			},
			update_build_from_master: {
				command: 'git checkout origin/master-dev-v2 build',
				stdout: true
			},
			delete_demos_folder: {
				command: 'rm -r demos/',
				stdout: true
			},
			update_demos_from_master: {
				command: 'git checkout origin/master-dev-v2 demos',
				stdout: true
			},
			delete_tests_folder: {
				command: 'rm -r tests/',
				stdout: true
			},
			update_tests_from_master: {
				command: 'git checkout origin/master-dev-v2 tests',
				stdout: true
			}
		}
	});

	grunt.registerTask('default', 'shell');
}
