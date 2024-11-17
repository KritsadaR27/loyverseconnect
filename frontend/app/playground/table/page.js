"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion } from "framer-motion"; // Import framer-motion for animations
import  Sidebar from "../../../components/Sidebar";

const initialData = [
  { id: "1", name: "John Doe", age: 25, country: "USA" },
  { id: "2", name: "Jane Smith", age: 30, country: "Canada" },
  { id: "3", name: "Peter Parker", age: 28, country: "UK" },
];

const DataTable = () => {
  const [data, setData] = useState(initialData);

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return; // Ignore if dropped outside a valid droppable area

    const reorderedData = Array.from(data);
    const [removed] = reorderedData.splice(result.source.index, 1);
    reorderedData.splice(result.destination.index, 0, removed);

    setData(reorderedData); // Update the state with the reordered data
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 px-2 py-2 bg-gradient-to-r from-blue-50 via-white to-teal-50" >
        <div className="h-lvh bg-white box-shadow rounded ">
        <header  className=" border-b p-5 border-b flex">
          <h1 className="text-2xl font-bold mb-4 ">Draggable Data Table</h1>

        </header>
        

        {/* Drag and Drop Context */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="table">
            {(provided) => (
              <table
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="min-w-full border border-gray-300"
              >
                <thead>
                  <tr className="bg-gray-100">
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
                            snapshot.isDragging
                              ? "opacity-50 border-2 border-dashed border-blue-400"
                              : ""
                          }`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          layout // Enables animations on layout changes
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
      </div>
    </div></div>
  );
};

export default DataTable;
