// Entry point for Hostinger, Cloud and Passenger Node.js platforms
try {
  require('./server/dist/index.js');
} catch (err) {
  console.error("Error loading server via require:", err);
  import('./server/dist/index.js').catch(e => {
    console.error("Error loading server via import:", e);
    process.exit(1);
  });
}
