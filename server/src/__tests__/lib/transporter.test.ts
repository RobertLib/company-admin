import logger from "../../utils/logger.js";

jest.mock("../../utils/logger.js", () => ({
  info: jest.fn(),
}));

describe("Transporter", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("should log email details in non-production environment", async () => {
    const transporter = (await import("../../lib/transporter.js")).default;

    const mailOptions = {
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test content",
      html: "<p>Test HTML content</p>",
      from: "sender@example.com",
    };

    const result = await transporter.sendMail(mailOptions);

    expect(logger.info).toHaveBeenCalledWith(
      "💌 Email would be sent in production:"
    );
    expect(logger.info).toHaveBeenCalledWith("To: test@example.com");
    expect(logger.info).toHaveBeenCalledWith("Subject: Test Subject");
    expect(logger.info).toHaveBeenCalledWith("Text: Test content");
    expect(logger.info).toHaveBeenCalledWith("HTML: <p>Test HTML content</p>");

    expect(result).toHaveProperty("messageId");
    expect(result.messageId).toMatch(/^dev-\d+$/);
    expect(result).toHaveProperty("envelope");
    expect(result.envelope).toEqual({
      to: "test@example.com",
      from: "sender@example.com",
    });
  });

  it("should handle missing email fields gracefully", async () => {
    const transporter = (await import("../../lib/transporter.js")).default;

    const mailOptions = {
      from: "sender@example.com",
    };

    await transporter.sendMail(mailOptions);

    expect(logger.info).toHaveBeenCalledWith("To: N/A");
    expect(logger.info).toHaveBeenCalledWith("Subject: N/A");
    expect(logger.info).toHaveBeenCalledWith("Text: N/A");
    expect(logger.info).toHaveBeenCalledWith("HTML: N/A");
  });
});
