import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import {
          analyszeResume, 
          generateQuestions, 
          submitAnswer, 
          finishInterview, 
          deleteInterview,
          getMyInterviews, 
          getInterviewReport 
        } from "../controllers/interview.js"

const interviewRouter = express.Router()

interviewRouter.post("/resume", isAuth, upload.single("resume"), analyszeResume)
interviewRouter.post("/generate-questions", isAuth, generateQuestions)
interviewRouter.post("/submit-answer", isAuth, submitAnswer)
interviewRouter.post("/finish", isAuth, finishInterview)
interviewRouter.post("/delete/:id", isAuth, deleteInterview)

interviewRouter.get("/get-interview", isAuth, getMyInterviews)
interviewRouter.get("/report/:id", isAuth, getInterviewReport)

export default interviewRouter