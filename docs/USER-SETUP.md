# EduScope User Setup Documentation

## Default Users

The platform comes with three default users for testing and initial setup:

### Student User
- **Email:** `student@students.nsbm.ac.lk`
- **Password:** `Test@123`
- **Role:** `student`
- **Access:** Dashboard, research papers, idea bank, degree guidance

### Moderator User
- **Email:** `moderator@nsbm.ac.lk`
- **Password:** `Test@123`
- **Role:** `moderator`
- **Access:** Admin portal (content management), all student features

### Admin User
- **Email:** `admin@nsbm.ac.lk`
- **Password:** `Test@123`
- **Role:** `admin`
- **Access:** Full admin portal (user management, content management), all features

## Email Domain Rules

### Students
- **Domain:** `@students.nsbm.ac.lk`
- **Registration:** Can self-register through the signup page
- **Role:** Automatically assigned `student` role
- **Access:** Basic platform features

### Staff (Moderators & Admins)
- **Domain:** `@nsbm.ac.lk`
- **Registration:** Cannot self-register, must be created by administrators
- **Roles:** Can be assigned `moderator` or `admin` roles
- **Access:** Administrative features based on role

## Creating Users

### Setup Default Users
Run the user setup script to create the three default users:

```powershell
# Windows PowerShell
.\scripts\setup-users.ps1

# Or bash (if available)
bash scripts/setup-users.sh
```

### Creating Additional Users

#### Students
Students can register themselves at `/auth/signup` using their `@students.nsbm.ac.lk` email address.

#### Staff (Moderators/Admins)
Staff accounts must be created by administrators through:
1. Login as admin
2. Navigate to Admin Portal → Users
3. Create new user with appropriate role
4. Or use the admin API endpoints

## Role Permissions

### Student
- View and upload research papers
- Browse idea bank and submit ideas
- Access degree guidance
- Download files
- Basic dashboard access

### Moderator
- All student permissions
- Content moderation (approve/reject papers)
- Manage ideas and comments
- View analytics and reports
- Cannot manage users

### Admin
- All moderator permissions
- User management (create, edit, delete users)
- System configuration
- Full access to all features and analytics
- Role assignment and modification

## Security Notes

- Passwords are hashed using bcrypt with 12 rounds
- Email domain validation is enforced at both registration and login
- JWT tokens are used for session management
- Role-based access control (RBAC) is implemented throughout the system
- Students cannot create accounts with staff email domains
- Staff cannot use the public registration endpoint
