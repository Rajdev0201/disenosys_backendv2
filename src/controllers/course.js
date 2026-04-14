const Course = require("../models/course");

const parseJsonIfString = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};


const normalizeStringArray = (value) => {
  const parsed = parseJsonIfString(value);
  if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
  if (typeof parsed === "string" && parsed.trim()) return [parsed.trim()];
  return [];
};

const toNumberOrUndefined = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};


exports.getAllCourses = async(req,res)=>{
   const courses = await Course.find();

    if(!courses)
    {
        return res.status(400).json({message:"error in getting course"})
    }
     const encoded = Buffer.from(JSON.stringify(courses)).toString("base64");

     return res.json({ success: true, data: encoded });
}

exports.getByCategories = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ success: false, message: "category query param is required" });
    }

    const categories = normalizeStringArray(category);
    const courses = await Course.find({ category: { $in: categories } });

    return res.status(200).json({ success: true, courses });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch courses", error: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await Course.findById(id);
    if (!found) return res.status(404).json({ success: false, message: "Course not found" });
    return res.status(200).json({ success: true, course: found });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch course", error: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Course.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Course not found" });
    return res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete course", error: err.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const body = req.body || {};

    const courseName = typeof body.courseName === "string" ? body.courseName.trim() : "";
    if (!courseName) {
      return res.status(400).json({ success: false, message: "courseName is required" });
    }

    const payload = {
      courseName,
      description: typeof body.description === "string" ? body.description : body.description?.toString?.(),
      category: normalizeStringArray(body.category),
      duration: typeof body.duration === "string" ? body.duration : body.duration?.toString?.(),
      imagePath: typeof body.imagePath === "string" ? body.imagePath : body.imagePath?.toString?.(),
      video_url: typeof body.video_url === "string" ? body.video_url : body.video_url?.toString?.(),
      live: typeof body.live === "string" ? body.live : body.live?.toString?.(),
      record: typeof body.record === "string" ? body.record : body.record?.toString?.(),
      noOfLessons: toNumberOrUndefined(body.noOfLessons),
      detailsDescription: parseJsonIfString(body.detailsDescription),
    };

    const curriculum = parseJsonIfString(body.curriculum ?? body.Curriculum);
    if (Array.isArray(curriculum)) payload.Curriculum = curriculum;

    const questions = parseJsonIfString(body.questions);
    if (Array.isArray(questions)) payload.questions = questions;

    const created = await Course.create(payload);
    return res.status(201).json({ success: true, course: created });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create course", error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const existing = await Course.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Course not found" });

    const setIfProvided = (key, value) => {
      if (value === undefined) return;
      existing[key] = value;
    };

    if (body.courseName !== undefined) {
      const v = typeof body.courseName === "string" ? body.courseName.trim() : String(body.courseName || "").trim();
      if (!v) return res.status(400).json({ success: false, message: "courseName cannot be empty" });
      existing.courseName = v;
    }

    if (body.description !== undefined) setIfProvided("description", body.description);
    if (body.duration !== undefined) setIfProvided("duration", body.duration);
    if (body.imagePath !== undefined) setIfProvided("imagePath", body.imagePath);
    if (body.live !== undefined) setIfProvided("live", body.live);
    if (body.record !== undefined) setIfProvided("record", body.record);
    if (body.detailsDescription !== undefined) setIfProvided("detailsDescription", parseJsonIfString(body.detailsDescription));

    if (body.category !== undefined) existing.category = normalizeStringArray(body.category);

    const noOfLessons = toNumberOrUndefined(body.noOfLessons);
    if (body.noOfLessons !== undefined) existing.noOfLessons = noOfLessons ?? existing.noOfLessons;

    const curriculum = parseJsonIfString(body.curriculum ?? body.Curriculum);
    if (Array.isArray(curriculum)) existing.Curriculum = curriculum;

    const questions = parseJsonIfString(body.questions);
    if (Array.isArray(questions)) existing.questions = questions;

    const videoUrl = body.video_url !== undefined ? String(body.video_url || "").trim() : undefined;
    const videoUrls = parseJsonIfString(body.videoUrls);
    const videoMode = typeof body.videoMode === "string" ? body.videoMode : undefined; // "replace" | "append"

    if (Array.isArray(videoUrls)) {
      const incoming = videoUrls.map(String).map((s) => s.trim()).filter(Boolean);
      const merged = [...(existing.videoUrls || [])];
      for (const u of incoming) if (!merged.includes(u)) merged.push(u);
      existing.videoUrls = merged;
      if (incoming.length) existing.video_url = incoming[incoming.length - 1];
    }

    if (videoUrl !== undefined) {
      if (!videoUrl) {
        // allow clearing if explicitly sent empty
        existing.video_url = "";
      } else if (videoMode === "replace") {
        existing.video_url = videoUrl;
        existing.videoUrls = [videoUrl];
      } else {
        // Default to append to support "existing course video added"
        existing.video_url = videoUrl;
        const merged = Array.isArray(existing.videoUrls) ? existing.videoUrls : [];
        if (!merged.includes(videoUrl)) merged.push(videoUrl);
        existing.videoUrls = merged;
      }
    }

    const saved = await existing.save();
    return res.status(200).json({ success: true, course: saved });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update course", error: err.message });
  }
};

exports.Reviews =async (req, res) => {
  try {
    const { courseId, name, rating, message, like } = req.body || {};
    if (!courseId || rating === undefined || rating === null || rating === "") {
      return res.status(400).json({
        success: false,
        message: "courseId and rating are required",
      });
    }

    const found = await Course.findById(courseId);
    if (!found) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const newReview = {
      user: req.user?._id,
      name: name || (req.user?.userName ?? "Anonymous"),
      rating: Number(rating),
      like,
      message: message || "",
    };

    found.reviews.push(newReview);
    await found.save();

    return res
      .status(200)
      .json({ success: true, message: "Review added successfully", reviews: found.reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to add review", error: err.message });
  }
};
