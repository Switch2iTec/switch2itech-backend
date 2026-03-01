const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/restrictTo");

const { upload } = require("../config/cloudinary");

// All user routes require authentication
router.use(protect);

// Route for updating own profile
router.put("/profile", upload.single("profile"), userController.updateProfile);

// GET /api/users?role=developer   — Admin or Manager only
// Returns all users, optionally filtered by ?role= query param
router.get("/", userController.getUsers);

// Routes for a specific user by ID
router
    .route("/:id")
    .get(userController.getUserById)                          // any authenticated user
    .patch(restrictTo("admin"), userController.updateUserRole); // admin only

module.exports = router;


