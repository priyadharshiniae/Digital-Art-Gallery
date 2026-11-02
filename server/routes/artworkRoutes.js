const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const router = express.Router();


// =====================================================
// INSERT ONE ARTWORK
// POST /api/artworks
// =====================================================
router.post("/", async (req, res) => {
    try {
        const db = getDB();

        const artwork = {
            title: req.body.title,
            artist: req.body.artist,
            description: req.body.description,
            category: req.body.category,
            mediaUrl: req.body.mediaUrl || "",
            user: req.body.user || "Guest",
            createdAt: new Date()
        };

        const result = await db
            .collection("artworks")
            .insertOne(artwork);

        res.status(201).json({
            message: "Artwork inserted successfully",
            artwork: {
                _id: result.insertedId,
                ...artwork
            }
        });

    } catch (error) {
        console.error("MongoDB insert error:", error);

        res.status(500).json({
            message: "Failed to insert artwork"
        });
    }
});


// =====================================================
// LIST ALL ARTWORKS
// GET /api/artworks
// =====================================================
router.get("/", async (req, res) => {
    try {
        const db = getDB();

        const artworks = await db
            .collection("artworks")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(artworks);

    } catch (error) {
        console.error("MongoDB read error:", error);

        res.status(500).json({
            message: "Failed to fetch artworks"
        });
    }
});


// =====================================================
// UPDATE ARTWORK
// PUT /api/artworks/:id
// =====================================================
router.put("/:id", async (req, res) => {
    try {
        const db = getDB();

        const id = req.params.id;

        // Check MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid artwork ID"
            });
        }

        const updatedArtwork = {
            title: req.body.title,
            artist: req.body.artist,
            category: req.body.category,
            description: req.body.description
        };

        const result = await db
            .collection("artworks")
            .updateOne(
                {
                    _id: new ObjectId(id)
                },
                {
                    $set: updatedArtwork
                }
            );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Artwork not found"
            });
        }

        res.json({
            message: "Artwork updated successfully"
        });

    } catch (error) {
        console.error("MongoDB update error:", error);

        res.status(500).json({
            message: "Failed to update artwork"
        });
    }
});


// =====================================================
// DELETE ARTWORK
// DELETE /api/artworks/:id
// =====================================================
router.delete("/:id", async (req, res) => {
    try {
        const db = getDB();

        const id = req.params.id;

        // Check MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid artwork ID"
            });
        }

        const result = await db
            .collection("artworks")
            .deleteOne({
                _id: new ObjectId(id)
            });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Artwork not found"
            });
        }

        res.json({
            message: "Artwork deleted successfully"
        });

    } catch (error) {
        console.error("MongoDB delete error:", error);

        res.status(500).json({
            message: "Failed to delete artwork"
        });
    }
});


module.exports = router;