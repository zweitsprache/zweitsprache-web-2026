"use client";

import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "../../../../../../seiten/[slug]/edit/puck-overrides.css";
import { puckConfig } from "@/components/puck/config";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LessonEditor() {
  const params = useParams<{
    courseId: string;
    moduleId: string;
    lessonId: string;
  }>();
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/lessons/${params.lessonId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Lektion nicht gefunden");
        return res.json();
      })
      .then((lesson) => {
        setData(
          (lesson.data as Data) || {
            content: [],
            root: { props: {} },
            zones: {},
          }
        );
        setTitle(lesson.title || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.lessonId]);

  const handlePublish = async (newData: Data) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${params.lessonId}`, {
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

  const backUrl = `/admin/kurse/${params.courseId}/module/${params.moduleId}`;

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
          onClick={() => router.push(backUrl)}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Zurück zum Modul
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
        headerTitle={title}
        headerPath={backUrl}
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
