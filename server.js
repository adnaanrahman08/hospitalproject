const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static('.'));

// Serve static files from the "models" directory
app.use('/models', express.static('models'));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
