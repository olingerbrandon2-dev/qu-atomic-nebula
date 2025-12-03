<!DOCTYPE html>
<html>
<head>
    <title>Qu-Atomic Nebula</title>

<style>
/* Same styling as before */
body {
    background: radial-gradient(circle at 20% 20%, #1a0033, #000 70%), 
                url('https://i.imgur.com/4NJlZOp.png');
    background-size: cover;
    background-attachment: fixed;
    color: white;
    font-family: 'Orbitron', sans-serif;
    padding: 20px;
    text-align: center;
}
h1 { font-size: 3.2rem; color: #c770ff; text-shadow: 0 0 20px #a83cff; }
#search {
    width: 60%; max-width: 500px; height: 45px;
    border-radius: 30px; background: rgba(25, 0, 45, 0.7);
    border: 1px solid #6d00d4; padding-left: 15px;
    color: white; box-shadow: 0 0 14px #4700a8 inset;
}
button {
    background: #4f0099; color:white; border:none; padding:12px 20px;
    border-radius:6px; box-shadow:0 0 10px #a200ff;
    cursor:pointer; margin-top:10px;
}
.file-box {
    background: rgba(20, 0, 40, 0.75);
    padding: 15px; margin: 10px auto; border-radius: 12px;
    border: 1px solid #6d00d4; width: 60%; max-width: 600px;
}
</style>

</head>
<body>

<h1>Qu-Atomic Nebula</h1>
<h2>Storage Beyond The Stars</h2>

<input id="search" placeholder="Search files..." oninput="searchFiles()">

<h3>Upload a File</h3>
<input type="file" id="uploadFile">
<button onclick="upload()">Upload</button>

<h2>Files:</h2>
<div id="fileList"></div>

<script>

async function upload() {
    const fileInput = document.getElementById("uploadFile");
    if (!fileInput.files.length) return;

    const form = new FormData();
    form.append("file", fileInput.files[0]);

    const res = await fetch("/upload", {
        method: "POST",
        body: form
    });

    if (!res.ok) {
        alert("Upload failed.");
        return;
    }

    alert("Uploaded!");
    loadFiles();
}

async function loadFiles() {
    const res = await fetch("/files");
    const data = await res.json();
    displayFiles(data.files);
}

async function searchFiles() {
    const q = document.getElementById("search").value;
    const res = await fetch("/search?q=" + encodeURIComponent(q));
    const data = await res.json();
    displayFiles(data.files);
}

function displayFiles(files) {
    const container = document.getElementById("fileList");
    container.innerHTML = "";

    files.forEach(file => {
        const div = document.createElement("div");
        div.className = "file-box";
        div.innerHTML = `
            <b>${file}</b><br>
            <a href="/uploads/${file}" download>Download</a>
        `;
        container.appendChild(div);
    });
}

loadFiles();

</script>

</body>
</html>
