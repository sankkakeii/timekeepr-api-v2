const jwt = require("jsonwebtoken");

const clientMiddleware = {

  verifyToken: async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(403).send('A token is required for authentication');
      }
      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
      req.user = decoded;
      next();
    } catch (err) {
      console.error(err);  // Add this line
      return res.status(401).send('Invalid Token');
    }
  }
  
};


module.exports = clientMiddleware;

