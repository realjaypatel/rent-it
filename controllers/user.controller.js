import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import fileUpload from"express-fileupload";
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get users!" });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get user!" });
  }
};

export const updateUser = async (req, res) => {

  const id = req.userId;
  const tokenUserId = req.userId;
  const { password, ...inputs } = req.body;
  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  let updatedPassword = null;
  let avatar = null
  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    if (req.files){
      try {
        const user_data = await prisma.user.findUnique({
          where: { id },
        });
        if (user_data.avatar) {
          FileDelete(user_data.avatar)
        }
        console.log('before avatar',req.files.avatar)
        avatar = await FileUploader(req.files.avatar)
        } catch (error) {
          console.log(error)
        }
    }

    console.log('avatar',avatar)
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    const { password: userPassword, ...rest } = updatedUser;

    res.status(200).json(rest);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update users!" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
    });
    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true,
      },
    });

    const savedPosts = saved.map((item) => item.post);
    res.status(200).json({ userPosts, savedPosts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};

export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const number = await prisma.chat.count({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
        NOT: {
          seenBy: {
            hasSome: [tokenUserId],
          },
        },
      },
    });
    res.status(200).json(number);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};
export const updateUser_ejs = async (req, res) => {
  const id = req.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    res.status(200).render('UpdatePage',{user:user,errorMessage:''})

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get user! update page" });
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