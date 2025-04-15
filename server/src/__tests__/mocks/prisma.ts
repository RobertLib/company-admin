import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import prisma from "../../lib/prisma.js";

jest.mock("../../lib/prisma.js", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

export default prismaMock;
