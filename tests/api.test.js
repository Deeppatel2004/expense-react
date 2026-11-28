
import { describe, it, expect } from "vitest";
import { pickMessage } from "../src/api.js";

describe("pickMessage", () => {
  it("extracts a message from data.message", () => {
    const result = pickMessage(
      { message: "Something failed" },
      "Something went wrong."
    );

    expect(result).toBe("Something failed");
  });

  it("extracts a message from a string data.error", () => {
    const result = pickMessage(
      { error: "Not logged in" },
      "Something went wrong."
    );

    expect(result).toBe("Not logged in");
  });

  it("extracts a message from a nested data.error.message", () => {
    const result = pickMessage(
      {
        error: {
          status: 400,
          message: "Invalid category",
        },
      },
      "Something went wrong."
    );

    expect(result).toBe("Invalid category");
  });
});
