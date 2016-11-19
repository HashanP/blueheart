const gulp = require("gulp");
const babel = require("gulp-babel");
const webpack = require("webpack-stream");

gulp.task("default", function () {
  return gulp.src("./public/main.jsx")
    .pipe(webpack())
    .pipe(babel())
    .pipe(gulp.dest("./public"));
});
