import Header from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black" data-theme="dark">
      <Header />
      
      {/* Servicios Section */}
      <section className="mt-5 mb-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Servicios Disponibles
            </h2>
          </div>

          <div className=" flex flex-col lg:flex-row items-center justify-center w-full">
            
            {/* YouTube Card */}
            <Link href="/gestion/youtube">
              <div className="bg-black mb-12 border border-gray-800 rounded-lg p-4 w-80 hover:border-gray-700 transition-all duration-200 cursor-pointer shadow-2xl shadow-red-500 mx-10">
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-white mt-3 mb-3">YouTube Premium</h3>
                  <p className="text-sm text-gray-400">Streaming sin anuncios</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">$8464/mes</span>
                  <span className="text-white font-medium">~$2825/mes</span>
                </div>
              </div>
            </Link>

            {/* Crunchyroll Card */}
            <Link href="/gestion/crunchyroll">
              <div className="bg-black border mb-12 border-gray-800 rounded-lg p-4 w-80 hover:border-gray-700 transition-all duration-200 cursor-pointer shadow-2xl shadow-orange-500 mx-10">
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-white mb-2">Crunchyroll</h3>
                  <p className="text-sm text-gray-400">Plataforma de anime</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">$5322/mes</span>
                  <span className="text-white font-medium">~$1330/mes</span>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
}
