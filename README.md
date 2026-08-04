# Multi-Tenant Workspace Manager

**🌐 Live Demo:** [multi-tena-git-81d94a-anshumawasthiloveindia-gmailcoms-projects.vercel.app]  
**🔌 Backend API:** [https://workspace-backend-024f.onrender.com](https://workspace-backend-024f.onrender.com)

A collaborative, multi-tenant workspace management application designed for teams to organize projects, track tasks, and collaborate effectively. It features robust role-based access control (RBAC), secure authentication, and seamless project management capabilities.

## 🚀 Features

- **Multi-Tenant Architecture**: Create isolated workspaces for different teams or organizations.
- **Role-Based Access Control (RBAC)**: Manage permissions with Workspace Owners, Admins, and Members.
- **Project & Task Management**: Create projects within workspaces, assign Project Leads, and manage task lifecycle.
- **Secure Authentication**: JWT-based authentication with OTP support for password resets.
- **Resource Management**: Attach files and resources to tasks.
- **Real-time Collaboration**: Comment on tasks and communicate with assignees.

## 💻 Tech Stack

### Frontend
- **React 19**: Modern UI development.
- **Vite**: Lightning-fast build tool and dev server.
- **React Router DOM**: Client-side routing.
- **TailwindCSS**: Utility-first styling for responsive design.
- **Axios**: Promise-based HTTP client for API requests.

### Backend
- **Node.js & Express.js**: Fast and scalable RESTful API framework.
- **MongoDB & Mongoose**: NoSQL database for flexible schema design and relationships.
- **JSON Web Tokens (JWT)**: Secure, stateless user authentication.
- **Bcrypt**: Password hashing.
- **Nodemailer**: Email integration for OTP generation and password resets.
- **Cloudinary & Multer**: File upload and media management for task resources.

## 🏗️ Architecture Decisions

1. **Workspace-Centric Data Model**: 
   All core entities (Projects, Tasks) are strongly coupled to a `workspaceId`. This ensures strict data isolation between different tenants (workspaces) and simplifies access control queries.

2. **Hierarchical RBAC**:
   - **Workspace Level**: Owners, Admins, and Members dictate who can modify workspace settings and invite others.
   - **Project Level**: Project Leads manage task assignments and task lifecycle, empowering delegation without giving full workspace admin rights.

3. **Stateless Authentication**:
   Using HTTP-only cookies with JWTs to maintain secure sessions while avoiding CSRF and XSS vulnerabilities, ensuring scalable API access.

4. **RESTful Resource Nesting**:
   API endpoints are designed to reflect the hierarchical nature of the data (e.g., `/api/task/create/:projectId/:workspaceId`), acting as a natural guardrail for validation middlewares and ensuring data consistency.

## 🛠️ Local Development Setup

Follow these instructions to get the project up and running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- Cloudinary Account (for file uploads)

### 1. Clone the repository
```bash
git clone <repository-url>
cd multiTenantWorkspace
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Cloudinary Keys
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer Email Configuration
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

Start the backend development server:
```bash
npm start
```
*The API will be available at `http://localhost:3000`*

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The frontend will be accessible at `http://localhost:5173` (or the port specified by Vite).*

## 📚 API Reference

All endpoints are prefixed with the base URL: `http://localhost:3000/api`

### 🔐 Authentication (`/auth`)
- `POST /auth/register` - Register a new user.
- `POST /auth/login` - Authenticate a user and receive a JWT.
- `POST /auth/logout` - Clear authentication.
- `POST /auth/generateotp` - Generate an OTP for password reset.
- `POST /auth/verifyotp` - Verify the OTP.
- `POST /auth/changepassword` - Change password.

### 👤 User (`/user`)
- `POST /user/getUserByEmail` - Look up a user by email.

### 🏢 Workspace (`/workspace`)
- `POST /workspace/create` - Create a new workspace.
- `GET /workspace/getAllWorkspaces` - Fetch user's workspaces.
- `POST /workspace/:workspaceId/addMember` - Add a member to the workspace.
- `GET /workspace/getAllMembers/:workspaceId` - List workspace members.
- `DELETE /workspace/removeMember/:workspaceId` - Remove a member.

### 📂 Project (`/project`)
- `POST /project/create/:workspaceId` - Create a new project.
- `GET /project/getAllProjects/:workspaceId` - Get workspace projects.
- `PATCH /project/update/:projectId/:workspaceId` - Update project details.
- `DELETE /project/delete/:projectId/:workspaceId` - Delete a project.
- `PATCH /project/changelead/:projectId/:workspaceId` - Reassign Project Lead.
- `POST /project/addMember/:projectId/:workspaceId` - Add member to a project.
- `GET /project/getMembers/:projectId/:workspaceId` - List project members.

### 📋 Task (`/task`)
- `POST /task/create/:projectId/:workspaceId` - Create a task.
- `GET /task/getAllTasks/:projectId/:workspaceId` - Get project tasks.
- `GET /task/getSingleTask/:projectId/:taskId/:workspaceId` - Get task details.
- `PATCH /task/updateTask/:workspaceId/:projectId/:taskId` - Update task details.
- `POST /task/addComment/:workspaceId/:projectId/:taskId` - Add comment to task.
- `PATCH /task/addResource/:workspaceId/:projectId/:taskId` - Upload task resource.
- `DELETE /task/deleteResource/:workspaceId/:projectId/:taskId/:resourceId` - Delete a task resource.
- `DELETE /task/deleteTask/:workspaceId/:projectId/:taskId` - Delete a task.
