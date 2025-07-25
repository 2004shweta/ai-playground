# AI Playground

Welcome to **AI Playground** – a modern, full-stack monorepo for experimenting with AI-powered applications. This project combines a robust Node.js/Express backend with a Next.js frontend, providing a seamless environment for building, testing, and deploying AI features.

---

## 🚀 Features
- User authentication and session management
- AI-powered endpoints (extendable)
- Modern, responsive frontend UI
- Modular, scalable codebase
- Easy local development and deployment

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express, MongoDB (via Mongoose)
- **Frontend:** Next.js, React, TypeScript
- **Authentication:** JWT, Sessions
- **Styling:** CSS Modules

---

## 📁 Folder Structure
```
ai-playground/
├── backend/      # Express API, models, routes, middleware
├── frontend/     # Next.js app, components, pages, utils
├── package.json  # Monorepo root config
└── README.md     # Project documentation
```

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) (v8+ recommended)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)

### 1. Clone the Repository
```sh
git clone https://github.com/your-username/ai-playground.git
cd ai-playground
```

### 2. Backend Setup
```sh
cd backend
npm install
# Configure your environment variables in a .env file (see .env.example)
npm start
```
- Runs on [http://localhost:3001](http://localhost:3001)

### 3. Frontend Setup
```sh
cd frontend
npm install
npm run dev
```
- Runs on [http://localhost:3000](http://localhost:3000)

---

## 🧩 Usage
- Access the frontend at [http://localhost:3000](http://localhost:3000)
- API endpoints are available at [http://localhost:3001/api](http://localhost:3001/api)
- Customize and extend AI endpoints in `backend/routes/ai.js`

---

## 🤝 Contributing
Contributions are welcome! To get started:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements
- [OpenAI](https://openai.com/)
- [Next.js](https://nextjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
