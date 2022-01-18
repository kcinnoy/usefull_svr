import mongoose from 'mongoose';
const {Schema} = mongoose;

const userSchema = new Schema({
    username:{
        type: String, 
        trim: true, 
        required: true, 
    },
    email:{
        type: String, 
        trim: true, 
        required: true, 
        unique: true,
    },
    password:{
        type: String, 
        trim: true, 
        required: true, 
        min: 6, 
        max: 64
    },
    displayPicture:{
        type: String, 
        default: '/avatar.png',
    },
    role: {
        type: [String],
        default: ["Subscriber"],
        enum: ["Subscriber", "Instructer", "Admin"],
    },
    stripe_account_id: "",
    stripe_seller:{},
    stripeSession: {},
    },
    {timestamps: true}

);

export default mongoose.model('user',userSchema)