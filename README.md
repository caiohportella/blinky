<div align="center">

  <h1>⚡ Blinky - Shorten Links, Expand Reach</h1>

</div>

<div align="center">

  <br />

  <img width="1912" alt="blinky-preview" src="https://github.com/user-attachments/assets/placeholder-blinky" />

  <br />

  <div>
    <img src="https://img.shields.io/badge/-Next_JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000" alt="nextjs" />
    <img src="https://img.shields.io/badge/-Typescript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
    <img src="https://img.shields.io/badge/-Go-black?style=for-the-badge&logoColor=white&logo=go&color=00ADD8" alt="go" />
    <img src="https://img.shields.io/badge/-Gin-black?style=for-the-badge&logoColor=white&logo=gin&color=008ECF" alt="gin" />
    <img src="https://img.shields.io/badge/-PostgreSQL-black?style=for-the-badge&logoColor=white&logo=postgresql&color=4169E1" alt="postgresql" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
    <img src="https://img.shields.io/badge/shadcn%2Fui-000?logo=shadcnui&logoColor=fff&style=for-the-badge" alt="shadcn" />
  </div>

  <h3 align="center">The most playful URL shortener. Create, manage, and track your links with a smile.</h3>

</div>

## 📋 About

**Blinky** is a modern, full-stack URL shortening service built with a Go backend and Next.js frontend. It combines beautiful design with powerful link management capabilities, allowing you to create custom short links, track click statistics, and manage all your URLs from an intuitive dashboard.

## 🔋 Features

👉 **Custom Short Links**: Create branded short links with custom aliases. Make your URLs memorable and trustworthy. <br />
👉 **Real-time Analytics**: Track clicks on all your shortened links with detailed statistics. <br />
👉 **Lightning Fast API**: Built with Go and Gin for blazing fast redirects and API responses. <br />
👉 **Secure Authentication**: JWT-based authentication with secure password hashing using bcrypt. <br />
👉 **Modern Dashboard**: Beautiful, intuitive dashboard to manage all your links with search and filtering. <br />
👉 **Automatic Favicons**: Automatically fetches and displays website favicons for visual link identification. <br />
👉 **Responsive Design**: Fully functional and visually appealing across all devices and screen sizes. <br />

## 📁 Project Structure

```
blinky/
├── api/                        # Go Backend
│   ├── controllers/            # Route handlers
│   │   ├── link_controller.go  # Link CRUD operations
│   │   └── user_controller.go  # Authentication handlers
│   ├── dtos/                   # Data transfer objects
│   ├── initializers/           # Database & env setup
│   ├── middlewares/            # Auth & CORS middleware
│   ├── migrations/             # Database migrations
│   ├── models/                 # GORM models
│   └── main.go                 # API entry point
│
├── client/                     # Next.js Frontend
│   ├── app/                    # Next.js app router
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard pages
│   │   └── profile/            # User profile
│   ├── components/             # React components
│   │   └── ui/                 # shadcn/ui components
│   └── lib/                    # Utilities & API client
```

## 🛠️ Tech Stack

### Backend
- **Language:** [Go](https://go.dev/) - Fast, compiled programming language
- **Framework:** [Gin](https://gin-gonic.com/) - High-performance HTTP web framework
- **ORM:** [GORM](https://gorm.io/) - Full-featured ORM for Go
- **Database:** [PostgreSQL](https://www.postgresql.org/) - Robust relational database
- **Authentication:** JWT with [golang-jwt](https://github.com/golang-jwt/jwt)

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) - React framework with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible components
- **State Management:** [@simplestack/store](https://github.com/nicolo-ribaudo/simple-stack-store) - Lightweight state management
- **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) - Form validation
- **Icons:** [Lucide React](https://lucide.dev/) - Beautiful & consistent icons

## 🚀 Getting Started

### Prerequisites

- [Go 1.21+](https://go.dev/dl/)
- [Node.js 18+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (recommended) or npm
- [PostgreSQL](https://www.postgresql.org/)

### Environment Variables

Create a `.env` file in the `api/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/blinky
JWT_SECRET=your-super-secret-jwt-key
PORT=8080
```

### Running the API

```bash
# Navigate to the api directory
cd api

# Download dependencies
go mod download

# Run database migrations
go run migrations/migrate.go

# Start the server
go run main.go
```

The API will be available at `http://localhost:8080`

### Running the Client

```bash
# Navigate to the client directory
cd client

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The client will be available at `http://localhost:3000`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users` | Register a new user |
| POST | `/api/v1/users/login` | Login and get JWT token |
| GET | `/api/v1/users/me` | Get current user info |

### Links (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/links` | Get all user's links |
| POST | `/api/v1/links` | Create a new short link |
| DELETE | `/api/v1/links/:id` | Delete a link |
| GET | `/api/v1/links/:id/stats` | Get link statistics |

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Gin](https://gin-gonic.com/) for the blazing fast Go web framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first styling

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/caiohportella">Caio Portella</a>
</div>

