var pkg = require('./package.json');
var dirs = pkg['configs'].directories;
var concat = require('gulp-concat');
var del = require('del');
var gulp = require('gulp');
var ts = require('gulp-typescript');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var tsConfigs = {
    node: require(dirs.ts + '/tsconfig.json')
};

gulp.task('build-node', ['clean', 'ts-node']);
gulp.task('build-browser', ['clean', 'ts-browser']);

function getTsBuilder(config) {
    return function() {
        config.compilerOptions = config.compilerOptions || {};
        config.compilerOptions.sortOutput = true;

        // TS doesn't like compiling into one file with modules. So screw you tsc.
        //var out = config.compilerOptions.out;
        //delete config.compilerOptions.out;

        var tsResult = gulp.src(dirs.ts + "/**/*.ts")
            .pipe(ts(config.compilerOptions));

        var toPipe = config.compilerOptions.out
            ? tsResult.js.pipe(concat(config.compilerOptions.out))
            : tsResult.js;

        return toPipe.pipe(gulp.dest(dirs.dist));
    }
}

gulp.task('ts-node', getTsBuilder(tsConfigs.node));
gulp.task('ts-browser', ['ts-node'], function() {
    return browserify(dirs.dist + '/index.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(dirs.dist));
});

gulp.task('clean', function (done) {
    del([
        dirs.dist
    ], done);
});
