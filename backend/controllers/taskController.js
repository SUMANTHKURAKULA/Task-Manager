const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;
    let filter = {};

    if (projectId) filter.project = projectId;
    if (status) filter.status = status;

    if (req.user.role === 'admin') {
      if (assignedTo) filter.assignedTo = assignedTo;
    } else {
      // Members only see their own tasks
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    // Mark overdue
    const now = new Date();
    const tasksWithOverdue = tasks.map(task => ({
      ...task.toObject(),
      isOverdue: task.status !== 'completed' && task.dueDate < now
    }));

    res.json({ success: true, count: tasks.length, data: tasksWithOverdue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check access
    if (req.user.role !== 'admin' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: { ...task.toObject(), isOverdue: task.status !== 'completed' && task.dueDate < new Date() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, project, status, priority, dueDate } = req.body;

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      project,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate,
      createdBy: req.user._id
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'name');

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role === 'member') {
      // Members can only update status of their own tasks
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      // Only allow status updates for members
      const { status } = req.body;
      task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })
        .populate('assignedTo', 'name email')
        .populate('project', 'name');
    } else {
      // Admin can update everything
      task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('assignedTo', 'name email')
        .populate('project', 'name');
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }

    const now = new Date();

    const [total, completed, pending, inProgress, overdue] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'completed' }),
      Task.countDocuments({ ...filter, status: 'pending' }),
      Task.countDocuments({ ...filter, status: 'in-progress' }),
      Task.countDocuments({ ...filter, status: { $ne: 'completed' }, dueDate: { $lt: now } })
    ]);

    // Recent tasks
    const recentTasks = await Task.find(filter)
      .populate('assignedTo', 'name')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Task by status (for chart)
    const tasksByStatus = [
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'In Progress', value: inProgress, color: '#3b82f6' },
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Overdue', value: overdue, color: '#ef4444' }
    ];

    res.json({
      success: true,
      data: {
        stats: { total, completed, pending, inProgress, overdue },
        recentTasks,
        tasksByStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getDashboardStats };
