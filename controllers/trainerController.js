const users = require("../models/userModel")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");



exports.login = async (req, res) => {
          const { email, password } = req.body;

          try {


                    // Check if the user exists and is an trainer
                    const user = await users.findOne({ email: email, isTrainer: 1 });
                    if (!user) {
                              return res.status(400).json({ message: "No Trainer found" });
                    }

                    // Validate password
                    const passwordVerify = await bcrypt.compare(password, user.password);
                    if (!passwordVerify) {
                              return res.status(400).json({ message: "Invalid password" });
                    }

                    // Generate access and refresh tokens
                    const token = jwt.sign(
                              { email: user.email, isTrainer: user.isTrainer },
                              process.env.TRAINER_ACCESS_TOKEN_KEY,
                              { expiresIn: '2h' }
                    );

                    const refreshToken = jwt.sign(
                              { email: user.email, isTrainer: user.isTrainer },
                              process.env.TRAINER_ACCESS_TOKEN_KEY,
                              { expiresIn: '7d' }
                    );
                    //          console.log("Acess Tokens:",token)
                    //          console.log("refresh token:",refreshToken)
                    // Set the refresh token in a cookie
                    res.cookie('refreshToken', refreshToken, {
                              httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
                              secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    });

                    // Respond with the access token and user details
                    return res.status(200).json({
                              message: 'Trainer logged in successfully',
                              token,
                              user: {
                                        id: user._id,
                                        email: user.email,
                                        name: user.name,
                                        isTrainer: user.isTrainer,
                              },
                    });
          } catch (error) {
                    console.error('Trainer login failed:', error);
                    return res.status(500).json({ message: "Internal Server Error" });
          }
};