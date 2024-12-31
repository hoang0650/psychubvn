const { User } = require('../models/users');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendForgotPasswordEmail } = require('../config/emailService');
dotenv.config();


// Get User Information from access token
async function getUserInfo(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing.' });
        }

        const token = authHeader.split(' ')[1]; // Lấy token từ Bearer token

        await jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid or expired token.' });
            } else {
                res.json(decoded); // Trả về thông tin đã decode từ token
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

// Create a new user
async function createUser(req, res) {
    try {
        const { username, email, password } = req.body;

        // Hash mật khẩu trước khi lưu
        const hashedPassword = await bcrypt.hash(password, 8);

        // Tạo userId duy nhất
        function generateUniqueUserId() {
            return Date.now().toString() + Math.floor(Math.random() * 1000);
        }

        // Tạo người dùng mới trong cơ sở dữ liệu
        const newUser = await User.create({
            userId: generateUniqueUserId(),
            email,
            username,
            password: hashedPassword,
        });

        res.status(200).send(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating user.' });
    }
}

// User Login
async function login(req, res) {
    const { password, email } = req.body;

    try {
        // Kiểm tra xem email và password có được cung cấp không
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        // Tạo payload cho token
        const payloadData = {
            _id: user._id,
            userId: user.userId,
            username: user.username,
            email: user.email,
            role: user.role,
            loginHistory: user.loginHistory
        };

        // Tạo token với JWT
        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        // Lấy địa chỉ IP người dùng
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Cập nhật trạng thái online và lịch sử đăng nhập
        user.online = true;
        user.loginHistory.push({ loginDate: new Date(), ipAddress });
        await user.save();

        res.send({ message: 'Login successful', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging in.' });
    }
}

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
    
        if (!user) {
          return res.status(404).json({ message: 'Không tìm thấy người dùng với email này.' });
        }
    
        // Tạo token reset password
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ
    
        await user.save();
    
        // Gửi email
        await sendForgotPasswordEmail(email, resetToken);
    
        res.json({ message: 'Email hướng dẫn đặt lại mật khẩu đã được gửi.' });
      } catch (error) {
        console.error('Lỗi trong quá trình xử lý quên mật khẩu:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi', error: error.message });
      }
}

async function resetPassword (req,res) {
    try {
        const { token } = req.params;
        const { password } = req.body;
    
        const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
        });
    
        if (!user) {
          return res.status(400).json({ message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
        }
    
        const hashedPassword = await bcrypt.hash(password, 8);
    
        // Cập nhật mật khẩu và xóa token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
    
        await user.save();
    
        res.json({ message: 'Mật khẩu của bạn đã được thay đổi thành công.' });
      } catch (error) {
        console.error('Lỗi trong quá trình đặt lại mật khẩu:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi', error: error.message });
      }
}

// Update avatar
async function updateAvatar(req, res) {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { avatar: req.file.path },
            { new: true }
        );
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating avatar' });
    }
};


module.exports = {
    getUserInfo,
    createUser,
    login,
    forgotPassword,
    resetPassword,
    updateAvatar
};
