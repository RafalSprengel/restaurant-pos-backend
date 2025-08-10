const express = require('express');
const router = express.Router();
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');
const messageController = require('../../controllers/messageController')


router.get('/received',authentMiddleware, authorize(['member', 'moderator', 'admin']),  messageController.getReceivedMessages)
router.get('/sent', authentMiddleware, authorize(['member', 'moderator', 'admin']), messageController.getSentMessages)
router.get('/unread-count', authentMiddleware, authorize(['member', 'moderator', 'admin']), messageController.getUnreadMessagesCount);
router.post('/reply',authentMiddleware, authorize(['member', 'moderator', 'admin']), messageController.replyToMessage); 

router.get('/', authentMiddleware, authorize(['member', 'moderator', 'admin']), messageController.getMessages );
router.get('/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), messageController.getMessageById);
router.post('/', authentMiddleware, authorize(['member', 'moderator', 'admin']), messageController.newMessageFromForm);
router.post('/delete-many', authentMiddleware, authorize(['member', 'moderator', 'admin']), messageController.deleteMessages)
router.delete('/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), messageController.deleteMessageById)
module.exports = router;


