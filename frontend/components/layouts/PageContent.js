import React from "react";
import DynamicHeightWrapper from "./DynamicHeightWrapper";

const PageContent = ({ headerTitle, actionBar, children }) => {
    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="p-3 bg-gradient-to-bl from-white via-purple-50 to-blue-50 backdrop-blur-l z-40">
                <h1 className="text-2xl font-bold">{headerTitle}</h1>
                {actionBar}
            </header>

            {/* Content */}
            <DynamicHeightWrapper>
                {children}
            </DynamicHeightWrapper>
        </div>
    );
};

export default PageContent;
