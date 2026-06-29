'use client';

import Image from 'next/image';

interface InfraCardProps {
  name: string;
  location?: string | null;
  districtName: string;
  imageUrl?: string | null;
  onClick: () => void;
  isActive?: boolean;
}

export default function InfraCard({ name, location, districtName, imageUrl, onClick, isActive = true }: InfraCardProps) {
  return (
    <div 
      onClick={onClick}
      className="infra-card group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col h-full relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-3">
             <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                <i className="fas fa-image text-2xl" />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-wider">No Preview Image</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
             isActive 
               ? 'bg-green-500/10 text-green-600 border-green-500/20' 
               : 'bg-red-500/10 text-red-600 border-red-500/20'
           }`}>
             {isActive ? 'Active' : 'Inactive'}
           </span>
        </div>

        {/* View Details Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
           <span className="px-6 py-3 bg-white text-[#1e3a8a] rounded-xl text-xs font-black uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
             View Details
           </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center shadow-inner group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors duration-500">
            <i className="fas fa-building text-sm" />
          </div>
          <h3 className="text-base font-black text-[#1e293b] leading-tight line-clamp-2 group-hover:text-[#1e3a8a] transition-colors">
            {name}
          </h3>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 text-[#64748b]">
            <i className="fas fa-map-marker-alt text-[10px] text-red-400" />
            <span className="text-xs font-medium truncate">{location || 'Address not specified'}</span>
          </div>
          <div className="flex items-center gap-2 text-[#64748b]">
            <i className="fas fa-location-dot text-[10px] text-blue-400" />
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">{districtName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
