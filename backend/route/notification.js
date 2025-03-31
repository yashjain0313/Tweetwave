const express = require('express');
const protectRoute = require('../middleware/protectRoute');
const { getNotifications, deleteNotifications } = require('../controller/notification');
const notificationsRoutes = express.Router();


notificationsRoutes.get("/", protectRoute, getNotifications);
notificationsRoutes.delete("/", protectRoute, deleteNotifications);

module.exports = notificationsRoutes;