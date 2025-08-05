import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <div className="text-8xl mb-6">🐕</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Oops! This page got lost in the dog park
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for seems to have wandered off. 
            Don't worry, our dachshunds are great at finding things!
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-colors"
            >
              🏠 Back to Home
            </Link>
            
            <div className="text-gray-500">
              <p>Or maybe you were looking for:</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                <Link
                  href="/#checkout-section"
                  className="text-orange-600 hover:text-orange-700 font-semibold"
                >
                  🛒 Buy the Game
                </Link>
                <Link
                  href="/#faq"
                  className="text-orange-600 hover:text-orange-700 font-semibold"
                >
                  ❓ FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 