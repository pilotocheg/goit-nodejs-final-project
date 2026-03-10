import "dotenv/config";
import "express-async-errors";

import app from "./server.js";
import connectDatabase from "./db/connect.js";
import initAppFolders from "./helpers/initAppFolders.js";

await connectDatabase();
await initAppFolders();

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server is running. Use our API on port: ${port}`);
});
