import React, { useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';

// defining the initial grid items based on your diagram flow
const INITIAL_ITEMS = [
  { id: 'big-top-left', title: 'main focus', size: 'col-span-2 row-span-2' },
  { id: 'tall-right', title: 'sidebar', size: 'col-span-1 row-span-2' },
  { id: 'wide-bottom', title: 'stats', size: 'col-span-2 row-span-1' },
  { id: 'small-bottom-right', title: 'extra', size: 'col-span-1 row-span-1' },
];

const BentoGrid = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);

  return (
    <Reorder.Group 
      axis="y" 
      values={items} 
      onReorder={setItems}
      className="grid grid-cols-3 gap-4 p-6 max-w-5xl mx-auto auto-rows-[150px]"
    >
      {items.map((item) => (
        <BentoItem key={item.id} item={item} />
      ))}
    </Reorder.Group>
  );
};

const BentoItem = ({ item, key }: { item: typeof INITIAL_ITEMS[0]; key?: string | number }) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragControls={controls}
      dragListener={false}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileDrag={{ 
        scale: 1.05, 
        boxShadow: "0px 10px 25px rgba(0,0,0,0.1)",
        zIndex: 50 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`
        ${item.size} 
        bg-[var(--card-bg)] 
        border border-[var(--primary)]/10 
        rounded-3xl p-6 
        flex flex-col justify-between 
        cursor-grab active:cursor-grabbing 
        overflow-hidden group
      `}
      onPointerDown={(e) => controls.start(e)}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-[var(--text)] font-bold text-lg lowercase">{item.title}</h3>
        <div className="opacity-0 group-hover:opacity-40 transition-opacity">
          :::
        </div>
      </div>
      
      {/* decorative element to make it feel 'fun' */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[var(--primary)] opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-all" />
    </Reorder.Item>
  );
};

export default BentoGrid;