# AWD_project
```markdown
# Mobile Post Office RESTful API

This project is a RESTful API built with Node.js and MySQL for managing Mobile Post Office data in Hong Kong, as part of the Advanced Web Development coursework. It retrieves and manipulates data from the [Hong Kong Data Portal](https://portal.csdi.gov.hk/geoportal/?datasetId=hkpo_rcd_1638773566771_76062&lang=en), supporting CRUD operations (Create, Read, Update, Delete) and serving JSON responses for client applications.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation](#installation)
5. [API Endpoints](#api-endpoints)
6. [Testing with Postman](#testing-with-postman)
7. [Database Schema](#database-schema)
8. [Future Improvements](#future-improvements)
9. [License](#license)

## Project Overview
This project fulfills the requirements of the Advanced Web Development coursework (UWE/SHAPE BScIT). It includes:
- **Part 1 (Data Conversion)**: Migrates JSON data from data.gov.hk into a MySQL database.
- **Part 2 (RESTful Web Services)**: Implements CRUD APIs using Node.js, returning JSON responses with proper error handling.
- Future parts (not yet implemented) will include an Angular client, testing, and detailed documentation.

The API supports querying Mobile Post Office records by district, ID, and other parameters, as well as creating, updating, and deleting records.

## Features
- Retrieve Mobile Post Office records by district (e.g., `Tuen Mun`) or ID.
- Create new records with JSON input.
- Update existing records by ID.
- Delete records by ID.
- Error handling with JSON responses (e.g., `{ "success": false, "err_code": "1001", "err_msg": "Missing district parameter" }`).
- UTF-8 support for Traditional/Simplified Chinese and English.

## Tech Stack
- **Backend**: Node.js (ES Modules, no high-level frameworks)
- **Database**: MySQL (via XAMPP)
- **Dependencies**: `mysql2` (database connection), `express` (minimal routing)
- **Testing**: Postman for API testing
- **Development Environment**: XAMPP (MySQL), Visual Studio Code

## Installation
### Prerequisites
- Node.js (v18 or higher)
- XAMPP (for MySQL)
- Postman (for API testing)
- Git (optional, for cloning)

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/mobile-post-office-api.git
   cd mobile-post-office-api
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up MySQL Database**:
   - Install and start XAMPP, enable MySQL.
   - Open phpMyAdmin (`http://localhost/phpmyadmin`) and create a database:
     ```sql
     CREATE DATABASE mobile_post_office CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   - Create the table:
     ```sql
     USE mobile_post_office;
     CREATE TABLE mobile_post_offices (
         id INT AUTO_INCREMENT PRIMARY KEY,
         mobile_code VARCHAR(10),
         location_tc VARCHAR(255),
         location_sc VARCHAR(255),
         location_en VARCHAR(255),
         address_tc TEXT,
         address_sc TEXT,
         address_en TEXT,
         name_tc VARCHAR(255),
         name_sc VARCHAR(255),
         name_en VARCHAR(255),
         district_tc VARCHAR(100),
         district_sc VARCHAR(100),
         district_en VARCHAR(100),
         latitude DECIMAL(10,6),
         longitude DECIMAL(10,6),
         open_hour VARCHAR(10),
         close_hour VARCHAR(10),
         day_of_week_code INT,
         seq INT,
         last_update_date VARCHAR(20)
     ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```

4. **Migrate Data**:
   - Place `mobile-office.json` in the project root.
   - Run the migration script:
     ```bash
     node migrateData.mjs
     ```
   - Verify data in phpMyAdmin: `SELECT * FROM mobile_post_offices LIMIT 10;`

5. **Start the Server**:
   ```bash
   node server.mjs
   ```
   The server runs on `http://localhost:8888`.

## API Endpoints
All responses are in JSON format. Errors return `{ success: false, err_code, err_msg }`.

| Method | Endpoint | Description | Parameters | Example Response |
|--------|----------|-------------|------------|------------------|
| GET | `/mobilepost?district={district_en}` | Retrieve records by district | `district` (query) | `{ "success": true, "result": [{...}], "message": "X records retrieved" }` |
| GET | `/mobilepost/:id` | Retrieve a record by ID | `id` (path) | `{ "success": true, "result": {...} }` |
| POST | `/mobilepost` | Create a new record | JSON body (e.g., `{ "mobile_code": "4", "location_en": "Test Location", ... }`) | `{ "success": true, "message": "New record created", "id": X }` |
| PUT | `/mobilepost/:id` | Update a record | `id` (path), JSON body | `{ "success": true, "message": "Record updated" }` |
| DELETE | `/mobilepost/:id` | Delete a record | `id` (path) | `{ "success": true, "message": "Record deleted" }` |

### Error Codes
- `1000`: Database connection error
- `1001`: Missing required parameter
- `1002`: SQL execution error
- `1003`: Record not found
- `1004`: Missing required fields in body

## Testing with Postman
1. **Setup**:
   - Install Postman (https://www.postman.com/downloads/).
   - Create a new collection named "Mobile Post Office API".

2. **Test GET (by district)**:
   - Method: GET
   - URL: `http://localhost:8888/mobilepost?district=Tuen Mun`
   - Expected: 200, JSON array of records.

3. **Test GET (by ID)**:
   - Method: GET
   - URL: `http://localhost:8888/mobilepost/1`
   - Expected: 200, single record JSON.

4. **Test POST**:
   - Method: POST
   - URL: `http://localhost:8888/mobilepost`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "mobile_code": "4",
       "location_en": "Test Location",
       "district_en": "Kwun Tong",
       "address_en": "Test Address",
       "name_en": "Mobile Post Offices 4",
       "latitude": 22.123456,
       "longitude": 114.123456,
       "open_hour": "09:00",
       "close_hour": "17:00",
       "day_of_week_code": 1,
       "seq": 1
     }
     ```
   - Expected: 200, `{ "success": true, "message": "New record created", "id": X }`.

5. **Test PUT**:
   - Method: PUT
   - URL: `http://localhost:8888/mobilepost/1`
   - Headers: `Content-Type: application/json`
   - Body: `{ "location_en": "Updated Location" }`
   - Expected: 200, `{ "success": true, "message": "Record updated" }`.

6. **Test DELETE**:
   - Method: DELETE
   - URL: `http://localhost:8888/mobilepost/1`
   - Expected: 200, `{ "success": true, "message": "Record deleted" }`.

7. **Error Testing**:
   - GET with missing district: `http://localhost:8888/mobilepost`
     - Expected: 400, `{ "success": false, "err_code": "1001", "err_msg": "Missing district parameter" }`.
   - POST with missing fields: `{ "location_en": "Test" }`
     - Expected: 400, `{ "success": false, "err_code": "1004", "err_msg": "Missing required fields" }`.

## Database Schema
The `mobile_post_offices` table stores Mobile Post Office data with the following fields:
- `id`: Auto-incremented primary key
- `mobile_code`, `location_tc/sc/en`, `address_tc/sc/en`, `name_tc/sc/en`, `district_tc/sc/en`: VARCHAR/TEXT for multilingual support
- `latitude`, `longitude`: DECIMAL for geolocation
- `open_hour`, `close_hour`: VARCHAR for time
- `day_of_week_code`, `seq`: INT for scheduling
- `last_update_date`: VARCHAR for data freshness

## Future Improvements
- Add Angular client for a user-friendly interface (Part 3).
- Implement advanced filtering (e.g., by `day_of_week_code` or proximity).
- Optimize database with indexes for faster queries.
- Enhance security with input validation and authentication.

## License
MIT License. See [LICENSE](LICENSE) for details.
```
