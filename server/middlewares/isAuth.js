import jwt from 'jsonwebtoken';

const isAuth = async (req, res, next) => {
    try {
      let token = req.cookies.token;
      if (!token) {
        return res.status(400).json({ message: "Unauthorized" });
      }
      
      const verifytoken = await jwt.verify(token, process.env.JWT_SECRET);
      
      if(!verifytoken){
        return res.status(400).json({ message: "Unauthorized" });
      }

      req.userId = verifytoken.userId;
      next();
    } catch (error){
        console.error("Error in isAuth middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default isAuth;