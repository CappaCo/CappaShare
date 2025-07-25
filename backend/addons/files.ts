import "@std/dotenv/load";
import DOMPurify from "npm:isomorphic-dompurify";

import { client, Result } from "../database.ts";
import { buildSingleFile } from "../build.ts";

const table = Deno.env.get("TABLE") || "prod";

export const path = "*";

export async function run(req: Request): Promise<Response> {
    const method = req.method;

    if (method == "GET") {
        console.log("getting get request");

        const url = new URL(req.url);
        const segments = url.pathname.split("/");
        const slug = segments.at(-1);
        const id = slug?.split("-").at(-1);

        if (!id) {
            return new Response("Please provide an ID", { status: 400 });   
        }

        console.log("cwd:", Deno.cwd());
        const rawHtmlFile = Deno.readTextFileSync("templates/file.html");
        const unbuiltHtml = await buildSingleFile(rawHtmlFile);

        const query = `SELECT * FROM ${table} WHERE id = ?;`;
        const params = [id];
        console.log("sending query:", query, "params:", params);
        return await client.query(query, params)
            .then((result: Result) => {
                if (result.length === 0) {
                    console.error("No data found for ID:", id);
                    return new Response("File not found", { status: 404 });
                }
                
                console.log("result:", result);

                const fileData = result[0];

                const title = fileData.title;
                const description = fileData.description || "No description";
                const filename = fileData.filename;
                const tags = JSON.parse(fileData.tags);
                const verified = fileData.verified === 1 || false;

                const html = unbuiltHtml
                    .replaceAll("{{id}}", id)
                    .replaceAll("{{title}}", DOMPurify.sanitize(title))
                    .replaceAll("{{description}}", DOMPurify.sanitize(description))
                    .replaceAll("{{filename}}", DOMPurify.sanitize(filename))
                    .replaceAll("{{tags}}", DOMPurify.sanitize(tags.join(", ")))
                    .replaceAll("{{verified}}", verified ? "Verified" : "Not Verified");

                return new Response(html, { headers: { "Content-Type": "text/html" } });
            })
            .catch(error => {return new Response(String(error))});
        
    }

    return new Response("Method not allowed", { status: 405 });
}
