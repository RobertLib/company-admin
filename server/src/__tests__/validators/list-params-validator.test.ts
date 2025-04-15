import { AppError } from "../../lib/errors.js";
import { validateListParams } from "../../validators/list-params-validator.js";

describe("List Params Validator", () => {
  const mockRequest = {
    dict: require("../../dictionaries/cs.json"),
    query: {},
  } as any;
  const mockResponse = {} as any;
  const nextFunction = jest.fn();

  beforeEach(() => {
    mockRequest.query = {};
    jest.clearAllMocks();
  });

  it("should pass with valid parameters", () => {
    mockRequest.query = {
      page: "1",
      limit: "10",
      sortBy: "id",
      order: "asc",
    };

    const middleware = validateListParams();
    middleware(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  it("should throw error for invalid page parameter", () => {
    mockRequest.query = { page: "invalid" };

    const middleware = validateListParams();

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should throw error for invalid limit parameter", () => {
    mockRequest.query = { limit: "invalid" };

    const middleware = validateListParams();

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should throw error for invalid sortBy parameter type", () => {
    mockRequest.query = { sortBy: ["id"] };

    const middleware = validateListParams();

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should throw error for disallowed sortBy field", () => {
    mockRequest.query = { sortBy: "invalidField" };

    const middleware = validateListParams({
      allowedSortFields: ["id", "name"],
    });

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should throw error for invalid order parameter", () => {
    mockRequest.query = { order: "invalid" };

    const middleware = validateListParams();

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should throw error for invalid showDeleted parameter", () => {
    mockRequest.query = { showDeleted: "notBoolean" };

    const middleware = validateListParams();

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should validate filter parameter with custom validator", () => {
    mockRequest.query = { customField: "test" };

    const middleware = validateListParams({
      filterValidators: {
        customField: (value) => ({
          valid: false,
          error: "Invalid custom field",
        }),
      },
    });

    expect(() => {
      middleware(mockRequest, mockResponse, nextFunction);
    }).toThrow(AppError);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
