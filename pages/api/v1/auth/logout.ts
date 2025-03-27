import type { NextApiRequest, NextApiResponse } from "next";
import { handleError } from "@/libs/utils";
import { AuthController } from "@/libs/app/auth/controllers/auth.controller";
import { SessionService } from "@/libs/utils/sessions/services/session.service";
import { CustomRequest } from "@/libs/utils/sessions/interfaces";
import { Types } from "mongoose";

const authController = AuthController.getInstance();
const sessionService = SessionService.getInstance();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await sessionService.protected(req);

    if (req.method === "GET") {
      return logout(req, res);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    return handleError(res, error as Error);
  }
}

async function logout(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = (req as CustomRequest).user._id as Types.ObjectId;
    const sessionId = (req as CustomRequest).sessionId as Types.ObjectId;

    await authController.logout(
      req,
      userId,
      sessionId,
      "The session is already logged out"
    );
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return handleError(res, error as Error);
  }
}
