import "@std/dotenv/load";
import { client } from "../../database.ts";

export const path = "*";

export async function run(req: Request): Promise<Response> {
    const method = req.method;

    if (method == "GET") {
        console.log("getting get request");

        const url = new URL(req.url);
        const segments = url.pathname.split("/");
        const slug = segments.at(-1);
        const pieces = slug?.split("-")
        const fileName = pieces?.slice(0, -1).join("-");
        const id = pieces?.at(-1);

        console.log("Request ID:", id);
        // Get the file from r2
        if (!id) {
            return new Response("Please provide an ID", { status: 400 });
        }

        return await client.getObject(id)
            .then((data) => {
                if (!data) {
                    console.error("No data returned for ID:", id);
                    return new Response("No data returned", { status: 404 });
                }

                if (!data.Body) {
                    console.log("File not found:", id);
                    return new Response("File not found", { status: 404 });
                }
                
                return new Response(data.Body, {
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Content-Disposition": `attachment; filename="${fileName || "download.bin"}"`,
                    },
                });
            }).catch((error) => {
                if (error.name === "NoSuchKey") {
                    return new Response("File not found", { status: 404 });
                }
                console.error("Error getting object:", error);
                return new Response("Error getting file", { status: 500 });
            });
    }

    return new Response("yeah idk");
}
