// backend/routes/quotationRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/quotationController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.get('/leads/active', controller.getActiveBusinesses);
router.get('/business/:id', controller.getQuotationsByBusinessId); // ✅ this must be ABOVE `/:id`

module.exports = router;
