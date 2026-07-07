import { prisma } from "../config/database.js";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto.js";

export async function getAll() {
  const users = await prisma.user.findMany();
  return users;
}

export async function getByID(id: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  return user;
}

export async function getByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  return user;
}

export async function createUser(data: CreateUserDto & { slug: String }) {
  const user = await prisma.user.create({
    data: {
      ...data,
    },
  });

  return user;
}

export async function updateUser(id: number, data: UpdateUserDto) {
  return prisma.user.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteUserById(id: number) {
  const user = await prisma.user.delete({
    where: { id },
  });

  return user;
}

export async function getBySlug(slug: string) {
  const user = await prisma.user.findFirst({
    where: {
      slug,
    },
  });

  return user;
}
