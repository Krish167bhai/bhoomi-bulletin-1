// Entry point for Hostinger, Cloud and Passenger Node.js platforms
process.on('uncaughtException', (err) => {
  console.error("CRITICAL UNCAUGHT EXCEPTION:", err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error("CRITICAL UNHANDLED REJECTION:", reason);
});

try {
  require('./server/dist/index.js');
} catch (err) {
  console.error("Failed to require server:", err);
  const http = require('http');
  const server = http.createServer((req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Bhoomi Bulletin Server Crashed on Startup.\n\nError: ' + err.message + '\n\nStack:\n' + err.stack);
  });
  server.listen(process.env.PORT || 5000, '0.0.0.0');
}
