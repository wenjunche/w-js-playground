let gulp = require('gulp');
let useref = require('gulp-useref');
let uglify = require('gulp-uglify');
let gulpIf = require('gulp-if');

gulp.task('useref', () => {
   return gulp.src('index.html')
       .pipe(useref())
       .pipe(gulpIf('*.js', uglify()))
       .pipe(gulp.dest('dist'))
});