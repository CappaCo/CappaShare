import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
import 'https://deno.land/x/dotenv@v3.2.2/load.ts';

console.log("database.ts");

const domain   = Deno.env.get("MYSQLDOMAIN")   || "localhost";
const port     = Deno.env.get("MYSQLPORT")     || "3306";
const dbname   = Deno.env.get("MYSQLNAME")     || "myDatabase";
const username = Deno.env.get("MYSQLUSERNAME") || "root";
const password = Deno.env.get("MYSQLPASSWORD") || "changeme";

console.log("domain: " + domain);
console.log("port: " + port);
console.log("dbname: " + dbname);
console.log("username: " + username);
console.log("password: " + /*password*/ "I'm not printing the password");

const fullHostname = (port === "3306") ? domain : `${domain}:${port}`;

export const client = await new Client().connect({
    hostname: fullHostname,
    db: dbname,
    username: username,
    password: password,
});

