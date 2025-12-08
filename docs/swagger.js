import swaggerJsdoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config();

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Intelitalk ChatBot API",
      version: "2.0.0",
      description: "REST API documentation for the Intelitalk ChatBot System",
    },
    servers: [
      {
        url: process.env.NODE_ENV === "production"
          ? `${process.env.URL}/api/v1`
          : `http://localhost:${process.env.PORT || 5001}/api/v1`,
        description: "Local Server",
      },
    ],
  },
  apis: ["./routes/*.js"], // Points to where API routes are documented
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
