import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock8, CreditCard, MapPin, User } from "lucide-react";

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
      about,
      created_at,
      lernziele (
        id,
        text,
        sort_order
      ),
      inhalte (
        id,
        text,
        sort_order
      ),
      voraussetzungen (
        id,
        text,
        sort_order
      ),
      durchfuehrungen (
        id,
        created_at,
        ort,
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

  const lernziele = (workshop.lernziele ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  );

  const inhalte = (workshop.inhalte ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  );

  const voraussetzungen = (workshop.voraussetzungen ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  );

  const durchfuehrungen = (workshop.durchfuehrungen ?? []).map(
    (df: {
      id: string;
      created_at: string;
      ort: string | null;
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
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-[#c8553d] px-6 py-8 sm:px-10 sm:py-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 select-none text-[10rem] font-black uppercase leading-none tracking-tighter text-white/10 sm:text-[14rem]"
        >
          DaZ
        </span>
        <div className="pointer-events-none absolute -bottom-16 -right-16 opacity-30">
          <Image
            src="/logos/ZWE_Logo_2026_V01_circle.svg"
            alt=""
            aria-hidden="true"
            width={320}
            height={320}
            className="h-40 w-40 sm:h-56 sm:w-56"
          />
        </div>
        <div className="relative z-10 max-w-3xl">
          <Link
            href="/workshops"
            className="mb-5 inline-block rounded-full border border-white/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white/85 transition-colors hover:bg-white/10"
          >
            ← Alle Workshops
          </Link>
          <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl">
            {workshop.title}
          </h1>
          {workshop.subtitle && (
            <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">{workshop.subtitle}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-3">
        {/* Left column (2/3) */}
        <div className="space-y-6 lg:col-span-2">
      {workshop.about && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-4 text-xl font-black tracking-tight text-stone-900 dark:text-stone-100">Über den Workshop</h2>
          <p className="whitespace-pre-wrap text-stone-700 dark:text-stone-300">{workshop.about}</p>
        </div>
      )}
      {lernziele.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-4 text-xl font-black tracking-tight text-stone-900 dark:text-stone-100">Lernziele</h2>
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {lernziele.map((lz: { id: string; text: string }) => (
              <li key={lz.id} className="flex items-center gap-3 py-3 text-stone-700 dark:text-stone-300">
                <ArrowRight className="h-4 w-4 shrink-0 text-[#c8553d]" />
                {lz.text}
              </li>
            ))}
          </ul>
        </div>
      )}
      {inhalte.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-4 text-xl font-black tracking-tight text-stone-900 dark:text-stone-100">Inhalte</h2>
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {inhalte.map((item: { id: string; text: string }) => (
              <li key={item.id} className="flex items-center gap-3 py-3 text-stone-700 dark:text-stone-300">
                <ArrowRight className="h-4 w-4 shrink-0 text-[#c8553d]" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      )}
      {voraussetzungen.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-4 text-xl font-black tracking-tight text-stone-900 dark:text-stone-100">Voraussetzungen</h2>
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {voraussetzungen.map((item: { id: string; text: string }) => (
              <li key={item.id} className="flex items-center gap-3 py-3 text-stone-700 dark:text-stone-300">
                <ArrowRight className="h-4 w-4 shrink-0 text-[#c8553d]" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      )}
        </div>

        {/* Right column (1/3) */}
        <div>
      <h2 className="mb-4 text-xl font-black tracking-tight text-stone-900 dark:text-stone-100">Nächste Termine</h2>
      {durchfuehrungen.length === 0 ? (
        <p className="text-stone-500 dark:text-stone-400">
          Für diesen Workshop sind noch keine Durchführungen geplant.
        </p>
      ) : (
        <div className="mb-8 flex flex-col gap-6">
          {durchfuehrungen.map(
            (
              df: {
                id: string;
                ort: string | null;
                termine: {
                  id: string;
                  start_datetime: string;
                  end_datetime: string;
                }[];
              }
            ) => {
              const upcoming = df.termine.filter(
                (t) => new Date(t.start_datetime) >= new Date()
              );

              return (
                <div
                  key={df.id}
                  className="rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900"
                >
                  {df.termine.length === 0 ? (
                    <p className="text-sm text-stone-400">Keine Termine</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {upcoming.map((t) => (
                        <div key={t.id} className="flex flex-col gap-1">
                          <div className="flex items-center gap-3 rounded-md bg-white px-3 py-2 text-base dark:bg-stone-950">
                            <Calendar className="h-4 w-4 shrink-0 text-[#c8553d]" />
                            <span className="font-bold">
                              {formatDate(t.start_datetime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 rounded-md bg-white px-3 py-2 text-base dark:bg-stone-950">
                            <Clock8 className="h-4 w-4 shrink-0 text-[#c8553d]" />
                            <span className="text-stone-600 dark:text-stone-400">
                              {formatTime(t.start_datetime)} – {formatTime(t.end_datetime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 rounded-md bg-white px-3 py-2 text-base dark:bg-stone-950">
                            <MapPin className="h-4 w-4 shrink-0 text-[#c8553d]" />
                            <span className="text-stone-600 dark:text-stone-400">
                              {df.ort || '\u00A0'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 rounded-md bg-white px-3 py-2 text-base dark:bg-stone-950">
                            <User className="h-4 w-4 shrink-0 text-[#c8553d]" />
                            <span className="text-stone-600 dark:text-stone-400">
                              &nbsp;
                            </span>
                          </div>
                          <div className="flex items-center gap-3 rounded-md bg-white px-3 py-2 text-base dark:bg-stone-950">
                            <CreditCard className="h-4 w-4 shrink-0 text-[#c8553d]" />
                            <span className="text-stone-600 dark:text-stone-400">
                              &nbsp;
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3">
                    <Link
                      href={`/workshops/${id}/anmelden/${df.id}`}
                      className="inline-flex w-full items-center justify-center rounded-md bg-[#3E5A6B] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#334d5b] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
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

      <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900">
        <p className="mb-3 text-base text-stone-700 dark:text-stone-300">
          Dieser Workshop ist auch als Inhouse-Veranstaltung durchführbar.
        </p>
        <Link
          href={`/workshops/${id}/anmelden/${durchfuehrungen[0]?.id ?? ''}`}
          className="inline-flex w-full items-center justify-center rounded-md bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          Anfrage
        </Link>
      </div>

      <h2 className="mt-8 text-xl font-black tracking-tight text-stone-900 dark:text-stone-100">Teilnehmer:innen-Stimmen</h2>
        </div>
      </div>
    </div>
  );
}
