var fs          	= require('fs');
var path			= require('path');
var spawn            = require('child_process').spawn;
var gulp        	= require('gulp');
var sass            = require('node-sass');
var webpack         = require('webpack');
var webpackConfig   = require('./webpack.config');
var browserSync     = require('browser-sync-webpack-plugin');
var ts_project	    = require('gulp-typescript').createProject('./src/server/tsconfig.json');

var server_proc;

function sassNodeModulesImporter(url, file, done){
    // if it starts with a tilde, search in node_modules;
    if (url.indexOf('~') === 0){
        var nmPath = path.join(__dirname, 'node_modules', url.substring(1)||'');
        return done({ file: nmPath });
    } else {
        return done({ file: url });
    }
}

gulp.task('compile_node', function(){
	return gulp.src('./src/server/**/*.ts')
	.pipe(ts_project()).js
	.pipe(gulp.dest('dist/server/'));
});

gulp.task('compile_root_styles', ['copy_client_assets'], function(done){
    sass.render({
        file: 'src/client/styles.scss',
        outputStyle: 'compressed',
        importer: sassNodeModulesImporter
    }, function(err, result){
        if(err){
            throw err;
        }
        fs.writeFileSync('dist/client/styles.min.css', result.css);
        return done();
    });
});

gulp.task('copy_client_assets', function(){
  return gulp.src(['src/client/assets/**/*'])
      .pipe(gulp.dest('dist/client/assets'));
});

gulp.task('copy_fonts', ['copy_client_assets'], function(){
  return gulp.src(['node_modules/font-awesome/fonts/*', 'src/client/fonts/*'])
      .pipe(gulp.dest('dist/client/fonts'));
});

gulp.task('start-server', ['compile_node'], function(){
    if (server_proc) {
        server_proc.kill();
        server_proc = undefined;
    }
    server_proc = spawn('node', ['dist/server/app.js'], {
        cwd: __dirname,
        stdio: [0, 1, 2, 'ipc']
    });
});

gulp.task('webpack', function(done) {
    var config = webpackConfig;
    
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true,
            },
            output: {
                comments: false
            }
        })
    );
    return webpack(config, function(err, stats){
        if (err) {
            console.error(err);
        }
        if (stats.hasErrors()) {
            if (stats.compilation.errors) {
                stats.compilation.errors.forEach(function(e){console.error(e,'\n');});
            } else {
                console.log(stats);
            }
        }
        return done(err);
    });
});

gulp.task('webpack-watch', function() {
    var config = webpackConfig;
    config.watch = true;
    config.cache = true;
    config.bail = false;
    config.devtool = 'source-map';
    config.stats = 'errors-only';
    config.module.rules.push(
        {
            enforce: 'pre',
            test: /\.ts$/,
            use: 'source-map-loader'
        }
    );
    config.plugins.push(
        new browserSync({
            host: 'localhost',
            port: 3001,
            proxy: 'localhost:3000',
            ws: true,
            open: !(process.env.DOCKER_MODE)
        })
    );
    webpack(config, function(err, stats) {
        if (err) {
            console.error(err);
        }
        if (stats.hasErrors()) {
            if (stats.compilation.errors) {
                stats.compilation.errors.forEach(function(e){console.error(e,'\n');});
            } else {
                console.log(stats);
            }
        }
    });
});

gulp.task('copy', ['compile_root_styles', 'copy_client_assets', 'copy_fonts']);

gulp.task('watch', ['copy', 'start-server', 'webpack-watch'], function(){
  	console.log('watching for changes...');
	gulp.watch(['src/client/assets/**/*'], ['copy_client_assets']);
	gulp.watch(['src/client/styles.scss'], ['compile_root_styles']);
	gulp.watch(['node_modules/font-awesome/fonts/*', 'src/client/fonts/*'], ['copy_fonts']);
	gulp.watch(['src/server/**/*.ts'], ['start-server']);
});

// Default Task
gulp.task('default', ['copy', 'compile_node', 'webpack']);