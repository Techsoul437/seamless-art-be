export const validate = (schema) => async (req, res, next) => {
  try {
    req.validatedBody = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    next();
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
};
