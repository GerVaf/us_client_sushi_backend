const express = require("express");
const connectDB = require("./db/mongo");
const productRouter = require("./router/product");
const packageRouter = require("./router/package");
const notFound = require("./middleware/not_found");
const errorHandler = require("./middleware/error_handler");
const cors = require("cors"); // Import the cors package

const app = express();
const port = 8989 || process.env.PORT;

connectDB()
  .then(() => {
    app.use(express.json());

    // Enable CORS for localhost:3000
    app.use(
      cors({
        origin: "http://localhost:3000",
      })
    );

    // Register routers
    app.use("/api/v1/products", productRouter);
    app.use("/api/v1/packages", packageRouter);

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
