# Doxie Dynasty - The Ultimate Dachshund Card Game

A conversion-optimized single-product eCommerce website for the Doxie Dynasty card game, featuring Stripe integration and a mission to support dachshund rescue organizations.

## 🎯 About

Doxie Dynasty is a fast-paced, family-friendly card game where players build their ultimate pack of wiener dogs while surviving chaos cards like "Vet Visit" and "Bark-Off". 10% of all profits support dachshund rescue organizations.

## 🚀 Features

- **Conversion-Optimized Design**: Single-page layout with strategic CTA placement
- **Stripe Integration**: Secure payment processing with embedded checkout
- **Mobile-First**: Responsive design optimized for mobile users
- **Social Proof**: Customer testimonials and trust signals
- **Email Capture**: Newsletter signup for expansion packs
- **Rescue Support**: Transparent donation tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Payments**: Stripe
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd doxie-dynasty
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Doxie Dynasty Product IDs (create these in your Stripe dashboard)
STRIPE_DOXIE_DYNASTY_PRODUCT_ID=prod_...
STRIPE_DOXIE_DYNASTY_PRICE_ID=price_...
```

5. Run the development server:
```bash
npm run dev
```

## 🎮 Game Features

- **Doxie Cards**: Collect smooth, long, and wire-haired dachshunds with unique traits
- **Event Cards**: Navigate hilarious chaos cards like "Vet Visit" and "Bark-Off"
- **Family-Friendly**: Suitable for ages 8+ and 2-6 players
- **Instagrammable**: Beautiful artwork perfect for social media sharing

## 💳 Stripe Setup

1. Create a Stripe account and get your API keys
2. Create a product in Stripe Dashboard for "Doxie Dynasty Card Game"
3. Set the price to $24.99 USD
4. Configure webhooks for order processing
5. Update environment variables with your Stripe keys

## 🎨 Design Principles

- **F-Pattern Layout**: Optimized for natural eye movement
- **Thumb-Friendly CTAs**: Mobile-optimized button placement
- **Social Proof**: Customer testimonials and trust badges
- **Urgency**: Limited first print run messaging
- **Emotional Connection**: Dachshund rescue mission integration

## 📱 Pages

- **Homepage**: Single-page scroll layout with all major sections
- **Success Page**: Order confirmation with next steps
- **404 Page**: Custom error handling

## 🚀 Deployment

The site is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🤝 Contributing

This is a commercial project for the Doxie Dynasty card game. For support or questions, please contact the development team.

## 📄 License

This project is proprietary software for the Doxie Dynasty card game.

---

**Made with ❤️ for dachshund lovers everywhere**
