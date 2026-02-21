import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

let clientPromise: Promise<MongoClient> | null = null;

declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
    if (clientPromise) return clientPromise;

    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }

    if (process.env.NODE_ENV === 'development') {
        if (!global._mongoClientPromise) {
            const client = new MongoClient(MONGODB_URI);
            global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
    } else {
        const client = new MongoClient(MONGODB_URI);
        clientPromise = client.connect();
    }
    return clientPromise;
}

let indexesEnsured = false;
let ensuringIndexesPromise: Promise<void> | null = null;

export async function getDb(): Promise<Db> {
    const promise = getClientPromise();
    const client = await promise;
    const db = client.db();

    // Ensure indexes are set exactly once during the application lifetime
    if (!indexesEnsured) {
        if (!ensuringIndexesPromise) {
            ensuringIndexesPromise = (async () => {
                try {
                    const { ensureIndexes } = await import('./ensure-indexes');
                    await ensureIndexes(db);
                    indexesEnsured = true;
                } catch (err) {
                    console.error("Index assurance failed:", err);
                    // Reset promise so we can retry on next request if it failed
                    ensuringIndexesPromise = null;
                }
            })();
        }
        // Optionally wait for indexes to be ensured if strict consistency is needed on first run
        // For background tasks, we can just fire and forget, but for startup stability
        // it's better to wait or at least ensure no overlap.
    }

    return db;
}

