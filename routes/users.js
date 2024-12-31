var express = require('express');
var router = express.Router();
const { getUserInfo, createUser, login, forgotPassword, resetPassword, updateAvatar } = require('../controllers/users');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', createUser);

router.post('/login', login);

router.get('/info', getUserInfo);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

router.put('/:id/avatar', updateAvatar);

module.exports = router;
