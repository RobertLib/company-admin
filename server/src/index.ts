import "dotenv/config";
import express from "express";
import cors from "cors";
import { AppError } from "./lib/errors.js";
import authRoute from "./routes/auth-route.js";
import usersRoute from "./routes/users-route.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const currentTime = new Date().toISOString();
  console.info(`[${currentTime}] Request: ${req.method} ${req.url}`);
  next();
});

app.use("/api/v1/", authRoute);
app.use("/api/v1/users", usersRoute);

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.use(((err, req, res, next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode || 400).send({
      error: {
        message: err.message,
        fieldErrors: err.fieldErrors,
      },
      success: false,
    });
    return;
  }

  console.error(err);

  res.status(500).send({
    error: { message: "Internal server error." },
  });
}) as express.ErrorRequestHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.info(`Server is running on port ${PORT}`);
});
