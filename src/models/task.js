const mongoose = require('mongoose');

module.exports = mongoose.model('Task', {
    description: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createDate: {
        default: Date.now()
    },
    dueDate: Date
});