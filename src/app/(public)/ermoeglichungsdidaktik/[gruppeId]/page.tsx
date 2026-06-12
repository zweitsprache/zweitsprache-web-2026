import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

type SpassGruppe = {
  id: number;
  titel: string;
  kuerzel: string;
};

type SpassItem = {
  id: number;
  item: string;
  sortierung: number;
};

type Props = {
  params: Promise<{ gruppeId: string }>;
};

export default async function GruppePage({ params }: Props) {
  const { gruppeId } = await params;
  const gruppeIdNum = Number(gruppeId);

  if (!Number.isInteger(gruppeIdNum)) {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [{ data: gruppe, error: gruppeError }, { data: items, error: itemsError }] = await Promise.all([
    supabase
      .from("spass_gruppen")
      .select("id, titel, kuerzel")
      .eq("id", gruppeIdNum)
      .single(),
    supabase
      .from("spass_items")
      .select("id, item, sortierung")
      .eq("gruppe_id", gruppeIdNum)
      .order("sortierung", { ascending: true }),
  ]);

  if (gruppeError || !gruppe) {
    notFound();
  }

  if (itemsError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Link href="/ermoeglichungsdidaktik" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          {"<-"} Zurueck zu den Gruppen
        </Link>
        <h1 className="mt-4 text-3xl font-bold">{(gruppe as SpassGruppe).titel}</h1>
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          Items konnten nicht geladen werden.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/ermoeglichungsdidaktik" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
        {"<-"} Zurueck zu den Gruppen
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {(gruppe as SpassGruppe).kuerzel}
        </span>
        <h1 className="text-3xl font-bold">{(gruppe as SpassGruppe).titel}</h1>
      </div>

      <p className="mt-3 text-zinc-600 dark:text-zinc-300">Klicken Sie auf eine Item-Karte, um die Tipps zu sehen.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(items as SpassItem[]).map((item) => (
          <Link
            key={item.id}
            href={`/ermoeglichungsdidaktik/${gruppeIdNum}/${item.id}`}
            className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="text-xs text-zinc-500">Item {item.id}</div>
            <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{item.item}</h2>
            <div className="mt-4 text-sm font-medium text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-zinc-100">
              Tipps anzeigen {"->"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
