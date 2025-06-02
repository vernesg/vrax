const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Vrax is running!');
});

const port = process.env.PORT || 10000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
