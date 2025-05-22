console.log("Samuel Morresey");

const form = document.getElementById("uploadForm");


form.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(form);

    fetch('/api/check', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Optional: show success message or redirect
    })
    .catch(error => {
        console.error('Error:', error);
        // Optional: show error message
    });
});