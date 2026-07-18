const express = require('express');
const { sendMessage, getMessages, deleteMessage, editMessage, addReaction, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { uploadImage, uploadFile } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);                              // POST /api/messages (text)
router.post('/image', uploadImage, sendMessage);            // POST /api/messages/image
router.post('/file', uploadFile, sendMessage);              // POST /api/messages/file
router.get('/:conversationId', getMessages);               // GET /api/messages/:conversationId
router.delete('/:id', deleteMessage);                      // DELETE /api/messages/:id
router.put('/:id', editMessage);                           // PUT /api/messages/:id
router.post('/:id/react', addReaction);                    // POST /api/messages/:id/react
router.put('/read/:conversationId', markAsRead);           // PUT /api/messages/read/:conversationId

module.exports = router;
