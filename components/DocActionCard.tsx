import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface DocActionCardProps {
  title: string;
  description: string;
  href: string;
}

export function DocActionCard({
  title,
  description,
  href,
}: DocActionCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:bg-muted/40 transition-colors cursor-pointer">
        <CardContent className="p-6 space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
