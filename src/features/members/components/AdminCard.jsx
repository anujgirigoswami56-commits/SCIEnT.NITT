import React, { useState } from 'react';
import { Mail, Linkedin, GraduationCap, Wrench } from 'lucide-react';
import scient from '../../../assets/scient.png';

const AdminCard = ({ admin, type = 'facility' }) => {
    const [imgError, setImgError] = useState(false);
    const Icon = type === 'faculty' ? GraduationCap : Wrench;
    const accentColor = admin?.cardColor || '#facc15';
    const departmentText = admin.Department || (type === 'faculty' ? 'Energy & Environment Engineering' : 'SCIEnT Facility Operations');

    return (
        <div className="w-full h-full flex flex-col">
            <div
                className="relative rounded-3xl bg-zinc-950 p-[2px] overflow-hidden transition-all duration-300 shadow-xl hover:scale-[1.01] h-full flex flex-col"
                style={{
                    boxShadow: `0 0 25px ${accentColor}25`,
                    borderColor: accentColor,
                    borderWidth: '2px',
                    borderStyle: 'solid'
                }}
            >
                {/* Background radial glow */}
                <div
                    className="absolute -top-12 -left-12 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: accentColor }}
                ></div>

                {/* Top Logo */}
                <div className="absolute top-4 right-4 z-20 w-8 h-8 opacity-80">
                    <img src={scient} alt="SCIEnT" className="w-full h-full object-contain" />
                </div>

                <div className="relative rounded-3xl bg-zinc-950/90 backdrop-blur-md overflow-hidden flex flex-col sm:flex-row items-stretch flex-1 min-h-[26rem] sm:min-h-[28rem]">
                    {/* Photo / Avatar Section */}
                    <div className="relative w-full sm:w-1/2 h-80 sm:h-auto min-h-[22rem] sm:min-h-[28rem] bg-zinc-900/50 flex items-center justify-center p-3 overflow-hidden border-b sm:border-b-0 sm:border-r border-zinc-800/60">
                        {admin.photoUrl && !imgError ? (
                            <img
                                src={admin.photoUrl}
                                alt={admin.name}
                                className="w-full h-full object-contain sm:object-contain [object-position:center_top] rounded-2xl transition-transform duration-500 hover:scale-105"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div
                                className="w-32 h-32 rounded-full flex items-center justify-center border-2 shadow-inner"
                                style={{ borderColor: accentColor, backgroundColor: `${accentColor}15` }}
                            >
                                <Icon className="w-16 h-16" style={{ color: accentColor }} />
                            </div>
                        )}
                    </div>

                    {/* Info Section - Equalized fields & spacing */}
                    <div className="w-full sm:w-1/2 p-6 sm:p-8 flex flex-col justify-between gap-4 flex-1">
                        <div className="space-y-3">
                            <span
                                className="text-xs font-semibold px-3 py-1 rounded-full border inline-block"
                                style={{
                                    backgroundColor: `${accentColor}18`,
                                    color: accentColor,
                                    borderColor: `${accentColor}40`
                                }}
                            >
                                {admin.role}
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight break-words">
                                {admin.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                                {departmentText}
                            </p>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1 break-words">
                                {admin.description || (type === 'faculty' ? 'Guiding our team to technical & innovative excellence' : 'Managing facility operations and student innovation workspace')}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 mt-auto">
                            {admin.email ? (
                                <a
                                    href={`mailto:${admin.email}`}
                                    className="flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white truncate max-w-full"
                                >
                                    <Mail className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                                    <span className="truncate">{admin.email}</span>
                                </a>
                            ) : <div></div>}

                            <div className="flex items-center gap-2">
                                {admin.linkedin && (
                                    <a
                                        href={admin.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="LinkedIn"
                                        className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 border"
                                        style={{
                                            backgroundColor: `${accentColor}15`,
                                            borderColor: `${accentColor}50`,
                                            color: accentColor
                                        }}
                                    >
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCard;