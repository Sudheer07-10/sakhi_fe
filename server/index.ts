import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env only if it exists; completely optional
const envPath = path.resolve(import.meta.dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
}

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Allow Google Sign-In popup if needed
app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// Request logger for API calls
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      log(`${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "5100", 10);

  function startServer(portToTry: number) {
    server.removeAllListeners("error");
    server.once("error", (err: any) => {
      if (err.code === "EADDRINUSE" || err.code === "EACCES") {
        log(`Port ${portToTry} is busy or restricted, trying port ${portToTry + 1}...`);
        startServer(portToTry + 1);
      } else {
        console.error("Server listen error:", err);
      }
    });

    server.listen(
      {
        port: portToTry,
        host: "0.0.0.0",
      },
      () => {
        log(`Sakhi Companion running on http://localhost:${portToTry}`);
      }
    );
  }

  startServer(preferredPort);
})();
