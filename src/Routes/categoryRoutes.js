import { Router } from 'express'
import { getCategories } from '../Controllers/categoriesController.js'

const categoryRouter = Router()

categoryRouter.get('/all-categories', getCategories);

export default categoryRouter