const express = require('express');
const router = express.Router();
const siteInfoController = require('../controllers/siteInfo.controller');

router.get('/', siteInfoController.getInfo);
router.post('/', siteInfoController.saveInfo);
router.put('/', siteInfoController.saveInfo);

module.exports = router;
