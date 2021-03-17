const edit = require('./edit');
const router = require('express').Router();
const readFile = require('../../models/multer')
const { authUser } = require('../../models/auth')
// const validate= require('../../models/validator');

router.get('/', authUser, edit.getComponents)

router.post('/', readFile, edit.uploadComponents)

router.put('/component', authUser, edit.updateSingleComponent)

router.put('/types', authUser, edit.updateTypes)

router.delete('/types', authUser, edit.deleteType)

router.put('/models', authUser, edit.updateModels)

router.delete('/models', authUser, edit.deleteModel)

module.exports = router;