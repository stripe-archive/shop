module.exports = function(grunt) {
  // configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        report: 'min'
      },
      build: {
        files: {
          'public/assets/js/shop.min.js': ['public/assets/js/bag.js',
            'public/assets/js/underscore.min.js',
            'public/assets/js/requestanimationframe.js',
            'public/assets/js/tween.min.js', 'public/assets/js/spin.min.js',
            'public/assets/js/animation.js', 'public/assets/js/shop.js',
            'public/assets/js/ga.js'],
        }
      }
    },

    sass: {
      options: {
        style: 'compressed',
        bundleExec: true,
      },
      build: {
        files: {
          'public/assets/css/shop.min.css': 'public/assets/css/shop.scss'
        }
      }
    },

    watch: {
      css: {
        files: 'public/assets/css/shop.scss',
        tasks: 'sass'
      },
      js: {
        files: ['public/assets/js/bag.js', 'public/assets/js/underscore.min.js',
          'public/assets/js/requestanimationframe.js',
          'public/assets/js/tween.min.js', 'public/assets/js/spin.min.js',
          'public/assets/js/animation.js', 'public/assets/js/shop.js',
          'public/assets/js/ga.js'],
        tasks: 'uglify'
      }
    }
  });

  // plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // tasks
  grunt.registerTask('default', ['uglify', 'sass', 'watch']);
};
