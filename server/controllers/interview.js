import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import { askAi } from "../services/openRouter.js";
import User from "../models/user.js"
import Interview from "../models/interview.js"

export const analyszeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.this.status(400).json({ message: "Resume required" });
        }

        const filepath = req.file.path

        const fileBuffer = await fs.promises.readFile(filepath)
        const uint8Array = new Uint8Array(fileBuffer)

        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = "";

        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();

            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }

        resumeText = resumeText
            .replace(/\s+/g, " ")
            .trim();

        const messages = [
            {
                role: "system",
                content: `
                   Extract structured data from resume.
                   Return ONLY valid JSON. No markdown, no code fences.
                   Example:
                   {
                     "role": "string",
                     "experience": "string",
                     "projects": ["project1", "project2"],
                     "skills": ["skill1", "skill2"]
                    }
                `
            },
            {
                role: "user",
                content: resumeText
            }
        ];

        const aiResponse = await askAi(messages)
        const parsed = JSON.parse(aiResponse)

        fs.unlinkSync(filepath)

        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText
        })
    } catch (error) {
        console.error(error)

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }

        res.status(500).json({ message: error.message })
    }
}

export const generateQuestions = async (req, res) => {
    try {
        let { role, experience, mode, resumeText, projects, skills } = req.body

        role = role?.trim();
        experience = experience?.trim();
        mode = mode?.trim();

        if (!role || !experience || !mode) {
            return res.status(400).json({ message: "Role, Experience and Mode are required." })
        }

        const user = await User.findById(req.userId)

        if (!user) {
            return res.status(400).json({ message: "User Not Found" })
        }

        if (user.credits < 50) {
            return res.status(400).json({ message: "Not enough credits. Minimum 50 required." })
        }

        const projectText = Array.isArray(projects) && projects.length ? projects.join(",") : "None";
        const skillsText = Array.isArray(skills) && skills.length ? skills.join(",") : "None";
        const safeResume = resumeText?.trim() || "None";

        const userPrompt = `
           Role: ${role}
           Experience: ${experience}
           InterviewMode: ${mode}
           Projects: ${projectText}
           Skills: ${skillsText}
           Resume: ${safeResume}
        `;

        if (!userPrompt.trim()) {
            return res.status(400).json({
                message: "Prompt content is empty."
            })
        }

        const messages = [
            {
                role: "system",
                content:
                `Speak in simple, natural English as if you are directly talking to the candidate.

                Generate exactly 5 interview questions.

                ### Strict Rules:
                - Each question must contain between 15 and 25 words.
                - Each question must be a single complete sentence.
                - Do NOT number the questions.
                - Do NOT add explanations or extra text before/after.
                - One question per line only.
                - Keep language simple and conversational.
                - Questions must feel practical and realistic.
                
                ### Question Flow:
                Question 1 → always: "Please introduce yourself"
                Question 2 → easy
                Question 3 → medium
                Question 4 → medium
                Question 5 → hard

                ### Role Logic:
                - If role = "Technical":
                  - After introduction, ask questions based on theoritical concepts of skills in resume.
                  - Examples:
                    - If SQL is listed, ask queries or differences (DELETE vs TRUNCATE vs DROP).
                    - If Python is listed, ask a direct technical question about Python (not how it was used in projects).
                    - Ask on other listed skills to evaluate both theoretical and practical understanding.
                  - Last question must be hard, focusing on a theoretical concept from any skill.

                - If role = "HR":
                  - After introduction, ask non-technical HR questions such as:
                    - Tell me about your strengths
                    - Tell me about your weakness
                    - Explain your education background
                    - Explain your projects
                    - Share your internship experience (if listed)
                    - Why should we hire you?
                    - What are your salary expectations
                    - How do you handle pressure or stress
                    - How do you handle rejections
                    - Describe your hobbies
                    - Tell me about a time you solved a problem
                    - How do you handle team conflicts
                    - Where do you see yourself in 5 years
                  - Last question must be situation-based decision making: give a scenario and ask what decision the candidate would take.
                
                ### Difficulty Progression:
                - Easy → general background or simple HR/technical
                - Medium → project, internship, or applied skill
                - Hard → theoretical concept (Technical) or situation-based decision making (HR)

                ###Context:
                Make Questions based on the candidate's role, experience, interviewMode, projects, skills, and resume details.`
            },

            {
                role: "user",
                content: userPrompt
            }
        ];

        const aiResponse = await askAi(messages)

        if (!aiResponse || !aiResponse.trim()) {
            return res.status(500).json({
                message: "AI returned empty response."
            });
        }

        const questionsArray = aiResponse
            .split("\n")
            .map(q => q.trim())
            .filter(q => q.length > 0)
            .slice(0, 5);

        if (questionsArray.length === 0) {
            return res.status(500).json({
                message: "AI failed to generate questions."
            });
        }

        const updatedUser = await User.findByIdAndUpdate(req.userId, {
            $inc: { credits: -50 }
        }, { returnDocument: 'after' })

        const interview = await Interview.create({
            userId: user._id,
            role,
            experience,
            mode,
            resumeText: safeResume,
            questions: questionsArray.map((q, index) => ({
                question: q,
                difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
                timelimit: [120, 70, 90, 90, 120][index]
            }))
        })

        return res.json({
            interviewId: interview._id,
            userName: user.name,
            questions: interview.questions,
            user: updatedUser
        })
    } catch (error) {
        return res.status(500).json({ message: `Failed to create interview ${error}` })
    }
}

