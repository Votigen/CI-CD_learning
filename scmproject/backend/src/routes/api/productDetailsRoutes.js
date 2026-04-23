// routes/api/productDetailsRoutes.js
const express = require('express');
const router = express.Router();
const productDetailsController = require('../../controllers/productDetailsController');
const authMiddleware = require('../../midllewares/authMidlleware');
router.post('/product-details', productDetailsController.createProductDetail);
router.get('/product-details/:id', productDetailsController.getProductDetailById);
router.put('/product-details/:id', productDetailsController.updateProductDetail);
router.delete('/product-details/:id', productDetailsController.deleteProductDetail);

module.exports = router;