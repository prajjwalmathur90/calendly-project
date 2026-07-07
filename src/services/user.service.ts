import slug from "slug";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto.js";
import {
  getAll,
  getByID,
  createUser,
  getByEmail,
  updateUser,
  deleteUserById as deleteUserByIdRepository,
  getBySlug,
} from "../repositories/user.repository.js";
import { conflict, notFound } from "../utils/api-error.js";

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

export async function createService(data: CreateUserDto) {
  const slugPassed = data.slug ?? slug(data.name, { lower: true });
  if (!slugPassed) {
    throw conflict("Could not generate a slug for the user");
  }

  const isSlugTaken = await getBySlug(slugPassed);
  if (isSlugTaken) {
    throw conflict(
      "A event type with this slug already exists, please use a different slug",
    );
  }

  return createUser({ ...data, slug: slugPassed });
}

export async function updateUserService(id: number, data: UpdateUserDto) {
  const user = await getByID(id);
  if (!user) {
    throw notFound("User not found");
  }

  if (data.email && data.email !== user.email) {
    const isEmailTaken = await getByEmail(data.email);
    if (isEmailTaken) {
      throw conflict(
        "A user with this email already exists, please use a different email",
      );
    }
  }

  if (data.slug && data.slug !== user.slug) {
    const isSlugTaken = await getBySlug(data.slug);
    if (isSlugTaken) {
      throw conflict(
        "A user with this slug already exists, please use a different slug",
      );
    }
  }

  return updateUser(id, data);
}

export async function deleteUserById(id: number) {
  const user = await getByID(id);
  if (!user) {
    throw notFound("User not found");
  }

  return deleteUserByIdRepository(id);
}
