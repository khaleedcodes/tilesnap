import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import TileSnapLogo from '@/components/tilesnap-logo';

export default function Landing() {
  const [, setLocation] = useLocation();
  const [viaParam, setViaParam] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const via = urlParams.get('via');
    setViaParam(via);
  }, []);

  const getGreeting = () => {
    if (!viaParam) {
      return {
        title: "Welcome to TileSnap!",
        subtitle: "Create Amazing Twitter Photo Tiles",
        cta: "Start Crafting Your Tiles"
      };
    }

    // Handle specific via parameters
    switch (viaParam.toLowerCase()) {
      case 'beg3':
        return {
          title: "Get Creative with Beg 3!",
          subtitle: "Turn Your Images into Stunning Twitter Tiles",
          cta: "Start Crafting Your Tile"
        };
      case 'twitter':
        return {
          title: "From Twitter to TileSnap!",
          subtitle: "Create Engaging Photo Tiles That Stand Out",
          cta: "Begin Your Story"
        };
      case 'social':
        return {
          title: "Social Media Magic Awaits!",
          subtitle: "Transform Your Content with TileSnap",
          cta: "Create Your First Tile"
        };
      default:
        return {
          title: `Welcome from ${viaParam}!`,
          subtitle: "Ready to Create Something Amazing?",
          cta: "Start Your Journey"
        };
    }
  };

  const greeting = getGreeting();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <TileSnapLogo size={60} className="justify-center sm:justify-start" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6 bounce-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold cartoon-text">
              <span className="inline-block wiggle">{greeting.title}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 cartoon-text max-w-2xl mx-auto">
              {greeting.subtitle}
            </p>
          </div>

          {/* Main CTA */}
          <div className="space-y-4">
            <button
              onClick={() => setLocation('/app')}
              className="cartoon-button-primary text-xl sm:text-2xl px-8 py-4 pulse-glow"
            >
              {greeting.cta}
            </button>
            <p className="text-sm text-gray-600">
              No signup required • Free to use • Export ready files
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="cartoon-card-hover">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto gradient-primary rounded-full flex items-center justify-center border-3 border-black">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-lg font-bold cartoon-text">Easy Upload</h3>
                <p className="text-gray-600">
                  Simply drag and drop your 16:9 image and we'll handle the rest!
                </p>
              </div>
            </div>

            <div className="cartoon-card-hover">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto gradient-secondary rounded-full flex items-center justify-center border-3 border-black">
                  <span className="text-2xl">✂️</span>
                </div>
                <h3 className="text-lg font-bold cartoon-text">Smart Cropping</h3>
                <p className="text-gray-600">
                  Advanced cropping tools with zoom and positioning controls for perfect tiles.
                </p>
              </div>
            </div>

            <div className="cartoon-card-hover">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto gradient-success rounded-full flex items-center justify-center border-3 border-black">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-lg font-bold cartoon-text">Twitter Ready</h3>
                <p className="text-gray-600">
                  Export perfectly sized 1214×2048px images optimized for Twitter tiles.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="cartoon-card mt-16 text-left max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold cartoon-text mb-6 text-center">How TileSnap Works</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center border-2 border-black font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-gray-700">
                  <strong>Upload your main image</strong> - Choose any 16:9 image that you want to turn into an expandable tile
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center border-2 border-black font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-gray-700">
                  <strong>Add surrounding images</strong> - Upload 8 additional images to complement each quadrant of your main image
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center border-2 border-black font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-gray-700">
                  <strong>Download and share</strong> - Get 4 perfectly sized images ready for sequential Twitter posting
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="cartoon-card mt-12 bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="text-center space-y-4">
              <p className="text-lg italic text-gray-700">
                "TileSnap made creating engaging Twitter content so much easier! 
                The expandable tiles get way more engagement than regular posts."
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-black"></div>
                <div className="text-left">
                  <p className="font-bold cartoon-text">Sarah M.</p>
                  <p className="text-sm text-gray-600">Content Creator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="pt-8">
            <button
              onClick={() => setLocation('/app')}
              className="cartoon-button-secondary text-lg px-6 py-3"
            >
              Ready to Create? Let's Go!
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-600">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm">
            Made with ❤️ for creators everywhere • 
            <span className="font-semibold"> TileSnap</span> - Crafting Stories, One Tile at a Time
          </p>
        </div>
      </footer>
    </div>
  );
}