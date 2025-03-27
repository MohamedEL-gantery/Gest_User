import type { NextApiRequest, NextApiResponse } from "next";
import { UserController } from "@/libs/app/user/controllers/user.controller";
import { SessionService } from "@/libs/utils/sessions/services/session.service";
import { CustomRequest } from "@/libs/utils/sessions/interfaces";
import { handleError } from "@/libs/utils";
import { RoleEnum } from "@/libs/nosql-db/contracts/enums";

const userController = UserController.getInstance();
const sessionService = SessionService.getInstance();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await sessionService.protected(req);

    if (req.method === "GET") {
      return getAllUsers(req, res, session.newAccessToken);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return handleError(res, error as Error);
  }
}

async function getAllUsers(
  req: NextApiRequest,
  res: NextApiResponse,
  accessToken?: string
) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const role = (req as CustomRequest).role as RoleEnum;
    const users = await userController.getAll(role, page, limit);

    if (accessToken) {
      return res
        .status(200)
        .json({ status: "success", data: users, accessToken });
    }
    return res.status(200).json({ status: "success", data: users });
  } catch (error) {
    return handleError(res, error as Error);
  }
}
