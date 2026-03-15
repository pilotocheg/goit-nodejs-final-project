/**
 * OpenAPI 3.0 specification for Foodies API
 * Documentation available at /api-docs
 */
export default {
  openapi: "3.0.3",
  info: {
    title: "Foodies API",
    description: `
## Overview

REST API for a culinary application. Provides registration, authentication, profile management, and reference data.

## Authentication

Most endpoints require a JWT token. After successful **login**, get the \`token\` from the response and add it to each protected request:

\`\`\`
Authorization: Bearer <your_token>
\`\`\`

## Base URL

\`/api\`
    `,
    version: "1.0.0",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: "/api",
      description: "API Server",
    },
  ],
  tags: [
    { name: "Auth", description: "Registration and authentication" },
    { name: "Users", description: "Profile, subscriptions and favorites" },
    { name: "Recipes", description: "Recipe CRUD and search" },
    { name: "Ingredients", description: "Ingredients list" },
    { name: "Categories", description: "Recipe categories" },
    { name: "Areas", description: "World cuisines" },
    { name: "Testimonials", description: "User testimonials" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token from POST /auth/login endpoint",
      },
    },
    schemas: {
      AuthUser: {
        type: "object",
        properties: {
          name: { type: "string", example: "John Doe" },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          avatarURL: {
            type: "string",
            nullable: true,
            example: "avatars/abc123.jpg",
          },
        },
      },
      CurrentUserProfile: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          avatarURL: { type: "string", nullable: true },
          recipesCount: { type: "integer" },
          favoritesCount: { type: "integer" },
          followersCount: { type: "integer" },
          followingCount: { type: "integer" },
          recipes: {
            type: "array",
            items: { $ref: "#/components/schemas/RecipePreview" },
          },
          favoriteRecipes: {
            type: "array",
            items: { $ref: "#/components/schemas/RecipePreview" },
          },
        },
      },
      UserProfile: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          avatarURL: { type: "string", nullable: true },
          recipesCount: { type: "integer" },
          followersCount: { type: "integer" },
          recipes: {
            type: "array",
            items: { $ref: "#/components/schemas/RecipePreview" },
          },
        },
      },
      RecipePreview: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          thumb: { type: "string" },
          preview: { type: "string", nullable: true },
          time: { type: "integer" },
        },
      },
      Subscriber: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          avatarURL: { type: "string", nullable: true },
          recipesCount: { type: "integer" },
          recipeImageUrls: { type: "array", items: { type: "string" } },
          isFollowing: { type: "boolean" },
        },
      },
      PaginatedSubscribers: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Subscriber" },
          },
          total: { type: "integer" },
          page: { type: "integer" },
          limit: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      PaginatedFavorites: {
        type: "object",
        properties: {
          favoriteRecipes: {
            type: "array",
            items: { $ref: "#/components/schemas/Recipe" },
          },
          total: { type: "integer" },
          totalPages: { type: "integer" },
          currentPage: { type: "integer" },
          limit: { type: "integer" },
        },
      },
      Ingredient: {
        type: "object",
        properties: {
          id: { type: "string", example: "640c2dd963a319ea671e37aa" },
          name: { type: "string", example: "Flour" },
          description: { type: "string", nullable: true },
          img: { type: "string", nullable: true },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
        },
      },
      Area: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
        },
      },
      Testimonial: {
        type: "object",
        properties: {
          id: { type: "string" },
          testimonial: { type: "string" },
        },
      },
      RecipeOwner: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          avatarURL: { type: "string", nullable: true },
          email: { type: "string", description: "Only in recipe details" },
        },
      },
      RecipeIngredient: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          img: { type: "string", nullable: true },
          RecipeIngredients: {
            type: "object",
            properties: { measure: { type: "string" } },
          },
        },
      },
      Recipe: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          category: { type: "string" },
          area: { type: "string" },
          instructions: { type: "string" },
          description: { type: "string" },
          thumb: { type: "string" },
          preview: { type: "string", nullable: true },
          time: { type: "integer" },
          owner_id: { type: "string" },
          owner: { $ref: "#/components/schemas/RecipeOwner" },
          ingredients: {
            type: "array",
            items: { $ref: "#/components/schemas/RecipeIngredient" },
          },
        },
      },
      SearchResult: {
        type: "object",
        properties: {
          recipes: {
            type: "array",
            items: { $ref: "#/components/schemas/Recipe" },
          },
          total: { type: "integer" },
          totalPages: { type: "integer" },
          currentPage: { type: "integer" },
          limit: { type: "integer" },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    // ============ AUTH ============
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register",
        description:
          "Creates a new user. Password must be at least 6 characters.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "John Doe" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "john@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 6,
                    example: "secret123",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/AuthUser" },
                  },
                },
                example: {
                  user: {
                    name: "John Doe",
                    email: "john@example.com",
                    avatarURL: "https://www.gravatar.com/avatar/...",
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        description: "Authenticate. Returns JWT token for subsequent requests.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "john@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 6,
                    example: "secret123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                      description: "JWT token for Authorization header",
                    },
                    user: { $ref: "#/components/schemas/AuthUser" },
                  },
                },
                example: {
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  user: {
                    name: "John Doe",
                    email: "john@example.com",
                    avatarURL: "https://www.gravatar.com/avatar/...",
                  },
                },
              },
            },
          },
          401: {
            description: "Invalid email or password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        description: "Sign out. Requires Bearer token.",
        security: [{ BearerAuth: [] }],
        responses: {
          204: { description: "Logout successful" },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    // ============ USERS ============
    "/users/current": {
      get: {
        tags: ["Users"],
        summary: "Current user",
        description:
          "Authenticated user data with followers and following count.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Current user profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CurrentUserProfile" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/{userId}": {
      get: {
        tags: ["Users"],
        summary: "User profile",
        description: "Public user data by ID (no followingCount).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "User profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserProfile" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/avatar": {
      patch: {
        tags: ["Users"],
        summary: "Update avatar",
        description: "Upload new avatar image. Form-data, field: `avatar`.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  avatar: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Avatar updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { avatarURL: { type: "string" } },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/following": {
      get: {
        tags: ["Users"],
        summary: "My following",
        description: "Paginated list of users the current user is following.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          200: {
            description: "Following list (paginated)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedSubscribers" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/{profileUserId}/subscribers": {
      get: {
        tags: ["Users"],
        summary: "Profile subscribers",
        description: "Paginated list of subscribers for the specified user.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "profileUserId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          200: {
            description: "Subscribers list (paginated)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedSubscribers" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/follow": {
      patch: {
        tags: ["Users"],
        summary: "Follow user",
        description: "Follow a user.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["targetUserId"],
                properties: {
                  targetUserId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          204: {
            description: "Follow created (no body)",
          },
          400: {
            description: "Cannot follow yourself",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Already following",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/{targetUserId}/follow": {
      delete: {
        tags: ["Users"],
        summary: "Unfollow user",
        description: "Remove following for a user.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "targetUserId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          204: {
            description: "Unfollow completed (no body)",
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Not following this user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/favorites": {
      get: {
        tags: ["Users"],
        summary: "Get favorites",
        description: "Paginated list of recipes added to favorites by the current user.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          200: {
            description: "Favorites list (paginated)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedFavorites" },
              },
            },
          },
          400: {
            description: "Invalid pagination (e.g. page < 1)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Page not found (page out of range)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/favorites/{recipeId}": {
      post: {
        tags: ["Users"],
        summary: "Add to favorites",
        description: "Add a recipe to favorites.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "recipeId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          201: {
            description: "Added to favorites",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Added to favorites" },
                  },
                },
              },
            },
          },
          400: {
            description: "Recipe already in favorites",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Recipe not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Remove from favorites",
        description: "Remove a recipe from favorites.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "recipeId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Removed from favorites",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Removed from favorites",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Recipe not found or not in favorites",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    // ============ RECIPES ============
    "/recipes/own": {
      get: {
        tags: ["Recipes"],
        summary: "My recipes",
        description: "List of recipes created by the current user.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "User's recipes",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Recipe" },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/recipes/search": {
      get: {
        tags: ["Recipes"],
        summary: "Search recipes",
        description:
          "Search recipes by category, area, ingredient. Pagination supported.",
        parameters: [
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
            description: "Filter by category (partial match)",
          },
          {
            name: "area",
            in: "query",
            schema: { type: "string" },
            description: "Filter by area/cuisine (partial match)",
          },
          {
            name: "ingredient",
            in: "query",
            schema: { type: "string" },
            description: "Filter by ingredient name (partial match)",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
        ],
        responses: {
          200: {
            description: "Search results with pagination",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SearchResult" },
              },
            },
          },
          404: {
            description: "No recipes found or page out of range",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/recipes/popular": {
      get: {
        tags: ["Recipes"],
        summary: "Popular recipes",
        description: "Top 10 recipes by number of favorites.",
        responses: {
          200: {
            description: "Popular recipes",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    recipes: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Recipe" },
                    },
                    total: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/recipes/{id}": {
      get: {
        tags: ["Recipes"],
        summary: "Recipe details",
        description:
          "Recipe by ID with full details including owner and ingredients.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Recipe details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Recipe" },
              },
            },
          },
          404: {
            description: "Recipe not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Recipes"],
        summary: "Delete recipe",
        description: "Delete own recipe by ID.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Recipe deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Recipe deleted successfully",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Recipe not found or not authorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/recipes": {
      post: {
        tags: ["Recipes"],
        summary: "Create recipe",
        description:
          "Create a new recipe. Multipart form-data: `thumb` (image), `title`, `category`, `area`, `instructions`, `description`, `time`, `preview` (optional), `ingredients` (JSON array of {ingredientId, measure}).",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: [
                  "thumb",
                  "title",
                  "category",
                  "area",
                  "instructions",
                  "description",
                  "time",
                  "ingredients",
                ],
                properties: {
                  thumb: { type: "string", format: "binary", description: "Recipe image" },
                  title: { type: "string" },
                  category: { type: "string" },
                  area: { type: "string" },
                  instructions: { type: "string" },
                  description: { type: "string" },
                  time: { type: "integer" },
                  preview: { type: "string" },
                  ingredients: {
                    type: "string",
                    description: "JSON array: [{ingredientId, measure}]",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Recipe created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    recipe: { $ref: "#/components/schemas/Recipe" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    // ============ INGREDIENTS ============
    "/ingredients": {
      get: {
        tags: ["Ingredients"],
        summary: "Ingredients list",
        description: "Public endpoint. Returns all ingredients sorted by name.",
        responses: {
          200: {
            description: "Ingredients list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Ingredient" },
                },
                example: [
                  {
                    id: "640c2dd963a319ea671e37aa",
                    name: "Flour",
                    description: "Wheat flour, premium grade",
                    img: "https://example.com/flour.jpg",
                  },
                ],
              },
            },
          },
        },
      },
    },

    // ============ CATEGORIES ============
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "Categories list",
        description: "Public endpoint. Recipe categories.",
        responses: {
          200: {
            description: "Categories list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Category" },
                },
              },
            },
          },
        },
      },
    },

    // ============ AREAS ============
    "/areas": {
      get: {
        tags: ["Areas"],
        summary: "Areas list",
        description:
          "Public endpoint. World cuisines (Ukrainian, Italian, etc.).",
        responses: {
          200: {
            description: "Areas list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Area" },
                },
              },
            },
          },
        },
      },
    },

    // ============ TESTIMONIALS ============
    "/testimonials": {
      get: {
        tags: ["Testimonials"],
        summary: "Testimonials list",
        description: "Public endpoint. User testimonials.",
        responses: {
          200: {
            description: "Testimonials list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Testimonial" },
                },
              },
            },
          },
        },
      },
    },
  },
};
