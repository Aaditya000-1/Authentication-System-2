require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
const User = require('./models/user');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Mongo connected'))
.catch(err => {
  console.error('MongoDB error:', err);
  process.exit(1);
});

// Simple HEALTHCHECK route
app.get('/ping', (req, res) => res.send('pong'));

// Seed demo user if not present
async function seedUser() {
  try {
    const user = await User.findOne({ username: 'testuser' });
    if (!user) {
      const hash = await bcrypt.hash('password123', 10);
      await User.create({ username: 'testuser', password: hash });
      console.log('Test user created!');
    }
  } catch (err) {
    console.error('User seed error:', err);
  }
}
seedUser();

app.use('/api', apiRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => console.log('Server running on port ' + PORT));
