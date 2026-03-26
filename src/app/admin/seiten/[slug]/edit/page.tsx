"use client";

import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "./puck-overrides.css";
import { puckConfig } from "@/components/puck/config";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPageEditor() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/pages/${params.slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Seite nicht gefunden");
        return res.json();
      })
      .then((page) => {
        setData(page.data as Data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.slug]);

  const handlePublish = async (newData: Data) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/pages/${params.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: newData }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Speichern fehlgeschlagen");
      }
      setSaving(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Laden...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => router.push("/admin/seiten")}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Zurück zu Seiten
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Puck
        config={puckConfig}
        data={data || { content: [], root: { props: {} }, zones: {} }}
        onPublish={handlePublish}
        headerTitle={params.slug}
        headerPath={`/${params.slug}`}
      />
      {saving && (
        <div className="fixed bottom-4 right-4 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg">
          Speichern...
        </div>
      )}
      {error && data && (
        <div className="fixed bottom-4 right-4 rounded-md bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
