import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";
import { ENV } from "./env.js";

export const inngest = new Inngest({
  id: "hire-lens",
  isDev: ENV.NODE_ENV !== "production",
});

//A background function that adds the user data to both mongoDB and streamDB when the clerk webhook fires
const syncUser = inngest.createFunction(
  {
    id: "sync-user",
    triggers: [{ event: "clerk/user.created" }],
  },
  async ({ event }) => {
     console.log("===== sync-user STARTED =====");
    console.log(event.data);

    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

       console.log("Creating Mongo user:", id);

    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      profileImage: image_url,
    };

    await User.create(newUser);

    await upsertStreamUser({
      id: newUser.clerkId.toString(),
      name: newUser.name,
      image: newUser.profileImage,
    });

    console.log("Mongo user created!");
    // Send welcome email later
  }
);

const deleteUserFromDB = inngest.createFunction(
  {
    id: "delete-user-from-db",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;

    if (!id) {
      console.error("No user ID provided in delete event");
      return;
    }

    await User.deleteOne({ clerkId: id });

    await deleteStreamUser(id.toString());
  }
);

export const functions = [syncUser, deleteUserFromDB];