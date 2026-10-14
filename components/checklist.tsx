import { brief } from "@/content/brief";

export function Checklist() {
  return (
    <ol className="space-y-4">
      {brief.checklist.map((item, index) => (
        <li key={item.title} className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine text-xs font-medium text-white">
            {index + 1}
          </span>
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{item.body}</p>
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                {item.label}
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
