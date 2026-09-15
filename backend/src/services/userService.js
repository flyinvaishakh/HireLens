import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

export async function getOrCreateUser(clerkId) {
  // Check if user already exists
  let user = await User.findOne({ clerkId });

  if (user) {
    return user;
  }

  console.warn(
    `Mongo user missing for Clerk ID ${clerkId}. Recovering from Clerk...`
  );

  // Fetch authenticated user details from Clerk
  const clerkUser = await clerkClient.users.getUser(clerkId);

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    throw new Error("Authenticated Clerk user does not have an email address.");
  }

  user = await User.create({
    clerkId,
    name:
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
      "Unknown User",
    email,
    profileImage: clerkUser.imageUrl,
  });

  console.log(`Recovered Mongo user for ${clerkId}`);

  return user;
}