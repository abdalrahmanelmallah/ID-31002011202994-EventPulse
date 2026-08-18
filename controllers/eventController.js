const mongoose = require("mongoose");
const Event = require("../models/Event");

// GET /api/events
// Supports:
// ?category=ID
// ?city=Cairo
// ?startDate=2026-09-01
// ?endDate=2026-12-31
// ?page=1
// ?limit=10
// ?sortBy=date
// ?sortBy=registrations
// ?order=asc
// ?order=desc
// ?search=music

exports.getEvents = async (req, res) => {
  try {
    const {
      category,
      city,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = "date",
      order = "asc",
      search
    } = req.query;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const filter = {};

    // Category filter
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID"
        });
      }

      filter.category = new mongoose.Types.ObjectId(category);
    }

    // City filter
    if (city) {
      filter.city = {
        $regex: city,
        $options: "i"
      };
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        const fromDate = new Date(startDate);

        if (isNaN(fromDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate"
          });
        }

        filter.date.$gte = fromDate;
      }

      if (endDate) {
        const toDate = new Date(endDate);

        if (isNaN(toDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate"
          });
        }

        filter.date.$lte = toDate;
      }
    }

    // Text search
    if (search && search.trim()) {
      filter.$text = {
        $search: search.trim()
      };
    }

    // Sorting
    let sortStage;

    if (sortBy === "registrations") {
      sortStage = {
        registrationCount: order === "desc" ? -1 : 1,
        date: 1
      };
    } else {
      sortStage = {
        date: order === "desc" ? -1 : 1
      };
    }

    const skip = (currentPage - 1) * perPage;

    const result = await Event.aggregate([
      // Apply filters
      {
        $match: filter
      },

      // Find registrations belonging to each event
      {
        $lookup: {
          from: "registrations",
          let: { eventId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$event", "$$eventId"] },
                    { $eq: ["$status", "registered"] }
                  ]
                }
              }
            }
          ],
          as: "registrations"
        }
      },

      // Count registrations
      {
        $addFields: {
          registrationCount: {
            $size: "$registrations"
          }
        }
      },

      // Sort
      {
        $sort: sortStage
      },

      // Pagination + total count
      {
        $facet: {
          metadata: [
            {
              $count: "total"
            }
          ],
          data: [
            {
              $skip: skip
            },
            {
              $limit: perPage
            },

            // Populate category
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
              }
            },

            {
              $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true
              }
            },

            // Populate createdBy
            {
              $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy"
              }
            },

            {
              $unwind: {
                path: "$createdBy",
                preserveNullAndEmptyArrays: true
              }
            },

            // Remove password and registration documents
            {
              $project: {
                registrations: 0,
                "createdBy.password": 0
              }
            }
          ]
        }
      }
    ]);

    const total = result[0].metadata[0]
      ? result[0].metadata[0].total
      : 0;

    const events = result[0].data;

    res.json({
      success: true,
      count: events.length,
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("category")
      .populate("createdBy", "name email");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      capacity,
      date,
      city,
      category
    } = req.body;

    const event = await Event.create({
      title,
      description,
      capacity,
      date,
      city,
      category,
      createdBy: req.user.id
    });

    const populatedEvent = await Event.findById(event._id)
      .populate("category")
      .populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: populatedEvent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate("category")
      .populate("createdBy", "name email");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      message: "Event updated successfully",
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};