# Bolt CRM

A modern, full-featured Customer Relationship Management system built for mortgage professionals and real estate teams. Bolt CRM streamlines lead management, client communication, and workflow automation with an intuitive interface and powerful features.

## ✨ Features

- **🎯 Lead Management** - Complete pipeline from leads to past clients
- **📋 Task Management** - Organize and track tasks with priorities and assignments  
- **👥 Contact Management** - Centralized contact database with detailed profiles
- **🏢 Condo Database** - Specialized condo listings with approval tracking
- **📧 Email Templates** - Pre-built email templates for common communications
- **🤖 AI Chat Bot** - Bolt Bot for automated assistance and queries
- **📄 Pre-approval Letters** - Generate professional pre-approval documentation
- **🔐 Multi-tenant Architecture** - Account-based data isolation
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **🎨 Modern UI** - Clean, professional interface built with Tailwind CSS

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt
- **AI Integration**: OpenAI SDK for chat functionality
- **UI Components**: Radix UI, Lucide React icons
- **Styling**: Tailwind CSS with custom components
- **Forms**: Custom FormBuilder with validation
- **Communication**: Nodemailer, Twilio integration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm**, **yarn**, **pnpm**, or **bun**
- **PostgreSQL** database
- **Git**

## 🛠️ Installation & Setup


### 1. Install Dependencies
```bash
npm install
# or
yarn install
# or  
pnpm install
# or
bun install
```

### 2. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bolt_crm"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"

# AI Integration  
OPENAI_API_KEY="your-openai-api-key"

# Email Configuration
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-email-password"

# Twilio (optional)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🏗️ Project Structure

```
bolt-crm/
├── app/                          # Next.js app directory
│   ├── layout.jsx               # Root layout component
│   ├── page.jsx                 # Home page
│   ├── globals.scss             # Global styles
│   └── api/                     # API routes
├── components/                   # Reusable UI components
│   ├── auth/                    # Authentication components
│   ├── chat/                    # AI chat components
│   ├── leads/                   # Lead management components
│   ├── table/                   # Data table component
│   ├── formBuilder/             # Dynamic form builder
│   └── ui/                      # Base UI components
├── data/                        # Data layer
│   └── pages/                   # Page components and logic
├── prisma/                      # Database schema and migrations
│   └── schema.prisma            # Prisma schema definition
├── services/                    # External service integrations
├── utils/                       # Utility functions
└── libs/                        # Shared libraries
```

## 🎯 Key Components

### Page Management
- **Page Router**: All pages are defined in `data/pages/index.jsx`
- **Layout Wrapper**: `app/pageWrapper.jsx` handles layout, routing, and middleware
- **Sidebar Navigation**: Add new pages to `components/navbars/sidebar.jsx` for menu access

### Data Management
- **Table Component**: `components/table/index.jsx` - Powerful data table with inline editing
- **Form Builder**: `components/formBuilder/index.jsx` - Dynamic forms with validation
- **Server Actions**: `components/serverActions.jsx/index.jsx` - Database operations

### Example Usage
- **Task Management**: See `data/pages/tasks.jsx` for Table component implementation
- **Form Building**: See `data/pages/preapproval.jsx` for FormBuilder usage

## 🗄️ Database Management

### Schema Updates
1. Modify the required tables/columns in `prisma/schema.prisma`
2. Push changes to database:
   ```bash
   npx prisma db push
   ```
3. Stop the development server
4. Delete the `.next` directory:
   ```bash
   rm -rf .next
   ```
5. Restart the development server
6. Reload the application

### Available Models
- **Accounts** - Multi-tenant account management
- **Users** - User authentication and profiles  
- **Tasks** - Task management with assignments
- **Leads** - Lead pipeline and conversion tracking
- **Contacts** - Contact database management
- **Condos** - Property listings with approval data
- **Email Templates** - Reusable email templates
- **Credentials** - Secure credential storage

## 🚦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🔧 Configuration

### Adding New Pages
1. Create component in `data/pages/`
2. Add route to `data/pages/index.jsx`
3. Add navigation link to `components/navbars/sidebar.jsx`

### Customizing Tables
- Use the `Table` component from `components/table/index.jsx`
- Define columns with types, validation, and custom components
- Support for inline editing, filtering, and actions

### Email Templates
- Stored in database via `email_templates` model
- Manageable through the `/resources/emails` page
- Supports dynamic variables and HTML content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs` (if available)

---

**Built with ❤️ for mortgage and real estate professionals**
