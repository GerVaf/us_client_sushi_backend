const express = require("express");
const connectDB = require("./db/mongo");
const productRouter = require("./router/product");
const notFound = require("./middleware/not_found");
const errorHandler = require("./middleware/error_handler");

const app = express();
const port = process.env.PORT || 8989;

connectDB()
  .then(() => {
    app.use(express.json());

    // Register routers
    app.use("/api/v1/products", productRouter);

    // Error handling middlewares
    app.use(notFound);
    app.use(errorHandler);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
