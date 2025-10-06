const express = require('express');
const router = express.Router();
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');
const messageController = require('../../controllers/messageController')

// ============= public routes ========================
router.post('/', messageController.newMessageFromForm);

// ================= private routes ===================
router.get('/received',authentMiddleware, authorize(['guest', 'member', 'moderator', 'admin']),  messageController.getReceivedMessages)
router.get('/sent', authentMiddleware, authorize(['guest', 'member', 'moderator', 'admin']), messageController.getSentMessages)
router.get('/unread-count', authentMiddleware, authorize(['guest', 'member', 'moderator', 'admin']), messageController.getUnreadMessagesCount);
router.post('/reply',authentMiddleware, authorize(['member', 'moderator', 'admin']), messageController.replyToMessage); 

router.get('/', authentMiddleware, authorize(['guest', 'member', 'moderator', 'admin']), messageController.getMessages );
router.get('/:id', authentMiddleware, authorize(['guest', 'member', 'moderator', 'admin']), messageController.getMessageById);
router.post('/delete-many', authentMiddleware, authorize(['member', 'moderator', 'admin']), messageController.deleteMessages)
router.delete('/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), messageController.deleteMessageById)
module.exports = router;


