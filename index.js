// Entry point for Hostinger, Cloud and Passenger Node.js platforms
try {
  // CommonJS
  require('./server/dist/index.js');
} catch (err) {
  // ES Module fallback
  import('./server/dist/index.js');
}
