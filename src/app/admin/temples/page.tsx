import ContentManager from "@/components/admin/ContentManager";

export default function AdminTemplesPage() {
  const fields = [
    { name: "name", label: "Temple Name", type: "text", required: true },
    { name: "location", label: "Location", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "imageUrl", label: "Image URL", type: "url" },
    { name: "deity", label: "Main Deity", type: "text" },
    { name: "history", label: "History/Significance", type: "textarea" },
  ];

  return <ContentManager type="temples" title="Temples" fields={fields as any} />;
}
