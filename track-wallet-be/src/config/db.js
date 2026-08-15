// const mongoose = require('mongoose');

// async function connectDb() {
//   const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trackwallet';
//   await mongoose.connect(uri);
//   console.log('MongoDB connected');
// }

// module.exports = { connectDb };

const mongoose = require('mongoose');

let connectionPromise;

async function connectDb() {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!connectionPromise) {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error('MONGODB_URI environment variable is not configured');
        }

        connectionPromise = mongoose.connect(uri)
            .then(() => {
                console.log('MongoDB connected');
            })
            .catch((error) => {
                connectionPromise = null;
                throw error;
            });
    }

    await connectionPromise;
}

module.exports = { connectDb };