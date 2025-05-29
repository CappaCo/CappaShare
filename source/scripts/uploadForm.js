console.log("Samuel Morresey");

const form = document.getElementById("uploadForm");

form.addEventListener("submit", uploadForm);

let fileSize = 0;

function uploadForm(event) {
    event.preventDefault();

    const formData = new FormData(form);

    const request = new XMLHttpRequest();

    fileSize = document.getElementById("file").files[0].size;
    console.log("fileSize: " + fileSize);

    request.upload.addEventListener("progress", uploadProgress);

    request.open("post", "/api/upload");
    request.timeout = 30 * 1000;
    request.send(formData);

    console.log("Form submitted");
}

function uploadProgress(e) {
    console.log(e.loaded);
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