import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
import 'https://deno.land/x/dotenv@v3.2.2/load.ts';

console.log("database.ts");

const domain   = Deno.env.get("MYSQLDOMAIN")       || "localhost";
const dbname   = Deno.env.get("MYSQLDATABASE")     || "myDatabase";
const user     = Deno.env.get("MYSQLUSER")         || "root";
const password = Deno.env.get("MYSQLPASSWORD")     || "changeme";
const port     = Number(Deno.env.get("MYSQLPORT")) || 3306;

console.log("domain: " + domain);
console.log("port: " + port);
console.log("dbname: " + dbname);
console.log("user: " + user);
console.log("password: " + /*password*/ "I'm not printing the password");

//const fullHostname = (port === 3306) ? domain : `${domain}:${port}`;

export const client = await new Client().connect({
    hostname: domain,
    port: port,
    username: user,
    password: password,
    db: dbname,
});

// this test fails
try {
    console.log(await client.execute("SELECT 1"));
} catch (error) {
    console.error("SQL test failed:\n" + error);
}
