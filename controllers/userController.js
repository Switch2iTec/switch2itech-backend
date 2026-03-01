const User = require("../models/user");

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const {role}=req.body;
        const {id}=req.params;
        const user=await User.findById(id).select("-password");;
        user.role=role;
        await user.save();
        res.json({status:"success",data:user,message:"Role updated successfully"})
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Get all users (with filters)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ status: "success", data: users });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        res.status(200).json({ status: "success", data: user });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Update user profile (details, password, profile picture)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        const { name, phoneNo, company, address, skills, password } = req.body;

        if (name) user.name = name;
        if (phoneNo) user.phoneNo = phoneNo;
        if (company) user.company = company;
        if (address) user.address = address;
        
        if (skills) {
            try {
                // Try parsing JSON first
                if (typeof skills === 'string') {
                    const parsed = JSON.parse(skills);
                    user.skills = Array.isArray(parsed) ? parsed : [skills];
                } else {
                    user.skills = Array.isArray(skills) ? skills : [skills];
                }
            } catch (e) {
                // If parsing fails, fall back to simple string split
                user.skills = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
            }
        }
        
        if (password) {
            user.password = password; // Hashed by pre-save hook
        }

        if (req.file) {
            user.profile = req.file.path; // URL from Cloudinary
        }

        await user.save();

        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.status(200).json({ status: "success", data: updatedUser, message: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};
