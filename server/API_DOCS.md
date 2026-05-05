# EduGenius Backend — API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All protected routes require a JWT Bearer token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | API health check |

**Response:**
```json
{ "success": true, "message": "EduGenius API is running" }
```

---

## Auth

### POST `/api/auth/register`
**Auth:** None

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"  // "student" | "instructor" (default: "student")
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "token": "jwt_token_here"
  }
}
```

---

### POST `/api/auth/login`
**Auth:** None

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "token": "jwt_token_here"
  }
}
```

---

### GET `/api/auth/me`
**Auth:** Bearer Token

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "enrolledCourses": [{ "_id": "...", "title": "...", "thumbnail": "..." }]
  }
}
```

---

## Courses

### POST `/api/courses`
**Auth:** Bearer Token (Instructor only)
**Content-Type:** `multipart/form-data` (if uploading thumbnail)

| Field | Type | Required |
|-------|------|----------|
| title | string | Yes |
| description | string | Yes |
| thumbnail | file (image) | No |

**Response (201):**
```json
{
  "success": true,
  "data": { "_id": "...", "title": "...", "description": "...", "thumbnail": "...", "instructor": "...", "modules": [] }
}
```

---

### GET `/api/courses`
**Auth:** None

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [{ "_id": "...", "title": "...", "instructor": { "name": "...", "email": "..." }, "modules": [] }]
}
```

---

### GET `/api/courses/:id`
**Auth:** None — Returns fully populated course with modules → lessons → quizzes

---

### PUT `/api/courses/:id`
**Auth:** Bearer Token (Instructor, course owner only)

| Field | Type | Required |
|-------|------|----------|
| title | string | No |
| description | string | No |
| thumbnail | file | No |

---

### DELETE `/api/courses/:id`
**Auth:** Bearer Token (Instructor, course owner only) — Cascade deletes all modules, lessons, and quizzes

---

## Modules

### POST `/api/modules/:courseId`
**Auth:** Bearer Token (Instructor, course owner)

**Request Body:**
```json
{ "title": "Module 1: Introduction", "order": 0 }
```

**Response (201):**
```json
{ "success": true, "data": { "_id": "...", "courseId": "...", "title": "...", "order": 0, "lessons": [] } }
```

---

### PUT `/api/modules/:id`
**Auth:** Bearer Token (Instructor)

**Request Body:**
```json
{ "title": "Updated Title", "order": 1 }
```

---

### DELETE `/api/modules/:id`
**Auth:** Bearer Token (Instructor) — Cascade deletes lessons and quizzes

---

## Lessons

### POST `/api/lessons/:moduleId`
**Auth:** Bearer Token (Instructor)
**Content-Type:** `multipart/form-data` (if uploading video)

| Field | Type | Required |
|-------|------|----------|
| title | string | Yes |
| content | string | No |
| video | file (video) | No |
| duration | number | No |
| transcript | string | No |
| summary | string | No |
| keyPoints | string[] | No |
| flashcards | [{question, answer}] | No |

**Response (201):**
```json
{
  "success": true,
  "data": { "_id": "...", "moduleId": "...", "title": "...", "videoUrl": "...", "content": "...", "duration": 10, "quizzes": [], "flashcards": [] }
}
```

---

### PUT `/api/lessons/:id`
**Auth:** Bearer Token (Instructor) — Same fields as POST, all optional

---

### DELETE `/api/lessons/:id`
**Auth:** Bearer Token (Instructor) — Also deletes associated quizzes

---

## Quizzes

### POST `/api/quizzes/:lessonId`
**Auth:** Bearer Token (Instructor)

**Request Body:**
```json
{
  "questions": [
    {
      "question": "What is Node.js?",
      "options": ["Runtime", "Database", "Language", "Framework"],
      "correctAnswer": "Runtime"
    }
  ],
  "difficulty": "medium"
}
```

**Response (201):**
```json
{ "success": true, "data": { "_id": "...", "lessonId": "...", "questions": [...], "difficulty": "medium" } }
```

---

### GET `/api/quizzes/lesson/:lessonId`
**Auth:** Bearer Token — Returns all quizzes for a lesson

---

### POST `/api/quizzes/:id/submit`
**Auth:** Bearer Token

**Request Body:**
```json
{ "answers": ["Runtime", "NoSQL DB"] }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "score": 100,
    "correct": 2,
    "total": 2,
    "results": [
      { "question": "...", "yourAnswer": "...", "correctAnswer": "...", "isCorrect": true }
    ]
  }
}
```

---

## Progress

### POST `/api/progress/enroll/:courseId`
**Auth:** Bearer Token (Student only)

**Response (201):**
```json
{ "success": true, "message": "Enrolled successfully", "data": { "userId": "...", "courseId": "...", "state": "learning" } }
```

---

### PUT `/api/progress/:courseId`
**Auth:** Bearer Token

**Request Body:**
```json
{ "lessonId": "...", "state": "revising" }
```

**Response (200):** Updated progress with completedLessons, currentLesson, state

---

### GET `/api/progress/:courseId`
**Auth:** Bearer Token

**Response (200):** Progress with populated courseId, currentLesson, completedLessons

---

## Certificates

### POST `/api/certificates/:courseId`
**Auth:** Bearer Token — Course must be completed (`state: completed`)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "certificateId": "uuid",
    "studentName": "...",
    "courseTitle": "...",
    "issuedAt": "2026-04-30T...",
    "certificateUrl": "https://edugenius.app/certificates/..."
  }
}
```

---

### GET `/api/certificates/:courseId`
**Auth:** Bearer Token

**Response (200):** Certificate with populated userId and courseId

---

## Error Responses

All errors return:
```json
{
  "success": false,
  "message": "Error description",
  "stack": "..." // Only in development
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (wrong role or not owner) |
| 404 | Not Found |
| 500 | Internal Server Error |
