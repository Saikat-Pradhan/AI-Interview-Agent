import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { analyszeResume } from "../controllers/interview.js"

const interviewRouter = express.Router()

interviewRouter.post("/resume", isAuth, upload.single("resume"), analyszeResume)

export default interviewRouter