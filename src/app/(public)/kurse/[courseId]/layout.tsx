import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CourseSidebar } from "./course-sidebar";
import Link from "next/link";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, subtitle")
    .eq("id", courseId)
    .eq("published", true)
    .single();

  if (!course) {
    notFound();
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  const moduleIds = (modules ?? []).map((m) => m.id);
  const { data: lessons } = moduleIds.length > 0
    ? await supabase.from("lessons").select("id, title, sort_order, module_id").in("module_id", moduleIds)
    : { data: [] };

  const sortedModules = (modules ?? []).map((mod) => ({
    ...mod,
    lessons: (lessons ?? [])
      .filter((l) => l.module_id === mod.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        href="/kurse"
        className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Alle Kurse
      </Link>
      <h1 className="mb-1 text-2xl font-bold">{course.title}</h1>
      {course.subtitle && (
        <p className="mb-6 text-zinc-500">{course.subtitle}</p>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <CourseSidebar
              courseId={courseId}
              courseTitle={course.title}
              modules={sortedModules}
            />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
