# EduScope Role-Based Access Control (RBAC) Implementation

## User Roles

### 1. **Student** (Default Role)
- **Access Level**: Lowest
- **Permissions**:
  - Upload research papers and ideas
  - View approved research papers and ideas
  - Download research papers
  - View their own dashboard with personal stats
- **Restrictions**:
  - Cannot access admin portal
  - Cannot approve/reject content
  - Cannot manage other users

### 2. **Moderator**
- **Access Level**: Medium
- **Permissions**:
  - All student permissions
  - Access admin portal
  - Manage research papers (CRUD operations)
  - Approve/reject research papers
  - Manage ideas (when implemented)
  - View platform statistics
- **Restrictions**:
  - Cannot manage users (view/edit/delete users)
  - Cannot access user management section

### 3. **Admin**
- **Access Level**: Highest
- **Permissions**:
  - All moderator permissions
  - Full user management (CRUD operations)
  - Access to user management section
  - Complete platform oversight
- **Restrictions**: None

### 4. **Faculty** (Future Implementation)
- **Access Level**: Medium-High
- **Intended Permissions**:
  - Review and supervise student work
  - Special approval workflows
  - Faculty-specific dashboard

## Access Control Implementation

### Route Protection
- **Middleware**: `/src/middleware.ts`
  - Protects `/admin/*` routes
  - Redirects unauthenticated users to sign-in
  - Redirects unauthorized users to dashboard
  - Admin-only protection for `/admin/users/*`

### API Protection
All admin APIs require authentication and role validation:
- **Admin/Moderator APIs**: `/api/admin/stats`, `/api/admin/research/*`
- **Admin-Only APIs**: `/api/admin/users/*`

### UI Access Control
- **Navigation**: Admin portal link only visible to admin/moderator users
- **Admin Sidebar**: Users tab only visible to admin users
- **Role Display**: Current user role shown in admin portal sidebar

### Authentication Flow
1. **Login**: Users sign in with credentials
2. **Role Check**: System determines user role from database
3. **Redirection**: 
   - Students → `/dashboard`
   - Admin/Moderator → `/admin`
4. **Session**: Role stored in JWT and session for subsequent requests

## Database Schema
```typescript
User {
  role: {
    type: String,
    enum: ['student', 'admin', 'moderator', 'faculty'],
    default: 'student'
  }
}
```

## Security Features
- **Server-side validation**: All role checks performed on server
- **Token-based auth**: JWT tokens include role information
- **API protection**: All admin endpoints require proper authentication
- **Route guards**: Middleware prevents unauthorized access
- **UI restrictions**: Role-based component rendering

## Testing Setup
- **Admin User**: `adabeysekaraa@students.nsbm.ac.lk` (role: admin)
- **Moderator User**: `adabeysekara@students.nsbm.ac.lk` (role: moderator)
- **Default**: All new users have 'student' role

## Implementation Files
- `/src/middleware.ts` - Route protection
- `/src/lib/auth/config.ts` - Authentication configuration
- `/src/types/global.d.ts` - TypeScript types for roles
- `/src/app/admin/*` - Admin portal components
- `/src/api/admin/*` - Protected admin APIs
- `/src/components/layout/Navbar.tsx` - Role-based navigation

## Future Enhancements
- Role hierarchy with inheritance
- Permission-based access (granular permissions)
- Audit logging for admin actions
- Role assignment interface for admins
- Temporary role elevation/delegation
