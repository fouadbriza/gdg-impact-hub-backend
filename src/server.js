import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routers/authRoutes.js";
import oauthRoutes from "./routers/oauthRoutes.js";
import passwordordRoutes from "./routers/passwordRoutes.js";


dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/password", passwordordRoutes);


app.listen(3000, () => {
  console.log("Server is listening");
});
