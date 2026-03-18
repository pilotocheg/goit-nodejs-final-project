import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

import sequelize from "../db/sequelize.js";
import "../db/associations.js";

import Category from "../db/models/Category.js";
import Area from "../db/models/Area.js";
import Ingredient from "../db/models/Ingredient.js";
import User from "../db/models/User.js";
import Recipe from "../db/models/Recipe.js";
import RecipeIngredients from "../db/models/RecipeIngredients.js";
import Testimonial from "../db/models/Testimonial.js";
import { hashPassword } from "../helpers/hash.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_DIR = path.resolve(__dirname, "../data/seed");

const argv = new Set(process.argv.slice(2));
const withTruncate = argv.has("--truncate");
const withForceSync = argv.has("--sync-force");
const withAlterSync = argv.has("--sync-alter");

function readCsv(fileName) {
  const filePath = path.join(SEED_DIR, fileName);
  const csv = fs.readFileSync(filePath, "utf8");
  return parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

function normalizeEmptyToNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v);
  return s === "" ? null : v;
}

function normalizeEmptyToDefault(v, defaultValue = "") {
  if (v === undefined || v === null) return defaultValue;
  const s = String(v).trim();
  return s === "" ? defaultValue : v;
}

async function truncateAll() {
  const tables = [
    "recipe_ingredients",
    "user_favorites",
    "user_follows",
    "testimonials",
    "recipes",
    "ingredients",
    "categories",
    "areas",
    '"users"',
  ];

  for (const t of tables) {
    await sequelize.query(`TRUNCATE TABLE ${t} RESTART IDENTITY CASCADE;`);
  }
}

async function seed() {
  console.log("Seed directory:", SEED_DIR);

  await sequelize.authenticate();

  if (withForceSync || withAlterSync) {
    await sequelize.sync({ force: withForceSync, alter: withAlterSync });
  }

  if (withTruncate) {
    await truncateAll();
  }

  const categories = readCsv("categories.csv").map((r) => ({
    id: r.id,
    name: r.name,
  }));
  await Category.bulkCreate(categories, { ignoreDuplicates: true });

  const areas = readCsv("areas.csv").map((r) => ({ id: r.id, name: r.name }));
  await Area.bulkCreate(areas, { ignoreDuplicates: true });

  const ingredients = readCsv("ingredients.csv").map((r) => ({
    id: r.id,
    name: r.name,
    description: normalizeEmptyToNull(r.description),
    img: normalizeEmptyToNull(r.img),
  }));
  await Ingredient.bulkCreate(ingredients, { ignoreDuplicates: true });

  const defaultPasswordHash = await hashPassword("test");

  const users = readCsv("users.csv").map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    password: defaultPasswordHash,
    avatarURL: normalizeEmptyToNull(r.avatar),
  }));
  await User.bulkCreate(users, { ignoreDuplicates: true });

  const recipes = readCsv("recipes.csv").map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    area: r.area,
    instructions: r.instructions,
    description: r.description,
    thumb: r.thumb,
    preview: normalizeEmptyToNull(r.preview),
    time: Number(r.time),
    owner_id: r.owner_id,
  }));
  await Recipe.bulkCreate(recipes, { ignoreDuplicates: true });

  const recipeIngredients = readCsv("recipe_ingredients.csv").map((r) => ({
    recipe_id: r.recipe_id,
    ingredient_id: r.ingredient_id,
    measure: r.measure ?? "",
  }));
  await RecipeIngredients.bulkCreate(recipeIngredients, {
    ignoreDuplicates: true,
  });

  const testimonials = readCsv("testimonials.csv").map((r) => ({
    id: r.id,
    testimonial: r.testimonial,
    owner_id: r.owner_id,
  }));

  try {
    await Testimonial.bulkCreate(testimonials, { ignoreDuplicates: true });
  } catch (e) {
    console.warn(
      "Testimonial model mismatch (likely missing owner_id). Falling back to raw inserts.",
    );
    for (const t of testimonials) {
      await sequelize.query(
        `INSERT INTO testimonials (id, owner_id, testimonial)
         VALUES (:id, :owner_id, :testimonial)
         ON CONFLICT (id) DO NOTHING;`,
        { replacements: t },
      );
    }
  }

  console.log("Seed completed successfully");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
