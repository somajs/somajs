module.exports = function(grunt) {

    'use strict';

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        copy: {
            libs: {
                files: [
                    {src: ['node_modules/infuse.js/src/infuse.js'], dest: 'tmp/libs/infuse.js', filter: 'isFile'}
                    // {src: ['node_modules/soma-events/src/soma-events.js'], dest: 'dist/libs/soma-events.js', filter: 'isFile'}
                ]
            }
        },
        babel: {
            options: {
                sourceMap: false,
                presets: ['es2015']
            },
            dist: {
                files: {
                    'tmp/soma.js': 'src/main.js'
                }
            }
        },
        browserify: {
            dist: {
                options: {
                    browserifyOptions: {
                        standalone: 'soma'
                    }
                },
                files: {
                    'dist/soma.js': [
                        'tmp/soma.js',
                        'tmp/libs/infuse.js'
                    ]
                }
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            all: ['src/**/*.js']
        }
    });

    grunt.registerTask('build', ['jshint', 'copy', 'babel', 'browserify']);

};
