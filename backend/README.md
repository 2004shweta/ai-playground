# Authentication Setup

This backend supports email/password authentication only.

To set up the backend, add the following to your backend/.env file:

```
JWT_SECRET=your-jwt-secret-key
MONGO_URI=your-mongodb-connection-string
REDIS_URL=your-redis-connection-url
```

Replace the values with your actual credentials. 