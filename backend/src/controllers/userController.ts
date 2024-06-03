import { userServices } from "../services/userService";
import { Request, Response } from "express";
import { UserSchemaValidation } from "../models/userModel";

class userController {
  addUser = async (req: Request, res: Response) => {
    const data = {
      name: req.body.name,
      email: req.body.email,
    };

    const { error, value } = UserSchemaValidation.validate(data);

    if (error) {
      res.send(error.message);
    } else {
      const user = await userServices.createUser(value);
      res.status(201).send(user);
    }
  };

  getUsers = async (req: Request, res: Response) => {
    const users = await userServices.getUsers();
    res.send(users);
  };

  getUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = await userServices.getUser(id);
    res.send(user);
  };

  getUserByEmail = async (req: Request, res: Response) => {
    const email = req.params.email;
    const user = await userServices.getUserByEmail(email);
    res.send(user);
  };

  updateUser = async (req: Request, res: Response) => {
    const user = await userServices.updateUser(req.body);
    res.send(user);
  };

  updateManyUsers = async (req: Request, res: Response) => {
    const users = await userServices.updateManyUsers(req.body);
    res.send(users);
  };

  deleteUser = async (req: Request, res: Response) => {
    const id = req.query.id;
    const resp = await userServices.deleteUser(id as string);
    res.send(resp);
  };
}

export const UserController = new userController();
