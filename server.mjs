import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";

installGlobals();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_PATH = path.resolve(__dirname, "build/server/index.js");

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.use(morgan("tiny", {
    skip: (req) => req.url === "/api/health"
}));

// SPECIAL BITRIX24 HANDLER:
// Bitrix24 launches apps via POST. Remix blocks cross-origin POSTs to actions with a CSRF error.
// We intercept the POST to the root, convert it to a GET with the same parameters, and let the loader handle it.
app.post("/", express.urlencoded({ extended: true }), (req, res, next) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Clone original search params
    const newParams = new URLSearchParams(url.search);

    // Add body params to search params
    if (req.body && typeof req.body === 'object') {
        for (const [key, value] of Object.entries(req.body)) {
            if (typeof value === 'string') {
                newParams.set(key, value);
            }
        }
    }

    console.log(`[Server] Intercepted Bitrix POST. Redirecting to GET with params for domain: ${newParams.get('DOMAIN')}`);

    // Redirect to GET
    return res.redirect(303, `/?${newParams.toString()}`);
});

app.all(
    "(.*)",
    createRequestHandler({
        build: await import(BUILD_PATH),
        mode: process.env.NODE_ENV,
    })
);

const port = process.env.PORT || 9002;
app.listen(port, () => {
    console.log(`[Express Server] Remix app ready at http://localhost:${port}`);
});
