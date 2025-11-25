import { query } from "../_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const externalId = "12345678";

    const user = await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
      .first();

    if (!user) {
      throw new Error(`User with external ID ${externalId} not found`);
    }

    return user;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error(`User with ID ${args.userId} not found`);
    }

    return user;
  },
});

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_external_id")
      .filter((q) => q.neq(q.field("externalId"), "12345678"))
      .collect();
  },
});
