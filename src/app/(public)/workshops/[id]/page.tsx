import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";

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

export default async function WorkshopPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: workshop } = await supabase
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
    .eq("id", id)
    .single();

  if (!workshop) {
    notFound();
  }

  const durchfuehrungen = (workshop.durchfuehrungen ?? []).map(
    (df: {
      id: string;
      created_at: string;
      termine: { id: string; start_datetime: string; end_datetime: string }[];
    }) => ({
      ...df,
      termine: (df.termine ?? []).sort(
        (a, b) =>
          new Date(a.start_datetime).getTime() -
          new Date(b.start_datetime).getTime()
      ),
    })
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <div className="relative h-48 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 sm:h-56 md:h-64">
        <Image
          src="/placeholders/nano-banana-2_artistic_portrait_photography_of_A_cool-toned_artistic_portrait_photography_feat-3.jpg"
          alt={workshop.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6 sm:p-8">
            <Link
              href="/"
              className="mb-4 inline-block text-sm text-zinc-300 hover:text-white"
            >
              ← Alle Workshops
            </Link>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {workshop.title}
            </h1>
            {workshop.subtitle && (
              <p className="mt-2 text-lg text-zinc-200">{workshop.subtitle}</p>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="py-12">
      {durchfuehrungen.length === 0 ? (
        <p className="text-zinc-500">
          Für diesen Workshop sind noch keine Durchführungen geplant.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {durchfuehrungen.map(
            (
              df: {
                id: string;
                termine: {
                  id: string;
                  start_datetime: string;
                  end_datetime: string;
                }[];
              },
              i: number
            ) => {
              const upcoming = df.termine.filter(
                (t) => new Date(t.start_datetime) >= new Date()
              );
              const past = df.termine.filter(
                (t) => new Date(t.start_datetime) < new Date()
              );

              return (
                <div
                  key={df.id}
                  className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
                >
                  <h2 className="mb-3 text-lg font-semibold">
                    Durchführung {i + 1}
                  </h2>

                  {df.termine.length === 0 ? (
                    <p className="text-sm text-zinc-400">Keine Termine</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {upcoming.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-3 rounded-md bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900"
                        >
                          <span className="font-medium">
                            {formatDate(t.start_datetime)}
                          </span>
                          <span className="text-zinc-500">
                            | {formatTime(t.start_datetime)} –{" "}
                            {formatTime(t.end_datetime)}
                          </span>
                        </div>
                      ))}
                      {past.length > 0 && (
                        <p className="mt-1 text-xs text-zinc-400">
                          + {past.length} vergangene{" "}
                          {past.length === 1 ? "Termin" : "Termine"}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <Link
                      href={`/workshops/${id}/anmelden/${df.id}`}
                      className="inline-flex items-center rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      Anmelden
                    </Link>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
      </div>
    </div>
  );
}
