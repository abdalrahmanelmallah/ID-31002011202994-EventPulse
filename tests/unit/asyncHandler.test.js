const asyncHandler = require("../../utils/asyncHandler");

describe("asyncHandler", () => {
  test("calls the wrapped controller with req, res, and next", async () => {
    const controller = jest.fn(async (req, res, next) => {
      res.success = true;
    });

    const wrapped = asyncHandler(controller);

    const req = {};
    const res = {};
    const next = jest.fn();

    await wrapped(req, res, next);

    expect(controller).toHaveBeenCalledWith(req, res, next);
    expect(res.success).toBe(true);
  });

  test("passes rejected errors to next", async () => {
    const error = new Error("Test error");

    const controller = jest.fn(async () => {
      throw error;
    });

    const wrapped = asyncHandler(controller);

    const next = jest.fn();

    await wrapped({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
