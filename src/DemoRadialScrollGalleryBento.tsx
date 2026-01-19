'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RadialScrollGallery } from '@/components/ui/portfolio-and-image-gallery';
import { ArrowUpRight, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PORTFOLIO_ITEMS } from '@/data/portfolio';
import { motion, AnimatePresence } from 'framer-motion';

export default function DemoRadialScrollGalleryBento() {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const selectedProject = PORTFOLIO_ITEMS.find(p => p.id === selectedId);

    return (
        <div className="bg-background min-h-[600px] text-foreground overflow-hidden w-full relative">
            <div className="h-[300px] flex flex-col items-center justify-center space-y-4 pt-8">
                <div className="space-y-1 text-center">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        Portfolio
                    </span>
                    <h1 className="text-4xl font-bold tracking-tighter">
                        Welcome to my Photography Gallery
                    </h1>
                </div>
                <div className="animate-bounce text-muted-foreground text-xs">↓ Scroll</div>
            </div>

            <RadialScrollGallery
                className="!min-h-[600px]"
                baseRadius={400}
                mobileRadius={250}
                visiblePercentage={50}
                scrollDuration={2000}
                onItemSelect={(index) => {
                    // Assuming index matches the array order, so we find the item at that index
                    const item = PORTFOLIO_ITEMS[index];
                    if (item) setSelectedId(item.id);
                }}
            >
                {(hoveredIndex) =>
                    PORTFOLIO_ITEMS.map((project, index) => {
                        const isActive = hoveredIndex === index;
                        return (
                            <motion.div
                                layoutId={`card-${project.id}`}
                                key={project.id}
                                className="group relative w-[200px] h-[280px] sm:w-[240px] sm:h-[320px] overflow-hidden rounded-xl bg-card border border-border shadow-lg cursor-pointer"
                                onClick={() => setSelectedId(project.id)}
                            >
                                <div className="absolute inset-0 overflow-hidden">
                                    <motion.img
                                        layoutId={`image-${project.id}`}
                                        src={project.url}
                                        alt={project.title}
                                        className={`h-full w-full object-cover transition-transform duration-700 ease-out ${isActive ? 'scale-110 blur-0' : 'scale-100 blur-[1px] grayscale-[30%]'
                                            }`}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-60" />
                                </div>

                                <div className="absolute inset-0 flex flex-col justify-between p-4">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-background/80 backdrop-blur">
                                            {project.orientation}
                                        </Badge>
                                        <div className={`w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all duration-500 ${isActive ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`}>
                                            <ArrowUpRight size={12} />
                                        </div>
                                    </div>

                                    <div className={`transition-transform duration-500 ${isActive ? 'translate-y-0' : 'translate-y-2'}`}>
                                        <motion.h3 layoutId={`title-${project.id}`} className="text-xl font-bold leading-tight text-foreground">{project.title}</motion.h3>
                                        <div className={`h-0.5 bg-primary mt-2 transition-all duration-500 ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                }
            </RadialScrollGallery>

            <AnimatePresence>
                {selectedId && selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={`card-${selectedId}`}
                            className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-card border border-border shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative flex-1 overflow-hidden bg-black/5 flex items-center justify-center">
                                <motion.img
                                    layoutId={`image-${selectedId}`}
                                    src={selectedProject.url}
                                    alt={selectedProject.title}
                                    className="w-full h-full object-contain max-h-[85vh]"
                                />
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 bg-card border-t border-border">
                                <motion.h3 layoutId={`title-${selectedId}`} className="text-2xl font-bold text-foreground">
                                    {selectedProject.title}
                                </motion.h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline">{selectedProject.orientation}</Badge>
                                    <Badge variant="secondary">{selectedProject.preset}</Badge>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="h-[200px] flex items-center justify-center bg-muted/30">
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground opacity-70">
                    Copyright 2025. Made with love by Me
                </h2>
            </div>
        </div>
    );
}
