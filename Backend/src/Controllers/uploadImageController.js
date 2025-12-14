import uploadImageClodinary from "../Utils/uploadImageClodinary.js";

const uploadImageController = async (request, response) => {
    try {
        const files = request.files;

        if (!files || files.length === 0) {
            return response.status(400).json({
                message: "No files uploaded",
                success: false,
                error: true,
            });
        }

        const uploads = await Promise.all(
            files.map(async (file) => {
                try {
                    const result = await uploadImageClodinary(file);
                    return { success: true, data: result };
                } catch (err) {
                    console.error(`Upload failed for file ${file.originalname}:`, err.message);
                    return {
                        success: false,
                        error: true,
                        message: err.message,
                        file: file.originalname,
                        data: null, // fixed
                    };
                }
            })
        );

        return response.status(200).json({
            message: "Upload completed with results",
            data: uploads,
            success: true,
            error: uploads.some((u) => u.error === true),
        });
    } catch (error) {
        console.error("Unhandled upload error:", error.message);
        return response.status(500).json({
            message: error.message || "Something went wrong",
            success: false,
            error: true,
        });
    }
};


export default uploadImageController;