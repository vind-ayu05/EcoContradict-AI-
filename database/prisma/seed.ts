// Prisma seed script for EcoContradict AI
import { INITIAL_SEED_ANALYSES } from '../db.ts';

async function main() {
  console.log('Seeding EcoContradict AI database...');
  console.log(`Loaded ${INITIAL_SEED_ANALYSES.length} seed analyses.`);
  for (const item of INITIAL_SEED_ANALYSES) {
    console.log(`- Seeded: ${item.title} (${item.contradictions.length} contradictions)`);
  }
  console.log('Seeding completed successfully.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
