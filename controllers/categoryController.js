const Category = require('../db/models/Category');
const fs = require('fs');
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
        return res.status(200).json({ message: 'Category saved successfully' });
    } catch (err) {
        console.error('ERROR saving category: ', err);
        return res.status(500).json({ error: 'Error saving category' });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, index } = req.body;
    const updateFields = { name, index };

    if (req.file) updateFields.image = `${SERVER_URL}/uploads/${req.file.filename}`;

    try {
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        if (req.file) {
            const oldImagePath = existingCategory.image;
            if (oldImagePath) {
                const oldImageFullPath = path.join(__dirname, '..', 'uploads', path.basename(oldImagePath));
                fs.unlink(oldImageFullPath, (err) => {
                    if (err) console.error('Failed to delete old image: ', err);
                });
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

        if (updatedCategory) {
            return res.status(200).json({ message: 'Category updated successfully' });
        } else {
            return res.status(404).json({ error: 'Category not found' });
        }
    } catch (err) {
        console.error('ERROR updating category: ', err);
        return res.status(500).json({ error: 'Error updating category' });
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
