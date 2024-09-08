const express = require("express");
const connectDB = require("./db/mongo");
const productRouter = require("./router/product");
const packageRouter = require("./router/package");
const userRouter = require("./router/user");
const authRouter = require("./router/authorize");
const dashboardRouter = require("./router/dashboard");
const orderRouter = require("./router/order");
const notFound = require("./middleware/not_found");
const errorHandler = require("./middleware/error_handler");
const cors = require("cors"); // Import the cors package

const app = express();
const port = 8989;

// Connect to the database
connectDB()
  .then(() => {
    app.use(express.json());

    // Enable CORS for specific origins
    const allowedOrigins = [
      "https://alex-product-hex.vercel.app",
      "https://us-client-sushi-frontend.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
    ];

    app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
      })
    );

    // Register routers
    app.use("/api/v1/products", productRouter);
    app.use("/api/v1/packages", packageRouter);
    app.use("/api/v1/dashboard", dashboardRouter);
    app.use("/api/v1/orders", orderRouter);
    app.use("/api/v1/users", userRouter);
    app.use("/api/v1/auth", authRouter);

    // Error handling middlewares
    app.use(notFound);
    app.use(errorHandler);

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit the process if the database connection fails
  });
