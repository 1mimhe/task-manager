const mongoose = require('mongoose');
const validator = require('validator');

module.exports = mongoose.model('User', {
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
    birthdate: Date
});