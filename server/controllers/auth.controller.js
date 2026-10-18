const User = require('../models/User');
const Agent = require('../models/Agent');
const Property = require('../models/Property');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, country, city, state, phone, agency, bio, yearsOfExperience } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Determine role: strictly check if 'agent'
    const userRole = (role && role.toLowerCase() === 'agent') ? 'agent' : 'buyer';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone: phone || '',
      country: country || '',
      city: city || '',
      state: state || ''
    });

    let agentData = null;
    // If registered as an agent, create their Agent profile in Agent collection
    if (userRole === 'agent') {
      let agent = await Agent.findOne({ email: user.email });
      if (!agent) {
        agent = await Agent.create({
          name: user.name,
          email: user.email,
          phone: phone || user.phone || '555-0100',
          agency: agency || 'Estate Luxury Group',
          bio: bio || 'Licensed Real Estate Professional',
          yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : 1,
          photo: user.photo
        });
      }
      agentData = agent;
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        photo: user.photo || '',
        country: user.country,
        city: user.city,
        state: user.state,
        agency: agentData ? agentData.agency : undefined,
        bio: agentData ? agentData.bio : undefined,
        yearsOfExperience: agentData ? agentData.yearsOfExperience : undefined
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    let agentData = null;
    // If agent, ensure linked Agent profile exists
    if (user.role === 'agent') {
      let agent = await Agent.findOne({ email: user.email });
      if (!agent) {
        agent = await Agent.create({
          name: user.name,
          email: user.email,
          phone: user.phone || '555-0100',
          agency: 'Estate Luxury Group',
          bio: 'Licensed Real Estate Professional',
          yearsOfExperience: 1,
          photo: user.photo
        });
      }
      agentData = agent;
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        photo: user.photo || '',
        country: user.country,
        city: user.city,
        state: user.state,
        agency: agentData ? agentData.agency : undefined,
        bio: agentData ? agentData.bio : undefined,
        yearsOfExperience: agentData ? agentData.yearsOfExperience : undefined
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let userData = user.toObject();

    // Merge Agent details if user has agent role
    if (user.role === 'agent') {
      let agent = await Agent.findOne({ email: user.email });
      if (!agent) {
        agent = await Agent.create({
          name: user.name,
          email: user.email,
          phone: user.phone || '555-0100',
          agency: 'Estate Luxury Group',
          bio: 'Licensed Real Estate Professional',
          yearsOfExperience: 1,
          photo: user.photo
        });
      }
      userData.agency = agent.agency;
      userData.bio = agent.bio;
      userData.yearsOfExperience = agent.yearsOfExperience;
    }

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const oldEmail = user.email;

    // Update User details
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

    // Allow upgrading role if requested (e.g. buyer -> agent)
    if (req.body.role && (req.body.role === 'agent' || req.body.role === 'buyer')) {
      user.role = req.body.role;
    }

    // Set avatar photo URL if uploaded via Multer
    if (req.file) {
      user.photo = req.file.path || `/uploads/${req.file.filename}`;
    } else if (req.body.photo) {
      user.photo = req.body.photo;
    }

    await user.save();

    // Sync Agent profile in parallel if user has agent role
    let agentData = null;
    if (user.role === 'agent') {
      let agent = await Agent.findOne({ email: oldEmail });
      if (!agent) {
        agent = new Agent({
          email: user.email,
          name: user.name,
          phone: user.phone || '555-0100',
          agency: req.body.agency || 'Estate Luxury Group'
        });
      }
      agent.name = user.name;
      agent.email = user.email;
      agent.phone = user.phone || agent.phone;
      agent.photo = user.photo;
      agent.agency = req.body.agency || agent.agency;
      agent.bio = req.body.bio !== undefined ? req.body.bio : agent.bio;
      agent.yearsOfExperience = req.body.yearsOfExperience !== undefined ? parseInt(req.body.yearsOfExperience, 10) : agent.yearsOfExperience;
      
      await agent.save();
      agentData = agent;
    }

    let returnData = user.toObject();
    if (agentData) {
      returnData.agency = agentData.agency;
      returnData.bio = agentData.bio;
      returnData.yearsOfExperience = agentData.yearsOfExperience;
    }

    res.status(200).json({
      success: true,
      data: returnData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both current and new passwords'
      });
    }

    // Get user and select password hash explicitly
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Set new password (will be hashed automatically by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete current logged in user account
// @route   DELETE /api/auth/me
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Clean up Agent profile and property listings if agent role
    if (user.role === 'agent') {
      const agent = await Agent.findOne({ email: user.email });
      if (agent) {
        // Delete all properties listed by this agent
        await Property.deleteMany({ _id: { $in: agent.listings } });
        // Delete agent record
        await agent.deleteOne();
      }
    }

    // Delete user record
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
