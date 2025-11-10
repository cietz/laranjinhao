"use client";
import Image from "next/image";
import Link from "next/link";

import Script from "next/script";

export default function BlogPage() {
  return (
    <>
      {/* UTMify Script */}
      <Script
        src="https://cdn.utmify.com.br/scripts/utms/latest.js"
        data-utmify-prevent-xcod-sck
        data-utmify-prevent-subids
        strategy="afterInteractive"
        async
        defer
      />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-gray-900 text-white py-4 shadow-md">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-2xl font-bold">Blog de Tecnologia</h1>
            <p className="text-gray-300 text-sm">
              Notícias e artigos sobre inovação
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Featured Article */}
          <article className="mb-12 pb-8 border-b border-gray-200">
            <div className="bg-gray-200 h-64 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-400 text-lg">Imagem do artigo</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              As Principais Tendências de Tecnologia em 2025
            </h2>
            <p className="text-gray-600 mb-4">
              Publicado em 10 de novembro de 2025 • Por João Silva
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              A tecnologia continua evoluindo em ritmo acelerado. Neste artigo,
              exploramos as principais tendências que estão moldando o futuro
              digital, incluindo inteligência artificial, computação em nuvem e
              muito mais.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
              Ler mais
            </button>
          </article>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Article 1 */}
            <article className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="bg-gray-200 h-48 flex items-center justify-center">
                <span className="text-gray-400">Imagem</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Como Melhorar a Segurança Digital
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Dicas essenciais para proteger seus dados online em 2025.
                </p>
                <p className="text-gray-500 text-xs">8 de novembro de 2025</p>
              </div>
            </article>

            {/* Article 2 */}
            <article className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="bg-gray-200 h-48 flex items-center justify-center">
                <span className="text-gray-400">Imagem</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  O Futuro da Inteligência Artificial
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Descubra como a IA está transformando diversos setores.
                </p>
                <p className="text-gray-500 text-xs">5 de novembro de 2025</p>
              </div>
            </article>

            {/* Article 3 */}
            <article className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="bg-gray-200 h-48 flex items-center justify-center">
                <span className="text-gray-400">Imagem</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Programação para Iniciantes
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Guia completo para quem está começando na programação.
                </p>
                <p className="text-gray-500 text-xs">1 de novembro de 2025</p>
              </div>
            </article>

            {/* Article 4 */}
            <article className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="bg-gray-200 h-48 flex items-center justify-center">
                <span className="text-gray-400">Imagem</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Cloud Computing em 2025
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  As melhores práticas para computação em nuvem.
                </p>
                <p className="text-gray-500 text-xs">28 de outubro de 2025</p>
              </div>
            </article>

            {/* Article 5 */}
            <article className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="bg-gray-200 h-48 flex items-center justify-center">
                <span className="text-gray-400">Imagem</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Marketing Digital Moderno
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Estratégias eficazes para alcançar seu público online.
                </p>
                <p className="text-gray-500 text-xs">25 de outubro de 2025</p>
              </div>
            </article>

            {/* Article 6 */}
            <article className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="bg-gray-200 h-48 flex items-center justify-center">
                <span className="text-gray-400">Imagem</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Desenvolvimento Web Responsivo
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Criando sites que funcionam em todos os dispositivos.
                </p>
                <p className="text-gray-500 text-xs">20 de outubro de 2025</p>
              </div>
            </article>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-12">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              Anterior
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              1
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              2
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              3
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              Próximo
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-16 py-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-gray-400">
              © 2025 Blog de Tecnologia. Todos os direitos reservados.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">
                Sobre
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Contato
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Termos
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
