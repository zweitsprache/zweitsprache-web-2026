import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

type SpassGruppe = {
  id: number;
  titel: string;
};

type SpassItem = {
  id: number;
  item: string;
  gruppe_id: number;
};

type SpassTipp = {
  id: number;
  nr: number;
  kurztitel: string;
  grundlage: string;
  wirkung: string;
  umsetzung: string;
  praxisbeispiel: string | null;
  wichtig: string | null;
};

type Props = {
  params: Promise<{ gruppeId: string; itemId: string }>;
};

export default async function ItemPage({ params }: Props) {
  const { gruppeId, itemId } = await params;
  const gruppeIdNum = Number(gruppeId);
  const itemIdNum = Number(itemId);

  if (!Number.isInteger(gruppeIdNum) || !Number.isInteger(itemIdNum)) {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [{ data: gruppe }, { data: item }, { data: tipps, error: tippsError }] = await Promise.all([
    supabase.from("spass_gruppen").select("id, titel").eq("id", gruppeIdNum).single(),
    supabase
      .from("spass_items")
      .select("id, item, gruppe_id")
      .eq("id", itemIdNum)
      .eq("gruppe_id", gruppeIdNum)
      .single(),
    supabase
      .from("spass_tipps")
      .select("id, nr, kurztitel, grundlage, wirkung, umsetzung, praxisbeispiel, wichtig")
      .eq("item_id", itemIdNum)
      .order("nr", { ascending: true }),
  ]);

  if (!gruppe || !item) {
    notFound();
  }

  if (tippsError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Link href={`/ermoeglichungsdidaktik/${gruppeIdNum}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          {"<-"} Zurueck zu den Items
        </Link>
        <h1 className="mt-4 text-3xl font-bold">{(item as SpassItem).item}</h1>
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          Tipps konnten nicht geladen werden.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
        <Link href="/ermoeglichungsdidaktik" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Gruppen
        </Link>
        <span>/</span>
        <Link href={`/ermoeglichungsdidaktik/${gruppeIdNum}`} className="hover:text-zinc-900 dark:hover:text-zinc-100">
          {(gruppe as SpassGruppe).titel}
        </Link>
      </div>

      <h1 className="mt-4 text-3xl font-bold">{(item as SpassItem).item}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">Tipps zu diesem Item.</p>

      {(tipps as SpassTipp[]).length === 0 ? (
        <p className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          Fuer dieses Item sind noch keine Tipps hinterlegt.
        </p>
      ) : (
      <div className="mt-8 space-y-4">
        {(tipps as SpassTipp[]).map((tipp) => (
          <article
            key={tipp.id}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{tipp.kurztitel}</h2>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                Nr. {tipp.nr}
              </span>
            </div>

            <dl className="mt-4 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              <div>
                <dt className="font-semibold text-zinc-900 dark:text-zinc-100">Grundlage</dt>
                <dd className="mt-1">{tipp.grundlage}</dd>
              </div>
              <div>
                <dt className="font-semibold text-zinc-900 dark:text-zinc-100">Wirkung</dt>
                <dd className="mt-1">{tipp.wirkung}</dd>
              </div>
              <div>
                <dt className="font-semibold text-zinc-900 dark:text-zinc-100">Umsetzung</dt>
                <dd className="mt-1">{tipp.umsetzung}</dd>
              </div>
              {tipp.praxisbeispiel ? (
                <div>
                  <dt className="font-semibold text-zinc-900 dark:text-zinc-100">Praxisbeispiel</dt>
                  <dd className="mt-1">{tipp.praxisbeispiel}</dd>
                </div>
              ) : null}
              {tipp.wichtig ? (
                <div>
                  <dt className="font-semibold text-zinc-900 dark:text-zinc-100">Wichtig</dt>
                  <dd className="mt-1">{tipp.wichtig}</dd>
                </div>
              ) : null}
            </dl>
          </article>
        ))}
      </div>
      )}
    </div>
  );
}
