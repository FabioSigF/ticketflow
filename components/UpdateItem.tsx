//import { Card, CardContent } from "@/components/ui/card";

interface UpdateItemProps {
  version: string;
  date: string;
  news?: string[];
  fixes?: string[] | string;
}

export function UpdateItem({
  version,
  date,
  news,
  fixes,
}: UpdateItemProps) {
  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-primary" />
        <p className="text-sm text-muted-foreground">
          {date} • <span className="font-medium text-foreground">{version}</span>
        </p>
      </div>

      {/* Card */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {news && news.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Novidades</h3>
              <ul className="list-disc pl-6 space-y-1">
                {news.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {fixes && (
            <div>
              <h3 className="font-medium mb-2">Correções</h3>

              {Array.isArray(fixes) ? (
                <ul className="list-disc pl-6 space-y-1">
                  {fixes.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">{fixes}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
