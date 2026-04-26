# Blood Donation Network API - Complete Documentation

## 📚 Table of Contents

1. [Authentication](#authentication)
2. [Blood Requests](#blood-requests)
3. [Blood Inventory](#blood-inventory)
4. [Emergency Alerts](#emergency-alerts)
5. [Donors](#donors)
6. [Real-time Features](#real-time-features)
7. [Error Handling](#error-handling)

---

## Authentication

### OAuth Providers

The API supports authentication via Google, GitHub, and Apple OAuth.

#### Google OAuth

```
GET /api/auth/oauth/google
```

Initiates Google OAuth flow.

**Redirect to**: `/auth/google/callback` → Front end receives token

#### GitHub OAuth

```
GET /api/auth/oauth/github
```

Initiates GitHub OAuth flow.

**Redirect to**: `/auth/github/callback` → Front end receives token

#### Apple OAuth

```
GET /api/auth/oauth/apple
```

Initiates Apple OAuth flow.

**Redirect to**: `/auth/apple/callback` → Front end receives token

### Register (Traditional)

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919999999999",
  "password": "securePass123!",
  "bloodGroup": "O+",
  "role": "donor",
  "location": {
    "text": "New Delhi",
    "lat": 28.7041,
    "lng": 77.1025
  }
}
```

**Response** (201):

```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "bloodGroup": "O+",
    "trustScore": "new",
    "otp": "123456"
  },
  "mockOtp": "123456"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePass123!"
}
```

**Response** (200):

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Verify OTP

```http
POST /api/auth/verify-otp
Authorization: Bearer {token}
Content-Type: application/json

{
  "otp": "123456"
}
```

### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer {token}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919999999999",
    "bloodGroup": "O+",
    "trustScore": "trusted",
    "emailVerified": true,
    "phoneVerified": true,
    "successfulDonations": 5,
    "donorRating": 4.8
  }
}
```

---

## Blood Requests

### Create Request

```http
POST /api/requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "bloodGroup": "O+",
  "message": "Emergency surgery needed, O+ blood required urgently at Apollo Hospital",
  "location": {
    "text": "Apollo Hospital, New Delhi",
    "lat": 28.5355,
    "lng": 77.3910
  },
  "unitsNeeded": 2,
  "patientName": "Raj Kumar"
}
```

**Response** (201):

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "bloodGroup": "O+",
    "message": "Emergency surgery needed...",
    "priorityLevel": "HIGH",
    "riskLevel": "SAFE",
    "trustScore": "trusted",
    "status": "active",
    "respondedDonors": [],
    "createdAt": "2026-04-25T10:30:00Z"
  }
}
```

### Get All Requests

```http
GET /api/requests?page=1&limit=20&bloodGroup=O%2B&sort=-createdAt
```

**Query Parameters**:

| Parameter  | Type   | Description                  |
| ---------- | ------ | ---------------------------- |
| page       | number | Page number (default: 1)     |
| limit      | number | Items per page (default: 20) |
| bloodGroup | string | Filter by blood group        |
| status     | string | active/fulfilled/expired     |
| sort       | string | Sort field                   |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "bloodGroup": "O+",
      "message": "...",
      "priorityLevel": "HIGH",
      "status": "active",
      "respondedDonors": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}
```

### Respond to Request (Donor)

```http
POST /api/requests/{requestId}/respond
Authorization: Bearer {token}
```

**Response**:

```json
{
  "success": true,
  "message": "Response recorded successfully",
  "data": {
    "requestId": "507f1f77bcf86cd799439012",
    "donorId": "507f1f77bcf86cd799439011",
    "status": "accepted"
  }
}
```

### Mark Request Fulfilled

```http
POST /api/requests/{requestId}/fulfill
Authorization: Bearer {token}
Content-Type: application/json

{
  "unitsReceived": 2,
  "donorsParticipated": ["donorId1", "donorId2"]
}
```

---

## Blood Inventory

### Get Inventory Summary

```http
GET /api/inventory/summary/{facilityId}
Authorization: Bearer {token}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "facility": "City Blood Bank",
    "total": 287,
    "byBloodGroup": [
      {
        "bloodGroup": "O+",
        "available": 45,
        "reserved": 8,
        "threshold": 20,
        "status": "OK"
      },
      {
        "bloodGroup": "AB-",
        "available": 3,
        "reserved": 0,
        "threshold": 10,
        "status": "CRITICAL"
      }
    ]
  }
}
```

### Check Critical Stock

```http
GET /api/inventory/critical/{facilityId}
Authorization: Bearer {token}
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "bloodGroup": "AB-",
      "unitsAvailable": 3,
      "minimumThreshold": 10
    }
  ],
  "hasAlert": true
}
```

### Update Inventory

```http
POST /api/inventory/update/{facilityId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "bloodGroup": "O+",
  "units": 5,
  "type": "donation"
}
```

**Types**: `donation`, `dispensed`, `expired`, `damaged`, `restock`

### Search Nearby Blood

```http
POST /api/inventory/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "bloodGroup": "O+",
  "lat": 28.7041,
  "lng": 77.1025,
  "radiusKm": 15
}
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "facility": "City Blood Bank",
      "total": 287,
      "distance": "2.5 km",
      "byBloodGroup": [...]
    }
  ]
}
```

---

## Emergency Alerts

### Create Emergency Alert

```http
POST /api/emergency-alerts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Critical Blood Shortage - O+ Blood Needed",
  "description": "Major accident with 20 causalities, urgent need for O+ blood at City Hospital",
  "type": "disaster",
  "severity": "critical",
  "location": {
    "address": "City Hospital",
    "city": "New Delhi",
    "state": "Delhi",
    "lat": 28.5355,
    "lng": 77.3910,
    "radiusKm": 25
  },
  "bloodRequirements": [
    {
      "bloodGroup": "O+",
      "unitsNeeded": 30
    },
    {
      "bloodGroup": "B+",
      "unitsNeeded": 20
    }
  ],
  "contactPersonName": "Dr. Sharma",
  "contactPersonPhone": "+919876543210"
}
```

**Response** (201):

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Critical Blood Shortage...",
    "status": "active",
    "severity": "critical",
    "responses": [],
    "notificationsSent": 0
  }
}
```

### Get Active Alerts

```http
GET /api/emergency-alerts/active
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Critical Blood Shortage...",
      "severity": "critical",
      "status": "active",
      "stats": {
        "totalResponses": 45,
        "acceptedResponses": 38,
        "completedResponses": 12,
        "progress": {
          "total": 50,
          "received": 25,
          "percentage": 50,
          "isFulfilled": false
        }
      }
    }
  ]
}
```

### Get Nearby Alerts

```http
POST /api/emergency-alerts/nearby
Authorization: Bearer {token}
Content-Type: application/json

