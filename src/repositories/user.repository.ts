import { prisma } from "../config/database.js";

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

export async function createUser(name: string, email: string) {
  const user = await prisma.user.create({
    data: {
      name,
      email,
    },
  });

  return user;
}

export async function updateUser(name: string, id: number) {
  const user = await prisma.user.update({
    where: { id: id },
    data: { name: name },
  });

  return user;
}

export async function deleteUser(id: number) {
  const user = await prisma.user.delete({
    where: { id },
  });

  return user;
}
