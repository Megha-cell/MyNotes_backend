import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET1;
const fetchUser = (req, res, next) => {
  //Get the User from the jwt token and add it to req object
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }

  next();
};
export default fetchUser;
