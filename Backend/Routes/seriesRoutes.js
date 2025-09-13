import { Router } from 'express'
import { getAllSeries, getSeries, addSeriesData } from '../Controllers/seriesController.js'
import upload from '../MiddleWare/Multer.js'
import auth from '../MiddleWare/auth.js'

const seriesRouter = Router()

seriesRouter.get('/all-series', getAllSeries);
seriesRouter.get('/series/:id', auth, getSeries);
seriesRouter.post('/add-series', auth, upload.fields([ { name : 'seriesImage', maxCount : 1 }, { name : 'galleryImages', maxCount : 15 }, ]), addSeriesData);

export default seriesRouter