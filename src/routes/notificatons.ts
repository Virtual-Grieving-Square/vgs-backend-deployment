import express from 'express';
import { addNotification, viewNotificationsByUserID, showNotificationsBySeenStatus, markNotificationsAsSeen } from '../controller/notification.controller';

const router = express.Router();

router.post('/notifications', addNotification);
router.get('/notifications/:userID', viewNotificationsByUserID);
router.get('/notifications/:userID/:seen', showNotificationsBySeenStatus);
router.put('/notifications/seen/:userID', markNotificationsAsSeen);

export default router;
