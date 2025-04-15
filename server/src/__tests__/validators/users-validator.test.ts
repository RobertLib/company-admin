import { AppError } from "../../lib/errors.js";
import { Role } from "@prisma/client";
import { validateUser } from "../../validators/users-validator.js";

describe("Users Validator", () => {
  const mockRequest = {
    dict: require("../../dictionaries/cs.json"),
    body: {},
  } as any;
  const mockResponse = {} as any;
  const nextFunction = jest.fn();

  beforeEach(() => {
    mockRequest.body = {};
    jest.clearAllMocks();
  });

  it("should validate email is required", () => {
    mockRequest.body = { email: "" };

    const middleware = validateUser(["email"]);

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should validate email format", () => {
    mockRequest.body = { email: "invalid-email" };

    const middleware = validateUser(["email"]);

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should validate role", () => {
    mockRequest.body = { role: "INVALID_ROLE" };

    const middleware = validateUser(["role"]);

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should validate password is required", () => {
    mockRequest.body = { password: "" };

    const middleware = validateUser(["password"]);

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should validate password length", () => {
    mockRequest.body = { password: "123" };

    const middleware = validateUser(["password"]);

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should validate confirmPassword is required", () => {
    mockRequest.body = {
      password: "Password123",
      confirmPassword: "",
    };

    const middleware = validateUser(["password", "confirmPassword"]);

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should validate password and confirmPassword match", () => {
    mockRequest.body = {
      password: "Password123",
      confirmPassword: "DifferentPassword123",
    };

    const middleware = validateUser(["password", "confirmPassword"]);

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should pass validation with valid data", () => {
    mockRequest.body = {
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      role: Role.USER,
    };

    const middleware = validateUser([
      "email",
      "password",
      "confirmPassword",
      "role",
    ]);
    middleware(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });
});
