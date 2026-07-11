const { prisma } = require('../config/database');
const { ROLES, RENTAL_STATUS } = require('../config/constants');

const submitRentalRequest = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.TENANT) {
      return res.status(403).json({
        success: false,
        message: 'Only tenants can submit rental requests'
      });
    }

    const { propertyId, moveInDate, moveOutDate, numberOfTenants, message } = req.body;

    if (!propertyId || !moveInDate || !moveOutDate || !numberOfTenants) {
      return res.status(400).json({
        success: false,
        message: 'propertyId, moveInDate, moveOutDate, and numberOfTenants are required'
      });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (!property.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available'
      });
    }

    const existingRequest = await prisma.rentalRequest.findFirst({
      where: {
        tenantId: req.userId,
        propertyId,
        status: RENTAL_STATUS.PENDING
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this property'
      });
    }

    const rentalRequest = await prisma.rentalRequest.create({
      data: {
        tenantId: req.userId,
        propertyId,
        landlordId: property.landlordId,
        moveInDate: new Date(moveInDate),
        moveOutDate: new Date(moveOutDate),
        numberOfTenants,
        message,
        monthlyRent: property.priceMonthly,
        securityDeposit: property.priceSecurityDeposit
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        landlord: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        property: {
          select: {
            title: true,
            address: true,
            city: true,
            country: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Rental request submitted successfully',
      data: rentalRequest
    });
  } catch (error) {
    next(error);
  }
};

const getUserRentalRequests = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.TENANT) {
      return res.status(403).json({
        success: false,
        message: 'Only tenants can access this endpoint'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const where = { tenantId: req.userId };
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const requests = await prisma.rentalRequest.findMany({
      where,
      include: {
        property: {
          select: {
            title: true,
            address: true,
            city: true,
            country: true,
            priceMonthly: true,
            priceSecurityDeposit: true,
            images: true
          }
        },
        landlord: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.rentalRequest.count({ where });

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

const getRentalRequestDetails = async (req, res, next) => {
  try {
    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: req.params.id },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            country: true
          }
        },
        landlord: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            country: true
          }
        },
        property: {
          select: {
            title: true,
            description: true,
            address: true,
            city: true,
            country: true,
            priceMonthly: true,
            priceSecurityDeposit: true,
            images: true,
            amenities: true
          }
        },
        payment: true
      }
    });

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found'
      });
    }

    const isAuthorized =
      rentalRequest.tenantId === req.userId ||
      rentalRequest.landlordId === req.userId ||
      req.userRole === ROLES.ADMIN;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this request'
      });
    }

    res.status(200).json({
      success: true,
      data: rentalRequest
    });
  } catch (error) {
    next(error);
  }
};

const getLandlordRentalRequests = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.LANDLORD) {
      return res.status(403).json({
        success: false,
        message: 'Only landlords can access this endpoint'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const where = { landlordId: req.userId };
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const requests = await prisma.rentalRequest.findMany({
      where,
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            ratingsAverage: true,
            profileImage: true
          }
        },
        property: {
          select: {
            title: true,
            address: true,
            city: true,
            country: true,
            priceMonthly: true,
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.rentalRequest.count({ where });

    res.status(200).json({
      success: true,
      message: 'Landlord rental requests fetched successfully',
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

const approveRentalRequest = async (req, res, next) => {
  try {
    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: req.params.id }
    });

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found'
      });
    }

    if (rentalRequest.landlordId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve this request'
      });
    }

    if (rentalRequest.status !== RENTAL_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be approved'
      });
    }

    const updatedRequest = await prisma.rentalRequest.update({
      where: { id: req.params.id },
      data: {
        status: RENTAL_STATUS.APPROVED,
        approvedAt: new Date()
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        property: {
          select: {
            title: true,
            address: true,
            city: true,
            country: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Rental request approved successfully',
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

const rejectRentalRequest = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: req.params.id }
    });

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found'
      });
    }

    if (rentalRequest.landlordId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this request'
      });
    }

    if (rentalRequest.status !== RENTAL_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be rejected'
      });
    }

    const updatedRequest = await prisma.rentalRequest.update({
      where: { id: req.params.id },
      data: {
        status: RENTAL_STATUS.REJECTED,
        rejectionReason: rejectionReason || '',
        rejectedAt: new Date()
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        property: {
          select: {
            title: true,
            address: true,
            city: true,
            country: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Rental request rejected successfully',
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitRentalRequest,
  getUserRentalRequests,
  getRentalRequestDetails,
  getLandlordRentalRequests,
  approveRentalRequest,
  rejectRentalRequest
};
