// app/page.tsx

import IoTClient from "@/components/iot/IoTClient";

export default function HomePage() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100">
      <IoTClient />
    </main>
  );
}
