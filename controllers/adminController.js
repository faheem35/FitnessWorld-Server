const users = require("../models/userModel")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const workouts = require("../models/workoutModel");


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {


        // Check if the user exists and is an admin
        const user = await users.findOne({ email: email, isAdmin: 1 });
        if (!user) {
            return res.status(400).json({ message: "No admin found" });
        }

        // Validate password
        const passwordVerify = await bcrypt.compare(password, user.password);
        if (!passwordVerify) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Generate access and refresh tokens
        const token = jwt.sign(
            { email: user.email, isAdmin: user.isAdmin },
            process.env.ADMIN_ACCESS_TOKEN_KEY,
            { expiresIn: '2h' }
        );

        const refreshToken = jwt.sign(
            { email: user.email, isAdmin: user.isAdmin },
            process.env.ADMIN_REFRESH_TOKEN_KEY,
            { expiresIn: '7d' }
        );
        //  console.log("Acess Tokens:",token)
        //  console.log("refresh token:",refreshToken)
        // Set the refresh token in a cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Respond with the access token and user details
        return res.status(200).json({
            message: 'Admin logged in successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        console.error('Admin login failed:', error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.fetchUser = async (req, res) => {
    try {
        const allUsers = await users.find();
        console.log(allUsers);
        res.status(200).json({ message: 'Users fetched', allUsers });
    } catch (error) {
        console.error('Error while fetching users:', error.message);
        res.status(400).json({ message: 'Failed to fetch the users list' });
    }
};


exports.editUser = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      const updatedUser = await users.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(400).json({ message: 'User not found or update failed' });
      }
  
      res.status(200).json({ message: 'User status updated', updatedUser });
    } catch (error) {
      console.error('Error while updating user status:', error.message);
      res.status(500).json({ message: 'Server Error: Unable to update user status' });
    }
  };



  



