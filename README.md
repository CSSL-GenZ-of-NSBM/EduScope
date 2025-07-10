# EduScope - NSBM Green University Research Platform

🎓 **A collaborative research platform where NSBM students can share research papers, project ideas, and get academic guidance.**

> **New to coding?** Don't worry! This guide will walk you through everything step-by-step. No prior experience required! 🚀

> **Note:** *Only NSBM students are allowed to contribute to this project for now.*

## 🎯 What is EduScope?

EduScope is like a "Facebook for student research" where NSBM students can:
- **📄 Research Paper Sharing** - Upload and discover academic papers from fellow students
- **💡 Idea Bank** - Share and explore research topic ideas  
- **🧭 Degree Guidance** - Get recommendations for choosing your degree program
- **🤝 Academic Collaboration** - Build a community-driven knowledge base
- **⭐ Save & Favorite** - Save interesting papers to read later

## 🛠️ Technology Stack (Don't worry, you don't need to know all of this!)

- **Frontend**: Next.js 14 with TypeScript (JavaScript with type safety)
- **Database**: MongoDB (stores all our data)
- **Styling**: Tailwind CSS + shadcn/ui components (makes things look pretty)
- **Authentication**: NextAuth.js (handles user login/logout)
- **Containerization**: Docker (runs everything in isolated containers)

*Don't be intimidated by these technologies! The setup is automated and you can learn as you go.*

## 📋 What You Need Before Starting

> **Complete beginner?** No problem! Just follow these links to download everything you need:

