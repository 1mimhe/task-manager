const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30,
        trim: true,
        set: (v) => v[0].toUpperCase() + v.slice(1)
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v) => validator.isEmail(v),
            message: "Your email is not valid."
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate: [{
            validator: (v) => !/.* .*/.test(v),
            message: "Your password is not valid."
        }, {
            validator: (v) => validator.isStrongPassword(v),
            message: "Your password is not strong enough."
        }]
    },
    birthdate: Date,
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = bcrypt.hash(this.password, 10);
    }

    next();
});

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this.id, isAdmin: this.isAdmin },
                                process.env.JWT_PRIVATE_KEY, { expiresIn: '7 days' });
};

module.exports = mongoose.model('User', userSchema);