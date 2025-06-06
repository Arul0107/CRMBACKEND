const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// All products
router.get('/', productController.getAllProducts);

// Get one
router.get('/:id', productController.getProductById);

// Create
router.post('/', productController.createProduct);

// Update
router.put('/:id', productController.updateProduct);

// Delete
router.delete('/:id', productController.deleteProduct);

// Update notes
router.put('/:id/notes', productController.updateProductNotes);

module.exports = router;
