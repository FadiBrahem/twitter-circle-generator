// server.js

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Twitter API base URL
const twitterAPI = 'https://api.twitter.com/2';

// Function to get user ID by username
async function getUserID(username) {
  try {
    const response = await axios.get(
      `${twitterAPI}/users/by/username/${username}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );
    return response.data.data.id;
  } catch (error) {
    console.error('Error fetching user ID:', error.response.data);
    throw error;
  }
}

// Function to get followers
async function getFollowers(userID) {
  try {
    const response = await axios.get(
      `${twitterAPI}/users/${userID}/followers`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
        params: {
          'user.fields': 'username,name',
          max_results: 3, // Limit to 3 followers
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching followers:', error.response.data);
    throw error;
  }
}

// API Endpoint
app.get('/api/circle/:username', async (req, res) => {
  const username = req.params.username;
  try {
    // Get user ID
    const userID = await getUserID(username);

    // Get followers
    const followers = await getFollowers(userID);

    // Prepare data for visualization
    const nodes = [
      {
        id: userID,
        name: username,
        group: 1,
      },
    ];

    const links = [];

    followers.forEach((follower) => {
      nodes.push({
        id: follower.id,
        name: follower.username,
        group: 2,
      });
      links.push({
        source: follower.id,
        target: userID,
      });
    });

    res.json({ nodes, links });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from Twitter API' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// Function to get user ID by username
async function getUserID(username) {
    try {
      const response = await axios.get(
        `${twitterAPI}/users/by/username/${username}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          },
        }
      );
      return response.data.data.id;
    } catch (error) {
      console.error('Error fetching user ID:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
  