# 🎨 Wandalmt Frontend

Modern e-commerce frontend application built with React 19, TypeScript, and Vite.

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## ✨ Features

- 🌍 **Internationalization** - Full i18n support with English and Polish
- 🛒 **Shopping Cart** - Persistent cart with Redux Toolkit
- 💳 **Stripe Integration** - Secure payment processing
- 🔐 **Authentication** - JWT-based auth with protected routes
- 📱 **Responsive Design** - Fully responsive with Tailwind CSS
- 🧪 **Testing** - Jest and React Testing Library
- 🎨 **Modern UI** - Lucide React icons and beautiful components

## 🛠 Tech Stack

| Technology       | Version | Purpose              |
| ---------------- | ------- | -------------------- |
| React            | 19.1.1  | UI framework         |
| TypeScript       | 5.8.3   | Type safety          |
| Vite             | 7.3.1   | Build tool           |
| Redux Toolkit    | latest  | State management     |
| RTK Query        | latest  | API caching          |
| Tailwind CSS     | 4       | Styling              |
| React Router DOM | latest  | Routing              |
| Stripe           | latest  | Payments             |
| i18next          | latest  | Internationalization |
| Axios            | latest  | HTTP client          |
| Jest             | latest  | Testing              |

## 📁 Folder Structure

```
wandalmt-front/
├── src/
│ ├── components/ # Reusable UI components
│ │ ├── common/ # Buttons, inputs, modals
│ │ ├── layout/ # Header, Footer
│ │ ├── product/ # Product cards, details
│ │ └── cart/ # Cart components
│ ├── pages/ # Page components
│ │ ├── Home.tsx
│ │ ├── Products.tsx
│ │ ├── ProductDetail.tsx
│ │ ├── Cart.tsx
│ │ ├── Checkout.tsx
│ │ ├── Login.tsx
│ │ ├── Register.tsx
│ │ └── Profile.tsx
│ ├── store/ # Redux store
│ │ ├── slices/ # Redux slices
│ │ └── api/ # RTK Query APIs
│ ├── hooks/ # Custom React hooks
│ ├── services/ # API service layer
│ ├── locales/ # Translation files
│ │ ├── en/ # English
│ │ └── pl/ # Polish
│ ├── types/ # TypeScript definitions
│ ├── utils/ # Helper functions
│ ├── assets/ # Static assets
│ ├── styles/ # Global styles
│ ├── App.tsx
│ └── main.tsx
├── public/ # Public assets
├── tests/ # Test files
├── .env.example # Environment variables example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn** or **pnpm**
- **Backend API** - Running [Wandalmt Backend](https://github.com/Monika464/wandalmt)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Monika464/wandalmt-front
cd wandalmt-front
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment variables:**

```bash
cp .env.example .env
```

Edit .env with your settings:
env

#### API Configuration

`VITE_API_URL=http://localhost:3000`

#### Stripe Configuration

`VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key`

#### reCAPTCHA Configuration

`VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key`

4. **Start development server:**

```bash
npm run dev
```

5. **Open your browser:**

http://localhost:5173

#### Available Scripts

Command Description  
| --------------------------------------------- |
| npm run dev | Start development server |
| npm run build | Build for production |
| npm run preview | Preview production build |
| npm run test | Run tests |
| npm run test:coverage | Run tests with coverage |
| npm run lint | Run ESLint |

## 🌍 Internationalization

The app supports English and Polish with automatic language detection.

#### Adding New Translations

    1.Add translation keys to src/locales/en/common.json

    2.Add Polish translations to src/locales/pl/common.json

    3.Use in components

```
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
return <h1>{t('welcome_message')}</h1>;
```

## 🧪 Testing

### Run tests

```bash
# Run tests
npm test
```

#### Run tests with coverage

```bash
npm run test:coverage
```

## 📦 Building for Production

```bash
npm run build
```

The build artifacts will be in the dist/ directory.

## 🔗 Related Repositories

- [Backend API](https://github.com/Monika464/wandalmt)
- [Live Demo](https://club.boxingonline.eu)

## 📄 License

ISC © 2026 Monika K.

## 🤝 Contributing

    Fork the repository

    Create your feature branch (git checkout -b feature/amazing)

    Commit your changes (git commit -m 'Add amazing feature')

    Push to the branch (git push origin feature/amazing)

    Open a Pull Request
