const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app){
  app.use(
      createProxyMiddleware('/public', {
          target: 'http://localhost:5000/',
          changeOrigin: true
      })
  );
  app.use(
      createProxyMiddleware('/room', {
          target: 'http://localhost:5000/',
          changeOrigin: true
      })
  );
  app.use(
    createProxyMiddleware('/socket.io', {
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};
