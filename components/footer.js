import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-2xl font-['Pacifico'] text-white mb-4 block">
              FireGuard
            </Link>
            <p className="text-gray-400 mb-4">
              Advanced wildfire prediction system for Nepal, helping communities stay safe through early detection and
              risk assessment.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-facebook-fill"></i>
                </div>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-twitter-fill"></i>
                </div>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-instagram-fill"></i>
                </div>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#alerts" className="text-gray-400 hover:text-white">
                  Fire Alerts
                </Link>
              </li>
              <li>
                <Link href="/#compare" className="text-gray-400 hover:text-white">
                  Compare Maps
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  API Access
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Research Papers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Data Sources
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                  <i className="ri-map-pin-line"></i>
                </div>
                <span className="text-gray-400">Kathmandu, Nepal</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                  <i className="ri-mail-line"></i>
                </div>
                <span className="text-gray-400">info@livefire.np</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                  <i className="ri-phone-line"></i>
                </div>
                <span className="text-gray-400">+977 1 4123456</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Subscribe to Updates</h4>
              <div className="flex flex-col">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-700 border-none text-white px-4 py-2 rounded-l focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="bg-primary text-white px-4 py-2 rounded-r-button whitespace-nowrap hover:bg-blue-600 transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 LiveFire. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

