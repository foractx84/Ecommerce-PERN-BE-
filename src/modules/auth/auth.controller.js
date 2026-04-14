import { registerSchema } from './auth.validation.js';
import { registerUser } from './auth.service.js';
import ApiError from '../../utils/ApiError.js';

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];

      throw new ApiError(400, firstIssue.message);
    }

    const user = await registerUser(parsed.data);

    res.status(201).json({
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}