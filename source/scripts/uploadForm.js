console.log("uploadForm.js running");

const form = document.getElementById("uploadForm");

form.addEventListener("submit", uploadForm);

let fileSize = 0;
const MB = 1000000;
const fileSizeLimit = 20*MB;

function uploadForm(event) {
    event.preventDefault();

    const formData = new FormData(form);

    const request = new XMLHttpRequest();

    const file = document.getElementById("file").files[0];

    if (!file) {
        alert("No file selected");
        return;
    }

    if (!formData.get("title")) {
        alert("Title is required");
    }

    fileSize = file.size;
    console.log("fileSize: " + fileSize);

    if (fileSize > fileSizeLimit) {
        console.log("File too big");
        alert("File too big");
        return;
    }

    request.upload.addEventListener("progress", uploadProgress);

    request.open("post", "/api/upload");
    request.timeout = 30 * 1000;
    request.send(formData);

    console.log("Form submitted");
}

function uploadProgress(e) {
    if (e.loaded <= fileSize) {
        const percent = e.loaded / fileSize * 100;
        console.log("Percent uploaded: " + percent);
    }

    if (e.loaded == e.total) {
        console.log("File uploaded");
        alert("hooray!");
        //document.location.href = "/download";
    }
}