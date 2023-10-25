const error = require("../middlewares/error");
const prisma = require("../models/prisma");
const { upload } = require("../utils/cloudinary-service");
const fs = require("fs/promises");
const {
  checkProductId,
  updateProductSchema,
} = require("../validators/product-validate");

exports.CreateProduct = async (req, res, next) => {
  try {
    let product = req.body;

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

exports.getAllCategory = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        productCategory: true,
        createAt: true,
        updateAt: true,
      },
    });
    res.status(200).json({ categories });
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
        createAt: true,
        updateAt: true,
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
        userId: req.user.id,
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

    const createOrder = await prisma.order.create({
      data: {
        userId: userId,
        orderstatus: "INCART",
      },
    });

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
      })
    );

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
          orderstatus: "PENDING",
        },
        where: {
          id: latestOrder.id,
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

exports.updateproduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let product = req.body;
    console.log(product);
    if (req.file) {
      product.productImg = await upload(req.file.path);
    }
    product.categoryId = +product.categoryId;

    const updateProduct = await prisma.product.update({
      data: product,
      where: {
        id: +productId,
      },
    });

    res.status(201).json({ updateProduct });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await prisma.product.findUnique({
      where: {
        id: +productId,
      },
    });

    if (product) {
      await prisma.cart.deleteMany({
        where: {
          productId: +productId,
        },
      });
      await prisma.orderItem.deleteMany({
        where: {
          productId: +productId,
        },
      });
      await prisma.product.delete({
        where: {
          id: +productId,
        },
      });

      res.status(200).json({ message: "Deleted Product" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await prisma.category.findUnique({
      where: {
        id: +categoryId,
      },
    });

    if (category) {
      await prisma.product.deleteMany({
        where: {
          categoryId: +categoryId,
        },
      });
      await prisma.category.delete({
        where: {
          id: +categoryId,
        },
      });
      res.status(200).json({ message: "Deleted Product" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    next(err);
  }
};

exports.GetAllOrder = async (req, res, next) => {
  try {
    const Orders = await prisma.order.findMany({
      select: {
        id: true,
        createAt: true,
        updateAt: true,
        paymentsubmission: true,
        orderstatus: true,
        userId: true,
      },
      orderBy: {
        orderstatus: "desc",
      },
    });
    res.status(200).json({ Orders });
  } catch (err) {
    next(err);
  }
};

exports.GetOrder = async (req, res, next) => {
  try {
    const MyOrder = await prisma.order.findMany({
      select: {
        id: true,
        createAt: true,
        updateAt: false,
        paymentsubmission: false,
        orderstatus: true,
        userId: true,
      },
      where: {
        userId: req.user.id,
      },
    });
    res.status(200).json({ MyOrder });
  } catch (err) {
    next(err);
  }
};

exports.approveOrder = async (req, res, next) => {
  try {
    const { OrderId } = req.params;
    const order = await prisma.order.findUnique({
      where: {
        id: +OrderId,
      },
    });

    if (order) {
      await prisma.order.update({
        where: {
          id: +OrderId,
        },
        data: {
          orderstatus: "ACCEPTED",
        },
      });
      res.status(200).json({ message: "Updated Order :)" });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (err) {
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const { OrderId } = req.params;
    const order = await prisma.order.findUnique({
      where: {
        id: +OrderId,
      },
    });
    if (order) {
      await prisma.orderItem.deleteMany({
        where: {
          orderId: +OrderId,
        },
      });
      await prisma.order.delete({
        where: {
          id: +OrderId,
        },
      });
      res.status(200).json({ message: "Cancel Order" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllOrderItem = async (req, res, next) => {
  try {
    const orderitems = await prisma.orderItem.findMany({
      select: {
        id: true,
        createAt: true,
        updateAt: true,
        amount: true,
        price: true,
        orderId: true,
        productId: true,
      },
    });
    res.status(200).json({ orderitems });
  } catch (err) {
    next(err);
  }
};
