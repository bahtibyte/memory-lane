import Link from "next/link";

export default function BackToGroup({ groupId }: { groupId: string }) {
  return (
    <Link href={`/${groupId}`} className="inline-block mb-4 text-blue-500 hover:text-blue-600">
      ← Back to Group
    </Link>
  );
}