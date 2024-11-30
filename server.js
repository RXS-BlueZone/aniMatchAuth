const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000; // Choose a port

app.use(express.json()); // Needed to parse JSON requests

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Example route to fetch data from AniList
app.post('/fetch-anilist', async (req, res) => {
  const { query, variables } = req.body;

  // Validate the request body (optional, but good practice)
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required.' });
  }

  try {
    const anilistResponse = await axios.post('https://graphql.anilist.co', {
      query,
      variables,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    res.json(anilistResponse.data);
  } catch (error) {
    console.error('Error fetching from AniList:', error);
    res.status(500).json({ error: 'Failed to fetch data from AniList.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});