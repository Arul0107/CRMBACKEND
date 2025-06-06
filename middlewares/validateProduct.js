const Joi = require('joi');

const productSchema = Joi.object({
  productName: Joi.string().required().min(3).max(100),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).required(),
  hsnSac: Joi.string().allow('').max(20),
  description: Joi.array().items(
    Joi.object({
      type: Joi.string().required().max(50),
      specification: Joi.string().required().max(500)
    })
  ),
  status: Joi.string().valid('Active', 'Inactive').default('Active')
});

exports.validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation Error',
      details: error.details.map(d => d.message) 
    });
  }
  next();
};