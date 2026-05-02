import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function canAccessDocument(documentId: string, email: string) {
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const email = request.nextUrl.searchParams.get("email");
  const { id } = await context.params;

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const result = await canAccessDocument(id, email);

  if (!result) {
    return NextResponse.json(
      { error: "Not found or forbidden" },
      { status: 404 }
    );
  }

  return NextResponse.json(result.document);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  if (!body.email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const result = await canAccessDocument(id, body.email);

  if (!result) {
    return NextResponse.json(
      { error: "Not found or forbidden" },
      { status: 404 }
    );
  }

  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const updated = await prisma.document.update({
    where: { id },
    data: {
      title: body.title || "Untitled Document",
      content: body.content,
    },
    include: {
      owner: true,
      shares: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  if (!body.email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (document.ownerId !== user.id) {
    return NextResponse.json(
      { error: "Only the owner can delete this document" },
      { status: 403 }
    );
  }

  await prisma.documentShare.deleteMany({
    where: { documentId: id },
  });

  await prisma.document.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}