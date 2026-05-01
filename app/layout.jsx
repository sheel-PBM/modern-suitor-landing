import "./globals.css";

export const metadata = {
  title: "Modern Suitor — Court her like she matters",
  description:
    "Real reps with a real voice. Practice the conversation you're afraid to have, until your body knows the answer before she asks the question.",
  openGraph: {
    title: "Modern Suitor",
    description: "Court her like she matters.",
    url: "https://modernsuitor.com",
    siteName: "Modern Suitor",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Modern Suitor",
    description: "Court her like she matters.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
