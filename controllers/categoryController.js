const Category = require('../db/models/Category');
const fs = require('fs').promises;
const path = require('path');
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ index: 1 });
        if (categories) {
            return res.status(200).json(categories);
        } else {
            return res.status(404).json({ error: 'Categories not found' });
        }
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
    const image = req.file ? req.file.filename : null;
    const newCategory = new Category({
        name,
        index,
        image: image ? `${SERVER_URL}/uploads/${image}` : null,
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
    if (!name && !index && !req.file) {
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
        if (req.file) updateFields.image = `${SERVER_URL}/uploads/${req.file.filename}`;

        if (req.file && existingCategory.image) {
            const oldImagePath = path.join(__dirname, '..', 'uploads', path.basename(existingCategory.image));
            try {
                await fs.unlink(oldImagePath);
            } catch (err) {
                console.error('Failed to delete old image:', err.message);
            }
        }

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
