import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gdg.dev' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@gdg.dev',
      passwordHash: adminPassword,
      role: 'ADMIN',
      bio: 'Platform administrator',
    },
  });

  // Create mentor user
  const mentorPassword = await bcrypt.hash('Mentor123!', 10);
  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@gdg.dev' },
    update: {},
    create: {
      name: 'John Mentor',
      email: 'mentor@gdg.dev',
      passwordHash: mentorPassword,
      role: 'MENTOR',
      bio: 'Experienced software engineer and mentor',
      githubHandle: 'johnmentor',
    },
  });

  // Create mentorship profile for mentor
  await prisma.mentorshipProfile.upsert({
    where: { userId: mentor.id },
    update: {},
    create: {
      userId: mentor.id,
      bio: 'Specialized in web development and cloud architecture',
      skills: ['JavaScript', 'Node.js', 'React', 'AWS', 'Docker'],
      availability: true,
      hourlyCapacity: 10,
      rating: 4.8,
    },
  });

  // Create regular member user
  const memberPassword = await bcrypt.hash('Member123!', 10);
  const member = await prisma.user.upsert({
    where: { email: 'member@gdg.dev' },
    update: {},
    create: {
      name: 'Jane Member',
      email: 'member@gdg.dev',
      passwordHash: memberPassword,
      role: 'MEMBER',
      bio: 'Passionate about learning and building cool projects',
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log('\n📝 Test Users:');
  console.log('Admin  - email: admin@gdg.dev  | password: Admin123!');
  console.log('Mentor - email: mentor@gdg.dev | password: Mentor123!');
  console.log('Member - email: member@gdg.dev | password: Member123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
