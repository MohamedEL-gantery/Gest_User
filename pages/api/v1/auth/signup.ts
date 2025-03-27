import type { NextApiRequest, NextApiResponse } from "next";
import { SignupRequestDto } from "@/libs/app/auth/dto";
import { validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";
import { AuthController } from "@/libs/app/auth/controllers/auth.controller";
import {
  handleError,
  handleValidationOrServerError,
  validationErrorResponse,
} from "@/libs/utils";

const authController = AuthController.getInstance();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method == "POST") {
      return signup(req, res);
    }
    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    return handleError(res, error as Error);
  }
}

async function signup(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password, name } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json(
          validationErrorResponse(["name, email and password are required"])
        );
    }

    const signupDto = plainToInstance(SignupRequestDto, {
      email,
      password,
      name,
    });
    await validateOrReject(signupDto);

    const response = await authController.signup(
      signupDto.name,
      signupDto.email,
      signupDto.password,
      req.body?.guestId
    );

    return res.status(201).json(response);
  } catch (error) {
    return handleValidationOrServerError(res, error as Error);
  }
}
