import Header from "@/components/homePage/Header";
import Footer from "@/components/homePage/Footer";
const InstallApp = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Title Section */}
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Hopping Deals Photos
              </h1>
              <p className="text-lg sm:text-xl text-gray-600">
                Gallery of Hopping Deals app guides and resources
              </p>
            </div>

            {/* Photos Grid - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Box 1 - Current Image */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src="/46283196-7c44-4b52-a0c6-be62db26f67f.png"
                    alt="Hopping Deals App Installation Guide"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-gray-700 text-sm leading-relaxed font-medium">
                    To get the Hopping Deals icon on phone. Simply open the website,
                    tap the share button (box with upward arrow), scroll down,
                    and select &quot;Add to Home Screen&quot;.
                  </p>
                </div>
              </div>

              {/* Box 2 - Empty for user to add */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400 text-center">Image 2</p>
                </div>
                <div className="p-4">
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    Description for image 2
                  </p>
                </div>
              </div>

              {/* Box 3 - Empty for user to add */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400 text-center">Image 3</p>
                </div>
                <div className="p-4">
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    Description for image 3
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InstallApp;
