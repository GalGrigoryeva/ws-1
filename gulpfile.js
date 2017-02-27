'use strict';

var gulp = require("gulp");
var del = require("del");
var rename = require("gulp-rename");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var imagemin = require("gulp-imagemin");
var minifycss = require("gulp-clean-css");
var server = require("browser-sync");
var run = require("run-sequence");
var minify = require("gulp-minify");

gulp.task('sass', function () {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("./build/css"))
    .pipe(minifycss({compatibility: 'ie8'}))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("./build/css"))
    .pipe(server.reload({stream: true}));
});

gulp.task("minify-css", function() {
  return gulp.src("./build/css/**")
    .pipe(minifycss({compatibility: 'ie8'}))
    .pipe(gulp.dest("./build/css"))
    .pipe(rename(function(path) {
      path.basename += ".min"
    }))
    .pipe(gulp.dest("./build/css"));
});

gulp.task("images", function() {
  return gulp.src("img/**/*.{png,jpg,gif}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true})
  ]))

  .pipe(gulp.dest("build/img"));
});

gulp.task("compress", function() {
  gulp.src('js/*.js')
    .pipe(minify({
        ext:{
            src:'.js',
            min:'.min.js'
        },
        exclude: ['tasks']
    }))
    .pipe(gulp.dest("./build/js"));
});

gulp.task("serve", function() {
  server.init({
      server: "./build"
  });

  gulp.watch("sass/**/*.scss", ["style"]);
  gulp.watch("*.js/*.js");
  gulp.watch("*.html")
    .on("change", server.reload);
});

gulp.task("copy", function() {
  return gulp.src([
      "img/**",
      "fonts/**",
      "js/**",
      "*.html"
    ], {
      base: "."
    })
    .pipe(gulp.dest("./build"));
});

gulp.task("copycss", function() {
  return gulp.src([
      "css/normalize.css",
    ], {
      base: "."
    })
    .pipe(gulp.dest("./build"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("build", function(fn) {
  run(
    "clean",
    "copy",
    "copycss",
    "style",
    "minify-css",
    "images",
    "compress",
    fn
  );
});
