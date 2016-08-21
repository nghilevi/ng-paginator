var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
require('gulp-release-easy')(gulp, {releaseBranch: 'master'});
var merge2 = require('merge2');
var sass = require('gulp-sass');
var gulpSequence = require('gulp-sequence');
var cleanCSS = require('gulp-clean-css');
var del = require('del');

gulp.task('clean', function () {
    return del(['dist/*.*']);
});

// STYLES
gulp.task('sass', function () {
    return gulp.src('src/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dist'));
});

gulp.task('css-min', function() {
    return gulp.src('dist/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe($.rename('ng-paginator.min.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-css', function (cb) {
    return gulpSequence('sass', 'css-min', cb);
});

// JS
gulp.task('js', function () {
    return merge2(
        gulp.src('src/*.html')
            .pipe($.minifyHtml({empty: true}))
            .pipe($.ngtemplate({
                    module: 'ngPaginator'
                    // standalone: true, // true means it will breate angular.module('ngPaginator',[])
                })
            ), gulp.src(['src/**/*.js', '!src/**/*.spec.js'])
        )
        .pipe($.angularFilesort())
        .pipe($.concat('ng-paginator.js'))
        .pipe($.ngAnnotate())
        .pipe($.wrap('(function(){\n    \'use strict\';\n    <%= contents %>\n})();\n\n'))
        .pipe(gulp.dest('dist'));
});

gulp.task('js-min', function () {
    return gulp.src('dist/ng-paginator.js')
        .pipe($.uglify())
        .pipe($.rename('ng-paginator.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-js', function (cb) {
    return gulpSequence('js', 'js-min', cb);
});

// BUILD
gulp.task('build', ['clean','build-js', 'build-css']);

gulp.task('server', ['build'], function () {
    return gulp.src(['demo', 'node_modules', 'dist'])
        .pipe($.webserver({
            port: 8080,
            livereload: true,
            open: true
        }));
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.js', ['build-js']);
    gulp.watch('./sass/**/*.scss', ['build-css']);
});

gulp.task('default', ['server','watch']);