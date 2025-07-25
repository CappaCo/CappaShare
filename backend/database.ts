import "@std/dotenv/load";

// Import clients for mysql and s3 (r2)
import { Client as sqlClient } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
import {
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from "npm:@aws-sdk/client-s3";

// Environment variables
const connectionString = Deno.env.get("MYSQL");
if (!connectionString) {
    throw new Error("MYSQL connection string not found in environment variables. Please set it in your .env file.");
}

// Parse the connection string to extract individual components
const url = new URL(connectionString);
const hostname = url.hostname;
const port = parseInt(url.port);
const username = url.username;
const password = url.password;
const db = url.pathname.substring(1); // Remove the leading /

const R2_KEY = Deno.env.get("R2_KEY")!;
const R2_SECRET = Deno.env.get("R2_SECRET")!;
const R2_ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID")!;
const R2_BUCKET = Deno.env.get("R2_BUCKET")!;
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Other variables
const maxPrimeRetries = 3; // Maximum number of retries for connection
const retryDelay = 2000; // Delay in milliseconds between retries
let primeRetries = 0; // Initialize retry counter

// Primer function
async function fullPrimer() {
    // Run a basic shell command to warm up the connection
    const mysqlArgs = [
        "-h", hostname,
        "--port", port.toString(),
        "-u", username,
        `-p${password}`,
        "--protocol=TCP",
        "--ssl-verify-server-cert=0",
        db,
        "-e", "SELECT 1;", // Simple query to check connection
    ]

    const mysqlshArgs = [
        "-h", hostname,
        "-P", port.toString(),
        "-u", username,
        `-p${password}`,
        "--sql",
        "--database", db,
        "-e", "SELECT 1;", // Simple query
    ];

    try {
        await primer("mysql", mysqlArgs);
    } catch (err) {
        console.error("mysql command failed:", err);
        console.log("Attempting to run mysqlsh as a fallback...");
        try {
            await primer("mysqlsh", mysqlshArgs);
        } catch (err) {
            console.error("mysqlsh command also failed:", err);
            throw new Error("Failed to run mysql or mysqlsh command. Please ensure MySQL client is installed and available in your PATH.");
        }
    }

    console.log("Primer completed successfully. Database connection is ready.");

    async function primer(command: string, args: string[]) {
        console.log("---------");
        const primerCommand = new Deno.Command(command, {
            args: args,
        });
        const result = await primerCommand.output();
        console.log("Result from primer command:\n" + new TextDecoder().decode(result.stdout));
        console.log("Errors from primer command:\n" + new TextDecoder().decode(result.stderr));
        console.log("Primer finished with code:", result.code);
        console.log("---------");
        if (result.code !== 0) {
            if (primeRetries < maxPrimeRetries) {
                primeRetries++;
                console.log(`Retrying primer command (${primeRetries}/${maxPrimeRetries})...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return primer(command, args); // Retry the primer command
            } else {
                throw new Error(`Primer command failed after ${maxPrimeRetries} attempts.`);
            }
        }
    }
}

// Moved runTests function declaration to the module root
async function runTests() {
    try {
        // Single Test: Get current time
        const result = await client.query("SELECT NOW() as currentTime;");

        // Check if it's an array and has elements (common for multi-row results)
        console.log("Current time from database:", result[0].currentTime);
    } catch (error) {
        console.error("Error during database operation:", error);
    }

    // Example usage: List objects
    const results = await client.listObjects();
    console.log("Objects in bucket:", results);
}

async function makeConsole() {
    let query;
    let result;

    while (true) {
        query = prompt("$$$");
        if (!query) continue;
        result = await client.query(query).catch(error => {return String(error)});
        console.log(result);
    }
}

// deno-lint-ignore no-explicit-any
export type Result = Record<string, any>[];

class Client {
    s3Client: S3Client;
    sqlClient: sqlClient;

    constructor() {
        // Initialize the S3 client
        this.s3Client = new S3Client({
            region: "auto",
            endpoint: R2_ENDPOINT,
            credentials: {
                accessKeyId: R2_KEY,
                secretAccessKey: R2_SECRET,
            },
        });

        this.sqlClient = new sqlClient();
    }

    async load() {
        await this.sqlClient.connect({
            hostname: hostname,
            port: port,
            username: username,
            password: password,
            db: db,
        });
    }

    // mySQL query method
    async query(query: string, params?: any[]) {
        return await this.sqlClient.query(query, params);
    }

    // S3 methods
    async listObjects() {
        const command = new ListObjectsV2Command({
            Bucket: R2_BUCKET
        });
        const response = await this.s3Client.send(command);
        return response.Contents || [];
    }

    async getObject(key: string) {
        const command = new GetObjectCommand({
            Bucket: R2_BUCKET,
            Key: key
        });
        const response = await this.s3Client.send(command);
        return response;
    }

    async putObject(key: string, body: string | Uint8Array) {
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: body,
        });
        await this.s3Client.send(command);
    }
}

const unloadedClient = new Client();
await unloadedClient.load();
export const client = unloadedClient;

await fullPrimer();

if (import.meta.main) {
    await runTests();
    await makeConsole();
}