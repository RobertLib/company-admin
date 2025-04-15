const cs = require("../dictionaries/cs.json");

jest.mock("../dictionaries/index.js", () => ({ getDictionary: () => cs }), {
  virtual: true,
});
