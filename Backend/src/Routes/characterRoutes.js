import { Router } from 'express'
import { addCharacterData, getCharacters, getCharacter, updateCharacterData, deleteCharacterData } from '../Controllers/characterController.js'
import upload from '../MiddleWare/Multer.js'
import auth from '../MiddleWare/auth.js'

const characterRouter = Router()

characterRouter.post('/add-character', auth, upload.fields([ { name : 'characterImage', maxCount : 1 }, { name : 'galleryImages', maxCount : 15 }, ]), addCharacterData);
characterRouter.get('/all-characters', getCharacters);
characterRouter.get('/character/:id', auth, getCharacter);
characterRouter.put('/character/:id', auth, updateCharacterData);
characterRouter.delete('/character/:id', auth, deleteCharacterData);

export default characterRouter