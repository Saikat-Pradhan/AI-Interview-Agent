# 🎯 AI Interview Agent — Smart Interview Simulation Platform

![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)
![Express](https://img.shields.io/badge/Framework-Express-black?logo=express)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen?logo=mongodb)
![Firebase](https://img.shields.io/badge/Auth-Firebase-orange?logo=firebase)
![JWT](https://img.shields.io/badge/Auth-JWT-purple)
![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-teal?logo=tailwindcss)
![OpenAI](https://img.shields.io/badge/AI-OpenRouter-lightblue?logo=openai)
![Razorpay](https://img.shields.io/badge/Payments-Razorpay-darkblue?logo=razorpay)

AI Interview Agent is a **MERN + AI powered web application** that simulates real interview experiences. It analyzes resumes, projects, and skills, generates tailored questions, evaluates answers, and provides detailed reports.

---

## 🌐 Live Deme

🔗 InterviewIQ.AI Application: https://ai-interview-agent-by-saikat-pradhan.onrender.com

---

## 📥 Download App

### To install the mobile version:
- Navigate to the *Install App* folder in the repository
- Download the APK file
- Install it on your Android device to access the app directly
### Or simply click below:
👉 [Download APK](https://bucket.appilix.com/app-apk-74ce89ddabf9457eac91bae6a973761c-1781852195.apk)

---

## 🚀 Features

### 👤 User System
- Google login via Firebase
- Secure JWT authentication
- Credit system (100 free credits on signup, 50 credits per interview)

### 📄 Resume & Input
- Upload resume for AI analysis
- Or manually enter role, experience, and interview mode (Technical/HR)

### 🎯 Interview Flow
- AI generates questions based on role, skills, and projects
- User answers within a time limit
- AI evaluates answers on:
  - Marks
  - Confidence
  - Communication
  - Correctness
  - Feedback

### 📊 Reports
- View interview performance
- Download PDF report

### 💳 Payments
- Razorpay integration
- Buy credits and plans with different services

---

## 🧱 Tech Stack

### Frontend

- React.js
- TailwindCSS

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication

### AI & APIs

- OpenRouter (OpenAI API)
- Firebase Authentication

### Payments

- Razorpay

---

## 🏗️ Architecture

```
React (Frontend)
        ↓
Node.js + Express (Backend)
        ↓
MongoDB (Database)
        ↓
Firebase (Auth) + JWT
        ↓
OpenRouter (AI Question Generation)
        ↓
Razorpay (Payments)
```
---

## 📂 Project Structure

```
ai-interview-agent/
│
├── client/        # Vite + React + TailwindCSS
│
└── server/         # Node + Express + MongoDB
    ├── routes/
    ├── controllers/
    └── models/
```
---

## ⚙️ Installation & Setup

1️⃣ Clone Repository
```
git clone https://github.com/Saikat-Pradhan/AI-Interview-Agent.git
cd AI-Interview-Agent
```
---

2️⃣ Backend Setup

```
cd server
npm install
npm run dev
```

Configure .env with:

```
PORT
MONGO_URI
JWT_SECRET
OPENROUTER_API_KEY
RAZORPAY_ID_KEY
RAZORPAY_SECRET_KEY
```
---

3️⃣ Frontend Setup

```
cd client
npm install
npm run dev
```

Configure .env with:

```
VITE_FIREBASE_API_KEY
VITE_SERVER_URL
VITE_RAZORPAY_ID_KEY
```
---

## 📈 Future Improvements

- More interview modes (Group, Behavioral, Case Study)
- Multi‑round interview simulation (HR → Technical → Managerial)
- Gamification & leaderboards to boost engagement

---

## ⚠️ Disclaimer

This project is for educational and practice purposes only.
It does not replace real interview experiences or professional evaluation.

---

⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
