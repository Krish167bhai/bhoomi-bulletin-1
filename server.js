// Universal entry point for Hostinger Node.js / Passenger
try {
  require('./server/dist/index.js');
} catch (err) {
  import('./server/dist/index.js');
}
