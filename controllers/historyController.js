const History = require('../models/history');

exports.createHistory = async (req, res) => {
  try {
    const { user, action, entityType, entityId, amount, debit, credit, balance } = req.body;
    const history = new History({
      user,
      action,
      entityType,
      entityId,
      amount,
      debit,
      credit,
      balance
    });
    await history.save();
    res.status(201).json(history);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await History.find().sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const history = await History.find({ user: userId }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};