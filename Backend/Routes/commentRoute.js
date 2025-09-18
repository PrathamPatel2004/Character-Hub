import { Router } from 'express'
import { getComments, addComment, addRepliedComments, addCommentLike, deleteComment } from '../Controllers/commentsController.js'
import auth from '../MiddleWare/auth.js'

const commentRouter = Router()

commentRouter.get('/character/:characterId', getComments);
commentRouter.get('/series/:seriesId', getComments);
commentRouter.post('/add-comment', auth, addComment);
commentRouter.post('/reply-comment', auth, addRepliedComments);
commentRouter.post('/like-comment', auth, addCommentLike);
commentRouter.delete('/delete-comment', auth, deleteComment);

export default commentRouter