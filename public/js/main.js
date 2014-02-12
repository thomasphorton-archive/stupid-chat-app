requirejs.config({
  baseUrl: '/js',
  paths: {
    jquery: 'jquery-2.10.0-min',
    underscore: 'underscore-min',
    backbone: 'backbone-min',
    bootstrap: 'bootstrap'
  }

});

requirejs(['jquery'],
  function ($) {

  });