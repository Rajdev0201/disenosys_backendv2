const CourseProgress = require("../models/courseTrack");

const toNumberOrUndefined = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

exports.saveCourseProgress = async (req, res) => {
  try {
    const userId = req.user?.id; // from auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      courseId,
      courseName,
      completedLectureIds,
      lastLectureId,
      progressPercent,
      quizScore,
      notesByLecture,
      clientUpdatedAt,
    } = req.body;

    if (!courseId || !courseName) {
      return res.status(400).json({
        success: false,
        message: "courseId and courseName are required",
      });
    }

    // 🔥 Upsert logic (BEST PRACTICE)
    const updatedProgress = await CourseProgress.findOneAndUpdate(
      { userId, courseId },
      {
        $set: {
          courseName,
          completedLectureIds,
          lastLectureId,
          progressPercent,
          quizScore: toNumberOrUndefined(quizScore),
          notesByLecture,
          clientUpdatedAt,
        },
      },
      {
        new: true,        // return updated doc
        upsert: true,     // create if not exists
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      progress: updatedProgress,
    });
  } catch (error) {
    console.error("Save Progress Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save progress",
    });
  }
};

exports.patchCourseProgress = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      courseId,
      courseName,
      completedLectureIds,
      lastLectureId,
      progressPercent,
      quizScore,
      notesByLecture,
      clientUpdatedAt,
    } = req.body;

    if (!courseId && !courseName) {
      return res.status(400).json({
        success: false,
        message: "courseId or courseName is required",
      });
    }

    const filter = { userId };
    if (courseId) filter.courseId = courseId;
    else filter.courseName = courseName;

    const updates = {};
    if (courseId !== undefined) updates.courseId = courseId;
    if (courseName !== undefined) updates.courseName = courseName;
    if (completedLectureIds !== undefined) updates.completedLectureIds = completedLectureIds;
    if (lastLectureId !== undefined) updates.lastLectureId = lastLectureId;
    if (progressPercent !== undefined) updates.progressPercent = progressPercent;
    if (quizScore !== undefined) updates.quizScore = toNumberOrUndefined(quizScore);
    if (notesByLecture !== undefined) updates.notesByLecture = notesByLecture;
    if (clientUpdatedAt !== undefined) updates.clientUpdatedAt = clientUpdatedAt;

    const updatedProgress = await CourseProgress.findOneAndUpdate(
      filter,
      { $set: updates },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      progress: updatedProgress,
    });
  } catch (error) {
    console.error("Patch Progress Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update progress",
    });
  }
};


exports.getCourseProgress = async (req, res) => {
  try {
    const userId = req.user?.id; // from auth middleware
    const { courseName } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!courseName) {
      return res.status(400).json({
        success: false,
        message: "courseName is required",
      });
    }

    const progress = await CourseProgress.findOne({
      userId,
      courseName,
    });

    if (!progress) {
      return res.status(200).json({
        success: true,
        progress: null, // frontend will handle empty state
      });
    }

    return res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Get Progress Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
    });
  }
};
