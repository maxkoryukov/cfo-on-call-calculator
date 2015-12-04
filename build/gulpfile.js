var
	gulp = require('gulp'),
	less = require('gulp-less'),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	//csso = require('gulp-csso'),
	notify = require('gulp-notify'),
	minifycss = require('gulp-minify-css'),
	gutil = require( 'gulp-util' );

	//csslint = require('gulp-csslint');
var browserify = require('browserify');
var browserifyGlobs = require('gulp-browserify-globs');
var del = require('del');
var vinylPaths = require('vinyl-paths');

var dest_root = '../dist/calcseven-plugin';
// var pcfg = require('./private.config.json');

gulp.task('clean', function()
{
	var d = function(x){ return del(x, {'force':true}); };
	// return del(['../dist/calcseven-plugin/**/*'], { 'force' : true });
	return gulp.src(
			['../dist/calcseven-plugin/**/*']
		)
		.pipe(vinylPaths(d))
		.pipe(notify({ onLast:true, message: 'CLEAN task complete' }));
});


// Styles
gulp.task('css', function()
{
	return gulp.src(
			[
				'../src/*.less',
			]
		)
		.pipe(less())
		//.pipe(concat('styles.css'))
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(rename({suffix: '.min' }))
		.pipe(minifycss())
		//.pipe(csso())

		//.pipe(csslint( {"adjoining-classes" : false} ))
		//.pipe(csslint.reporter())

		.pipe(gulp.dest(dest_root))
		.pipe(notify({ onLast:true, message: 'CSS task complete' }));
});


// Javascript
gulp.task('js', function()
{
	return browserifyGlobs(
			[
					'../src/*.js',
			]
		)

		.pipe(rename({
			suffix: '.min',
			basename: "cfo-on-call-calcseven",
			extname: ".js"
		}))


		//.pipe(buffer())
		.pipe(uglify())
		.on('error', notify)

		//.pipe(csslint( {"adjoining-classes" : false} ))
		//.pipe(csslint.reporter())

		.pipe(gulp.dest(dest_root))
		.pipe(notify({ onLast:true, title:'Task JS', message: 'Completed to the : <%= file.relative %>' }))
});

gulp.task('php', function() {
	return gulp.src(
			[
				'../src/calcseven*.php',
				'../src/plugin.php',
			]
		)
		.pipe(gulp.dest(dest_root))
		.pipe(notify({ onLast:true, message: 'PHP task complete' }));
});



gulp.task('docs', ['docs:markdown'], function()
{
	return gulp.src(
			[
				'../docs/*',
			]
			, {base: '../'}
		)
		.pipe(gulp.dest(dest_root))
		.pipe(notify({ onLast:true, message: 'DOCS task complete' }));
});
gulp.task('docs:markdown', function()
{
	return gulp.src(
			[
				'../README.md',
				'../CHANGELOG.md',
			]
			, {base: '../'}
		)
		.pipe(gulp.dest(dest_root));
});



gulp.task('default', ['docs', 'css', 'js', 'php'], function()
{
	return;
});
