const { prisma } = require('../config/database');
const { ROLES } = require('../config/constants');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true }
    });

    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create categories'
      });
    }

    const { name, description, icon, image } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        icon,
        image
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update categories'
      });
    }

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete categories'
      });
    }

    const category = await prisma.category.delete({
      where: { id: req.params.id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
