# Mini Project Management Portal

A simple full-stack task management application built for the o2h Full Stack Application Developer fresher assessment.

## Features

- View all project tasks
- Create a new task
- Mark a task as completed
- Delete a task
- Filter tasks by status
- Search tasks
- Dashboard statistics
- Responsive UI
- Loading and empty states
- Dark mode toggle
- Implemented the all tasks

## Tech Stack

- Frontend: HTML, CSS, JavaScript modules
- Backend: Node.js HTTP server
- Database: JSON file storage

This project does not require external npm packages. It is intentionally easy to run locally.

## Folder Structure

```text
project-management-portal/
  frontend/
    src/
      components/
      pages/
      services/
    index.html
    styles.css

  backend/
    config/
    controllers/
    data/
    models/
    routes/
    server.js
```

## Setup Steps

```bash
git clone <repo-url>
cd project-management-portal
npm start
```

Open:

```text
http://localhost:3000
```

## API Documentation

### Get all tasks

```http
GET /tasks
```

Returns all tasks.

### Create task

```http
POST /tasks
```

Request body:

```json
{
  "title": "Build Login Page",
  "description": "Create a responsive login page for the portal.",
  "status": "Pending"
}
```

Validation:

- `title` is required
- `description` must be at least 20 characters
- `status` must be `Pending`, `In Progress`, or `Completed`

### Update task status

```http
PUT /tasks/:id
```

Request body:

```json
{
  "status": "Completed"
}
```

### Delete task

```http
DELETE /tasks/:id
```

Deletes the selected task.

## Assumptions

- The app is for a single user, so authentication is not included in the base version.
- JSON file storage is used instead of MySQL or MongoDB to keep the project runnable without extra installation.
- The API shape follows the assessment requirement exactly.

## Suggested Git Commits

```text
Initial project setup
Implemented task APIs
Added dashboard and task form UI
Integrated frontend with backend
Updated README
```
