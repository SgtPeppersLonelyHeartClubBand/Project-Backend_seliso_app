const router = require('express').Router();
const verifyController = require('../../controllers/v1/verify-controller');

router.route('/check-api').get(verifyController.testAPI);
router.route('/confirm').get(verifyController.verifyLink);

module.exports = router;