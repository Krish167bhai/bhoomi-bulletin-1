// Entry point for Hostinger, Cloud and Passenger Node.js platforms
try {
  require('./server/dist/index.js');
} catch (err) {
  import('./server/dist/index.js');
}
