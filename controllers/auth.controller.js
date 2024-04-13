import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (user) return res.render('Register',{errorMessage:'user with this username already exist',user:''},)


    // HASH THE PASSWORD

    const hashedPassword = await bcrypt.hash(password, 10);



    // CREATE A NEW USER AND SAVE TO DB
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log(newUser);

    const age = 1000 * 60 * 60 * 24 * 7;

    const token = jwt.sign(
      {
        id: newUser.id,
        isAdmin: false,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    const { password: userPassword, ...userInfo } = newUser;

    res
      .cookie("token", token, {
        httpOnly: true,
        // secure:true,
        maxAge: age,
      })
      .status(200)
    res.redirect('/profile')

  } catch (err) {
    console.log(err);
    res.render('Register',{errorMessage:'Failed to create user!',user:''},)

  }



};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // CHECK IF THE USER EXISTS

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) res.render('Login',{errorMessage:'Invalid Credentials!',user:''});

    // CHECK IF THE PASSWORD IS CORRECT

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) return res.render('Login',{errorMessage:'Invalid Credentials!',user:''}) ;

    // GENERATE COOKIE TOKEN AND SEND TO THE USER

    
    const age = 1000 * 60 * 60 * 24 * 7;

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: false,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    const { password: userPassword, ...userInfo } = user;

    res
      .cookie("token", token, {
        httpOnly: true,
        // secure:true,
        maxAge: age,
      })
      .status(200)
    res.redirect('/profile')
  } catch (err) {
    console.log(err);
    return res.render('Login',{errorMessage:'Failed to login!',user:''})
    
  }
};

export const logout = (req, res) => {
  res.clearCookie("token").status(200)
  return res.render('Register',{errorMessage:'',user:''},)
};

export const register_ejs=  (req,res)=>{
  return res.render('Register',{errorMessage:'',user:''},)
  };
export const login_ejs=(req,res)=>{
  return res.render('Login',{errorMessage:'',user:''})
  };
