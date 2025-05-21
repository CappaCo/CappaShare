console.log("Samuel Morresey");

const form = document.getElementById("uploadForm");


form.addEventListener("submit", event => {
    event.preventDefault();
    console.log("File form submitted");
    fetch("/api/upload", {
        method: "POST"
    });
});