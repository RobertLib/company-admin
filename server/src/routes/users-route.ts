import express from "express";
import { getUsers } from "../services/users-service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const users = await getUsers();
  res.send(users);
});

export default router;
