const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app){
  app.use(
      createProxyMiddleware('/room', {
          target: 'http://localhost:5000/',
          changeOrigin: true
      })
  );
  app.use(
      createProxyMiddleware('/auth', {
          target: 'http://localhost:5000/',
          changeOrigin: true
      })
  );
  app.use(
    createProxyMiddleware('/user', {
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  app.use(
    createProxyMiddleware('/movingdot', {
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  app.use(
    createProxyMiddleware('/socket.io', {
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};
