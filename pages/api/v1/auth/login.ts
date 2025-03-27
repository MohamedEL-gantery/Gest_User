import type { NextApiRequest, NextApiResponse } from "next";
import { validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";
import { LoginRequestDto } from "@/libs/app/auth/dto";
import { AuthController } from "@/libs/app/auth/controllers/auth.controller";
import { setCookie } from "cookies-next";
import {
  handleError,
  handleValidationOrServerError,
  parseUserAgent,
  validationErrorResponse,
} from "@/libs/utils";

const authController = AuthController.getInstance();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method == "POST") {
      return login(req, res);
    }
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return handleError(res, error as Error);
  }
}

async function login(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json(validationErrorResponse(["email and password are required"]));
    }
    const loginDto = plainToInstance(LoginRequestDto, { email, password });
    await validateOrReject(loginDto);

    const { browser, device, operatingSystem } = parseUserAgent(
      req.headers["user-agent"]
    );

    const response = await authController.login(
      loginDto.email,
      loginDto.password,
      browser,
      device,
      operatingSystem
    );

    setCookie("refreshToken", response.session.refreshToken, {
      req,
      res,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res.status(200).json(response);
  } catch (error) {
    return handleValidationOrServerError(res, error as Error);
  }
}
