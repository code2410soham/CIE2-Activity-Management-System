# API Documentation

This document describes the REST API endpoints provided by the **CIE2-Activity-Management-System** backend services.

## Base URL
In development: `http://localhost:5000/api/v1`

---

## 1. Authentication Module

### Register User
*   **Method**: `POST`
*   **Path**: `/auth/register`
*   **Body**:
    ```json
    {
      "username": "alexrivera",
      "email": "alex.rivera@college.edu",
      "password": "strongPassword123",
      "role": "student"
    }
    ```
*   **Success Response**: `201 Created`

### Login User
*   **Method**: `POST`
*   **Path**: `/auth/login`
*   **Success Response**: `200 OK` (returns JWT Token)

---

## 2. Activities Module

### List Activities
*   **Method**: `GET`
*   **Path**: `/activities`
*   **Success Response**: `200 OK`

### Create Activity
*   **Method**: `POST`
*   **Path**: `/activities`
*   **Body**:
    ```json
    {
      "title": "Lab 5: Search Algorithms",
      "description": "Implement Binary Search and interpolation search",
      "type": "lab",
      "maxMarks": 20,
      "deadline": "2026-11-01T23:59:59Z"
    }
    ```
*   **Success Response**: `201 Created`

---

## 3. Submissions Module

### Submit Activity Deliverable
*   **Method**: `POST`
*   **Path**: `/submissions`
*   **Body**:
    ```json
    {
      "activityId": "act-1",
      "studentId": "usr-student-1",
      "filePath": "uploads/submissions/sub-101.zip"
    }
    ```
*   **Success Response**: `201 Created`

### Evaluate Submission
*   **Method**: `PUT`
*   **Path**: `/submissions/:id/evaluate`
*   **Body**:
    ```json
    {
      "marks": 18,
      "feedback": "Code style matches the constraints. Excellent."
    }
    ```
*   **Success Response**: `200 OK`
