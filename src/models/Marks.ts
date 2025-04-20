import mongoose, { Schema } from 'mongoose';

// Define the TA options
const taOptions = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Taylor Kim', 'Sam Wilson'];

// Define the Marks schema
const MarksSchema = new Schema({
    rollNumber: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
        enum: ['Political Science', 'History', 'Economics'],
    },
    taName: {
        type: String,
        required: true,
        enum: taOptions,
    },
    marks: {
        type: Number,
        required: true,
        min: 0,
        max: 30,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create compound index for unique submissions per student per subject
MarksSchema.index({ rollNumber: 1, subject: 1 }, { unique: true });

// Use existing model or create a new one
export default mongoose.models.Marks || mongoose.model('Marks', MarksSchema);