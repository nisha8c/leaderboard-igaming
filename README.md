# Leaderboard iGaming

# 🕹️ iGaming Leaderboard App

A full-stack leaderboard application for managing and viewing game player scores. Built with React, Redux, Node.js, Express, MongoDB, and AWS Lambda.

---

## 🚀 Live Demo
🌐 **Frontend Live URL:** https://d2lcr47a2gxn8u.cloudfront.net

## Monorepo Structure
- client/: React + Vite + TypeScript + ESLint + Prettier
- server/: Express + TypeScript + Nodemon + ESLint + Prettier

## 🛠️ Tech Stack

### Frontend
- **React + TypeScript**
- **Redux Toolkit** for state management
- **react-oidc-context** for Cognito authentication
- **React-Bootstrap** for UI
- **Vite** for fast builds

### Backend
- **Node.js + Express**
- **MongoDB** (via Mongoose)
- **JWT Auth** (AWS Cognito + `jwks-rsa`)
- **Serverless Framework** (deployed on AWS Lambda)

### Deployment
- **Backend:** AWS Lambda (Serverless Framework)
- **Frontend:** S3 + CloudFront (SPA hosting)
- **Logs:** AWS CloudWatch

----

## 💡 Features

### ✅ Public Leaderboard
- View top 10 players (sorted by score)
- Display name, score, and last updated time

### ✅ Admin Dashboard (Auth Protected) : Using Leaderboard same component and rendering extra parts based on if user is admin or normal user.
- Add new players
- Edit/update scores
- Delete players
- Basic form validation
- Admin can add user - that gets saved in Cognito users as well as in Mongo DB. Admin can choose to assign the user to admin group at the time of creation.

## 🔐 Authentication

- Uses **AWS Cognito** for secure login
- Admin roles identified via Cognito groups
- API access protected via JWT verification


---
## 📦 API Endpoints

| Method | Endpoint                        | Description                |
|--------|----------------------------------|----------------------------|
| GET    | `/api/leaderboard`              | Public leaderboard         |
| POST   | `/api/admin/add-player`         | Add new player (admin)     |
| PUT    | `/api/admin/update-score/:id`   | Update score (admin)       |
| DELETE | `/api/admin/delete-player/:id`  | Delete player (admin)      |

---

## 🧪 Testing (Optional)

> Backend tests added and work properly
> Frontend tests are commented.

---

## 🔧 Setup Instructions

### Prerequisites

- Node.js v20+
- MongoDB Atlas or local instance
- MongoDB Atlas or local instance
- AWS account (for Cognito and Lambda)

---
### Local Development

1. **Clone repo**
2. Set environment variables. Currently, all the variables are set in Github - Actions - Secrets
3. Start Development
4. Frontend: cd frontend && npm install && npm run dev 
5. Backend: cd backend && npm install && npm run dev
6. Deploy : Backend : serverless deploy
7. Frontend:  Upload to S3 and connect to CloudFront
8. For backend .env file you can add:
   MONGODB_URI=Your Mpngo DB URI
   USER_POOL_ID=eu-north-1_H2BNDOr7R
   USER_POOL_DOMAIN=https://eu-north-1h2bndor7r.auth.eu-north-1.amazoncognito.com
   VITE_API_URL=http://localhost:3000/dev

---
### Known limitations
1. No email / password auth - (relies solely on Cognito login)
2. Search, Filter, Sort, Pagination is not present when admin sees all the players.


