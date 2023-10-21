const error = require("../middlewares/error");
const prisma = require("../models/prisma");
const { upload } = require("../utils/cloudinary-service");
const fs = require("fs/promises");
const { checkProductId } = require("../validators/product-validate");

exports.CreateProduct = async (req, res, next) => {
  try {
    if (!req.file) {
      console.log(error);
    }
    product = req.body;
    if (req.file) {
      product.productImg = await upload(req.file.path);
    }
    product.categoryId = +product.categoryId;
    const Productcreated = await prisma.product.create({
      data: product,
    });
    res.status(200).json({ Productcreated });
  } catch (err) {
    next(err);
  } finally {
    if (req.file) {
      fs.unlink(req.file.path);
    }
  }
};

exports.createCategory = async (req, res, next) => {
  const data = req.body;
  try {
    const createCategory = await prisma.category.create({
      data: data,
    });
    res.status(200).json({ createCategory });
  } catch (err) {
    next(err);
  }
};

exports.GetAllProduct = async (req, res, next) => {
  try {
    const prodcutIds = await prisma.product.findMany({
      select: {
        id: true,
        productdescription: true,
        createAt: false,
        updateAt: false,
        productName: true,
        productImg: true,
        price: true,
        categoryId: true,
      },
    });
    res.status(200).json({ prodcutIds });
  } catch (err) {
    next(err);
  }
};

exports.CreateCart = async (req, res, next) => {
  const cart = req.body;

  try {
    const { value, error } = checkProductId.validate(req.params);
    if (error) {
      return next(error);
    }
    const addproduct = await prisma.cart.create({
      data: {
        userId: req.user.id,
        productId: value.productId,
        amount: +cart.amount,
      },
    });

    res.status(200).json({ addproduct });
  } catch (err) {
    next(err);
  }
};

exports.ShowProductInCart = async (req, res, next) => {
  try {
    const showcart = await prisma.cart.findMany({
      where: { userId: req.user.id },
      orderBy: {
        createAt: "desc",
      },
      include: { product: true },
    });
    const total = showcart.reduce((acc, cartItem) => {
      const productTotal = cartItem.amount * cartItem.product.price;

      return acc + productTotal;
    }, 0);

    res.status(200).json({ showcart, total });
  } catch (err) {
    next(err);
  }
};

exports.AddToCart = async (req, res, next) => {
  const cart = req.body;
  const { value, error } = checkProductId.validate(req.params);
  try {
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        productId: value.productId,
      },
    });
    if (existingCartItem) {
      await prisma.cart.update({
        where: {
          userId: req.user.id,
          id: existingCartItem.id,
        },
        data: {
          amount: existingCartItem.amount + +cart.amount,
        },
      });
    } else {
      await prisma.cart.create({
        data: {
          userId: req.user.id,
          productId: value.productId,
          amount: +cart.amount,
        },
      });
    }

    res.status(200).json({ message: "Product Add To Cart" });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { value } = checkProductId.validate(req.params);

    const product = await prisma.product.findUnique({
      where: { id: value.productId },
    });
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
};

exports.updateAmountInCart = async (req, res, next) => {
  try {
    const { productId, newAmount, Id } = req.body;
    const updateAmount = await prisma.cart.update({
      data: {
        amount: newAmount,
      },
      where: {
        userId: req.user.id,
        productId: productId,
        id: Id,
      },
    });
    res.status(200).json({ updateAmount });
  } catch (err) {
    next(err);
  }
};

exports.deleteProductInCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cartProduct = await prisma.cart.findUnique({
      where: {
        id: +productId,
      },
    });

    if (cartProduct) {
      await prisma.cart.delete({
        where: {
          id: +cartProduct.id,
        },
      });
    }
    res.status(200).json({ message: "Deleted Product In Cart" });
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { allCartProduct } = req.body;
    const userId = req.user.id;

    // Create an Order
    const createOrder = await prisma.order.create({
      data: {
        userId: userId,
        orderstatus: "INCART",
      },
    });

    // Create OrderItems for each product in the cart using map
    const orderItems = await Promise.all(
      allCartProduct.map(async (cartProduct) => {
        const { productId, amount } = cartProduct;
        const price = cartProduct.product.price;

        const orderItem = await prisma.orderItem.create({
          data: {
            productId: productId,
            amount: amount,
            price: price,
            orderId: createOrder.id,
          },
        });

        return orderItem;
      })
    );

    // Now, you have created Order and OrderItems for each product in the cart

    // Delete the cart or perform any other necessary actions

    // Respond with the created Order and OrderItems
    res.status(200).json({ createOrder, orderItems });
  } catch (err) {
    next(err);
  }
};
exports.uploadPayment = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(error);
    }
    const response = {};
    const url = await upload(req.file.path);
    response.paymentsubmission = url;

    const latestOrder = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
      },
      orderBy: [
        {
          createAt: "desc",
        },
      ],
    });

    if (latestOrder) {
      await prisma.order.update({
        data: {
          paymentsubmission: url,
          orderstatus: "PENDING", // หรือสถานะที่คุณต้องการ
        },
        where: {
          id: latestOrder.id, // ใช้ ID ของคำสั่งซื้อที่คุณดึงมา
        },
      });

      await prisma.cart.deleteMany({
        where: {
          userId: req.user.id,
        },
      });

      res.status(200).json(response);
    } else {
      res.status(404).json({ message: "No recent orders found" });
    }
  } catch (err) {
    next(err);
  }
};
