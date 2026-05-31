import Link from "next/link";
import Image from "next/image";

interface Props {
  hall: {
    id: string;
    name: string;
    description: string;
    capacity: number;
    images: string[];
  };
}

export default function HallCard({ hall }: Props) {
  return (
    <Link
      href={`/halls/${hall.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-black/10 transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-black/5">
        {hall.images[0] && (
          <Image
            src={hall.images[0]}
            alt={hall.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium">{hall.name}</h3>
        <p className="mt-1 text-xs text-black/60">Capacity: {hall.capacity}</p>
        <p className="mt-2 line-clamp-2 text-sm text-black/70">{hall.description}</p>
      </div>
    </Link>
  );
}
