const router = require("express").Router();
const Project = require("../models/Project");
const User = require("../models/User");
const auth = require("../middleware/auth");

// ================= CREATE PROJECT =================
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const project = await Project.create({
      name: req.body.name,
      members: [],
      createdBy: req.user.id
    });

    res.json(project);

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= GET PROJECTS =================
router.get("/", auth, async (req, res) => {
  try {
    let projects;

    if (req.user.role === "admin") {
      projects = await Project.find().populate("members");
    } else {
      projects = await Project.find({
        members: req.user.id
      }).populate("members");
    }

    res.json(projects);

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= ADD MEMBER =================
router.post("/add-member", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { projectId, email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // limit 7
    if (project.members.length >= 7) {
      return res.status(400).json({ message: "❌ Max 7 members allowed" });
    }

    // prevent duplicate
    if (project.members.some(m => m.toString() === user._id.toString())) {
      return res.status(400).json({ message: "User already added" });
    }

    project.members.push(user._id);
    await project.save();

    res.json({ message: "Member added" });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= REMOVE MEMBER =================
router.post("/remove-member", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { projectId, userId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.members = project.members.filter(
      m => m.toString() !== userId
    );

    await project.save();

    res.json({ message: "Member removed" });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= DELETE PROJECT =================
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: "Project deleted" });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;