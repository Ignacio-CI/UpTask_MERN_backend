import User from '../models/User.js';
import generateId from '../helpers/generateId.js';
import generateJWT from '../helpers/generateJWT.js';
import { emailRegister, emailForgotPassword } from '../helpers/email.js'

// REGISTRATION
const registerUser = async (req, res) => {
    // Avoid duplicated registers
    const { email } = req.body;
    const duplicatedUser = await User.findOne({ email });

    if(duplicatedUser) {
        const error = new Error('User already exists');
        return res.status(400).json({ msg: error.message });
    }
    
    // Store User into the Database
    try {
        const user = new User(req.body);
        user.token = generateId();
        await user.save();

        // Send confirmation email
        emailRegister({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.json({ msg: 'Your account has been created successfully. Check your email and confirm your account' });
    } catch (error) {
        console.log(error);
    }
};

// AUTHENTICATION
const authenticateUser = async (req, res) => {
    // Verify is users exists
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // If user does not exist
    if(!user) {
        const error = new Error('The user does not exist');
        return res.status(404).json({ msg: error.message });
    }

    // Verify if user is confirmed
    if(!user.confirmed) {
        const error = new Error('Your account has not been confirmed');
        return res.status(404).json({ msg: error.message });
    }

    // Verify password
    if(await user.verifyPassword(password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateJWT(user._id)
        });
    } else {
        const error = new Error('The password is not correct');
        return res.status(404).json({ msg: error.message });
    }
};

// CONFIRMATION
const confirmUser = async (req, res) => {
    //console.log(req.params.token);
    const { token } = req.params
    const confirmUser = await User.findOne({ token });

    // If token is invalid
    if(!confirmUser) {
        const error = new Error('Invalid Token');
        return res.status(404).json({ msg: error.message }); 
    }

    try {
        confirmUser.confirmed = true;
        confirmUser.token = '';
        await confirmUser.save();
        res.json({ msg: 'User confirmed successfully!' })
    } catch (error) {
        console.log(error.message);
    }

    console.log(confirmUser);
};

// FORGOTTEN PASSWORD
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

    // If user does not exist
    if(!user) {
        const error = new Error('The user does not exist');
        return res.status(404).json({ msg: error.message });
    }

    try {
        user.token = generateId();
        await user.save();

        // Send Email to User
        emailForgotPassword({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.json({ msg: `An email with the instructions has been sent to ${email}. Please check your inbox.` })
    } catch (error) {
        console.log(error.message);
    }
};

// VERIFY USER WHEN FORGOT PASSWORD
const verifyToken = async (req, res) => {
  const { token } = req.params;

  const validToken = await User.findOne({ token });

  if(validToken) {
    res.json({ msg: 'Valid Token. User exists' });
  } else {
        const error = new Error('Invalid Token');
        return res.status(404).json({ msg: error.message });
  }
};

// RESET PASSWORD
const newPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ token });

  if(user) {
    user.password = password;
    user.token = '';
    try {
        await user.save();
        res.json({ msg: 'Your password has been modified successfully' });
    } catch (error) {
        console.log(error);
    }
  } else {
        const error = new Error('Invalid Token');
        return res.status(404).json({ msg: error.message });
  }
};

// USER'S PROFILE
const profile = async (req, res) => {
  const { user } = req;
  res.json(user);
}


export {
    registerUser,
    authenticateUser,
    confirmUser,
    forgotPassword,
    verifyToken,
    newPassword,
    profile
}
