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
    node: require(dirs.src + '/tsconfig.json')
};

gulp.task('build-node', ['clean', 'ts-node']);
gulp.task('build-browser', ['clean', 'browserify', 'clean-ts-node', 'copy']);

function getTsBuilder(config, dir) {
    return function() {
        config.compilerOptions = config.compilerOptions || {};
        config.compilerOptions.sortOutput = true;

        var paths = [
            dirs.src + "/" + dir + "/**/*.ts",
            dirs.src + "/" + dir + "/**/*.tsx"
        ];

        var tsResult = gulp.src(paths)
            .pipe(ts(config.compilerOptions));

        var toPipe = config.compilerOptions.out
            ? tsResult.js.pipe(concat(config.compilerOptions.out))
            : tsResult.js;

        return toPipe.pipe(gulp.dest(dirs.dist + "/" + dir));
    }
}

gulp.task('ts-node', ['clean'], getTsBuilder(tsConfigs.node, 'core'));
gulp.task('ts-browser', ['ts-node'], getTsBuilder(tsConfigs.node, "visualization"));

// TS doesn't like compiling into one file with modules. So screw you tsc.
var compiledFile = 'bundled.js';
gulp.task('browserify', ['ts-node', 'ts-browser'], function(done) {
    return browserify(dirs.dist + '/visualization/index.js')
        .bundle()
        .pipe(source(compiledFile))
        .pipe(gulp.dest(dirs.dist));
});

//return getTsBuilder(tsConfigs.node, dirs.src + "/visualization/**/*.ts")

// Clean up after browserify
var path = require('path');
gulp.task('clean-ts-node', ['browserify'], (done) => {
    var files = [
        path.join(dirs.dist, 'core'),
        path.join(dirs.dist, 'visualization')
    ];

    del(files, done);
});

gulp.task('copy', ['clean'], () => {
    var paths = [
        dirs.src + '/index.html'
    ];

    return gulp.src(paths).pipe(gulp.dest(dirs.dist))
});

gulp.task('clean', (done) => del([dirs.dist], done));
