import type { Prisma, Product } from "@prisma/client";

import { prisma } from "~/storage/db.server.ts";

export async function createProduct(product: Prisma.ProductCreateInput) {
  return prisma.product.create({
    data: { ...product },
  });
}

export async function deleteProductById(id: Product["id"]) {
  return prisma.product.delete({
    where: { id },
  });
}

export async function getProductById(
  id: Product["id"],
  include?: Prisma.ProductInclude
) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      ...include,
      prices: include?.prices || false,
    },
  });
}

export async function getAllProducts(include?: Prisma.ProductInclude) {
  return prisma.product.findMany({
    include: {
      ...include,
      prices: include?.prices || false,
    },
  });
}

export async function updateProductById(
  id: Product["id"],
  product: Partial<Product>
) {
  return prisma.product.update({
    where: { id },
    data: { ...product },
  });
}
