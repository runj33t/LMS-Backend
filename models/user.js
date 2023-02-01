import mongoose from 'mongoose'  // for mongodDb
const { Schema } = mongoose;       // Schema is used to create Schema : )

// Inside models we define the what information will be saved in the database
// for example in this model we will create a user schema
// user can have name, email, password, address etc so we have specify all these
// properties for the user in the schema

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,    // it removes un necessary white spaces
        required: true, // that means name is a required field
    },

    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,   // Each user must have a unique email address
    },

    password: {
        type: String,
        required: true,
        min: 6,
        max: 64,
    },

    picture: {
        type: String,
        default: "/avatar.png",
    },

    role: {
        type: [String],
        default: ["Subscriber"],
        enum: ["Subscriber", "Instructor", "Admin"],
    },

    stripe_account_id: '',
    stripe_seller: {},
    stripeSession: {},

    passwordResetCode: {
        data: String,
        default: "",
    }
}, { timestamps: true });

// export default mongoose.model('Name_model_of_your_choice', SchemaName);
export default mongoose.model('User', userSchema);