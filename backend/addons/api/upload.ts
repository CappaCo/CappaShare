import { client, Result } from "../../database.ts";
import 'https://deno.land/x/dotenv@v3.2.2/load.ts';

export const path = "/upload";
const MB = 1000000;

try {
    console.log("Client: " + client);
    console.log("Trying to test sql");

    const result: Result = await client.query("SELECT * FROM prod");
    console.log("\nresult:");
    console.log(result);
    console.log("first line:");
    console.log(result[0]);
    console.log("id of first row:");
    console.log(result[0].id);
} catch (error) {
    console.log("Error making sql client:\n" + error);
}

export async function run(req: Request): Promise<Response> {
    console.log("file upload incoming");
    const method = req.method;
    
    if (method != "POST") return new Response("method not allowed", { status: 405 });

    // TODO: async
    console.log("getting formdata");
    const formData = await req.formData();
    console.log("got formdata");

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
    
    handleFormDataUpload(data);
    handleFileUpload(file);
    console.groupEnd();
    console.log("---------------------------------");

    return new Response(JSON.stringify({
        message: "hooray"
    }));
}

function handleFormDataUpload(data: FileUploadFormData) {
    console.log("Uploading form data to database");

    const query = "INSERT INTO prod (filename, description) VALUES (?, ?)";
    const params = [data.title, data.description];
    console.log("sending query:", query);
    client.query(query, params)
        .then(() => {console.log("uploaded formdata")})
        .catch(error => {console.error("Error uploading file:", error)});
    
}

function handleFileUpload(file: File) {
    console.log(file);
    //const fileFr = new Uint8Array(await file.arrayBuffer());
    console.log("Pretend I uploaded the file to the server");
    //await Deno.writeFile(`./backend/uploads/${file.name}`, fileFr);
}

interface FileUploadFormData {
    title: string;
    description: string;
    file: File;
}

const requiredFormData = ["title", "description", "file"];

function checkFormdata(formData: FormData): string {
    console.log("Checking formData");
    const data = Object.fromEntries(formData.entries());
    const keys = Object.keys(data);

    requiredFormData.forEach((value) => {
        if (!keys.includes(value)) {
            return "required key not found";
        }

        if (data[value] == "") {
            return "value was empty";
        }
    });

    const file = formData.get("file");
    console.log("file:", file);
    if (!(file instanceof File)) return "file was not a file, it was " + typeof file;

    return "ok"; 
}

function getFormdata(formData: FormData): FileUploadFormData {
    const file = formData.get("file");

    if (file instanceof File) {
        console.log("The file is a file");
    } else {
        throw new Error("File was not a file, did you check the form data first?");
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