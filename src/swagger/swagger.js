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
    { name: "Users", description: "Profile and subscriptions" },
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
      User: {
        type: "object",
        properties: {
          name: { type: "string", example: "John Doe" },
          email: { type: "string", format: "email", example: "john@example.com" },
          avatarURL: { type: "string", nullable: true, example: "avatars/abc123.jpg" },
        },
      },
      UserProfile: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          avatarURL: { type: "string", nullable: true },
          followersCount: { type: "integer", description: "Number of followers" },
          followingCount: { type: "integer", description: "Number of following (only for /current)" },
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
        description: "Creates a new user. Password must be at least 6 characters.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "John Doe" },
                  email: { type: "string", format: "email", example: "john@example.com" },
                  password: { type: "string", minLength: 6, example: "secret123" },
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
                    user: { $ref: "#/components/schemas/User" },
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
          400: { description: "Invalid data", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          409: { description: "Email already in use", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
                  email: { type: "string", format: "email", example: "john@example.com" },
                  password: { type: "string", minLength: 6, example: "secret123" },
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
                    token: { type: "string", description: "JWT token for Authorization header" },
                    user: { $ref: "#/components/schemas/User" },
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
          401: { description: "Invalid email or password", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ============ USERS ============
    "/users/current": {
      get: {
        tags: ["Users"],
        summary: "Current user",
        description: "Authenticated user data with followers and following count.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Current user profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserProfile" },
              },
            },
          },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/users/{userId}": {
      get: {
        tags: ["Users"],
        summary: "User profile",
        description: "Public user data by ID.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
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
          404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/users/following": {
      get: {
        tags: ["Users"],
        summary: "My following",
        description: "List of users the current user is following.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Following list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Subscriber" },
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
    "/users/{profileUserId}/subscribers": {
      get: {
        tags: ["Users"],
        summary: "Profile subscribers",
        description: "List of subscribers for the specified user.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "profileUserId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Subscribers list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Subscriber" },
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
          201: {
            description: "Follow created, returns updated following list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Subscriber" },
                },
              },
            },
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
          { name: "targetUserId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Unfollow completed, returns updated following list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Subscriber" },
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
        description: "Public endpoint. World cuisines (Ukrainian, Italian, etc.).",
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
