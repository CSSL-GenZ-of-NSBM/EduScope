# EduScope - NSBM Green University Academic Platform

EduScope is a comprehensive academic platform designed specifically for NSBM Green University students to foster research collaboration and academic guidance.

## 🎯 Purpose

EduScope serves as a centralized hub where students can:

### Research & Project Sharing
- 📄 **Upload Research Papers & Projects** - Share completed research papers, final year projects, and academic work
- 🔍 **Explore Academic Content** - Browse and discover research papers from fellow students across different fields
- 🤝 **Collaborate & Share** - Build a community-driven knowledge base for academic excellence

### Idea Bank
- 💡 **Research Ideas Repository** - Upload and explore innovative research paper topics and project ideas
- 🏷️ **Categorized by Fields** - Organized content across various academic disciplines
- 🌟 **Inspiration Hub** - Help students find inspiration for their next research endeavor

### Degree Guidance
- 🧭 **Degree Path Recommendation** - Assist new incoming students in choosing the most suitable undergraduate degree
- 📊 **Academic Input Analysis** - Personalized recommendations based on student preferences and academic background
- 🎓 **University Onboarding** - Streamline the decision-making process for prospective NSBM students

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: RESTful API with Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui with Tailwind CSS
- **Containerization**: Docker & Docker Compose
- **File Storage**: GridFS (MongoDB)

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git installed
- At least 4GB RAM available

### Option 1: Using Docker Compose (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd EduScope

# Copy environment variables
copy .env.example .env.local

# Start the entire application stack
docker compose up
```

### Option 2: Using Windows Batch Script
```cmd
# Navigate to the project directory
cd EduScope

# Run the startup script
scripts\start.bat
```

### Option 3: Manual Setup
```bash
# Install dependencies
npm install

# Set up environment variables
copy .env.example .env.local

# Start MongoDB (make sure Docker is running)
docker run -d -p 27017:27017 --name eduscope-mongo mongo:7.0

# Start development server
npm run dev
```

## 🌐 Access Points

After running `docker compose up`, you can access:

- **🏠 Main Application**: http://localhost:3000
- **📊 MongoDB Express**: http://localhost:8081 (admin/admin123)
- **📚 MongoDB**: mongodb://localhost:27017/eduscope
- **🔧 API Health Check**: http://localhost:3000/api/health

## ✅ Platform Status

**🎉 SUCCESSFULLY DEPLOYED!** The EduScope platform is now fully functional and running with Docker.

### ✅ Currently Working:
- ✅ **Docker Containerization**: All services running in containers
- ✅ **Next.js 14 with TypeScript**: Modern React framework with type safety
- ✅ **MongoDB Integration**: Database connected and accessible
- ✅ **API Routes**: Health check and database test endpoints
- ✅ **shadcn/ui Components**: Modern UI component library integrated
- ✅ **Tailwind CSS**: Utility-first CSS framework
- ✅ **Windows PowerShell Scripts**: Easy startup/shutdown scripts
- ✅ **MongoDB Express**: Database administration interface

### 🚧 Ready for Development:
- 🔄 **Authentication System** (NextAuth.js configured)
- 🔄 **File Upload System** (GridFS ready)
- 🔄 **Research Paper Management**
- 🔄 **Project Sharing Features**
- 🔄 **Idea Bank System**
- 🔄 **Degree Guidance Recommendations**

### 📋 Quick Commands:
```powershell
# Start the platform
.\scripts\start-platform.ps1

# Stop the platform  
.\scripts\stop-platform.ps1

# View logs
docker compose logs -f web

# Restart web service
docker compose restart web
```

## 📁 Project Structure

```
EduScope/
├── src/
│   ├── app/                 # Next.js 14 app router
│   │   ├── (auth)/         # Authentication routes
│   │   ├── (dashboard)/    # Dashboard routes
│   │   ├── research/       # Research paper pages
│   │   ├── projects/       # Project sharing pages
│   │   ├── ideas/          # Idea bank pages
│   │   ├── guidance/       # Degree guidance pages
│   │   └── api/            # API routes
│   ├── components/         # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── research/       # Research-specific components
│   │   ├── projects/       # Project components
│   │   ├── ideas/          # Idea bank components
│   │   └── guidance/       # Guidance components
│   ├── lib/                # Utilities and configurations
│   │   ├── db/             # Database models and config
│   │   ├── auth/           # Authentication utilities
│   │   └── validation/     # Form validation schemas
│   ├── types/              # TypeScript definitions
│   └── hooks/              # Custom React hooks
├── scripts/                # Startup scripts
├── docker-compose.yml      # Docker services
├── Dockerfile             # Next.js container
└── README.md
```

## 🔧 Development

### Environment Variables
Create a `.env.local` file with the following:

```env
MONGODB_URI=mongodb://mongodb:27017/eduscope
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here
DB_NAME=eduscope
MAX_FILE_SIZE=50MB
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.ppt,.pptx,.txt
NSBM_DOMAIN=@students.nsbm.ac.lk
NODE_ENV=development
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Docker Commands
```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs web
docker compose logs mongodb

# Rebuild containers
docker compose up --build
```

## 🏗️ Architecture

### Features
1. **Research Paper Management**
   - Upload PDFs, DOCs, presentations
   - Categorize by academic field and year
   - Search and filter functionality
   - Download tracking and analytics

2. **Project Sharing**
   - Multimedia project uploads
   - Collaborative features
   - Version control
   - Academic integrity measures

3. **Idea Bank**
   - Research topic suggestions
   - Voting and popularity system
   - Category-based organization
   - Collaborative idea development

4. **Degree Guidance**
   - Questionnaire-based assessment
   - Personalized recommendations
   - Detailed program information
   - Career path projections

### Security Features
- NSBM email domain validation
- Role-based access control
- Content moderation
- File upload validation
- Academic integrity checks

## 📊 Database Schema

### Core Collections
- **Users**: Student profiles and authentication
- **ResearchPapers**: Academic papers and metadata
- **Projects**: Student projects and files
- **Ideas**: Research ideas and community voting
- **DegreePrograms**: Available degree information
- **Assessments**: Degree guidance questionnaires

## 🔐 Authentication

- NextAuth.js integration
- NSBM email domain restriction
- Role-based permissions (Student, Admin, Moderator)
- Secure session management

## 📱 Responsive Design

Built with Tailwind CSS and shadcn/ui components for:
- Mobile-first responsive design
- Dark/light mode support
- Accessibility compliance
- NSBM branding integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is proprietary software developed for NSBM Green University.

## 🆘 Support

For issues and support:
- Check the documentation
- Review existing issues
- Contact the development team

---

**EduScope** - Empowering NSBM students through collaborative academic excellence! 🎓✨