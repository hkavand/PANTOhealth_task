# X-Ray Project

The **X-Ray Project** consists of two main components:
1. **X-Ray Producer**: A NestJS application that simulates IoT devices sending x-ray data to RabbitMQ.
2. **X-Ray Consumer**: A NestJS application that processes the x-ray data received from RabbitMQ.

---

## Features

- **Producer**:
  - Sends sample x-ray data to RabbitMQ.
  - Configurable RabbitMQ exchange and routing key.
  - API documentation available via Swagger.

- **Consumer**:
  - Receives and processes x-ray data from RabbitMQ.
  - Saves processed data to a database.
  - API documentation available via Swagger.

---

## Prerequisites

Before running the applications, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [RabbitMQ](https://www.rabbitmq.com/) (running locally or accessible remotely)

---

## Project Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/hkavand/PANTOhealth_task.git
   cd xray-project
   ```
2. Install dependencies for both producer and consumer:
   ```bash
   npm install
   ```

## Compile and Run the Project

### **Producer**
1. Navigate to the producer directory:
   ```bash
   cd xray-producer
   ```

2. Start the producer application
   ```bash
   npm run start
   ```

3. Access the swagger API documentation: open your browser and navigate to http://localhost:3000/api.

4. Trigger the producer to send sample x-ray data:
  - Use a tool like Postman or your browser to send a GET request to: http://localhost:3000/send-xray

### **Consumer**
1. Navigate to the consumer directory:
   ```bash
   cd ..
   ```

2. Start the consumer application
   ```bash
   npm run start
   ```

3. Access the swagger API documentation: open your browser and navigate to http://localhost:3001/api.

## Run Tests

### For Both Producer and Consumer
- **Unit Tests**:
  ```bash
  npm run test
  ```

- **End-to-End Tests**:
   ```bash
   npm run test:e2e
   ```

## Example Payload

The producer sends x-ray data in the following format:

```json
{
  "66bb584d4ae73e488c30a072": [
    [48311, [51.4, 12.339, 1.966688012067945]],
    [46543, [51.4, 12.339, 1.047448569751259]],
    [32931, [51.4, 12.339, 2.055955814906081]]
  ],
  "time": 1735683480000
}
```

