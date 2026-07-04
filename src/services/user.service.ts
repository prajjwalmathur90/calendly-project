import { CreateUserDto, UpdateUserNameDto } from "../dtos/user.dto.js";
import {
  getAll,
  getByID,
  createUser,
  getByEmail,
  updateUserNameById as updateUserNameByIdRepository,
  deleteUserById as deleteUserByIdRepository,
} from "../repositories/user.repository.js";
import { badRequest, conflict, notFound } from "../utils/api-error.js";

export async function findAllUsers() {
  const users = await getAll();
  if (!users) {
    throw notFound("Users not found");
  }
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

export async function createService(data: CreateUserDto) {
  const existingUser = await getByEmail(data.email);
  if (existingUser) {
    throw conflict("User already exists!");
  }

  return createUser(data);
}

export async function updateUserNameById(id: number, data: UpdateUserNameDto) {
  if (!data.name) {
    throw badRequest("Name is required");
  }

  const user = await getByID(id);

  if (!user) {
    throw notFound("User not found");
  }
  return updateUserNameByIdRepository(id, data.name);
}

export async function deleteUserById(id: number) {
  const user = await getByID(id);
  if (!user) {
    throw notFound("User not found");
  }

  return deleteUserByIdRepository(id);
}
