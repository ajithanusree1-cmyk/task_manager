const router = require("express").Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// Create task
router.post("/", auth, async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      assignedTo: req.body.assignedTo,
      project: req.body.project,
      dueDate: req.body.dueDate
    });

    res.json(task);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Get all tasks
router.get("/", auth, async (req, res) => {
  const tasks = await Task.find().populate("assignedTo project");
  res.json(tasks);
});

// Update task status
router.put("/:id", auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { returnDocument: "after" }
  );

  res.json(task);
});

// ✅ Dashboard route (MOVE HERE)
router.get("/dashboard", auth, async (req, res) => {
  const tasks = await Task.find();

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const pending = tasks.filter(t => t.status === "pending").length;

  res.json({ total, completed, pending });
});

// ✅ Export at the END
module.exports = router;