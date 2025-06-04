# Swift Card

Swift Card is a modern business card management application designed to simplify the way users create, share, and interact with digital business cards. This project serves as a full-stack demonstration of my skills in building secure, scalable, and user-friendly web applications.

## Project Overview

Swift Card enables users to register and login securely, create and manage their own digital business cards, and interact with others through likes and business networking features. The app distinguishes between regular users and business users, with enhanced capabilities for business users to generate official business cards with unique business numbers.

## Key Features

- **User Authentication & Authorization**  
  Secure registration and login system with hashed passwords and JWT-based authentication. Role-based permissions to differentiate between regular users, business users, and admins.

- **Business Card Management**  
  Business users can create, update, and delete business cards. Each card includes unique business numbers generated automatically to ensure uniqueness.

- **Likes System**  
  Users can like or unlike cards, allowing interactive engagement within the community.

- **User Roles & Access Control**  
  Admins have elevated privileges including access to all users and the ability to update business numbers on cards.

- **Robust Validation & Error Handling**  
  Input validation using Joi ensures data integrity. Detailed error messages and logging provide clear feedback for both users and developers.

- **Logging**  
  Comprehensive logging of key operations and errors to a file for monitoring and debugging purposes.

## Technology Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB with Mongoose ODM  
- **Authentication:** JSON Web Tokens (JWT), bcrypt for password hashing  
- **Validation:** Joi for request validation  
- **Logging:** Custom file-based logger  
- **Utilities:** Lodash for data manipulation

## API Endpoints

The application exposes a RESTful API with endpoints for user management, authentication, and card management. These endpoints enforce strict access control and validation to ensure security and data consistency.

## Why Swift Card?

This project highlights my ability to build full-stack applications with a focus on:

- Security best practices (authentication, authorization, data validation)
- Clean and maintainable code architecture
- Practical use of modern Node.js libraries and tools
- Attention to detail with robust error handling and logging
- Building user-centric features that promote engagement and usability

## How to Run


1. Clone the repository:  
   `git clone https://github.com/DudiBitran/swiftCard-backend.git`  
2. Navigate into the project folder:  
   `cd swiftCard-backend`  
3. Navigate into the backend folder:  
   `cd swiftcard_Backend`  
4. Install dependencies:  
   `npm install`  
5. Check the `.env.example` file to configure database connection  
6. Run `npm run data` to load the initial data  
7. Run `npm run dev` to start the server with nodemon  

---

Thank you for reviewing my project. Feel free to explore the code and reach out for any questions or collaboration opportunities.
