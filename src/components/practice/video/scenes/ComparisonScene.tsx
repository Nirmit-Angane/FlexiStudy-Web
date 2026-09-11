"use client";
import React from "react";

interface Props {
  data: any;
}

export const ComparisonScene: React.FC<Props> = ({ data }) => {
  return (
    <div className="flex w-full h-full bg-[#1C1F27] text-white shadow-[inset_0_0_150px_rgba(0,0,0,0.5)]">
      <div className="flex-1 flex flex-col justify-center p-16 md:p-24 border-r-2 border-[#3D8B71]/40 relative overflow-hidden bg-gradient-to-br from-transparent to-[#3D8B71]/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3D8B71]/15 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <h3 className="text-4xl md:text-5xl font-black mb-6 text-[#56C99A] tracking-tight drop-shadow-md text-balance">{data.leftTitle || data.title1 || "Side A"}</h3>
        <p className="text-2xl md:text-3xl leading-relaxed opacity-95 text-balance">{data.leftBody || data.content1 || "Description"}</p>
      </div>
      <div className="flex-1 flex flex-col justify-center p-16 md:p-24 relative overflow-hidden bg-gradient-to-bl from-transparent to-[#4A7FC1]/5">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4A7FC1]/15 rounded-full blur-3xl -ml-32 -mb-32"></div>
        <h3 className="text-4xl md:text-5xl font-black mb-6 text-[#6BA5F2] tracking-tight drop-shadow-md text-balance">{data.rightTitle || data.title2 || "Side B"}</h3>
        <p className="text-2xl md:text-3xl leading-relaxed opacity-95 text-balance">{data.rightBody || data.content2 || "Description"}</p>
      </div>
    </div>
  );
};
