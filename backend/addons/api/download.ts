import { client, Result } from "../../database.ts";
import 'https://deno.land/x/dotenv@v3.2.2/load.ts';

export const path = "/download/*";

export async function run(req: Request): Promise<Response> {
    const method = req.method;

    if (method == "GET") {
        console.log("getting get request");

        const url = new URL(req.url);
        const file = url.pathname.slice("/api/download/".length);
        console.log("file:", file);
        let query;
        const params: string[] = [];
        if (file) {
            query = `SELECT * FROM prod WHERE filename = ?;`;
            params.push(file);
        } else {
            query = `SELECT * FROM prod;`;
        }
        console.log("sending query:", query);
        const result: Result = await client.query(query, params)
            .catch(error => {return String(error)});
        return new Response(JSON.stringify(result), { headers: { "content-type": "application/json" } });
    }

    return new Response("yeah idk");
}