"use client";

import React from "react";
import InputField from '../../../components/input'; // นำเข้า InputField

const MainPage = () => {
    return (
        <div className="mx-auto p-80">
            <h2>Google Sheets Style Input Field</h2>
            <InputField initialValue="Click to Edit" />
        </div>
    );
};

export default MainPage;
