console.log("uploadForm.js running");

const form = document.getElementById("uploadForm");

form.addEventListener("submit", uploadForm);

let fileSize = 0;
const MB = 1_000_000;
const fileSizeLimit = 100*MB;

function uploadForm(event) {
    event.preventDefault();

    const formData = new FormData(form);

    if (!formData.get("title")) {
        alert("Title is required");
        return;
    }

    const file = document.getElementById("file").files[0];

    if (!file) {
        alert("No file selected");
        return;
    }

    fileSize = file.size;
    console.log("fileSize: " + fileSize);

    if (fileSize > fileSizeLimit) {
        console.log("File too big");
        alert("File too big");
        return;
    }

    const request = new XMLHttpRequest();

    request.addEventListener("progress", uploadProgress);
    request.addEventListener("load", uploadComplete);
    request.addEventListener("error", uploadFailed);
    request.addEventListener("abort", uploadCanceled);

    request.timeout = 30 * 1000;

    request.open("POST", "/api/upload");
    request.send(formData);

    console.log("Form submitted");
}

function uploadProgress(e) {
    if (e.loaded < fileSize) {
        const percent = e.loaded / fileSize * 100;
        console.log("Percent uploaded: " + percent);
    }

    if (e.loaded == e.total) {
        console.log("Uploading completed");
    }
}

function uploadComplete(e) {
    console.log("Request completed");
    console.log(e);
    if (this.status === 200) {
        console.log("Upload successful");
        const response = JSON.parse(e.target.response);
        console.log("Response:", response);
        console.log("Response message", response.message);
        document.location.href = response.link;
    } else {
        console.error("Upload failed with status: " + this.status);
        alert("Upload failed. Please try again.");
    }
}

function uploadFailed() {
    console.error("Upload failed");
    alert("An error occurred while uploading the file. Please try again.");
}

function uploadCanceled() {
    console.warn("Upload canceled");
    alert("Upload canceled.");
}