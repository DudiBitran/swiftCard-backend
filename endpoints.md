# Swift Card API Endpoints

---

## Authentication Endpoints

| URL                  | Method | Authorization | Description                        | Notes                                  | Response                   |
|----------------------|--------|---------------|----------------------------------|----------------------------------------|----------------------------|
| `/swift-card/users`       | POST   | Public        | Register a new user              | Validates input, hashes password       | User info (name, email, _id) |
| `/swift-card/users/login` | POST   | Public        | User login                      | Validates credentials, returns JWT     | JWT token and user info     |

---

## Users Endpoints

| URL                        | Method | Authorization                    | Description                              | Notes                                                      | Response                    |
|----------------------------|--------|---------------------------------|------------------------------------------|------------------------------------------------------------|-----------------------------|
| `/swift-card/users/:id`         | GET    | Authenticated (owner or admin) | Get user by ID                          | Only owner or admin can access                              | User document               |
| `/swift-card/users`             | GET    | Authenticated (admin only)      | Get all users                          | Only admins can access, error if no users                  | Array of users              |
| `/swift-card/users/:id`         | PUT    | Authenticated (owner only)      | Update user by ID                      | Validates input, only user owner can update                | Updated user document       |
| `/swift-card/users/:id`         | PATCH  | Authenticated (owner only)      | Toggle user's business status (`isBusiness`) | Only owner can toggle                                      | Updated user document       |
| `/swift-card/users/:id`         | DELETE | Authenticated (owner or admin)  | Delete user by ID                     | Owner or admin only                                         | Deleted user document       |

---

## Cards Endpoints

| URL                                    | Method | Authorization                | Description                             | Notes                                          | Response                        |
|---------------------------------------|--------|------------------------------|---------------------------------------|------------------------------------------------|--------------------------------|
| `/swift-card/cards`                   | POST   | Authenticated, business users | Create a new card                     | Input validation, generates unique biz number | The created card               |
| `/swift-card/cards`                   | GET    | Public                       | Get all cards                        | Returns error if no cards found                 | Array of cards                 |
| `/swift-card/cards/my-cards`          | GET    | Authenticated                | Get cards belonging to the current user | Returns error if user has no cards              | Array of user's cards          |
| `/swift-card/cards/:id`               | GET    | Public                       | Get a card by ID                    | Returns error if card not found                  | Single card                   |
| `/swift-card/cards/:id`               | PUT    | Authenticated, card owner    | Update a card by ID                 | Validates input, only card owner can update     | Updated card                  |
| `/swift-card/cards/:id`               | PATCH  | Authenticated                | Add or remove a like on a card     | If user liked, removes like; else adds          | Card with updated likes       |
| `/swift-card/cards/:id`               | DELETE | Authenticated, card owner    | Delete a card by ID                 | Only card owner can delete the card              | Deleted card                 |
| `/swift-card/cards/biz-number/:id`    | PATCH  | Authenticated, admin only    | Update business number of a card   | Only admin can update biz number                  | Card with updated business number |

---

## Notes:

- `AuthMw` = Authentication middleware verifying logged-in user.
- `Business users` are users with `isBusiness` property set to true.
- `Card owner` means the user who created the card (`user_id` field).
- Business number (`bizNumber`) must be unique across cards.
- Validation errors respond with status 400 and validation messages.
- Unauthorized access responds with status 400 and "Access denied" message.
- Not found responses use status 400 and appropriate messages like "No card found."
- Passwords are hashed before storage.
- Users can only update or delete their own accounts unless admin.
- Admins can access all users and update business numbers on cards.

---
