// Creates an admin account or resets its password.
// Usage: npm run admin:create -- email@example.com "mot-de-passe" "Nom affiché"
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const [email, password, name = "Administrateur"] = process.argv.slice(2);
if (!email || !password || password.length < 10) {
  console.error('Usage: npm run admin:create -- <email> "<mot de passe (10 caractères min.)>" ["Nom"]');
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const passwordHash = await hashPassword(password);
const user = await db.adminUser.upsert({
  where: { email: email.toLowerCase() },
  update: { passwordHash, name },
  create: { email: email.toLowerCase(), passwordHash, name },
});
console.log(`Admin ready: ${user.email}`);
await db.$disconnect();
