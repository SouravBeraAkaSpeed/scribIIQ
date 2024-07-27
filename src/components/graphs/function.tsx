"use client";
import React, { useEffect, useRef } from "react";
import functionPlot from "function-plot";
import { toast } from "../ui/use-toast";

interface FunctionGraphProps {
  fn: string;
  width: number;
  height: number;
  id: string;
}

const FunctionGraph: React.FC<FunctionGraphProps> = ({
  fn,
  width,
  height,
  id,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (plotRef.current) {
      try {
        functionPlot({
          target: plotRef.current,
          width: width,
          height: height,
          xAxis: { label: "x" },
          yAxis: { label: "f(x)" },
          grid: true,
          title: fn,
          xDomain: [-50, 60],
          yDomain: [-50, 60],
          data: [
            {
              fn: fn,
              color: "blue",
            },
          ],
        });
      } catch (error) {
        console.log(error, fn)
        toast({
          title: "Function is wrong , please re write the correct equation",
        });
      }
    }
  }, [width, height]);

  return (
    <div
      ref={plotRef}
      id={id}
      className="w-fit overflow-x-auto rounded-[5px] bg-white text-2xl font-bold text-black shadow-md shadow-purple-500"
    ></div>
  );
};

export default FunctionGraph;
