requirejs.config({
  baseUrl: '/js',
  paths: {
    jquery: 'lib/jquery-2.10.0-min',
    bootstrap: 'lib/bootstrap',
    chat: 'chat'
  }
});

requirejs(['chat']);