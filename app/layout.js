import { Navbar } from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "../styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <Navbar />
        <div className="flex justify-left">
          <div className="hidden sm:block">
            <Sidebar />
          </div>
          <main className="flex-1 max-w-4xl mx-auto p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
