const request = require("supertest");
const express = require("express");

jest.mock("../../middleware/requireAuth", () => {
  return (req, res, next) => {
    if (req.headers.authorization === "Bearer TEST_ADMIN_TOKEN") {
      req.user = {
        id: "507f1f77bcf86cd799439011",
        role: "admin"
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  };
});

jest.mock("../../middleware/requireRole", () => {
  return (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      next();
    };
  };
});

jest.mock("../../controllers/eventController", () => ({
  getEvents: (req, res) => {
    res.status(200).json({
      success: true,
      data: []
    });
  },

  getEventById: (req, res) => {
    res.status(200).json({
      success: true
    });
  },

  createEvent: (req, res) => {
    res.status(201).json({
      success: true,
      data: req.body
    });
  },

  updateEvent: (req, res) => {
    res.status(200).json({
      success: true
    });
  },

  deleteEvent: (req, res) => {
    res.status(200).json({
      success: true
    });
  }
}));

const eventRoutes = require("../../routes/eventRoutes");

const app = express();

app.use(express.json());
app.use("/api/events", eventRoutes);

describe("Events API", () => {
  test("GET /api/events returns 200", async () => {
    const response = await request(app)
      .get("/api/events");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("POST /api/events without token returns 401", async () => {
    const response = await request(app)
      .post("/api/events")
      .send({
        title: "Test Event",
        description: "Test description",
        capacity: 50,
        date: "2026-12-15T18:00:00Z",
        city: "Cairo",
        category: "507f1f77bcf86cd799439011"
      });

    expect(response.statusCode).toBe(401);
  });

  test("POST /api/events with invalid data returns 422", async () => {
    const response = await request(app)
      .post("/api/events")
      .set("Authorization", "Bearer TEST_ADMIN_TOKEN")
      .send({
        title: "",
        category: "invalid-id",
        date: "not-a-date",
        capacity: 0
      });

    expect(response.statusCode).toBe(422);
  });
});
