const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        minlength: [2, 'First name must be at least 2 characters long'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        minlength: [2, 'Last name must be at least 2 characters long'],
        trim: true
    },
    placeOfBirth: {
        type: String,
        required: [true, 'Place of birth is required'],
        minlength: [2, 'Place of birth must be at least 2 characters long'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function(value) {
                return value < new Date();
            },
            message: 'Date of birth must be before today (registration date)'
        }
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        default: 'Female',
        required: [true, 'Gender is required']
    },
    nationality: {
        type: String,
        required: [true, 'Nationality is required'],
        enum: [
            'Ugandan',
            'Sudanese',
            'Kenyan',
            'Tanzanian',
            'Burundian',
            'Rwandese',
            'Somali',
            'South Sudanese'
        ]
    },
    maritalStatus: {
        type: String,
        required: [true, 'Marital status is required'],
        enum: [
            'Single',
            'Married',
            'Divorced',
            'Widowed',
            'Separated'
        ]
    },
    settlementCamp: {
        type: String,
        required: [true, 'Settlement camp is required'],
        enum: [
            'Gulu settlement camp',
            'Arua settlement camp',
            'Mbarara settlement camp',
            'Kasese settlement camp',
            'Busia settlement camp',
            'Mbale settlement camp',
            'Kigezi settlement camp',
            'Kampala settlement camp'
        ]
    },
    dateOfJoining: {
        type: Date,
        required: [true, 'Date of joining settlement camp is required'],
        validate: {
            validator: function(value) {
                // Assuming registration happens now
                return value > new Date();
            },
            message: 'Date of joining settlement camp must be after today (registration date)'
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
        index: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Beneficiary', beneficiarySchema);
