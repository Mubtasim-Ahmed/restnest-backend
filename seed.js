const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const seedDatabase = async () => {
  try {
    await prisma.$connect();

    // Clear existing data
    await prisma.review.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.rentalRequest.deleteMany();
    await prisma.property.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('Cleared existing data');

    // Create categories
    const categories = [
      {
        name: 'Apartment',
        description: 'Modern apartment units with all amenities',
        icon: '🏢'
      },
      {
        name: 'House',
        description: 'Standalone houses with gardens and parking',
        icon: '🏠'
      },
      {
        name: 'Studio',
        description: 'Compact studio apartments for individuals',
        icon: '🛏️'
      },
      {
        name: 'Condo',
        description: 'Luxury condominiums in prime locations',
        icon: '✨'
      },
      {
        name: 'Townhouse',
        description: 'Spacious townhouses ideal for families',
        icon: '🏡'
      }
    ];

    const createdCategories = await prisma.category.createMany({ data: categories });
    console.log('Created categories:', createdCategories.count);

    const adminPassword = await bcrypt.hash('admin123456', 10);
    const landlordPassword = await bcrypt.hash('landlord123456', 10);
    const tenantPassword = await bcrypt.hash('tenant123456', 10);

    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@rentnest.com',
        password: adminPassword,
        phone: '+1234567890',
        role: 'admin',
        address: '123 Admin St',
        city: 'New York',
        country: 'USA'
      }
    });
    console.log('Created admin user');

    const landlord = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'landlord@rentnest.com',
        password: landlordPassword,
        phone: '+1234567891',
        role: 'landlord',
        address: '456 Landlord Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        bio: 'Professional property manager with 5 years of experience'
      }
    });
    console.log('Created landlord user');

    const tenant = await prisma.user.create({
      data: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'tenant@rentnest.com',
        password: tenantPassword,
        phone: '+1234567892',
        role: 'tenant',
        address: '789 Tenant Blvd',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'USA'
      }
    });
    console.log('Created tenant user');

    const categoriesList = await prisma.category.findMany();

    const properties = [
      {
        title: 'Spacious Manhattan Apartment',
        description: 'Beautiful 2-bedroom apartment in Manhattan with stunning city views',
        landlordId: landlord.id,
        categoryId: categoriesList[0].id,
        address: '123 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.0060,
        priceMonthly: 2500,
        priceSecurityDeposit: 5000,
        priceCurrency: 'USD',
        amenities: ['wifi', 'parking', 'gym', 'security'],
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 1200,
        images: [
          {
            url: 'https://via.placeholder.com/400x300?text=Living+Room',
            caption: 'Living room with city view'
          }
        ],
        maxTenants: 2,
        isAvailable: true,
        petPolicyAllowed: true,
        petPolicyDetails: 'Small pets only, max 2'
      },
      {
        title: 'Cozy Brooklyn Studio',
        description: 'Perfect studio apartment for professionals',
        landlordId: landlord.id,
        categoryId: categoriesList[2].id,
        address: '456 Park Ave',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        country: 'USA',
        latitude: 40.6782,
        longitude: -73.9442,
        priceMonthly: 1500,
        priceSecurityDeposit: 3000,
        priceCurrency: 'USD',
        amenities: ['wifi', 'laundry', 'security'],
        bedrooms: 1,
        bathrooms: 1,
        squareFootage: 500,
        images: [
          {
            url: 'https://via.placeholder.com/400x300?text=Studio',
            caption: 'Studio apartment'
          }
        ],
        maxTenants: 1,
        isAvailable: true,
        petPolicyAllowed: false
      },
      {
        title: 'Luxury Penthouse',
        description: 'Exclusive penthouse with rooftop terrace and modern amenities',
        landlordId: landlord.id,
        categoryId: categoriesList[3].id,
        address: '789 5th Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10003',
        country: 'USA',
        latitude: 40.7549,
        longitude: -73.9840,
        priceMonthly: 5000,
        priceSecurityDeposit: 10000,
        priceCurrency: 'USD',
        amenities: ['wifi', 'parking', 'pool', 'gym', 'security', 'balcony'],
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 2500,
        images: [
          {
            url: 'https://via.placeholder.com/400x300?text=Penthouse',
            caption: 'Luxury penthouse'
          }
        ],
        maxTenants: 4,
        isAvailable: true,
        petPolicyAllowed: true,
        petPolicyDetails: 'All pets allowed'
      }
    ];

    const createdProperties = await prisma.property.createMany({ data: properties });
    console.log('Created properties:', createdProperties.count);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@rentnest.com / admin123456');
    console.log('Landlord: landlord@rentnest.com / landlord123456');
    console.log('Tenant: tenant@rentnest.com / tenant123456');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
