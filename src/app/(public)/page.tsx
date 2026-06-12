import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

const WEEKDAYS_DE = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const weekday = WEEKDAYS_DE[date.getDay()];
  return `${weekday} ${date.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: workshops } = await supabase
    .from("workshops")
    .select(
      `
      id,
      title,
      subtitle,
      created_at,
      durchfuehrungen (
        id,
        created_at,
        termine (
          id,
          start_datetime,
          end_datetime
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  const sorted = (workshops ?? []).sort((a, b) => {
    const getFirstStart = (ws: typeof a) => {
      const starts = (ws.durchfuehrungen ?? [])
        .flatMap((df: { termine: { start_datetime: string }[] }) => df.termine ?? [])
        .map((t: { start_datetime: string }) => new Date(t.start_datetime).getTime())
        .filter((ts: number) => ts >= Date.now());
      return starts.length > 0 ? Math.min(...starts) : Infinity;
    };
    return getFirstStart(a) - getFirstStart(b);
  });

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, title, subtitle")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  if (coursesError) console.error("courses error:", coursesError.message, coursesError.code, coursesError.details, coursesError.hint);

  return (
    <div>
      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 pt-12">
        <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-[#0b1f3b]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-22 -top-22 z-10 h-56 w-56 rounded-full border-2 border-white/80 bg-stone-50"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 z-10 h-48 w-48 rounded-full border border-white/75 bg-[#c8553d]"
          />
          {/* Content */}
          <div className="absolute inset-0 z-20 flex flex-col justify-between p-10 sm:p-14">
            <div />
            <div>
              <p className="mb-5 max-w-3xl text-xl font-medium leading-snug text-white/80 sm:text-2xl md:text-3xl">
                zweitsprache.ch | Marcel Allenspach
              </p>
              <h1 className="text-[2.6rem] font-black leading-none tracking-tight text-white sm:text-6xl md:text-7xl">
                DaZ einfach machen.
              </h1>
              <p className="mt-5 max-w-3xl text-xl font-medium leading-snug text-white/80 sm:text-2xl md:text-3xl">
                Beratung, Weiterbildung und Fachcoaching für Organisationen, Teams und Kursleitende
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Nächste Workshops */}
        <div className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Nächste Workshops</h2>
            <Link
              href="/workshops"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Alle Workshops →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.slice(0, 3).map((workshop) => {
              const allTermine = (workshop.durchfuehrungen ?? [])
                .flatMap((df: { termine: { start_datetime: string; end_datetime: string }[] }) => df.termine ?? [])
                .sort(
                  (a: { start_datetime: string }, b: { start_datetime: string }) =>
                    new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
                );
              const upcoming = allTermine.filter(
                (t: { start_datetime: string }) => new Date(t.start_datetime) >= new Date()
              );
              const nextTermin = upcoming[0] as { start_datetime: string; end_datetime: string } | undefined;
              const dfCount = (workshop.durchfuehrungen ?? []).length;

              return (
                <Link
                  key={workshop.id}
                  href={`/workshops/${workshop.id}`}
                  className="group relative overflow-hidden rounded-lg bg-stone-50 transition-colors dark:bg-stone-900"
                >
                  <div className="relative overflow-hidden bg-[#c8553d] px-5 py-5">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-6 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full bg-stone-50 dark:bg-stone-900"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-4 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-[#3E5A6B]"
                    />
                    <div className="relative z-20">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                        Workshop
                      </p>
                      <h3 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white">
                        {workshop.title}
                      </h3>
                    </div>
                  </div>
                  <div className="space-y-3 rounded-b-lg border-x border-b border-stone-300 bg-stone-50 px-5 pb-5 pt-4 transition-colors group-hover:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:group-hover:border-stone-500">
                    {workshop.subtitle && (
                      <p className="text-base leading-snug text-stone-700 dark:text-stone-300">
                        {workshop.subtitle}
                      </p>
                    )}
                    {nextTermin ? (
                      <p className="text-sm font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-400">
                        {formatDate(nextTermin.start_datetime)} |{" "}
                        {formatTime(nextTermin.start_datetime)} –{" "}
                        {formatTime(nextTermin.end_datetime)}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-stone-400">Keine kommenden Termine</p>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-stone-600 dark:border-stone-700 dark:text-stone-300">
                        {dfCount} Termineinheiten
                      </span>
                      <span className="inline-flex items-center rounded-md bg-[#3E5A6B] px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-[#334d5b] dark:bg-stone-100 dark:text-stone-900 dark:group-hover:bg-stone-200">
                      Details
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Neueste Online-Kurse */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Neueste Online-Kurse</h2>
            <Link
              href="/kurse"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Alle Kurse →
            </Link>
          </div>

          {(!courses || courses.length === 0) ? (
            <p className="text-zinc-500">Noch keine Kurse verfügbar.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                return (
                  <Link
                    key={course.id}
                    href={`/kurse/${course.id}`}
                    className="group relative overflow-hidden rounded-lg bg-stone-50 transition-colors dark:bg-stone-900"
                  >
                    <div className="relative overflow-hidden bg-[#0b1f3b] px-5 py-5">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-6 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full bg-white"
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-4 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-[#c8553d]"
                      />
                      <div className="relative z-20">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                          Online-Kurs
                        </p>
                        <h3 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white">
                          {course.title}
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-3 rounded-b-lg border-x border-b border-stone-300 bg-stone-50 px-5 pb-5 pt-4 transition-colors group-hover:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:group-hover:border-stone-500">
                      {course.subtitle && (
                        <p className="text-base leading-snug text-stone-700 dark:text-stone-300">
                          {course.subtitle}
                        </p>
                      )}
                      <span className="inline-flex items-center rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#3E5A6B] dark:border-stone-700 dark:text-stone-200">
                        Selbstgesteuert lernen
                      </span>
                      <span className="mt-1 block rounded-md bg-[#3E5A6B] px-4 py-2 text-center text-sm font-semibold text-white transition-colors group-hover:bg-[#334d5b] dark:bg-stone-100 dark:text-stone-900 dark:group-hover:bg-stone-200">
                        Kurs ansehen
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
