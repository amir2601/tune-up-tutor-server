<div align="center">
  <h1>Tune-Up Tutor (Server)</h1>
  <p>
    Express + MongoDB REST API powering the Tune-Up Tutor music academy. Handles auth-driven user management, role-based access, class catalog, student selections, and Stripe payments.
  </p>

  <p>
    <a href="https://tune-up-tutor-server.vercel.app/"><img src="https://img.shields.io/badge/Live%20API-07C160?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live API" /></a>
    <a href="https://github.com/amir2601/tune-up-tutor-server"><img src="https://img.shields.io/badge/Repo-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" /></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-5-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Stripe-12-635BFF?logo=stripe&logoColor=white" alt="Stripe" />
    <img src="https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white" alt="Vercel" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" />
  </p>
</div>

## ✨ Features

| Feature | Details |
|---|---|
| **🔐 REST API** | Express server with CORS & JSON middleware for the client app. |
| **🗄️ MongoDB Data Layer** | `users`, `classes`, `selectedClasses`, `enrolledClass` & `paymentInfo` collections with MongoDB Driver 5. |
| **🎭 Role-Based Logic** | Supports `student`, `instructor`, and `admin` roles with relevant endpoints for each. |
| **💳 Stripe Integration** | Creates payment intents (`/create-payment-intent`) and finalizes bookings (`/booking-data`) to enroll students & update seats. |
| **🧵 Class Management** | Instructors can add/update classes; admins can approve/deny classes and give feedback. |
| **🛒 Selection Workflow** | Students can select, view, and remove classes before checkout; history of payments & enrollments. |
| **📊 Popular Listings** | `/popular-classes` (sorted by student count desc) and `/popular-instructors` (returns first 6). |
| **🚀 Vercel Ready** | `vercel.json` configured for serverless deploy (Node.js runtime). |

## 🧰 Tech Stack

| Category | Libraries |
|---|---|
| **Runtime** | [Node.js](https://nodejs.org/) |
| **Framework** | [Express 4](https://expressjs.com/) |
| **Database** | [MongoDB](https://www.mongodb.com/) (Atlas), [mongodb driver 5](https://www.mongodb.com/docs/drivers/node/v5/) |
| **Payments** | [Stripe 12](https://stripe.com/) (Node SDK) |
| **Middleware** | [cors](https://github.com/expressjs/cors), [dotenv](https://github.com/motdotla/dotenv) |

## 🔌 API Reference

Base URL (local): `http://localhost:5000/`  
Base URL (prod): `https://tune-up-tutor-server.vercel.app/`

### Payment

| Endpoint | Method | Body/Params | Description |
|---|---|---|---|
| `/create-payment-intent` | `POST` | `{ price }` | Creates a Stripe PaymentIntent. Returns `{ clientSecret }`. |
| `/booking-data` | `POST` | `{ paymentInfo, enrolledClass }` | Finalizes booking: inserts payment record, enrolls class, deletes from `selectedClasses`, decrements seats & increments students on the class. |

### Users

| Endpoint | Method | Notes |
|---|---|---|
| `/users` | `GET` | Get all users. |
| `/users` | `POST` | Create user if not exists (checks by email). |
| `/users/:email` | `GET` | Get single user by email. |
| `/users/:id` | `PATCH` | Update user role `{ role }`. |

### Instructors

| Endpoint | Method | Notes |
|---|---|---|
| `/instructors` | `GET` | Users filtered by `role: 'instructor'`. |
| `/popular-instructors` | `GET` | First 6 instructors (same filter). |

### Classes

| Endpoint | Method | Notes |
|---|---|---|
| `/add-class` | `POST` | Instructor: add new class document. |
| `/classes` | `GET` | Get all classes. |
| `/update-classes/:id` | `GET` | Get a class by `_id`. |
| `/update-classes/:id` | `PATCH` | Update `{ price, seats, className }`. |
| `/classes/:id` | `GET` | Returns from `selectedClassesCollection` by `_id` (used for payment preload). |
| `/classes/:id` | `PATCH` | Update class status `{ status }`. |
| `/my-added-classes/:email` | `GET` | Instructor's classes by `email`. |
| `/popular-classes` | `GET` | Sorted by `students` desc. |
| `/enrolled-classes/:email` | `GET` | Enrolled classes by `studentEmail`. |
| `/added-classes` | `GET` | Admin: all added classes. |
| `/feedback/:id` | `PATCH` | Add feedback `{ feedback }` to a class. |

### Selected Classes

| Endpoint | Method | Notes |
|---|---|---|
| `/select-class` | `POST` | Add a selected class document (stores `mainClassId`, course details & student emails). |
| `/select-class/:email` | `GET` | Selected classes by `studentEmail`. |
| `/select-class/:id` | `DELETE` | Remove selected class by `_id`. |

### Payments / History

| Endpoint | Method | Notes |
|---|---|---|
| `/payment-history/:email` | `GET` | Payment records for user `email`, sorted by `date` desc. |

### Health

| Endpoint | Method | Notes |
|---|---|---|
| `/` | `GET` | Health check: returns `'tutor is running'`. |

> ℹ️ Many endpoints operate on `ObjectId` and assume valid IDs. The client enforces role checks; consider additional validation if exposing publicly.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or a local MongoDB instance)
- [Stripe](https://dashboard.stripe.com/) account (secret key + publishable key)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/amir2601/tune-up-tutor-server.git
cd tune-up-tutor-server
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file at the project root:

| Variable | Purpose |
|---|---|
| `PORT` | Port to run on (defaults to 5000 if unset) |
| `DB_USER` | MongoDB Atlas username |
| `DB_PASS` | MongoDB Atlas password |
| `PAYMENT_SECRET_KEY` | Stripe secret key (use test key in dev) |

4. **Run locally**
```bash
node index.js
```

Server will run at `http://localhost:5000`.

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm start` | Start the server (`node index.js`) |
| `npm test` | Placeholder (exits with error — not configured) |

## 📂 Project Structure

```bash
.
├── .env            # Environment variables (gitignored)
├── .gitignore      # node_modules, .vercel
├── index.js        # Main Express app & all API routes
├── package.json    # Dependencies & scripts
├── vercel.json     # Vercel deployment config (Node runtime + routes)
└── README.md
```

## 🚢 Deployment (Vercel)

The repo includes `vercel.json`:

```json
{
  "version": 2,
  "builds": [{ "src": "./index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/", "methods": ["GET","POST","PUT","PATCH","DELETE","OPTIONS"] }]
}
```

Steps:

1. Push to GitHub (this repo is already pushed).
2. Import the project in [Vercel](https://vercel.com/).
3. Add environment variables (`DB_USER`, `DB_PASS`, `PAYMENT_SECRET_KEY`) in Vercel → Project → Settings → Environment Variables.
4. Deploy.

Live API: **[https://tune-up-tutor-server.vercel.app/](https://tune-up-tutor-server.vercel.app/)**

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: add something amazing"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

## 🧾 License

Released under the **ISC License**. See `package.json` for details.

## 📬 Contact

- **GitHub**: [@amir2601](https://github.com/amir2601)
- **Live Client**: [tune-up-tutor.web.app](https://tune-up-tutor.web.app)
- **Server Repo**: [tune-up-tutor-server](https://github.com/amir2601/tune-up-tutor-server)
- **Client Repo**: [tune-up-tutor-client](https://github.com/amir2601/tune-up-tutor-client)