const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userId: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: {type: String},
    resetPasswordExpires: {type: Date},
    online: {
        type: Boolean, default: false
    },
    role: {
        type: String,
        enum: ['Intaker', 'Case_Manager', 'Clinical_Advisor', 'Project_Manager', 'F_Audit','Counselor'],
        default: 'Intaker',
        required: true,
    },
    avatar: { type: String },
    bio: {type: String},
    contact: {
        phone: String,
        address: String
    },
    loginHistory: [
        {
            loginDate: { type: Date, default: Date.now },
            ipAddress: String
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', UserSchema);
module.exports = { User };
