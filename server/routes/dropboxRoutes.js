const express = require("express");
const multer = require("multer");
const { Dropbox } = require("dropbox");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage()
});

// Stores the refresh token while the server is running
let refreshToken = null;


// ==========================================
// CREATE DROPBOX CLIENT
// ==========================================
function getDropboxClient() {
    if (!refreshToken) {
        return null;
    }

    return new Dropbox({
        clientId: process.env.DROPBOX_APP_KEY,
        clientSecret: process.env.DROPBOX_APP_SECRET,
        refreshToken: refreshToken
    });
}


// ==========================================
// DROPBOX AUTH
// ==========================================
router.get("/auth", async (req, res) => {
    try {
        const dbx = new Dropbox({
            clientId: process.env.DROPBOX_APP_KEY,
            clientSecret: process.env.DROPBOX_APP_SECRET
        });

        const authUrl = await dbx.auth.getAuthenticationUrl(
            process.env.DROPBOX_REDIRECT_URI,
            null,
            "code",
            "offline",
            null,
            "none",
            false
        );

        console.log("Dropbox authorization URL created");

        res.redirect(authUrl);

    } catch (error) {
        console.error("Dropbox auth error:", error);

        res.status(500).json({
            message: "Could not connect to Dropbox"
        });
    }
});


// ==========================================
// DROPBOX CALLBACK
// ==========================================
router.get("/callback", async (req, res) => {
    try {
        const { code, error, error_description } = req.query;

        console.log("=================================");
        console.log("Dropbox callback received");
        console.log("Code received:", !!code);

        if (error) {
            console.error(
                "Dropbox authorization error:",
                error_description || error
            );

            return res.redirect(
                "http://localhost:3000?dropbox=error"
            );
        }

        if (!code) {
            console.error("No authorization code received");

            return res.redirect(
                "http://localhost:3000?dropbox=error"
            );
        }

        const dbx = new Dropbox({
            clientId: process.env.DROPBOX_APP_KEY,
            clientSecret: process.env.DROPBOX_APP_SECRET
        });

        const response = await dbx.auth.getAccessTokenFromCode(
            process.env.DROPBOX_REDIRECT_URI,
            code
        );

        console.log("Dropbox token response received");

        if (response.result.refresh_token) {

            refreshToken = response.result.refresh_token;

            console.log("Dropbox refresh token saved successfully");

        } else {

            console.error("No refresh token received from Dropbox");

        }

        console.log("=================================");

        res.redirect(
            "http://localhost:3000?dropbox=connected"
        );

    } catch (error) {

        console.error("Dropbox callback error:", error);

        res.redirect(
            "http://localhost:3000?dropbox=error"
        );
    }
});


// ==========================================
// CHECK DROPBOX CONNECTION
// ==========================================
router.get("/status", async (req, res) => {
    try {

        if (!refreshToken) {
            return res.json({
                connected: false
            });
        }

        const dbx = getDropboxClient();

        await dbx.usersGetCurrentAccount();

        res.json({
            connected: true
        });

    } catch (error) {

        console.error("Dropbox status error:", error);

        res.json({
            connected: false
        });
    }
});


// ==========================================
// LIST DROPBOX FILES
// ==========================================
router.get("/files", async (req, res) => {
    try {

        const dbx = getDropboxClient();

        if (!dbx) {
            return res.status(401).json({
                message: "Dropbox is not connected"
            });
        }

        const response = await dbx.filesListFolder({
            path: ""
        });

        res.json(response.result.entries);

    } catch (error) {

        console.error("Dropbox list error:", error);

        res.status(500).json({
            message: "Failed to load Dropbox files"
        });
    }
});


// ==========================================
// UPLOAD IMAGE / VIDEO
// ==========================================
router.post(
    "/upload",
    upload.single("file"),
    async (req, res) => {

        try {

            if (!req.file) {
                return res.status(400).json({
                    message: "No file selected"
                });
            }

            const dbx = getDropboxClient();

            if (!dbx) {
                return res.status(401).json({
                    message: "Dropbox is not connected"
                });
            }

            const fileName = req.file.originalname;

            const response = await dbx.filesUpload({
                path: `/${fileName}`,
                contents: req.file.buffer,
                autorename: true,
                mode: {
                    ".tag": "add"
                }
            });

            console.log(
                "File uploaded successfully:",
                fileName
            );

            res.json({
                message: "File uploaded successfully",
                file: response.result
            });

        } catch (error) {

            console.error(
                "Dropbox upload error:",
                error
            );

            res.status(500).json({
                message: "Failed to upload file to Dropbox"
            });
        }
    }
);


// ==========================================
// VIEW FILE
// ==========================================
router.get("/view", async (req, res) => {

    try {

        const dbx = getDropboxClient();

        if (!dbx) {
            return res.status(401).json({
                message: "Dropbox is not connected"
            });
        }

        const response =
            await dbx.filesGetTemporaryLink({
                path: req.query.path
            });

        res.json({
            link: response.result.link
        });

    } catch (error) {

        console.error(
            "Dropbox view error:",
            error
        );

        res.status(500).json({
            message: "Could not get file link"
        });
    }
});


// ==========================================
// DELETE FILE
// ==========================================
router.delete("/delete", async (req, res) => {

    try {

        const dbx = getDropboxClient();

        if (!dbx) {
            return res.status(401).json({
                message: "Dropbox is not connected"
            });
        }

        await dbx.filesDeleteV2({
            path: req.body.path
        });

        res.json({
            message: "File deleted successfully"
        });

    } catch (error) {

        console.error(
            "Dropbox delete error:",
            error
        );

        res.status(500).json({
            message: "Could not delete file"
        });
    }
});


module.exports = router;