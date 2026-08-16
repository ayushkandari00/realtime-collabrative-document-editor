const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  removeCollaborator,
  getHistory,
  restoreVersion,
} = require('../controllers/documentController');

router.use(protect);

router.get('/', getDocuments);
router.post('/', createDocument);
router.post('/share', shareDocument);

router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

router.get('/:id/history', getHistory);
router.post('/:id/restore/:version', restoreVersion);
router.delete('/:id/collaborators/:userId', removeCollaborator);

module.exports = router;
