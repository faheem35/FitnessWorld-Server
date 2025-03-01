const users = require("../models/userModel")
const otps = require("../models/otpModel")
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");



const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationMail = async (email, otp) => {
  try {
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
              user: process.env.NODEMAILER_EMAIL,
              pass: process.env.NODEMAILER_PASSWORD,
          },
      });

      const emailTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      color: #333333;
                  }
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      background-color: #ffffff;
                  }
                  .header {
                      text-align: center;
                      padding: 20px 0;
                      background-color: #FDF2F8;
                  }
                  .logo {
                      font-size: 24px;
                      color: #BE185D;
                      font-weight: bold;
                  }
                  .content {
                      padding: 30px 20px;
                      text-align: center;
                  }
                  .otp-code {
                      font-size: 32px;
                      font-weight: bold;
                      color: #BE185D;
                      letter-spacing: 5px;
                      margin: 20px 0;
                  }
                  .message {
                      margin: 20px 0;
                      color: #666666;
                  }
                  .footer {
                      text-align: center;
                      padding: 20px;
                      font-size: 12px;
                      color: #999999;
                      border-top: 1px solid #eeeeee;
                  }
                  .note {
                      font-size: 13px;
                      color: #666666;
                      font-style: italic;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <div class="logo">Fitness World</div>
                  </div>
                  <div class="content">
                      <h2>Verify Your Email Address</h2>
                      <p class="message">Thank you for choosing Fitness World! To complete your registration, please use the verification code below:</p>
                      <div class="otp-code">${otp}</div>
                      <p class="message">This code will expire in 10 minutes.</p>
                      <p class="note">If you didn't request this verification code, please ignore this email.</p>
                  </div>
                  <div class="footer">
                      <p>© ${new Date().getFullYear()} Fitness World. All rights reserved.</p>
                      <p>This is an automated message, please do not reply to this email.</p>
                  </div>
              </div>
          </body>
          </html>
      `;

      const info = await transporter.sendMail({
          from: {
              name: 'Fitness World',
              address: process.env.NODEMAILER_EMAIL
          },
          to: email,
          subject: 'Verify Your Email - Fitness World',
          text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
          html: emailTemplate,
      });

      return info.accepted.length > 0;
  } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
  }
};

const signUp = async (req, res) => {
  
  try {
      const { firstName, lastName, password, email, phoneNumber } = req.body;

      

      // Check if email already exists
      const isEmailExists = await users.findOne({ email });
      if (isEmailExists) {
          return res.status(409).json({ message: "User already exists" });
      }

      // Generate OTP
      const otp = generateOtp();

      // Send OTP via email
      const emailSent = await sendVerificationMail(email, otp);
      if (!emailSent) {
          return res.status(500).json({ message: "Failed to send verification email" });
      }

      // Hash the password and temporarily store user data along with OTP in the session

      const hashedPassword = await bcrypt.hash(password, 10);

      const otpEntry = new otps({
          email: email,
          otp: otp,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          password: hashedPassword, // Temporarily store password in case the OTP verification is successful
      });

      await otpEntry.save();
      
     
       

      return res.status(200).json({
          message: "User registered. OTP sent to email for verification",
          email,
          
      });
  } catch (error) {
      console.error('Sign Up Error:', error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

const resendOtp = async (req, res) => {
    try {
        // Retrieve the email from the request body
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required to resend OTP' });
        }

        // Generate a new OTP
        const newOtp = generateOtp();

        // Send the OTP to the user's email
        const emailSent = await sendVerificationMail(email, newOtp);

        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to resend OTP' });
        }

        // Update or insert the new OTP in the database
        const existingOtp = await otps.findOne({ email });
        if (existingOtp) {
            // Update the existing OTP
            existingOtp.otp = newOtp;
            existingOtp.createdAt = new Date();
            await existingOtp.save();
        } else {
            // Create a new OTP entry
            const otpEntry = new otps({
                email: email,
                otp: newOtp,
            });
            await otpEntry.save();
        }

        console.log('Resent OTP for email:', email);

        return res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Error resending OTP:', error);
        return res.status(500).json({ message: 'Error in resending OTP' });
    }
};


const otpVerification = async (req, res) => {
    
     const { otp, email } = req.body;
     
 
     try {
      
         const otpEntry = await otps.findOne({ email });
 
         if (!otpEntry || otpEntry.otp !== otp) {
             return res.status(400).json({ success: false, message: "Invalid OTP" });
         }
 
         const user = new users({
             firstName: otpEntry.firstName,
             lastName: otpEntry.lastName,
             email: otpEntry.email,
             phoneNumber: otpEntry.phoneNumber,
             password: otpEntry.password, // Password should already be hashed
             status: 'active',
             isAdmin: 0,
         });
         await user.save();
 
         // Delete the OTP entry after successful verification
         await otps.deleteOne({ email });
         return res.json({ success: true, message: "User created" });
     } catch (error) {
         console.error("Error during OTP verification:", error);
         return res.status(500).json({ success: false, message: "Server error" });
     }
 };
 
 const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);

    try {
        // Check the database for the user
        const user = await users.findOne({ email });
        console.log("User Found",user)

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if the user is inactive
        if (user.status === 'inactive') {
            return res.status(400).json({ message: "User is blocked by admin" });
        }

        if (user.isAdmin) {
            return res.status(403).json({ message: "Admins are not allowed to log in from this portal" });
        }

        let token, refreshToken;
        
        if (!user.googleId) {
           // console.log("Plaintext password:", password);
           // console.log("Stored hashed password:", user.password);
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log("Password Valid",isPasswordValid)
            if (!isPasswordValid) return res.status(400).json({ message: "Invalid password" });
            //console.log("Access Token Secret:", process.env.ACCESS_TOKEN_SECRET_KEY);
            //console.log("Refresh Token Secret:", process.env.REFRESH_TOKEN_SECRET_KEY);

            
            token = await jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });
            //console.log("Token generated:",token)
            refreshToken = await jwt.sign({ email: email }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '7d' });
            //console.log(" Referesh Token generated:",refreshToken)
        } 

        // Store the refresh token in an HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // Set to `true` in production with HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000 // Refresh token expires in 7 days
        });

        // Return the login response with the access token
        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                name: user.firstName + ' ' + user.lastName,
                email: user.email,
                profileImage: user.profileImage || null,
            },
            token, // Send access token as part of the response
        });

    } catch (error) {
        console.error("Login failed:", error.message);
        return res.status(500).json({ message: "Login failed" });
    }
};


// const googleLogin = async (req, res) => {
//     const { email, email_verified, firstName, lastName, id } = req.body;
  
//     try {
//       if (!email || !id) {
//         return res.status(400).json({ message: 'Missing required fields' });
//       }
  
//       // Check if the user already exists
//       let existingUser = await users.findOne({ email });
  
//       if (existingUser) {
//         // Generate Tokens
//         const token = jwt.sign(
//           { email: existingUser.email, id: existingUser._id },
//           process.env.ACCESS_TOKEN_SECRET_KEY,
//           { expiresIn: '1h' }
//         );
//         console.log("Token:",token)
  
//         const refreshToken = jwt.sign(
//           { email: existingUser.email, id: existingUser._id },
//           process.env.REFRESH_TOKEN_SECRET_KEY,
//           { expiresIn: '7d' }
//         );
//         console.log("Refresh Token:",refreshToken)
  
//         return res.status(200).json({
//           message: 'User logged in successfully',
//           user: existingUser,
//           token,
//           refreshToken,
//         });
//       }
  
//       // Create a new user if not exists
//       const newUser = new users({
//         firstName,
//         lastName,
//         email,
//         status: 'active',
//         googleId: id,
//         isAdmin: 0, 
//         GoogleVerified: email_verified,
//       });
  
//       // Save the new user to the database
//       const savedUser = await newUser.save();
  
//       const token = jwt.sign(
//         { email: savedUser.email, id: savedUser._id },
//         process.env.ACCESS_TOKEN_SECRET_KEY,
//         { expiresIn: '1h' }
//       );
  
//       const refreshToken = jwt.sign(
//         { email: savedUser.email, id: savedUser._id },
//         process.env.REFRESH_TOKEN_SECRET_KEY,
//         { expiresIn: '7d' }
//       );
  
//       return res.status(201).json({
//         message: 'User created successfully',
//         user: savedUser,
//         token,
//         refreshToken,
//       });
//     } catch (error) {
//       console.error('Error saving Google user:', error.message);
//       return res.status(500).json({ message: 'Internal Server Error' });
//     }
//   };

  //get all Workouts for user show
  
 

module.exports={
    signUp,
    resendOtp,
    otpVerification,
    login,
    // googleLogin,
   
    
    
  
  }
 