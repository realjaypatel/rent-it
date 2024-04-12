import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import fileUpload from"express-fileupload";
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || undefined,
          lte: parseInt(query.maxPrice) || undefined,
        },
      },
    });

    // setTimeout(() => {
    res.status(200).json(posts);
    // }, 3000);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
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
    console.log('post',post)
    return res.render('PostPage',{post:post})


    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          res.status(200).json({ ...post, isSaved: saved ? true : false });
        }
      });
    }
    res.status(200).json({ ...post, isSaved: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  let images = []
  try {
    
    images = []
    console.log(req.files.images)


  for(let x = 0; x < req.files.images.length;x++){
    console.log('data')
  let data = await FileUploader(req.files.images[x]);
  console.log('data',data)
  images[x] = data
  }
  } catch (error) {
    console.log('err',error)
  }
console.log(images)
  let body = {
    postData: {
      title: req.body.title,
      price: parseInt(req.body.price),
      address: req.body.address,
      city: req.body.city,
      bedroom: parseInt(req.body.bedroom),
      bathroom: parseInt(req.body.bathroom),
      type: req.body.type,
      property: req.body.property,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      images: images,
      desc: req.body.desc,
      utilities: req.body.utilities,
      pet: req.body.pet,
      income: req.body.income,
      size: parseInt(req.body.size),
      school: parseInt(req.body.school),
      bus: parseInt(req.body.bus),
      restaurant: parseInt(req.body.restaurant),
    }
  }
  
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
      }
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  let images = null
  let id = req.params.id
  try {
    if(req.files){
      try {
        const post_data = await prisma.post.findUnique({
          where: { id },
        });
        if (post_data.images) {
          for(let x = 0; x < post_data.images.length;x++){
            FileDelete(post_data.images[x])
            }
        }
        console.log('deleted')
        images = []
        for(let x = 0; x < req.files.images.length;x++){
  
          let data = await FileUploader(req.files.images[x]);
        
          images[x] = data
        }
        console.log(images)
      }catch(err){
        console.log(err)
      }
        
        

    
  }





  let body = {
    postData: {
      title: req.body.title,
      price: parseInt(req.body.price),
      address: req.body.address,
      city: req.body.city,
      bedroom: parseInt(req.body.bedroom),
      bathroom: parseInt(req.body.bathroom),
      type: req.body.type,
      property: req.body.property,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      // images: images,
      desc: req.body.desc,
      utilities: req.body.utilities,
      pet: req.body.pet,
      income: req.body.income,
      size: parseInt(req.body.size),
      school: parseInt(req.body.school),
      bus: parseInt(req.body.bus),
      restaurant: parseInt(req.body.restaurant),
    }
  }
  
  const tokenUserId = req.userId;

  try {
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...body.postData,
        userId: tokenUserId,
        ...(images && { images })
      },
    });

    res.status(200).json(updatedPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
  }catch(err){
    console.log(err)
  }
}
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }
    // deleting images
    try {
        for(let x = 0; x < post.images.length; x++){
          FileDelete(post.images[x]);
      
        }
      }
        catch (error) {
      console.log(error)
        }
    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export const addPost_ejs = async (req, res) => {
  const id = req.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    res.status(200).render('AddPost',{user:user,errorMessage:''})

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get user! update page" });
  }

};
export const updatePost_ejs = async (req, res) => {
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
    console.log('post',post)
    return res.render('UpdatePost',{post:post,user:req.userId})

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }



};



let FileUploader = async (d) => {
  let FileData = d
  let name = `${Date.now()}-${Math.floor(10000000 + Math.random() * 90000000)}` + FileData.name
  let p = path.join(__dirname, '..', 'uploads', name)

  await new Promise((resolve, reject) => {
    FileData.mv(p, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
  return name
}
const FileDelete = async (filePath) => {
  try {
    filePath = path.join(__dirname, '..', 'uploads', filePath)

      await fs.promises.access(filePath, fs.constants.F_OK);

      // Delete the file
      await fs.promises.unlink(filePath);

      console.log(`File ${filePath} deleted successfully.`);
  } catch (error) {
      // If the file doesn't exist or there's an error during deletion, log the error
      console.error(`Error deleting file ${filePath}: ${error.message}`);

  }
};