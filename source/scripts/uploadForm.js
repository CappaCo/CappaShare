console.log("Samuel Morresey");

const form = document.getElementById("uploadForm");

form.addEventListener("submit", uploadForm);

function uploadForm(event) {
    event.preventDefault();

    const formData = new FormData(form);

    fetch("/api/upload", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log("Success:", data);
        alert("file might be uploaded");
        document.location.href = "/download";
    })
    .catch(error => {
        console.error("Error:", error);
        // Optional: show error message
    });

    console.log("Form submitted");
}