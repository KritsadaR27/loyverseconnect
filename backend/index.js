const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = 8080;

app.get('/run-script', (req, res) => {
  exec('go run main.go', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).send(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      res.status(500).send(`stderr: ${stderr}`);
      return;
    }
    res.send(stdout);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
