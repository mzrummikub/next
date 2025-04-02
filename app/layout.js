import { Navbar } from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "../styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <Navbar />
        <div className="flex justify-start">
          <div className="hidden sm:block">
            <Sidebar />
          </div>
          <main className="">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
