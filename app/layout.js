import { Navbar } from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "../styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <Navbar />
        <div className="flex items-start">
          <Sidebar />
          <main className="flex-1 p-4 flex justify-center">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
