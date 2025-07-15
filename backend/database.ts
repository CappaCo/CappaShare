import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts"; // Loads .env file variables into Deno.env

let clientPromise: Promise<Client> | undefined; // Changed to undefined for initial state

export async function getDbClient(): Promise<Client> {
    if (!clientPromise) { // Check if the connection promise has already been initiated
        clientPromise = (async () => { // Assign the promise here, so subsequent calls await the same promise
            const railwayInternalHost = Deno.env.get("RAILWAY_HOST");
            const connectionString = Deno.env.get("MYSQL"); // Retrieve connection string inside the async function
            if (!connectionString) {
                throw new Error("MYSQL connection string not found in environment variables. Please set it in your .env file.");
            }

            // Parse the connection string to extract individual components
            const url = new URL(connectionString);
            const hostname = railwayInternalHost || url.hostname;
            const port = parseInt(url.port);
            const username = url.username;
            const password = url.password;
            const db = url.pathname.substring(1); // Remove the leading '/'

            const client = new Client();
            await client.connect({
                hostname: hostname,
                port: port,
                username: username,
                password: password,
                db: db,
            });
            console.log("Successfully connected to Railway MySQL database!");
            return client; // Return the connected client instance
        })();
    }
    return await clientPromise; // Await the promise and return the resolved client instance
}

/**
 * Closes the database client connection if it exists.
 * This should typically be called when your application is shutting down.
 */
export async function closeDbClient(): Promise<void> {
    if (clientPromise) {
        const client = await clientPromise; // Await the promise to get the client instance
        if (client) {
            await client.close();
            console.log("Database connection closed.");
        }
        clientPromise = undefined; // Reset the promise so a new connection can be made if needed
    }
}

// Moved runTests function declaration to the module root
async function runTests() {
    let client: Client | undefined;
    try {
        client = await getDbClient();

        // Single Test: Get current time
        // Do NOT use array destructuring initially. Get the raw result.
        const result = await client.query("SELECT NOW() as currentTime;");

        console.log("Debug: Raw query result content:", result); // Crucial for debugging

        // Check if it's an array and has elements (common for multi-row results)
        if (Array.isArray(result) && result.length > 0) {
            console.log("Current time from database:", result[0].currentTime);
        }
        // Else, check if it's a direct object with the property (common for single-row results like NOW())
        else if (typeof result === 'object' && result !== null && 'currentTime' in result) {
            console.log("Current time from database:", result.currentTime);
        } else {
            console.error("Error: SELECT NOW() did not return expected data.");
            console.error("Debug: Result variable content:", result);
            throw new Error("Failed to get current time from database: Unexpected query result format.");
        }

    } catch (error) {
        console.error("Error during database operation:", error);
    } finally {
        // Ensure client is closed after tests
        await closeDbClient();
    }
}
// end

if (import.meta.main) {
    runTests();
}

// deno-lint-ignore no-explicit-any
export type Result = Array<Record<any, any>>;