import { userStorage } from "../data/users.ts";
import type { Request, Response } from "express";
import { createAlphaChain, createLengthChain } from "../utils/validator.ts";
import { matchedData, param, validationResult } from "express-validator";

const validateUser = [
  createAlphaChain("firstName"),
  createLengthChain("firstName"),
  createAlphaChain("lastName"),
  createLengthChain("lastName"),
];

export function userGet(_req: Request, res: Response) {
  res.render("users", { users: userStorage.getUsers() });
}

export function newUserGet(_req: Request, res: Response) {
  res.render("newUser", { title: "New User" });
}

export const newUserPost = [
  ...validateUser,
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .render("newUser", { title: "New User", errors: errors.array() });
      return;
    }
    const data = matchedData<{ firstName: string; lastName: string }>(req);
    const { firstName, lastName } = data;
    userStorage.addUser(firstName, lastName);
    res.redirect("/users");
  },
];

export const updateUserGet = [
  param("id").isNumeric(),
  ...validateUser,
  (req: Request, res: Response) => {
    const { id } = req.params;
    const user = userStorage.getUserById(Number(id));
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    res.render("newUser", { title: "Update User", user });
  },
];

export const updateUserPost = [
  param("id").isNumeric(),
  ...validateUser,
  (req: Request, res: Response) => {
    const { id } = req.params;
    const user = userStorage.getUserById(Number(id));
    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).render("newUser", {
        title: "Update User",
        user,
        errors: errors.array(),
      });
      return;
    }

    const data = matchedData<{ firstName: string; lastName: string }>(req);
    const { firstName, lastName } = data;

    if (userStorage.updateUser({ id: Number(id), firstName, lastName })) {
      res.redirect("/users");
    } else {
      res.status(500).send("Failed to update user");
    }
  },
];

export const deleteUserPost = [
  param("id").isNumeric(),
  (req: Request, res: Response) => {
    const { id } = req.params;
    if (userStorage.deleteUser(Number(id))) {
      res.redirect("/users");
    } else {
      res.status(404).send("User not found");
    }
  },
];
