import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { getDictionary } from "./dictionaries/index.js";
import { AppError } from "./lib/errors.js";
import logger from "./utils/logger.js";
import prisma from "./lib/prisma.js";
import authRoute from "./routes/auth-route.js";
import usersRoute from "./routes/users-route.js";

const requiredEnvVars = [
  "DATABASE_URL",
  "FRONTEND_URL",
  "JWT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable ${envVar} is missing`);
    process.exit(1);
  }
}

const app = express();

app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const currentTime = new Date().toISOString();
  logger.info(`[${currentTime}] Request: ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  req.dict = getDictionary();
  next();
});

app.use("/api/v1/", limiter);

app.use("/api/v1/", authRoute);
app.use("/api/v1/users", usersRoute);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const uptime = process.uptime();

    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes, ${Math.floor(
        uptime % 60
      )} seconds`,
      database: "connected",
    });
  } catch (error) {
    logger.error("Health check failed", { error });
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: "Health check failed",
    });
  }
});

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.use(((err, req, res, next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode ?? 400).send({
      error: {
        message: err.message,
        fieldErrors: err.fieldErrors,
      },
      success: false,
    });
    return;
  }

  logger.error("Server error", { error: err });

  res.status(500).send({
    error: { message: "Internal server error" },
  });
}) as express.ErrorRequestHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.info(`Server is running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.info("Server shutdown initiated by SIGTERM");
    prisma.$disconnect();
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  server.close(() => {
    console.info("Server shutdown initiated by SIGINT");
    prisma.$disconnect();
    process.exit(0);
  });
});
