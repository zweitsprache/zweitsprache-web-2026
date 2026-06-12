import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

type SpassGruppe = {
  id: number;
  kuerzel: string;
  titel: string;
  beschreibung: string;
  sortierung: number;
};

type SpassItem = {
  id: number;
  gruppe_id: number;
};

export default async function ErmoeglichungsdidaktikPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [{ data: gruppen, error: gruppenError }, { data: items, error: itemsError }] = await Promise.all([
    supabase
      .from("spass_gruppen")
      .select("id, kuerzel, titel, beschreibung, sortierung")
      .order("sortierung", { ascending: true }),
    supabase.from("spass_items").select("id, gruppe_id"),
  ]);

  if (gruppenError || itemsError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold">Ermoeglichungsdidaktik</h1>
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          Daten konnten nicht geladen werden.
        </p>
      </div>
    );
  }

  const itemCountByGroup = (items ?? []).reduce<Record<number, number>>((acc, item) => {
    acc[item.gruppe_id] = (acc[item.gruppe_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Ermoeglichungsdidaktik</h1>
      <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-300">
        Waehlen Sie eine Gruppe aus. Auf der naechsten Seite sehen Sie die passenden Item-Karten.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(gruppen as SpassGruppe[]).map((gruppe) => (
          <Link
            key={gruppe.id}
            href={`/ermoeglichungsdidaktik/${gruppe.id}`}
            className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {gruppe.kuerzel}
              </span>
              <span className="text-xs text-zinc-500">{itemCountByGroup[gruppe.id] ?? 0} Items</span>
            </div>

            <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{gruppe.titel}</h2>
            <p className="mt-2 line-clamp-4 text-sm text-zinc-600 dark:text-zinc-300">{gruppe.beschreibung}</p>

            <div className="mt-5 text-sm font-medium text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-zinc-100">
              Items ansehen {"->"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
