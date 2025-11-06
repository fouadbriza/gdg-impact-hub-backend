import express from "express";
import dotenv from "dotenv";
import router from "./routers/router.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api', router)

app.listen(3000, () => {
  console.log("Server is listening");
});
