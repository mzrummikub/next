import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-full sm:w-64 bg-transparent p-4 h-full">
      <ul className="flex flex-col space-y-4 text-lg">
        {/* HOME */}
        <li>
          <Link href="/">
            <button className="relative w-full h-12 flex items-center justify-center transform transition-transform hover:scale-105 text-white rounded-md bg-gradient-to-tr from-[#3b82f6] to-[#094fc2] hover:from-[#094fc2] hover:to-[#3b82f6] overflow-hidden group shadow-[6px_6px_12px_rgba(0,0,0,0.8)] hover:shadow-[10px_10px_18px_rgba(0,0,0,1)]">
              <span className="relative z-10">Home</span>
              <span className="absolute z-0 left-[-70%] top-[-50%] w-[50px] h-[100px] bg-white bg-opacity-50 transform skew-x-[-15deg] transition-all duration-500 group-hover:left-[110%]"></span>
            </button>
          </Link>
        </li>

        {/* LOGOWANIE */}
        <li>
          <Link href="/login">
            <button className="relative w-full h-12 flex items-center justify-center transform transition-transform hover:scale-105 text-white rounded-md bg-gradient-to-tr from-[#3b82f6] to-[#094fc2] hover:from-[#094fc2] hover:to-[#3b82f6] overflow-hidden group shadow-[6px_6px_12px_rgba(0,0,0,0.8)] hover:shadow-[10px_10px_18px_rgba(0,0,0,1)]">
              <span className="relative z-10">Logowanie</span>
              <span className="absolute z-0 left-[-70%] top-[-50%] w-[50px] h-[70px] bg-white bg-opacity-50 transform skew-x-[-15deg] transition-all duration-500 group-hover:left-[110%]"></span>
            </button>
          </Link>
        </li>
      </ul>
    </aside>
  );
}
