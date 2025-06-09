const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// All products
router.get('/product', productController.getAllProducts);

// Get one
router.get('/product/:id', productController.getProductById);

// Create
router.post('/product', productController.createProduct);

// Update
router.put('/product/:id', productController.updateProduct);

// Delete
router.delete('/product/:id', productController.deleteProduct);

// Update notes
router.put('/product/:id/notes', productController.updateProductNotes);

module.exports = router;
