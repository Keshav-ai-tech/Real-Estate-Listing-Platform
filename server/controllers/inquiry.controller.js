const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const Agent = require('../models/Agent');

// @desc    Submit an inquiry on a property
// @route   POST /api/inquiries
// @access  Public
exports.createInquiry = async (req, res, next) => {
  try {
    const { property, name, email, phone, message } = req.body;

    // Check if property exists
    const propertyExists = await Property.findById(property);
    if (!propertyExists) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    const inquiry = await Inquiry.create({
      property,
      name,
      email,
      phone,
      message
    });

    res.status(201).json({
      success: true,
      data: inquiry
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get inquiries (Agent: only own listings; Admin: all)
// @route   GET /api/inquiries
// @access  Private (Agent/Admin)
exports.getInquiries = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      // Admins see all inquiries
      query = Inquiry.find().populate({
        path: 'property',
        select: 'title address price type'
      });
    } else if (req.user.role === 'agent') {
      // Find agent profile linked to user
      const agent = await Agent.findOne({ email: req.user.email });
      if (!agent) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }

      // Find all property IDs listed by this agent
      const properties = await Property.find({ agent: agent._id }).select('_id');
      const propertyIds = properties.map(p => p._id);

      // Fetch inquiries for these properties
      query = Inquiry.find({ property: { $in: propertyIds } }).populate({
        path: 'property',
        select: 'title address price type'
      });
    } else {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view inquiries'
      });
    }

    const inquiries = await query.sort('-createdAt');

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (err) {
    next(err);
  }
};
