import jwt from 'jsonwebtoken';

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY_ACCESS_TOKEN, {
    expiresIn: '3h',
  });
};

export default generateAccessToken;
