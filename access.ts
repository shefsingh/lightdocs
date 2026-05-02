import { prisma } from "@/lib/prisma";

export async function canAccessDocument(documentId: string, email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return null;

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      owner: true,
      shares: true,
    },
  });

  if (!document) return null;

  const isOwner = document.ownerId === user.id;
  const isShared = document.shares.some((share) => share.userId === user.id);

  if (!isOwner && !isShared) return null;

  return { user, document };
}