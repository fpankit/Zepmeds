// It is recommended to store secrets in an environment file.
// This configuration reads from your .env file.

export const HMS_CONFIG = {
  ACCESS_KEY: process.env.HMS_ACCESS_KEY,
  SECRET: process.env.HMS_SECRET,
  ROOM_ID: process.env.NEXT_PUBLIC_HMS_ROOM_ID,
};
