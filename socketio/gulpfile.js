let gulp = require('gulp');
let webpack = require('webpack');
let webpackStream = require('webpack-stream');
let config = require('./webpack.config.js');

gulp.task('default', () => {
    return gulp.src('clientTS.js')
        .pipe(webpackStream(config, webpack))
        .pipe(gulp.dest('dist'))
});