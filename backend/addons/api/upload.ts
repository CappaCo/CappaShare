import "@std/dotenv/load";
import { customAlphabet } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";
import { client } from "../../database.ts";

const MB = 1_000_000;
const fileSizeLimit = 50*MB;
const table = Deno.env.get("TABLE") || "prod";
const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 16);

export async function run(req: Request): Promise<Response> {
    console.log("----------");
    console.log("file upload incoming");
    const method = req.method;
    
    if (method != "POST") return new Response("Method not allowed", { status: 405 });

    // TODO: async
    console.log("getting formdata");
    const formData = await req.formData();
    console.log("got formdata");

    let data: FileUploadFormData;
    try {
        data = getFormdata(formData);
    } catch (error) {
        console.error("Error getting formdata:", error);
        if (error instanceof Error) {
            return new Response(
                JSON.stringify({ message: "Error getting formdata: " + error.message }),
                { status: 400 }
            );
        } else {
            return new Response(
                JSON.stringify({ message: "Unknown error getting formdata" }),
                { status: 500 }
            );
        }
    }

    const fileCheckResponse = checkFile(data.file);
    if (fileCheckResponse != "ok") {
        console.error("File checks failed: " + fileCheckResponse);
        return new Response(fileCheckResponse, { status: 400 });
    }
    
    const id = generateId();
    console.log("File ID: " + id);

    const uploadPromise = handleFileUpload(data.file, id)
        .then(() => {
            console.log("File upload completed, uploading formData");
            return handleFormDataUpload(data, id);
        })
        .catch((error) => {
            console.error("Error uploading file to R2:", id, error);
            return new Response(
                JSON.stringify({
                    message: "Error uploading your file: " + error.message
                }),
                { status: 500 }
            );
        })
        .then(() => {
            console.log("Database upload also completed");
            return new Response(JSON.stringify({
                message: "file uploaded",
                link: `/files/${data.file.name}-${id}`,
            }));
        })
        .catch((error) => {
            console.error("Error uploading file data to database", id, error);
            return new Response(
                JSON.stringify({
                    message: "Error uploading your file: " + error.message,
                }),
                { status: 500 }
            );
        });
    
    return uploadPromise;
}

function handleFileUpload(file: File, id: string) {
    console.log("uploading file to r2:", id);
    return file.arrayBuffer()
        .then((buffer) => {
            console.log("File buffer size:", buffer.byteLength);
            const uint8array = new Uint8Array(buffer);
            console.log("File buffer (real) size:", uint8array.length);
            return client.putObject(id, uint8array, file.type);
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
        INSERT INTO ${table} (
            id,
            filename,
            title,
            description,
            tags,
            content_type,
            size_bytes,
            extension
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const params = [
        id,
        data.file.name,
        data.title,
        data.description,
        JSON.stringify(data.tags),
        data.file.type,
        data.file.size,
        data.file.name.split(".").at(-1) || "unknown",
    ];
    console.log("Sending query:", query, "params:", params);
    return client.query(query, params)
        .then(() => { console.log("Uploaded formdata") })
        .catch(error => { console.error("Error uploading file:", error) });
}

type FileUploadFormData = {
    title: string;
    description: string;
    tags: string[];
    file: File;
}

const requiredFormData = ["title", "file"];

function getFormdata(formData: FormData): FileUploadFormData {
    console.log("Checking formData");
    const data = Object.fromEntries(formData.entries());
    const keys = Object.keys(data);

    requiredFormData.forEach((value) => {
        if (!keys.includes(value)) {
            throw new Error("required key not found");
        }

        if (data[value] == "") {
            throw new Error("value was empty");
        }
    });

    const file = formData.get("file");

    console.log("Checking file:", file);

    if (!(file instanceof File)) {
        throw new Error("File was not a file, it was " + (typeof file));
    }

    const fileUploadFormData: FileUploadFormData = {
        title: formData.get("title") as string,
        description: (formData.get("description") || "") as string,
        tags: JSON.parse((formData.get("tags") || "[]") as string),
        file: file,
    }

    return fileUploadFormData;
}

function checkFile(file: File): string {
    if (file.size > fileSizeLimit) {
        return "File too big";
    }

    return "ok";
}
