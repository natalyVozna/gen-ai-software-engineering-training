const app = require('./app');

const PORT = process.env.PORT || 3000;

// Express 5 passes listen errors (port busy, no permission, ...) to this callback
app.listen(PORT, (err) => {
  if (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Try PORT=3456 npm start`);
    } else {
      console.error(`Failed to start server on port ${PORT}: ${err.message}`);
    }
    process.exit(1);
  }
  console.log(`Banking API listening on http://localhost:${PORT}`);
});
