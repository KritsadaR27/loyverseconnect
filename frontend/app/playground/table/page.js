"use client"
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion } from "framer-motion"; // import framer-motion

const initialData = [
    { id: "1", name: "John Doe", age: 25, country: "USA" },
    { id: "2", name: "Jane Smith", age: 30, country: "Canada" },
    { id: "3", name: "Peter Parker", age: 28, country: "UK" },
];

const DataTable = () => {
    const [data, setData] = useState(initialData);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedData = Array.from(data);
        const [removed] = reorderedData.splice(result.source.index, 1);
        reorderedData.splice(result.destination.index, 0, removed);

        setData(reorderedData);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="table">
                {(provided) => (
                    <table
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="min-w-full border border-gray-300"
                    >
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="px-4 py-2 border">Name</th>
                                <th className="px-4 py-2 border">Age</th>
                                <th className="px-4 py-2 border">Country</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                        <motion.tr
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`bg-white hover:bg-gray-100 cursor-move transition duration-150 ${
                                                snapshot.isDragging ? "opacity-50 border-2 border-dashed border-blue-400" : ""
                                            }`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            layout // ใช้ layout เพื่อให้เกิด animation เมื่อเปลี่ยนตำแหน่ง
                                        >
                                            <td className="px-4 py-2 border">{item.name}</td>
                                            <td className="px-4 py-2 border">{item.age}</td>
                                            <td className="px-4 py-2 border">{item.country}</td>
                                        </motion.tr>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </tbody>
                    </table>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default DataTable;
