import React, { useState } from 'react';
import { Mail, Linkedin, Instagram, Zap, Info, X } from 'lucide-react';
import scient from '../../../assets/scient.png';
import '../styles/MembersCard.css';

const MemberCard = ({ member, index }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Fallback preset colors if cardColor is not defined
    const presetColors = ['#facc15', '#a78bfa', '#38bdf8', '#f472b6', '#34d399', '#fb923c'];
    const accentColor = member?.cardColor || presetColors[index % presetColors.length];

    const toggleDetails = (e) => {
        e.stopPropagation();
        setShowDetails(prev => !prev);
    };

    return (
        <div 
            className="card relative group cursor-pointer select-none"
            onClick={toggleDetails}
        >
            <div 
                className="relative w-full h-full rounded-3xl bg-zinc-950 p-[2px] overflow-hidden transition-all duration-300 shadow-xl hover:scale-[1.02]"
                style={{
                    boxShadow: showDetails ? `0 0 30px ${accentColor}40` : `0 0 20px ${accentColor}25`,
                    borderColor: accentColor,
                    borderWidth: '2px',
                    borderStyle: 'solid'
                }}
            >
                {/* Background Accent Radial Glow */}
                <div 
                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none z-10"
                    style={{ backgroundColor: accentColor }}
                ></div>

                {/* Top Logo */}
                <div className="absolute top-4 right-4 z-30 w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
                    <img src={scient} alt="SCIEnT" className="w-full h-full object-contain" />
                </div>

                {/* Photo / Background Layer */}
                <div className="absolute inset-0 w-full h-full overflow-hidden rounded-3xl z-0">
                    {member.photoUrl && !imgError ? (
                        <img 
                            src={member.photoUrl} 
                            alt={member.name} 
                            className={`w-full h-full object-cover object-top transition-all duration-400 ease-in-out ${
                                showDetails 
                                    ? 'scale-108 filter blur-md brightness-[0.50]' 
                                    : 'scale-100 filter blur-0 brightness-95 group-hover:scale-105'
                            }`}
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div 
                            className={`w-full h-full flex items-center justify-center bg-zinc-900/80 transition-all duration-400 ease-in-out ${
                                showDetails ? 'filter blur-md brightness-50' : ''
                            }`}
                        >
                            <div 
                                className="w-24 h-24 rounded-full flex items-center justify-center border-2 shadow-inner"
                                style={{ borderColor: accentColor, backgroundColor: `${accentColor}15` }}
                            >
                                <Zap className="w-12 h-12" style={{ color: accentColor }} />
                            </div>
                        </div>
                    )}
                    {/* Dark gradient overlay for bottom readability in default view and text contrast in blurred view */}
                    <div className={`absolute inset-0 transition-all duration-300 ${
                        showDetails ? 'bg-zinc-950/35 opacity-100' : 'bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-90'
                    }`}></div>
                </div>

                {/* Front Default Info View */}
                <div 
                    className={`absolute bottom-0 left-0 right-0 p-5 z-20 flex flex-col justify-end transition-all duration-300 ${
                        showDetails 
                            ? 'opacity-0 pointer-events-none invisible translate-y-2' 
                            : 'opacity-100 pointer-events-auto visible translate-y-0'
                    }`}
                >
                    <h3 className="text-xl font-bold text-white tracking-wide truncate mb-1">
                        {member.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span 
                            className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                            style={{ 
                                backgroundColor: `${accentColor}25`, 
                                color: accentColor,
                                borderColor: `${accentColor}60`
                            }}
                        >
                            {member.role || 'Member'}
                        </span>
                        {member.subteam && (
                            <span className="text-xs text-zinc-300 font-medium truncate">
                                • {member.subteam}
                            </span>
                        )}
                    </div>

                    <div className="flex justify-between items-center text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
                        <span className="truncate max-w-[65%]">{member.Department || member.year || 'NIT Trichy'}</span>
                        
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDetails(true);
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all hover:scale-105 shadow-sm"
                            style={{
                                backgroundColor: `${accentColor}20`,
                                borderColor: `${accentColor}50`,
                                color: accentColor
                            }}
                            aria-label="Show details"
                        >
                            <span>Details</span>
                            <Info className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Info Text Directly Over Blurred Image - NO OVERLAY BOX */}
                <div 
                    className={`absolute inset-0 p-6 z-20 flex flex-col justify-between overflow-y-auto rounded-3xl bg-transparent transition-all duration-300 text-left ${
                        showDetails 
                            ? 'opacity-100 pointer-events-auto visible translate-y-0' 
                            : 'opacity-0 pointer-events-none invisible translate-y-2'
                    }`}
                >
                    <div>
                        {/* Header with Name, Role & Close Button */}
                        <div className="flex justify-between items-start mb-3 border-b border-zinc-800/80 pb-3">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-wide">{member.name}</h3>
                                <p className="text-xs font-semibold mt-1" style={{ color: accentColor }}>
                                    {member.role} {member.subteam ? `(${member.subteam})` : ''}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDetails(false);
                                }}
                                className="p-1.5 rounded-full bg-zinc-900/80 text-zinc-300 hover:text-white border border-zinc-700 transition-transform hover:scale-110 shrink-0 ml-2"
                                aria-label="Close details"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {member.description && (
                            <p className="text-xs text-zinc-200 leading-relaxed italic mb-4 max-h-36 overflow-y-auto pr-1">
                                "{member.description}"
                            </p>
                        )}

                        <div className="space-y-1.5 text-xs text-zinc-300">
                            {member.Department && (
                                <p><span className="text-zinc-500 font-medium">Department:</span> {member.Department}</p>
                            )}
                            {member.year && (
                                <p><span className="text-zinc-500 font-medium">Year:</span> {member.year}</p>
                            )}
                        </div>
                    </div>

                    {/* Social Connect Links */}
                    <div className="pt-4 border-t border-zinc-800/80 mt-auto">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-3 text-center">
                            Connect
                        </p>
                        <div className="flex gap-3 justify-center items-center">
                            {member.email && (
                                <a 
                                    href={`mailto:${member.email}`}
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label="Email"
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border"
                                    style={{
                                        backgroundColor: `${accentColor}20`,
                                        borderColor: `${accentColor}60`,
                                        color: accentColor
                                    }}
                                >
                                    <Mail className="w-5 h-5" />
                                </a>
                            )}
                            {member.linkedin && (
                                <a 
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label="LinkedIn"
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border"
                                    style={{
                                        backgroundColor: `${accentColor}20`,
                                        borderColor: `${accentColor}60`,
                                        color: accentColor
                                    }}
                                >
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            )}
                            {member.instagram && (
                                <a 
                                    href={member.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label="Instagram"
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border"
                                    style={{
                                        backgroundColor: `${accentColor}20`,
                                        borderColor: `${accentColor}60`,
                                        color: accentColor
                                    }}
                                >
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberCard;