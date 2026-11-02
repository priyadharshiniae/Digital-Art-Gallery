const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI, {
    family: 4
});

let db;

async function connectDB() {
    try {
        await client.connect();

        db = client.db("DigitalArtGallery");

        console.log("MongoDB connected successfully");

        return db;
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

function getDB() {
    return db;
}

module.exports = {
    connectDB,
    getDB
};