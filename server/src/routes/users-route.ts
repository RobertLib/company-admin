import express from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../services/users-service.js";
import { hasRole, isAuth } from "../middleware/auth-middleware.js";
import { Role } from "@prisma/client";
import { validateListParams } from "../validators/list-params-validator.js";
import { validateUser } from "../validators/users-validator.js";
import removeDiacritics from "../utils/remove-diacritics.js";

const router = express.Router();

router.use(isAuth, hasRole(Role.ADMIN));

router.get(
  "/",
  validateListParams({
    allowedSortFields: ["id", "name", "email"],
    filterValidators: {
      role: (value) => {
        if (value && !Object.values(Role).includes(value)) {
          return {
            error: `Role must be either ${Object.values(Role).join(", ")}`,
            valid: false,
          };
        }
        return { valid: true };
      },
    },
  }),
  async (req, res) => {
    const page = (req.query.page as string) || "1";
    const limit = (req.query.limit as string) || "20";
    const sortBy = (req.query.sortBy as string) || "id";
    const order = (req.query.order as string) || "desc";
    const name = req.query.name ? String(req.query.name) : undefined;
    const email = req.query.email ? String(req.query.email) : undefined;
    const role = req.query.role as Role | undefined;
    const showDeleted = req.query.showDeleted === "true";

    const result = await getUsers({
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { [sortBy as string]: order },
      where: {
        name: name
          ? { contains: removeDiacritics(String(name)), mode: "insensitive" }
          : undefined,
        email: email
          ? { contains: removeDiacritics(String(email)), mode: "insensitive" }
          : undefined,
        role: role as Role,
        deletedAt: showDeleted ? { not: null } : null,
      },
    });

    res.send(result);
  }
);

router.get("/:id", async (req, res) => {
  const { id } = req.params ?? {};
  const user = await getUserById(req, Number(id));
  res.send(user);
});

router.post(
  "/",
  validateUser(["email", "password", "confirmPassword", "role"]),
  async (req, res) => {
    const { email, name, password, role } = req.body ?? {};
    const user = await createUser(req, { email, name, password, role });
    res.status(201).send(user);
  }
);

router.patch("/:id", validateUser(["email", "role"]), async (req, res) => {
  const { id } = req.params ?? {};
  const { email, name, password, role } = req.body ?? {};
  const user = await updateUser(req, Number(id), {
    email,
    name,
    password,
    role,
  });
  res.send(user);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params ?? {};
  const user = await deleteUser(req, Number(id));
  res.send(user);
});

export default router;
