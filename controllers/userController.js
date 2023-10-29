const UserModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/emailConfig");
const dotenv = require("dotenv");

class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      return res
        .status(201)
        .send({ status: "failed", message: "user already exist" });
      console.log("user already exist");
    }
    if (name && email && password && password_confirmation && tc) {
      if (password !== password_confirmation) {
        return res.send({
          status: "failed",
          message: "password and confirm password does not match",
        });
        return;
      }
      const salt = await bcrypt.genSalt(10);
      const hashpassword = await bcrypt.hash(password, salt);
      try {
        const doc = new UserModel({
          name: name,
          email: email,
          password: hashpassword,
          tc: tc,
        });
        await doc.save();
        const saved_user = await UserModel.findOne({ email: email });
        const token = jwt.sign(
          { userID: saved_user._id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "5d",
          }
        );

        return res.send({
          status: "success",
          message: "User created successfully",
          jwttoken: token,
        });
        //return;
      } catch (error) {
        console.log(error);
        return res.send({ status: "failed", message: "unable to register" });
        //return;
      }
    } else {
      return res.send({ status: "failed", message: "All fields required" });
      //return;
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.send({
          status: "failed",
          message: "email or password is missing",
        });
      }
      const user = await UserModel.findOne({ email: email });
      if (!user) {
        return res.send({
          status: "failed",
          message: "user is not registered",
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (user.email === email && isMatch) {
        const saved_user = await UserModel.findOne({ email: email });
        const token = jwt.sign(
          { userID: saved_user._id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "5d",
          }
        );
        return res.send({
          status: "success",
          message: "login successfully",
          token: token,
        });
      } else {
        return res.send({
          status: "failed",
          message: "user or password is incorrect",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    console.log("user");
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        return res.send({
          status: "failed",
          message: "password & password_confirmation dosen't match",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashpassword = await bcrypt.hash(password, salt);
      //console.log(req.user);
      await UserModel.findByIdAndUpdate(req.user._id, {
        $set: {
          password: hashpassword,
        },
      });
      return res.send({
        status: "success",
        message: "Password change successfully",
      });
    }
    return res.send({ status: "failed" });
  };

  static loggesUser = async (req, res) => {
    res.send({ user: req.user });
  };

  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.send({ status: "failes", message: "email is req." });
    }
    const user = await UserModel.findOne({ email: email });
    const secret = user._id + process.env.JWT_SECRET_KEY;
    if (!user) {
      return res.send({ status: "failes", message: "email not exist" });
    }
    const token = jwt.sign({ userID: user._id }, secret, {
      expiresIn: "15m",
    });
    const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
    ///api/user/reser/:id/:token
    console.log(link);
    //send email

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Reset Password Link - LOCAL",
      html: `<a href=${link}>Click Here</a> to Reset Your Password`,
    };

    // let info = await transporter.sendMail(mailOptions);
    //console.log(info);
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res.send({
      status: "success",
      Message: "Password Reset Email sent... please check your Email",
      //      email: info,
    });
  };

  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;

    const user = await UserModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          return res.send({
            status: "failed",
            message: "password & password_confirmation does not match",
          });
        }
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(user._id, {
          $set: {
            password: hashpassword,
          },
        });
        return res.send({
          status: "success",
          message: "password Reset successfully",
        });
      } else {
        return res.send({
          status: "failed",
          message: "All fields are required",
        });
      }
    } catch (err) {
      console.log(err);
      return res.send({ status: "failed", message: "Invalid Token" });
    }
  };
}

module.exports = UserController;
