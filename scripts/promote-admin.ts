import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Uso: npx tsx scripts/promote-admin.ts correo@ejemplo.com");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: Role.ADMIN },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  console.log("Usuario promovido a ADMIN:");
  console.log(user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
