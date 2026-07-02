import {
  getAll,
  getByID,
  createUser,
  updateUser,
  getByEmail,
  deleteUser,
} from "../repositories/user.repository.js";
import { badRequest, notFound } from "../utils/api-error.js";

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
    throw notFound("User not found");
  }
  return user;
}

export async function createService(data: { name: string; email: string }) {
  const { name, email } = data;

  if (!name || !email) {
    throw badRequest("Name and email are required");
  }

  return createUser(name, email);
}

export async function updateById(name: string, id: number) {
  if (!name) {
    throw badRequest("Name is required");
  }

  const user = await getByID(id);

  if (!user) {
    throw notFound("User not found");
  }
  return user;
}

export async function deleteUserById(id: number) {
  const user = await getByID(id);
  if (!user) {
    throw notFound("User not found");
  }

  return deleteUser(id);
}
