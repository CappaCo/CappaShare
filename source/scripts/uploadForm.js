console.log("uploadForm.js running");

const MB = 1_000_000;
const fileSizeLimit = 50*MB;

const loadingModal = new Modal("loadingModal");
const samEvilBar = document.getElementsByClassName("samEvilBar")[0];
const uploadPercent = document.getElementsByClassName("uploadPercent")[0];
const form = document.getElementById("uploadForm");

form.addEventListener("submit", uploadForm);

let fileSize = 0;

function uploadForm(event) {
    event.preventDefault();

    console.log("Form submit button pressed");

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
    console.log("fileSize: " + (fileSize / MB).toPrecision(4) + " MB");

    if (fileSize > fileSizeLimit) {
        console.log("File too big");
        alert("File too big, maximum size is " + (fileSizeLimit / MB) + " MB");
        return;
    }

    console.log("opening modal");
    loadingModal.open();
    console.log("making new request");
    const request = new XMLHttpRequest();

    request.upload.addEventListener("progress", uploadProgress);
    request.addEventListener("load", uploadComplete);
    request.addEventListener("error", uploadFailed);
    request.addEventListener("abort", uploadCanceled);

    request.timeout = 30 * 1000;

    request.open("POST", "/api/upload");
    request.send(formData);

    console.log("Form submitted, awaiting response...");
}

function uploadProgress(e) {
    if (e.loaded < fileSize) {
        const percent = e.loaded / fileSize * 100;
        updateLoadingBar(percent);
        console.log("Percent uploaded: " + percent);
    }

    if (e.loaded == e.total) {
        updateLoadingBar(100);
        console.log("Uploading completed");
        fileSize = 0; // Reset file size after upload
    }
}

function updateLoadingBar(percent) {
    samEvilBar.style.width = percent + "%";
    uploadPercent.innerText = Math.round(percent * 10) / 10 + "%";
}

function uploadComplete(e) {
    console.log("Request completed");
    console.log(e);
    if (this.status === 200) {
        console.log("Upload successful");
        const response = JSON.parse(e.target.response);
        console.log("Response:", response);
        console.log("Response message", response.message);

        if (!response.link) {
            console.error("No link in response");
        }

        if (confirm("File uploaded successfully. Do you want to view it?")) {
            console.log("Redirecting to file link:", response.link);
            document.location.href = response.link;
        }
    } else {
        console.error("Upload failed with status: " + this.status);
        console.error("Response:", e.target.response);
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