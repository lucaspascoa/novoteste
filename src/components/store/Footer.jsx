
import React from 'react';
import { Phone, Clock, Instagram, Facebook } from 'lucide-react'; // Removed Mail, MapPin as they are no longer used
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Ícones para redes sociais
const socialIcons = {
  Instagram: <Instagram className="w-5 h-5" />,
  Facebook: <Facebook className="w-5 h-5" />,
  WhatsApp: <Phone className="w-5 h-5" />,
  iFood: <img src="https://logodownload.org/wp-content/uploads/2017/05/ifood-logo-0.png" alt="iFood" className="w-5 h-5 object-contain" />,
};

export default function Footer({ storeConfig }) {
  const {
    store_name = "Sua Loja",
    opening_hours,
    whatsapp_number,
    social_media = [],
    powered_by_logo,
    powered_by_whatsapp_link
  } = storeConfig;

  // The 'position' variable was related to the map, which has been removed.

  return (
    <footer className="bg-[var(--foreground)] text-[var(--background)] mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo e Nome */}
          <div className="space-y-4">
            <h3 className="text-xl uppercase tracking-widest">{store_name}</h3>
            <p className="text-white/70">Sua loja virtual completa, com os melhores produtos e atendimento.</p>
            {social_media.length > 0 && (
              <div className="flex gap-4 pt-4">
                {social_media.map((social) => (
                  <a key={social.network} href={social.url} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" title={social.network}>
                    {socialIcons[social.network] || social.network}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Loja */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-wider">Loja</h3>
            <ul className="space-y-3 text-white/70">
              <li><a href="#" className="hover:text-white">Início</a></li>
              <li><a href="#" className="hover:text-white">Produtos</a></li>
              <li><a href="#" className="hover:text-white">Sobre Nós</a></li>
            </ul>
          </div>

          {/* Ajuda */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-wider">Ajuda</h3>
            <ul className="space-y-3 text-white/70">
              <li><a href="#" className="hover:text-white">Contato</a></li>
              <li><a href="#" className="hover:text-white">Rastrear Pedido</a></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-wider">Contato</h3>
            <ul className="space-y-3 text-white/70">
              {whatsapp_number && (
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-white/50 mt-1" />
                  <a href={`https://wa.me/${whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">{whatsapp_number}</a>
                </li>
              )}
              {opening_hours && (
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-white/50 mt-1" />
                  <span>{opening_hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} {store_name}. Todos os direitos reservados.</p>
          <div className="flex justify-center items-center gap-4 mt-4">
            {powered_by_logo && powered_by_whatsapp_link ? (
              <a href={`https://wa.me/${powered_by_whatsapp_link}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="font-light">Powered by</span>
                <img src={powered_by_logo} alt="Powered by" className="h-6 object-contain"/>
              </a>
            ) : (
               <span>Powered by Base44</span>
            )}
            <span className="text-white/40">|</span>
            <Link to={createPageUrl("AdminLogin")} className="hover:text-white transition-colors">
              Acesso Restrito
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
