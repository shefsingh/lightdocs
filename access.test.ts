import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  const users = [
    { id: "user-alice", email: "alice@example.com", name: "Alice Chen" },
    { id: "user-bob", email: "bob@example.com", name: "Bob Smith" },
    { id: "user-carla", email: "carla@example.com", name: "Carla Nguyen" },
  ];

  const documents = [
    {
      id: "doc-1",
      title: "Alice Document",
      ownerId: "user-alice",
      owner: users[0],
      shares: [{ userId: "user-bob" }],
    },
  ];

  return {
    prisma: {
      user: {
        findUnique: vi.fn(({ where }) =>
          Promise.resolve(users.find((user) => user.email === where.email) ?? null)
        ),
      },
      document: {
        findUnique: vi.fn(({ where }) =>
          Promise.resolve(documents.find((doc) => doc.id === where.id) ?? null)
        ),
      },
    },
  };
});

import { canAccessDocument } from "./access";

describe("canAccessDocument", () => {
  it("allows the document owner to access the document", async () => {
    const result = await canAccessDocument("doc-1", "alice@example.com");

    expect(result?.document.title).toBe("Alice Document");
  });

  it("allows a shared user to access the document", async () => {
    const result = await canAccessDocument("doc-1", "bob@example.com");

    expect(result?.document.title).toBe("Alice Document");
  });

  it("blocks a user who is neither owner nor shared", async () => {
    const result = await canAccessDocument("doc-1", "carla@example.com");

    expect(result).toBeNull();
  });
});