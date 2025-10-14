# Express Learning Project

A well-structured Node.js Express.js application demonstrating best practices for API development with proper folder organization, middleware, error handling, and testing.

## 🚀 Features

- **MVC Architecture**: Well-organized Model-View-Controller structure
- **RESTful API**: Complete CRUD operations for network information management
- **Error Handling**: Comprehensive error handling with logging
- **Validation**: Input validation using express-validator
- **Logging**: Request logging and error logging to files
- **Testing**: Unit tests with Jest and Supertest
- **Security**: CORS and basic security middleware
- **Documentation**: API documentation and examples

## 📁 Project Structure

```
├── src/
│   ├── controllers/     # Request handlers and business logic
│   ├── routes/         # Route definitions and middleware
│   ├── services/       # Business logic and data manipulation
│   ├── middleware/     # Custom middleware functions
│   ├── models/         # Data models and validation
│   ├── utils/          # Utility functions and helpers
│   ├── config/         # Configuration files
│   └── app.js          # Express application setup
├── public/             # Static files (CSS, JS, images)
├── tests/              # Test files
├── logs/               # Application logs
├── server.js           # Server entry point
└── package.json        # Project dependencies and scripts
```

## 🛠️ Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

## 🚦 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Lint Code

```bash
npm run lint
```

## � API Documentation

This project includes comprehensive **Swagger/OpenAPI 3.0** documentation for all endpoints:

### 🌐 Interactive Documentation

- **Swagger UI**: Visit `http://localhost:3000/api-docs` for interactive API documentation
- **Try It Out**: Test all endpoints directly from the browser
- **Schema Definitions**: Complete request/response schemas with examples

### �📋 API Endpoints

#### Health Endpoints

- `GET /health` - Basic health check
- `GET /health/system` - Detailed system information

#### Network Information Management

- `GET /api/network-info` - Get all network information records
- `GET /api/network-info/:id` - Get network information by ID
- `POST /api/network-info` - Create new network information record
- `PUT /api/network-info/:id` - Update network information
- `DELETE /api/network-info/:id` - Delete network information

### Example Requests

**Create new network information:**

```bash
curl -X POST http://localhost:3000/api/network-info \
  -H "Content-Type: application/json" \
  -d '{"deviceInfo": {"deviceId": "device123", "deviceType": "smartphone"}}'
```

**Get all network information:**

```bash
curl http://localhost:3000/api/network-info
```

## 🧪 Testing

The project includes comprehensive tests for all endpoints:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring

- **Logs**: Application logs are stored in the `logs/` directory
- **Health Check**: Visit `http://localhost:3000/health` for server status
- **Web Interface**: Visit `http://localhost:3000` for a web-based API tester

## 🔧 Configuration

Configuration is handled through environment variables. Copy `.env.example` to `.env` and customize:

```env
NODE_ENV=development
PORT=3000
# Add other configuration as needed
```

## 📚 Learning Objectives

This project demonstrates:

1. **Project Structure**: How to organize a Node.js/Express application
2. **MVC Pattern**: Separation of concerns with controllers, services, and models
3. **Middleware**: Custom middleware for logging, error handling, and validation
4. **Error Handling**: Centralized error handling and logging
5. **Testing**: Unit testing with Jest and API testing with Supertest
6. **Security**: Basic security practices with CORS and validation
7. **Documentation**: API documentation and code comments

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run tests to ensure everything works
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙋‍♂️ Support

If you have any questions or need help with this project, please open an issue or contact the author.

---

**Happy Learning! 🎉**
