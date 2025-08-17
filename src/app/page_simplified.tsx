import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-base-300" data-theme="dark">
      <Header />
      
      {/* Servicios Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Servicios Disponibles
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Gestiona los pagos de tus plataformas favoritas de manera colaborativa
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* YouTube Card */}
            <div className="card card-youtube shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group">
              <div className="card-body text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-4">📺</div>
                    <h3 className="card-title text-2xl font-bold">YouTube Premium</h3>
                  </div>
                  <p className="text-white/90 mb-6">
                    Disfruta de YouTube sin anuncios, con reproducción en segundo plano 
                    y acceso a YouTube Music. ¡Comparte el costo con tu grupo!
                  </p>
                  <div className="card-actions">
                    <button className="btn btn-outline border-white text-white hover:bg-white hover:text-red-600 group-hover:scale-105 transition-all">
                      Gestionar YouTube
                      <span className="ml-2">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Crunchyroll Card */}
            <div className="card card-crunchyroll shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group">
              <div className="card-body text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-4">🍜</div>
                    <h3 className="card-title text-2xl font-bold">Crunchyroll</h3>
                  </div>
                  <p className="text-white/90 mb-6">
                    La mejor plataforma de anime y manga. Acceso ilimitado a miles 
                    de episodios en alta calidad. ¡Comparte la experiencia otaku!
                  </p>
                  <div className="card-actions">
                    <button className="btn btn-outline border-white text-white hover:bg-white hover:text-orange-600 group-hover:scale-105 transition-all">
                      Gestionar Crunchyroll
                      <span className="ml-2">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <p className="text-lg text-base-content/70 mb-8">
              ¿Listo para comenzar a compartir gastos de manera inteligente?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/auth/register" className="btn btn-primary btn-lg">
                Crear Cuenta Gratis
              </a>
              <a href="/auth/login" className="btn btn-outline btn-lg">
                Iniciar Sesión
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
