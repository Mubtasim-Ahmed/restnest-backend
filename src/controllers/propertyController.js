const { prisma } = require('../config/database');
const { ROLES, PROPERTY_STATUS } = require('../config/constants');

const getAllProperties = async (req, res, next) => {
  try {
    const { city, minPrice, maxPrice, category, amenities, bedrooms, bathrooms, page = 1, limit = 10 } = req.query;

    const where = {
      isAvailable: true,
      status: PROPERTY_STATUS.AVAILABLE
    };

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.priceMonthly = {};
      if (minPrice) where.priceMonthly.gte = parseFloat(minPrice);
      if (maxPrice) where.priceMonthly.lte = parseFloat(maxPrice);
    }

    if (category) {
      where.categoryId = category;
    }

    if (amenities) {
      const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
      where.amenities = { hasSome: amenityArray };
    }

    if (bedrooms) {
      where.bedrooms = parseInt(bedrooms);
    }

    if (bathrooms) {
      where.bathrooms = parseInt(bathrooms);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const properties = await prisma.property.findMany({
      where,
      include: {
        landlord: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            ratingsAverage: true,
            ratingsCount: true
          }
        },
        category: {
          select: {
            name: true,
            description: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.property.count({ where });

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

const getPropertyById = async (req, res, next) => {
  try {
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
      include: {
        landlord: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            bio: true,
            ratingsAverage: true,
            ratingsCount: true,
            profileImage: true
          }
        },
        category: {
          select: {
            name: true,
            description: true
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

const createProperty = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.LANDLORD) {
      return res.status(403).json({
        success: false,
        message: 'Only landlords can create properties'
      });
    }

    const {
      title,
      description,
      category,
      location,
      price,
      amenities,
      bedrooms,
      bathrooms,
      squareFootage,
      images,
      availableFrom,
      availableUntil,
      minLeaseTerm,
      maxTenants,
      petPolicy,
      rules
    } = req.body;

    const property = await prisma.property.create({
      data: {
        title,
        description,
        landlordId: req.userId,
        categoryId: category,
        address: location?.address,
        city: location?.city,
        state: location?.state,
        zipCode: location?.zipCode,
        country: location?.country,
        latitude: location?.latitude,
        longitude: location?.longitude,
        priceMonthly: price?.monthly,
        priceSecurityDeposit: price?.securityDeposit ?? 0,
        priceCurrency: price?.currency ?? 'USD',
        amenities: amenities || [],
        bedrooms,
        bathrooms,
        squareFootage,
        images: images || [],
        availableFrom,
        availableUntil,
        minLeaseTerm,
        maxTenants,
        petPolicyAllowed: petPolicy?.allowed ?? false,
        petPolicyDetails: petPolicy?.details,
        rules: rules || []
      }
    });

    const createdProperty = await prisma.property.findUnique({
      where: { id: property.id },
      include: {
        landlord: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        category: {
          select: {
            name: true,
            description: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: createdProperty
    });
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.landlordId !== req.userId && req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this property'
      });
    }

    const updates = {};
    const {
      title,
      description,
      category,
      location,
      price,
      amenities,
      bedrooms,
      bathrooms,
      squareFootage,
      images,
      availableFrom,
      availableUntil,
      minLeaseTerm,
      maxTenants,
      petPolicy,
      rules,
      isAvailable,
      status
    } = req.body;

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.categoryId = category;
    if (location) {
      if (location.address !== undefined) updates.address = location.address;
      if (location.city !== undefined) updates.city = location.city;
      if (location.state !== undefined) updates.state = location.state;
      if (location.zipCode !== undefined) updates.zipCode = location.zipCode;
      if (location.country !== undefined) updates.country = location.country;
      if (location.latitude !== undefined) updates.latitude = location.latitude;
      if (location.longitude !== undefined) updates.longitude = location.longitude;
    }
    if (price) {
      if (price.monthly !== undefined) updates.priceMonthly = price.monthly;
      if (price.securityDeposit !== undefined) updates.priceSecurityDeposit = price.securityDeposit;
      if (price.currency !== undefined) updates.priceCurrency = price.currency;
    }
    if (amenities !== undefined) updates.amenities = amenities;
    if (bedrooms !== undefined) updates.bedrooms = bedrooms;
    if (bathrooms !== undefined) updates.bathrooms = bathrooms;
    if (squareFootage !== undefined) updates.squareFootage = squareFootage;
    if (images !== undefined) updates.images = images;
    if (availableFrom !== undefined) updates.availableFrom = availableFrom;
    if (availableUntil !== undefined) updates.availableUntil = availableUntil;
    if (minLeaseTerm !== undefined) updates.minLeaseTerm = minLeaseTerm;
    if (maxTenants !== undefined) updates.maxTenants = maxTenants;
    if (petPolicy) {
      if (petPolicy.allowed !== undefined) updates.petPolicyAllowed = petPolicy.allowed;
      if (petPolicy.details !== undefined) updates.petPolicyDetails = petPolicy.details;
    }
    if (rules !== undefined) updates.rules = rules;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    if (status !== undefined) updates.status = status;

    const updatedProperty = await prisma.property.update({
      where: { id: req.params.id },
      data: updates,
      include: {
        landlord: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        category: {
          select: {
            name: true,
            description: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty
    });
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.landlordId !== req.userId && req.userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this property'
      });
    }

    await prisma.property.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getLandlordProperties = async (req, res, next) => {
  try {
    if (req.userRole !== ROLES.LANDLORD) {
      return res.status(403).json({
        success: false,
        message: 'Only landlords can access this endpoint'
      });
    }

    const properties = await prisma.property.findMany({
      where: { landlordId: req.userId },
      include: {
        category: {
          select: {
            name: true,
            description: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      message: 'Landlord properties fetched successfully',
      data: properties
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getLandlordProperties
};
