import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LocaleToggle } from "@/components/locale-toggle";
import { ReadingBoard } from "@/components/reading-board";
import { SPREADS, type SpreadId } from "@/lib/tarot";

const IDS = Object.keys(SPREADS) as SpreadId[];

export function generateStaticParams() {
  return IDS.map((spread) => ({ spread }));
}

export default async function ReadingPage({
  params,
}: {
  params: Promise<{ spread: string }>;
}) {
  const { spread } = await params;
  if (!IDS.includes(spread as SpreadId)) notFound();
  const spreadId = spread as SpreadId;

  return (
    <main className="flex min-h-full flex-1 flex-col pt-6">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Tarot AI
        </Link>
        <LocaleToggle />
      </header>
      <ReadingBoard spreadId={spreadId} />
    </main>
  );
}
