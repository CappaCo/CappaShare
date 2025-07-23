import { getDbClient, Result } from "../../database.ts";
import 'https://deno.land/x/dotenv@v3.2.2/load.ts';

export const path = "/download";

const client = await getDbClient();

export async function run(req: Request): Promise<Response> {
    const json = await req.json();
    console.log(json);
    return new Response("yeah idk");
}