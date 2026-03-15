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

function buildLargePreviewFromThumb(thumb) {
  if (typeof thumb !== 'string') return null;
  if (!thumb.startsWith(SO_YUMMY_BASE)) return null;

  // thumb example: https://ftp.goit.study/img/so-yummy/preview/Battenberg%20Cake.jpg
  // preview:       https://ftp.goit.study/img/so-yummy/preview/large/Battenberg%20Cake.jpg
  if (thumb.startsWith(PREVIEW_LARGE_PREFIX)) return thumb;

  if (thumb.startsWith(PREVIEW_PREFIX)) {
    return PREVIEW_LARGE_PREFIX + thumb.slice(PREVIEW_PREFIX.length);
  }

  return null;
}

async function main() {
  await connectDatabase();

  const dryRun = process.argv.includes('--dry-run');

  const recipes = await Recipe.findAll({
    attributes: ['id', 'thumb', 'preview'],
  });

  let affected = 0;

  for (const r of recipes) {
    const currentPreview = r.preview;
    const needsPreview = currentPreview == null || String(currentPreview).trim() === '';
    if (!needsPreview) continue;

    const nextPreview = buildLargePreviewFromThumb(r.thumb);
    if (!nextPreview) continue;

    affected += 1;

    if (!dryRun) {
      await Recipe.update(
        { preview: nextPreview },
        {
          where: { id: r.id },
        }
      );
    }
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
