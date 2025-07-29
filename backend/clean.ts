import { client } from "./database.ts";

function cleanDatabases() {
    console.log("Cleaning databases...");

    return Promise.all([
        client.query("SELECT id FROM files;"),
        client.listObjects(),
    ])
        .then(([databaseEntries, objects]) => {
            const databaseIds = new Set(databaseEntries.map((entry) => entry.id));
            const objectIds = new Set(objects.map((object) => object.Key));

            console.log("Database IDs:", databaseIds);
            console.log("Object IDs:", objectIds);

            const databaseEntriesToDelete = databaseIds.difference(objectIds);
            const objectsToDelete = objectIds.difference(databaseIds);

            console.log("Database entries to delete:", databaseEntriesToDelete);
            console.log("Objects to delete:", objectsToDelete);

            const pinkyPromises = [];

            // Delete database entries
            if (databaseEntriesToDelete.size > 0) {
                const deleteQuery = `DELETE FROM files WHERE id IN (?);`;
                const params = [
                    Array.from(databaseEntriesToDelete).map((id) => `'${id}'`)
                        .join(", "),
                ];

                console.log("Deleting database entries: " + params);

                pinkyPromises.push(
                    client.query(deleteQuery, params),
                );
            }

            // Delete objects from R2
            if (objectsToDelete.size > 0) {
                Array.from(objectsToDelete).forEach((id) => {
                    if (!id) return;
                    console.log("Deleting object from R2: " + id);

                    pinkyPromises.push(
                        client.deleteObject(id),
                    );
                });
            }

            return Promise.all(pinkyPromises);
        });
}

if (import.meta.main) {
    await cleanDatabases()
        .then(() => {
            console.log("Databases cleaned successfully.");
        });
}
