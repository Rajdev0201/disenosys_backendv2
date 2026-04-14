const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    completedLectureIds: [
      {
        type: String, // or ObjectId if lectures stored in DB
      },
    ],

    lastLectureId: {
      type: String,
      default: null,
    },

    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    quizScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    notesByLecture: {
      type: Map,
      of: String, // { lectureId: "note text" }
      default: {},
    },

    clientUpdatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
