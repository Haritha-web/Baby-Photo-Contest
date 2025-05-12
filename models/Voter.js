import mongoose from "mongoose";

const voterSchema = new mongoose.Schema({
    //name,email,phone number, password , confirm password
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
const Voter = mongoose.model('Voter', voterSchema);
export default Voter;