const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    companyId:{
        type:mongoose.SchemaTypes.ObjectId
    },
    companyName: {
        type: String,
        trim:true
    },
    clockInTime: {
        type: String,
        trim:true
    },  
    organizationLocation: {
        type: Array,
        coordinates: []
    },
    radius: {
        type: Number,
    },
}, { timestamps:true})


const Location = mongoose.model("Location", locationSchema);


module.exports = { Location };



