const router = require('express').Router();
const userController = require('../../controllers/v1/user-controller');
const middleware = require('../../middleware/middleware');

//-- User Management --//
router.route('/register').post(userController.register); 
router.route('/update-password').patch(userController.updatePassword); 
router.route('/get-user').get(userController.checkUser); 
router.route('/check-api').get(userController.testAPI); 

router.get('/get-all-users', middleware.checkToken, userController.listAllUsers);
router.get('/test-auth', middleware.checkToken, userController.testAuth);
router.get('/get-user-db', middleware.checkToken, userController.GetUserInfoDb); 
router.post('/check-user-xmpp', middleware.checkToken, userController.CheckUserOnFluux);

router.delete('/unregister', middleware.checkToken, userController.unregister);
router.delete('/delete-user-fluux', middleware.checkToken, userController.DeleteUserFluux);

module.exports = router;