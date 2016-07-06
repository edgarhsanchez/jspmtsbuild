var gulp = require('gulp');
var using = require('gulp-using');
var jspm = require('gulp-jspm');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var filter = require("gulp-filter");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var stylus = require('gulp-stylus');
var cssmin = require('gulp-cssmin');
var jade = require('gulp-jade');
var path = require('path');

var run_sequence = require('run-sequence').use(gulp);

var isDev = false;

var APP_TS = {
    src: 'app/**/*.ts'
};

var APP_CODE = {
    src: 'app/**/*.js'
};

var APP_STYLUS = {
    src: 'app/**/*.styl'
};

var APP_IMAGES_FONTS = {
    src: 'app/**/*.{ico,jpg,svg,bmp,jpeg,gif,png,tiff,psd,woff,woff2,ttf}'
}

var APP_JADE = {
    src: 'app/**/*.jade'
};

var APP_BUILDDIR = 'public';
var TS_BUILDDIR = 'tspublic';

gulp.task('clean', function () {
    var del = require('del');
    var deleteFiles = [];
    deleteFiles.push(path.join(TS_BUILDDIR, '**/*.*'));
    deleteFiles.push(path.join(APP_BUILDDIR, '**/*.*'));
    return del(deleteFiles);
});

gulp.task('images_fonts', function(){
    return gulp.src(APP_IMAGES_FONTS.src)
        .pipe(gulp.dest(APP_BUILDDIR));
});

gulp.task('app', function () {
    var appTsFilter = filter(['**', '!**/*.spec.ts'], {restore: false});
    var tsProject = ts.createProject('tsconfig.json')
    var tsResult = tsProject.src()
        .pipe(appTsFilter)
        .pipe(ts(tsProject))
    return tsResult.js.pipe(gulp.dest(TS_BUILDDIR))
});

gulp.task('app-stylus', function () {
    return gulp.src(APP_STYLUS.src)
        .pipe(stylus())
        .pipe(cssmin())
        .pipe(gulp.dest(TS_BUILDDIR));
});


gulp.task('jspm', function () {
    return gulp.src(path.join(TS_BUILDDIR, 'app.js'))
        .pipe(jspm({ selfExecutingBundle: true }))
        .pipe(gulp.dest(APP_BUILDDIR));
});


gulp.task('markup', function (next) {
    var tplFilter = filter(['**', '!**/*.tpl.jade'], {restore: true});
    var tplOnlyFilter = filter(['**/*.tpl.jade'], {restore: true});
    return gulp.src(APP_JADE.src)
        .pipe(tplFilter)
        .pipe(jade())
        .pipe(gulp.dest(APP_BUILDDIR))
        .pipe(tplFilter.restore)
        .pipe(tplOnlyFilter)
        .pipe(gulp.dest(TS_BUILDDIR))
        .pipe(tplOnlyFilter.restore);
});


gulp.task('default:dev', function (callback) {
    isDev = true;
    run_sequence('clean', ['images_fonts', 'app', 'markup', 'app-stylus'], 'jspm', callback);
});

gulp.task('default', function (callback) {
    isDev = false;
    run_sequence('clean', ['images_fonts', 'app', 'markup', 'app-stylus'], 'jspm', callback);
});