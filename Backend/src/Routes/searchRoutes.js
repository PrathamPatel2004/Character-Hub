import { Router } from 'express'
import { searchQuery } from '../Controllers/searchController.js'

const searchRouter = Router()

searchRouter.get('/search-query', searchQuery)

export default searchRouter