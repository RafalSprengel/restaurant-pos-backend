const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/messageController')


router.get('/received', messageController.getReceivedMessages)
router.get('/sent', messageController.getSentMessages)

router.get('/', messageController.getMessages);
router.get('/:id', messageController.getMessageById);
router.post('/', messageController.addMessage);
router.post('/delete-many', messageController.deleteMessages)
router.delete('/:id', messageController.deleteMessageById)
module.exports = router;


