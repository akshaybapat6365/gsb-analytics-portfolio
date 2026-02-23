type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

type StructuredDataScriptProps = {
  data: JsonLd;
  id?: string;
};

export function StructuredDataScript({ data, id }: StructuredDataScriptProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
