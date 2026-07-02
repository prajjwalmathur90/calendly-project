import {
  getAll,
  getByID,
  createUser,
  updateUser,
  getByEmail,
  deleteUser,
} from "../repositories/user.repository.js";
import { notFound } from "../utils/api-error.js";

export async function findAllUsers() {
  const users = await getAll();
  return users;
}

export async function findById(id: number) {
  const user = await getByID(id);
  if (!user) {
    throw notFound("User not found");
  }
  return user;
}

export async function findByEmail(email: string) {
  const user = await getByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function create(name: string, email: string) {
  const user = await createUser(name, email);
  return user;
}

export async function updateById(name: string, id: number) {
  const user = await updateUser(name, id);
  return user;
}

export async function deleteUserById(id: number) {
  const user = await findById(id);
  if (!user) {
    throw new Error("User does not exist");
  }

  return deleteUser(id);
}
