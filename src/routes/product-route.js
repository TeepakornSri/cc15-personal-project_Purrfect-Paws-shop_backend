const express = require("express");

const productController = require("../controllers/Product-controller");
const authenticateMiddleware = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");

const router = express.Router();

router.post(
  "/",
  authenticateMiddleware,
  uploadMiddleware.single("productImg"),
  productController.CreateProduct
);

router.post(
  "/createcategory",
  authenticateMiddleware,
  productController.createCategory
);
router.get(
  "/allcategory",
  authenticateMiddleware,
  productController.getAllCategory
);

router.delete(
  "/deletecategory/:categoryId",
  authenticateMiddleware,
  productController.deleteCategory
);

router.get("/showallproduct", productController.GetAllProduct);

router.post(
  "/addtcart/:productId",
  authenticateMiddleware,
  productController.CreateCart
);

router.get(
  "/productincart",
  authenticateMiddleware,
  productController.ShowProductInCart
);
router.get("/allorders", authenticateMiddleware, productController.GetAllOrder);
router.get("/myorder", authenticateMiddleware, productController.GetOrder);

router.post(
  "/addToCart/:productId",
  authenticateMiddleware,
  productController.AddToCart
);

router.get(
  "/getAllOrderItem",
  authenticateMiddleware,
  productController.getAllOrderItem
);

router.get("/:productId", productController.getProductById);

router.patch(
  "/updateAmountInCart",
  authenticateMiddleware,
  productController.updateAmountInCart
);

router.delete(
  "/deleteProductInCart/:productId",
  authenticateMiddleware,
  productController.deleteProductInCart
);

router.post(
  "/createorder",
  authenticateMiddleware,
  productController.createOrder
);

router.patch(
  "/uploadImg",
  authenticateMiddleware,
  uploadMiddleware.single("paymentsubmission"),
  productController.uploadPayment
);

router.patch(
  "/updateproduct/:productId",
  authenticateMiddleware,
  uploadMiddleware.single("productImg"),
  productController.updateproduct
);

router.delete(
  "/delete/:productId",
  authenticateMiddleware,
  productController.deleteProduct
);
router.patch(
  "/updateorder/:OrderId",
  authenticateMiddleware,
  productController.approveOrder
);

router.delete(
  "/cancelorder/:OrderId",
  authenticateMiddleware,
  productController.cancelOrder
);

module.exports = router;
