// =======================================================
// Qu-Atomic Nebula — Secure File Hosting Server
// Owner-Only Upload System (Hidden Route Auth)
// =======================================================

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());

// =======================================================
// 1. SECRET OWNER CODE (Only YOU should know this)
// Change this to ANYTHING unique
// =======================================================
const OWNER_PC_CODE = "Your_Password";


// =======================================================
// 2. STORAGE ENGINE FOR MULTER (file uploads)
// Saves to /uploads with unique names
// =======================================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });


// =======================================================
// 3. PUBLIC STATIC FILES
// Serves your index.html and other public assets
// =======================================================
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));


// =======================================================
// 4. HIDDEN AUTH ROUTE
// This is your secret "second page"
// The public NEVER sees this
// =======================================================
app.get("/nebula-core-auth-839218", (req, res) => {
    res.json({ ownerCode: OWNER_PC_CODE });
});


// =======================================================
// 5. UPLOAD ROUTE (OWNER ONLY)
// Checks if request contains correct secret code
// =======================================================
app.post("/upload", (req, res, next) => {

    // Read secret header sent by your main page
    const incoming = req.headers["x-nebula-code"];

    if (incoming !== OWNER_PC_CODE) {
        return res.status(403).json({ error: "Forbidden: Not owner PC" });
    }

    next();
}, upload.single("file"), (req, res) => {
    res.json({ status: "success", file: req.file });
});


// =======================================================
// 6. LIST ALL FILES ROUTE
// Returns a list of all uploaded files
// =======================================================
app.get("/files", (req, res) => {
    fs.readdir("uploads/", (err, files) => {
        if (err) return res.json({ files: [] });
        res.json({ files });
    });
});


// =======================================================
// 7. SEARCH ROUTE
// Case-insensitive filename search
// =======================================================
app.get("/search", (req, res) => {
    const q = (req.query.q || "").toLowerCase();

    fs.readdir("uploads/", (err, files) => {
        if (err) return res.json({ files: [] });

        const matches = files.filter(f => f.toLowerCase().includes(q));
        res.json({ files: matches });
    });
});


// =======================================================
// 8. START THE SERVER
// =======================================================
app.listen(3000, () => {
    console.log("Qu-Atomic Nebula server running at:");
    console.log("➡ http://localhost:3000");
});
