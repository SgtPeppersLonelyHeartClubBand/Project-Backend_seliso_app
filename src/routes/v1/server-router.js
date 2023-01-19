const router = require('express').Router();
const serverController = require('../../controllers/v1/server-controller');
const middleware = require('../../middleware/middleware');

//-- Server Management --//
router.route('/check-api').get(serverController.testAPI);

router.post('/create-server', middleware.checkToken, serverController.register);
router.get('/get-all-server', middleware.checkToken, serverController.listAllServer);
router.delete('/delete-server', middleware.checkToken, serverController.deleteServer);
router.patch('/update-priority', middleware.checkToken, serverController.updatePriority);

module.exports = router;