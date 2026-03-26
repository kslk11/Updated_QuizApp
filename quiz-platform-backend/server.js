import cors from "cors";
import dotenv from "dotenv";
import express from 'express';
import adminRoutes from "./src/routes/adminRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import clientRoutes from "./src/routes/clientRoutes.js";
import courseRoutes from "./src/routes/course.routes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import batchRoutes from "./src/routes/batch.routes.js";
import teacherRoutes from "./src/routes/teacher.routes.js";
import batchteacherRoutes from "./src/routes/batchTeacher.routes.js";
dotenv.config();

const app = express()

// const corsOptions = {
//   origin: 'http://quiz-frontend-aws.s3-website.ap-south-1.amazonaws.com',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// };

app.use(cors());
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Quiz Platform API Running")
})

const PORT = process.env.PORT || 9000

app.use("/api/batches", batchRoutes);
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/batch-teacher", batchteacherRoutes);

app.listen(9000, () => {
    console.log(`Server is live on all interfaces at port ${PORT}`);
});