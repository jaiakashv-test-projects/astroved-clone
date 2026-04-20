import ContentManager from "@/components/admin/ContentManager";

export default function AdminSpecialPujasPage() {
  const fields = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "subtitle", label: "Subtitle", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "imageUrl", label: "Image URL", type: "url" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "price", label: "Price", type: "number" },
  ];

  return <ContentManager type="special-pujas" title="Special Pujas" fields={fields as any} />;
}
