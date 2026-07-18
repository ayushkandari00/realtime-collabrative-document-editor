const express = require('express');
const {
  getConversations,
  getOrCreateConversation,
  getConversationById,
  pinConversation,
  archiveConversation,
} = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getConversations);                    // GET /api/conversations
router.post('/', getOrCreateConversation);            // POST /api/conversations
router.get('/:id', getConversationById);              // GET /api/conversations/:id
router.put('/:id/pin', pinConversation);              // PUT /api/conversations/:id/pin
router.put('/:id/archive', archiveConversation);      // PUT /api/conversations/:id/archive

module.exports = router;
