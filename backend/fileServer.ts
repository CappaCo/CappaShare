console.log("File server running");

// Handle all requests to file server
async function handler(req: Request) {
    const reqMethod = req.method;
    //const reqURL = new URL(req.url);
    //const reqPath = reqURL.pathname;

    // If the request method is GET
    if (reqMethod == "GET") {
        // Get parts of the website
        return await getRequest(req);
    } else if (reqMethod == "POST") {
        return await postRequest(req);
    } else {
        // Otherwise it's a bad request
        return new Response("Yeah idk", { status: 400 });
    }
}

async function getRequest(req: Request) {
    console.log("Getting GET request");
    return new Response("Get request :)");
}

async function postRequest(req: Request) {
    console.log("Getting POST request");
    return new Response("Post request :)");
}

// Serve with deno
Deno.serve({ port: 8001 }, handler);