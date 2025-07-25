import "@std/dotenv/load";
import { customAlphabet } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";
import { client, Result } from "../../database.ts";

const MB = 1000000;
const table = Deno.env.get("TABLE") || "prod";
const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 16);

export async function run(req: Request): Promise<Response> {
    console.log("file upload incoming");
    const method = req.method;
    
    if (method != "POST") return new Response("Method not allowed", { status: 405 });

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
    
    const id = generateId();
    console.log("File ID: " + id);
    handleFormDataUpload(data, id);
    handleFileUpload(file, id);
    console.groupEnd();
    console.log("---------------------------------");

    return new Response(JSON.stringify({
        message: "hooray"
    }));
}

function handleFileUpload(file: File, id: string) {
    console.log("uploading file to r2:", id);
    file.arrayBuffer()
        .then((buffer) => {
            console.log("File buffer size:", buffer.byteLength);
            return client.putObject(id, new Uint8Array(buffer));
        })
        .then(() => {
            console.log("File uploaded successfully with ID:", id);
        })
        .catch((error) => {
            console.error("Error uploading file:", error);
        });
}

function handleFormDataUpload(data: FileUploadFormData, id: string) {
    console.log("Uploading form data to database");

    const query = `
        INSERT INTO files (
            id,
            filename,
            title,
            description,
            content_type,
            size_bytes,
            extension
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const params = [
        id,
        data.file.name,
        data.title,
        data.description,
        data.file.type,
        data.file.size,
        data.file.name.split(".").at(-1) || "unknown",
    ];
    console.log("Sending query:", query);
    client.query(query, params)
        .then(() => {console.log("uploaded formdata")})
        .catch(error => {console.error("Error uploading file:", error)});
    
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
