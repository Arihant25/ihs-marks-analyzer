import mongoose, { Schema } from "mongoose";

// Define the TA options
const taOptions = [
  "Aadi",
  "Akshit",
  "Anushka",
  "Asirith",
  "Chandana",
  "Chetan",
  "Gargie",
  "Kriti",
  "Medha",
  "Rohan",
  "Rushil",
  "Sathvika",
  "Sreenivas",
  "Tanish",
  "Tanveer",
];

// Define the Marks schema
const MarksSchema = new Schema({
  rollNumber: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
    enum: [
      "Political Science",
      "History",
      "Economics",
      "Sociology",
      "Philosophy",
    ],
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
    get: (v: number) => parseFloat(v.toFixed(2)), // Limit to 2 decimal places when retrieving
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Enable getters when converting to JSON
MarksSchema.set("toJSON", { getters: true });
MarksSchema.set("toObject", { getters: true });

// Create compound index for unique submissions per student per subject
MarksSchema.index({ rollNumber: 1, subject: 1 }, { unique: true });

// Use existing model or create a new one
export default mongoose.models.Marks || mongoose.model("Marks", MarksSchema);
