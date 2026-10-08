import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from "../assets/logo_s.png";
import { ChevronDown, Menu, X } from "lucide-react";

const Navbar = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [initiativesOpen, setInitiativesOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);

    const closeAll = () => {
        setMenuOpen(false);
        setInitiativesOpen(false);
        setAboutOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    // Tailwind-only nav link with animated underline
    const linkClasses = (path) => {
        const active = isActive(path);
        return [
            'relative py-2 px-3 font-semibold no-underline transition-colors duration-200',
            "after:content-[''] after:block after:absolute after:bottom-0",
            'after:h-[2px] after:bg-[#f9c203] after:transition-all after:duration-300 after:ease-in-out',
            'hover:after:left-0 hover:after:w-full hover:text-[#91ff00]',
            active
                ? 'text-[#f9c203] font-bold after:left-0 after:w-full'
                : 'text-white after:left-1/2 after:w-0',
        ].join(' ');
    };

    return (
        <nav className="flex items-center justify-between min-[760px]:justify-center bg-black w-full py-2 px-4 min-[760px]:px-6 relative z-[1000]">
            {/* Logo */}
            <Link to="/" className="mr-4 min-[760px]:mr-10 shrink-0 z-[201]" onClick={closeAll}>
                <img className="h-[50px] min-[760px]:h-[65px]" src={logo} alt="SCIEnT Logo" />
            </Link>

            {/* Nav links container
                Desktop (>=760px): always visible, flex-row, static
                Mobile (<760px), closed: hidden (display:none — no ghost element)
                Mobile (<760px), open: fixed full-screen overlay */}
            <div
                className={[
                    // Desktop overrides (always visible, inline)
                    'min-[760px]:flex min-[760px]:flex-row min-[760px]:items-center min-[760px]:gap-6',
                    'min-[760px]:static min-[760px]:bg-transparent min-[760px]:h-auto min-[760px]:w-auto min-[760px]:p-0 min-[760px]:text-base min-[760px]:overflow-visible',
                    // Mobile states
                    menuOpen
                        ? 'flex fixed inset-0 z-40 flex-col items-center justify-start pt-24 gap-6 bg-gradient-to-b from-[#1b1b1b] via-[rgba(27,27,27,0.9)] to-[rgba(27,27,27,0.3)] text-xl overflow-y-auto'
                        : 'hidden',
                ].join(' ')}
            >
                <Link to="/" onClick={closeAll} className={linkClasses('/')}>
                    Home
                </Link>

                <Link to="/inventory" onClick={closeAll} className={linkClasses('/inventory')}>
                    Inventory
                </Link>

                <Link to="/openhouse" onClick={closeAll} className={linkClasses('/openhouse')}>
                    OpenHouse
                </Link>

                <Link to="/clubs" onClick={closeAll} className={linkClasses('/clubs')}>
                    Projects
                </Link>

                {/* Initiatives Dropdown */}
                <div className="relative">
                    <button
                        className="flex items-center gap-1 text-white hover:text-[#91ff00] font-semibold px-3 py-2 cursor-pointer bg-transparent border-none"
                        onClick={() => { setInitiativesOpen(v => !v); setAboutOpen(false); }}
                    >
                        Initiatives
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${initiativesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {initiativesOpen && (
                        <div className="min-[760px]:absolute min-[760px]:left-0 min-[760px]:top-full mt-1 bg-black rounded-lg shadow-lg border border-gray-700 min-w-[160px] z-50 text-center">
                            <Link to="/inventive" onClick={closeAll}
                                className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-[#f9c203] rounded-t-lg whitespace-nowrap no-underline">
                                Inventive '25
                            </Link>
                            <Link to="/contrive" onClick={closeAll}
                                className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-[#f9c203] rounded-b-lg whitespace-nowrap no-underline">
                                Contrive '25
                            </Link>
                        </div>
                    )}
                </div>

                <a
                    href="https://faculty-connect-1.onrender.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeAll}
                    className={linkClasses('/faculty-connect')}
                >
                    Faculty Connect
                </a>

                {/* About Us Dropdown */}
                <div className="relative">
                    <button
                        className="flex items-center gap-1 text-white hover:text-[#91ff00] font-semibold px-3 py-2 cursor-pointer bg-transparent border-none"
                        onClick={() => { setAboutOpen(v => !v); setInitiativesOpen(false); }}
                    >
                        About Us
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${aboutOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {aboutOpen && (
                        <div className="min-[760px]:absolute min-[760px]:left-0 min-[760px]:top-full mt-1 bg-black rounded-lg shadow-lg border border-gray-700 min-w-[140px] z-50">
                            <Link to="/timeline" onClick={closeAll}
                                className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-[#f9c203] rounded-t-lg no-underline">
                                Timeline
                            </Link>
                            <Link to="/team" onClick={closeAll}
                                className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-[#f9c203] no-underline">
                                Team
                            </Link>
                            <Link to="/gallery" onClick={closeAll}
                                className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-[#f9c203] no-underline">
                                Gallery
                            </Link>
                            <Link to="/reports" onClick={closeAll}
                                className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-[#f9c203] rounded-b-lg no-underline">
                                Reports
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile hamburger — hidden on desktop, visible on mobile */}
            <button
                className="block min-[760px]:hidden z-[201] bg-transparent border-none cursor-pointer p-1"
                onClick={() => setMenuOpen(v => !v)}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
            >
                {menuOpen
                    ? <X className="text-white w-7 h-7" />
                    : <Menu className="text-white w-7 h-7" />
                }
            </button>
        </nav>
    );
};

export default Navbar;