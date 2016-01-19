module.exports = function(grunt) {

    'use strict';

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        babel: {
            options: {
                sourceMap: false,
                presets: ['es2015']
            },
            dist: {
                files: {
                    'dist/soma-es6.js': 'src/main.js'
                }
            }
        },
        browserify: {
            options: {
                browserifyOptions: {
                    standalone: 'soma'
                }
            },
            dist: {
                files: {
                    'dist/soma.js': ['dist/soma-es6.js']
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

    grunt.registerTask('build', ['jshint', 'babel', 'browserify']);

};
