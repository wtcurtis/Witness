var pkg = require('./package.json');
var dirs = pkg['configs'].directories;
var concat = require('gulp-concat');
var del = require('del');
var gulp = require('gulp');
var ts = require('gulp-typescript');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var glob = require('glob');

var tsConfigs = {
    node: require(dirs.ts + '/tsconfig.json')
};

gulp.task('build-node', ['clean', 'ts-node']);
gulp.task('build-browser', ['clean', 'ts-browser', 'clean-ts-node', 'copy']);

function getTsBuilder(config) {
    return function() {
        config.compilerOptions = config.compilerOptions || {};
        config.compilerOptions.sortOutput = true;

        var tsResult = gulp.src(dirs.ts + "/**/*.ts")
            .pipe(ts(config.compilerOptions));

        var toPipe = config.compilerOptions.out
            ? tsResult.js.pipe(concat(config.compilerOptions.out))
            : tsResult.js;

        return toPipe.pipe(gulp.dest(dirs.dist));
    }
}

gulp.task('ts-node', getTsBuilder(tsConfigs.node));

// TS doesn't like compiling into one file with modules. So screw you tsc.
var compiledFile = 'bundled.js';
gulp.task('ts-browser', ['ts-node'], function(done) {
    return browserify(dirs.dist + '/index.js')
        .bundle()
        .pipe(source(compiledFile))
        .pipe(gulp.dest(dirs.dist));
});

// Clean up after browserify
var path = require('path');
gulp.task('clean-ts-node', ['ts-browser'], (done) => {
    glob(dirs.dist + '/*.js', (err, files) => {
        files = files.filter(f => path.basename(f) !== compiledFile);
        del(files, done);
    });
});

gulp.task('copy', () => gulp.src(dirs.src + '/index.html').pipe(gulp.dest(dirs.dist)));

gulp.task('clean', (done) => del([dirs.dist], done));
