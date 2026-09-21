"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding Bhoomi Bulletin database with initial production-ready data...');
    // 1. Clean existing records safely
    await prisma.analyticsEvent.deleteMany();
    await prisma.leadNote.deleteMany();
    await prisma.enquiry.deleteMany();
    await prisma.propertyRequirement.deleteMany();
    await prisma.review.deleteMany();
    await prisma.favouriteProperty.deleteMany();
    await prisma.savedSearch.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.property.deleteMany();
    await prisma.article.deleteMany();
    await prisma.siteSetting.deleteMany();
    await prisma.informationChangeRequest.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany();
    // 2. Create Users
    const adminPassword = await bcryptjs_1.default.hash('Admin@123456', 12);
    const userPassword = await bcryptjs_1.default.hash('User@123456', 12);
    const admin = await prisma.user.create({
        data: {
            name: 'Bhoomi Bulletin Chief Editor',
            email: 'admin@bhoomibulletin.com',
            phone: '9811000001',
            passwordHash: adminPassword,
            role: 'ADMIN',
            userType: 'OWNER',
            isEmailVerified: true,
            isPhoneVerified: true,
            verificationStatus: 'VERIFIED',
            bio: 'Head of editorial and listings verification at Bhoomi Bulletin.',
            companyName: 'Bhoomi Bulletin Media Network',
        },
    });
    const broker = await prisma.user.create({
        data: {
            name: 'Rajesh Sharma',
            email: 'rajesh.broker@bhoomibulletin.com',
            phone: '9811000002',
            passwordHash: userPassword,
            role: 'BROKER',
            userType: 'BROKER',
            isEmailVerified: true,
            isPhoneVerified: true,
            verificationStatus: 'VERIFIED',
            companyName: 'Sharma & Associates Real Estate',
            licenseNumber: 'RERA-DEL-2023-8891',
            bio: '15+ years experience in South Delhi and Gurugram premium residential and commercial investments.',
        },
    });
    const agent = await prisma.user.create({
        data: {
            name: 'Priya Verma',
            email: 'priya.agent@bhoomibulletin.com',
            phone: '9811000003',
            passwordHash: userPassword,
            role: 'AGENT',
            userType: 'AGENT',
            isEmailVerified: true,
            isPhoneVerified: true,
            verificationStatus: 'VERIFIED',
            companyName: 'NCR Premier Realty',
            licenseNumber: 'RERA-NOI-2022-4412',
            bio: 'Specialist in Noida Expressway and Greater Noida commercial hubs and high-rise apartments.',
        },
    });
    const owner = await prisma.user.create({
        data: {
            name: 'Vikram Singh',
            email: 'vikram.singh@gmail.com',
            phone: '9811000004',
            passwordHash: userPassword,
            role: 'USER',
            userType: 'OWNER',
            isEmailVerified: true,
            isPhoneVerified: true,
            verificationStatus: 'NONE',
            bio: 'Individual property investor looking to advertise premium residential apartments.',
        },
    });
    // 3. Site Settings & Branding
    const settingsData = [
        { key: 'site_name', value: 'BHOOMI BULLETIN' },
        { key: 'site_tagline', value: 'Real Estate News, Property Advertising & Verified Listings' },
        { key: 'site_logo_desktop', value: '/logo.svg' },
        { key: 'site_logo_mobile', value: '/logo.svg' },
        { key: 'site_favicon', value: '/favicon.ico' },
        { key: 'contact_email', value: 'contact@bhoomibulletin.com' },
        { key: 'contact_phone', value: '+91 98110 00001' },
        { key: 'contact_address', value: '14, Barakhamba Road, Connaught Place, New Delhi 110001' },
        { key: 'social_facebook', value: 'https://facebook.com/bhoomibulletin' },
        { key: 'social_twitter', value: 'https://twitter.com/bhoomibulletin' },
        { key: 'social_instagram', value: 'https://instagram.com/bhoomibulletin' },
        { key: 'social_youtube', value: 'https://youtube.com/@bhoomibulletin' },
        { key: 'social_whatsapp', value: 'https://wa.me/919811000001' },
        { key: 'seo_default_title', value: 'BHOOMI BULLETIN — Premier Real Estate News & Property Advertising' },
        { key: 'seo_default_description', value: 'India’s trusted portal for verified real-estate news, high-visibility property advertisements, broker CRM and direct buyer inquiries.' },
        { key: 'seo_default_keywords', value: 'real estate news, property advertising, buy 3bhk flat, commercial property, plot for sale, delhi ncr properties, rera verified' },
    ];
    for (const s of settingsData) {
        await prisma.siteSetting.create({ data: s });
    }
    // 4. Properties & Advertisements
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);
    const nextThreeMonths = new Date();
    nextThreeMonths.setMonth(now.getMonth() + 3);
    const prop1 = await prisma.property.create({
        data: {
            userId: broker.id,
            title: 'Luxury 4 BHK Penthouse with Private Terrace & Panoramic Skyline Views',
            slug: 'luxury-4-bhk-penthouse-private-terrace-golf-course-road-gurugram',
            description: 'Ultra-luxurious 4-bedroom penthouse located in the prestigious Golf Course Road corridor. Featuring bespoke Italian marble flooring, 12-ft ceiling heights, wraparound private terrace garden, dedicated double-height servant quarters, and 3 covered basement parking slots. 24x7 3-tier biometric security, heated rooftop infinity pool, and world-class club amenities.',
            propertyType: 'APARTMENT',
            listingType: 'BUY',
            userType: 'BROKER',
            price: 48500000, // 4.85 Cr
            priceNegotiable: true,
            location: 'Sector 54, Golf Course Road',
            city: 'Gurugram',
            state: 'Haryana',
            pincode: '122002',
            sizeSqFt: 4200,
            bedrooms: 4,
            bathrooms: 5,
            furnishing: 'Semi-Furnished',
            features: JSON.stringify(['Private Terrace', 'Modular Italian Kitchen', 'Central Air Conditioning', 'Smart Home Automation', '3 Covered Car Parking']),
            amenities: JSON.stringify(['Clubhouse', 'Swimming Pool', 'Gymnasium', '24/7 Power Backup', 'EV Charging Station', 'Tennis Court']),
            photos: JSON.stringify([
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
            ]),
            featuredImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            status: 'APPROVED',
            isPublished: true,
            publishedAt: now,
            verificationStatus: 'VERIFIED',
            verifiedAt: now,
            isAdvertisement: true,
            adDuration: 'MONTH_3',
            adStartDate: now,
            adExpiryDate: nextThreeMonths,
            isFeatured: true,
            viewsCount: 342,
            phoneClicks: 28,
            whatsappClicks: 19,
        },
    });
    const prop2 = await prisma.property.create({
        data: {
            userId: agent.id,
            title: 'Prime Grade-A Commercial Retail Shop in High Footfall Sector 18 Mall',
            slug: 'prime-grade-a-commercial-retail-shop-sector-18-noida',
            description: 'Ground floor road-facing corner retail space available for immediate investment or lease. Located in Sector 18 Noida central business hub, right opposite the metro station with guaranteed daily footfall of 25,000+ visitors. Pre-leased option available with 8.2% annual net rental yield.',
            propertyType: 'SHOP',
            listingType: 'BUY',
            userType: 'AGENT',
            price: 18500000, // 1.85 Cr
            priceNegotiable: false,
            location: 'Sector 18 Commercial Hub',
            city: 'Noida',
            state: 'Uttar Pradesh',
            pincode: '201301',
            sizeSqFt: 850,
            bathrooms: 1,
            furnishing: 'Furnished',
            features: JSON.stringify(['Corner Unit', 'Road Facing', 'High Ceiling (14 ft)', 'Pre-approved Bank Loan']),
            amenities: JSON.stringify(['24/7 Security', 'Escalators & Elevators', 'Central HVAC', 'Dedicated Loading Bay']),
            photos: JSON.stringify([
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
            ]),
            featuredImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
            status: 'APPROVED',
            isPublished: true,
            publishedAt: now,
            verificationStatus: 'VERIFIED',
            verifiedAt: now,
            isAdvertisement: true,
            adDuration: 'MONTH_1',
            adStartDate: now,
            adExpiryDate: nextMonth,
            isFeatured: true,
            viewsCount: 189,
            phoneClicks: 15,
            whatsappClicks: 12,
        },
    });
    const prop3 = await prisma.property.create({
        data: {
            userId: owner.id,
            title: 'Spacious 3 BHK Sunlit Flat with Park View in Green Park Extension',
            slug: 'spacious-3-bhk-sunlit-flat-green-park-extension-delhi',
            description: 'Well-maintained freehold builder floor flat on 2nd floor with private lift and reserved stilt parking. Facing lush municipal park, walking distance from metro station and market. 3 large bedrooms with attached bathrooms, spacious modular kitchen with utility balcony.',
            propertyType: 'APARTMENT',
            listingType: 'BUY',
            userType: 'OWNER',
            price: 29500000, // 2.95 Cr
            priceNegotiable: true,
            location: 'Green Park Extension',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110016',
            sizeSqFt: 1850,
            bedrooms: 3,
            bathrooms: 3,
            furnishing: 'Semi-Furnished',
            features: JSON.stringify(['Park Facing', 'Freehold Title', 'Lift Access', 'Balcony with Every Room']),
            amenities: JSON.stringify(['Gated Community', '24/7 Security Guard', 'Dedicated Water Reservoir']),
            photos: JSON.stringify([
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
            ]),
            featuredImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            status: 'APPROVED',
            isPublished: true,
            publishedAt: now,
            verificationStatus: 'VERIFIED',
            verifiedAt: now,
            isAdvertisement: true,
            adDuration: 'MONTH_2',
            adStartDate: now,
            adExpiryDate: nextMonth,
            viewsCount: 220,
            phoneClicks: 18,
            whatsappClicks: 9,
        },
    });
    const prop4 = await prisma.property.create({
        data: {
            userId: owner.id,
            title: 'Freehold Residential Villa Plot in Gated Township near Jewar Airport',
            slug: 'freehold-residential-villa-plot-gated-township-jewar-airport',
            description: 'Direct owner plot in a premium government-approved gated plotted development located just 15 minutes drive from Noida International Airport (Jewar). Complete infrastructure with 40-ft wide blacktop roads, underground electrification, and ready for immediate registry and construction.',
            propertyType: 'PLOT_LAND',
            listingType: 'BUY',
            userType: 'OWNER',
            price: 5500000, // 55 Lakh
            priceNegotiable: true,
            location: 'Yamuna Expressway Sector 22D',
            city: 'Greater Noida',
            state: 'Uttar Pradesh',
            pincode: '203201',
            sizeSqFt: 2250,
            features: JSON.stringify(['RERA Registered', 'Immediate Registry', 'Clear Title', 'Corner Plot']),
            amenities: JSON.stringify(['Gated Township', 'Boundary Wall', 'Parks & Green Belts', 'Wide Internal Roads']),
            photos: JSON.stringify([
                'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
            ]),
            featuredImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
            status: 'APPROVED',
            isPublished: true,
            publishedAt: now,
            verificationStatus: 'PENDING',
            isAdvertisement: true,
            adDuration: 'MONTH_1',
            adStartDate: now,
            adExpiryDate: nextMonth,
            viewsCount: 145,
            phoneClicks: 12,
            whatsappClicks: 7,
        },
    });
    // 5. News Articles & Video News
    await prisma.article.create({
        data: {
            authorId: admin.id,
            title: 'India Real Estate Inflows Surge 28% in 2026 Driven by Global Institutional Capital',
            slug: 'india-real-estate-inflows-surge-28-percent-2026-institutional-capital',
            category: 'NEWS',
            excerpt: 'Foreign institutional investments and domestic REIT expansions have driven a historic capital infusion into India’s residential and commercial real-estate sectors.',
            content: `The Indian real estate sector has registered a phenomenal 28% year-on-year surge in institutional investments during the first half of 2026, according to the latest research bulletin released today.

Key market drivers include:
1. **Tier-1 Luxury Housing Momentum**: Metropolitan hubs including Delhi-NCR, Mumbai Metropolitan Region (MMR), and Bengaluru witnessed record absorption in projects priced above ₹3 Crore.
2. **Commercial Leasing Resurgence**: Global Capability Centers (GCCs) and tech enterprises accounted for over 65% of net office space absorption across top business parks.
3. **Infrastructure Corridors**: Rapid commissioning of high-speed expressways and regional rapid transit systems (RRTS) has stimulated unprecedented capital appreciation in suburban corridors.

Industry analysts forecast sustained momentum over the upcoming festive season, supported by steady interest rate regimes and strong buyer sentiment.`,
            featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
            tags: JSON.stringify(['Investment', 'Market Trends', 'REIT', 'Commercial']),
            isPublished: true,
            publishedAt: now,
            viewsCount: 420,
        },
    });
    await prisma.article.create({
        data: {
            authorId: admin.id,
            title: 'RERA Compliance & Title Verification: 7 Critical Checklist Items Every Homebuyer Must Review',
            slug: 'rera-compliance-title-verification-7-critical-checklist-items-homebuyer',
            category: 'REAL_ESTATE',
            excerpt: 'Legal experts break down the indispensable due diligence steps required before signing an agreement or transferring earnest money for property in India.',
            content: `Purchasing real estate represents one of the largest financial commitments for Indian families and investors. Before executing a builder-buyer agreement or executing a conveyance deed, buyers must verify these fundamental legal safeguards:

1. **Verify Official RERA Registration**: Ensure the project is active on the state RERA portal and check whether the developer has maintained quarterly progress updates.
2. **Title Deed & Chain of Ownership**: Request a title search report spanning at least 30 years conducted by an independent advocate.
3. **Encumbrance Certificate (EC)**: Confirm the absence of existing mortgages, court attachments, or bank liens from the sub-registrar office.
4. **Sanctioned Building Plan & OC**: Verify that construction strictly adheres to municipal sanctions and that the developer has obtained an Occupancy Certificate (OC).
5. **No Objection Certificates (NOCs)**: Review environmental clearance, fire department NOC, and airport authority clearances where applicable.`,
            featuredImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
            tags: JSON.stringify(['RERA', 'Homebuyer Guide', 'Legal', 'Title Search']),
            isPublished: true,
            publishedAt: now,
            viewsCount: 380,
        },
    });
    await prisma.article.create({
        data: {
            authorId: admin.id,
            title: 'Video Report: Ground Reality of Jewar Airport Expressway Corridor Property Appreciation',
            slug: 'video-report-jewar-airport-expressway-corridor-property-appreciation',
            category: 'VIDEO_NEWS',
            excerpt: 'Watch our on-the-ground visual analysis of residential plots, logistics parks, and commercial developments along the Yamuna Expressway.',
            content: `In this comprehensive video report, Bhoomi Bulletin senior correspondents travel along the Yamuna Expressway to inspect physical infrastructure development, metro connectivity corridors, and real market pricing trends around the Jewar Noida International Airport.`,
            featuredImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            tags: JSON.stringify(['Video', 'Jewar Airport', 'Infrastructure', 'Ground Report']),
            isPublished: true,
            publishedAt: now,
            viewsCount: 512,
        },
    });
    // 6. Sample Enquiries & Requirements in CRM
    const enquiry1 = await prisma.enquiry.create({
        data: {
            propertyId: prop1.id,
            ownerAgentId: broker.id,
            userId: owner.id,
            name: 'Amitabh Sen',
            email: 'amitabh.sen@gmail.com',
            phone: '9871122334',
            message: 'Interested in scheduling a site visit this Saturday for the 4 BHK Penthouse. Would like to discuss payment schedule.',
            preferredContact: 'PHONE',
            status: 'NEW',
            source: 'PROPERTY_DETAIL_PAGE',
        },
    });
    await prisma.leadNote.create({
        data: {
            authorId: broker.id,
            enquiryId: enquiry1.id,
            note: 'Initial inquiry received via portal. Will call on Friday afternoon to confirm site visit slot.',
            actionType: 'NOTE',
            nextFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
    });
    await prisma.propertyRequirement.create({
        data: {
            userId: owner.id,
            name: 'Dr. Sunita Kapoor',
            email: 'sunita.kapoor@medresearch.org',
            phone: '9810998877',
            type: 'BUY',
            propertyType: 'APARTMENT',
            preferredLocation: 'South Delhi (Hauz Khas / Green Park / Greater Kailash)',
            budgetMin: 30000000, // 3 Cr
            budgetMax: 50000000, // 5 Cr
            preferredSize: '3-4 BHK, Min 2200 sq ft',
            additionalDetails: 'Must have dedicated stilt parking and elevator. Ready to move preferred.',
            status: 'QUALIFIED',
        },
    });
    // 7. Approved Reviews
    await prisma.review.create({
        data: {
            userId: owner.id,
            propertyId: prop1.id,
            rating: 5,
            title: 'Exceptional architectural finish and transparent broker assistance',
            content: 'Visited the penthouse with Rajesh Sharma. The build quality, clubhouse amenities, and high ceiling finish are unmatched in this micro-market.',
            status: 'APPROVED',
        },
    });
    // 8. Notifications
    await prisma.notification.create({
        data: {
            userId: admin.id,
            title: 'Platform Initialized Successfully',
            message: 'Bhoomi Bulletin database and system services are active. Persistent tables, media storage, and cron schedulers configured.',
            type: 'SUCCESS',
            link: '/admin',
            isRead: false,
        },
    });
    console.log('✅ Bhoomi Bulletin database seeded successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
