
import Header from "@/components/landing/Header";
import Image from "next/image";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <Header />
            <div>{children}</div>

        </div>
    );
};

export default Layout;
