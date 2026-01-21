import React from "react";
import { nominal } from "../lib/nominal";

const CustomYAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x="-55" y="-10" width="80" height="20">
        <div className="flex gap-1 items-center text-base-content">
          <span className="text-xs">Rp.</span>
          <span className="text-xs">{nominal(payload.value)}</span>
        </div>
      </foreignObject>
    </g>
  );
};

export default CustomYAxisTick;
