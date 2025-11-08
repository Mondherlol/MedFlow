// src/components/layout/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { tenant } from "../../tenant";

const tokens = {
  header: "bg-white/80 backdrop-blur border-b border-slate-200",
  brandBox:
    "h-9 w-9 rounded-xl grid place-items-center font-bold text-white bg-gradient-to-br from-sky-600 to-indigo-600",
  link:
    "px-3 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-sky-50 transition",
  linkActive:
    "px-3 py-2 rounded-lg text-slate-900 bg-sky-50 ring-1 ring-sky-100",
  cta: "rounded-xl px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 transition shadow-sm",
};

// Construit une URL vers l'accueil + ancre (#id) 
function homeHash(hash) {
  return `/#${hash.replace(/^#/, "")}`;
}

export default function Navbar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const isSuperRoute = loc.pathname.startsWith("/__superadmin");
  const [open, setOpen] = useState(false);

  const [activeHash, setActiveHash] = useState((loc.hash || "").replace("#", ""));

  const items = [
    { label: "Fonctionnalités", hash: "features" },
    { label: "Démonstrations", hash: "demos" },
    { label: "Les avis", hash: "avis" },
    { label: "Tarifs", hash: "tarifs" },
  ];

  const go = (hash) => {
    setOpen(false);
    // Si on n'est pas sur la home, on y va avec l'ancre
    if (loc.pathname !== "/") {
      navigate(homeHash(hash));
    } else {
      // On est déjà sur la home on scroll vers l'ancre
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, "", `#${hash}`); 
      }
    }
  };

  // Pour scroller vers l'élément correspondant au hash dans l'URL
  useEffect(() => {
    if (loc.pathname === "/" && loc.hash) {
      const hash = loc.hash.replace("#", "");
      // Time out pour attendre que le DOM soit rendu
      const t = setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setActiveHash(hash);
      }, 50);
      return () => clearTimeout(t);
    } else if (loc.pathname !== "/") {
      // lorsqu'on quitte le home, on reset l'état actif
      setActiveHash("");
    }
  }, [loc.pathname, loc.hash]);

  // Observer les sections sur la landing pour mettre à jour la section active au scroll
  useEffect(() => {
    if (loc.pathname !== "/") return;

    const ids = items.map((it) => it.hash);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // choisir l'élément avec le ratio d'intersection le plus élevé
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          setActiveHash(visible[0].target.id);
        } else {
          // fallback : choisir l'élément le plus proche du haut
          let closest = elements
            .map((el) => ({ el, top: Math.abs(el.getBoundingClientRect().top) }))
            .sort((a, b) => a.top - b.top)[0];
          if (closest) setActiveHash(closest.el.id);
        }
      },
      { root: null, rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loc.pathname]);

  return (
    <header className={`sticky top-0 z-40 ${tokens.header}`}>
      <div className="container-max mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className={tokens.brandBox}>M</div>
          <span className="font-semibold text-lg text-slate-900">
            MedFlow{tenant ? ` · ${tenant}` : ""}
          </span>
        </Link>

        {/* Desktop nav */}
        {!isSuperRoute && !tenant && (
          <nav className="hidden items-center gap-1 sm:flex">
            {items.map((it) => (
              <button
                key={it.hash}
                onClick={() => go(it.hash)}
                className={
                  activeHash === it.hash ? tokens.linkActive : tokens.link
                }
              >
                {it.label}
              </button>
            ))}
            <Link to="/StartClinic" className={`${tokens.cta} ml-2`}>
              Démarrer
            </Link>
          </nav>
        )}

        {/* Burger mobile */}
        {!isSuperRoute && !tenant && (
          <button
            className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-sky-50"
            onClick={() => setOpen((v) => !v)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Mobile sheet */}
      {!isSuperRoute && !tenant && (
        <div
          className={`sm:hidden transition-[max-height] duration-300 overflow-hidden ${
            open ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="mx-4 mb-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {items.map((it) => (
              <button
                key={it.hash}
                onClick={() => go(it.hash)}
                className={`block w-full text-left ${tokens.link}`}
              >
                {it.label}
              </button>
            ))}
            <div className="p-2">
              <Link
                to="/StartClinic"
                className="block w-full text-center rounded-xl px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 transition shadow-sm"
                onClick={() => setOpen(false)}
              >
                Démarrer
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
