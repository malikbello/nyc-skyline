import dynamic from "next/dynamic";

const SkylineMap = dynamic(() => import("@/components/SkylineMap"), { ssr: false });

export default function Home() {
  return <SkylineMap />;
}