1. **Git** - [Download here](https://git-scm.com/downloads) 
   - *This helps you save and share your code changes*
2. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
   - *This runs the application on your computer*
3. **Code Editor** - [VS Code recommended](https://code.visualstudio.com/)
   - *This is where you'll write code (like Microsoft Word but for coding)*

**Windows Users**: Use PowerShell or Command Prompt for terminal commands  
**Mac/Linux Users**: Use Terminal for commands

## 🚀 How to Start Contributing (Step by Step)

### Step 1: Get the Code
```bash
# 1. Open your terminal/command prompt
# 2. Navigate to where you want the project (e.g., Desktop)
cd Desktop

# 3. Clone the project
git clone https://github.com/CSSL-GenZ-of-NSBM/EduScope.git

# 4. Go into the project folder
cd EduScope
```

### Step 2: Set Up Environment
```bash
# 1. Copy the environment file (this contains important settings)
copy .env.example .env.local

# 2. Make sure Docker Desktop is running 
# Look for the Docker whale icon in your system tray (bottom right on Windows)
# If you don't see it, open Docker Desktop application

# 3. Start the application (this may take 5-10 minutes the first time)
docker compose up

# You'll see lots of text scrolling - this is normal! 
# Wait until you see "ready" or "compiled successfully"
```

> **First time setup taking long?** This is normal! Docker is downloading everything needed to run the app.

### Step 3: Set Up Initial Users
```bash
# 1. Open a new terminal window (keep the previous one running)
# 2. Navigate to the project folder again
cd Desktop/EduScope

# 3. Run the user setup script
node scripts/setup-users.js
```

### Step 4: Access the Application
- **Main App**: http://localhost:3000
- **Database Admin**: http://localhost:8081 (username: admin, password: admin123)

### Step 5: Test Login
Use one of these test accounts:
- **Admin**: admin@students.nsbm.ac.lk / password123
- **Student**: student@students.nsbm.ac.lk / password123

## 🌟 How to Contribute (For Beginners)

### 1. Create Your Feature Branch
```bash
# 1. Make sure you're in the project folder
cd EduScope

# 2. Create and switch to a new branch (replace 'feature-name' with what you're building)
git checkout -b feature-add-search-functionality

# Examples of good branch names:
# - feature-add-dark-mode
# - fix-login-bug
# - improve-ui-design
```

### 2. Make Your Changes
- Edit files in VS Code or your preferred editor
- Test your changes by refreshing http://localhost:3000
- Make sure everything works before committing

### 3. Save Your Work
```bash
# 1. See what files you changed
git status

# 2. Add your changes
git add .

# 3. Save with a clear message
git commit -m "Add search functionality to research papers"

# Examples of good commit messages:
# - "Fix login button not working on mobile"
# - "Add dark mode toggle to navigation"
# - "Improve research paper card design"
```

### 4. Share Your Work
```bash
# 1. Push your branch to GitHub
git push origin feature-add-search-functionality

# 2. Go to GitHub.com and find the EduScope repository
# 3. Click "Compare & pull request" button
# 4. Write a clear title and description of what you changed
# 5. Click "Create pull request"
```

## 📝 Pull Request Guidelines

### Good Pull Request Title Examples:
- ✅ "Add search functionality to research papers page"
- ✅ "Fix mobile responsive design for navigation"
- ✅ "Improve user profile edit form validation"

### What to Include in Description:
```markdown
## What I Changed
- Added search bar to research papers page
- Implemented filter by category
- Added loading spinner while searching

## How to Test
1. Go to /research page
2. Try searching for "AI" or "Machine Learning"
3. Test filtering by different categories
```

## 🆘 Common Issues & Solutions

### Docker Issues
```bash
# If containers won't start:
docker compose down
docker compose up --build

# If MongoDB connection fails:
docker compose restart mongodb
```

### Git Issues
```bash
# If you need to switch back to main branch:
git checkout main

# If you want to get latest changes:
git pull origin main
```

### Application Issues
```bash
# If website won't load:
# 1. Check if Docker Desktop is running
# 2. Check if containers are running: docker compose ps
# 3. Restart: docker compose restart web
```

## 📁 Important Folders for Beginners

```
EduScope/
├── src/
│   ├── app/                 # Website pages (what users see)
│   │   ├── research/       # Research papers pages
│   │   ├── ideas/          # Ideas bank pages  
│   │   ├── dashboard/      # User dashboard
│   │   └── admin/          # Admin management pages
│   ├── components/         # Reusable UI pieces
│   │   ├── ui/             # Buttons, cards, modals, etc.
│   │   └── layout/         # Navigation, headers, footers
│   ├── lib/                # Database and utilities
│   │   ├── db/             # Database models and connections
│   │   └── auth/           # Authentication logic
│   └── types/              # TypeScript type definitions
├── scripts/                # Helper scripts for setup
├── public/                 # Images, icons, static files
└── README.md              # This file!
```

> **Tip**: Start by looking at files in `src/app/` and `src/components/ui/` - these are the easiest to understand and modify!

## 🎨 Design Guidelines

### Colors & Branding
- **Primary**: Blue (#3B82F6) - for main actions and links
- **Secondary**: Green (#10B981) - for success states
- **Accent**: Orange (#F59E0B) - for highlights and saved items
- **Neutral**: Gray tones for backgrounds and text

### Component Standards
- Use shadcn/ui components when possible
- Follow existing patterns in the codebase
- Ensure mobile responsiveness
- Add loading states for better UX
- Include proper error handling

## 🎯 Good First Contributions (Perfect for Beginners!)

### 🟢 Easy (Great for first-time contributors):
- 🎨 **UI Improvements** - Change button colors, improve spacing, add icons
- 📱 **Mobile Fixes** - Make pages work better on phones and tablets
- 📝 **Text Changes** - Update help text, error messages, or descriptions
- 🔍 **Search Features** - Add search bars or filter options
- 📊 **Data Display** - Improve how research papers are shown

### 🟡 Medium (After you've made a few easy contributions):
- 📝 **Form Validation** - Add helpful error messages to forms
- � **Navigation** - Improve how users move between pages
- 📈 **Statistics** - Add charts or counters to show data
- 💾 **Data Management** - Help users organize their saved papers

### 🔴 Advanced (For experienced contributors):
- 🔐 **Authentication** - User login/logout improvements
- �️ **Database** - Backend API development
- 🔧 **Performance** - Speed up page loading
- 🛡️ **Security** - Add security features

### 💡 Ideas for Your First Contribution:
- Add a "Back to Top" button on long pages
- Improve the color scheme of buttons
- Add loading animations
- Create a "How to Use" help section
- Add dark mode toggle
- Improve the research paper card design

## 💬 Getting Help & Support

### 🆘 Stuck? Don't Give Up!
- **GitHub Issues**: Report bugs or ask for help
- **Code Review**: Tag maintainers in your pull request for feedback
- **Documentation**: Check this README or the `/docs` folder

### 🤝 Community Guidelines
- Be respectful and kind to other contributors
- Ask questions - no question is too basic!
- Help others when you can
- Share your learning experiences

### 📚 Learning Resources
- **Git Tutorial**: https://learngitbranching.js.org/
- **React/Next.js**: https://nextjs.org/learn
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**🎉 Welcome to EduScope! We're excited to have you contribute to student research at NSBM! 🚀**

*Remember: Every expert was once a beginner. Take your time, ask questions, and enjoy the journey!*