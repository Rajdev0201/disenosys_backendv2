const mongoose = require("mongoose")

// Reviews (optional)
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
    name: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    message: { type: String, trim: true },
    like: { type: String, trim: true },
  },
  { timestamps: true },
)

// Curriculum item (matches frontend keys)
const curriculumItemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    titles: { type: String, trim: true },
    subTopic: { type: String, trim: true },
    subTopics: { type: String, trim: true },
    subLinks: { type: String, trim: true },
  },
  { _id: false },
)

// Questions (matches frontend keys; also keeps legacy fields)
const questionSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    options: [{ type: String, trim: true }],
    correctIndex: { type: Number, min: 0, default: 0 },

    // legacy fields (keep to avoid breaking old saved docs)
    head: { type: String, trim: true },
    questionText: { type: String, trim: true },
    type: { type: String, enum: ["input", "mcq", "match", "fill"] },
    correctAnswer: { type: mongoose.Schema.Types.Mixed },
    matchPairs: [
      {
        left: { type: String, trim: true },
        right: { type: String, trim: true },
      },
    ],
  },
  { _id: false },
)

questionSchema.path("correctIndex").validate({
  validator(value) {
    if (value === undefined || value === null) return true
    if (!Array.isArray(this.options)) return false
    return value >= 0 && value < this.options.length
  },
  message: "correctIndex must be within options range",
})

const courseSchema = new mongoose.Schema(
  {
    courseName: { type: String, trim: true },
    description: { type: String, trim: true },
    category: [{ type: String, trim: true }],
    duration: { type: String, trim: true },
    imagePath: { type: String, trim: true },

    // Frontend: single current video
    video_url: { type: String, trim: true },
    // Backend: keep a list for “existing course video added”
    videoUrls: [{ type: String, trim: true }],

    live: { type: String, trim: true },
    record: { type: String, trim: true },
    noOfLessons: { type: Number, min: 0 },
    // Keep this flexible because the frontend sends structured course detail blocks.
    detailsDescription: { type: mongoose.Schema.Types.Mixed, default: "" },

    // Stored in DB as `Curriculum` (existing key)
    Curriculum: { type: [curriculumItemSchema], default: [] },
    questions: { type: [questionSchema], default: [] },

    // existing fields used elsewhere
    members: [{ type: mongoose.Types.ObjectId, ref: "users" }],
    reviews: { type: [reviewSchema], default: [] },
    directors: [
      {
        name: { type: String, trim: true },
        role: { type: String, trim: true },
        exp: { type: String, trim: true },
        PASTCOMPANIES: [{ type: String, trim: true }],
        img: { type: String, trim: true },
        detail: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true },
)

courseSchema.index({ courseName: 1 })

// Expose frontend key `curriculum` while storing in DB as `Curriculum`
courseSchema
  .virtual("curriculum")
  .get(function () {
    return this.Curriculum
  })
  .set(function (value) {
    this.Curriculum = value
  })

courseSchema.set("toJSON", { virtuals: true })
courseSchema.set("toObject", { virtuals: true })

courseSchema.pre("save", function (next) {
  if (this.video_url) {
    const list = Array.isArray(this.videoUrls) ? this.videoUrls : []
    if (!list.includes(this.video_url)) list.push(this.video_url)
    this.videoUrls = list
  }
  next()
})

module.exports = mongoose.model("Course", courseSchema)
