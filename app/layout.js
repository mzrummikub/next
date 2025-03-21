import {Navbar} from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "../styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <Navbar />
        <div className="flex justify-left items-center">
          <Sidebar />
          <main className=" p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
