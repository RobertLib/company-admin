import { getDictionary } from "../dictionaries/index.js";
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: Role;
      };
      dict: ReturnType<typeof getDictionary>;
    }
  }
}
