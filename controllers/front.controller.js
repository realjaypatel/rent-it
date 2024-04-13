import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const Home = async (req, res) => {

    // return res.render("Home",{user:req.userId})
    return res.redirect('/search')

    
};
export const Error = async (req, res) => {

  return res.render("404",{user:req.userId,message:'no-page found '})
  
  
};
export const Profile = async (req, res) => {
  
  const id = req.userId;
  try {
    let userData = await prisma.user.findUnique({
      where: { id },
    });
    const userPosts = await prisma.post.findMany({
      where: { userId: id },

    });
    const saved = await prisma.savedPost.findMany({
      where: { userId: id },
      include: {
        post: true,
      },
    });
    const savedPosts = saved.map((item) => item.post);
    return res.render("Profile",{user:userData,posts:userPosts,saved:savedPosts})
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "fail to get profile page" });
   
  }
    
};

export const Search = async (req, res) => {

  const query = req.query;
  try {
    const posts = await prisma.post.findMany({
      where: {
        // city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || undefined,
          lte: parseInt(query.maxPrice) || undefined,
        },
      },
    });
    console.log(query.city)
    return res.render('SearchPage',{data:posts,user:req.userId,city : query.city});
  } catch (err) {
    console.log('err',err);
      }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    return res.render('PostPage',{post:post,user:req.userId})


} catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const getUser = async (req, res) => {

  const username = req.params.id;
  try {
    let userData = await prisma.user.findUnique({
      where: { username },
    });
    const userPosts = await prisma.post.findMany({
      where: { userId: userData.id },

    });
 
    
    return res.render("UserPage",{user:userData,posts:userPosts,})
  } catch (err) {
    console.log(err);
    return res.render('404',{message:'No User Found',user:req.userId})
    
   
  }
};

