console.log("download.js is yup");

const fileList = document.getElementById("fileList");
console.log(fileList);

fetch("/api/search")
    .then(response => response.json())
    .then(renderFiles)
    .catch(error => {
        console.error("Fetch error:", error);
    });

function renderFiles(data) {
    fileList.innerHTML = "";
    console.log("rendering data:", data);

    for (const fileData of data) {
        console.log("fileData:", fileData);
        const link = `/files/${fileData.filename}-${fileData.id}`;
        const verified = fileData.verified === 1 || false;
        const title = fileData.filename;
        const description = fileData.description;
        const tags = "tags";

        const newElement = document.createElement("a");
        newElement.setAttribute("href", link);
        newElement.innerHTML = `
<!-- fileDisplay.html HERE -->
        `

        console.log(newElement);
        fileList.appendChild(newElement);
    }
}