import type { NextApiRequest, NextApiResponse } from "next";
import { UpdateNoteRequestDto } from "@/libs/app/note/dto";
import { NoteAppController } from "@/libs/app/note/controllers/note.controller";
import { validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";
import { SessionService } from "@/libs/utils/sessions/services/session.service";
import { CustomRequest } from "@/libs/utils/sessions/interfaces";
import { Types } from "mongoose";
import { handleError, handleValidationOrServerError } from "@/libs/utils";

const noteAppController = NoteAppController.getInstance();
const sessionService = SessionService.getInstance();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await sessionService.protected(req);

    if (req.method === "GET") {
      return getOneNote(req, res, session.newAccessToken);
    }

    if (req.method === "PATCH") {
      return updateNote(req, res, session.newAccessToken);
    }

    if (req.method === "DELETE") {
      return deleteNote(req, res, session.newAccessToken);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return handleError(res, error as Error);
  }
}

async function getOneNote(
  req: NextApiRequest,
  res: NextApiResponse,
  accessToken?: string
) {
  try {
    const noteId = new Types.ObjectId(req.query.id as string);
    const userId = (req as CustomRequest).user._id as Types.ObjectId;

    const note = await noteAppController.getOne(userId, noteId);

    if (accessToken) {
      return res
        .status(200)
        .json({ status: "success", data: note, accessToken });
    }
    return res.status(200).json({ status: "success", data: note });
  } catch (error) {
    return handleError(res, error as Error);
  }
}

async function updateNote(
  req: NextApiRequest,
  res: NextApiResponse,
  accessToken?: string
) {
  try {
    const noteId = new Types.ObjectId(req.query.id as string);
    const { title, description } = req.body;
    const userId = (req as CustomRequest).user._id as Types.ObjectId;

    const noteDto = plainToInstance(UpdateNoteRequestDto, {
      title,
      description,
    });
    await validateOrReject(noteDto);

    const note = await noteAppController.update(
      userId,
      noteId,
      noteDto.title,
      noteDto.description
    );

    if (accessToken) {
      return res
        .status(200)
        .json({ status: "success", data: note, accessToken });
    }
    return res.status(200).json({ status: "success", data: note });
  } catch (error) {
    return handleValidationOrServerError(res, error as Error);
  }
}

async function deleteNote(
  req: NextApiRequest,
  res: NextApiResponse,
  accessToken?: string
) {
  try {
    const noteId = new Types.ObjectId(req.query.id as string);
    const userId = (req as CustomRequest).user._id as Types.ObjectId;

    await noteAppController.delete(userId, noteId);
    if (accessToken) {
      return res.status(200).json({ status: "success", accessToken });
    }

    return res
      .status(200)
      .json({ status: "success", message: "Note deleted successfully" });
  } catch (error) {
    console.log(error);
    return handleError(res, error as Error);
  }
}
