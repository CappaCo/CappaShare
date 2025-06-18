console.log("upload.ts loaded");

export const path = "/upload";
const MB = 1000000;

export async function run(req: Request): Promise<Response> {
    console.log("file upload incoming");
    const method = req.method;
    
    if (method != "POST") return new Response("method not allowed", { status: 405 });

    // TODO: async
    console.log("getting formdata");
    const formData = await req.formData();
    console.log("got formdata");

    const FormCheckResponse = checkFormdata(formData);
    if (FormCheckResponse != "ok") return new Response("bad form: " + FormCheckResponse, { status: 400 });

    console.log("---------------------------------");
    console.group();

    const checkResponse = checkFormdata(formData);
    if (checkResponse != "ok") {
        console.error("Form checks failed: " + checkResponse);
        return new Response(checkResponse, { status: 400 });
    }

    const data = getFormdata(formData);

    const { title, description, file } = data;

    console.log("File title: " + title);
    console.log("File description: " + description);

    const fileCheckResponse = checkFile(file);
    if (fileCheckResponse != "ok") {
        console.error("File checks failed: " + fileCheckResponse);
        return new Response(fileCheckResponse, { status: 400 });
    }
    
    handleFileUpload(file);
    console.groupEnd();
    console.log("---------------------------------");

    return new Response(JSON.stringify({
        message: "hooray"
    }));
}

function handleFileUpload(file: File) {
    console.log(file);
    //const fileFr = new Uint8Array(await file.arrayBuffer());
    console.log("Pretend I uploaded the file to the server");
    //await Deno.writeFile(`./backend/uploads/${file.name}`, fileFr);
}

interface fileUploadFormdata {
    title: string;
    description: string;
    file: File;
}

const requiredFormDataValues = ["title", "description", "file"];

function checkFormdata(formData: FormData): string {
    console.log("Checking formData");
    const data = Object.fromEntries(formData.entries());
    const keys = Object.keys(data);

    // TODO: Validate form data entries

    requiredFormDataValues.forEach((value) => {
        if (!keys.includes(value)) {
            return "required key not found";
        }

        if (data[value] == "") {
            return "value was empty";
        }
    });

    const file = formData.get("file");
    if (file instanceof File) {
        console.log("Samuel Morresey");
    } else {
        return "file was not a file";
    }

    return "ok"; 
}

function getFormdata(formData: FormData): fileUploadFormdata {
    const file = formData.get("file");

    if (file instanceof File) {
        console.log("The file is a file");
    } else {
        throw new Error("File was not a file, did you check the form data first?")
    }

    return {
        "title": formData.get("title") as string,
        "description": formData.get("description") as string,
        "file": file,
    }
}

function checkFile(file: File): string {
    if (file.size > 10 * MB) {
        return "File too big";
    }

    return "ok";
}