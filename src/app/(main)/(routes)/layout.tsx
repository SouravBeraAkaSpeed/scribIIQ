import Image from "next/image";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-full h-full items-center justify-center">

            {children}

        </div>
    );
};

export default Layout;
