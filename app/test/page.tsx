import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  const { data, error } = await supabase
    .from("test_connection")
    .select("*");

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Supabase Test</h1>

      {data?.map((item) => (
        <p key={item.id}>{item.name}</p>
      ))}
    </div>
  );
}