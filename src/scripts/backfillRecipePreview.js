/**
 * Backfill script for recipes.preview field.
 *
 * This script updates the 'preview' field for all recipes in the database where:
 *   - 'preview' is empty or null
 *   - 'thumb' starts with 'https://ftp.goit.study/img/so-yummy/preview/'
 *
 * For each such recipe, it sets 'preview' to:
 *   'https://ftp.goit.study/img/so-yummy/preview/large/<image-file>'
 * (i.e., inserts '/large/' after '/preview/' in the thumb URL)
 *
 * Usage:
 *   node -r dotenv/config ./src/scripts/backfillRecipePreview.js
 *     -- updates previews in the database, uses .env by default
 *   DOTENV_CONFIG_PATH=.env.prod node -r dotenv/config ./src/scripts/backfillRecipePreview.js
 *     -- updates previews, uses .env.prod instead of .env
 *   node -r dotenv/config ./src/scripts/backfillRecipePreview.js --dry-run
 *     -- shows how many recipes would be updated, but does not modify data
 *   DOTENV_CONFIG_PATH=.env.prod node -r dotenv/config ./src/scripts/backfillRecipePreview.js --dry-run
 *     -- dry-run with .env.prod
 *
 * Safe for repeated runs: only updates recipes with empty/null preview.
 */

import 'dotenv/config';

import sequelize from '../db/sequelize.js';
import connectDatabase from '../db/connect.js';
import Recipe from '../db/models/Recipe.js';

const SO_YUMMY_BASE = 'https://ftp.goit.study/img/so-yummy';
const PREVIEW_PREFIX = `${SO_YUMMY_BASE}/preview/`;
const PREVIEW_LARGE_PREFIX = `${SO_YUMMY_BASE}/preview/large/`;

async function main() {
  await connectDatabase();

  const dryRun = process.argv.includes('--dry-run');

  const dialect = sequelize.getDialect();
  if (dialect !== 'postgres') {
    throw new Error(`Unsupported dialect for this script: ${dialect}. Expected 'postgres'.`);
  }

  const tableName = Recipe.getTableName();
  const qTable = typeof tableName === 'string' ? `"${tableName}"` : `"${tableName.tableName}"`;

  const countSql = `
    SELECT COUNT(*)::int AS affected
    FROM ${qTable}
    WHERE ("preview" IS NULL OR BTRIM(COALESCE("preview", '')) = '')
      AND "thumb" LIKE :thumbLike;
  `;

  const updateSql = `
    UPDATE ${qTable}
    SET "preview" = :largePrefix || SUBSTRING("thumb" FROM :startPos)
    WHERE ("preview" IS NULL OR BTRIM(COALESCE("preview", '')) = '')
      AND "thumb" LIKE :thumbLike;
  `;

  const replacements = {
    thumbLike: `${PREVIEW_PREFIX}%`,
    largePrefix: PREVIEW_LARGE_PREFIX,
    startPos: PREVIEW_PREFIX.length + 1,
  };

  const [[countRow]] = await sequelize.query(countSql, { replacements });
  const affected = Number(countRow?.affected ?? 0);

  if (!dryRun && affected > 0) {
    await sequelize.query(updateSql, { replacements });
  }

  if (!dryRun) {
    await sequelize.close();
  }

  console.log(
    `${dryRun ? '[dry-run] ' : ''}Backfill completed. Updated previews for ${affected} recipes.`
  );
}

main().catch(async (err) => {
  console.error(err);
  try {
    await sequelize.close();
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
  process.exit(1);
});
