import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link 
        href="/" 
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
      >
        Go Home
      </Link>
    </main>
  );
} 