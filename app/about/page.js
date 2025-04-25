import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function About() {
  return (
    <main>
      <Navbar />
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">About FireGuard</h1>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              FireGuard is dedicated to protecting Nepal's natural resources and communities from the devastating impact
              of wildfires. By leveraging advanced technology and data analysis, we aim to provide accurate and timely
              wildfire predictions, enabling proactive measures to prevent and mitigate fire damage.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">The Technology</h2>
            <p className="text-gray-600 mb-6">
              Our wildfire prediction system combines satellite imagery, weather data, vegetation indices, and
              historical fire patterns to generate accurate risk assessments. Using machine learning algorithms trained
              on Nepal-specific data, FireGuard can identify high-risk areas with remarkable precision, allowing for
              targeted prevention efforts.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Team</h2>
            <p className="text-gray-600 mb-6">
              FireGuard was developed by a multidisciplinary team of Nepalese scientists, data analysts, environmental
              experts, and software engineers. We collaborate closely with government agencies, conservation
              organizations, and local communities to ensure our system meets the specific needs of Nepal's diverse
              ecosystems.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Impact</h2>
            <p className="text-gray-600">
              Since our launch, FireGuard has helped identify numerous high-risk areas before fires could start,
              enabling preventive measures that have protected thousands of hectares of forest and numerous communities.
              Our early warning system has become an essential tool for forest management and disaster prevention across
              Nepal.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

