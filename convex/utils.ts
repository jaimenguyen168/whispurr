import { ConvexError } from "convex/values";

export const getAuthenticatedUser = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_external_id", (q: any) =>
      q.eq("externalId", identity.subject),
    )
    .unique();

  if (!user) {
    throw new ConvexError({
      code: "USER_NOT_FOUND",
      message: "User record not found",
    });
  }

  return user;
};

export const getImageUrl = async (ctx: any, imageField: string | undefined) => {
  if (!imageField) return undefined;

  if (imageField.startsWith("https://") || imageField.startsWith("http://")) {
    return imageField;
  }

  if (!imageField.startsWith("http")) {
    try {
      return await ctx.storage.getUrl(imageField);
    } catch (error) {
      console.error("Error getting Convex storage URL:", error);
      return undefined;
    }
  }

  return imageField;
};
