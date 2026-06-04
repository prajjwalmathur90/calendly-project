import { app } from "./app.js";

// .js is used because when ts is going to compile the code
// server.ts will become server.js and app.ts will become app.js

import { PORT } from "./config/env.js";

export function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on PORT : ${PORT}`);
  });
}

startServer();
