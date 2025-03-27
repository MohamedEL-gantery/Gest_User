import type { NextApiRequest, NextApiResponse } from "next";
import { UserUpdateRequestDto } from "@/libs/app/user/dto";
import { UserController } from "@/libs/app/user/controllers/user.controller";
import { validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";
import { SessionService } from "@/libs/utils/sessions/services/session.service";
import { CustomRequest } from "@/libs/utils/sessions/interfaces";
import { Types } from "mongoose";
import { handleError, handleValidationOrServerError } from "@/libs/utils";

const userController = UserController.getInstance();
const sessionService = SessionService.getInstance();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await sessionService.protected(req);

    if (req.method === "GET") {
      return getMe(req, res, session.newAccessToken);
    }

    if (req.method === "PATCH") {
      return updateMe(req, res, session.newAccessToken);
    }

    if (req.method === "DELETE") {
      return deleteMe(req, res, session.newAccessToken);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return handleError(res, error as Error);
  }
}

async function getMe(
  req: NextApiRequest,
  res: NextApiResponse,
  accessToken?: string
) {
  try {
    const userId = (req as CustomRequest).user._id as Types.ObjectId;

    const user = await userController.getMe(userId);

    if (accessToken) {
      return res
        .status(200)
        .json({ status: "success", data: user, accessToken });
    }
    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    return handleError(res, error as Error);
  }
}

async function updateMe(
  req: NextApiRequest,
  res: NextApiResponse,
  accessToken?: string
) {
  try {
    const userId = (req as CustomRequest).user._id as Types.ObjectId;
    const { name, email, isActive, password } = req.body;

    const userDto = plainToInstance(UserUpdateRequestDto, {
      name,
      email,
      isActive,
      password,
    });
    await validateOrReject(userDto);

    const user = await userController.updateMe(
      userId,
      userDto.name as string,
      userDto.email as string,
      userDto.password as string,
      userDto.isActive as boolean
    );

    if (accessToken) {
      return res
        .status(200)
        .json({ status: "success", data: user, accessToken });
    }

    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    return handleValidationOrServerError(res, error as Error);
  }
}

async function deleteMe(
  req: NextApiRequest,
  res: NextApiResponse,
  accessToken?: string
) {
  try {
    const userId = (req as CustomRequest).user._id as Types.ObjectId;

    const user = await userController.deleteMe(userId);

    if (accessToken) {
      return res
        .status(200)
        .json({ status: "success", data: user, accessToken });
    }
    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    return handleError(res, error as Error);
  }
}
