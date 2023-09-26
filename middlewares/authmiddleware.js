const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

const checkUserAuth = async (req, res, next) => {
  //get token from header
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      //get token from header
      token = authorization.split(" ")[1];
      // verify token
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      ///get user from token

      req.user = await UserModel.findById(userID).select("-password");
      next();
    } catch (error) {
      console.log(error);
      return res
        .status(401)
        .send({ status: "failed", message: "unauthorized user" });
    }
  }
  if (!token) {
    return res
      .status(401)
      .send({ status: "failed", message: "unauthorized user, No token" });
  }
};

module.exports = checkUserAuth;
