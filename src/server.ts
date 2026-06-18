import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";

// .js is used because when ts is going to compile the code
// server.ts will become server.js and app.ts will become app.js

import { PORT } from "./config/env.js";

async function startServer() {
  await connectDatabase();

  app.listen(PORT, async () => {
    console.log(`Server is running on PORT : ${PORT}`);
  });
}

startServer().catch((err) => {
  console.log("Failed to start", err);
  process.exit(1);
});
