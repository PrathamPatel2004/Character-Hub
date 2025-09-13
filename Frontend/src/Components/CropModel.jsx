import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

export default function CropModal({ imageSrc, onCropDone, onCancel, cropShape = 'rect', aspectRatio = 1 }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const getCroppedImageFromPixels = (imageSrc, pixelCrop) => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = imageSrc;
            image.crossOrigin = 'anonymous';

            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = pixelCrop.width;
                canvas.height = pixelCrop.height;
                const ctx = canvas.getContext('2d');

                if (cropShape === 'round') {
                    ctx.beginPath();
                    ctx.arc(
                        pixelCrop.width / 2,
                        pixelCrop.height / 2,
                        Math.min(pixelCrop.width, pixelCrop.height) / 2,
                        0,
                        2 * Math.PI
                    );
                    ctx.closePath();
                    ctx.clip();
                }

                ctx.drawImage(
                    image,
                    pixelCrop.x,
                    pixelCrop.y,
                    pixelCrop.width,
                    pixelCrop.height,
                    0,
                    0,
                    pixelCrop.width,
                    pixelCrop.height
                );

                resolve(canvas.toDataURL('image/png'));
            };

            image.onerror = () => reject(new Error('Failed to load image'));
        });
    };

    const handleCrop = async () => {
        try {
            const croppedImage = await getCroppedImageFromPixels(imageSrc, croppedAreaPixels);
            onCropDone(croppedImage);
        } catch (err) {
            console.error(err);
            alert('Crop failed. Try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex flex-col items-center justify-center">
            <div className="relative w-[60%] h-[60%] bg-gray-600 rounded-lg overflow-hidden">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    cropShape={cropShape}
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>

            <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="my-5 w-[70%] accent-blue-500"
            />

            <div className="flex gap-4">
                <button
                    onClick={onCancel}
                    className="px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={handleCrop}
                    className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    Crop
                </button>
            </div>
        </div>
    );
}