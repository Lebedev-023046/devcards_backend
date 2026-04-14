import { Transform } from 'class-transformer';

export function parseStringArrayQuery(value: unknown): string[] | undefined {
  const items = (Array.isArray(value) ? value : [value])
    .flatMap((item) => (typeof item === 'string' ? item.split(',') : []))
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.length) {
    return undefined;
  }

  return [...new Set(items)];
}

export function ToStringArrayQuery(): PropertyDecorator {
  return Transform(({ value }) => parseStringArrayQuery(value));
}
