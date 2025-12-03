// =======================================================
// Qu-Atomic Nebula — Open Upload Version
// =======================================================

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

// Create uploads folder if missing
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log("Uploads folder created.");
}

// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Static files
app.use(express.static("public"));
app.use("/uploads", express.static(uploadsPath));

// Open upload route (NO KEY REQUIRED)
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ status: "success", file: req.file });
});

// Get all files
app.get("/files", (req, res) => {
    fs.readdir(uploadsPath, (err, files) => {
        if (err) return res.json({ files: [] });
        res.json({ files });
    });
});

// Search
app.get("/search", (req, res) => {
    const q = (req.query.q || "").toLowerCase();

    fs.readdir(uploadsPath, (err, files) => {
        if (err) return res.json({ files: [] });

        const matches = files.filter(f => f.toLowerCase().includes(q));
        res.json({ files: matches });
    });
});

// Render compatible port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Qu-Atomic Nebula running on port ${PORT}`);
});
