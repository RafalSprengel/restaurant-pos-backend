const Category = require('../db/models/Category');

exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'index', sortOrder = 'asc' } = req.query;

    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const total = await Category.countDocuments(query);

    const categories = await Category.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      categories,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('ERROR fetching categories: ', err);
    return res.status(500).json({ error: 'Error fetching categories' });
  }
};

exports.getSingleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error: ' + error);
    return res.status(500).json({ error: 'Error fetching category' });
  }
};

exports.addCategory = async (req, res) => {
  const { name, index } = req.body;

  const newCategory = new Category({
    name,
    index,
    image: null, // zawsze null, bo nie obsługujemy uploadów
  });

  try {
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(409).json({ error: 'Category already exists' });
    }
    await newCategory.save();
    return res.status(201).json({ message: 'Category added successfully' });
  } catch (err) {
    console.error('ERROR saving category: ', err);
    return res.status(500).json({ error: 'Error saving category' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, index } = req.body;

  if (!id) return res.status(400).json({ error: 'Missing category ID in request params' });
  if (!name && !index) {
    return res.status(422).json({ error: 'No fields provided for update' });
  }

  try {
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (index) updateFields.index = index;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (updatedCategory) {
      return res.status(200).json({ message: 'Category updated successfully', updatedCategory });
    } else {
      return res.status(404).json({ error: 'Category not found' });
    }
  } catch (err) {
    console.error('ERROR updating category:', err.message);
    return res.status(500).json({ error: 'Error updating category. Details: ' + err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (deletedCategory) {
      return res.status(200).json({ message: 'Category deleted successfully' });
    } else {
      return res.status(404).json({ error: 'Category not found' });
    }
  } catch (err) {
    console.error('ERROR deleting category: ', err);
    return res.status(500).json({ error: 'Error deleting category' });
  }
};