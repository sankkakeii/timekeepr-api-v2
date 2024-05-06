// const { array } = require('joi');
// const mongoose = require('mongoose');

// const ClockindataSchema = new mongoose.Schema({
    
//     email : {
//         type: String
//     }, 
//     companyId:{type:mongoose.SchemaTypes.ObjectId},
//     userStatus: {
//         type: Array,
//     },
// }, { timestamps:true})

// const Clockindata = mongoose.model("Clockindata", ClockindataSchema);

// module.exports = { Clockindata };




const mongoose = require('mongoose');

const ClockindataSchema = new mongoose.Schema({
    email: {
        type: String
    },
    companyId: {
        type: mongoose.SchemaTypes.ObjectId
    },
    userStatus: [{
        date: {
            type: Date,
            required: true
        },
        clockedIn: {
            type: Boolean,
            default: false
        },
        clockedOut: {
            type: Boolean,
            default: false
        },
        timestamps: [{
            clockInTime: {
                type: Date
            },
            clockOutTime: {
                type: Date
            }
        }]
    }]
}, { timestamps: true });

const Clockindata = mongoose.model("Clockindata", ClockindataSchema);

module.exports = { Clockindata };
