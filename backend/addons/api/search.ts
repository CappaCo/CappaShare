import "@std/dotenv/load";
import { client, Result } from "../../database.ts";

const table = Deno.env.get("TABLE") || "prod";

export const path = "*";

export async function run(req: Request): Promise<Response> {
    const method = req.method;

    if (method == "GET") {
        console.log("getting get request");

        const url = new URL(req.url);
        const queryParam = url.searchParams.get("cappashare-search");

        let query;
        const params: string[] = [];
        if (queryParam) {
            query = `
            SELECT *
            FROM ${table}
            WHERE MATCH(title, description) AGAINST (? IN NATURAL LANGUAGE MODE)
            ORDER BY created_at DESC
            LIMIT 20 OFFSET 0;
            `;
            params.push(queryParam);
        } else {
            query = `
            SELECT *
            FROM ${table}
            ORDER BY created_at DESC
            LIMIT 20 OFFSET 0;
            `;
        }
        console.log("sending query:", query, "params:", params);
        const result: Result = await client.query(query, params);
        
        return new Response(JSON.stringify(result), { headers: { "content-type": "application/json" } });
    }

    return new Response("yeah idk");
}
