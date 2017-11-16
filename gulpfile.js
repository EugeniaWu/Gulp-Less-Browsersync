var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    less = require('gulp-less'),
    cssmin = require('gulp-clean-css');   // css压缩
    htmlmin = require('gulp-htmlmin'),   // html压缩
    uglify = require('gulp-uglify'),     // js压缩
    imagemin = require('gulp-imagemin'),   // 图片压缩
    pngquant = require('imagemin-pngquant'), //png图片深度压缩
    cache = require('gulp-cache');  //只压缩修改的图片,没修改的从cache读取

var reload = browserSync.reload;

var src = {
    less: 'app/less/*.less',
    css: 'app/css/*.css',
    html: 'app/*.html',
    js: 'app/js/*.js',
    img: 'app/img/*.{png,jpg,gif,ico}'
};

// Static Server + watching less  files
gulp.task('serve', ['less'], function() {             //  生产环境
    browserSync({
        server: './app'
    });
    gulp.watch(src.less, ['less']);
});


// less 转 css
gulp.task('less',function(){
   return gulp.src(src.less).pipe(less()).pipe(gulp.dest('app/css')).pipe(reload({ stream: true }));
});



gulp.task('uglify', ['css','html','script','imageMin'], function() {   // 压缩环境
  browserSync({
      server: './dist'
  });
})

// 压缩html
gulp.task('html', function() {
  var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
  return gulp.src(src.html)
    .pipe(htmlmin(options))
    .pipe(gulp.dest('./dist')).on("end", reload);  // 监控到输出完，就reload。
});

//压缩js
gulp.task("script",function(){
    gulp.src(src.js)
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});


// css压缩
gulp.task('css',function(){ // dist环境下的
  return gulp.src(src.css).pipe(cssmin()).pipe(gulp.dest('dist/css'));
})

// 压缩图片
gulp.task('imageMin', function () {
    return gulp.src(src.img)
        .pipe(cache(imagemin({
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            svgoPlugins: [{removeViewBox: false}], //不要移除svg的viewbox属性
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        })))
        .pipe(gulp.dest('dist/img')) // stream是局部刷新，pipe(reload),是刷新浏览器。
});

gulp.task('compress', ['uglify']);         //  生产环境下，压缩代码

gulp.task('default', ['serve']);   // 开发环境，只将less转css
