const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // host: 'mail.privateemail.com',
  // port: 465,
  // secure: true,
  // auth: {
  //   user: process.env.EMAIL_USER,
  //   pass: process.env.EMAIL_PASS,
  // },
});

function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const sendEmail = (toEmail, order) => {
  const orderDetails = order.items.map(item => {
    return `- Tên sản phẩm: ${item.name}\n  Số lượng: ${item.quantity}\n  Kích thước: ${item.variants.size}\n  Màu sắc/Loại: ${item.variants.color}\n Giá: ${formatNumber(item.price)} VND`;
  }).join('\n');

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@nintshop.com',
    to: toEmail,
    subject: `Xác nhận đơn hàng ${order.orderId}`,
    text: `Cảm ơn bạn đã đặt hàng!\n\nChi tiết đơn hàng của bạn:\n\nMã đơn hàng: ${order.orderId}\n\nSản phẩm:\n${orderDetails}\n\nThành tiền: ${formatNumber(order.subtotal)} VNĐ\n\nGiảm giá: ${formatNumber(order.discount)} VNĐ\n\nTổng tiền: ${formatNumber(order.totalPrice)} VND`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        reject(error);
      } else {
        console.log('Email sent: ' + info.response);
        resolve(info);
      }
    });
  });
};

const sendForgotPasswordEmail  = (toEmail, token) => {
  const resetUrl = `${process.env.APP_URL_TEST}/reset-password?token=${token}`;
  const mailOptions = {
    to: toEmail,
    from: process.env.EMAIL_FROM || 'noreply@nintshop.com',
    subject: 'Link đặt lại mật khẩu',
    text: `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n
             Vui lòng nhấp vào liên kết sau hoặc dán liên kết này vào trình duyệt của bạn để hoàn tất quá trình:\n\n
             ${resetUrl}\n\n
             Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.\n`
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending forgot password email:', error);
        reject(error);
      } else {
        console.log('Forgot password email sent: ' + info.response);
        resolve(info);
      }
    });
  });
};

module.exports = {sendEmail,sendForgotPasswordEmail };
