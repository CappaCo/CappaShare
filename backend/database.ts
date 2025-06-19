import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const hostname = Deno.env.get("DATABASE_HOSTNAME");
const dbname = Deno.env.get("DATABASE_NAME");
const username = Deno.env.get("DATABASE_USERNAME");
const password = Deno.env.get("DATABASE_PASSWORD");

console.log("hostname: " + hostname);

const client = await new Client().connect({
    hostname: hostname,
    db: dbname,
    username: username,
    password: password,
});

console.log(client);