import { CreateNoteRequestDto } from "@/libs/app/note/dto";
import type { NextApiRequest, NextApiResponse } from "next";
import { NoteAppController } from "@/libs/app/note/controllers/note.controller";
import { validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";
import { SessionService } from "@/libs/utils/sessions/services/session.service";
import { UserController } from "@/libs/app/user/controllers/user.controller";
import { CustomRequest } from "@/libs/utils/sessions/interfaces";
import { setCookie } from "cookies-next";
import { Types } from "mongoose";
import {
  handleError,
  handleValidationOrServerError,
  parseUserAgent,
  validationErrorResponse,
} from "@/libs/utils";

const noteAppController = NoteAppController.getInstance();
const sessionService = SessionService.getInstance();
const userController = UserController.getInstance();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await sessionService.protected(req);

    if (req.method === "POST")
      return createNote(
        req,
        res,
        (req as CustomRequest).user._id as Types.ObjectId,
        session.newAccessToken
      );
    if (req.method === "GET")
      return getNotes(
        req,
        res,
        (req as CustomRequest).user._id as Types.ObjectId,
        session.newAccessToken
      );

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    if (req.method === "POST") return createNoteForGuestUser(req, res);
    return handleError(res, error as Error);
  }
}

async function createNote(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: Types.ObjectId,
  accessToken?: string
) {
  const { title, description } = req.body;
  if (!title || !description)
    return res
      .status(400)
      .json(validationErrorResponse(["Title and description are required"]));

  try {
    const noteDto = plainToInstance(CreateNoteRequestDto, {
      title,
      description,
      userId,
    });
    await validateOrReject(noteDto);
    const note = await noteAppController.create(
      noteDto.title,
      noteDto.description,
      noteDto.userId
    );
    if (accessToken) {
      return res.status(201).json({
        status: "success",
        data: note,
        accessToken,
      });
    }
    return res.status(201).json({
      status: "success",
      data: note,
    });
  } catch (error) {
    return handleValidationOrServerError(res, error as Error);
  }
}

async function getNotes(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: Types.ObjectId,
  accessToken?: string
) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const notes = await noteAppController.getAll(userId, page, limit);
    if (accessToken) {
      return res
        .status(200)
        .json({ status: "success", data: notes, accessToken });
    }
    return res.status(200).json({ status: "success", data: notes });
  } catch (error) {
    return handleError(res, error as Error);
  }
}

async function createNoteForGuestUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { title, description } = req.body;
    if (!title || !description)
      return res
        .status(400)
        .json(validationErrorResponse(["Title and description are required"]));

    const { browser, device, operatingSystem } = parseUserAgent(
      req.headers["user-agent"]
    );
    const newUser = await userController.create(
      browser,
      device,
      operatingSystem
    );

    const noteDto = plainToInstance(CreateNoteRequestDto, {
      title,
      description,
      userId: newUser.user._id,
    });
    await validateOrReject(noteDto);

    const note = await noteAppController.create(
      noteDto.title,
      noteDto.description,
      noteDto.userId
    );
    setCookie("refreshToken", newUser.session.refreshToken, {
      req,
      res,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res
      .status(201)
      .json({ status: "success", data: note, ...newUser.session });
  } catch (error) {
    return handleValidationOrServerError(res, error as Error);
  }
}
