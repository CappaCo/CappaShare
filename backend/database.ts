import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

console.log("database.ts");

const hostname = Deno.env.get("DATABASE_HOSTNAME") || "localhost";
const port     = Deno.env.get("DATABASE_PORT")     || "3306";
const dbname   = Deno.env.get("DATABASE_NAME")     || "myDatabase";
const username = Deno.env.get("DATABASE_USERNAME") || "root";
const password = Deno.env.get("DATABASE_PASSWORD") || "changeme";

console.log("hostname: " + hostname);
console.log("port: " + port);
console.log("dbname: " + dbname);
console.log("username: " + username);
console.log("password: " + /*password*/ "I'm not printing the password");

export const client = await new Client().connect({
    hostname: hostname,
    db: dbname,
    username: username,
    password: password,
});

