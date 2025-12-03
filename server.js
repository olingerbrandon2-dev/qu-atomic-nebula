// =======================================================
// Qu-Atomic Nebula — Secure File Hosting Server
// Owner-Only Upload System (Hidden Route Auth)
// =======================================================

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// =======================================================
// 1. SECRET OWNER CODE (Stored in Render ENV variable)
// =======================================================
const OWNER_PC_CODE = process.env.NEBULA_OWNER_KEY || "";

// =======================================================
// Ensure uploads folder exists (VERY IMPORTANT on Render)
// =======================================================
const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
    console.log("Uploads folder missing. Creating it...");
    fs.mkdirSync(uploadsPath);
}


// =======================================================
// 2. STORAGE ENGINE FOR MULTER
// Saves uploaded files to /uploads with unique names
// =======================================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });


// =======================================================
// 3. PUBLIC STATIC FILES
// Serves your index.html + styling + JS
// =======================================================
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));
app.use("/uploads", express.static(uploadsPath));


// =======================================================
// 4. HIDDEN OWNER-AUTH ROUTE
// Returns the owner code (ONLY for your own front-end)
// =======================================================
app.get("/nebula-core-auth-839218", (req, res) => {
    res.json({ ownerCode: OWNER_PC_CODE ? true : false });
});


// =======================================================
// 5. FILE UPLOAD ROUTE — OWNER ONLY
// Checks for x-nebula-code header
// =======================================================
app.post("/upload", (req, res, next) => {

    const incoming = req.headers["x-nebula-code"];

    if (!incoming || incoming !== OWNER_PC_CODE) {
        console.log("UPLOAD BLOCKED — Incorrect owner key");
        return res.status(403).json({ error: "Forbidden: Not owner PC" });
    }

    next();

}, upload.single("file"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({ status: "success", file: req.file });
});


// =======================================================
// 6. LIST FILES ROUTE — Public
// =======================================================
app.get("/files", (req, res) => {
    fs.readdir(uploadsPath, (err, files) => {
        if (err) return res.json({ files: [] });
        res.json({ files });
    });
});


// =======================================================
// 7. SEARCH FILES ROUTE — Public
// =======================================================
app.get("/search", (req, res) => {
    const q = (req.query.q || "").toLowerCase();

    fs.readdir(uploadsPath, (err, files) => {
        if (err) return res.json({ files: [] });

        const matches = files.filter(f => f.toLowerCase().includes(q));
        res.json({ files: matches });
    });
});


// =======================================================
// 8. START THE SERVER (Render-Compatible)
// =======================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Qu-Atomic Nebula server running on port ${PORT}`);
});
