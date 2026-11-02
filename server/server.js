require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");
const artworkRoutes = require("./routes/artworkRoutes");
const dropboxRoutes = require("./routes/dropboxRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Artwork routes
app.use("/api/artworks", artworkRoutes);

// Dropbox routes
app.use("/api/dropbox", dropboxRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Digital Art Gallery API is running"
    });
});

const PORT = process.env.PORT || 5000;

// Connect MongoDB and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});