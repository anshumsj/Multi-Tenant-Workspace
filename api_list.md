# API Documentation

All endpoints are prefixed with the base URL: `http://localhost:3000/api`

## 🔐 Authentication (`/auth`)
*These endpoints do not require authentication (except logout).*

- **`POST /auth/register`** 
  - Register a new user account.
- **`POST /auth/login`** 
  - Authenticate a user and return a JWT token.
- **`POST /auth/logout`** 
  - Clear the user's authentication cookie.
- **`POST /auth/generateotp`** 
  - Generate an OTP to reset a forgotten password.
- **`POST /auth/verifyotp`** 
  - Verify the OTP sent to the user's email.
- **`POST /auth/changepassword`** 
  - Change the user's password after verifying the OTP.

---

## 👤 User (`/user`)
*Requires Authentication.*

- **`POST /user/getUserByEmail`** 
  - Look up a user's details by their email address.

---

## 🏢 Workspace (`/workspace`)
*Requires Authentication.*

- **`POST /workspace/create`** 
  - Create a new workspace (the creator becomes the 'owner').
- **`GET /workspace/getAllWorkspaces`** 
  - Fetch all workspaces the current user is a member of.
- **`POST /workspace/:workspaceId/addMember`** 
  - Add an existing user to the workspace (Requires 'owner' or 'admin' role).
- **`GET /workspace/getAllMembers/:workspaceId`** 
  - Get a list of all members inside a specific workspace.
- **`DELETE /workspace/removeMember/:workspaceId`** 
  - Remove a user from the workspace (Requires 'owner' or 'admin' role).

---

## 📂 Project (`/project`)
*Requires Authentication & Workspace Membership.*

- **`POST /project/create/:workspaceId`** 
  - Create a new project within a workspace.
- **`GET /project/getAllProjects/:workspaceId`** 
  - Get all projects that exist within a workspace.
- **`PATCH /project/update/:projectId/:workspaceId`** 
  - Update a project's name or description.
- **`DELETE /project/delete/:projectId/:workspaceId`** 
  - Delete a project and all associated tasks (Requires 'owner' or 'admin' role).
- **`PATCH /project/changelead/:projectId/:workspaceId`** 
  - Reassign the Project Lead to another workspace member (Requires 'owner' role).
- **`POST /project/addMember/:projectId/:workspaceId`** 
  - Add a workspace member to this specific project.
- **`GET /project/getMembers/:projectId/:workspaceId`** 
  - List all members assigned to a specific project.

---

## 📋 Task (`/task`)
*Requires Authentication & Workspace Membership.*

- **`POST /task/create/:projectId/:workspaceId`** 
  - Create a new task and assign it to project members (Requires Project Lead).
- **`GET /task/getAllTasks/:projectId/:workspaceId`** 
  - Retrieve all tasks for a specific project.
- **`GET /task/getSingleTask/:projectId/:taskId/:workspaceId`** 
  - Get detailed information about a single task.
- **`PATCH /task/updateTask/:workspaceId/:projectId/:taskId`** 
  - Update a task's details, deadline, or status (Requires Project Lead).
- **`POST /task/addComment/:workspaceId/:projectId/:taskId`** 
  - Add a comment to a task (Requires being assigned to the task).
- **`PATCH /task/addResource/:workspaceId/:projectId/:taskId`** 
  - Upload and attach a file/link resource to a task (Requires being assigned to the task).
- **`DELETE /task/deleteTask/:workspaceId/:projectId/:taskId`** 
  - Permanently delete a task (Requires Project Lead).
