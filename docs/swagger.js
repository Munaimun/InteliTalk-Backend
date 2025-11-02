import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Intelitalk ChatBot API",
      version: "1.0.0",
      description: "REST API documentation for the Intelitalk ChatBot System",
    },
    servers: [
      {
        url: "http://localhost:5001/api/v1",
        description: "Local Server",
      },
    ],
  },
  apis: ["./routes/*.js"], // Points to where API routes are documented
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
