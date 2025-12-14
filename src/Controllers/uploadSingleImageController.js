import uploadImageClodinary from "../Utils/uploadImageClodinary.js"

const uploadSingleImageController = async (request,response)=>{
    try {
        const file = request.file

        if (!file){
            return response.status(400).json({
                message : "No file uploaded",
                success : false,
                error : true,
            });
        }
        const uploadImage = await uploadImageClodinary(file)

        return response.json({
            message : "Image Uploaded",
            data : uploadImage,
            success : true,
            error : false
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
export default uploadSingleImageController