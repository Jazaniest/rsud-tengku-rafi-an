// server/routes/workflowRoutes.js
const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// Endpoint untuk mendapatkan tugas user
router.get('/instances', authMiddleware, workflowController.getUserTasks);

// Endpoint untuk memverifikasi data user
router.get('/verification', authMiddleware, workflowController.getInstances);

// Endpoint untuk menginisiasi workflow baru (gunakan upload.single jika file dikirim)
router.post('/instances', authMiddleware, upload.single('file'), workflowController.initiateWorkflow);

// Endpoint untuk memproses langkah (approve/reject/stop) pada instance workflow dengan file upload
router.post('/instances/:id/step', authMiddleware, upload.single('file'), workflowController.updateWorkflowStep);

// Endpoint untuk memproses valid user
router.post('/tasks/:id/step', authMiddleware, workflowController.updateWorkflowStep);

// Endpoint untuk memproses valid user
router.put('/tasks/:id/step', authMiddleware, workflowController.updateWorkflowStep);

// Endpoint untuk mendapatkan template workflow yang dapat diinisiasi
router.get('/templates', authMiddleware, workflowController.getWorkflowTemplatesForInitiation);

// Endpoint untuk mengunduh file dari sebuah langkah workflow
router.get('/instance-steps/:stepId/file', workflowController.downloadFile);

// Endpoint untuk mendapatkan data step berdasarkan workflow_id dan step_order
router.get('/steps/:workflowId/:stepOrder', authMiddleware, workflowController.getWorkflowStep);

module.exports = router;
