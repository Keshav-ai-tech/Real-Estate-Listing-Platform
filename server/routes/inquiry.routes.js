const express = require('express');
const { createInquiry, getInquiries } = require('../controllers/inquiry.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router
  .route('/')
  .post(createInquiry)
  .get(protect, authorize('agent', 'admin'), getInquiries);

module.exports = router;
