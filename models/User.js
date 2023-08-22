import mongoose from 'mongoose';
import bcrypt from 'bcrypt'

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    token: {
        type: String,
    },
    confirmed: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
);

// Hashing password before saving User into the database
userSchema.pre("save", async function(next) {
    // If user does not modify the password then continue:
    if(!this.isModified('password')) {
        next();
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare and verify user's password. This method returns a Boolean.
userSchema.methods.verifyPassword = async function(formPassword) {
    return await bcrypt.compare(formPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;