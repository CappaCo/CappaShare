console.log("download.js is yup");

const fileList = document.getElementById("fileList");
console.log(fileList);

fetch("/api/download/")
    .then(response => response.json())
    .then(renderFiles)
    .catch(error => {
        console.error("Fetch error:", error);
    });

function renderFiles(data) {
    fileList.innerHTML = "";
    console.log("rendering data:", data);

    for (const fileData of data) {
        const link = fileData.link || "bunger";
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