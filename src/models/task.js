const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    dueDate: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);