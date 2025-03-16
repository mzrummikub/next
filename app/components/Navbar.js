import Image from "next/image";
import "@/styles/globals.css";

export default function Navbar() {
  return (
    <nav>
      {/* Logo + Nazwa strony */}
      <div className="flex justify-center items-center max-h-30">
        <Image src="/logo.png" alt="Logo" width={400} height={0} className="mr-3 items-center justify-center" />
        
      </div>
      <div><hr className="w-full border-t border-white mt-4" /></div>
    </nav>
  );
}
