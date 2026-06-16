import mongoose from "mongoose";

const userEmployeeSchema = new mongoose.Schema(
    {
        // Supplier (User)
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one employee per supplier
        },

        empName: {
            type: String,
            required: true,
            trim: true,
        },

        empEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        empPhone: {
            type: String,
            required: true,
            trim: true,
        },

        designation: {
            type: String,
            default: "Account Manager",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.UserEmployee || mongoose.model("UserEmployee", userEmployeeSchema);