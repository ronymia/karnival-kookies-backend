import fs from 'fs';
import path from 'path';

const createMigration = () => {
  const migrationName = process.argv[2];

  if (!migrationName) {
    console.error('Please provide a migration name.');
    console.error('Usage: npm run migration:create <migration_name>');
    process.exit(1);
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, '')
    .slice(0, 14);
  const fileName = `${timestamp}_${migrationName}.sql`;
  const migrationsDir = path.join(process.cwd(), 'src', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const filePath = path.join(migrationsDir, fileName);
  fs.writeFileSync(filePath, '-- Migration: ' + migrationName + '\n\n', 'utf8');

  console.log(`Migration created: ${filePath}`);
};

createMigration();
