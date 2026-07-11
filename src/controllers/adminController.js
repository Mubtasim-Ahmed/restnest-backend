const { prisma } = require('../config/database');
const { ROLES, RENTAL_STATUS } = require('../config/constants');

// Get all users (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access this endpoint'
      });
    }

    const { role, isBanned, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await prisma.user.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.user.count({ where: filter });

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access this endpoint'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const banUser = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can ban users'
      });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User banned successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const unbanUser = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can unban users'
      });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: false }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User unbanned successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const getAllPropertiesAdmin = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access this endpoint'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const properties = await prisma.property.findMany({
      where: filter,
      include: {
        landlord: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.property.count({ where: filter });

    res.status(200).json({
      success: true,
      message: 'Properties fetched successfully',
      data: properties,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllRentalRequests = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access this endpoint'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const requests = await prisma.rentalRequest.findMany({
      where: filter,
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        landlord: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        property: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.rentalRequest.count({ where: filter });

    res.status(200).json({
      success: true,
      message: 'Rental requests fetched successfully',
      data: requests,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStatistics = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access this endpoint'
      });
    }

    const totalUsers = await prisma.user.count();
    const totalTenants = await prisma.user.count({
      where: { role: ROLES.TENANT }
    });
    const totalLandlords = await prisma.user.count({
      where: { role: ROLES.LANDLORD }
    });
    const bannedUsers = await prisma.user.count({
      where: { isBanned: true }
    });

    const totalProperties = await prisma.property.count();
    const totalRentalRequests = await prisma.rentalRequest.count();
    const pendingRequests = await prisma.rentalRequest.count({
      where: { status: RENTAL_STATUS.PENDING }
    });
    const approvedRequests = await prisma.rentalRequest.count({
      where: { status: RENTAL_STATUS.APPROVED }
    });
    const completedRequests = await prisma.rentalRequest.count({
      where: { status: RENTAL_STATUS.COMPLETED }
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          tenants: totalTenants,
          landlords: totalLandlords,
          banned: bannedUsers
        },
        properties: {
          total: totalProperties
        },
        rentalRequests: {
          total: totalRentalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          completed: completedRequests
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  banUser,
  unbanUser,
  getAllPropertiesAdmin,
  getAllRentalRequests,
  getDashboardStatistics
};
