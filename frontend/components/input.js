//frontend/components/input.js
"use client";

import React, { useState } from "react";

const InputField = ({ initialValue }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [hasFocus, setHasFocus] = useState(false); // ควบคุมการแสดงกรอบเมื่อคลิก
    const [clearOnType, setClearOnType] = useState(false); // ควบคุมการลบเมื่อเริ่มพิมพ์ครั้งแรก

    // ฟังก์ชันสำหรับการคลิก เพื่อแสดงกรอบ (โดยยังไม่เข้าสู่โหมดแก้ไข)
    const handleClick = () => {
        setHasFocus(true); // แสดงกรอบเมื่อคลิก
        setClearOnType(true); // เตรียมให้เคลียร์เมื่อเริ่มพิมพ์
    };

    // ฟังก์ชันสำหรับเริ่มการแก้ไขจริงเมื่อกดคีย์พิมพ์ครั้งแรก
    const handleKeyDown = (e) => {
        if (clearOnType) {
            setIsEditing(true); // เข้าสู่โหมดการแก้ไขจริงเมื่อเริ่มพิมพ์
            setValue(""); // เคลียร์ค่าเมื่อเริ่มพิมพ์ครั้งแรก
            setClearOnType(false); // ปิดการเคลียร์หลังจากเริ่มพิมพ์
        } else if (e.key === "Enter") {
            disableEditing(); // ปิดโหมดแก้ไขเมื่อกด Enter
        }
    };

    // เมื่อมีการพิมพ์ จะอัปเดตค่าตามการพิมพ์
    const handleInputChange = (e) => {
        setValue(e.target.value); // อัปเดตค่าทุกครั้งที่พิมพ์
    };

    // ปิดโหมดแก้ไขและคืนค่าเดิมถ้าไม่มีการเปลี่ยนแปลง
    const disableEditing = () => {
        if (value === "") {
            setValue(initialValue); // คืนค่าเดิมถ้าไม่มีการแก้ไข
        }
        setIsEditing(false);
        setHasFocus(false); // ปิดการแสดงกรอบ
        setClearOnType(false);
    };

    return (
        <div style={{ display: "inline-block", cursor: "pointer", minWidth: "100px" }}>
            {isEditing ? (
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onBlur={disableEditing}
                    onKeyDown={handleKeyDown} // ตรวจสอบการกด Enter เมื่อแก้ไข
                    autoFocus
                    style={{ width: "100%", padding: "5px", border: "1px solid blue" }}
                />
            ) : (
                <span
                    onClick={handleClick} // การคลิกครั้งแรกแค่แสดงกรอบ
                    onKeyDown={handleKeyDown} // เริ่มการแก้ไขเมื่อพิมพ์ครั้งแรก
                    tabIndex={0} // ทำให้ <span> รองรับการกดคีย์ได้
                    style={{
                        display: "inline-block",
                        padding: "10px",
                        border: hasFocus ? "1px solid blue" : "none", // แสดงกรอบเมื่อคลิก
                        outline: "none",
                    }}
                >
                    {value}
                </span>
            )}
        </div>
    );
};

export default InputField;
