const { prisma } = require('../config/database');
const { ROLES, RENTAL_STATUS } = require('../config/constants');

const createReview = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.TENANT) {
      return res.status(403).json({
        success: false,
        message: 'Only tenants can create reviews'
      });
    }

    const { rentalRequestId, rating, title, comment, images } = req.body;

    if (!rentalRequestId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'rentalRequestId, rating, title, and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: rentalRequestId }
    });

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found'
      });
    }

    if (rentalRequest.tenantId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own rentals'
      });
    }

    if (rentalRequest.status !== RENTAL_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed rentals'
      });
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        tenantId: req.userId,
        rentalRequestId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this rental'
      });
    }

    const review = await prisma.review.create({
      data: {
        tenantId: req.userId,
        propertyId: rentalRequest.propertyId,
        landlordId: rentalRequest.landlordId,
        rentalRequestId,
        rating,
        title,
        comment,
        images: images || [],
        isVerifiedBooking: true,
        isApproved: true
      }
    });

    const allReviews = await prisma.review.findMany({
      where: {
        propertyId: rentalRequest.propertyId,
        isApproved: true
      }
    });

    const propertyRatingAverage = allReviews.length
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await prisma.property.update({
      where: { id: rentalRequest.propertyId },
      data: {
        ratingAverage: propertyRatingAverage,
        ratingCount: allReviews.length
      }
    });

    const landlordReviews = await prisma.review.findMany({
      where: {
        landlordId: rentalRequest.landlordId,
        isApproved: true
      }
    });

    const landlordRatingAverage = landlordReviews.length
      ? landlordReviews.reduce((sum, r) => sum + r.rating, 0) / landlordReviews.length
      : 0;

    await prisma.user.update({
      where: { id: rentalRequest.landlordId },
      data: {
        ratingsAverage: landlordRatingAverage,
        ratingsCount: landlordReviews.length
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

const getPropertyReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reviews = await prisma.review.findMany({
      where: {
        propertyId: req.params.propertyId,
        isApproved: true
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.review.count({
      where: {
        propertyId: req.params.propertyId,
        isApproved: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Property reviews fetched successfully',
      data: reviews,
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

const getLandlordReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reviews = await prisma.review.findMany({
      where: {
        landlordId: req.params.landlordId,
        isApproved: true
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true
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

    const total = await prisma.review.count({
      where: {
        landlordId: req.params.landlordId,
        isApproved: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Landlord reviews fetched successfully',
      data: reviews,
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

const getReviewDetails = async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true
          }
        },
        property: {
          select: {
            title: true
          }
        },
        landlord: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.tenantId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    const { rating, title, comment, images } = req.body;
    const updates = {};

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      updates.rating = rating;
    }

    if (title !== undefined) updates.title = title;
    if (comment !== undefined) updates.comment = comment;
    if (images !== undefined) updates.images = images;

    const updatedReview = await prisma.review.update({
      where: { id: req.params.id },
      data: updates
    });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.tenantId !== req.userId && req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review'
      });
    }

    await prisma.review.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const markReviewHelpful = async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const existingHelpful = review.helpfulUsers.includes(req.userId);
    const helpfulUsers = existingHelpful
      ? review.helpfulUsers.filter((userId) => userId !== req.userId)
      : [...review.helpfulUsers, req.userId];

    const helpfulCount = Math.max(0, helpfulUsers.length);

    const updatedReview = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        helpfulUsers,
        helpfulCount
      }
    });

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getPropertyReviews,
  getLandlordReviews,
  getReviewDetails,
  updateReview,
  deleteReview,
  markReviewHelpful
};
