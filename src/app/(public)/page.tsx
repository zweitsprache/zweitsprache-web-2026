import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { HeroImage } from "./hero-image";

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
        <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <HeroImage />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex flex-col items-start justify-end">
            <div className="rounded-tr-xl px-16 pb-24 pt-6">
              <h1 className="text-[2.75rem] font-black text-white sm:text-5xl">
                DaZ einfach machen
              </h1>
              <p className="mt-4 text-2xl leading-normal text-white sm:text-3xl sm:leading-normal">
                Beratung, Weiterbildung und Fachcoaching für<br />Organisationen, Teams und Kursleitende
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
                  className="group overflow-hidden rounded-lg border border-zinc-200 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                >
                  <div className="relative aspect-[21/9] bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src="/placeholders/nano-banana-2_artistic_portrait_photography_of_A_cool-toned_artistic_portrait_photography_feat-3.jpg"
                      alt={workshop.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end">
                      <div className="bg-white/80 px-4 py-2">
                        <h3 className="text-lg font-bold text-[#3E5A6B]">
                          {workshop.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-2">
                    {workshop.subtitle && (
                      <p className="text-[18px] text-[#3E5A6B]">
                        {workshop.subtitle}
                      </p>
                    )}
                    {nextTermin ? (
                      <p className="text-[18px] text-zinc-600 dark:text-zinc-400">
                        {formatDate(nextTermin.start_datetime)} |{" "}
                        {formatTime(nextTermin.start_datetime)} –{" "}
                        {formatTime(nextTermin.end_datetime)}
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-400">Keine kommenden Termine</p>
                    )}
                    <span className="mt-3 block rounded-md bg-[#3E5A6B] px-4 py-2 text-center text-sm font-medium text-white group-hover:bg-[#334d5b] dark:bg-zinc-100 dark:text-zinc-900 dark:group-hover:bg-zinc-200">
                      Details
                    </span>
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
                    className="group overflow-hidden rounded-lg border border-zinc-200 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                  >
                    <div className="relative aspect-[21/9] bg-zinc-100 dark:bg-zinc-800">
                      <Image
                        src="/placeholders/nano-banana-2_artistic_portrait_photography_of_A_cool-toned_artistic_portrait_photography_feat-3.jpg"
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex flex-col justify-end">
                        <div className="bg-white/80 px-4 py-3">
                          <h3 className="text-lg font-bold text-[#3E5A6B]">
                            {course.title}
                          </h3>
                          {course.subtitle && (
                            <p className="text-sm text-[#3E5A6B]">{course.subtitle}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="mt-3 block rounded-md bg-[#3E5A6B] px-4 py-2 text-center text-sm font-medium text-white group-hover:bg-[#334d5b] dark:bg-zinc-100 dark:text-zinc-900 dark:group-hover:bg-zinc-200">
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
