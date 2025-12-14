import { Router } from 'express'
import auth from '../MiddleWare/auth.js'
import uploadImageController from '../Controllers/uploadImageController.js'
import uploadSingleImageController from '../Controllers/uploadSingleImageController.js'
import upload from '../MiddleWare/Multer.js'

const uploadRouter = Router()

uploadRouter.post('/uploadFiles', auth , upload.array('MultipleImages', 20), uploadImageController);
uploadRouter.post("/uploadFile", auth , upload.single("singleImage"), uploadSingleImageController)

export default uploadRouter