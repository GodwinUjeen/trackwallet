const express = require('express');
const Category = require('../models/Category');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth());

router.get('/', async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.type) filter.type = req.query.type;
  if (req.query.parentId === 'null' || req.query.top === '1') {
    filter.parentId = null;
  } else if (req.query.parentId) {
    filter.parentId = req.query.parentId;
  }

  const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
  res.json(categories);
});

router.get('/tree', async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.type) filter.type = req.query.type;
  const all = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
  const parents = all.filter((c) => !c.parentId);
  const tree = parents.map((p) => ({
    ...p.toObject(),
    subcategories: all.filter((c) => c.parentId && c.parentId.equals(p._id)),
  }));
  res.json(tree);
});

router.get('/:id', async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
  if (!category) return res.status(404).json({ error: 'Category not found' });
  const subcategories = await Category.find({
    userId: req.user._id,
    parentId: category._id,
  }).sort({ sortOrder: 1, name: 1 });
  res.json({ ...category.toObject(), subcategories });
});

router.post('/', async (req, res) => {
  try {
    const { name, type, icon, color, parentId, sortOrder } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'name and type are required' });
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type must be income or expense' });
    }

    let resolvedType = type;
    if (parentId) {
      const parent = await Category.findOne({ _id: parentId, userId: req.user._id });
      if (!parent) return res.status(404).json({ error: 'Parent category not found' });
      resolvedType = parent.type;
    }

    const category = await Category.create({
      userId: req.user._id,
      name: name.trim(),
      type: resolvedType,
      icon: icon || 'category',
      color: color || '#9E9E9E',
      parentId: parentId || null,
      sortOrder: sortOrder ?? 0,
    });
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, icon, color, sortOrder, type } = req.body;
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    if (name !== undefined) category.name = name.trim();
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (type !== undefined && !category.parentId) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'type must be income or expense' });
      }
      category.type = type;
      await Category.updateMany(
        { userId: req.user._id, parentId: category._id },
        { type }
      );
    }

    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
  if (!category) return res.status(404).json({ error: 'Category not found' });
  await Category.deleteMany({ userId: req.user._id, parentId: category._id });
  await category.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
