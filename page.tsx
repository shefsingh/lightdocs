"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DocumentSummary = {
  id: string;
  title: string;
  updatedAt: string;
  owner: {
    name: string;
    email: string;
  };
};

export default function DocumentsPage() {
  const router = useRouter();

  const [ownedDocs, setOwnedDocs] = useState<DocumentSummary[]>([]);
  const [sharedDocs, setSharedDocs] = useState<DocumentSummary[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("currentUserEmail");

    if (!email) {
      router.push("/");
      return;
    }

    setCurrentUserEmail(email);
    loadDocuments(email);
  }, [router]);

async function loadDocuments(email: string) {
  const res = await fetch(`/api/documents?email=${encodeURIComponent(email)}`);

  if (!res.ok) {
    const errorText = await res.text();
    console.log("Failed to load documents:", errorText);
    setUploadStatus("Could not load documents. Check the terminal for the API error.");
    return;
  }

  const data = await res.json();

  setOwnedDocs(data.owned ?? []);
  setSharedDocs(data.shared ?? []);
}

async function createDocument() {
  setUploadStatus("Creating document...");

  const res = await fetch("/api/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: currentUserEmail }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.log("Failed to create document:", errorText);
    setUploadStatus("Could not create document. Check the terminal for the API error.");
    return;
  }

  const doc = await res.json();
  router.push(`/documents/${doc.id}`);
}

async function deleteDocument(documentId: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this document? This cannot be undone."
  );

  if (!confirmed) return;

  const res = await fetch(`/api/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: currentUserEmail }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.log("Failed to delete document:", errorText);
    setUploadStatus("Could not delete document.");
    return;
  }

  setUploadStatus("Document deleted.");
  loadDocuments(currentUserEmail);
}

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("email", currentUserEmail);
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setUploadStatus(data.error || "Upload failed.");
      return;
    }

    setUploadStatus("Uploaded.");
    router.push(`/documents/${data.id}`);
  }

  function logout() {
    localStorage.removeItem("currentUserEmail");
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">
              Signed in as {currentUserEmail}
            </p>
            <h1 className="text-3xl font-bold">LightDocs</h1>
          </div>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-xl border border-zinc-700 px-4 py-2 font-medium text-white hover:bg-zinc-800">
              Upload .txt/.md
              <input
                type="file"
                accept=".txt,.md"
                onChange={uploadFile}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={createDocument}
              className="rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200"
            >
              New Document
            </button>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-zinc-700 px-4 py-2 font-medium text-white hover:bg-zinc-800"
            >
              Switch User
            </button>
          </div>
        </div>

        {uploadStatus && (
          <p className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-400">
            {uploadStatus}
          </p>
        )}

       <section className="mb-10">
  <h2 className="mb-4 text-xl font-semibold">Owned by me</h2>

  {ownedDocs.length === 0 ? (
    <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-400">
      No documents yet. Create your first document or upload a .txt/.md file.
    </p>
  ) : (
    <div className="grid gap-3">
      {ownedDocs.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:bg-zinc-800"
        >
          <button
            type="button"
            onClick={() => router.push(`/documents/${doc.id}`)}
            className="flex-1 text-left"
          >
            <div className="font-medium">{doc.title}</div>
            <div className="text-sm text-zinc-400">
              Updated {new Date(doc.updatedAt).toLocaleString()}
            </div>
          </button>

          <button
            type="button"
            onClick={() => deleteDocument(doc.id)}
            className="rounded-lg border border-red-900 px-3 py-1 text-sm text-red-300 hover:bg-red-950"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )}
</section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Shared with me</h2>

          {sharedDocs.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-400">
              No shared documents yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {sharedDocs.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => router.push(`/documents/${doc.id}`)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left hover:bg-zinc-800"
                >
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-sm text-zinc-400">
                    Owner: {doc.owner.name} • Updated{" "}
                    {new Date(doc.updatedAt).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}