'use client';

import { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    X,
    FileImage,
    FileAudio,
    FileVideo,
    File
} from 'lucide-react';
import { fileService, UploadProgress } from '@/lib/api/file-service';
import { useToast } from '@/lib/context/ToastContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ImportDataDialogProps {
    onUploadSuccess?: () => void;
}

export function ImportDataDialog({ onUploadSuccess }: ImportDataDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { success, error } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
            setUploadStatus('idle');
            setErrorMessage(null);
            setProgress(0);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
            setUploadStatus('idle');
            setErrorMessage(null);
            setProgress(0);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadStatus('uploading');
        setProgress(0);

        try {
            const response = await fileService.uploadFile(
                { file: selectedFile },
                (progressData: UploadProgress) => {
                    setProgress(progressData.percentage);
                }
            );

            if (response.success) {
                setUploadStatus('success');
                success(`Successfully uploaded ${selectedFile.name}`);
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
                // Reset after a delay
                setTimeout(() => {
                    setIsOpen(false);
                    resetState();
                }, 2000);
            }
        } catch (err: unknown) {
            console.error('Upload failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
            setUploadStatus('error');
            setErrorMessage(errorMessage);
            error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const resetState = () => {
        setSelectedFile(null);
        setUploadStatus('idle');
        setErrorMessage(null);
        setProgress(0);
        setIsDragOver(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return <FileText className="h-8 w-8 text-red-400" />;
            case 'doc':
            case 'docx': return <FileText className="h-8 w-8 text-blue-400" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'webp': return <FileImage className="h-8 w-8 text-purple-400" />;
            case 'mp3':
            case 'wav': return <FileAudio className="h-8 w-8 text-yellow-400" />;
            case 'mp4':
            case 'webm': return <FileVideo className="h-8 w-8 text-orange-400" />;
            default: return <File className="h-8 w-8 text-muted-foreground" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetState();
        }}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-white hover:bg-white/10"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-black/90 border-white/10 backdrop-blur-xl text-foreground overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Import Data</DialogTitle>
                    <DialogDescription>
                        Upload documents (PDF, Doc, Audio) to enrich the knowledge base.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <AnimatePresence mode="wait">
                        {!selectedFile ? (
                            <motion.div
                                key="dropzone"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-300",
                                    isDragOver
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : "border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                                )}
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <div className={cn(
                                    "h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                                    isDragOver ? "bg-emerald-500/20" : "bg-white/5"
                                )}>
                                    <Upload className={cn(
                                        "h-8 w-8 transition-colors",
                                        isDragOver ? "text-emerald-400" : "text-muted-foreground"
                                    )} />
                                </div>
                                <p className="text-lg font-medium mb-2">Click or drag file here</p>
                                <p className="text-xs text-muted-foreground max-w-[200px]">
                                    Supports PDF, TXT, DOCX, CSV, MP3, MP4
                                </p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="file-details"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between p-5 rounded-xl border border-white/10 bg-white/5 relative overflow-hidden group gap-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                                    <div className="flex items-center gap-4 overflow-hidden relative z-10">
                                        <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
                                            {getFileIcon(selectedFile.name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-white/90 break-all line-clamp-2" title={selectedFile.name}>
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono mt-1">
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>

                                    {!isUploading && uploadStatus !== 'success' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                                            onClick={resetState}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {uploadStatus === 'uploading' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2"
                                        >
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-emerald-400 animate-pulse">Uploading...</span>
                                                <span className="text-white/70">{progress}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2 bg-white/10 [&>*]:!bg-emerald-500" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {uploadStatus === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center gap-3 text-emerald-400 text-sm font-semibold p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                                        >
                                            <CheckCircle className="h-5 w-5" />
                                            <span>Upload complete!</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {uploadStatus === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: [0, -10, 10, -5, 5, 0] }}
                                            className="flex items-center gap-3 text-red-400 text-sm font-semibold p-3 bg-red-500/10 rounded-xl border border-red-500/20"
                                        >
                                            <AlertCircle className="h-5 w-5" />
                                            <span className="text-red-300">{errorMessage || 'Upload failed'}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        disabled={isUploading}
                        className="hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading || uploadStatus === 'success'}
                        className={cn(
                            "bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px] transition-all",
                            isUploading && "opacity-80 cursor-wait"
                        )}
                    >
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
