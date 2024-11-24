//frontend/components/layouts/DynamicHeightWrapper.js
"use client";

import React, { useEffect, useState } from "react";

const DynamicHeightWrapper = ({ children }) => {
    const [mainContentHeight, setMainContentHeight] = useState(0);

    useEffect(() => {
        const calculateHeight = () => {
            const headerHeight = document.querySelector("header")?.offsetHeight || 0;
            const viewportHeight = window.innerHeight;
            setMainContentHeight(viewportHeight - headerHeight); // Adjust with padding/margin if needed
        };

        calculateHeight(); // Initial calculation
        window.addEventListener("resize", calculateHeight); // Recalculate on window resize
        return () => window.removeEventListener("resize", calculateHeight);
    }, []);

    return (
        <div
            className="flex-1 overflow-y-auto overflow-x-auto border border-gray-200"
            style={{ height: `${mainContentHeight}px` }}
        >
            {children}
        </div>
    );
};

export default DynamicHeightWrapper;
