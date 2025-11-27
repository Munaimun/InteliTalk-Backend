# 🤖 InteliTalk - Intelligent AI-Powered Chatbot System

<div align="center">

![InteliTalk Banner](https://img.shields.io/badge/InteliTalk-AI%20Chatbot-blue?style=for-the-badge)

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker)](https://www.docker.com/)

**A production-ready, role-based AI chatbot system with RAG (Retrieval-Augmented Generation) capabilities, built with modern Node.js stack and LangChain integration.**

[Features](#-key-features) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Documentation](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [System Screenshots](#-system-screenshots)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Security Features](#-security-features)
- [Performance Optimization](#-performance-optimization)

---

## 🎯 Overview

**InteliTalk** is an enterprise-grade AI chatbot backend system that leverages cutting-edge technologies to deliver intelligent, context-aware conversational experiences. The system implements **RAG (Retrieval-Augmented Generation)** using vector databases, supports multiple user roles, and processes PDF documents for enhanced knowledge retrieval.

### **Perfect for showcasing:**
- ✅ Full-stack backend development expertise
- ✅ AI/ML integration (LangChain, OpenAI, HuggingFace)
- ✅ Microservices architecture with queue processing
- ✅ Production-ready authentication & authorization
- ✅ Vector database implementation (ChromaDB)
- ✅ RESTful API design with comprehensive documentation

---

## 🚀 Key Features

### 1. **Role-Based Access Control (RBAC)**
- **Three distinct user roles:**
  - 👨‍💼 **Admin**: Full system control, user management, document uploads
  - 👨‍🎓 **Student**: Access to authenticated chat features with enhanced knowledge base
  - 👤 **Guest**: Public access to basic chatbot functionality

### 2. **AI-Powered Conversational Intelligence**
- **RAG Implementation**: Context-aware responses using vector similarity search
- **LangChain Integration**: Advanced prompt engineering and chain management
- **Multiple LLM Support**: OpenAI and Groq API integration
- **Semantic Search**: HuggingFace Transformers for embeddings (`all-mpnet-base-v2`)

### 3. **Document Processing Pipeline**
- **PDF Upload & Processing**: Automatic document ingestion
- **Background Queue Processing**: BullMQ for asynchronous PDF processing
- **Text Chunking**: Recursive character splitting (1000 chars, 50 overlap)
- **Vector Storage**: Separate collections for public (guest) and private (student) data

### 4. **Enterprise-Grade Security**
- JWT-based authentication with HTTP-only cookies
- Bcrypt password hashing
- Helmet. js for security headers
- Rate limiting (5 requests per 15 minutes on login)
- CORS configuration
- Input validation with custom error handling

### 5. **Production-Ready Infrastructure**
- **Docker Support**: Complete containerization with Alpine Linux
- **Redis Integration**: Queue management and caching
- **MongoDB**: User management and chat history
- **ChromaDB Cloud**: Scalable vector database
- **Swagger Documentation**: Interactive API explorer

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Express.js API Server                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │    Admin     │  │   Student    │      │
│  │   Routes     │  │    Routes    │  │   Routes     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Guest      │  │ Middlewares  │  │  Controllers │      │
│  │   Routes     │  │  (Auth/RBAC) │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌───▼────────┐ ┌─▼──────────────┐
│   MongoDB    │ │   Redis    │ │  ChromaDB      │
│              │ │            │ │  (Vector DB)   │
│ - Users      │ │ - Queues   │ │                │
│ - Chats      │ │ - Cache    │ │ - guest_coll   │
│              │ │            │ │ - student_coll │
└──────────────┘ └────────────┘ └────────────────┘
                      │
              ┌───────▼────────┐
              │  BullMQ Worker │
              │                │
              │ - PDF Loading  │
              │ - Text Split   │
              │ - Embeddings   │
              │ - Vector Store │
              └────────────────┘
```

---

## 🛠 Tech Stack

### **Backend Framework**
- **Node.js 22.x** - Modern JavaScript runtime
- **Express.js 5.x** - Fast, minimalist web framework

### **AI/ML Technologies**
- **LangChain** - Framework for LLM applications
- **OpenAI API** - GPT models integration
- **Groq API** - Alternative LLM provider
- **HuggingFace Transformers** - Open-source embeddings

### **Databases**
- **MongoDB 8.x** - NoSQL database for user/chat data
- **ChromaDB** - Cloud vector database for embeddings
- **Redis (Upstash)** - In-memory data store for queues

### **Queue & Workers**
- **BullMQ** - Redis-based queue for background jobs

### **Security & Utilities**
- **JWT** - Stateless authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Express Rate Limit** - DDoS protection
- **Validator** - Input sanitization

### **Documentation**
- **Swagger/OpenAPI 3.0** - Interactive API documentation

### **DevOps**
- **Docker** - Containerization
- **Nodemon** - Development hot-reload

---

## 📸 System Screenshots

### **API Documentation (Swagger UI)**
```
┌─────────────────────────────────────────────────────────┐
│  Intelitalk ChatBot API - v1.0.0                        │
├─────────────────────────────────────────────────────────┤
│  Authentication                                          │
│    POST   /api/v1/login          User login             │
│    POST   /api/v1/logout         User logout            │
│    PATCH  /api/v1/password       Change password        │
│                                                          │
│  Admin Operations                                        │
│    GET    /admin                 Admin dashboard        │
│    POST   /admin/signup          Create student account │
│    GET    /admin/user            Get all users          │
│    DELETE /admin/user/:id        Delete user            │
│    POST   /admin/upload/public   Upload public PDF      │
│    POST   /admin/upload/private  Upload private PDF     │
│                                                          │
│  Student Features                                        │
│    GET    /student               Student chat           │
│    GET    /student/chat          Get chat history       │
│    GET    /student/profile       Get profile            │
│    PATCH  /student/profile       Update profile         │
│                                                          │
│  Guest Access                                            │
│    GET    /guest? question=...    Public chatbot         │
└─────────────────────────────────────────────────────────┘
```

### **RAG Flow Demonstration**
```
User Query: "What is machine learning?"
      │
      ▼
┌──────────────────────────────┐
│  1. Generate Embeddings      │
│     (HuggingFace Transformers)│
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│  2. Vector Similarity Search │
│     (ChromaDB - Top 4 docs)  │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│  3. Context Augmentation     │
│     (System Prompt + Context)│
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│  4. LLM Generation           │
│     (OpenAI/Groq)            │
└──────────────┬───────────────┘
               ▼
     AI-Generated Response
```

---

## 🔧 Installation

### **Prerequisites**
- Node.js 22.x or higher
- MongoDB instance
- Redis instance (Upstash recommended)
- ChromaDB Cloud account
- OpenAI/Groq API key

### **Quick Start**

```bash
# 1. Clone the repository
git clone https://github. com/dev-saiful/InteliTalk-server.git
cd InteliTalk-server

# 2. Install dependencies
npm install --force

# 3. Configure environment variables
cp exm.env . env
# Edit .env with your credentials

# 4. Create uploads directory
mkdir uploads

# 5. Start the server (development)
npm run dev

# 6. Start the worker (separate terminal)
npm run dev:worker
```

### **Docker Deployment**

```bash
# Build the Docker image
docker build -t intelitalk-server .

# Run the container
docker run -p 5001:5001 --env-file .env intelitalk-server
```

### **Production Start**
```bash
# Starts both server and worker
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=production
PORT=5001

# Database URLs
MONGODB_URL=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# AI/LLM APIs
OPENAI_API_KEY=sk-your-openai-key
GROQ_API_KEY=your-groq-key

# ChromaDB Configuration
CHROMA_API_KEY=your-chroma-api-key
CHROMA_DATABASE=your-database-name
CHROMA_TENANT=your-tenant-id

# Redis (Queue Management)
REDIS_URL=redis://your-upstash-redis-url

# Email Configuration (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 📚 API Documentation

### **Interactive Documentation**
Access Swagger UI at: `http://localhost:5001/api-docs`

### **Authentication Endpoints**

#### **Login**
```http
POST /api/v1/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": { ... }
}
```

#### **Logout**
```http
GET /api/v1/logout
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Logout successful"
}
```

### **Admin Endpoints**

#### **Create Student Account**
```http
POST /api/v1/admin/signup
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "student@example.com",
  "password": "securepass",
  "role": "student"
}
```

#### **Upload PDF (Public/Private)**
```http
POST /api/v1/admin/upload/public
Authorization: Bearer {admin-token}
Content-Type: multipart/form-data

{
  "pdf": [file]
}

Response: 200 OK
{
  "success": true,
  "message": "PDF uploaded and queued for processing"
}
```

### **Student Endpoints**

#### **Ask Question (Authenticated)**
```http
GET /api/v1/student? question=What is AI?
Authorization: Bearer {student-token}

Response: 200 OK
{
  "success": true,
  "question": "What is AI?",
  "answer": "Artificial Intelligence is.. .",
  "sources": [ ... ]
}
```

#### **Get Chat History**
```http
GET /api/v1/student/chat
Authorization: Bearer {student-token}

Response: 200 OK
{
  "success": true,
  "chats": [ ... ]
}
```

### **Guest Endpoints**

#### **Public Chat**
```http
GET /api/v1/guest?question=Tell me about machine learning

Response: 200 OK
{
  "success": true,
  "question": "Tell me about machine learning",
  "answer": "Machine learning is a subset of AI..."
}
```

---

## 📁 Project Structure

```
InteliTalk-server/
├── config/
│   ├── chromadb.config.js      # ChromaDB client configuration
│   ├── db.js                   # MongoDB connection
│   ├── llm.config.js           # OpenAI/Groq client setup
│   ├── rag.config.js           # System prompts & RAG settings
│   └── redis.config.js         # Redis singleton client
├── controllers/
│   ├── adminController.js      # Admin operations logic
│   ├── authController.js       # Authentication & user management
│   ├── guestController.js      # Public chatbot logic
│   ├── studentController.js    # Student chat & history
│   └── uploadController.js     # PDF upload & queue management
├── middlewares/
│   ├── asyncHandler.js         # Async error wrapper
│   ├── auth. js                 # JWT verification & RBAC
│   ├── customErrors.js         # Custom error classes
│   └── errorHandler.js         # Global error handling
├── models/
│   ├── chat.model.js           # Chat history schema
│   └── user.model.js           # User schema with hooks
├── routes/
│   ├── admin.routes.js         # Admin API routes
│   ├── auth.routes.js          # Authentication routes
│   ├── guest.routes.js         # Guest routes
│   └── student.routes.js       # Student routes
├── docs/
│   └── swagger.js              # Swagger/OpenAPI configuration
├── uploads/                    # PDF upload directory
├── .dockerignore
├── Dockerfile                  # Docker configuration
├── server.js                   # Main application entry
├── worker.js                   # BullMQ worker for PDF processing
├── cron.js                     # Scheduled tasks (optional)
├── package.json
└── exm.env                     # Environment template
```

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| **Authentication** | JWT with HTTP-only cookies |
| **Password Security** | Bcrypt with salt rounds |
| **Rate Limiting** | 5 requests/15min on login endpoint |
| **CORS Protection** | Configured whitelist origins |
| **Security Headers** | Helmet.js middleware |
| **Input Validation** | Validator. js & custom checks |
| **Error Handling** | Custom error classes with safe messages |
| **RBAC** | Middleware-based role verification |

---

## ⚡ Performance Optimization

### **Caching Strategy**
- Redis for queue management and future caching layer
- Vector database for fast similarity search (sub-second retrieval)

### **Background Processing**
- Asynchronous PDF processing with BullMQ
- Non-blocking document ingestion pipeline

### **Database Optimization**
- MongoDB connection pooling
- Singleton pattern for Redis client
- Vector indexing in ChromaDB

### **Scalability**
- Stateless authentication (JWT)
- Docker containerization for horizontal scaling
- Queue-based architecture for distributed workers

---

## 🎓 Key Technical Highlights for Recruiters

### **1. Advanced AI Integration**
- Implemented RAG (Retrieval-Augmented Generation) from scratch
- Integrated multiple LLM providers (OpenAI, Groq)
- Used HuggingFace Transformers for local embeddings
- Built custom prompt engineering pipeline

### **2.  Microservices Architecture**
- Separation of concerns (API server + Worker process)
- Queue-based communication (BullMQ)
- Event-driven document processing

### **3. Production-Ready Code**
- Comprehensive error handling
- Environment-based configuration
- Security best practices
- API documentation (Swagger)
- Docker deployment ready

### **4. Database Expertise**
- NoSQL (MongoDB) for structured data
- Vector database (ChromaDB) for embeddings
- In-memory store (Redis) for queues
- Multi-database architecture

### **5. Modern JavaScript**
- ES6+ modules
- Async/await patterns
- Middleware architecture
- Clean code principles

---

## 📊 System Capabilities

| Metric | Value |
|--------|-------|
| **Concurrent Users** | Scalable with horizontal deployment |
| **Document Processing** | Asynchronous, non-blocking |
| **Response Time** | < 2s for RAG queries (avg) |
| **Vector Search** | Top-K retrieval (K=4) |
| **Embedding Dimension** | 768 (all-mpnet-base-v2) |
| **Chunk Size** | 1000 characters |
| **Supported Formats** | PDF |
| **API Endpoints** | 15+ RESTful routes |

---

## 🚦 Getting Started Guide

### **Step 1: Test Guest Access**
```bash
curl "http://localhost:5001/api/v1/guest?question=Hello"
```

### **Step 2: Admin Login**
- Seed admin account in MongoDB
- Login via `/api/v1/login`

### **Step 3: Create Student**
```bash
curl -X POST http://localhost:5001/api/v1/admin/signup \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Student","email":"student@test.com","password":"pass","role":"student"}'
```

### **Step 4: Upload Knowledge Base**
```bash
curl -X POST http://localhost:5001/api/v1/admin/upload/public \
  -H "Authorization: Bearer {admin-token}" \
  -F "pdf=@document.pdf"
```

### **Step 5: Test RAG Chat**
```bash
curl "http://localhost:5001/api/v1/student? question=Your question" \
  -H "Authorization: Bearer {student-token}"
```

---

## 📞 Contact & Links

- **Developer**: Saiful Islam
- **GitHub**: [@dev-saiful](https://github.com/dev-saiful)
- **Repository**: [InteliTalk-server](https://github.com/dev-saiful/InteliTalk-server)

---

## 📝 License

ISC License - See LICENSE file for details

---

<div align="center">

**Built with ❤️ using Node.js, LangChain, and cutting-edge AI technologies**

⭐ Star this repo if you find it useful! ⭐

</div>