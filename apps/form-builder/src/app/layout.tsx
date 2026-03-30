import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AISSA Form Builder",
  description: "Create and manage forms with a visual drag-and-drop builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <nav
          style={{
            backgroundColor: "#1a1a2e",
            color: "white",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <Link
            href="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            AISSA Form Builder
          </Link>
          <Link
            href="/"
            style={{ color: "#ccc", textDecoration: "none", fontSize: "14px" }}
          >
            Dashboard
          </Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
