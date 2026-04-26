// ============================================================
// Blood Request Routes
// ============================================================
const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  createRequest,
  getAllRequests,
  getRequest,
  getMyRequests,
  updateRequest,
  markFulfilled,
  reportRequest,
  respondToRequest,
  getStats,
} = require('../controllers/requestController');

router.get('/stats', getStats);
router.get('/', optionalAuth, getAllRequests);
router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/:id', optionalAuth, getRequest);
router.put('/:id', protect, updateRequest);
router.post('/:id/fulfill', protect, markFulfilled);
router.post('/:id/report', protect, reportRequest);
router.post('/:id/respond', protect, respondToRequest);

module.exports = router;
