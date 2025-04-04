import type { NextApiRequest, NextApiResponse } from "next";
import { handleError } from "@/libs/utils";
import { SessionService } from "@/libs/utils/sessions/services/session.service";
import { CustomRequest } from "@/libs/utils/sessions/interfaces";
import { Types } from "mongoose";

const sessionService = SessionService.getInstance();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await sessionService.protected(req);

    if (req.method === "GET") {
      return getAllUserSessions(req, res, session.newAccessToken);
    }

    if (req.method === "DELETE") {
      return deleteSession(req, res, session.newAccessToken);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return handleError(res, error as Error);
  }
}

async function getAllUserSessions(
  req: NextApiRequest,
  res: NextApiResponse,
  accessToken?: string
) {
  try {
    const userId = (req as CustomRequest).user._id as Types.ObjectId;

    const sessions = await sessionService.getAllSessions(userId);
    if (accessToken) {
      return res
        .status(200)
        .json({ status: "success", data: sessions, accessToken });
    }
    return res.status(200).json({ status: "success", data: sessions });
  } catch (error) {
    return handleError(res, error as Error);
  }
}

async function deleteSession(
  req: NextApiRequest,
  res: NextApiResponse,
  accessToken?: string
) {
  try {
    const userId = (req as CustomRequest).user._id as Types.ObjectId;
    const sessionId = new Types.ObjectId(req.query.id as string);

    const session = await sessionService.revokeSession(
      req,
      userId,
      sessionId,
      "The session is already revoked!"
    );

    if (accessToken) {
      return res
        .status(200)
        .json({ status: "success", data: session, accessToken });
    }
    return res.status(200).json({ status: "success", data: session });
  } catch (error) {
    return handleError(res, error as Error);
  }
}