{
  "lat": 28.7041,
  "lng": 77.1025,
  "radiusKm": 50
}
```

### Respond to Emergency Alert

```http
POST /api/emergency-alerts/{alertId}/respond
Authorization: Bearer {token}
Content-Type: application/json

{
  "bloodGroup": "O+",
  "unitsOffered": 2
}
```

### Resolve Alert

```http
POST /api/emergency-alerts/{alertId}/resolve
Authorization: Bearer {token}
```

---

## Donors

### Get Donor Profile

```http
GET /api/donors/{donorId}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "picture": "https://...",
    "bloodGroup": "O+",
    "trustScore": "trusted",
    "successfulDonations": 5,
    "donorRating": 4.8,
    "lastDonationDate": "2026-03-25",
    "location": {
      "text": "New Delhi",
      "lat": 28.7041,
      "lng": 77.1025
    }
  }
}
```

### Search Donors

```http
GET /api/donors/search?bloodGroup=O%2B&lat=28.7041&lng=77.1025&radiusKm=10&available=true
```

**Query Parameters**:

| Parameter  | Type    | Description           |
| ---------- | ------- | --------------------- |
| bloodGroup | string  | Blood group to search |
| lat        | number  | Latitude              |
| lng        | number  | Longitude             |
| radiusKm   | number  | Search radius in km   |
| available  | boolean | Only available donors |
| minRating  | number  | Minimum rating (0-5)  |

---

## Real-time Features

### Socket.io Events

Connect to Socket.io at the WebSocket endpoint:

```javascript
import io from 'socket.io-client'

const socket = io('http://localhost:5000', {
  extraHeaders: {
    Authorization: `Bearer ${token}`,
  },
})

// Join user room
socket.emit('join-room', userId)
```

### Available Events

#### Listen for Emergency Alerts

```javascript
socket.on('emergency-alert', (data) => {
  console.log('New emergency alert:', data)
  // { id, title, severity, location }
})
```

#### Listen for New Blood Requests

```javascript
socket.on('new-request', (request) => {
  console.log('New blood request:', request)
})
```

#### Listen for Alert Responses

```javascript
socket.on('alert-response', (data) => {
  console.log('Donor responded:', data)
  // { alertId, respondent, bloodGroup, units }
})
```

#### Listen for Alert Resolution

```javascript
socket.on('alert-resolved', (data) => {
  console.log('Alert resolved:', data)
})
```

#### Receive Notifications

```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification)
  // { title, message, type, read, createdAt }
})
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

### Common HTTP Status Codes

| Status | Meaning               |
| ------ | --------------------- |
| 200    | OK                    |
| 201    | Created               |
| 400    | Bad Request           |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 404    | Not Found             |
| 429    | Too Many Requests     |
| 500    | Internal Server Error |

### Rate Limiting

- Global: 200 requests per 15 minutes
- Auth: 30 requests per 15 minutes

**Rate Limit Headers**:

```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 1682072400
```

---

## Authentication

All protected endpoints require:

```http
Authorization: Bearer {token}
```

**Token Format**: JWT with 7-day expiry

---

## Testing

### cURL Examples

#### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePass123!"
  }'
```

#### Create Request

```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "bloodGroup": "O+",
    "message": "Emergency surgery needed",
    "unitsNeeded": 2,
    "location": {
      "text": "City Hospital"
    }
  }'
```

---

## Pagination

Standard pagination format:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

---

## Version

Current API Version: **v2.0.0**

Last Updated: 2026-04-25