export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body

        const interview = await Interview.findById(interviewId)
        const question = interview.questions[questionIndex]

        if (!answer) {
            question.score = 0;
            question.feedback = "You did not submit an answer."
            question.answer = "";

            await interview.save();

            return res.json({
                feedback: question.feedback
            });
        }

        if (timeTaken > question.timelimit) {
            question.score = 0;
            question.feedback = "Time limit exceeded. Anser not evaluated."
            question.answer = answer;

            await interview.save()

            return res.json({
                feedback: question.feedback
            });
        }

        const messages = [
            {
                role: "system",
                content:
                    `You are a professional human interviewer evaluating a candidate's answer in a real interview.

                    Evaluate naturally and fairly, like a real person would.

                    Score the answer in these areas (0 to 10):

                    1. Confidence → Does the answer sound clear, confident, and well-presented?
                    2. Communication → Is the language simple, clear, and easy to understand?
                    3. Correctness → Is the answer accurate, relevant, and complete?

                    Rules:
                    - Be realistic and unbiased.
                    - Do not give random high scores.
                    - If the answer is weak, score low.
                    - If the answer is strong and detailed, score high.
                    - Consider clarity, structure, and relevance.
                    
                    Calculate: 
                    finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

                    Feedback Rules:
                    - Write natural human feedback.
                    - 10 to 15 words only.
                    - Sound like real interview feedback.
                    - Can suggest improvement if needed.
                    - Do NOT repeat the question.
                    - Do NOT explain scoring.
                    - Keep tone professional and honest.

                    Return ONLY valid JSON in this format:

                   {
                      "confidence": number,
                      "communication": number,
                      "correctness": number,
                      "finalScore": number,
                      "feedback": "short human feedback"
                    }
                    `
            },
            {
                role: "user",
                content:
                    `
                Question: ${question.question}
                Answer: ${answer}
                `
            }
        ]

        const aiResponse = await askAi(messages);

        const parsed = JSON.parse(aiResponse);

        question.answer = answer;
        question.confidence = parsed.confidence;
        question.communication = parsed.communication;
        question.correctness = parsed.correctness;
        question.score = parsed.finalScore;
        question.feedback = parsed.feedback;

        await interview.save();

        return res.status(200).json({ feedback: parsed.feedback })
    } catch (error) {
        return res.status(500).json({ message: `Failed to submit answer ${error}` })
    }
}

export const finishInterview = async (req, res) => {
    try {
        const { interviewId } = req.body
        const interview = await Interview.findById(interviewId)

        if (!interview) {
            return res.status(400).json({ message: "Failed to find interview" })
        }

        const totalQuestions = interview.questions.length;

        let totalScore = 0;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach((q) => {
            totalScore += q.score || 0;
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        const finalScore = totalQuestions
            ? totalScore / totalQuestions
            : 0;

        const avgConfidence = totalQuestions
            ? totalConfidence / totalQuestions
            : 0;

        const avgCommunication = totalQuestions
            ? totalCommunication / totalQuestions
            : 0;

        const avgCorrectness = totalQuestions
            ? totalCorrectness / totalQuestions
            : 0;

        interview.finalScore = finalScore;
        interview.status = "Completed";

        await interview.save();

        return res.status(200).json({
            finalScore: Number(finalScore.toFixed(1)),
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),

            questionWiseScore: interview.questions.map((q) => ({
                question: q.question,
                score: q.score || 0,
                feedback: q.feedback || "",
                confidence: q.confidence || 0,
                communication: q.communication || 0,
                correctness: q.correctness || 0,
            })),
        });
    } catch (error) {
        return res.status(500).json({ message: `Failed to finish interview ${error}` })
    }
}

export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select("role experience mode finalScore status createdAt")

        return res.status(200).json(interviews)
    } catch (error) {
        return res.status(500).json({ message: `Failed to find current user interviews ${error}` })
    }
}

export const getInterviewReport = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" })
        }

        const totalQuestions = interview.questions.length;

        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach((q) => {
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        const avgConfidence = totalQuestions
            ? totalConfidence / totalQuestions
            : 0;

        const avgCommunication = totalQuestions
            ? totalCommunication / totalQuestions
            : 0;

        const avgCorrectness = totalQuestions
            ? totalCorrectness / totalQuestions
            : 0;

        return res.status(200).json({
            finalScore: interview.finalScore,
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions
        });
    } catch (error) {
        return res.status(500).json({ message: `Failed to find current user interviews ${error}` })
    }
}

export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    await Interview.findByIdAndDelete(req.params.id);

    const interviews = await Interview.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select("role experience mode finalScore status createdAt")

        return res.status(200).json(interviews)
  } catch (error) {
    return res.status(500).json({ message: `Failed to delete interview: ${error}` });
  }
};
