import express from "express";

const app = express();

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Sukses" });
});

app.listen(3000, () => console.log("Servernya jalan kok"));
