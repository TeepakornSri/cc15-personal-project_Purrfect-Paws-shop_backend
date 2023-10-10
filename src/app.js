require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const errorMiddleware = require("./middlewares/error");
const notFoundMiddleware = require("./middlewares/not-found");
const rateLimitMiddlewares = require("./middlewares/rate-limit");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(rateLimitMiddlewares);
app.use(express.json());

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || "5000";

app.listen(PORT, () => console.log(`Server on Port:${PORT}`));
