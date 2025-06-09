const Product = require('../models/Product');

// Generate product_id like PROD-001, PROD-002
const generateProductId = async () => {
  const count = await Product.countDocuments();
  return `PROD-${String(count + 1).padStart(3, '0')}`;
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(404).json({ error: 'Invalid product ID' });
  }
};

// ✅ Create product
exports.createProduct = async (req, res) => {
  try {
    const product_id = await generateProductId();

    // Remove frontend-sent productId/product_id to avoid overwrite
    const { productId, product_id: _, ...rest } = req.body;

    const newProduct = new Product({
      ...rest,
      product_id,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(400).json({ error: 'Failed to create product', details: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update product', details: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete product' });
  }
};

// Update notes
exports.updateProductNotes = async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  try {
    const product = await Product.findByIdAndUpdate(id, { notes }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notes' });
  }
};
